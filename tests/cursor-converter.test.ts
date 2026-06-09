import { mkdtempSync, rmSync, writeFileSync } from "fs"
import os from "os"
import path from "path"
import { describe, expect, test } from "bun:test"
import { convertClaudeToCursor, transformContentForCursor } from "../src/converters/claude-to-cursor"
import { parseFrontmatter } from "../src/utils/frontmatter"
import type { ClaudePlugin } from "../src/types/claude"

const fixturePlugin: ClaudePlugin = {
  root: "/tmp/cursor-plugin-nonexistent",
  manifest: { name: "fixture", version: "1.0.0" },
  agents: [
    {
      name: "Security Reviewer",
      description: "Security-focused agent",
      capabilities: ["Threat modeling", "OWASP"],
      model: "claude-sonnet-4-20250514",
      body: "Focus on vulnerabilities.",
      // Tools allowlist is dropped by Cursor (no per-agent tools support).
      tools: ["Read", "Grep", "Bash"],
      sourcePath: "/tmp/cursor-plugin-nonexistent/agents/security-reviewer.md",
    } as any,
  ],
  commands: [
    {
      name: "workflows:plan",
      description: "Planning command",
      argumentHint: "[FOCUS]",
      model: "inherit",
      allowedTools: ["Read"],
      body: "Plan the work.",
      sourcePath: "/tmp/cursor-plugin-nonexistent/commands/workflows/plan.md",
    },
  ],
  skills: [
    {
      name: "existing-skill",
      description: "Existing skill",
      sourceDir: "/tmp/cursor-plugin-nonexistent/skills/existing-skill",
      skillPath: "/tmp/cursor-plugin-nonexistent/skills/existing-skill/SKILL.md",
    },
  ],
  hooks: undefined,
  mcpServers: {
    local: { command: "echo", args: ["hello"], env: { TOKEN: "x" } },
  },
}

const defaultOptions = {
  agentMode: "subagent" as const,
  inferTemperature: false,
  permissions: "none" as const,
}

