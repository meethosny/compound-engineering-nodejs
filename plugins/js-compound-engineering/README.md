# Compounding Engineering Plugin (Node.js Edition)

AI-powered development tools that get smarter with every use. Make each unit of engineering work easier than the last.

> **Node.js Developer Edition** -- Optimized for Node.js and TypeScript developers. Ruby/Rails patterns replaced with Express, Fastify, Hono, and TypeScript equivalents following TJ Holowaychuk, Matteo Collina, and Sindre Sorhus philosophies.

## Getting Started

After installing, run `/js-ce-setup` in any project. It diagnoses your environment, installs missing tools, and bootstraps project config in one interactive flow.

## Components

| Component | Count |
|-----------|-------|
| Agents | 49 |
| Skills | 41 |
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
| `/js-ce:compound` | Document solved problems to compound team knowledge |
| `/js-ce:compound-refresh` | Refresh stale or drifting learnings and decide whether to keep, update, replace, or archive them |
| `/js-ce-optimize` | Run iterative optimization loops with parallel experiments, measurement gates, and LLM-as-judge quality scoring |

For `/js-ce-optimize`, see [`skills/js-ce-optimize/README.md`](./skills/js-ce-optimize/README.md) for usage guidance, example specs, and links to the schema and workflow docs.

### Research & Context

| Skill | Description |
|-------|-------------|
| `/js-ce-sessions` | Ask questions about session history across Claude Code, Codex, and Cursor |
| `/js-ce-slack-research` | Search Slack for interpreted organizational context -- decisions, constraints, and discussion arcs |

### Git Workflow

| Skill | Description |
|-------|-------------|
| `js-git-clean-gone-branches` | Clean up local branches whose remote tracking branch is gone |
| `js-git-commit` | Create a git commit with a value-communicating message |
| `js-git-commit-push-pr` | Commit, push, and open a PR with an adaptive description; also update an existing PR description |
| `js-git-worktree` | Manage Git worktrees for parallel development |

### Workflow Utilities

| Skill | Description |
|-------|-------------|
| `/js-changelog` | Create engaging changelogs for recent merges |
| `/js-ce-demo-reel` | Capture a visual demo reel (GIF demos, terminal recordings, screenshots) for PRs with project-type-aware tier selection |
| `/js-report-bug-ce` | Report a bug in the js-compound-engineering plugin |
| `/js-resolve-pr-feedback` | Resolve PR review feedback in parallel |
| `/js-test-browser` | Run browser tests on PR-affected pages |
| `/js-test-xcode` | Build and test iOS apps on simulator using XcodeBuildMCP |
| `/js-onboarding` | Generate `ONBOARDING.md` to help new contributors understand the codebase |
| `/js-ce-setup` | Diagnose environment, install missing tools, and bootstrap project config |
| `/js-ce-update` | Check js-compound-engineering plugin version and fix stale cache (Claude Code only) |
| `/js-todo-resolve` | Resolve todos in parallel |
| `/js-todo-triage` | Triage and prioritize pending todos |

### Development Frameworks

| Skill | Description |
|-------|-------------|
| `js-agent-native-architecture` | Build AI agents using prompt-native architecture |
| `js-sindre-sorhus-package-writer` | Write npm packages following Sindre Sorhus's patterns |
| `js-modern-nodejs-style` | Write Node.js code with modern, pragmatic patterns |
| `js-dspy-python` | Build type-safe LLM applications with DSPy Python |
| `js-frontend-design` | Create production-grade frontend interfaces |

### Review & Quality

| Skill | Description |
|-------|-------------|
| `js-claude-permissions-optimizer` | Optimize Claude Code permissions from session history |
| `js-document-review` | Review documents using parallel persona agents for role-specific feedback |
| `js-agent-native-audit` | Run comprehensive agent-native architecture review with scored principles |

### Content & Collaboration

| Skill | Description |
|-------|-------------|
| `js-every-style-editor` | Review copy for Every's style guide compliance |
| `js-proof` | Create, edit, and share documents via Proof collaborative editor |
| `js-todo-create` | File-based todo tracking system |

### Automation & Tools

| Skill | Description |
|-------|-------------|
| `js-gemini-imagegen` | Generate and edit images using Google's Gemini API |
| `js-deploy-docs` | Deploy documentation site |

### Beta / Experimental

| Skill | Description |
|-------|-------------|
| `/js-lfg` | Full autonomous engineering workflow |
| `js-ce-work-beta` | Beta Codex delegation mode for ce:work |

## Agents

Agents are specialized subagents invoked by skills -- you typically don't call these directly.

