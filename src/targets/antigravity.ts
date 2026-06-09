import path from "path"
import { backupFile, copySkillDir, ensureDir, pathExists, readJson, resolveCommandPath, sanitizePathName, writeJson, writeText } from "../utils/files"
import { transformContentForAntigravity } from "../converters/claude-to-antigravity"
import type { AntigravityBundle } from "../types/antigravity"
import type { TargetScope } from "./index"

/**
 * Write an Antigravity bundle.
 *
 * Project scope writes the IDE config tree under `.agent/`, EXCEPT skills which
 * use the cross-tool `.agents/skills/` (plural) open-standard location that
 * Antigravity honors with precedence:
 *   .agents/skills/<name>/SKILL.md  (agents-as-skills + pass-through skills)
 *   .agent/workflows/<name>.md      (commands -> markdown workflows)
 *   .agent/rules/<name>.md          (shared context)
 *   AGENTS.md                       (skills index at the output root)
 *
 * Global scope writes skills to the universal `~/.agents/skills/` (plural)
 * location; workflows still go to ~/.gemini/antigravity/global_workflows.
 *
 * MCP servers always deep-merge into ~/.gemini/config/mcp_config.json so user
 * entries are preserved.
 */
export async function writeAntigravityBundle(
  outputRoot: string,
  bundle: AntigravityBundle,
  scope: TargetScope = "workspace",
): Promise<void> {
  const paths = resolveAntigravityPaths(outputRoot, scope)
  await ensureDir(paths.configDir)

  // Agents-as-skills.
  for (const skill of bundle.generatedSkills) {
    await writeText(path.join(paths.skillsDir, sanitizePathName(skill.name), "SKILL.md"), skill.content + "\n")
  }

  // Pass-through skills (1:1 dir copy, transform SKILL.md content).
  for (const skill of bundle.skillDirs) {
    await copySkillDir(
      skill.sourceDir,
      path.join(paths.skillsDir, sanitizePathName(skill.name)),
      transformContentForAntigravity,
    )
  }

  // Commands -> markdown workflows.
  for (const workflow of bundle.workflows) {
    const dest = await resolveCommandPath(paths.workflowsDir, workflow.name, ".md")
    await writeText(dest, workflow.content + "\n")
  }

  // Shared context -> rules.
  for (const rule of bundle.rules) {
    await writeText(path.join(paths.rulesDir, `${sanitizePathName(rule.name)}.md`), rule.content + "\n")
  }

  // Skills index.
  await writeSkillsIndex(paths.indexPath, bundle)

  // MCP servers -> ~/.gemini/config/mcp_config.json (deep merge).
  if (bundle.mcpServers && Object.keys(bundle.mcpServers).length > 0) {
    await mergeMcpConfig(paths.mcpConfigPath, bundle.mcpServers)
  }
}

function resolveAntigravityPaths(outputRoot: string, scope: TargetScope) {
  const base = path.basename(outputRoot)

  // Global: outputRoot is ~/.gemini (or already pointing into it).
  if (scope === "global" || base === ".gemini") {
    const geminiDir = base === ".gemini" ? outputRoot : path.join(outputRoot, ".gemini")
    return {
      configDir: path.join(geminiDir, "antigravity"),
      // Skills use the universal ~/.agents/skills (plural) location, which
      // Antigravity reads with precedence as a cross-tool alias.
      skillsDir: path.join(homeAgentsDir(), "skills"),
      workflowsDir: path.join(geminiDir, "antigravity", "global_workflows"),
      rulesDir: geminiDir, // GEMINI.md-level rules live at the gemini root
      indexPath: path.join(geminiDir, "antigravity", "AGENTS.md"),
      mcpConfigPath: path.join(geminiDir, "config", "mcp_config.json"),
    }
  }

  // Project: write into .agent/ under the output root (cwd).
  const agentDir = base === ".agent" ? outputRoot : path.join(outputRoot, ".agent")
  const projectRoot = base === ".agent" ? path.dirname(outputRoot) : outputRoot
  return {
    configDir: agentDir,
    // Skills use the cross-tool `.agents/skills/` (plural) open-standard path
    // at the project root, NOT `.agent/skills/`.
    skillsDir: path.join(projectRoot, ".agents", "skills"),
    workflowsDir: path.join(agentDir, "workflows"),
    rulesDir: path.join(agentDir, "rules"),
    indexPath: path.join(projectRoot, "AGENTS.md"),
    // MCP config is global for Antigravity regardless of project scope.
    mcpConfigPath: path.join(homeGeminiDir(), "config", "mcp_config.json"),
  }
}

function homeGeminiDir(): string {
  return path.join(process.env.HOME ?? process.cwd(), ".gemini")
}

function homeAgentsDir(): string {
  return path.join(process.env.HOME ?? process.cwd(), ".agents")
}

async function writeSkillsIndex(indexPath: string, bundle: AntigravityBundle): Promise<void> {
  const skillNames = [
    ...bundle.generatedSkills.map((s) => sanitizePathName(s.name)),
    ...bundle.skillDirs.map((s) => sanitizePathName(s.name)),
  ]
  const workflowNames = bundle.workflows.map((w) => w.name)

  const lines: string[] = ["# Agent Skills Index", ""]
  if (skillNames.length > 0) {
    lines.push("## Skills", "")
    for (const name of skillNames) {
      // Skills live in the cross-tool `.agents/skills/` (plural) location.
      lines.push(`- [\`${name}\`](.agents/skills/${name}/SKILL.md)`)
    }
    lines.push("")
  }
  if (workflowNames.length > 0) {
    lines.push("## Workflows", "")
    for (const name of workflowNames) {
      lines.push(`- [\`${name}\`](.agent/workflows/${name}.md)`)
    }
    lines.push("")
  }

  await writeText(indexPath, lines.join("\n").trimEnd() + "\n")
}

async function mergeMcpConfig(
  mcpConfigPath: string,
  servers: AntigravityBundle["mcpServers"],
): Promise<void> {
  const backupPath = await backupFile(mcpConfigPath)
  if (backupPath) {
    console.log(`Backed up existing mcp_config.json to ${backupPath}`)
  }

  let existing: Record<string, unknown> = {}
  if (await pathExists(mcpConfigPath)) {
    try {
      existing = await readJson<Record<string, unknown>>(mcpConfigPath)
    } catch {
      console.warn("Warning: existing mcp_config.json could not be parsed and will be replaced.")
    }
  }

  const existingServers =
    existing.mcpServers && typeof existing.mcpServers === "object"
      ? (existing.mcpServers as Record<string, unknown>)
      : {}
  const merged = { ...existing, mcpServers: { ...existingServers, ...servers } }
  await writeJson(mcpConfigPath, merged)
}
