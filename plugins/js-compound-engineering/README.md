# Compounding Engineering Plugin (Node.js Fork)

AI-powered development tools that get smarter with every use. Make each unit of engineering work easier than the last.

> **Node.js Developer Edition** -- Optimized for Node.js and TypeScript developers. Ruby/Rails patterns replaced with Express, Fastify, Hono, and TypeScript equivalents following TJ Holowaychuk, Matteo Collina, and Sindre Sorhus philosophies.

## Components

| Component | Count |
|-----------|-------|
| Agents | 28 |
| Commands | 22 |
| Skills | 19 |
| MCP Servers | 1 |

## Agents

Agents are organized into categories for easier discovery.

### Review (15)

| Agent | Description |
|-------|-------------|
| `js-agent-native-reviewer` | Verify features are agent-native (action + context parity) |
| `js-architecture-strategist` | Analyze architectural decisions and compliance |
| `js-code-simplicity-reviewer` | Final pass for simplicity and minimalism |
| `js-data-integrity-guardian` | Database migrations and data integrity |
| `js-data-migration-expert` | Validate ID mappings match production, check for swapped values |
| `js-deployment-verification-agent` | Create Go/No-Go deployment checklists for risky data changes |
| `js-modern-nodejs-reviewer` | Modern Node.js review from TJ Holowaychuk/Matteo Collina perspective |
| `js-julik-frontend-races-reviewer` | Review JavaScript/Stimulus code for race conditions |
| `js-kieran-nodejs-reviewer` | Node.js code review with strict conventions |
| `js-kieran-python-reviewer` | Python code review with strict conventions |
| `js-kieran-typescript-reviewer` | TypeScript code review with strict conventions |
| `js-pattern-recognition-specialist` | Analyze code for patterns and anti-patterns |
| `js-performance-oracle` | Performance analysis and optimization |
| `js-schema-drift-detector` | Detect unrelated migration and schema drift in PRs |
| `js-security-sentinel` | Security audits and vulnerability assessments |

### Research (5)

| Agent | Description |
|-------|-------------|
| `js-best-practices-researcher` | Gather external best practices and examples |
| `js-framework-docs-researcher` | Research framework documentation and best practices |
| `js-git-history-analyzer` | Analyze git history and code evolution |
| `js-learnings-researcher` | Search institutional learnings for relevant past solutions |
| `js-repo-research-analyst` | Research repository structure and conventions |

### Design (3)

| Agent | Description |
|-------|-------------|
| `js-design-implementation-reviewer` | Verify UI implementations match Figma designs |
| `js-design-iterator` | Iteratively refine UI through systematic design iterations |
| `js-figma-design-sync` | Synchronize web implementations with Figma designs |

### Workflow (4)

| Agent | Description |
|-------|-------------|
| `js-bug-reproduction-validator` | Systematically reproduce and validate bug reports |
| `js-lint` | Run linting and code quality checks on JavaScript and TypeScript files |
| `js-pr-comment-resolver` | Address PR comments and implement fixes |
| `js-spec-flow-analyzer` | Analyze user flows and identify gaps in specifications |

### Docs (1)

| Agent | Description |
|-------|-------------|
| `js-sorhus-readme-writer` | Create READMEs following Sindre Sorhus style for npm packages |

## Commands

### Workflow Commands

Core workflow commands use `js-ce:` prefix to unambiguously identify them as js-compound-engineering commands:

| Command | Description |
|---------|-------------|
| `/js-ce:brainstorm` | Explore requirements and approaches before planning |
| `/js-ce:plan` | Create implementation plans |
| `/js-ce:review` | Run comprehensive code reviews |
| `/js-ce:work` | Execute work items systematically |
| `/js-ce:compound` | Document solved problems to compound team knowledge |

> **Deprecated aliases:** `/js-workflows:plan`, `/js-workflows:work`, `/js-workflows:review`, `/js-workflows:brainstorm`, `/js-workflows:compound` still work but show a deprecation warning. Use `js-ce:*` equivalents.

### Utility Commands

