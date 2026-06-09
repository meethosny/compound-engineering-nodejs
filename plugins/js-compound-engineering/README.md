# Compounding Engineering Plugin (Node.js Edition)

AI-powered development tools that get smarter with every use. Make each unit of engineering work easier than the last.

> **Node.js Developer Edition** -- Optimized for Node.js and TypeScript developers. Ruby/Rails patterns replaced with Express, Fastify, Hono, and TypeScript equivalents following TJ Holowaychuk, Matteo Collina, and Sindre Sorhus philosophies.

## Getting Started

After installing, run `/js-ce-setup` in any project. It diagnoses your environment, installs missing tools, and bootstraps project config in one interactive flow.

## Components

| Component | Count |
|-----------|-------|
| Agents | 51 |
| Skills | 47 |
| MCP Servers | 1 |

## Skills

### Core Workflow

The primary entry points for engineering work, invoked as slash commands:

| Skill | Description |
|-------|-------------|
| `/js-ce:ideate` | Discover high-impact project improvements through divergent ideation and adversarial filtering |
| `/js-ce:brainstorm` | Explore requirements and approaches before planning |
| `/js-ce:plan` | Create structured plans for any multi-step task -- software features, research workflows, events, study plans -- with automatic confidence checking |
| `/js-ce:review` | Structured code review with tiered persona agents, confidence gating, and dedup pipeline |
| `/js-ce:work` | Execute work items systematically |
| `/js-ce-debug` | Systematically find root causes and fix bugs -- traces causal chains, forms testable hypotheses, and implements test-first fixes |
| `/js-ce-simplify-code` | Simplify and refine recently changed code for clarity, reuse, quality, and efficiency while preserving behavior |
| `/js-ce:compound` | Document solved problems to compound team knowledge |
| `/js-ce:compound-refresh` | Refresh stale or drifting learnings and decide whether to keep, update, replace, or archive them |
| `/js-ce-optimize` | Run iterative optimization loops with parallel experiments, measurement gates, and LLM-as-judge quality scoring |

For `/js-ce-optimize`, see [`skills/js-ce-optimize/README.md`](./skills/js-ce-optimize/README.md) for usage guidance, example specs, and links to the schema and workflow docs.

### Research & Context

| Skill | Description |
|-------|-------------|
| `/js-ce-sessions` | Ask questions about session history across Claude Code, Codex, and Cursor |
| `/js-ce-slack-research` | Search Slack for interpreted organizational context -- decisions, constraints, and discussion arcs |
| `js-ce-strategy` | Create or maintain `STRATEGY.md` -- the product's target problem, approach, users, key metrics, and tracks of work |

### Git Workflow

| Skill | Description |
|-------|-------------|
| `js-ce-git-clean-gone-branches` | Clean up local branches whose remote tracking branch is gone |
| `js-ce-git-commit` | Create a git commit with a value-communicating message |
| `js-ce-git-commit-push-pr` | Commit, push, and open a PR with an adaptive description; also update an existing PR description |
| `js-ce-git-worktree` | Manage Git worktrees for parallel development |

### Workflow Utilities

| Skill | Description |
|-------|-------------|
| `/js-ce-changelog` | Create engaging changelogs for recent merges |
| `/js-ce-demo-reel` | Capture a visual demo reel (GIF demos, terminal recordings, screenshots) for PRs with project-type-aware tier selection |
| `/js-ce-report-bug` | Report a bug in the js-compound-engineering plugin |
| `/js-ce-resolve-pr-feedback` | Resolve PR review feedback in parallel |
| `/js-ce-test-browser` | Run browser tests on PR-affected pages |
| `/js-ce-test-xcode` | Build and test iOS apps on simulator using XcodeBuildMCP |
| `/js-ce-onboarding` | Generate `ONBOARDING.md` to help new contributors understand the codebase |
| `/js-ce-setup` | Diagnose environment, install missing tools, and bootstrap project config |
| `/js-ce-update` | Check js-compound-engineering plugin version and fix stale cache (Claude Code only) |
| `/js-ce-todo-resolve` | Resolve todos in parallel |
| `/js-ce-todo-triage` | Triage and prioritize pending todos |

### Development Frameworks

