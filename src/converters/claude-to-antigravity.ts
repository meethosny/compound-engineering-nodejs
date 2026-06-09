import { formatFrontmatter } from "../utils/frontmatter"
import { type ClaudeAgent, type ClaudeCommand, type ClaudeMcpServer, type ClaudePlugin, filterSkillsByPlatform } from "../types/claude"
import { normalizeName, sanitizeDescription, uniqueName } from "./claude-to-gemini"
import type {
  AntigravityBundle,
  AntigravityMcpServer,
  AntigravitySkill,
  AntigravityWorkflow,
} from "../types/antigravity"
import type { ClaudeToOpenCodeOptions } from "./claude-to-opencode"

export type ClaudeToAntigravityOptions = ClaudeToOpenCodeOptions

export function convertClaudeToAntigravity(
  plugin: ClaudePlugin,
  _options: ClaudeToAntigravityOptions,
): AntigravityBundle {
  const usedSkillNames = new Set<string>()
  const usedWorkflowNames = new Set<string>()

  const platformSkills = filterSkillsByPlatform(plugin.skills, "antigravity")
  const skillDirs = platformSkills.map((skill) => ({
    name: skill.name,
    sourceDir: skill.sourceDir,
  }))

  // Reserve skill names from pass-through skills before generating agent skills.
  for (const skill of skillDirs) {
    usedSkillNames.add(normalizeName(skill.name))
  }

  // Agents -> Skills. Antigravity subagents are runtime-dynamic with no stable
  // user-authorable file format, so (like the Gemini converter) we map every
  // Claude agent to an Antigravity skill: a SKILL.md with name + description
  // frontmatter and the agent instructions as the body.
  const generatedSkills = plugin.agents.map((agent) => convertAgentToSkill(agent, usedSkillNames))

  // Commands -> markdown workflows (NOT Gemini's TOML).
  const workflows = plugin.commands.map((command) => convertCommandToWorkflow(command, usedWorkflowNames))

  const mcpServers = convertMcpServers(plugin.mcpServers)

  if (plugin.hooks && Object.keys(plugin.hooks.hooks).length > 0) {
    console.warn("Warning: Antigravity does not support Claude Code hooks. Hooks were skipped during conversion.")
  }

  return { generatedSkills, skillDirs, workflows, rules: [], mcpServers }
}

function convertAgentToSkill(agent: ClaudeAgent, usedNames: Set<string>): AntigravitySkill {
  const name = uniqueName(normalizeName(agent.name), usedNames)
  const description = sanitizeDescription(
    agent.description ?? `Use this skill for ${agent.name} tasks`,
  )

  const frontmatter: Record<string, unknown> = { name, description }

  let body = transformContentForAntigravity(agent.body.trim())
  if (agent.capabilities && agent.capabilities.length > 0) {
    const capabilities = agent.capabilities.map((c) => `- ${c}`).join("\n")
    body = `## Capabilities\n${capabilities}\n\n${body}`.trim()
  }
  if (body.length === 0) {
    body = `Instructions converted from the ${agent.name} agent.`
  }

  const content = formatFrontmatter(frontmatter, body)
  return { name, content }
}

function convertCommandToWorkflow(command: ClaudeCommand, usedNames: Set<string>): AntigravityWorkflow {
  // Preserve namespace structure: workflows:plan -> workflows/plan
  const commandPath = resolveCommandPath(command.name)
  const pathKey = commandPath.join("/")
  uniqueName(pathKey, usedNames) // Track for dedup

  const description = command.description ?? `Converted from Claude command ${command.name}`
  const transformedBody = transformContentForAntigravity(command.body.trim())

  let steps = transformedBody
  if (command.argumentHint) {
    steps += `\n\nUser request: {{args}}`
  }

  const content = toWorkflowMarkdown(description, steps)
  return { name: pathKey, content }
}

