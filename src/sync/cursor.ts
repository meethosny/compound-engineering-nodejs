import path from "path"
import type { ClaudeHomeConfig } from "../parsers/claude-home"
import type { ClaudeMcpServer } from "../types/claude"
import type { CursorMcpServer } from "../types/cursor"
import { syncCursorCommands } from "./commands"
import { mergeJsonConfigAtKey } from "./json-config"
import { syncSkills } from "./skills"

export async function syncToCursor(
  config: ClaudeHomeConfig,
  outputRoot: string,
): Promise<void> {
  await syncSkills(config.skills, path.join(outputRoot, "skills"))
  await syncCursorCommands(config, outputRoot)

  if (Object.keys(config.mcpServers).length > 0) {
    await mergeJsonConfigAtKey({
      configPath: path.join(outputRoot, "mcp.json"),
      key: "mcpServers",
      incoming: convertMcpForCursor(config.mcpServers),
    })
  }
}

function convertMcpForCursor(
  servers: Record<string, ClaudeMcpServer>,
): Record<string, CursorMcpServer> {
  const result: Record<string, CursorMcpServer> = {}

  for (const [name, server] of Object.entries(servers)) {
    if (server.command) {
      result[name] = {
        type: "stdio",
        command: server.command,
        args: server.args,
        env: server.env,
      }
      continue
    }

    if (server.url) {
      result[name] = {
        url: server.url,
        headers: server.headers,
      }
    }
  }

  return result
}
