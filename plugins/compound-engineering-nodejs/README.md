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
| `agent-native-reviewer` | Verify features are agent-native (action + context parity) |
| `architecture-strategist` | Analyze architectural decisions and compliance |
| `code-simplicity-reviewer` | Final pass for simplicity and minimalism |
| `data-integrity-guardian` | Database migrations and data integrity |
| `data-migration-expert` | Validate ID mappings match production, check for swapped values |
| `deployment-verification-agent` | Create Go/No-Go deployment checklists for risky data changes |
| `modern-nodejs-reviewer` | Modern Node.js review with minimalist, pragmatic approach |
| `kieran-nodejs-reviewer` | Node.js code review with strict conventions |
| `kieran-python-reviewer` | Python code review with strict conventions |
| `kieran-typescript-reviewer` | TypeScript code review with strict conventions |
| `pattern-recognition-specialist` | Analyze code for patterns and anti-patterns |
| `performance-oracle` | Performance analysis and optimization |
| `security-sentinel` | Security audits and vulnerability assessments |
| `julik-frontend-races-reviewer` | Review JavaScript/TypeScript code for race conditions |

### Research (5)

| Agent | Description |
|-------|-------------|
| `best-practices-researcher` | Gather external best practices and examples |
| `framework-docs-researcher` | Research framework documentation and best practices |
| `git-history-analyzer` | Analyze git history and code evolution |
| `repo-research-analyst` | Research repository structure and conventions |
| `learnings-researcher` | Search documented learnings in docs/solutions/ for institutional knowledge |

### Design (3)

| Agent | Description |
|-------|-------------|
| `design-implementation-reviewer` | Verify UI implementations match Figma designs |
| `design-iterator` | Iteratively refine UI through systematic design iterations |
| `figma-design-sync` | Synchronize web implementations with Figma designs |

### Workflow (5)

| Agent | Description |
|-------|-------------|
| `bug-reproduction-validator` | Systematically reproduce and validate bug reports |
| `every-style-editor` | Edit content to conform to Every's style guide |
| `lint` | Run linting and code quality checks on JavaScript/TypeScript files |
| `pr-comment-resolver` | Address PR comments and implement fixes |
| `spec-flow-analyzer` | Analyze user flows and identify gaps in specifications |

### Docs (1)

| Agent | Description |
|-------|-------------|
| `sorhus-readme-writer` | Create READMEs following Sindre Sorhus style for npm packages |

## Commands

### Workflow Commands

Core workflow commands use `workflows:` prefix to avoid collisions with built-in commands:

| Command | Description |
|---------|-------------|
| `/workflows:plan` | Create implementation plans |
| `/workflows:review` | Run comprehensive code reviews |
| `/workflows:work` | Execute work items systematically with incremental commits |
| `/workflows:compound` | Document solved problems to compound team knowledge |
| `/workflows:brainstorm` | Explore what to build before diving into implementation |

### Feature Workflow Commands

| Command | Description |
|---------|-------------|
| `/lfg` | Full autonomous engineering workflow (plan → deepen → work → review → test → video) |
| `/deepen-plan` | Enhance plans with parallel research agents for depth and best practices |
| `/feature-video` | Record video walkthrough of a feature and add to PR description |

### Testing Commands

| Command | Description |
|---------|-------------|
| `/test-browser` | Run browser tests on PR-affected pages using agent-browser CLI |
| `/xcode-test` | Build and test iOS apps on simulator |

### Utility Commands

| Command | Description |
|---------|-------------|
| `/agent-native-audit` | Run comprehensive agent-native architecture review with scored principles |
| `/changelog` | Create engaging changelogs for recent merges |
| `/create-agent-skill` | Create or edit Claude Code skills |
| `/generate_command` | Generate new slash commands |
| `/heal-skill` | Fix skill documentation issues |
| `/plan_review` | Multi-agent plan review in parallel |
| `/report-bug` | Report a bug in the plugin |
| `/reproduce-bug` | Reproduce bugs using logs and console |
| `/resolve_parallel` | Resolve TODO comments in parallel |
| `/resolve_pr_parallel` | Resolve PR comments in parallel |
| `/resolve_todo_parallel` | Resolve todos in parallel |
| `/triage` | Triage and prioritize issues |

## Skills

### Architecture & Design

| Skill | Description |
|-------|-------------|
| `agent-native-architecture` | Build AI agents using prompt-native architecture |
| `brainstorming` | Framework for exploring what to build before how to build it |

### Development Tools

| Skill | Description |
|-------|-------------|
| `sindre-sorhus-package-writer` | Write npm packages following Sindre Sorhus's patterns |
| `compound-docs` | Capture solved problems as categorized documentation |
| `create-agent-skills` | Expert guidance for creating Claude Code skills |
| `modern-nodejs-style` | Write Node.js code with modern, pragmatic patterns |
| `dspy-python` | Build type-safe LLM applications with Stanford's DSPy |
| `frontend-design` | Create production-grade frontend interfaces |
| `skill-creator` | Guide for creating effective Claude Code skills |

### Content & Workflow

| Skill | Description |
|-------|-------------|
| `every-style-editor` | Review copy for Every's style guide compliance |
| `file-todos` | File-based todo tracking system |
| `git-worktree` | Manage Git worktrees for parallel development |

### Browser Automation

| Skill | Description |
|-------|-------------|
| `agent-browser` | Headless browser automation using Vercel's agent-browser CLI |

### Cloud & File Transfer

| Skill | Description |
|-------|-------------|
| `rclone` | Cloud file transfer and sync using rclone CLI |

### Image Generation

| Skill | Description |
|-------|-------------|
| `gemini-imagegen` | Generate and edit images using Google's Gemini API |

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
claude /plugin install compound-engineering-nodejs
```

## Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

## License

MIT
