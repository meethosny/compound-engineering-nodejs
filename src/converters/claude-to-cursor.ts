import { readFileSync, existsSync } from "fs"
import path from "path"
import { formatFrontmatter } from "../utils/frontmatter"
import { type ClaudeAgent, type ClaudeCommand, type ClaudeMcpServer, type ClaudePlugin, filterSkillsByPlatform } from "../types/claude"
import type {
  CursorAgent,
  CursorAgentFrontmatter,
  CursorBundle,
  CursorGeneratedSkill,
  CursorMcpServer,
} from "../types/cursor"
import type { ClaudeToOpenCodeOptions } from "./claude-to-opencode"

export type ClaudeToCursorOptions = ClaudeToOpenCodeOptions

const CURSOR_NAME_MAX_LENGTH = 64
const CURSOR_DESCRIPTION_MAX_LENGTH = 1024

// Claude tool names that are clearly mutating. If an agent's tools allowlist
// contains none of these, the agent is treated as read-only.
const MUTATING_TOOLS = new Set(["Write", "Edit", "Bash", "NotebookEdit"])

export function convertClaudeToCursor(
  plugin: ClaudePlugin,
  _options: ClaudeToCursorOptions,
): CursorBundle {
  const warnings: string[] = []
  const usedSkillNames = new Set<string>()

  // Skills pass through 1:1 — they are the highest-fidelity mapping and the source of truth for names.
  const skillDirs = filterSkillsByPlatform(plugin.skills, "cursor").map((skill) => ({
    name: skill.name,
    sourceDir: skill.sourceDir,
  }))
  for (const skill of skillDirs) {
    usedSkillNames.add(normalizeName(skill.name))
  }

  const knownAgentNames = plugin.agents.map((a) => normalizeName(a.name))

  const agents = plugin.agents.map((agent) =>
    convertAgent(agent, knownAgentNames, warnings),
  )

  // Commands route to Cursor skills (SKILL.md) for highest fidelity.
  const generatedSkills = plugin.commands.map((command) =>
    convertCommandToSkill(command, usedSkillNames, knownAgentNames),
  )

  const mcpServers = convertMcpServers(plugin.mcpServers, warnings)

  const agentsMd = buildAgentsMd(plugin, knownAgentNames)

  if (plugin.hooks && Object.keys(plugin.hooks.hooks).length > 0) {
    warnings.push(
      "Cursor does not support Claude Code hooks. Hooks were skipped during conversion.",
    )
  }

  for (const warning of warnings) {
    console.warn(`Warning: ${warning}`)
  }

  return { agents, skillDirs, generatedSkills, mcpServers, agentsMd, warnings }
}

function convertAgent(
  agent: ClaudeAgent,
  knownAgentNames: string[],
  warnings: string[],
): CursorAgent {
  const name = normalizeName(agent.name)
  const description = sanitizeDescription(
    agent.description ?? `Use this agent for ${agent.name} tasks`,
  )

  // Cursor has no per-agent tool allowlist. Drop Claude's `tools:` and record a warning.
  const tools = readAgentTools(agent)
  let readonly: boolean | undefined
  if (tools && tools.length > 0) {
    warnings.push(
      `Agent "${agent.name}": Cursor has no per-agent tool allowlist. Dropped tools [${tools.join(", ")}].`,
    )
    readonly = tools.every((tool) => !MUTATING_TOOLS.has(tool)) ? true : undefined
  }

  const frontmatter: CursorAgentFrontmatter = { name, description, model: "inherit" }
  if (readonly) frontmatter.readonly = true

  let body = transformContentForCursor(agent.body.trim(), knownAgentNames)
  if (agent.capabilities && agent.capabilities.length > 0) {
    const capabilities = agent.capabilities.map((c) => `- ${c}`).join("\n")
    body = `## Capabilities\n${capabilities}\n\n${body}`.trim()
  }
  if (body.length === 0) {
    body = `Instructions converted from the ${agent.name} agent.`
  }

  const content = formatFrontmatter(frontmatter as unknown as Record<string, unknown>, body)
  return { name, content }
}

function convertCommandToSkill(
  command: ClaudeCommand,
  usedNames: Set<string>,
  knownAgentNames: string[],
): CursorGeneratedSkill {
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
 * Read the raw `tools:` frontmatter list from a Claude agent.
 *
 * The Claude parser drops `tools:`, so we re-read it from the source file when
 * present. Tests may attach a `tools` property directly to the agent object.
 */
function readAgentTools(agent: ClaudeAgent): string[] | undefined {
  const inline = (agent as { tools?: unknown }).tools
  const fromInline = normalizeToolList(inline)
  if (fromInline) return fromInline

  if (!agent.sourcePath || !existsSync(agent.sourcePath)) return undefined
  try {
    const raw = readFileSync(agent.sourcePath, "utf8")
    const match = raw.match(/^---\n([\s\S]*?)\n---/)
    if (!match) return undefined
    const toolsLine = match[1]
      .split(/\r?\n/)
      .find((line) => /^tools\s*:/.test(line))
    if (!toolsLine) return undefined
    return normalizeToolList(toolsLine.replace(/^tools\s*:/, "").trim())
  } catch {
    return undefined
  }
}

function normalizeToolList(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const items = value.map((v) => String(v).trim()).filter(Boolean)
    return items.length > 0 ? items : undefined
  }
  if (typeof value === "string") {
    const items = value
      .split(/[,\s]+/)
      .map((v) => v.trim())
      .filter(Boolean)
    return items.length > 0 ? items : undefined
  }
  return undefined
}

