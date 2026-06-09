// Antigravity (Google's Gemini-based agentic IDE) shares Gemini's SKILL.md
// and MCP-server shapes, so we re-export those types directly.
import type { GeminiSkill, GeminiSkillDir } from "./gemini"

export type AntigravitySkill = GeminiSkill
export type AntigravitySkillDir = GeminiSkillDir

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