/**
 * Transform Claude Code content to Antigravity-compatible content.
 *
 * 1. Task agent calls: Task agent-name(args) -> Use the agent-name skill to: args
 * 2. Path rewriting: .claude/ -> .agent/ (project config root). ~/.claude/ stays
 *    mapped to ~/.gemini/ since Antigravity's global config lives under ~/.gemini/.
 * 3. Agent references: @agent-name -> the agent-name skill
 */
export function transformContentForAntigravity(body: string): string {
  let result = body

  // 1. Transform Task agent calls (supports namespaced names like js-compound-engineering:research:agent-name)
  const taskPattern = /^(\s*-?\s*)Task\s+([a-z][a-z0-9:-]*)\(([^)]*)\)/gm
  result = result.replace(taskPattern, (_match, prefix: string, agentName: string, args: string) => {
    const finalSegment = agentName.includes(":") ? agentName.split(":").pop()! : agentName
    const skillName = normalizeName(finalSegment)
    const trimmedArgs = args.trim()
    return trimmedArgs
      ? `${prefix}Use the ${skillName} skill to: ${trimmedArgs}`
      : `${prefix}Use the ${skillName} skill`
  })

  // 2. Rewrite paths. Global ~/.claude/ -> ~/.gemini/ (Antigravity global root),
  //    project .claude/ -> .agent/ (Antigravity project config root).
  result = result
    .replace(/~\/\.claude\//g, "~/.gemini/")
    .replace(/\.claude\//g, ".agent/")

  // 3. Transform @agent-name references
  const agentRefPattern = /@([a-z][a-z0-9-]*-(?:agent|reviewer|researcher|analyst|specialist|oracle|sentinel|guardian|strategist))/gi
  result = result.replace(agentRefPattern, (_match, agentName: string) => {
    return `the ${normalizeName(agentName)} skill`
  })

  return result
}

function convertMcpServers(
  servers?: Record<string, ClaudeMcpServer>,
): Record<string, AntigravityMcpServer> | undefined {
  if (!servers || Object.keys(servers).length === 0) return undefined

  const result: Record<string, AntigravityMcpServer> = {}
  for (const [name, server] of Object.entries(servers)) {
    const entry: AntigravityMcpServer = {}
    if (server.command) {
      entry.command = server.command
      if (server.args && server.args.length > 0) entry.args = server.args
      if (server.env && Object.keys(server.env).length > 0) entry.env = server.env
    } else if (server.url) {
      // Antigravity uses serverUrl (NOT url/httpUrl) for remote MCP servers.
      entry.serverUrl = server.url
      if (server.headers && Object.keys(server.headers).length > 0) entry.headers = server.headers
    }
    result[name] = entry
  }
  return result
}

/**
 * Resolve command name to path segments.
 * workflows:plan -> ["workflows", "plan"]
 * plan -> ["plan"]
 */
function resolveCommandPath(name: string): string[] {
  return name.split(":").map((segment) => normalizeName(segment))
}

/**
 * Serialize a command into an Antigravity markdown workflow:
 * YAML frontmatter with `description`, then numbered markdown steps derived
 * from the command body. Each top-level line of the body becomes a step.
 */
export function toWorkflowMarkdown(description: string, steps: string): string {
  const frontmatter = formatFrontmatter({ description }, "").trimEnd()
  const numbered = numberSteps(steps)
  return `${frontmatter}\n\n## Steps\n\n${numbered}`
}

/**
 * Convert body lines into a numbered markdown list. Existing markdown list
 * markers (-, *, 1.) are normalized into ordered steps; blank lines and
 * non-list prose are preserved verbatim between steps so multi-line content
 * (code blocks, paragraphs) survives.
 */
function numberSteps(body: string): string {
  const lines = body.split("\n")
  const out: string[] = []
  let stepIndex = 0

  for (const line of lines) {
    const listMatch = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/)
    if (listMatch) {
      stepIndex += 1
      out.push(`${stepIndex}. ${listMatch[1]}`)
    } else {
      out.push(line)
    }
  }

  // No list markers found: treat the whole body as a single step.
  if (stepIndex === 0) {
    const trimmed = body.trim()
    return trimmed ? `1. ${trimmed}` : ""
  }

  return out.join("\n")
}
