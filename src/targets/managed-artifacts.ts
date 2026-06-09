import fs from "fs/promises"
import path from "path"
import { ensureDir, isSafeManagedPath, pathExists } from "../utils/files"

/**
 * MOVE (not delete) a stale artifact into a recoverable, timestamped backup
 * under `<managedDir>/legacy-backup/<timestamp>/<kind>/<name>`. This keeps the
 * artifact recoverable instead of destroying user data.
 *
 * Idempotent: if the artifact does not exist (already moved on a prior run),
 * this is a no-op. Guarded by `isSafeManagedPath` so a tampered/relative name
 * can never escape `artifactRoot` and trigger an out-of-tree rename.
 */
export async function moveLegacyArtifactToBackup(
  managedDir: string,
  kind: string,
  artifactRoot: string,
  relativePath: string,
  label: string,
): Promise<void> {
  // Defense in depth: relativePath comes from the hardcoded legacy allow-list
  // (safe by construction), but re-check so any future caller cannot issue an
  // out-of-tree rename.
  if (!isSafeManagedPath(artifactRoot, relativePath)) return

  const artifactPath = path.join(artifactRoot, ...relativePath.split("/"))
  if (!(await pathExists(artifactPath))) return

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const backupPath = path.join(managedDir, "legacy-backup", timestamp, kind, ...relativePath.split("/"))
  await ensureDir(path.dirname(backupPath))
  await fs.rename(artifactPath, backupPath)
  console.warn(`Moved legacy ${label} artifact to ${backupPath}`)
}
