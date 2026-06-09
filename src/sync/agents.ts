import path from "path"
import type { ClaudeHomeConfig } from "../parsers/claude-home"
import { syncSkills } from "./skills"

/**
 * Sync personal Claude home config to the universal `.agents/` layer.
 *
 * `outputRoot` is the global `~/.agents` root (passed by the sync registry).
 * Personal skills are symlinked into `~/.agents/skills`. MCP is not synced —
 * the `.agents/` layer has no shared MCP location (configure per-tool).
 */
export async function syncToAgents(
  config: ClaudeHomeConfig,
  outputRoot: string,
): Promise<void> {
  await syncSkills(config.skills, path.join(outputRoot, "skills"))
}