| Skill | Description |
|-------|-------------|
| `js-ce-agent-native-architecture` | Build AI agents using prompt-native architecture |
| `js-ce-sindre-sorhus-package-writer` | Write npm packages following Sindre Sorhus's patterns |
| `js-ce-modern-nodejs-style` | Write Node.js code with modern, pragmatic patterns |
| `js-ce-frontend-design` | Create production-grade frontend interfaces |

### Review & Quality

| Skill | Description |
|-------|-------------|
| `js-ce-document-review` | Review documents using parallel persona agents for role-specific feedback |
| `js-ce-agent-native-audit` | Run comprehensive agent-native architecture review with scored principles |

### Content & Collaboration

| Skill | Description |
|-------|-------------|
| `js-ce-every-style-editor` | Review copy for Every's style guide compliance |
| `js-ce-proof` | Create, edit, and share documents via Proof collaborative editor |
| `js-ce-todo-create` | File-based todo tracking system |
| `js-ce-promote` | Draft user-facing announcement and marketing copy for a feature that just shipped |
| `js-ce-release-notes` | Summarize recent js-compound-engineering releases, or answer a question about a past release with a version citation |
| `js-ce-product-pulse` | Generate a time-windowed pulse report on usage, quality, errors, and signals worth investigating |
| `js-ce-riffrec-feedback-analysis` | Product-feedback capture workflow for recorded session bundles |

### Automation & Tools

| Skill | Description |
|-------|-------------|
| `js-ce-gemini-imagegen` | Generate and edit images using Google's Gemini API |
| `js-ce-deploy-docs` | Deploy documentation site |

### Beta / Experimental

| Skill | Description |
|-------|-------------|
| `/js-ce-lfg` | Full autonomous engineering workflow |
| `js-ce-work-beta` | Beta Codex delegation mode for ce:work |
| `js-ce-dogfood-beta` | [BETA] Dogfood the active branch end-to-end as a QA engineer, then auto-fix issues and add regression tests |
| `js-ce-polish` | Start the dev server, open the feature in a browser, and iterate on improvements together (manual invocation only) |

## Agents

Agents are specialized subagents invoked by skills -- you typically don't call these directly.

### Review

| Agent | Description |
|-------|-------------|
| `js-ce-agent-native-reviewer` | Verify features are agent-native (action + context parity) |
| `js-ce-api-contract-reviewer` | Detect breaking API contract changes |
| `js-ce-cli-agent-readiness-reviewer` | Evaluate CLI agent-friendliness against 7 core principles |
| `js-ce-cli-readiness-reviewer` | CLI agent-readiness persona for js-ce:review (conditional, structured JSON) |
| `js-ce-architecture-strategist` | Analyze architectural decisions and compliance |
| `js-ce-code-simplicity-reviewer` | Final pass for simplicity and minimalism |
| `js-ce-correctness-reviewer` | Logic errors, edge cases, state bugs |
| `js-ce-data-integrity-guardian` | Database migrations and data integrity |
| `js-ce-data-migration-expert` | Validate ID mappings match production, check for swapped values |
| `js-ce-data-migrations-reviewer` | Migration safety with confidence calibration |
| `js-ce-deployment-verification-agent` | Create Go/No-Go deployment checklists for risky data changes |
| `js-ce-modern-nodejs-reviewer` | Node.js review from TJ Holowaychuk/Matteo Collina perspective |
| `js-ce-julik-frontend-races-reviewer` | Review JavaScript/Stimulus code for race conditions |
| `js-ce-kieran-nodejs-reviewer` | Node.js code review with strict conventions |
| `js-ce-kieran-python-reviewer` | Python code review with strict conventions |
| `js-ce-kieran-typescript-reviewer` | TypeScript code review with strict conventions |
| `js-ce-maintainability-reviewer` | Coupling, complexity, naming, dead code |
| `js-ce-pattern-recognition-specialist` | Analyze code for patterns and anti-patterns |
| `js-ce-performance-oracle` | Performance analysis and optimization |
| `js-ce-performance-reviewer` | Runtime performance with confidence calibration |
| `js-ce-previous-comments-reviewer` | Check whether prior review feedback has been addressed |
| `js-ce-reliability-reviewer` | Production reliability and failure modes |
| `js-ce-schema-drift-detector` | Detect unrelated schema changes in PRs |
| `js-ce-security-reviewer` | Exploitable vulnerabilities with confidence calibration |
| `js-ce-security-sentinel` | Security audits and vulnerability assessments |
| `js-ce-swift-ios-reviewer` | SwiftUI/UIKit correctness, Swift concurrency, Core Data threading, and iOS accessibility |
| `js-ce-testing-reviewer` | Test coverage gaps, weak assertions |
| `js-ce-project-standards-reviewer` | CLAUDE.md and AGENTS.md compliance |
| `js-ce-adversarial-reviewer` | Construct failure scenarios to break implementations across component boundaries |

