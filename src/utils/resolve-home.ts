import os from "os"
import path from "path"

export function expandHome(value: string): string {
  if (value === "~") return os.homedir()
  if (value.startsWith(`~${path.sep}`)) {
    return path.join(os.homedir(), value.slice(2))
  }
  return value
}

export function resolveTargetHome(value: unknown, defaultPath: string): string {
  if (!value) return defaultPath
  const raw = String(value).trim()
  if (!raw) return defaultPath
  return path.resolve(expandHome(raw))
}

/**
 * Resolve the Codex root, honoring the `CODEX_HOME` env var when no explicit
 * value is passed (default falls back to `~/.codex`). Mirrors upstream #830.
 */
export function resolveCodexHome(value: unknown): string {
  const defaultPath = process.env.CODEX_HOME?.trim() || path.join(os.homedir(), ".codex")
  return resolveTargetHome(value, path.resolve(expandHome(defaultPath)))
}
