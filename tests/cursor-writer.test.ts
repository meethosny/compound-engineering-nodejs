import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"
import os from "os"
import { writeCursorBundle } from "../src/targets/cursor"
import type { CursorBundle } from "../src/types/cursor"

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

const emptyBundle: CursorBundle = {
  agents: [],
  skillDirs: [],
  generatedSkills: [],
  mcpServers: {},
  agentsMd: null,
  warnings: [],
}

describe("writeCursorBundle", () => {
  test("writes agents, skills, AGENTS.md, and mcp.json", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "cursor-test-"))
    const bundle: CursorBundle = {
      agents: [
        {
          name: "security-reviewer",
          content: "---\nname: security-reviewer\ndescription: Security-focused\nmodel: inherit\n---\n\nReview code.",
        },
      ],
      generatedSkills: [
        {
          name: "workflows-plan",
          content: "---\nname: workflows-plan\ndescription: Planning\n---\n\nPlan the work.",
        },
      ],
      skillDirs: [
        {
          name: "skill-one",
          sourceDir: path.join(import.meta.dir, "fixtures", "sample-plugin", "skills", "skill-one"),
        },
      ],
      mcpServers: {
        playwright: { type: "stdio", command: "npx", args: ["-y", "@anthropic/mcp-playwright"] },
      },
      agentsMd: "# Project context\n\nFollow these guidelines.",
      warnings: [],
    }

    await writeCursorBundle(tempRoot, bundle)

    // Agent file (md + frontmatter)
    const agentPath = path.join(tempRoot, ".cursor", "agents", "security-reviewer.md")
    expect(await exists(agentPath)).toBe(true)
    const agentContent = await fs.readFile(agentPath, "utf8")
    expect(agentContent).toContain("model: inherit")
    expect(agentContent).toContain("Review code.")

    // Generated skill (from command)
    const skillPath = path.join(tempRoot, ".cursor", "skills", "workflows-plan", "SKILL.md")
    expect(await exists(skillPath)).toBe(true)
    expect(await fs.readFile(skillPath, "utf8")).toContain("Plan the work.")

    // Copied skill (1:1)
    expect(await exists(path.join(tempRoot, ".cursor", "skills", "skill-one", "SKILL.md"))).toBe(true)

    // AGENTS.md at output root
    const agentsMdPath = path.join(tempRoot, "AGENTS.md")
    expect(await exists(agentsMdPath)).toBe(true)
    expect(await fs.readFile(agentsMdPath, "utf8")).toContain("Follow these guidelines.")

    // mcp.json
    const mcpPath = path.join(tempRoot, ".cursor", "mcp.json")
    expect(await exists(mcpPath)).toBe(true)
    const mcp = JSON.parse(await fs.readFile(mcpPath, "utf8"))
    expect(mcp.mcpServers.playwright.command).toBe("npx")
    expect(mcp.mcpServers.playwright.type).toBe("stdio")
  })

  test("does not double-nest when output root is .cursor", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "cursor-home-"))
    const cursorRoot = path.join(tempRoot, ".cursor")
    const bundle: CursorBundle = {
      ...emptyBundle,
      agents: [
        { name: "reviewer", content: "---\nname: reviewer\ndescription: A reviewer\nmodel: inherit\n---\n\nReview." },
      ],
      agentsMd: "# Context",
    }

    await writeCursorBundle(cursorRoot, bundle)

    expect(await exists(path.join(cursorRoot, "agents", "reviewer.md"))).toBe(true)
    // Should NOT double-nest under .cursor/.cursor
    expect(await exists(path.join(cursorRoot, ".cursor"))).toBe(false)
    // AGENTS.md is written one level up (the project root), not inside .cursor
    expect(await exists(path.join(tempRoot, "AGENTS.md"))).toBe(true)
  })

  test("handles empty bundles gracefully", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "cursor-empty-"))
    await writeCursorBundle(tempRoot, emptyBundle)
    expect(await exists(tempRoot)).toBe(true)
  })

  test("deep-merges mcp.json preserving user entries and other keys", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "cursor-merge-"))
    const cursorRoot = path.join(tempRoot, ".cursor")
    await fs.mkdir(cursorRoot, { recursive: true })

    const mcpPath = path.join(cursorRoot, "mcp.json")
    await fs.writeFile(mcpPath, JSON.stringify({
      someUserKey: "preserve-me",
      mcpServers: { userServer: { command: "user-cmd" } },
    }))

    const bundle: CursorBundle = {
      ...emptyBundle,
      mcpServers: { newServer: { type: "stdio", command: "new-cmd" } },
    }

    await writeCursorBundle(cursorRoot, bundle)

    const merged = JSON.parse(await fs.readFile(mcpPath, "utf8"))
    expect(merged.someUserKey).toBe("preserve-me")
    expect(merged.mcpServers.userServer.command).toBe("user-cmd")
    expect(merged.mcpServers.newServer.command).toBe("new-cmd")
  })

  test("backs up existing mcp.json before overwrite", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "cursor-backup-"))
    const cursorRoot = path.join(tempRoot, ".cursor")
    await fs.mkdir(cursorRoot, { recursive: true })

    const mcpPath = path.join(cursorRoot, "mcp.json")
    await fs.writeFile(mcpPath, JSON.stringify({ mcpServers: { old: { command: "old-cmd" } } }))

    const bundle: CursorBundle = {
      ...emptyBundle,
      mcpServers: { newServer: { type: "stdio", command: "new-cmd" } },
    }

    await writeCursorBundle(cursorRoot, bundle)

    const files = await fs.readdir(cursorRoot)
    expect(files.filter((f) => f.startsWith("mcp.json.bak.")).length).toBeGreaterThanOrEqual(1)
  })

  test("fresh mcp.json write when no existing file", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "cursor-fresh-"))
    const bundle: CursorBundle = {
      ...emptyBundle,
      mcpServers: { remote: { url: "https://example.com/mcp" } },
    }

    await writeCursorBundle(tempRoot, bundle)

    const mcpPath = path.join(tempRoot, ".cursor", "mcp.json")
    expect(await exists(mcpPath)).toBe(true)
    const content = JSON.parse(await fs.readFile(mcpPath, "utf8"))
    expect(content.mcpServers.remote.url).toBe("https://example.com/mcp")
  })

  test("transforms Task calls in copied SKILL.md files", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "cursor-skill-transform-"))
    const sourceSkillDir = path.join(tempRoot, "source-skill")
    await fs.mkdir(sourceSkillDir, { recursive: true })
    await fs.writeFile(
      path.join(sourceSkillDir, "SKILL.md"),
      `---
name: ce-plan
description: Planning workflow
---

- Task js-ce:research:repo-research-analyst(feature_description)
`,
    )

    const bundle: CursorBundle = {
      ...emptyBundle,
      skillDirs: [{ name: "ce-plan", sourceDir: sourceSkillDir }],
    }

    await writeCursorBundle(tempRoot, bundle)

    const installed = await fs.readFile(
      path.join(tempRoot, ".cursor", "skills", "ce-plan", "SKILL.md"),
      "utf8",
    )
    expect(installed).toContain("Delegate to the repo-research-analyst agent: feature_description")
    expect(installed).not.toContain("Task js-ce:")
  })

  test("path traversal in agent name is rejected", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "cursor-traversal-"))
    const bundle: CursorBundle = {
      ...emptyBundle,
      agents: [{ name: "../escape", content: "bad" }],
    }
    expect(writeCursorBundle(tempRoot, bundle)).rejects.toThrow("unsafe path")
  })

  test("path traversal in skill name is rejected", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "cursor-traversal2-"))
    const bundle: CursorBundle = {
      ...emptyBundle,
      generatedSkills: [{ name: "../escape", content: "bad" }],
    }
    expect(writeCursorBundle(tempRoot, bundle)).rejects.toThrow("unsafe path")
  })
})
