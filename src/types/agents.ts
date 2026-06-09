/**
 * Universal "Agent Skills" open-standard layer (the tool-neutral `.agents/`
 * directory). Six tools read it directly — codex, opencode, gemini,
 * antigravity, cursor, and VS Code Copilot — so "write once, every compatible
 * tool reads it."
 *
 * Output layout:
 *   workspace scope: `.agents/` at the project root (cwd)
 *   global scope:    `~/.agents/`
 *
 *   .agents/skills/<name>/SKILL.md   (pass-through skills + agents-as-skills + commands-as-skills)
 *   AGENTS.md                        (skills index, project scope only)
 *
 * There is no universal `.agents/` MCP location, so MCP servers are skipped
 * with a recorded warning telling the user to configure MCP per-tool.
 */

import type { GeminiSkill, GeminiSkillDir } from "./gemini"

/** A SKILL.md synthesized from a Claude agent or command (full content with name+description frontmatter). */
export type AgentsGeneratedSkill = GeminiSkill

/** A 1:1 pass-through reference to a Claude skill directory. */
export type AgentsSkillDir = GeminiSkillDir

export type AgentsBundle = {
  /** 1:1 pass-through of Claude skill directories. */
  skillDirs: AgentsSkillDir[]
  /** SKILL.md files synthesized from Claude agents and commands (agents/commands -> skills). */
  generatedSkills: AgentsGeneratedSkill[]
  /** Shared context written to AGENTS.md at the output root. Null when no instruction file exists. */
  agentsMd: string | null
  /** Human-readable warnings (e.g. MCP skipped — there is no universal `.agents/` MCP location). */
  warnings: string[]
}