describe("convertClaudeToCursor", () => {
  test("converts agents to md + YAML frontmatter with model: inherit", () => {
    const bundle = convertClaudeToCursor(fixturePlugin, defaultOptions)
    const agent = bundle.agents.find((a) => a.name === "security-reviewer")
    expect(agent).toBeDefined()

    const parsed = parseFrontmatter(agent!.content)
    expect(parsed.data.name).toBe("security-reviewer")
    expect(parsed.data.description).toBe("Security-focused agent")
    expect(parsed.data.model).toBe("inherit")
    expect(parsed.body).toContain("Focus on vulnerabilities.")
  })

  test("drops agent tools allowlist and records a warning", () => {
    const bundle = convertClaudeToCursor(fixturePlugin, defaultOptions)
    const agent = bundle.agents.find((a) => a.name === "security-reviewer")!

    // No tools allowlist field should survive into the agent frontmatter.
    const parsed = parseFrontmatter(agent.content)
    expect(parsed.data.tools).toBeUndefined()
    expect(agent.content).not.toContain("tools:")

    // A warning must be recorded mentioning the agent and dropped tools.
    expect(
      bundle.warnings.some(
        (w) => w.includes("Security Reviewer") && w.toLowerCase().includes("tool"),
      ),
    ).toBe(true)
  })

  test("read-only agent (no mutating tools) is marked readonly", () => {
    const plugin: ClaudePlugin = {
      ...fixturePlugin,
      agents: [
        {
          name: "Read Only",
          description: "Inspects code",
          body: "Inspect things.",
          tools: ["Read", "Grep", "Glob"],
          sourcePath: "/tmp/cursor-plugin-nonexistent/agents/read-only.md",
        } as any,
      ],
      commands: [],
      skills: [],
    }
    const bundle = convertClaudeToCursor(plugin, defaultOptions)
    const parsed = parseFrontmatter(bundle.agents[0].content)
    expect(parsed.data.readonly).toBe(true)
  })

  test("agent with mutating tools is NOT marked readonly", () => {
    const bundle = convertClaudeToCursor(fixturePlugin, defaultOptions)
    const agent = bundle.agents.find((a) => a.name === "security-reviewer")!
    const parsed = parseFrontmatter(agent.content)
    // Bash is a mutating tool, so readonly must not be set.
    expect(parsed.data.readonly).toBeUndefined()
  })

  test("agent capabilities are prepended to the body", () => {
    const bundle = convertClaudeToCursor(fixturePlugin, defaultOptions)
    const agent = bundle.agents.find((a) => a.name === "security-reviewer")!
    expect(agent.content).toContain("## Capabilities")
    expect(agent.content).toContain("- Threat modeling")
    expect(agent.content).toContain("- OWASP")
  })

  test("agent with empty description gets a default description", () => {
    const plugin: ClaudePlugin = {
      ...fixturePlugin,
      agents: [
        { name: "my-agent", body: "Do things.", sourcePath: "/tmp/x/agents/my-agent.md" },
      ],
      commands: [],
      skills: [],
    }
    const bundle = convertClaudeToCursor(plugin, defaultOptions)
    const parsed = parseFrontmatter(bundle.agents[0].content)
    expect(parsed.data.description).toBe("Use this agent for my-agent tasks")
  })

  test("commands route to Cursor skills (SKILL.md with frontmatter)", () => {
    const bundle = convertClaudeToCursor(fixturePlugin, defaultOptions)
    expect(bundle.generatedSkills).toHaveLength(1)
    const skill = bundle.generatedSkills[0]
    expect(skill.name).toBe("workflows-plan")
    const parsed = parseFrontmatter(skill.content)
    expect(parsed.data.name).toBe("workflows-plan")
    expect(parsed.data.description).toBe("Planning command")
    expect(parsed.body).toContain("Plan the work.")
  })

  test("command allowedTools is not emitted into the skill", () => {
    const bundle = convertClaudeToCursor(fixturePlugin, defaultOptions)
    expect(bundle.generatedSkills[0].content).not.toContain("allowedTools")
  })

  test("skills pass through 1:1 as directory references", () => {
    const bundle = convertClaudeToCursor(fixturePlugin, defaultOptions)
    expect(bundle.skillDirs).toHaveLength(1)
    expect(bundle.skillDirs[0].name).toBe("existing-skill")
    expect(bundle.skillDirs[0].sourceDir).toBe("/tmp/cursor-plugin-nonexistent/skills/existing-skill")
  })

  test("skill name colliding with command name: command gets deduplicated", () => {
    const plugin: ClaudePlugin = {
      ...fixturePlugin,
      agents: [],
      skills: [{ name: "my-command", description: "Existing skill", sourceDir: "/tmp/skill", skillPath: "/tmp/skill/SKILL.md" }],
      commands: [{ name: "my-command", description: "A command", body: "Body.", sourcePath: "/tmp/commands/cmd.md" }],
    }
    const bundle = convertClaudeToCursor(plugin, defaultOptions)
    expect(bundle.skillDirs[0].name).toBe("my-command")
    expect(bundle.generatedSkills[0].name).toBe("my-command-2")
  })

  test("MCP stdio servers get type: stdio with command/args/env", () => {
    const bundle = convertClaudeToCursor(fixturePlugin, defaultOptions)
    expect(bundle.mcpServers.local.type).toBe("stdio")
    expect(bundle.mcpServers.local.command).toBe("echo")
    expect(bundle.mcpServers.local.args).toEqual(["hello"])
    expect(bundle.mcpServers.local.env).toEqual({ TOKEN: "x" })
  })

  test("MCP remote servers use url (no type/command)", () => {
    const plugin: ClaudePlugin = {
      ...fixturePlugin,
      agents: [],
      commands: [],
      skills: [],
      mcpServers: { remote: { url: "https://example.com/mcp", headers: { Authorization: "Bearer x" } } },
    }
    const bundle = convertClaudeToCursor(plugin, defaultOptions)
    expect(bundle.mcpServers.remote.url).toBe("https://example.com/mcp")
    expect(bundle.mcpServers.remote.headers).toEqual({ Authorization: "Bearer x" })
    expect(bundle.mcpServers.remote.command).toBeUndefined()
    expect(bundle.mcpServers.remote.type).toBeUndefined()
  })

  test("MCP server with neither command nor url is skipped with a warning", () => {
    const plugin: ClaudePlugin = {
      ...fixturePlugin,
      agents: [],
      commands: [],
      skills: [],
      mcpServers: { broken: {} as any },
    }
    const bundle = convertClaudeToCursor(plugin, defaultOptions)
    expect(Object.keys(bundle.mcpServers)).toHaveLength(0)
    expect(bundle.warnings.some((w) => w.includes("no command or url"))).toBe(true)
  })

  test("agentsMd is null when no instruction file exists", () => {
    const bundle = convertClaudeToCursor(fixturePlugin, defaultOptions)
    expect(bundle.agentsMd).toBeNull()
  })

  test("agentsMd is built from AGENTS.md, preferred over CLAUDE.md", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "cursor-agentsmd-"))
    writeFileSync(path.join(root, "AGENTS.md"), "# AGENTS\nUse AGENTS instructions. See .claude/config.")
    writeFileSync(path.join(root, "CLAUDE.md"), "# CLAUDE\nUse CLAUDE instructions.")

    const plugin: ClaudePlugin = { ...fixturePlugin, root, agents: [], commands: [], skills: [] }
    const bundle = convertClaudeToCursor(plugin, defaultOptions)
    rmSync(root, { recursive: true, force: true })

    expect(bundle.agentsMd).not.toBeNull()
    expect(bundle.agentsMd!).toContain("Use AGENTS instructions.")
    expect(bundle.agentsMd!).not.toContain("Use CLAUDE instructions.")
    // .claude/ paths are rewritten to .cursor/ in the shared context.
    expect(bundle.agentsMd!).toContain(".cursor/config")
  })

  test("hooks present records a warning", () => {
    const plugin: ClaudePlugin = {
      ...fixturePlugin,
      agents: [],
      commands: [],
      skills: [],
      hooks: { hooks: { PreToolUse: [{ matcher: "*", hooks: [{ type: "command", command: "echo test" }] }] } },
    }
    const bundle = convertClaudeToCursor(plugin, defaultOptions)
    expect(bundle.warnings.some((w) => w.toLowerCase().includes("hook"))).toBe(true)
  })

  test("empty plugin produces an empty bundle", () => {
    const plugin: ClaudePlugin = {
      root: "/tmp/empty-cursor",
      manifest: { name: "empty", version: "1.0.0" },
      agents: [],
      commands: [],
      skills: [],
    }
    const bundle = convertClaudeToCursor(plugin, defaultOptions)
    expect(bundle.agents).toHaveLength(0)
    expect(bundle.generatedSkills).toHaveLength(0)
    expect(bundle.skillDirs).toHaveLength(0)
    expect(Object.keys(bundle.mcpServers)).toHaveLength(0)
    expect(bundle.agentsMd).toBeNull()
  })
})