### Review

| Agent | Description |
|-------|-------------|
| `js-agent-native-reviewer` | Verify features are agent-native (action + context parity) |
| `js-api-contract-reviewer` | Detect breaking API contract changes |
| `js-cli-agent-readiness-reviewer` | Evaluate CLI agent-friendliness against 7 core principles |
| `js-cli-readiness-reviewer` | CLI agent-readiness persona for js-ce:review (conditional, structured JSON) |
| `js-architecture-strategist` | Analyze architectural decisions and compliance |
| `js-code-simplicity-reviewer` | Final pass for simplicity and minimalism |
| `js-correctness-reviewer` | Logic errors, edge cases, state bugs |
| `js-data-integrity-guardian` | Database migrations and data integrity |
| `js-data-migration-expert` | Validate ID mappings match production, check for swapped values |
| `js-data-migrations-reviewer` | Migration safety with confidence calibration |
| `js-deployment-verification-agent` | Create Go/No-Go deployment checklists for risky data changes |
| `js-modern-nodejs-reviewer` | Node.js review from TJ Holowaychuk/Matteo Collina perspective |
| `js-julik-frontend-races-reviewer` | Review JavaScript/Stimulus code for race conditions |
| `js-kieran-nodejs-reviewer` | Node.js code review with strict conventions |
| `js-kieran-python-reviewer` | Python code review with strict conventions |
| `js-kieran-typescript-reviewer` | TypeScript code review with strict conventions |
| `js-maintainability-reviewer` | Coupling, complexity, naming, dead code |
| `js-pattern-recognition-specialist` | Analyze code for patterns and anti-patterns |
| `js-performance-oracle` | Performance analysis and optimization |
| `js-performance-reviewer` | Runtime performance with confidence calibration |
| `js-previous-comments-reviewer` | Check whether prior review feedback has been addressed |
| `js-reliability-reviewer` | Production reliability and failure modes |
| `js-schema-drift-detector` | Detect unrelated schema changes in PRs |
| `js-security-reviewer` | Exploitable vulnerabilities with confidence calibration |
| `js-security-sentinel` | Security audits and vulnerability assessments |
| `js-testing-reviewer` | Test coverage gaps, weak assertions |
| `js-project-standards-reviewer` | CLAUDE.md and AGENTS.md compliance |
| `js-adversarial-reviewer` | Construct failure scenarios to break implementations across component boundaries |

### Document Review

| Agent | Description |
|-------|-------------|
| `js-coherence-reviewer` | Review documents for internal consistency, contradictions, and terminology drift |
| `js-design-lens-reviewer` | Review plans for missing design decisions, interaction states, and AI slop risk |
| `js-feasibility-reviewer` | Evaluate whether proposed technical approaches will survive contact with reality |
| `js-product-lens-reviewer` | Challenge problem framing, evaluate scope decisions, surface goal misalignment |
| `js-scope-guardian-reviewer` | Challenge unjustified complexity, scope creep, and premature abstractions |
| `js-security-lens-reviewer` | Evaluate plans for security gaps at the plan level (auth, data, APIs) |
| `js-adversarial-document-reviewer` | Challenge premises, surface unstated assumptions, and stress-test decisions |

### Research

| Agent | Description |
|-------|-------------|
| `js-best-practices-researcher` | Gather external best practices and examples |
| `js-framework-docs-researcher` | Research framework documentation and best practices |
| `js-git-history-analyzer` | Analyze git history and code evolution |
| `js-issue-intelligence-analyst` | Analyze GitHub issues to surface recurring themes and pain patterns |
| `js-learnings-researcher` | Search institutional learnings for relevant past solutions |
| `js-repo-research-analyst` | Research repository structure and conventions |
| `js-session-historian` | Search prior Claude Code, Codex, and Cursor sessions for related investigation context |
| `js-slack-researcher` | Search Slack for organizational context relevant to the current task |

### Design

| Agent | Description |
|-------|-------------|
| `js-design-implementation-reviewer` | Verify UI implementations match Figma designs |
| `js-design-iterator` | Iteratively refine UI through systematic design iterations |
| `js-figma-design-sync` | Synchronize web implementations with Figma designs |

### Workflow

| Agent | Description |
|-------|-------------|
| `js-pr-comment-resolver` | Address PR comments and implement fixes |
| `js-spec-flow-analyzer` | Analyze user flows and identify gaps in specifications |

### Docs

| Agent | Description |
|-------|-------------|
| `js-sorhus-readme-writer` | Create READMEs following Sindre Sorhus style for npm packages |

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

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

## License

MIT
