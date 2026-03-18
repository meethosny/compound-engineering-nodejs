# Compound Marketplace (Node.js Edition)

[![Build Status](https://github.com/meethosny/compound-engineering-nodejs/actions/workflows/ci.yml/badge.svg)](https://github.com/meethosny/compound-engineering-nodejs/actions/workflows/ci.yml)

> **Node.js Developer Edition** — This fork is optimized for Node.js and TypeScript developers. All Ruby/Rails patterns replaced with Express, Fastify, Hono, and TypeScript equivalents.

A Claude Code plugin marketplace featuring the **Compounding Engineering Plugin (Node.js Edition)** — tools that make each unit of engineering work easier than the last.

## Claude Code Install

```bash
/plugin marketplace add meethosny/compound-engineering-nodejs
/plugin install js-compound-engineering
```

## Cursor Install

```text
/add-plugin js-compound-engineering
```

## Convert to Other AI Coding Tools (experimental)

This repo includes a Bun/TypeScript CLI that converts the Claude Code plugin to OpenCode, Codex, Factory Droid, Pi, Gemini CLI, GitHub Copilot, Kiro CLI, Windsurf, OpenClaw, and Qwen Code. No npm publishing needed — run directly from the repo.

### Quick Start

```bash
# clone the repo (if you haven't already)
git clone https://github.com/meethosny/compound-engineering-nodejs.git
cd compound-engineering-nodejs

# install dependencies
bun install
```

### Convert the Plugin

Use `bun run cli` to run any CLI command locally:

```bash
# convert to OpenCode format
bun run cli convert ./plugins/js-compound-engineering --to opencode

# convert to Codex format
bun run cli convert ./plugins/js-compound-engineering --to codex

# convert to Factory Droid format
bun run cli convert ./plugins/js-compound-engineering --to droid

# convert to Pi format
bun run cli convert ./plugins/js-compound-engineering --to pi

# convert to Gemini CLI format
bun run cli convert ./plugins/js-compound-engineering --to gemini

# convert to GitHub Copilot format
bun run cli convert ./plugins/js-compound-engineering --to copilot

# convert to Kiro CLI format
bun run cli convert ./plugins/js-compound-engineering --to kiro

# convert to OpenClaw format
bun run cli convert ./plugins/js-compound-engineering --to openclaw

# convert to Windsurf format (global scope by default)
bun run cli convert ./plugins/js-compound-engineering --to windsurf

# convert to Windsurf workspace scope
bun run cli convert ./plugins/js-compound-engineering --to windsurf --scope workspace

# convert to Qwen Code format
bun run cli convert ./plugins/js-compound-engineering --to qwen

# auto-detect installed tools and convert to all
bun run cli convert ./plugins/js-compound-engineering --to all
```

### Global Command (optional)

If you prefer a global `js-compound-plugin` command that works from any directory:

```bash
cd compound-engineering-nodejs
bun link

# now use from anywhere
js-compound-plugin convert /path/to/plugins/js-compound-engineering --to droid
```

### Local Development

When developing and testing local changes to the plugin:

**Claude Code** — add a shell alias so your local copy loads alongside your normal plugins:

```bash
# add to ~/.zshrc or ~/.bashrc
alias claude-dev-ce='claude --plugin-dir ~/code/compound-engineering-nodejs/plugins/js-compound-engineering'
```

Then run `claude-dev-ce` instead of `claude` to test your changes. Your production install stays untouched.

**Other targets** — use `convert` with a local path:

```bash
bun run cli convert ./plugins/js-compound-engineering --to codex
```

<details>
<summary>Output format details per target</summary>

| Target | Output path | Notes |
|--------|------------|-------|
| `opencode` | `~/.config/opencode/` | Commands as `.md` files; `opencode.json` MCP config deep-merged; backups made before overwriting |
| `codex` | `~/.codex/prompts` + `~/.agents/skills` | Each command becomes a prompt + skill pair; skills written to `~/.agents/skills/` where Codex discovers them; descriptions truncated to 1024 chars |
| `droid` | `~/.factory/` | Tool names mapped (`Bash`→`Execute`, `Write`→`Create`); namespace prefixes stripped |
| `pi` | `~/.pi/agent/` | Prompts, skills, extensions, and `mcporter.json` for MCPorter interoperability |
| `gemini` | `.gemini/` | Skills from agents; commands as `.toml`; namespaced commands become directories (`ce:plan` → `commands/ce/plan.toml`) |
| `copilot` | `.github/` | Agents as `.agent.md` with Copilot frontmatter; MCP env vars prefixed with `COPILOT_MCP_` |
| `kiro` | `.kiro/` | Agents as JSON configs + prompt `.md` files; only stdio MCP servers supported |
| `openclaw` | `~/.openclaw/extensions/<plugin>/` | Entry-point TypeScript skill file; `openclaw-extension.json` for MCP servers |
| `windsurf` | `~/.codeium/windsurf/` (global) or `.windsurf/` (workspace) | Agents become skills; commands become flat workflows; `mcp_config.json` merged |
| `qwen` | `~/.qwen/extensions/<plugin>/` | Agents as `.yaml`; env vars with placeholders extracted as settings; colon separator for nested commands |

All provider targets are experimental and may change as the formats evolve.

</details>

## Sync Personal Config

Sync your personal Claude Code config (`~/.claude/`) to other AI coding tools. Omit `--target` to sync to all detected supported tools automatically:

```bash
# Sync to all detected tools (default)
bun run cli sync

# Sync skills and MCP servers to OpenCode
bun run cli sync --target opencode

# Sync to Codex
bun run cli sync --target codex

# Sync to Pi
bun run cli sync --target pi

# Sync to Droid
bun run cli sync --target droid

# Sync to GitHub Copilot (skills + MCP servers)
bun run cli sync --target copilot

# Sync to Gemini (skills + MCP servers)
bun run cli sync --target gemini

# Sync to Windsurf
bun run cli sync --target windsurf

# Sync to Kiro
bun run cli sync --target kiro

# Sync to Qwen
bun run cli sync --target qwen

# Sync to OpenClaw (skills only; MCP is validation-gated)
bun run cli sync --target openclaw

# Sync to all detected tools
bun run cli sync --target all
```

This syncs:
- Personal skills from `~/.claude/skills/` (as symlinks)
- Personal slash commands from `~/.claude/commands/` (as provider-native prompts, workflows, or converted skills where supported)
- MCP servers from `~/.claude/settings.json`

Skills are symlinked (not copied) so changes in Claude Code are reflected immediately.

Supported sync targets:
- `opencode`
- `codex`
- `pi`
- `droid`
- `copilot`
- `gemini`
- `windsurf`
- `kiro`
- `qwen`
- `openclaw`

Notes:
- Codex sync preserves non-managed `config.toml` content and now includes remote MCP servers.
- Command sync reuses each provider's existing Claude command conversion, so some targets receive prompts or workflows while others receive converted skills.
- Copilot sync writes personal skills to `~/.copilot/skills/` and MCP config to `~/.copilot/mcp-config.json`.
- Gemini sync writes MCP config to `~/.gemini/` and avoids mirroring skills that Gemini already discovers from `~/.agents/skills`, which prevents duplicate-skill warnings.
- Droid, Windsurf, Kiro, and Qwen sync merge MCP servers into the provider's documented user config.
- OpenClaw currently syncs skills only.

## Workflow

```
Brainstorm → Plan → Work → Review → Compound → Repeat
```

| Command | Purpose |
|---------|---------|
| `/js-ce:brainstorm` | Explore requirements and approaches before planning |
| `/js-ce:plan` | Turn feature ideas into detailed implementation plans |
| `/js-ce:work` | Execute plans with worktrees and task tracking |
| `/js-ce:review` | Multi-agent code review before merging |
| `/js-ce:compound` | Document learnings to make future work easier |

The `js-brainstorming` skill supports `/js-ce:brainstorm` with collaborative dialogue to clarify requirements and compare approaches before committing to a plan.

Each cycle compounds: brainstorms sharpen plans, plans inform future plans, reviews catch more issues, patterns get documented.

## Philosophy

**Each unit of engineering work should make subsequent units easier—not harder.**

Traditional development accumulates technical debt. Every feature adds complexity. The codebase becomes harder to work with over time.

Compound engineering inverts this. 80% is in planning and review, 20% is in execution:
- Plan thoroughly before writing code
- Review to catch issues and capture learnings
- Codify knowledge so it's reusable
- Keep quality high so future changes are easy

## Learn More

- [Full component reference](plugins/js-compound-engineering/README.md) - all agents, commands, skills
- [Compound engineering: how Every codes with agents](https://every.to/chain-of-thought/compound-engineering-how-every-codes-with-agents)
- [The story behind compounding engineering](https://every.to/source-code/my-ai-had-already-fixed-the-code-before-i-saw-it)
