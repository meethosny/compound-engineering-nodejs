import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"
import os from "os"
import { writeAntigravityBundle } from "../src/targets/antigravity"
import type { AntigravityBundle } from "../src/types/antigravity"

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

// Redirect HOME so the global ~/.gemini/config/mcp_config.json write lands in a
// temp dir during project-scope tests.
let homeBackup: string | undefined
let fakeHome: string

beforeEach(async () => {
  homeBackup = process.env.HOME
  fakeHome = await fs.mkdtemp(path.join(os.tmpdir(), "antigravity-home-"))
  process.env.HOME = fakeHome
})

afterEach(() => {
  if (homeBackup === undefined) {
    delete process.env.HOME
  } else {
    process.env.HOME = homeBackup
  }
})

describe("writeAntigravityBundle (project scope)", () => {
  test("writes .agents/skills (plural), .agent workflows, rules, AGENTS.md and global mcp_config.json", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "antigravity-proj-"))
    const bundle: AntigravityBundle = {
      generatedSkills: [
        { name: "security-reviewer", content: "---\nname: security-reviewer\ndescription: Security\n---\n\nReview code." },
      ],
      skillDirs: [
        { name: "skill-one", sourceDir: path.join(import.meta.dir, "fixtures", "sample-plugin", "skills", "skill-one") },
      ],
      workflows: [
        { name: "plan", content: "---\ndescription: Plan\n---\n\n## Steps\n\n1. Plan the work." },
      ],
      rules: [
        { name: "compound-engineering", content: "# Rules\n\nFollow these." },
      ],
      mcpServers: {
        playwright: { command: "npx", args: ["-y", "@anthropic/mcp-playwright"] },
        remote: { serverUrl: "https://example.com/mcp" },
      },
    }

    await writeAntigravityBundle(tempRoot, bundle, "workspace")

    // Skills use the cross-tool `.agents/skills/` (plural) open-standard path.
    expect(await exists(path.join(tempRoot, ".agents", "skills", "security-reviewer", "SKILL.md"))).toBe(true)
    expect(await exists(path.join(tempRoot, ".agents", "skills", "skill-one", "SKILL.md"))).toBe(true)
    // Skills are NOT written under the singular .agent/skills path.
    expect(await exists(path.join(tempRoot, ".agent", "skills"))).toBe(false)
    expect(await exists(path.join(tempRoot, ".agent", "workflows", "plan.md"))).toBe(true)
    expect(await exists(path.join(tempRoot, ".agent", "rules", "compound-engineering.md"))).toBe(true)
    expect(await exists(path.join(tempRoot, "AGENTS.md"))).toBe(true)

    const index = await fs.readFile(path.join(tempRoot, "AGENTS.md"), "utf8")
    expect(index).toContain("security-reviewer")
    expect(index).toContain("skill-one")
    expect(index).toContain("plan")

    // MCP config is global (~/.gemini/config/mcp_config.json), not project-local.
    const mcpPath = path.join(fakeHome, ".gemini", "config", "mcp_config.json")
    expect(await exists(mcpPath)).toBe(true)
    const mcp = JSON.parse(await fs.readFile(mcpPath, "utf8"))
    expect(mcp.mcpServers.playwright.command).toBe("npx")
    expect(mcp.mcpServers.remote.serverUrl).toBe("https://example.com/mcp")
  })

  test("transforms Task calls in copied pass-through SKILL.md files", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "antigravity-transform-"))
    const sourceSkillDir = path.join(tempRoot, "source-skill")
    await fs.mkdir(sourceSkillDir, { recursive: true })
    await fs.writeFile(
      path.join(sourceSkillDir, "SKILL.md"),
      `---
name: ce:plan
description: Planning workflow
---

Run these:

- Task js-compound-engineering:research:repo-research-analyst(feature_description)
- Read .claude/settings.json
`,
    )

    const bundle: AntigravityBundle = {
      generatedSkills: [],
      skillDirs: [{ name: "js-ce:plan", sourceDir: sourceSkillDir }],
      workflows: [],
      rules: [],
    }

    await writeAntigravityBundle(tempRoot, bundle, "workspace")

    const installed = await fs.readFile(
      path.join(tempRoot, ".agents", "skills", "js-ce-plan", "SKILL.md"),
      "utf8",
    )
    expect(installed).toContain("Use the repo-research-analyst skill to: feature_description")
    expect(installed).toContain(".agent/settings.json")
    expect(installed).not.toContain("Task js-compound-engineering:")
  })

  test("namespaced workflows create subdirectories", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "antigravity-ns-"))
    const bundle: AntigravityBundle = {
      generatedSkills: [],
      skillDirs: [],
      workflows: [{ name: "workflows/plan", content: "---\ndescription: Plan\n---\n\n## Steps\n\n1. Plan." }],
      rules: [],
    }

    await writeAntigravityBundle(tempRoot, bundle, "workspace")
    expect(await exists(path.join(tempRoot, ".agent", "workflows", "workflows", "plan.md"))).toBe(true)
  })

  test("deep-merges mcp_config.json without clobbering existing entries", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "antigravity-mcp-merge-"))
    const mcpPath = path.join(fakeHome, ".gemini", "config", "mcp_config.json")
    await fs.mkdir(path.dirname(mcpPath), { recursive: true })
    await fs.writeFile(mcpPath, JSON.stringify({
      someUserKey: true,
      mcpServers: { existing: { command: "old-cmd" } },
    }))

    const bundle: AntigravityBundle = {
      generatedSkills: [],
      skillDirs: [],
      workflows: [],
      rules: [],
      mcpServers: { fresh: { command: "new-cmd" } },
    }

    await writeAntigravityBundle(tempRoot, bundle, "workspace")

    const mcp = JSON.parse(await fs.readFile(mcpPath, "utf8"))
    expect(mcp.someUserKey).toBe(true)
    expect(mcp.mcpServers.existing.command).toBe("old-cmd")
    expect(mcp.mcpServers.fresh.command).toBe("new-cmd")

    // A backup of the pre-existing config should have been created.
    const files = await fs.readdir(path.dirname(mcpPath))
    expect(files.some((f) => f.startsWith("mcp_config.json.bak."))).toBe(true)
  })

  test("handles empty bundles gracefully", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "antigravity-empty-"))
    const bundle: AntigravityBundle = {
      generatedSkills: [],
      skillDirs: [],
      workflows: [],
      rules: [],
    }
    await writeAntigravityBundle(tempRoot, bundle, "workspace")
    expect(await exists(tempRoot)).toBe(true)
  })
})

