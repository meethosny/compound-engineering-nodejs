import { describe, expect, test } from "bun:test"
import {
  convertClaudeToAntigravity,
  toWorkflowMarkdown,
  transformContentForAntigravity,
} from "../src/converters/claude-to-antigravity"
import { parseFrontmatter } from "../src/utils/frontmatter"
import type { ClaudePlugin } from "../src/types/claude"

const OPTIONS = {
  agentMode: "subagent" as const,
  inferTemperature: false,
  permissions: "none" as const,
}

const fixturePlugin: ClaudePlugin = {
  root: "/tmp/plugin",
  manifest: { name: "fixture", version: "1.0.0" },
  agents: [
    {
      name: "Security Reviewer",
      description: "Security-focused agent",
      capabilities: ["Threat modeling", "OWASP"],
      model: "claude-sonnet-4-20250514",
      body: "Focus on vulnerabilities.",
      sourcePath: "/tmp/plugin/agents/security-reviewer.md",
    },
  ],
  commands: [
    {
      name: "workflows:plan",
      description: "Planning command",
      argumentHint: "[FOCUS]",
      model: "inherit",
      allowedTools: ["Read"],
      body: "- Gather context\n- Draft the plan\n- Review with the team",
      sourcePath: "/tmp/plugin/commands/workflows/plan.md",
    },
  ],
  skills: [
    {
      name: "existing-skill",
      description: "Existing skill",
      sourceDir: "/tmp/plugin/skills/existing-skill",
      skillPath: "/tmp/plugin/skills/existing-skill/SKILL.md",
    },
  ],
  hooks: undefined,
  mcpServers: {
    local: { command: "echo", args: ["hello"] },
    remote: { url: "https://example.com/mcp" },
  },
}

describe("convertClaudeToAntigravity", () => {
  test("maps agents to skills with SKILL.md frontmatter", () => {
    const bundle = convertClaudeToAntigravity(fixturePlugin, OPTIONS)

    const skill = bundle.generatedSkills.find((s) => s.name === "security-reviewer")
    expect(skill).toBeDefined()
    const parsed = parseFrontmatter(skill!.content)
    expect(parsed.data.name).toBe("security-reviewer")
    expect(parsed.data.description).toBe("Security-focused agent")
    expect(parsed.body).toContain("Focus on vulnerabilities.")
  })

  test("agent capabilities prepended to skill body", () => {
    const bundle = convertClaudeToAntigravity(fixturePlugin, OPTIONS)
    const skill = bundle.generatedSkills.find((s) => s.name === "security-reviewer")
    const parsed = parseFrontmatter(skill!.content)
    expect(parsed.body).toContain("## Capabilities")
    expect(parsed.body).toContain("- Threat modeling")
    expect(parsed.body).toContain("- OWASP")
  })

  test("agent model field is dropped", () => {
    const bundle = convertClaudeToAntigravity(fixturePlugin, OPTIONS)
    const skill = bundle.generatedSkills.find((s) => s.name === "security-reviewer")
    const parsed = parseFrontmatter(skill!.content)
    expect(parsed.data.model).toBeUndefined()
  })

  test("agent with empty description gets default description", () => {
    const plugin: ClaudePlugin = {
      ...fixturePlugin,
      agents: [{ name: "my-agent", body: "Do things.", sourcePath: "/tmp/plugin/agents/my-agent.md" }],
      commands: [],
      skills: [],
    }
    const bundle = convertClaudeToAntigravity(plugin, OPTIONS)
    const parsed = parseFrontmatter(bundle.generatedSkills[0].content)
    expect(parsed.data.description).toBe("Use this skill for my-agent tasks")
  })

  test("skills pass through 1:1 as directory references", () => {
    const bundle = convertClaudeToAntigravity(fixturePlugin, OPTIONS)
    expect(bundle.skillDirs).toHaveLength(1)
    expect(bundle.skillDirs[0].name).toBe("existing-skill")
    expect(bundle.skillDirs[0].sourceDir).toBe("/tmp/plugin/skills/existing-skill")
  })

  test("agent name colliding with skill name is deduplicated", () => {
    const plugin: ClaudePlugin = {
      ...fixturePlugin,
      skills: [{ name: "security-reviewer", description: "Existing skill", sourceDir: "/tmp/skill", skillPath: "/tmp/skill/SKILL.md" }],
      agents: [{ name: "Security Reviewer", description: "Agent version", body: "Body.", sourcePath: "/tmp/agents/sr.md" }],
      commands: [],
    }
    const bundle = convertClaudeToAntigravity(plugin, OPTIONS)
    expect(bundle.generatedSkills[0].name).toBe("security-reviewer-2")
    expect(bundle.skillDirs[0].name).toBe("security-reviewer")
  })

  test("commands convert to markdown workflows (not TOML)", () => {
    const bundle = convertClaudeToAntigravity(fixturePlugin, OPTIONS)
    expect(bundle.workflows).toHaveLength(1)
    const workflow = bundle.workflows[0]
    expect(workflow.name).toBe("workflows/plan")

    // Markdown YAML frontmatter, not TOML
    expect(workflow.content.startsWith("---")).toBe(true)
    expect(workflow.content).toContain("description: Planning command")
    expect(workflow.content).not.toContain("prompt = ")
    expect(workflow.content).not.toContain('"""')

    // Numbered markdown steps
    expect(workflow.content).toContain("## Steps")
    expect(workflow.content).toContain("1. Gather context")
    expect(workflow.content).toContain("2. Draft the plan")
    expect(workflow.content).toContain("3. Review with the team")
  })

  test("command with argument-hint gets {{args}} placeholder", () => {
    const bundle = convertClaudeToAntigravity(fixturePlugin, OPTIONS)
    expect(bundle.workflows[0].content).toContain("{{args}}")
  })

  test("MCP stdio server keeps command/args/env", () => {
    const bundle = convertClaudeToAntigravity(fixturePlugin, OPTIONS)
    expect(bundle.mcpServers?.local?.command).toBe("echo")
    expect(bundle.mcpServers?.local?.args).toEqual(["hello"])
  })

  test("MCP remote server uses serverUrl, not url/httpUrl", () => {
    const bundle = convertClaudeToAntigravity(fixturePlugin, OPTIONS)
    const remote = bundle.mcpServers?.remote as Record<string, unknown>
    expect(remote.serverUrl).toBe("https://example.com/mcp")
    expect(remote.url).toBeUndefined()
    expect("httpUrl" in remote).toBe(false)
  })

  test("plugin with zero agents produces empty generatedSkills", () => {
    const plugin: ClaudePlugin = { ...fixturePlugin, agents: [], commands: [], skills: [] }
    const bundle = convertClaudeToAntigravity(plugin, OPTIONS)
    expect(bundle.generatedSkills).toHaveLength(0)
  })

  test("hooks present emits console.warn", () => {
    const warnings: string[] = []
    const originalWarn = console.warn
    console.warn = (msg: string) => warnings.push(msg)

    const plugin: ClaudePlugin = {
      ...fixturePlugin,
      hooks: { hooks: { PreToolUse: [{ matcher: "*", hooks: [{ type: "command", command: "echo" }] }] } },
      agents: [],
      commands: [],
      skills: [],
    }
    convertClaudeToAntigravity(plugin, OPTIONS)

    console.warn = originalWarn
    expect(warnings.some((w) => w.includes("Antigravity"))).toBe(true)
  })
})

