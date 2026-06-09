import type { ClaudeMcpServer, ClaudeHooks } from "./claude"
import type { CodexInvocationTargets } from "../utils/codex-content"

export type CodexPrompt = {
  name: string
  content: string
}

export type CodexSkillDir = {
  name: string
  sourceDir: string
}

export type CodexGeneratedSkillSidecarDir = {
  sourceDir: string
  targetName: string
}

export type CodexGeneratedSkill = {
  name: string
  content: string
  sidecarDirs?: CodexGeneratedSkillSidecarDir[]
}

export type CodexBundle = {
  prompts: CodexPrompt[]
  skillDirs: CodexSkillDir[]
  generatedSkills: CodexGeneratedSkill[]
  invocationTargets?: CodexInvocationTargets
  mcpServers?: Record<string, ClaudeMcpServer>
  /**
   * Stable name used as the managed key when merging hooks into
   * `.codex/hooks.json`, so re-installs replace this plugin's entries cleanly.
   */
  pluginName?: string
  hooks?: ClaudeHooks
}
