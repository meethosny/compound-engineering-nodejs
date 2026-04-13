# Compound Engineering (Node.js Edition)

[![Build Status](https://github.com/meethosny/compound-engineering-nodejs/actions/workflows/ci.yml/badge.svg)](https://github.com/meethosny/compound-engineering-nodejs/actions/workflows/ci.yml)

> **Node.js Developer Edition** -- This fork is optimized for Node.js and TypeScript developers. All Ruby/Rails patterns replaced with Express, Fastify, Hono, and TypeScript equivalents.

A plugin marketplace featuring the [Compounding Engineering plugin (Node.js Edition)](plugins/js-compound-engineering/README.md) -- AI skills and agents that make each unit of engineering work easier than the last.

## Philosophy

**Each unit of engineering work should make subsequent units easier--not harder.**

Traditional development accumulates technical debt. Every feature adds complexity. The codebase becomes harder to work with over time.

Compound engineering inverts this. 80% is in planning and review, 20% is in execution:
- Plan thoroughly before writing code
- Review to catch issues and capture learnings
- Codify knowledge so it's reusable
- Keep quality high so future changes are easy

**Learn more**

- [Full component reference](plugins/js-compound-engineering/README.md) - all agents, skills
- [Compound engineering: how Every codes with agents](https://every.to/chain-of-thought/compound-engineering-how-every-codes-with-agents)
- [The story behind compounding engineering](https://every.to/source-code/my-ai-had-already-fixed-the-code-before-i-saw-it)

## Workflow

```
Brainstorm -> Plan -> Work -> Review -> Compound -> Repeat
    ^
  Ideate (optional -- when you need ideas)
```

| Command | Purpose |
|---------|---------|
| `/js-ce:ideate` | Discover high-impact project improvements through divergent ideation and adversarial filtering |
| `/js-ce:brainstorm` | Explore requirements and approaches before planning |
| `/js-ce:plan` | Turn feature ideas into detailed implementation plans |
| `/js-ce:work` | Execute plans with worktrees and task tracking |
| `/js-ce:review` | Multi-agent code review before merging |
| `/js-ce:compound` | Document learnings to make future work easier |

`/js-ce:brainstorm` is the main entry point -- it refines ideas into a requirements plan through interactive Q&A, and short-circuits automatically when ceremony isn't needed. `/js-ce:plan` takes either a requirements doc from brainstorming or a detailed idea and distills it into a technical plan that agents (or humans) can work from.

`/js-ce:ideate` is used less often but can be a force multiplier -- it proactively surfaces strong improvement ideas based on your codebase, with optional steering from you.

Each cycle compounds: brainstorms sharpen plans, plans inform future plans, reviews catch more issues, patterns get documented.

### Getting started

After installing, run `/js-ce-setup` in any project. It checks your environment, installs missing tools (agent-browser, gh, jq, vhs, silicon, ffmpeg), and bootstraps project config.

---

## Install

### Claude Code

```bash
/plugin marketplace add meethosny/compound-engineering-nodejs
/plugin install js-compound-engineering
```

### Cursor

```text
/add-plugin js-compound-engineering
```

### OpenCode, Codex, Droid, Pi, Gemini, Copilot, Kiro, Windsurf, OpenClaw & Qwen (experimental)

This repo includes a Bun/TypeScript CLI that converts Claude Code plugins to OpenCode, Codex, Factory Droid, Pi, Gemini CLI, GitHub Copilot, Kiro CLI, Windsurf, OpenClaw, and Qwen Code.

```bash
# clone the repo
git clone https://github.com/meethosny/compound-engineering-nodejs.git
cd compound-engineering-nodejs
bun install

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

<details>
<summary>Output format details per target</summary>

| Target | Output path | Notes |
|--------|------------|-------|
| `opencode` | `~/.config/opencode/` | Commands as `.md` files; `opencode.json` MCP config deep-merged; backups made before overwriting |
| `codex` | `~/.codex/prompts` + `~/.codex/skills` | Claude commands become prompt + skill pairs; canonical `js-ce:*` workflow skills also get prompt wrappers; deprecated `js-workflows:*` aliases are omitted |
| `droid` | `~/.factory/` | Tool names mapped (`Bash`->`Execute`, `Write`->`Create`); namespace prefixes stripped |
| `pi` | `~/.pi/agent/` | Prompts, skills, extensions, and `mcporter.json` for MCPorter interoperability |
| `gemini` | `.gemini/` | Skills from agents; commands as `.toml`; namespaced commands become directories (`js-ce:plan` -> `commands/js-ce/plan.toml`) |
| `copilot` | `.github/` | Agents as `.agent.md` with Copilot frontmatter; MCP env vars prefixed with `COPILOT_MCP_` |
| `kiro` | `.kiro/` | Agents as JSON configs + prompt `.md` files; only stdio MCP servers supported |
| `openclaw` | `~/.openclaw/extensions/<plugin>/` | Entry-point TypeScript skill file; `openclaw-extension.json` for MCP servers |
| `windsurf` | `~/.codeium/windsurf/` (global) or `.windsurf/` (workspace) | Agents become skills; commands become flat workflows; `mcp_config.json` merged |
| `qwen` | `~/.qwen/extensions/<plugin>/` | Agents as `.yaml`; env vars with placeholders extracted as settings; colon separator for nested commands |

All provider targets are experimental and may change as the formats evolve.

</details>

---

## Local Development

### From your local checkout

For active development -- edits to the plugin source are reflected immediately.

**Claude Code** -- add a shell alias so your local copy loads alongside your normal plugins:

```bash
alias cce='claude --plugin-dir ~/code/compound-engineering-nodejs/plugins/js-compound-engineering'
```

Run `cce` instead of `claude` to test your changes. Your production install stays untouched.

**Codex and other targets** -- run the local CLI against your checkout:

```bash
# from the repo root
bun run src/index.ts install ./plugins/js-compound-engineering --to codex

# same pattern for other targets
bun run src/index.ts install ./plugins/js-compound-engineering --to opencode
```

### From a pushed branch

For testing someone else's branch or your own branch from a worktree, without switching checkouts. Uses `--branch` to clone the branch to a deterministic cache directory.

> **Unpushed local branches**: If the branch exists only in a local worktree and hasn't been pushed, point `--plugin-dir` directly at the worktree path instead (e.g. `claude --plugin-dir /path/to/worktree/plugins/js-compound-engineering`).

**Claude Code** -- use `plugin-path` to get the cached clone path:

```bash
# from the repo root
bun run src/index.ts plugin-path js-compound-engineering --branch feat/new-agents
# Output:
#   claude --plugin-dir ~/.cache/compound-engineering/branches/js-compound-engineering-feat~new-agents/plugins/js-compound-engineering
```

The cache path is deterministic (same branch always maps to the same directory). Re-running updates the checkout to the latest commit on that branch.

**Codex, OpenCode, and other targets** -- pass `--branch` to `install`:

```bash
# from the repo root
bun run src/index.ts install js-compound-engineering --to codex --branch feat/new-agents

# works with any target
bun run src/index.ts install js-compound-engineering --to opencode --branch feat/new-agents

# combine with --also for multiple targets
bun run src/index.ts install js-compound-engineering --to codex --also opencode --branch feat/new-agents
```

Both features use the `COMPOUND_PLUGIN_GITHUB_SOURCE` env var to resolve the repository, defaulting to `https://github.com/meethosny/compound-engineering-nodejs`.

### Shell aliases

Add to `~/.zshrc` or `~/.bashrc`. All aliases use the local CLI so there's no dependency on npm publishing. `plugin-path` prints just the path to stdout (progress goes to stderr), so it composes with `$()`.

```bash
CE_REPO=~/code/compound-engineering-nodejs

ce-cli() { bun run "$CE_REPO/src/index.ts" "$@"; }

# --- Local checkout (active development) ---
alias cce='claude --plugin-dir $CE_REPO/plugins/js-compound-engineering'

codex-ce() {
  ce-cli install "$CE_REPO/plugins/js-compound-engineering" --to codex "$@"
}

# --- Pushed branch (testing PRs, worktree workflows) ---
ccb() {
  claude --plugin-dir "$(ce-cli plugin-path js-compound-engineering --branch "$1")" "${@:2}"
}

codex-ceb() {
  ce-cli install js-compound-engineering --to codex --branch "$1" "${@:2}"
}
```

Usage:

```bash
cce                              # local checkout with Claude Code
codex-ce                         # install local checkout to Codex
ccb feat/new-agents              # test a pushed branch with Claude Code
ccb feat/new-agents --verbose    # extra flags forwarded to claude
codex-ceb feat/new-agents        # install a pushed branch to Codex
```

---

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
- OpenClaw currently syncs skills only. Personal command sync is skipped because this repo does not yet have a documented user-level OpenClaw command surface, and MCP sync is skipped because the current official OpenClaw docs do not clearly document an MCP server config contract.
