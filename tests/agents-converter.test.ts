import { describe, expect, test } from "bun:test"
import { convertClaudeToAgents } from "../src/converters/claude-to-agents"
import { parseFrontmatter } from "../src/utils/frontmatter"
import type { ClaudePlugin } from "../src/types/claude"

const OPTIONS = {
  agentMode: "subagent" as const,
  inferTemperature: false,
  permissions: "none" as const,
}

const fixturePlugin: ClaudePlugin = {
  root: "/tmp/agents-plugin-nonexistent",
  manifest: { name: "fixture", version: "1.0.0" },
  agents: [
    {
      name: "Security Reviewer",
      description: "Security-focused agent",
      capabilities: ["Threat modeling", "OWASP"],
      model: "claude-sonnet-4-20250514",
      body: "Focus on vulnerabilities.",
      sourcePath: "/tmp/agents-plugin-nonexistent/agents/security-reviewer.md",
    },
  ],
  commands: [
    {
      name: "workflows:plan",
      description: "Planning command",
      argumentHint: "[FOCUS]",
      model: "inherit",
      allowedTools: ["Read"],
      body: "Plan the work.",
      sourcePath: "/tmp/agents-plugin-nonexistent/commands/workflows/plan.md",
    },
  ],
  skills: [
    {
      name: "existing-skill",
      description: "Existing skill",
      sourceDir: "/tmp/agents-plugin-nonexistent/skills/existing-skill",
      skillPath: "/tmp/agents-plugin-nonexistent/skills/existing-skill/SKILL.md",
    },
  ],
  hooks: undefined,
  mcpServers: {
    local: { command: "echo", args: ["hello"] },
  },
}

