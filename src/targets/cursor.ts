import path from "path"
import { backupFile, copySkillDir, ensureDir, pathExists, readJson, sanitizePathName, writeJson, writeText } from "../utils/files"
import { transformContentForCursor } from "../converters/claude-to-cursor"
import type { CursorBundle } from "../types/cursor"
import type { TargetScope } from "./index"

export async function writeCursorBundle(
  outputRoot: string,
  bundle: CursorBundle,
  _scope?: TargetScope,
): Promise<void> {
  const paths = resolveCursorPaths(outputRoot)
  await ensureDir(paths.cursorDir)

  const knownAgentNames = bundle.agents.map((a) => a.name)

  // Agents: .cursor/agents/<name>.md (md + YAML frontmatter)
  for (const agent of bundle.agents) {
    validatePathSafe(agent.name, "agent")
    await writeText(
      path.join(paths.agentsDir, `${sanitizePathName(agent.name)}.md`),
      agent.content + "\n",
    )
  }

  // Generated skills (from commands): .cursor/skills/<name>/SKILL.md
  for (const skill of bundle.generatedSkills) {
    validatePathSafe(skill.name, "skill")
    await writeText(
      path.join(paths.skillsDir, sanitizePathName(skill.name), "SKILL.md"),
      skill.content + "\n",
    )
  }

  // Pass-through skill directories: copied verbatim (transform SKILL.md content only).
  for (const skill of bundle.skillDirs) {
    validatePathSafe(skill.name, "skill directory")
    const destDir = path.join(paths.skillsDir, sanitizePathName(skill.name))
    const resolvedDest = path.resolve(destDir)
    if (!resolvedDest.startsWith(path.resolve(paths.skillsDir))) {
      console.warn(`Warning: Skill name "${skill.name}" escapes .cursor/skills/. Skipping.`)
      continue
    }
    await copySkillDir(skill.sourceDir, destDir, (content) =>
      transformContentForCursor(content, knownAgentNames),
    )
  }

  // Shared context: AGENTS.md at the output root (Cursor reads it natively).
  if (bundle.agentsMd) {
    await writeText(path.join(paths.rootDir, "AGENTS.md"), bundle.agentsMd + "\n")
  }

  // MCP servers -> .cursor/mcp.json (deep-merge, preserve user entries).
  if (Object.keys(bundle.mcpServers).length > 0) {
    const mcpPath = path.join(paths.cursorDir, "mcp.json")
    const backupPath = await backupFile(mcpPath)
    if (backupPath) {
      console.log(`Backed up existing mcp.json to ${backupPath}`)
    }

    let existingConfig: Record<string, unknown> = {}
    if (await pathExists(mcpPath)) {
      try {
        existingConfig = await readJson<Record<string, unknown>>(mcpPath)
      } catch {
        console.warn("Warning: existing mcp.json could not be parsed and will be replaced.")
      }
    }

    const existingServers =
      existingConfig.mcpServers && typeof existingConfig.mcpServers === "object"
        ? (existingConfig.mcpServers as Record<string, unknown>)
        : {}
    const merged = { ...existingConfig, mcpServers: { ...existingServers, ...bundle.mcpServers } }
    await writeJson(mcpPath, merged)
  }
}

function resolveCursorPaths(outputRoot: string) {
  const base = path.basename(outputRoot)
  // If already pointing at .cursor, write directly into it. AGENTS.md lives one level up.
  if (base === ".cursor") {
    return {
      rootDir: path.dirname(outputRoot),
      cursorDir: outputRoot,
      agentsDir: path.join(outputRoot, "agents"),
      skillsDir: path.join(outputRoot, "skills"),
    }
  }
  const cursorDir = path.join(outputRoot, ".cursor")
  return {
    rootDir: outputRoot,
    cursorDir,
    agentsDir: path.join(cursorDir, "agents"),
    skillsDir: path.join(cursorDir, "skills"),
  }
}

function validatePathSafe(name: string, label: string): void {
  if (name.includes("..") || name.includes("/") || name.includes("\\")) {
    throw new Error(`${label} name contains unsafe path characters: ${name}`)
  }
}
