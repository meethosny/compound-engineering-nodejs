import path from "path"
import { backupFile, copyDir, ensureDir, pathExists, readJson, resolveCommandPath, writeJson, writeText } from "../utils/files"
import type { OpenCodeBundle, OpenCodeConfig } from "../types/opencode"

// Merges plugin config into existing .opencode.json. User keys win on conflict. See ADR-002.
async function mergeOpenCodeConfig(
  configPath: string,
  incoming: OpenCodeConfig,
): Promise<OpenCodeConfig> {
  // If no existing config, write plugin config as-is
  if (!(await pathExists(configPath))) return incoming

  let existing: OpenCodeConfig
  try {
    existing = await readJson<OpenCodeConfig>(configPath)
  } catch {
    // Safety first per AGENTS.md -- do not destroy user data even if their config is malformed.
    // Warn and fall back to plugin-only config rather than crashing.
    console.warn(
      `Warning: existing ${configPath} is not valid JSON. Writing plugin config without merging.`
    )
    return incoming
  }

  // User config wins on conflict -- see ADR-002
  // MCP servers: add plugin entry, skip keys already in user config.
  const mergedMcp = {
    ...(incoming.mcp ?? {}),
    ...(existing.mcp ?? {}), // existing takes precedence (overwrites same-named plugin entry)
  }

  // Permission: add plugin entry, skip keys already in user config.
  const mergedPermission = incoming.permission
    ? {
        ...(incoming.permission),
        ...(existing.permission ?? {}), // existing takes precedence
      }
    : existing.permission

  // Tools: same pattern
  const mergedTools = incoming.tools
    ? {
        ...(incoming.tools),
        ...(existing.tools ?? {}),
      }
    : existing.tools

  return {
    ...existing,                    // all user keys preserved
    $schema: incoming.$schema ?? existing.$schema,
    mcp: Object.keys(mergedMcp).length > 0 ? mergedMcp : undefined,
    permission: mergedPermission,
    tools: mergedTools,
  }
}

export async function writeOpenCodeBundle(outputRoot: string, bundle: OpenCodeBundle): Promise<void> {
  const openCodePaths = resolveOpenCodePaths(outputRoot)
  await ensureDir(openCodePaths.root)

  // OpenCode only supports custom commands (accessed via Ctrl+K).
  // Agents and skills don't exist as user-extensible features in OpenCode.
  // Everything gets written as commands.

  const hadExistingConfig = await pathExists(openCodePaths.configPath)
  const backupPath = await backupFile(openCodePaths.configPath)
  if (backupPath) {
    console.log(`Backed up existing config to ${backupPath}`)
  }
  const merged = await mergeOpenCodeConfig(openCodePaths.configPath, bundle.config)
  await writeJson(openCodePaths.configPath, merged)
  if (hadExistingConfig) {
    console.log("Merged plugin config into existing .opencode.json (user settings preserved)")
  }

  // Write agents as commands (OpenCode has no user-defined agents)
  const commandsDir = openCodePaths.commandDir
  for (const agent of bundle.agents) {
    await writeText(path.join(commandsDir, `${agent.name}.md`), agent.content + "\n")
  }

  // Write command files as commands
  for (const commandFile of bundle.commandFiles) {
    const dest = await resolveCommandPath(commandsDir, commandFile.name, ".md")
    const cmdBackupPath = await backupFile(dest)
    if (cmdBackupPath) {
      console.log(`Backed up existing command file to ${cmdBackupPath}`)
    }
    await writeText(dest, commandFile.content + "\n")
  }

  // Write hooks/plugins if any
  if (bundle.plugins.length > 0) {
    const pluginsDir = openCodePaths.pluginsDir
    for (const plugin of bundle.plugins) {
      await writeText(path.join(pluginsDir, plugin.name), plugin.content + "\n")
    }
  }

  // Write skills as commands (OpenCode has no skills concept)
  if (bundle.skillDirs.length > 0) {
    for (const skill of bundle.skillDirs) {
      // Copy the SKILL.md content as a command file
      const skillMdPath = path.join(skill.sourceDir, "SKILL.md")
      if (await pathExists(skillMdPath)) {
        const destPath = path.join(commandsDir, `${skill.name}.md`)
        const content = await import("fs").then(fs => fs.promises.readFile(skillMdPath, "utf8"))
        await writeText(destPath, content + "\n")
      }
    }
  }
}

function resolveOpenCodePaths(outputRoot: string) {
  const commandsDir = path.join(outputRoot, "commands")

  return {
    root: outputRoot,
    // OpenCode config is .opencode.json (with dot prefix)
    configPath: path.join(outputRoot, ".opencode.json"),
    // Commands are the only user-extensible feature
    commandDir: commandsDir,
    // Plugins dir for hooks (if supported)
    pluginsDir: path.join(outputRoot, "plugins"),
  }
}