/**
 * Transform Claude Code content to Cursor-compatible content.
 *
 * 1. Task agent calls: Task agent-name(args) -> Use the agent-name agent ...
 * 2. Path rewriting: .claude/ -> .cursor/, ~/.claude/ -> ~/.cursor/
 * 3. Slash command refs: /workflows:plan -> the workflows-plan skill
 * 4. Agent refs: @agent-name -> the agent-name agent (only for known agent names)
 */
export function transformContentForCursor(body: string, knownAgentNames: string[] = []): string {
  let result = body

  // 1. Transform Task agent calls (supports namespaced names like js-ce:research:agent-name)
  const taskPattern = /^(\s*-?\s*)Task\s+([a-z][a-z0-9:-]*)\(([^)]*)\)/gm
  result = result.replace(taskPattern, (_match, prefix: string, agentName: string, args: string) => {
    const finalSegment = agentName.includes(":") ? agentName.split(":").pop()! : agentName
    const agentRef = normalizeName(finalSegment)
    const trimmedArgs = args.trim()
    return trimmedArgs
      ? `${prefix}Delegate to the ${agentRef} agent: ${trimmedArgs}`
      : `${prefix}Delegate to the ${agentRef} agent`
  })

  // 2. Rewrite .claude/ paths to .cursor/
  result = result.replace(/(?<=^|\s|["'`])~\/\.claude\//gm, "~/.cursor/")
  result = result.replace(/(?<=^|\s|["'`])\.claude\//gm, ".cursor/")

  // 3. Slash command refs -> skill activation language
  result = result.replace(/(?<=^|\s)`?\/([a-zA-Z][a-zA-Z0-9_:-]*)`?/gm, (_match, cmdName: string) => {
    return `the ${normalizeName(cmdName)} skill`
  })

  // 4. @agent-name references (only for known agent names)
  if (knownAgentNames.length > 0) {
    const escapedNames = knownAgentNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    const agentRefPattern = new RegExp(`@(${escapedNames.join("|")})\\b`, "g")
    result = result.replace(agentRefPattern, (_match, agentName: string) => {
      return `the ${normalizeName(agentName)} agent`
    })
  }

  return result
}

function convertMcpServers(
  servers: Record<string, ClaudeMcpServer> | undefined,
  warnings: string[],
): Record<string, CursorMcpServer> {
  if (!servers || Object.keys(servers).length === 0) return {}

  const result: Record<string, CursorMcpServer> = {}
  for (const [name, server] of Object.entries(servers)) {
    if (server.command) {
      const entry: CursorMcpServer = { type: "stdio", command: server.command }
      if (server.args && server.args.length > 0) entry.args = server.args
      if (server.env && Object.keys(server.env).length > 0) entry.env = server.env
      result[name] = entry
    } else if (server.url) {
      const entry: CursorMcpServer = { url: server.url }
      if (server.headers && Object.keys(server.headers).length > 0) entry.headers = server.headers
      result[name] = entry
    } else {
      warnings.push(`MCP server "${name}" has no command or url. Skipping.`)
    }
  }
  return result
}

function buildAgentsMd(plugin: ClaudePlugin, knownAgentNames: string[]): string | null {
  const instructionPath = resolveInstructionPath(plugin.root)
  if (!instructionPath) return null

  let content: string
  try {
    content = readFileSync(instructionPath, "utf8")
  } catch {
    return null
  }
  if (!content || content.trim().length === 0) return null

  return transformContentForCursor(content, knownAgentNames)
}

function resolveInstructionPath(root: string): string | null {
  const agentsPath = path.join(root, "AGENTS.md")
  if (existsSync(agentsPath)) return agentsPath

  const claudePath = path.join(root, "CLAUDE.md")
  if (existsSync(claudePath)) return claudePath

  return null
}

function normalizeName(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return "item"
  let normalized = trimmed
    .toLowerCase()
    .replace(/[\\/]+/g, "-")
    .replace(/[:\s]+/g, "-")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")

  if (normalized.length > CURSOR_NAME_MAX_LENGTH) {
    normalized = normalized.slice(0, CURSOR_NAME_MAX_LENGTH)
    const lastHyphen = normalized.lastIndexOf("-")
    if (lastHyphen > 0) normalized = normalized.slice(0, lastHyphen)
    normalized = normalized.replace(/-+$/g, "")
  }

  if (normalized.length === 0 || !/^[a-z]/.test(normalized)) return "item"
  return normalized
}

function sanitizeDescription(value: string, maxLength = CURSOR_DESCRIPTION_MAX_LENGTH): string {
  const normalized = value.replace(/\s+/g, " ").trim()
  if (normalized.length <= maxLength) return normalized
  const ellipsis = "..."
  return normalized.slice(0, Math.max(0, maxLength - ellipsis.length)).trimEnd() + ellipsis
}

function uniqueName(base: string, used: Set<string>): string {
  if (!used.has(base)) {
    used.add(base)
    return base
  }
  let index = 2
  while (used.has(`${base}-${index}`)) {
    index += 1
  }
  const name = `${base}-${index}`
  used.add(name)
  return name
}
