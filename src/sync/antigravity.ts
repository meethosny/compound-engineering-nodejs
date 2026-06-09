import path from "path"
import type { ClaudeHomeConfig } from "../parsers/claude-home"
import type { ClaudeMcpServer } from "../types/claude"
import type { ClaudePlugin } from "../types/claude"
import { convertClaudeToAntigravity } from "../converters/claude-to-antigravity"
import type { AntigravityMcpServer } from "../types/antigravity"
import { resolveCommandPath, writeText } from "../utils/files"
import { mergeJsonConfigAtKey } from "./json-config"
import { syncSkills } from "./skills"

const HOME_SYNC_PLUGIN_ROOT = path.join(process.cwd(), ".compound-sync-home")

const DEFAULT_SYNC_OPTIONS = {
  agentMode: "subagent" as const,
  inferTemperature: false,
  permissions: "none" as const,
}

/**
 * Sync personal Claude home config to Antigravity.
 *
 * `outputRoot` is the global Antigravity root (~/.gemini). Skills are symlinked
 * into ~/.gemini/antigravity/skills, commands become markdown workflows in
 * ~/.gemini/antigravity/global_workflows, and MCP servers deep-merge into
 * ~/.gemini/config/mcp_config.json.
 */
export async function syncToAntigravity(
  config: ClaudeHomeConfig,
  outputRoot: string,
): Promise<void> {
  await syncSkills(config.skills, path.join(outputRoot, "antigravity", "skills"))
  await syncAntigravityWorkflows(config, outputRoot)

  if (Object.keys(config.mcpServers).length > 0) {
    await mergeJsonConfigAtKey({
      configPath: path.join(outputRoot, "config", "mcp_config.json"),
      key: "mcpServers",
      incoming: convertMcpForAntigravity(config.mcpServers),
    })
  }
}

async function syncAntigravityWorkflows(
  config: ClaudeHomeConfig,
  outputRoot: string,
): Promise<void> {
  if (!config.commands || config.commands.length === 0) return

  const plugin = buildClaudeHomePlugin(config)
  const bundle = convertClaudeToAntigravity(plugin, DEFAULT_SYNC_OPTIONS)
  const workflowsDir = path.join(outputRoot, "antigravity", "global_workflows")

  for (const workflow of bundle.workflows) {
    const dest = await resolveCommandPath(workflowsDir, workflow.name, ".md")
    await writeText(dest, workflow.content + "\n")
  }
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

function convertMcpForAntigravity(
  servers: Record<string, ClaudeMcpServer>,
): Record<string, AntigravityMcpServer> {
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
