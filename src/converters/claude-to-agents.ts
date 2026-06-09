import { formatFrontmatter } from "../utils/frontmatter"
import { sanitizePathName } from "../utils/files"
import {
  type ClaudeAgent,
  type ClaudeCommand,
  type ClaudePlugin,
  filterSkillsByPlatform,
} from "../types/claude"
import { normalizeName, sanitizeDescription, uniqueName } from "./claude-to-gemini"
import { transformContentForCursor } from "./claude-to-cursor"
import type { AgentsBundle, AgentsGeneratedSkill } from "../types/agents"
import type { ClaudeToOpenCodeOptions } from "./claude-to-opencode"

export type ClaudeToAgentsOptions = ClaudeToOpenCodeOptions

/**
 * Convert a Claude plugin to the universal "Agent Skills" open-standard layer.
 *
 * Everything maps to skills (`.agents/skills/<name>/SKILL.md`) — the highest-
 * fidelity, tool-neutral primitive that all six compatible tools read:
 *   - skills pass through 1:1 (source of truth for names)
 *   - agents become skills (name+description frontmatter, body as instructions)
 *   - commands become skills (same shape)
 *
 * MCP servers have no universal `.agents/` location, so they are skipped with a
 * recorded warning. Hooks are likewise unsupported here.
 */
export function convertClaudeToAgents(
  plugin: ClaudePlugin,
  _options: ClaudeToAgentsOptions,
): AgentsBundle {
  const warnings: string[] = []
  const usedSkillNames = new Set<string>()

  // Skills pass through 1:1 — they are the source of truth for names.
  const skillDirs = filterSkillsByPlatform(plugin.skills, "agents").map((skill) => ({
    name: skill.name,
    sourceDir: skill.sourceDir,
  }))
  for (const skill of skillDirs) {
    usedSkillNames.add(normalizeName(skill.name))
  }

  const knownAgentNames = plugin.agents.map((a) => normalizeName(a.name))

  // Agents -> skills and commands -> skills, deduped against pass-through skills.
  const agentSkills = plugin.agents.map((agent) =>
    convertAgentToSkill(agent, usedSkillNames, knownAgentNames),
  )
  const commandSkills = plugin.commands.map((command) =>
    convertCommandToSkill(command, usedSkillNames, knownAgentNames),
  )
  const generatedSkills = [...agentSkills, ...commandSkills]

  // MCP: no universal `.agents/` location. Skip with a warning.
  if (plugin.mcpServers && Object.keys(plugin.mcpServers).length > 0) {
    warnings.push(
      "The universal `.agents/` layer has no shared MCP location. MCP servers were skipped — configure them per-tool (e.g. .cursor/mcp.json, ~/.gemini/config/mcp_config.json).",
    )
  }

  if (plugin.hooks && Object.keys(plugin.hooks.hooks).length > 0) {
    warnings.push(
      "The universal `.agents/` layer does not support Claude Code hooks. Hooks were skipped during conversion.",
    )
  }

  const agentsMd = buildSkillsIndex(skillDirs, generatedSkills)

  for (const warning of warnings) {
    console.warn(`Warning: ${warning}`)
  }

  return { skillDirs, generatedSkills, agentsMd, warnings }
}

function convertAgentToSkill(
  agent: ClaudeAgent,
  usedNames: Set<string>,
  knownAgentNames: string[],
): AgentsGeneratedSkill {
  const name = uniqueName(normalizeName(agent.name), usedNames)
  const description = sanitizeDescription(
    agent.description ?? `Use this skill for ${agent.name} tasks`,
  )

  let body = transformContentForCursor(agent.body.trim(), knownAgentNames)
  if (agent.capabilities && agent.capabilities.length > 0) {
    const capabilities = agent.capabilities.map((c) => `- ${c}`).join("\n")
    body = `## Capabilities\n${capabilities}\n\n${body}`.trim()
  }
  if (body.length === 0) {
    body = `Instructions converted from the ${agent.name} agent.`
  }

  const content = formatFrontmatter({ name, description }, body)
  return { name, content }
}

function convertCommandToSkill(
  command: ClaudeCommand,
  usedNames: Set<string>,
  knownAgentNames: string[],
): AgentsGeneratedSkill {
  const name = uniqueName(normalizeName(command.name), usedNames)
  const description = sanitizeDescription(
    command.description ?? `Converted from Claude command ${command.name}`,
  )

  let body = transformContentForCursor(command.body.trim(), knownAgentNames)
  if (body.length === 0) {
    body = `Instructions converted from the ${command.name} command.`
  }

  const content = formatFrontmatter({ name, description }, body)
  return { name, content }
}

/**
 * Build an AGENTS.md skills index linking every skill in the bundle. Written at
 * the output root in project scope so any compatible tool can discover skills.
 */
function buildSkillsIndex(
  skillDirs: AgentsBundle["skillDirs"],
  generatedSkills: AgentsGeneratedSkill[],
): string {
  const names = [
    ...skillDirs.map((s) => sanitizePathName(s.name)),
    ...generatedSkills.map((s) => sanitizePathName(s.name)),
  ]

  const lines: string[] = ["# Agent Skills", ""]
  if (names.length > 0) {
    lines.push("## Skills", "")
    for (const name of names) {
      lines.push(`- [\`${name}\`](.agents/skills/${name}/SKILL.md)`)
    }
  } else {
    lines.push("No skills available.")
  }

  return lines.join("\n").trimEnd()
}