### Document Review

| Agent | Description |
|-------|-------------|
| `js-ce-coherence-reviewer` | Review documents for internal consistency, contradictions, and terminology drift |
| `js-ce-design-lens-reviewer` | Review plans for missing design decisions, interaction states, and AI slop risk |
| `js-ce-feasibility-reviewer` | Evaluate whether proposed technical approaches will survive contact with reality |
| `js-ce-product-lens-reviewer` | Challenge problem framing, evaluate scope decisions, surface goal misalignment |
| `js-ce-scope-guardian-reviewer` | Challenge unjustified complexity, scope creep, and premature abstractions |
| `js-ce-security-lens-reviewer` | Evaluate plans for security gaps at the plan level (auth, data, APIs) |
| `js-ce-adversarial-document-reviewer` | Challenge premises, surface unstated assumptions, and stress-test decisions |

### Research

| Agent | Description |
|-------|-------------|
| `js-ce-best-practices-researcher` | Gather external best practices and examples |
| `js-ce-framework-docs-researcher` | Research framework documentation and best practices |
| `js-ce-git-history-analyzer` | Analyze git history and code evolution |
| `js-ce-issue-intelligence-analyst` | Analyze GitHub issues to surface recurring themes and pain patterns |
| `js-ce-learnings-researcher` | Search institutional learnings for relevant past solutions |
| `js-ce-repo-research-analyst` | Research repository structure and conventions |
| `js-ce-session-historian` | Search prior Claude Code, Codex, and Cursor sessions for related investigation context |
| `js-ce-slack-researcher` | Search Slack for organizational context relevant to the current task |
| `js-ce-web-researcher` | Perform iterative web research and return structured external grounding for planning and ideation |

### Design

| Agent | Description |
|-------|-------------|
| `js-ce-design-implementation-reviewer` | Verify UI implementations match Figma designs |
| `js-ce-design-iterator` | Iteratively refine UI through systematic design iterations |
| `js-ce-figma-design-sync` | Synchronize web implementations with Figma designs |

### Workflow

| Agent | Description |
|-------|-------------|
| `js-ce-pr-comment-resolver` | Address PR comments and implement fixes |
| `js-ce-spec-flow-analyzer` | Analyze user flows and identify gaps in specifications |

### Docs

| Agent | Description |
|-------|-------------|
| `js-ce-sorhus-readme-writer` | Create READMEs following Sindre Sorhus style for npm packages |

## MCP Servers

| Server | Description |
|--------|-------------|
| `context7` | Framework documentation lookup via Context7 |

Supports 100+ frameworks including Express, Fastify, Hono, React, Next.js, Vue, Django, Laravel, and more.

MCP servers start automatically when the plugin is enabled.

**Authentication:** To avoid anonymous rate limits, set the `CONTEXT7_API_KEY` environment variable with your Context7 API key. The plugin passes this automatically via the `x-api-key` header. Without it, requests go unauthenticated and will quickly hit the anonymous quota limit.

## Installation

```bash
claude /plugin install js-compound-engineering
```

Then run `/js-ce-setup` to check your environment and install recommended tools.

## Using Outside Claude Code

The repository ships a CLI converter that ports this plugin's skills and agents to other AI coding tools. It supports **10 targets**:

`codex`, `copilot`, `droid`, `gemini`, `kiro`, `opencode`, `pi`, `cursor`, `antigravity`, and `agents`.

The tool-neutral `agents` target writes the skills plus an `AGENTS.md` to the shared **Agent Skills** open-standard location -- `.agents/skills/` for a project, or `~/.agents/skills/` globally. That shared directory is read by Codex, opencode, Gemini, Antigravity, Cursor, and VS Code Copilot, so a single conversion covers multiple tools at once.

The `cleanup` subcommand backs up stale pre-rename artifacts left behind by older installs (from before the `js-ce-*` normalization) so they don't shadow the current components.

> When you remove an agent or skill, update the cleanup registry so the stale artifact is backed up on the next install -- keeping that registry current is part of removing any component.

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

## License

MIT