describe("transformContentForAntigravity", () => {
  test("rewrites project .claude/ paths to .agent/", () => {
    const result = transformContentForAntigravity("Read .claude/settings.json for config.")
    expect(result).toContain(".agent/settings.json")
    expect(result).not.toContain(".claude/")
  })

  test("rewrites global ~/.claude/ paths to ~/.gemini/", () => {
    const result = transformContentForAntigravity("Check ~/.claude/config for settings.")
    expect(result).toContain("~/.gemini/config")
    expect(result).not.toContain("~/.claude/")
  })

  test("rewrites Task agent(args) to natural-language skill reference", () => {
    const input = `- Task js-compound-engineering:research:repo-research-analyst(feature_description)`
    const result = transformContentForAntigravity(input)
    expect(result).toContain("Use the repo-research-analyst skill to: feature_description")
    expect(result).not.toContain("js-compound-engineering:")
  })

  test("rewrites zero-arg Task calls", () => {
    const result = transformContentForAntigravity("- Task js-compound-engineering:review:code-simplicity-reviewer()")
    expect(result).toContain("Use the code-simplicity-reviewer skill")
    expect(result).not.toContain("skill to:")
  })

  test("rewrites @agent references to skill references", () => {
    const result = transformContentForAntigravity("Ask @security-sentinel for a review.")
    expect(result).toContain("the security-sentinel skill")
    expect(result).not.toContain("@security-sentinel")
  })
})

describe("toWorkflowMarkdown", () => {
  test("produces markdown frontmatter and numbered steps", () => {
    const result = toWorkflowMarkdown("A description", "- step a\n- step b")
    expect(result).toContain("description: A description")
    expect(result).toContain("## Steps")
    expect(result).toContain("1. step a")
    expect(result).toContain("2. step b")
    expect(result).not.toContain('"""')
  })

  test("treats prose without list markers as a single step", () => {
    const result = toWorkflowMarkdown("Desc", "Just do the thing.")
    expect(result).toContain("1. Just do the thing.")
  })
})
