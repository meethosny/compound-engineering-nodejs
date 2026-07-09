# Compounding Engineering Plugin (Node.js Edition)

AI-powered development tools that get smarter with every use. Make each unit of engineering work easier than the last.

> **Node.js Developer Edition** -- Optimized for Node.js and TypeScript developers. Ruby/Rails examples are replaced with Express, Fastify, Hono, Prisma, and TypeScript equivalents following TJ Holowaychuk, Matteo Collina, and Sindre Sorhus philosophies.

## Getting Started

After installing, run `/js-ce-setup` in any project. It diagnoses your environment, installs missing tools, and bootstraps project config in one interactive flow.

## Components

| Component | Count |
|-----------|-------|
| Skills | 29 |
| Agents | 0 (agentless) |
| MCP Servers | 0 |

This plugin is **agentless**: reviewer and research specialists are no longer standalone agents. Each skill that needs a specialist carries the persona prompt inside its own directory (`references/personas/*.md`, `references/agents/*.md`) and dispatches a generic subagent with that prompt. This keeps every skill self-contained and portable across agent platforms.

## Skills

### Core Loop

The primary compounding-engineering loop, invoked as slash commands:

| Skill | Description |
|-------|-------------|
| `/js-ce:ideate` | Generate and evaluate grounded ideas before choosing one to develop |
| `/js-ce:brainstorm` | Explore a vague or ambitious idea into a right-sized requirements document |
| `/js-ce:plan` | Create structured plans for any multi-step task, with automatic confidence checking |
| `/js-ce:work` | Execute a plan or concrete work prompt end-to-end |
| `/js-ce:compound` | Document a solved problem or durable vocabulary to compound team knowledge |

### Review & Refinement

| Skill | Description |
|-------|-------------|
| `/js-ce:code-review` | Structured code review with dynamically selected reviewer personas, confidence gating, and a dedup pipeline |
| `js-ce-simplify-code` | Simplify recently changed code for clarity, reuse, quality, and efficiency while preserving behavior |
| `js-ce-doc-review` | Review requirements, plans, or specs with role-specific persona lenses |
| `js-ce-optimize` | Run metric-driven optimization loops with parallel experiments and LLM-as-judge scoring |
| `/js-ce:compound-refresh` | Refresh stale or drifting learnings and decide whether to keep, update, replace, or archive them |

### On-Demand

| Skill | Description |
|-------|-------------|
| `js-ce-debug` | Diagnosis loop for bugs and failing behavior -- traces causal chains and implements test-first fixes |
| `js-ce-explain` | Turn a concept, diff, or window of recent work into a dense, visual explainer |
| `js-ce-pov` | Give a decisive, project-grounded verdict on an external technology, library, or pattern |

### Around the Loop

| Skill | Description |
|-------|-------------|
| `js-ce-strategy` | Create or maintain `STRATEGY.md` -- target problem, approach, users, key metrics, and tracks of work |
| `js-ce-product-pulse` | Generate a time-windowed pulse report from configured signals |
| `js-ce-sweep` | Sweep configured feedback sources (Slack, GitHub Issues) for new items and emit an lfg-ready plan |

### Git Workflow

| Skill | Description |
|-------|-------------|
| `js-ce-commit` | Create a git commit with a clear, value-communicating message |
| `js-ce-commit-push-pr` | Commit, push, and open a PR with an adaptive description |
| `js-ce-worktree` | Set up isolated git worktrees for parallel development |

### Autonomous Pipeline

| Skill | Description |
|-------|-------------|
| `js-ce-lfg` | Run the full hands-off engineering pipeline from planning through a green PR |

### Frontend & Browser

| Skill | Description |
|-------|-------------|
| `js-ce-polish` | Start the dev server, inspect the feature in a browser, and iterate on polish |
| `js-ce-test-browser` | Run browser tests for pages affected by the current branch or PR |
| `js-ce-test-xcode` | Build and test iOS apps on simulator with XcodeBuildMCP |

### Collaboration & Feedback

| Skill | Description |
|-------|-------------|
| `js-ce-proof` | Publish, read, comment on, or edit markdown in Proof |
| `js-ce-promote` | Draft launch or promotion copy for a shipped feature |
| `js-ce-resolve-pr-feedback` | Resolve PR review feedback in parallel |
| `js-ce-riffrec-feedback-analysis` | Analyze Riffrec feedback captures from recorded session bundles |

### Setup & Health

| Skill | Description |
|-------|-------------|
| `js-ce-setup` | Diagnose environment, install missing tools, and bootstrap project config |
| `js-ce-dogfood` | Hands-off, diff-scoped browser QA of the active branch, with autonomous small fixes and a durable report |

## Installation

```bash
claude /plugin install js-compound-engineering
```

Then run `/js-ce-setup` to check your environment and install recommended tools.

## Using Outside Claude Code

The repository ships a CLI converter that ports this plugin's self-contained skills to other AI coding tools. Because the plugin is agentless, each skill converts as one portable unit -- the specialist personas travel inside the skill's `references/` directory, with no separate agent-registration step.

The `cleanup` subcommand backs up stale pre-rename artifacts left behind by older installs (from before the `js-ce-*` normalization and the agentless migration) so they don't shadow the current components.

> When you remove a skill, update the cleanup registry so the stale artifact is backed up on the next install -- keeping that registry current is part of removing any component.

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

## License

MIT
