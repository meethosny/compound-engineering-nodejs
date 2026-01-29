# Compounding Engineering Plugin (Node.js Fork)

> **🚀 Node.js Developer Edition** — This fork is optimized for Node.js and TypeScript developers. Includes modern patterns from TJ Holowaychuk (Express), Matteo Collina (Fastify), Yusuke Wada (Hono), and Sindre Sorhus (1000+ npm packages).

AI-powered development tools that get smarter with every use. Make each unit of engineering work easier than the last.

## Components

| Component | Count |
|-----------|-------|
| Agents | 28 |
| Commands | 24 |
| Skills | 15 |
| MCP Servers | 1 |

## Agents

Agents are organized into categories for easier discovery.

### Review (14)

| Agent | Description |
|-------|-------------|
| `js-agent-native-reviewer` | Verify features are agent-native (action + context parity) |
| `js-architecture-strategist` | Analyze architectural decisions and compliance |
| `js-code-simplicity-reviewer` | Final pass for simplicity and minimalism |
| `js-data-integrity-guardian` | Database migrations and data integrity |
| `js-data-migration-expert` | Validate ID mappings match production, check for swapped values |
| `js-deployment-verification-agent` | Create Go/No-Go deployment checklists for risky data changes |
| `js-modern-nodejs-reviewer` | Modern Node.js review with minimalist, pragmatic approach |
| `js-kieran-nodejs-reviewer` | Node.js code review with strict conventions |
| `js-kieran-python-reviewer` | Python code review with strict conventions |
| `js-kieran-typescript-reviewer` | TypeScript code review with strict conventions |
| `js-pattern-recognition-specialist` | Analyze code for patterns and anti-patterns |
| `js-performance-oracle` | Performance analysis and optimization |
| `js-security-sentinel` | Security audits and vulnerability assessments |
| `js-julik-frontend-races-reviewer` | Review JavaScript/TypeScript code for race conditions |

### Research (5)

| Agent | Description |
|-------|-------------|
| `js-best-practices-researcher` | Gather external best practices and examples |
| `js-framework-docs-researcher` | Research framework documentation and best practices |
| `js-git-history-analyzer` | Analyze git history and code evolution |
| `js-repo-research-analyst` | Research repository structure and conventions |
| `js-learnings-researcher` | Search documented learnings in docs/solutions/ for institutional knowledge |

### Design (3)

| Agent | Description |
|-------|-------------|
| `js-design-implementation-reviewer` | Verify UI implementations match Figma designs |
| `js-design-iterator` | Iteratively refine UI through systematic design iterations |
| `js-figma-design-sync` | Synchronize web implementations with Figma designs |

### Workflow (5)

| Agent | Description |
|-------|-------------|
| `js-bug-reproduction-validator` | Systematically reproduce and validate bug reports |
| `js-every-style-editor` | Edit content to conform to Every's style guide |
| `js-lint` | Run linting and code quality checks on JavaScript/TypeScript files |
| `js-pr-comment-resolver` | Address PR comments and implement fixes |
| `js-spec-flow-analyzer` | Analyze user flows and identify gaps in specifications |

### Docs (1)

| Agent | Description |
|-------|-------------|
| `js-sorhus-readme-writer` | Create READMEs following Sindre Sorhus style for npm packages |

## Commands

### Workflow Commands

Core workflow commands use `workflows:` prefix to avoid collisions with built-in commands:

| Command | Description |
|---------|-------------|
| `/js-workflows:plan` | Create implementation plans |
| `/js-workflows:review` | Run comprehensive code reviews |
| `/js-workflows:work` | Execute work items systematically with incremental commits |
| `/js-workflows:compound` | Document solved problems to compound team knowledge |
| `/js-workflows:brainstorm` | Explore what to build before diving into implementation |

### Feature Workflow Commands

| Command | Description |
|---------|-------------|
| `/js-lfg` | Full autonomous engineering workflow (plan → deepen → work → review → test → video) |
| `/js-deepen-plan` | Enhance plans with parallel research agents for depth and best practices |
| `/js-feature-video` | Record video walkthrough of a feature and add to PR description |