| Command | Description |
|---------|-------------|
| `/js-lfg` | Full autonomous engineering workflow |
| `/js-slfg` | Full autonomous workflow with swarm mode for parallel execution |
| `/js-deepen-plan` | Enhance plans with parallel research agents for each section |
| `/js-changelog` | Create engaging changelogs for recent merges |
| `/js-create-agent-skill` | Create or edit Claude Code skills |
| `/js-generate_command` | Generate new slash commands |
| `/js-heal-skill` | Fix skill documentation issues |
| `/js-agent-native-audit` | Run comprehensive agent-native architecture review with scored principles |
| `/js-report-bug` | Report a bug in the plugin |
| `/js-reproduce-bug` | Reproduce bugs using logs and console |
| `/js-resolve_parallel` | Resolve TODO comments in parallel |
| `/js-resolve_pr_parallel` | Resolve PR comments in parallel |
| `/js-resolve_todo_parallel` | Resolve todos in parallel |
| `/js-triage` | Triage and prioritize issues |
| `/js-test-browser` | Run browser tests on PR-affected pages |
| `/js-xcode-test` | Build and test iOS apps on simulator |
| `/js-feature-video` | Record video walkthroughs and add to PR description |

## Skills

### Architecture & Design

| Skill | Description |
|-------|-------------|
| `js-agent-native-architecture` | Build AI agents using prompt-native architecture |

### Development Tools

| Skill | Description |
|-------|-------------|
| `js-sindre-sorhus-package-writer` | Write npm packages following Sindre Sorhus patterns |
| `js-compound-docs` | Capture solved problems as categorized documentation |
| `js-create-agent-skills` | Expert guidance for creating Claude Code skills |
| `js-modern-nodejs-style` | Write Node.js code with modern, pragmatic patterns |
| `js-dspy-python` | Build type-safe LLM applications with DSPy Python |
| `js-frontend-design` | Create production-grade frontend interfaces |

### Content & Workflow

| Skill | Description |
|-------|-------------|
| `js-brainstorming` | Explore requirements and approaches through collaborative dialogue |
| `js-document-review` | Improve documents through structured self-review |
| `js-every-style-editor` | Review copy for Every's style guide compliance |
| `js-file-todos` | File-based todo tracking system |
| `js-git-worktree` | Manage Git worktrees for parallel development |
| `js-resolve-pr-parallel` | Resolve PR review comments in parallel |
| `js-setup` | Configure which review agents run for your project |

### Multi-Agent Orchestration

| Skill | Description |
|-------|-------------|
| `js-orchestrating-swarms` | Comprehensive guide to multi-agent swarm orchestration |

### File Transfer

| Skill | Description |
|-------|-------------|
| `js-rclone` | Upload files to S3, Cloudflare R2, Backblaze B2, and cloud storage |

### Browser Automation

| Skill | Description |
|-------|-------------|
| `js-agent-browser` | CLI-based browser automation using Vercel's agent-browser |

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

**Authentication:** To avoid anonymous rate limits, set the `CONTEXT7_API_KEY` environment variable with your Context7 API key. The plugin passes this automatically via the `x-api-key` header. Without it, requests go unauthenticated and will quickly hit the anonymous quota limit.

## Browser Automation

This plugin uses **agent-browser CLI** for browser automation tasks. Install it globally:

```bash
npm install -g agent-browser
agent-browser install  # Downloads Chromium
```

The `js-agent-browser` skill provides comprehensive documentation on usage.

## Installation

```bash
claude /plugin install js-compound-engineering
```

## Known Issues

### MCP Servers Not Auto-Loading

**Issue:** The bundled Context7 MCP server may not load automatically when the plugin is installed.

**Workaround:** Manually add it to your project's `.claude/settings.json`:

```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "x-api-key": "${CONTEXT7_API_KEY:-}"
      }
    }
  }
}
```

Set `CONTEXT7_API_KEY` in your environment to authenticate. Or add it globally in `~/.claude/settings.json` for all projects.

## Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

## License

MIT
