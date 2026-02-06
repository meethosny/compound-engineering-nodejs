# Compound Marketplace (Node.js Edition)

> **Node.js Developer Edition** — This fork is optimized for Node.js and TypeScript developers. All Ruby/Rails patterns replaced with Express, Fastify, Hono, and TypeScript equivalents.

A Claude Code plugin marketplace featuring the **Compounding Engineering Plugin (Node.js Fork)** — tools that make each unit of engineering work easier than the last.

## Claude Code Install

```bash
/plugin marketplace add https://github.com/meethosny/compound-engineering-nodejs
/plugin install js-compound-engineering
```

## One-Command Installation

Use the [Claude Plugins CLI](https://claude-plugins.dev) to skip the marketplace setup:

```bash
npx claude-plugins install https://github.com/meethosny/compound-engineering-nodejs
```

## OpenCode + Codex (experimental) Install

The original repo includes a Bun/TypeScript CLI that converts Claude Code plugins to OpenCode and Codex formats:

```bash
# convert to OpenCode format
bunx @every-env/compound-plugin install js-compound-engineering --to opencode

# convert to Codex format
bunx @every-env/compound-plugin install js-compound-engineering --to codex
```

Both provider targets are experimental and may change as the formats evolve.

## Factory (Droid) Quick Start

1) Install Droid (Factory):

```bash
bunx droid-factory
```

What this does: copies Claude Code marketplace commands/agents/subagents and converts them to Droid format.

Next:
- Start Droid
- In Settings, enable Sub-agents

You're done: use this source from Droid. You don't need to add it in Claude Code anymore.

## Workflow

```
Plan → Work → Review → Compound → Repeat
```

| Command | Purpose |
|---------|---------|
| `/js-workflows:plan` | Turn feature ideas into detailed implementation plans |
| `/js-workflows:work` | Execute plans with worktrees and task tracking |
| `/js-workflows:review` | Multi-agent code review before merging |
| `/js-workflows:compound` | Document learnings to make future work easier |

Each cycle compounds: plans inform future plans, reviews catch more issues, patterns get documented.

## Philosophy

**Each unit of engineering work should make subsequent units easier—not harder.**

Traditional development accumulates technical debt. Every feature adds complexity. The codebase becomes harder to work with over time.

Compound engineering inverts this. 80% is in planning and review, 20% is in execution:
- Plan thoroughly before writing code
- Review to catch issues and capture learnings
- Codify knowledge so it's reusable
- Keep quality high so future changes are easy

## Learn More

- [Full component reference](plugins/js-compound-engineering/README.md) — all 29 agents, 25 commands, 16 skills
- [Compound engineering: how Every codes with agents](https://every.to/chain-of-thought/compound-engineering-how-every-codes-with-agents)
- [The story behind compounding engineering](https://every.to/source-code/my-ai-had-already-fixed-the-code-before-i-saw-it)
