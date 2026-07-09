import { defineCommand } from "citty"
import os from "os"
import path from "path"
import { fileURLToPath } from "url"
import { loadClaudePlugin } from "../parsers/claude"
import { cleanupStaleSkillDirs } from "../utils/legacy-cleanup"
import { expandHome, resolveTargetHome } from "../utils/resolve-home"
import { pathExists } from "../utils/files"

const FORK_PLUGIN_NAME = "js-compound-engineering"

const cleanupTargets = [
  "opencode",
  "codex",
  "pi",
  "droid",
  "kiro",
  "cursor",
  "antigravity",
] as const
type CleanupTarget = (typeof cleanupTargets)[number]

const home = os.homedir()

/**
 * Default skills roots per target, matching where each writer emits skills.
 * Some targets write to BOTH a home-scoped and a workspace-scoped skills root
 * (cursor/antigravity/agents), so each target resolves to one-or-more roots.
 */
function defaultSkillsRoots(target: CleanupTarget, overrides: Record<string, unknown>): string[] {
  switch (target) {
    case "opencode":
      return [resolveTargetHome(overrides.opencodeHome, path.join(home, ".config", "opencode", "skills"))]
    case "codex":
      return [resolveTargetHome(overrides.codexHome, path.join(home, ".codex", "skills"))]
    case "pi":
      return [resolveTargetHome(overrides.piHome, path.join(home, ".pi", "agent", "skills"))]
    case "droid":
      return [resolveTargetHome(overrides.droidHome, path.join(home, ".factory", "skills"))]
    case "kiro":
      return [resolveTargetHome(overrides.kiroHome, path.join(home, ".kiro", "skills"))]
    case "cursor":
      return overrides.cursorHome
        ? [resolveTargetHome(overrides.cursorHome, "")]
        : [path.join(home, ".cursor", "skills"), path.join(process.cwd(), ".cursor", "skills")]
    case "antigravity":
      return overrides.antigravityHome
        ? [resolveTargetHome(overrides.antigravityHome, "")]
        : [path.join(home, ".agents", "skills"), path.join(process.cwd(), ".agents", "skills")]
  }
}

export default defineCommand({
  meta: {
    name: "cleanup",
    description: "Back up stale js-compound-engineering skill dirs left by the js-* -> js-ce-* rename",
  },
  args: {
    plugin: {
      type: "positional",
      required: false,
      description: "Plugin name or local plugin path (default: bundled js-compound-engineering)",
    },
    target: {
      type: "string",
      default: "all",
      description: `Target to clean: ${cleanupTargets.join(" | ")} | all`,
    },
    opencodeHome: { type: "string", alias: "opencode-home", description: "OpenCode skills root override" },
    codexHome: { type: "string", alias: "codex-home", description: "Codex skills root override" },
    piHome: { type: "string", alias: "pi-home", description: "Pi skills root override" },
    droidHome: { type: "string", alias: "droid-home", description: "Droid skills root override" },
    kiroHome: { type: "string", alias: "kiro-home", description: "Kiro skills root override" },
    cursorHome: { type: "string", alias: "cursor-home", description: "Cursor skills root override" },
    antigravityHome: { type: "string", alias: "antigravity-home", description: "Antigravity skills root override" },
  },
  async run({ args }) {
    const pluginPath = await resolveCleanupPluginPath(args.plugin ? String(args.plugin) : FORK_PLUGIN_NAME)
    const plugin = await loadClaudePlugin(pluginPath)
    if (plugin.manifest.name !== FORK_PLUGIN_NAME) {
      throw new Error(`Cleanup currently supports only the ${FORK_PLUGIN_NAME} plugin.`)
    }

    const targetNames = resolveCleanupTargets(String(args.target))
    const overrides = {
      opencodeHome: args.opencodeHome,
      codexHome: args.codexHome,
      piHome: args.piHome,
      droidHome: args.droidHome,
      kiroHome: args.kiroHome,
      cursorHome: args.cursorHome,
      antigravityHome: args.antigravityHome,
    }

    let total = 0
    for (const target of targetNames) {
      const roots = dedupe(defaultSkillsRoots(target, overrides).filter(Boolean))
      let movedForTarget = 0
      for (const root of roots) {
        const moved = await cleanupStaleSkillDirs(root, plugin.manifest.name)
        movedForTarget += moved
        console.log(`Cleaned ${target} at ${root}: backed up ${moved} artifact(s)`)
      }
      total += movedForTarget
    }
    console.log(`Cleanup complete for ${plugin.manifest.name}: backed up ${total} artifact(s).`)
  },
})

function resolveCleanupTargets(targetArg: string): CleanupTarget[] {
  if (targetArg === "all") return [...cleanupTargets]
  const requested = targetArg.split(",").map((entry) => entry.trim()).filter(Boolean)
  for (const target of requested) {
    if (!cleanupTargets.includes(target as CleanupTarget)) {
      throw new Error(`Unknown cleanup target: ${target}. Use one of: ${cleanupTargets.join(", ")}, all`)
    }
  }
  return requested as CleanupTarget[]
}

function dedupe(roots: string[]): string[] {
  return [...new Set(roots.map((root) => path.resolve(root)))]
}

async function resolveCleanupPluginPath(input: string): Promise<string> {
  if (input.startsWith(".") || input.startsWith("/") || input.startsWith("~")) {
    const directPath = path.resolve(expandHome(input))
    if (await pathExists(directPath)) return directPath
    throw new Error(`Local plugin path not found: ${directPath}`)
  }

  const bundledRoot = fileURLToPath(new URL("../../plugins/", import.meta.url))
  const pluginPath = path.join(bundledRoot, input)
  const manifestPath = path.join(pluginPath, ".claude-plugin", "plugin.json")
  if (await pathExists(manifestPath)) return pluginPath

  throw new Error(`Unknown bundled plugin: ${input}`)
}
