// Antigravity (Google's Gemini-based agentic IDE) generates SKILL.md files
// and pass-through skill directories.
export type AntigravitySkill = {
  name: string
  content: string // Full SKILL.md with YAML frontmatter
}

export type AntigravitySkillDir = {
  name: string
  sourceDir: string
}

// Antigravity commands become markdown workflows (NOT Gemini's TOML).
export type AntigravityWorkflow = {
  name: string // e.g. "plan" or "workflows/plan"
  content: string // Full markdown content with YAML frontmatter
}

// Shared context (CLAUDE.md / AGENTS.md) becomes a rules file.
export type AntigravityRule = {
  name: string // e.g. "compound-engineering"
  content: string // Full markdown content
}

// Antigravity uses serverUrl (NOT url/httpUrl) for remote MCP servers.
export type AntigravityMcpServer = {
  command?: string
  args?: string[]
  env?: Record<string, string>
  serverUrl?: string
  headers?: Record<string, string>
}

export type AntigravityBundle = {
  generatedSkills: AntigravitySkill[] // From agents (agents -> skills)
  skillDirs: AntigravitySkillDir[] // From skills (pass-through, 1:1)
  workflows: AntigravityWorkflow[] // From commands
  rules: AntigravityRule[] // From CLAUDE.md / AGENTS.md shared context
  mcpServers?: Record<string, AntigravityMcpServer>
}
