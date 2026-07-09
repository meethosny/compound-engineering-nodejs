import path from "path"
import type { ClaudeHomeConfig } from "../parsers/claude-home"
import type { ClaudePlugin } from "../types/claude"
import { backupFile, resolveCommandPath, sanitizePathName, writeText } from "../utils/files"
import { convertClaudeToCodex } from "../converters/claude-to-codex"
import { convertClaudeToCursor } from "../converters/claude-to-cursor"
import { convertClaudeToDroid } from "../converters/claude-to-droid"
import { convertClaudeToKiro } from "../converters/claude-to-kiro"
import { convertClaudeToOpenCode, type ClaudeToOpenCodeOptions } from "../converters/claude-to-opencode"
import { convertClaudeToPi } from "../converters/claude-to-pi"

const HOME_SYNC_PLUGIN_ROOT = path.join(process.cwd(), ".compound-sync-home")

const DEFAULT_SYNC_OPTIONS: ClaudeToOpenCodeOptions = {
  agentMode: "subagent",
  inferTemperature: false,
  permissions: "none",
}

function hasCommands(config: ClaudeHomeConfig): boolean {
  return (config.commands?.length ?? 0) > 0
}

function buildClaudeHomePlugin(config: ClaudeHomeConfig): ClaudePlugin {
  return {
    root: HOME_SYNC_PLUGIN_ROOT,
    manifest: {
      name: "claude-home",
      version: "1.0.0",
      description: "Personal Claude Code home config",
    },
    agents: [],
    commands: config.commands ?? [],
    skills: config.skills,
    mcpServers: undefined,
  }
}

export async function syncOpenCodeCommands(
  config: ClaudeHomeConfig,
  outputRoot: string,
): Promise<void> {
  if (!hasCommands(config)) return

  const plugin = buildClaudeHomePlugin(config)
  const bundle = convertClaudeToOpenCode(plugin, DEFAULT_SYNC_OPTIONS)

  for (const commandFile of bundle.commandFiles) {
    const commandPath = await resolveCommandPath(path.join(outputRoot, "commands"), commandFile.name, ".md")
    const backupPath = await backupFile(commandPath)
    if (backupPath) {
      console.log(`Backed up existing command file to ${backupPath}`)
    }
    await writeText(commandPath, commandFile.content + "\n")
  }
}

export async function syncCodexCommands(
  config: ClaudeHomeConfig,
  outputRoot: string,
): Promise<void> {
  if (!hasCommands(config)) return

  const plugin = buildClaudeHomePlugin(config)
  const bundle = convertClaudeToCodex(plugin, DEFAULT_SYNC_OPTIONS)
  for (const prompt of bundle.prompts) {
    await writeText(path.join(outputRoot, "prompts", `${prompt.name}.md`), prompt.content + "\n")
  }
  for (const skill of bundle.generatedSkills) {
    await writeText(path.join(outputRoot, "skills", sanitizePathName(skill.name), "SKILL.md"), skill.content + "\n")
  }
}

export async function syncPiCommands(
  config: ClaudeHomeConfig,
  outputRoot: string,
): Promise<void> {
  if (!hasCommands(config)) return

  const plugin = buildClaudeHomePlugin(config)
  const bundle = convertClaudeToPi(plugin, DEFAULT_SYNC_OPTIONS)
  for (const prompt of bundle.prompts) {
    await writeText(path.join(outputRoot, "prompts", `${prompt.name}.md`), prompt.content + "\n")
  }
  for (const extension of bundle.extensions) {
    await writeText(path.join(outputRoot, "extensions", extension.name), extension.content + "\n")
  }
}

export async function syncDroidCommands(
  config: ClaudeHomeConfig,
  outputRoot: string,
): Promise<void> {
  if (!hasCommands(config)) return

  const plugin = buildClaudeHomePlugin(config)
  const bundle = convertClaudeToDroid(plugin, DEFAULT_SYNC_OPTIONS)
  for (const command of bundle.commands) {
    await writeText(path.join(outputRoot, "commands", `${command.name}.md`), command.content + "\n")
  }
}

export async function syncKiroCommands(
  config: ClaudeHomeConfig,
  outputRoot: string,
): Promise<void> {
  if (!hasCommands(config)) return

  const plugin = buildClaudeHomePlugin(config)
  const bundle = convertClaudeToKiro(plugin, DEFAULT_SYNC_OPTIONS)
  for (const skill of bundle.generatedSkills) {
    await writeText(path.join(outputRoot, "skills", sanitizePathName(skill.name), "SKILL.md"), skill.content + "\n")
  }
}

export async function syncCursorCommands(
  config: ClaudeHomeConfig,
  outputRoot: string,
): Promise<void> {
  if (!hasCommands(config)) return

  const plugin = buildClaudeHomePlugin(config)
  const bundle = convertClaudeToCursor(plugin, DEFAULT_SYNC_OPTIONS)
  for (const skill of bundle.generatedSkills) {
    await writeText(path.join(outputRoot, "skills", sanitizePathName(skill.name), "SKILL.md"), skill.content + "\n")
  }
}
