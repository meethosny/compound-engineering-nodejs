import path from "path"
import { copySkillDir, ensureDir, sanitizePathName, writeText } from "../utils/files"
import { transformContentForCursor } from "../converters/claude-to-cursor"
import type { AgentsBundle } from "../types/agents"
import type { TargetScope } from "./index"

/**
 * Write a universal "Agent Skills" bundle to the tool-neutral `.agents/` layer.
 *
 * Workspace scope (output root = cwd):
 *   .agents/skills/<name>/SKILL.md   (pass-through skills + agents/commands as skills)
 *   AGENTS.md                        (skills index at the project root)
 *
 * Global scope (output root = ~/.agents):
 *   ~/.agents/skills/<name>/SKILL.md
 *   (no AGENTS.md — there is no standard ~/.agents/AGENTS.md location)
 *
 * MCP is never written here — the `.agents/` layer has no shared MCP location.
 */
export async function writeAgentsBundle(
  outputRoot: string,
  bundle: AgentsBundle,
  scope: TargetScope = "workspace",
): Promise<void> {
  const paths = resolveAgentsPaths(outputRoot, scope)
  await ensureDir(paths.skillsDir)

  const knownAgentNames = bundle.generatedSkills.map((s) => s.name)

  // Agents/commands synthesized into SKILL.md files.
  for (const skill of bundle.generatedSkills) {
    validatePathSafe(skill.name, "skill")
    await writeText(
      path.join(paths.skillsDir, sanitizePathName(skill.name), "SKILL.md"),
      skill.content + "\n",
    )
  }

  // Pass-through skill directories copied verbatim (transform SKILL.md content only).
  for (const skill of bundle.skillDirs) {
    validatePathSafe(skill.name, "skill directory")
    await copySkillDir(
      skill.sourceDir,
      path.join(paths.skillsDir, sanitizePathName(skill.name)),
      (content) => transformContentForCursor(content, knownAgentNames),
    )
  }

  // AGENTS.md skills index — project scope only.
  if (paths.indexPath && bundle.agentsMd) {
    await writeText(paths.indexPath, bundle.agentsMd + "\n")
  }
}

function resolveAgentsPaths(outputRoot: string, scope: TargetScope) {
  const base = path.basename(outputRoot)
  // If already pointing at `.agents`, write directly into it.
  const agentsDir = base === ".agents" ? outputRoot : path.join(outputRoot, ".agents")
  const projectRoot = base === ".agents" ? path.dirname(outputRoot) : outputRoot

  if (scope === "global") {
    // No standard ~/.agents/AGENTS.md location, so skip the index file.
    return { skillsDir: path.join(agentsDir, "skills"), indexPath: null as string | null }
  }

  return {
    skillsDir: path.join(agentsDir, "skills"),
    indexPath: path.join(projectRoot, "AGENTS.md"),
  }
}

function validatePathSafe(name: string, label: string): void {
  if (name.includes("..") || name.includes("/") || name.includes("\\")) {
    throw new Error(`${label} name contains unsafe path characters: ${name}`)
  }
}
