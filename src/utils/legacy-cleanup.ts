/**
 * One-time cleanup of stale `js-compound-engineering` skill directories left
 * behind by the `js-*` -> `js-ce-*` rename (and the two removed skills).
 *
 * The fork converts plugin AGENTS to SKILLS, so a stale agent name shows up in
 * a target's output as a stale SKILL directory — not a separate agent file.
 * This module therefore sweeps stale *skill dirs* for both old skill names and
 * old agent names.
 *
 * SAFETY: a stale-named dir is only touched when it is CE-OWNED. Ownership is
 * proven by reading the dir's `SKILL.md` `description:` frontmatter and matching
 * it against the description of the currently-shipped `js-ce-*` skill/agent that
 * the stale name maps to (a fingerprint index built from the bundled plugin).
 * A stale-named dir whose description does NOT match any current CE description
 * is treated as NOT ours and left untouched — this prevents deleting a user's
 * same-named skill. Removal is non-destructive: stale dirs are MOVED into a
 * timestamped `legacy-backup/` so they remain recoverable.
 *
 * TODO(cleanup): remove after the js-ce-* transition window passes.
 */

import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import { parseFrontmatter } from "./frontmatter"
import { pathExists } from "./files"
import { getLegacyPluginArtifacts } from "../data/plugin-legacy-artifacts"
import { moveLegacyArtifactToBackup } from "../targets/managed-artifacts"

const FORK_PLUGIN_NAME = "js-compound-engineering"

const artifacts = getLegacyPluginArtifacts(FORK_PLUGIN_NAME)

/** Stale skill dir names (old skill dirs ∪ old agent names ∪ historical variants). */
export const STALE_SKILL_DIRS: string[] = artifacts.skills ?? []

/** Old agent names — written as skill dirs in fork target outputs. */
export const STALE_AGENT_NAMES: string[] = artifacts.agents ?? []

/**
 * Map a stale `js-*` name to its current `js-ce-*` name so we can locate the
 * shipped SKILL.md whose description fingerprints ownership.
 *
 *   js-proof            -> js-ce-proof
 *   js-report-bug-ce    -> js-ce-report-bug   (the `-ce` suffix moved to prefix)
 *   js-learnings-researcher -> js-ce-learnings-researcher
 *
 * Names already in the `js-ce-*` form (historical variants) map to themselves.
 */
function currentNameForLegacy(legacyName: string): string {
  if (legacyName.startsWith("js-ce-") || legacyName.startsWith("js-ce:")) return legacyName
  if (legacyName === "js-report-bug-ce") return "js-ce-report-bug"
  if (legacyName.startsWith("js-")) return `js-ce-${legacyName.slice("js-".length)}`
  return legacyName
}

type Fingerprints = Map<string, string> // stale name -> current shipped description

let fingerprintsPromise: Promise<Fingerprints> | null = null

async function readDescription(skillMdPath: string): Promise<string | null> {
  try {
    const raw = await fs.readFile(skillMdPath, "utf8")
    const { data } = parseFrontmatter(raw, skillMdPath)
    return typeof data.description === "string" ? data.description : null
  } catch {
    return null
  }
}

async function findRepoRoot(startDir: string): Promise<string | null> {
  let current = startDir
  while (true) {
    if (await pathExists(path.join(current, "plugins", FORK_PLUGIN_NAME))) return current
    const parent = path.dirname(current)
    if (parent === current) return null
    current = parent
  }
}

/**
 * Index every currently-shipped js-ce-* skill and agent by its description,
 * keyed by the *stale* name that maps to it. Agents are read directly from
 * their `.md` frontmatter; skills from `SKILL.md`. The current shipped
 * description is the ownership proof — a stale dir must match it exactly
 * (after normalization) to be considered ours.
 */