describe("writeAntigravityBundle (global scope)", () => {
  test("writes skills to ~/.agents/skills and workflows/mcp under ~/.gemini", async () => {
    const geminiRoot = path.join(fakeHome, ".gemini")
    const bundle: AntigravityBundle = {
      generatedSkills: [{ name: "reviewer", content: "---\nname: reviewer\ndescription: r\n---\n\nReview." }],
      skillDirs: [],
      workflows: [{ name: "plan", content: "---\ndescription: Plan\n---\n\n## Steps\n\n1. Plan." }],
      rules: [],
      mcpServers: { local: { command: "echo" } },
    }

    await writeAntigravityBundle(geminiRoot, bundle, "global")

    // Skills land in the universal ~/.agents/skills/ (plural) location.
    expect(await exists(path.join(fakeHome, ".agents", "skills", "reviewer", "SKILL.md"))).toBe(true)
    // Not under the old ~/.gemini/antigravity/skills path.
    expect(await exists(path.join(geminiRoot, "antigravity", "skills"))).toBe(false)
    expect(await exists(path.join(geminiRoot, "antigravity", "global_workflows", "plan.md"))).toBe(true)
    expect(await exists(path.join(geminiRoot, "config", "mcp_config.json"))).toBe(true)
    // Should NOT double-nest under .gemini/.gemini
    expect(await exists(path.join(geminiRoot, ".gemini"))).toBe(false)
  })
})