describe("transformContentForCursor", () => {
  test("rewrites .claude/ paths to .cursor/", () => {
    const result = transformContentForCursor("Read .claude/settings.json for config.")
    expect(result).toContain(".cursor/settings.json")
    expect(result).not.toContain(".claude/")
  })

  test("rewrites ~/.claude/ paths to ~/.cursor/", () => {
    const result = transformContentForCursor("Check ~/.claude/config for settings.")
    expect(result).toContain("~/.cursor/config")
    expect(result).not.toContain("~/.claude/")
  })

  test("transforms Task agent calls to a delegate instruction", () => {
    const result = transformContentForCursor("- Task js-ce:research:repo-research-analyst(feature_description)")
    expect(result).toContain("Delegate to the repo-research-analyst agent: feature_description")
    expect(result).not.toContain("Task js-ce:")
  })

  test("transforms slash command refs to skill activation", () => {
    const result = transformContentForCursor("Run /workflows:plan to start planning.")
    expect(result).toContain("the workflows-plan skill")
  })

  test("transforms @agent references only for known agent names", () => {
    const result = transformContentForCursor("Ask @security-reviewer and @unknown for help.", ["security-reviewer"])
    expect(result).toContain("the security-reviewer agent")
    expect(result).toContain("@unknown")
  })
})