async function loadLegacyFingerprints(): Promise<Fingerprints> {
  if (!fingerprintsPromise) {
    fingerprintsPromise = (async () => {
      const fingerprints: Fingerprints = new Map()
      const repoRoot = await findRepoRoot(path.dirname(fileURLToPath(import.meta.url)))
      if (!repoRoot) return fingerprints

      const pluginRoot = path.join(repoRoot, "plugins", FORK_PLUGIN_NAME)
      const [skillDescByName, agentDescByName] = await Promise.all([
        buildSkillDescriptionIndex(path.join(pluginRoot, "skills")),
        buildAgentDescriptionIndex(path.join(pluginRoot, "agents")),
      ])

      const allStaleNames = new Set([...STALE_SKILL_DIRS, ...STALE_AGENT_NAMES])
      for (const staleName of allStaleNames) {
        const currentName = currentNameForLegacy(staleName)
        const description = skillDescByName.get(currentName) ?? agentDescByName.get(currentName)
        // Removed skills (e.g. js-dspy-python) have no current description, so
        // they get no fingerprint and are never auto-removed — the safe default.
        if (description) fingerprints.set(staleName, description)
      }
      return fingerprints
    })()
  }
  return fingerprintsPromise
}

async function buildSkillDescriptionIndex(skillsRoot: string): Promise<Map<string, string>> {
  const index = new Map<string, string>()
  let entries: import("fs").Dirent[]
  try {
    entries = await fs.readdir(skillsRoot, { withFileTypes: true })
  } catch {
    return index
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const description = await readDescription(path.join(skillsRoot, entry.name, "SKILL.md"))
    if (description) index.set(entry.name, description)
  }
  return index
}

async function buildAgentDescriptionIndex(agentsRoot: string): Promise<Map<string, string>> {
  const index = new Map<string, string>()
  const stack = [agentsRoot]
  while (stack.length > 0) {
    const dir = stack.pop()!
    let entries: import("fs").Dirent[]
    try {
      entries = await fs.readdir(dir, { withFileTypes: true })
    } catch {
      continue
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        stack.push(full)
        continue
      }
      if (entry.isFile() && entry.name.endsWith(".md")) {
        const raw = await fs.readFile(full, "utf8").catch(() => null)
        if (!raw) continue
        const { data } = parseFrontmatter(raw, full)
        const name = typeof data.name === "string" ? data.name : path.basename(entry.name, ".md")
        const description = typeof data.description === "string" ? data.description : null
        if (description) index.set(name, description)
      }
    }
  }
  return index
}

function normalizeDescription(value: string): string {
  return value.trim().replace(/\s+/g, " ")
}

function descriptionsMatch(actual: string | null, expected: string | undefined): boolean {
  if (!actual || !expected) return false
  return normalizeDescription(actual) === normalizeDescription(expected)
}

/**
 * Ownership gate for a stale-named skill dir: it is CE-owned only when its
 * `SKILL.md description:` matches the current shipped description for the name.
 */
async function isCeOwnedSkillDir(skillDir: string, expectedDescription: string | undefined): Promise<boolean> {
  if (!expectedDescription) return false
  const actual = await readDescription(path.join(skillDir, "SKILL.md"))
  return descriptionsMatch(actual, expectedDescription)
}

/**
 * Move CE-owned stale skill dirs under `skillsRoot` into a timestamped
 * `legacy-backup/` and return how many were backed up. Idempotent — once moved,
 * the dir no longer exists so a second run is a no-op. Stale-named dirs that are
 * NOT CE-owned (user-authored same-named skills) are left untouched.
 */
export async function cleanupStaleSkillDirs(
  skillsRoot: string,
  pluginName: string = FORK_PLUGIN_NAME,
): Promise<number> {
  if (pluginName !== FORK_PLUGIN_NAME) return 0
  if (!(await pathExists(skillsRoot))) return 0

  const fingerprints = await loadLegacyFingerprints()
  const managedDir = path.join(skillsRoot, pluginName)
  let moved = 0

  for (const name of STALE_SKILL_DIRS) {
    const skillDir = path.join(skillsRoot, name)
    if (!(await pathExists(skillDir))) continue
    if (!(await isCeOwnedSkillDir(skillDir, fingerprints.get(name)))) continue
    await moveLegacyArtifactToBackup(managedDir, "skills", skillsRoot, name, "skill")
    moved += 1
  }

  return moved
}