### Testing Commands

| Command | Description |
|---------|-------------|
| `/js-test-browser` | Run browser tests on PR-affected pages using agent-browser CLI |
| `/js-xcode-test` | Build and test iOS apps on simulator |

### Utility Commands

| Command | Description |
|---------|-------------|
| `/js-agent-native-audit` | Run comprehensive agent-native architecture review with scored principles |
| `/js-changelog` | Create engaging changelogs for recent merges |
| `/js-create-agent-skill` | Create or edit Claude Code skills |
| `/js-generate_command` | Generate new slash commands |
| `/js-heal-skill` | Fix skill documentation issues |
| `/js-plan_review` | Multi-agent plan review in parallel |
| `/js-report-bug` | Report a bug in the plugin |
| `/js-reproduce-bug` | Reproduce bugs using logs and console |
| `/js-resolve_parallel` | Resolve TODO comments in parallel |
| `/js-resolve_pr_parallel` | Resolve PR comments in parallel |
| `/js-resolve_todo_parallel` | Resolve todos in parallel |
| `/js-triage` | Triage and prioritize issues |

## Skills

### Architecture & Design

| Skill | Description |
|-------|-------------|
| `js-agent-native-architecture` | Build AI agents using prompt-native architecture |
| `js-brainstorming` | Framework for exploring what to build before how to build it |

### Development Tools

| Skill | Description |
|-------|-------------|
| `js-sindre-sorhus-package-writer` | Write npm packages following Sindre Sorhus's patterns |
| `js-compound-docs` | Capture solved problems as categorized documentation |
| `js-create-agent-skills` | Expert guidance for creating Claude Code skills |
| `js-modern-nodejs-style` | Write Node.js code with modern, pragmatic patterns |
| `js-dspy-python` | Build type-safe LLM applications with Stanford's DSPy |
| `js-frontend-design` | Create production-grade frontend interfaces |
| `js-skill-creator` | Guide for creating effective Claude Code skills |

### Content & Workflow

| Skill | Description |
|-------|-------------|
| `js-every-style-editor` | Review copy for Every's style guide compliance |
| `js-file-todos` | File-based todo tracking system |
| `js-git-worktree` | Manage Git worktrees for parallel development |

### Browser Automation

| Skill | Description |
|-------|-------------|
| `js-agent-browser` | Headless browser automation using Vercel's agent-browser CLI |

### Cloud & File Transfer

| Skill | Description |
|-------|-------------|
| `js-rclone` | Cloud file transfer and sync using rclone CLI |

### Image Generation

| Skill | Description |
|-------|-------------|
| `js-gemini-imagegen` | Generate and edit images using Google's Gemini API |

**gemini-imagegen features:**
- Text-to-image generation
- Image editing and manipulation
- Multi-turn refinement
- Multiple reference image composition (up to 14 images)

**Requirements:**
- `GEMINI_API_KEY` environment variable
- Python packages: `google-genai`, `pillow`

## MCP Servers

| Server | Description |
|--------|-------------|
| `context7` | Framework documentation lookup via Context7 |

### Context7

**Tools provided:**
- `resolve-library-id` - Find library ID for a framework/package
- `get-library-docs` - Get documentation for a specific library

Supports 100+ frameworks including Express, Fastify, Hono, React, Next.js, Vue, Django, Laravel, and more.

MCP servers start automatically when the plugin is enabled.

## Browser Automation

This plugin uses the `agent-browser` CLI for browser automation instead of Playwright MCP. The agent-browser skill provides:

- **Headless browser control** via simple CLI commands
- **Ref-based element selection** (@e1, @e2, etc.) from accessibility snapshots
- **Screenshot capture** for documentation and debugging
- **Video recording** via screenshot sequences converted to GIF/MP4

Install agent-browser:
```bash
npm install -g agent-browser && agent-browser install
```

See the `agent-browser` skill for detailed usage.

## Installation

```bash
claude /plugin install js-compound-engineering
```

## Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

## License

MIT
