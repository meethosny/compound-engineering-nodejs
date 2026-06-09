import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"
import os from "os"
import { writeAgentsBundle } from "../src/targets/agents"
import type { AgentsBundle } from "../src/types/agents"

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

const emptyBundle: AgentsBundle = {
  skillDirs: [],
  generatedSkills: [],
  agentsMd: null,
  warnings: [],
}

describe("writeAgentsBundle (workspace scope)", () => {
  test("writes .agents/skills/<name>/SKILL.md and AGENTS.md at the root", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "agents-proj-"))
    const bundle: AgentsBundle = {
      generatedSkills: [
        { name: "security-reviewer", content: "---\nname: security-reviewer\ndescription: Security\n---\n\nReview code." },
        { name: "workflows-plan", content: "---\nname: workflows-plan\ndescription: Planning\n---\n\nPlan the work." },
      ],
      skillDirs: [
        { name: "skill-one", sourceDir: path.join(import.meta.dir, "fixtures", "sample-plugin", "skills", "skill-one") },
      ],
      agentsMd: "# Agent Skills\n\n## Skills\n\n- [`skill-one`](.agents/skills/skill-one/SKILL.md)",
      warnings: [],
    }

    await writeAgentsBundle(tempRoot, bundle, "workspace")

    // Generated skills (agents + commands as skills)
    expect(await exists(path.join(tempRoot, ".agents", "skills", "security-reviewer", "SKILL.md"))).toBe(true)
    expect(await exists(path.join(tempRoot, ".agents", "skills", "workflows-plan", "SKILL.md"))).toBe(true)
    // Pass-through skill dir copied 1:1
    expect(await exists(path.join(tempRoot, ".agents", "skills", "skill-one", "SKILL.md"))).toBe(true)

    // AGENTS.md index at the project root
    const agentsMdPath = path.join(tempRoot, "AGENTS.md")
    expect(await exists(agentsMdPath)).toBe(true)
    expect(await fs.readFile(agentsMdPath, "utf8")).toContain(".agents/skills/skill-one/SKILL.md")

    // No MCP file is ever written.
    expect(await exists(path.join(tempRoot, ".agents", "mcp.json"))).toBe(false)
  })

  test("does not double-nest when output root is .agents", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "agents-direct-"))
    const agentsRoot = path.join(tempRoot, ".agents")
    const bundle: AgentsBundle = {
      ...emptyBundle,
      generatedSkills: [{ name: "reviewer", content: "---\nname: reviewer\ndescription: r\n---\n\nReview." }],
      agentsMd: "# Agent Skills",
    }

    await writeAgentsBundle(agentsRoot, bundle, "workspace")

    expect(await exists(path.join(agentsRoot, "skills", "reviewer", "SKILL.md"))).toBe(true)
    // Should NOT double-nest under .agents/.agents
    expect(await exists(path.join(agentsRoot, ".agents"))).toBe(false)
    // AGENTS.md written one level up (the project root)
    expect(await exists(path.join(tempRoot, "AGENTS.md"))).toBe(true)
  })

  test("transforms Task calls in copied pass-through SKILL.md files", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "agents-transform-"))
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

    const bundle: AgentsBundle = {
      ...emptyBundle,
      skillDirs: [{ name: "ce-plan", sourceDir: sourceSkillDir }],
    }

    await writeAgentsBundle(tempRoot, bundle, "workspace")

    const installed = await fs.readFile(
      path.join(tempRoot, ".agents", "skills", "ce-plan", "SKILL.md"),
      "utf8",
    )
    expect(installed).toContain("Delegate to the repo-research-analyst agent: feature_description")
    expect(installed).not.toContain("Task js-ce:")
  })

  test("path traversal in skill name is rejected", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "agents-traversal-"))
    const bundle: AgentsBundle = {
      ...emptyBundle,
      generatedSkills: [{ name: "../escape", content: "bad" }],
    }
    expect(writeAgentsBundle(tempRoot, bundle)).rejects.toThrow("unsafe path")
  })

  test("handles empty bundles gracefully", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "agents-empty-"))
    await writeAgentsBundle(tempRoot, emptyBundle, "workspace")
    expect(await exists(tempRoot)).toBe(true)
  })
})

describe("writeAgentsBundle (global scope)", () => {
  test("writes ~/.agents/skills and no AGENTS.md", async () => {
    const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), "agents-home-"))
    const agentsRoot = path.join(tempHome, ".agents")
    const bundle: AgentsBundle = {
      ...emptyBundle,
      generatedSkills: [{ name: "reviewer", content: "---\nname: reviewer\ndescription: r\n---\n\nReview." }],
      agentsMd: "# Agent Skills\n\n## Skills\n\n- [`reviewer`](.agents/skills/reviewer/SKILL.md)",
    }

    await writeAgentsBundle(agentsRoot, bundle, "global")

    expect(await exists(path.join(agentsRoot, "skills", "reviewer", "SKILL.md"))).toBe(true)
    // No standard ~/.agents/AGENTS.md location — index is skipped in global scope.
    expect(await exists(path.join(tempHome, "AGENTS.md"))).toBe(false)
    expect(await exists(path.join(agentsRoot, "AGENTS.md"))).toBe(false)
    // Should NOT double-nest under .agents/.agents
    expect(await exists(path.join(agentsRoot, ".agents"))).toBe(false)
  })
})
