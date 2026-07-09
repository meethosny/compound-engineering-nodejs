import type { ClaudePlugin } from "../types/claude"
import { convertClaudeToOpenCode, type ClaudeToOpenCodeOptions } from "../converters/claude-to-opencode"
import { convertClaudeToCodex } from "../converters/claude-to-codex"
import { convertClaudeToDroid } from "../converters/claude-to-droid"
import { convertClaudeToPi } from "../converters/claude-to-pi"
import { convertClaudeToKiro } from "../converters/claude-to-kiro"
import { convertClaudeToCursor } from "../converters/claude-to-cursor"
import { convertClaudeToAntigravity } from "../converters/claude-to-antigravity"
import { writeOpenCodeBundle } from "./opencode"
import { writeCodexBundle } from "./codex"
import { writeDroidBundle } from "./droid"
import { writePiBundle } from "./pi"
import { writeKiroBundle } from "./kiro"
import { writeCursorBundle } from "./cursor"
import { writeAntigravityBundle } from "./antigravity"

export type TargetScope = "global" | "workspace"

export function isTargetScope(value: string): value is TargetScope {
  return value === "global" || value === "workspace"
}

/**
 * Validate a --scope flag against a target's supported scopes.
 * Returns the resolved scope (explicit or default) or throws on invalid input.
 */
export function validateScope(
  targetName: string,
  target: TargetHandler,
  scopeArg: string | undefined,
): TargetScope | undefined {
  if (scopeArg === undefined) return target.defaultScope

  if (!target.supportedScopes) {
    throw new Error(`Target "${targetName}" does not support the --scope flag.`)
  }
  if (!isTargetScope(scopeArg) || !target.supportedScopes.includes(scopeArg)) {
    throw new Error(`Target "${targetName}" does not support --scope ${scopeArg}. Supported: ${target.supportedScopes.join(", ")}`)
  }
  return scopeArg
}

export type TargetHandler<TBundle = unknown> = {
  name: string
  implemented: boolean
  /** Default scope when --scope is not provided. Only meaningful when supportedScopes is defined. */
  defaultScope?: TargetScope
  /** Valid scope values. If absent, the --scope flag is rejected for this target. */
  supportedScopes?: TargetScope[]
  convert: (plugin: ClaudePlugin, options: ClaudeToOpenCodeOptions) => TBundle | null
  write: (outputRoot: string, bundle: TBundle, scope?: TargetScope) => Promise<void>
}

export const targets: Record<string, TargetHandler> = {
  opencode: {
    name: "opencode",
    implemented: true,
    convert: convertClaudeToOpenCode,
    write: writeOpenCodeBundle as TargetHandler["write"],
  },
  codex: {
    name: "codex",
    implemented: true,
    convert: convertClaudeToCodex as TargetHandler["convert"],
    write: writeCodexBundle as TargetHandler["write"],
  },
  droid: {
    name: "droid",
    implemented: true,
    convert: convertClaudeToDroid as TargetHandler["convert"],
    write: writeDroidBundle as TargetHandler["write"],
  },
  pi: {
    name: "pi",
    implemented: true,
    convert: convertClaudeToPi as TargetHandler["convert"],
    write: writePiBundle as TargetHandler["write"],
  },
  kiro: {
    name: "kiro",
    implemented: true,
    convert: convertClaudeToKiro as TargetHandler["convert"],
    write: writeKiroBundle as TargetHandler["write"],
  },
  cursor: {
    name: "cursor",
    implemented: true,
    defaultScope: "workspace",
    supportedScopes: ["global", "workspace"],
    convert: convertClaudeToCursor as TargetHandler["convert"],
    write: writeCursorBundle as TargetHandler["write"],
  },
  antigravity: {
    name: "antigravity",
    implemented: true,
    defaultScope: "workspace",
    supportedScopes: ["global", "workspace"],
    convert: convertClaudeToAntigravity as TargetHandler["convert"],
    write: writeAntigravityBundle as TargetHandler["write"],
  },
}
