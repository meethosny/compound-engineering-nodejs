import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"
import os from "os"
import { cleanupStaleSkillDirs } from "../src/utils/legacy-cleanup"
import { parseFrontmatter } from "../src/utils/frontmatter"

const repoRoot = path.resolve(import.meta.dir, "..")
const pluginSkills = path.join(repoRoot, "plugins", "js-compound-engineering", "skills")
const pluginAgents = path.join(repoRoot, "plugins", "js-compound-engineering", "agents")

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

/** Read the current shipped description for a js-ce-* skill (by dir name). */
async function currentSkillDescription(skillDir: string): Promise<string> {
  const raw = await fs.readFile(path.join(pluginSkills, skillDir, "SKILL.md"), "utf8")
  const { data } = parseFrontmatter(raw)
  return data.description as string
}

/** Read the current shipped description for a js-ce-* agent (by frontmatter name). */
async function currentAgentDescription(agentName: string): Promise<string> {
  const stack = [pluginAgents]
  while (stack.length > 0) {
    const dir = stack.pop()!
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        stack.push(full)
        continue
      }
      if (entry.isFile() && entry.name.endsWith(".md")) {
        const { data } = parseFrontmatter(await fs.readFile(full, "utf8"))
        if (data.name === agentName) return data.description as string
      }
    }
  }
  throw new Error(`agent not found: ${agentName}`)
}

async function writeSkillDir(skillsRoot: string, name: string, description: string): Promise<string> {
  const dir = path.join(skillsRoot, name)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(
    path.join(dir, "SKILL.md"),
    `---\nname: ${name}\ndescription: ${JSON.stringify(description)}\n---\n\nbody\n`,
    "utf8",
  )
  return dir
}

async function findBackup(skillsRoot: string, name: string): Promise<boolean> {
  const backupRoot = path.join(skillsRoot, "js-compound-engineering", "legacy-backup")
  if (!(await exists(backupRoot))) return false
  for (const ts of await fs.readdir(backupRoot)) {
    if (await exists(path.join(backupRoot, ts, "skills", name, "SKILL.md"))) return true
  }
  return false
}

describe("cleanupStaleSkillDirs", () => {
  test("moves a stale js-* skill dir with a matching current CE description to legacy-backup", async () => {
    const skillsRoot = await fs.mkdtemp(path.join(os.tmpdir(), "cleanup-owned-"))
    const desc = await currentSkillDescription("js-ce-proof")
    await writeSkillDir(skillsRoot, "js-proof", desc)

    const moved = await cleanupStaleSkillDirs(skillsRoot)

    expect(moved).toBe(1)
    expect(await exists(path.join(skillsRoot, "js-proof"))).toBe(false)
    expect(await findBackup(skillsRoot, "js-proof")).toBe(true)
  })

  test("moves a stale agent-as-skill dir when its description matches the current CE agent", async () => {
    const skillsRoot = await fs.mkdtemp(path.join(os.tmpdir(), "cleanup-agent-"))
    const desc = await currentAgentDescription("js-ce-learnings-researcher")
    await writeSkillDir(skillsRoot, "js-learnings-researcher", desc)

    const moved = await cleanupStaleSkillDirs(skillsRoot)

    expect(moved).toBe(1)
    expect(await exists(path.join(skillsRoot, "js-learnings-researcher"))).toBe(false)
    expect(await findBackup(skillsRoot, "js-learnings-researcher")).toBe(true)
  })

  test("leaves a stale-named dir with a NON-matching (user-authored) description untouched", async () => {
    const skillsRoot = await fs.mkdtemp(path.join(os.tmpdir(), "cleanup-foreign-"))
    await writeSkillDir(skillsRoot, "js-proof", "My own personal proofreading helper — not CE's.")

    const moved = await cleanupStaleSkillDirs(skillsRoot)

    expect(moved).toBe(0)
    expect(await exists(path.join(skillsRoot, "js-proof", "SKILL.md"))).toBe(true)
    expect(await findBackup(skillsRoot, "js-proof")).toBe(false)
  })

  test("is idempotent: a second run is a no-op", async () => {
    const skillsRoot = await fs.mkdtemp(path.join(os.tmpdir(), "cleanup-idem-"))
    const desc = await currentSkillDescription("js-ce-proof")
    await writeSkillDir(skillsRoot, "js-proof", desc)

    expect(await cleanupStaleSkillDirs(skillsRoot)).toBe(1)
    expect(await cleanupStaleSkillDirs(skillsRoot)).toBe(0)
  })

  test("never touches a current js-ce-* skill dir", async () => {
    const skillsRoot = await fs.mkdtemp(path.join(os.tmpdir(), "cleanup-current-"))
    const desc = await currentSkillDescription("js-ce-proof")
    await writeSkillDir(skillsRoot, "js-ce-proof", desc)

    const moved = await cleanupStaleSkillDirs(skillsRoot)

    expect(moved).toBe(0)
    expect(await exists(path.join(skillsRoot, "js-ce-proof", "SKILL.md"))).toBe(true)
  })
})
