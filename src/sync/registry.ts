import os from "os"
import path from "path"
import type { ClaudeHomeConfig } from "../parsers/claude-home"
import { syncToCodex } from "./codex"
import { syncToCopilot } from "./copilot"
import { syncToDroid } from "./droid"
import { syncToGemini } from "./gemini"
import { syncToKiro } from "./kiro"
import { syncToOpenCode } from "./opencode"
import { syncToPi } from "./pi"
import { syncToCursor } from "./cursor"
import { syncToAntigravity } from "./antigravity"
import { syncToAgents } from "./agents"

function getCopilotHomeRoot(home: string): string {
  return path.join(home, ".copilot")
}

function getGeminiHomeRoot(home: string): string {
  return path.join(home, ".gemini")
}

export type SyncTargetName =
  | "opencode"
  | "codex"
  | "pi"
  | "droid"
  | "copilot"
  | "gemini"
  | "kiro"
  | "cursor"
  | "antigravity"
  | "agents"

export type SyncTargetDefinition = {
  name: SyncTargetName
  detectPaths: (home: string, cwd: string) => string[]
  resolveOutputRoot: (home: string, cwd: string) => string
  sync: (config: ClaudeHomeConfig, outputRoot: string) => Promise<void>
}

export const syncTargets: SyncTargetDefinition[] = [
  {
    name: "opencode",
    detectPaths: (home, cwd) => [
      path.join(home, ".config", "opencode"),
      path.join(cwd, ".opencode"),
    ],
    resolveOutputRoot: (home) => path.join(home, ".config", "opencode"),
    sync: syncToOpenCode,
  },
  {
    name: "codex",
    detectPaths: (home) => [path.join(home, ".codex")],
    resolveOutputRoot: (home) => path.join(home, ".codex"),
    sync: syncToCodex,
  },
  {
    name: "pi",
    detectPaths: (home) => [path.join(home, ".pi")],
    resolveOutputRoot: (home) => path.join(home, ".pi", "agent"),
    sync: syncToPi,
  },
  {
    name: "droid",
    detectPaths: (home) => [path.join(home, ".factory")],
    resolveOutputRoot: (home) => path.join(home, ".factory"),
    sync: syncToDroid,
  },
  {
    name: "copilot",
    detectPaths: (home, cwd) => [
      getCopilotHomeRoot(home),
      path.join(cwd, ".github", "skills"),
      path.join(cwd, ".github", "agents"),
      path.join(cwd, ".github", "copilot-instructions.md"),
    ],
    resolveOutputRoot: (home) => getCopilotHomeRoot(home),
    sync: syncToCopilot,
  },
  {
    name: "gemini",
    detectPaths: (home, cwd) => [
      path.join(cwd, ".gemini"),
      getGeminiHomeRoot(home),
    ],
    resolveOutputRoot: (home) => getGeminiHomeRoot(home),
    sync: syncToGemini,
  },
  {
    name: "kiro",
    detectPaths: (home, cwd) => [
      path.join(home, ".kiro"),
      path.join(cwd, ".kiro"),
    ],
    resolveOutputRoot: (home) => path.join(home, ".kiro"),
    sync: syncToKiro,
  },
  {
    name: "cursor",
    detectPaths: (home, cwd) => [
      path.join(home, ".cursor"),
      path.join(cwd, ".cursor"),
    ],
    resolveOutputRoot: (home) => path.join(home, ".cursor"),
    sync: syncToCursor,
  },
  {
    name: "antigravity",
    detectPaths: (home, cwd) => [
      path.join(cwd, ".agent"),
      getGeminiHomeRoot(home),
    ],
    resolveOutputRoot: (home) => getGeminiHomeRoot(home),
    sync: syncToAntigravity,
  },
  {
    name: "agents",
    detectPaths: (home, cwd) => [
      path.join(cwd, ".agents"),
      path.join(home, ".agents"),
    ],
    resolveOutputRoot: (home) => path.join(home, ".agents"),
    sync: syncToAgents,
  },
]

export const syncTargetNames = syncTargets.map((target) => target.name)

export function isSyncTargetName(value: string): value is SyncTargetName {
  return syncTargetNames.includes(value as SyncTargetName)
}

export function getSyncTarget(name: SyncTargetName): SyncTargetDefinition {
  const target = syncTargets.find((entry) => entry.name === name)
  if (!target) {
    throw new Error(`Unknown sync target: ${name}`)
  }
  return target
}

export function getDefaultSyncRegistryContext(): { home: string; cwd: string } {
  return { home: os.homedir(), cwd: process.cwd() }
}
