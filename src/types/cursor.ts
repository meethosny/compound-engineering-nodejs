/**
 * Cursor IDE bundle types (cursor.com, Cursor 2.4+).
 *
 * Output layout (project scope: `.cursor/`, global scope: `~/.cursor/`):
 *   .cursor/skills/<name>/SKILL.md   (copied verbatim, 1:1 from Claude skills)
 *   .cursor/agents/<name>.md         (md + YAML frontmatter; no tools allowlist)
 *   .cursor/commands/<name>.md       (plain markdown, no frontmatter)
 *   .cursor/mcp.json                 (deep-merged into existing)
 *   AGENTS.md                        (shared context at output root)
 */

export type CursorAgentFrontmatter = {
  name: string
  description: string
  /** Cursor defaults to "inherit" — use the chat model. */
  model: "inherit"
  /** Only set when the agent is clearly read-only (Cursor has no per-agent tool allowlist). */
  readonly?: boolean
}

export type CursorAgent = {
  name: string
  /** Full agent file: YAML frontmatter + markdown body. */
  content: string
}

export type CursorSkillDir = {
  name: string
  sourceDir: string
}

/** A SKILL.md synthesized from a Claude command (commands route to skills for highest fidelity). */
export type CursorGeneratedSkill = {
  name: string
  /** Full SKILL.md with YAML frontmatter (name + description). */
  content: string
}

export type CursorMcpServer = {
  type?: "stdio"
  command?: string
  args?: string[]
  env?: Record<string, string>
  url?: string
  headers?: Record<string, string>
}

export type CursorBundle = {
  agents: CursorAgent[]
  /** 1:1 pass-through of Claude skill directories. */
  skillDirs: CursorSkillDir[]
  /** Claude commands routed to Cursor skills (SKILL.md). */
  generatedSkills: CursorGeneratedSkill[]
  mcpServers: Record<string, CursorMcpServer>
  /** Shared context written to AGENTS.md at the output root. Null when no instruction file exists. */
  agentsMd: string | null
  /** Human-readable warnings (e.g. dropped per-agent tool allowlists). */
  warnings: string[]
}