describe("convertClaudeToAgents", () => {
  test("skills pass through 1:1 as directory references", () => {
    const bundle = convertClaudeToAgents(fixturePlugin, OPTIONS)
    expect(bundle.skillDirs).toHaveLength(1)
    expect(bundle.skillDirs[0].name).toBe("existing-skill")
    expect(bundle.skillDirs[0].sourceDir).toBe("/tmp/agents-plugin-nonexistent/skills/existing-skill")
  })

  test("agents convert to SKILL.md with name + description frontmatter", () => {
    const bundle = convertClaudeToAgents(fixturePlugin, OPTIONS)
    const skill = bundle.generatedSkills.find((s) => s.name === "security-reviewer")
    expect(skill).toBeDefined()
    const parsed = parseFrontmatter(skill!.content)
    expect(parsed.data.name).toBe("security-reviewer")
    expect(parsed.data.description).toBe("Security-focused agent")
    expect(parsed.body).toContain("Focus on vulnerabilities.")
    // The model field is dropped (skills have no model frontmatter).
    expect(parsed.data.model).toBeUndefined()
  })

  test("agent capabilities are prepended to the skill body", () => {
    const bundle = convertClaudeToAgents(fixturePlugin, OPTIONS)
    const skill = bundle.generatedSkills.find((s) => s.name === "security-reviewer")!
    expect(skill.content).toContain("## Capabilities")
    expect(skill.content).toContain("- Threat modeling")
    expect(skill.content).toContain("- OWASP")
  })

  test("commands convert to SKILL.md with name + description frontmatter", () => {
    const bundle = convertClaudeToAgents(fixturePlugin, OPTIONS)
    const skill = bundle.generatedSkills.find((s) => s.name === "workflows-plan")
    expect(skill).toBeDefined()
    const parsed = parseFrontmatter(skill!.content)
    expect(parsed.data.name).toBe("workflows-plan")
    expect(parsed.data.description).toBe("Planning command")
    expect(parsed.body).toContain("Plan the work.")
  })

  test("agent with empty description gets a default description", () => {
    const plugin: ClaudePlugin = {
      ...fixturePlugin,
      agents: [{ name: "my-agent", body: "Do things.", sourcePath: "/tmp/x/agents/my-agent.md" }],
      commands: [],
      skills: [],
      mcpServers: undefined,
    }
    const bundle = convertClaudeToAgents(plugin, OPTIONS)
    const parsed = parseFrontmatter(bundle.generatedSkills[0].content)
    expect(parsed.data.description).toBe("Use this skill for my-agent tasks")
  })

  test("agent and command names are deduplicated against pass-through skills", () => {
    const plugin: ClaudePlugin = {
      ...fixturePlugin,
      skills: [{ name: "security-reviewer", description: "Existing skill", sourceDir: "/tmp/skill", skillPath: "/tmp/skill/SKILL.md" }],
      agents: [{ name: "Security Reviewer", description: "Agent version", body: "Body.", sourcePath: "/tmp/agents/sr.md" }],
      commands: [{ name: "security-reviewer", description: "Command version", body: "Cmd.", sourcePath: "/tmp/commands/sr.md" }],
      mcpServers: undefined,
    }
    const bundle = convertClaudeToAgents(plugin, OPTIONS)
    expect(bundle.skillDirs[0].name).toBe("security-reviewer")
    const generatedNames = bundle.generatedSkills.map((s) => s.name)
    expect(generatedNames).toContain("security-reviewer-2")
    expect(generatedNames).toContain("security-reviewer-3")
  })

  test("Task calls and .claude/ paths are rewritten in skill bodies", () => {
    const plugin: ClaudePlugin = {
      ...fixturePlugin,
      agents: [],
      skills: [],
      commands: [
        {
          name: "plan",
          description: "Plan",
          body: "- Task js-ce:research:repo-research-analyst(feature)\n- Read .claude/settings.json",
          sourcePath: "/tmp/commands/plan.md",
        },
      ],
      mcpServers: undefined,
    }
    const bundle = convertClaudeToAgents(plugin, OPTIONS)
    const body = bundle.generatedSkills[0].content
    expect(body).toContain("Delegate to the repo-research-analyst agent: feature")
    expect(body).toContain(".cursor/settings.json")
    expect(body).not.toContain("Task js-ce:")
  })

  test("AGENTS.md indexes every available skill", () => {
    const bundle = convertClaudeToAgents(fixturePlugin, OPTIONS)
    expect(bundle.agentsMd).not.toBeNull()
    expect(bundle.agentsMd!).toContain("# Agent Skills")
    expect(bundle.agentsMd!).toContain("existing-skill")
    expect(bundle.agentsMd!).toContain("security-reviewer")
    expect(bundle.agentsMd!).toContain("workflows-plan")
    // Index links use the cross-tool `.agents/skills/` (plural) path.
    expect(bundle.agentsMd!).toContain(".agents/skills/existing-skill/SKILL.md")
  })

  test("MCP servers are skipped with a recorded warning", () => {
    const bundle = convertClaudeToAgents(fixturePlugin, OPTIONS)
    expect(
      bundle.warnings.some((w) => w.toLowerCase().includes("mcp") && w.toLowerCase().includes("per-tool")),
    ).toBe(true)
  })

  test("hooks present records a warning", () => {
    const plugin: ClaudePlugin = {
      ...fixturePlugin,
      agents: [],
      commands: [],
      skills: [],
      mcpServers: undefined,
      hooks: { hooks: { PreToolUse: [{ matcher: "*", hooks: [{ type: "command", command: "echo" }] }] } },
    }
    const bundle = convertClaudeToAgents(plugin, OPTIONS)
    expect(bundle.warnings.some((w) => w.toLowerCase().includes("hook"))).toBe(true)
  })

  test("empty plugin produces an empty bundle with no warnings", () => {
    const plugin: ClaudePlugin = {
      root: "/tmp/empty-agents",
      manifest: { name: "empty", version: "1.0.0" },
      agents: [],
      commands: [],
      skills: [],
    }
    const bundle = convertClaudeToAgents(plugin, OPTIONS)
    expect(bundle.skillDirs).toHaveLength(0)
    expect(bundle.generatedSkills).toHaveLength(0)
    expect(bundle.warnings).toHaveLength(0)
  })
})
