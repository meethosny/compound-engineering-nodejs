# Changelog

All notable changes to the js-compound-engineering plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.65.0] - 2026-04-13

### Sync with Original Plugin v2.65.0

Major sync bringing the Node.js fork to full parity with the original compound-engineering plugin v2.65.0.

### Added

**New Agents (21):**

*Review (13):*
- `js-api-contract-reviewer` - Detect breaking API contract changes
- `js-cli-readiness-reviewer` - CLI agent-readiness persona for js-ce:review (conditional, structured JSON)
- `js-correctness-reviewer` - Logic errors, edge cases, state bugs
- `js-data-migrations-reviewer` - Migration safety with confidence calibration
- `js-maintainability-reviewer` - Coupling, complexity, naming, dead code
- `js-performance-reviewer` - Runtime performance with confidence calibration
- `js-previous-comments-reviewer` - Check whether prior review feedback has been addressed
- `js-reliability-reviewer` - Production reliability and failure modes
- `js-security-reviewer` - Exploitable vulnerabilities with confidence calibration
- `js-testing-reviewer` - Test coverage gaps, weak assertions
- `js-project-standards-reviewer` - CLAUDE.md and AGENTS.md compliance
- `js-adversarial-reviewer` - Construct failure scenarios to break implementations
- `js-cli-agent-readiness-reviewer` - Evaluate CLI agent-friendliness against 7 core principles

*Document Review (7):*
- `js-coherence-reviewer` - Review documents for internal consistency and terminology drift
- `js-design-lens-reviewer` - Review plans for missing design decisions and AI slop risk
- `js-feasibility-reviewer` - Evaluate whether proposed technical approaches will survive contact with reality
- `js-product-lens-reviewer` - Challenge problem framing and surface goal misalignment
- `js-scope-guardian-reviewer` - Challenge unjustified complexity and scope creep
- `js-security-lens-reviewer` - Evaluate plans for security gaps at the plan level
- `js-adversarial-document-reviewer` - Challenge premises and stress-test decisions

*Research (3):*
- `js-issue-intelligence-analyst` - Analyze GitHub issues to surface recurring themes
- `js-session-historian` - Search prior Claude Code, Codex, and Cursor sessions for related context
- `js-slack-researcher` - Search Slack for organizational context relevant to the current task

**New Skills (22):**
- `js-ce-ideate` - Discover high-impact project improvements through divergent ideation
- `js-ce-debug` - Systematically find root causes and fix bugs
- `js-ce-demo-reel` - Capture visual demo reels for PRs
- `js-ce-optimize` - Run iterative optimization loops with parallel experiments
- `js-ce-sessions` - Ask questions about session history across coding tools
- `js-ce-setup` - Diagnose environment, install missing tools, and bootstrap project config
- `js-ce-slack-research` - Search Slack for interpreted organizational context
- `js-ce-update` - Check plugin version and fix stale cache
- `js-ce-compound-refresh` - Refresh stale or drifting learnings
- `js-ce-work-beta` - Beta Codex delegation mode for ce:work
- `js-changelog` - Create engaging changelogs for recent merges
- `js-claude-permissions-optimizer` - Optimize Claude Code permissions from session history
- `js-deploy-docs` - Deploy documentation site
- `js-git-clean-gone-branches` - Clean up local branches whose remote is gone
- `js-git-commit` - Create a git commit with a value-communicating message
- `js-git-commit-push-pr` - Commit, push, and open a PR with adaptive description
- `js-onboarding` - Generate ONBOARDING.md for new contributors
- `js-proof` - Create, edit, and share documents via Proof collaborative editor
- `js-report-bug-ce` - Report a bug in the plugin
- `js-todo-create` - File-based todo tracking system
- `js-todo-resolve` - Resolve todos in parallel
- `js-todo-triage` - Triage and prioritize pending todos

### Changed

- All skills now follow the original plugin's structure and conventions
- Commands migrated to skills format (matching original's v2.39.0+ approach)
- Agent references use fully-qualified namespaces (`js-compound-engineering:<category>:<agent-name>`)
- Review pipeline now uses tiered persona agents with confidence gating and dedup
- Planning and brainstorming skills now support non-software tasks (universal planning)

### Removed

- All fork-only components that don't exist in the original (18 skills, 2 agents)
- Commands directory (migrated to skills)

### Component Summary

| Component | Previous | v2.65.0 | Change |
|-----------|----------|---------|--------|
| Agents | 28 | 49 | +21 |
| Skills | 19 | 41 | +22 |
| MCP Servers | 1 | 1 | - |

---

## [3.4.0] - 2026-02-14

### Sync with Original Plugin v2.33.1

### Added

- **`js-setup` skill** - Interactive configurator for review agents. Auto-detects project stack (TypeScript, Node.js, Python) and writes `js-compound-engineering.local.md` settings file
- **`js-document-review` skill** - Structured self-review for brainstorm and plan documents. Assesses clarity, completeness, specificity, and YAGNI compliance
- **`js-resolve-pr-parallel` skill** - Skill version of PR comment resolution for structured parallel resolution

### Changed

- **`/js-workflows:review` command** - Major rewrite: dynamic agent loading from `js-compound-engineering.local.md` settings file, falls back to `js-setup` skill when no config exists. `js-learnings-researcher` now always runs alongside `js-agent-native-reviewer`. Synthesis step surfaces past solutions as "Known Pattern" with links
- **`/js-workflows:plan` command** - Added `status: active` to all plan YAML frontmatter templates. Added "Review and refine" post-generation option using `js-document-review` skill
- **`/js-workflows:work` command** - Phase 3 now reads configured review agents from settings file. Phase 4 updates plan frontmatter from `status: active` to `status: completed`. PR description template includes Post-Deploy Monitoring & Validation section
- **Context token optimization** - Added `disable-model-invocation: true` to 18 side-effect commands and 6 skills to reduce context token usage (~79% reduction). Prevents silent component exclusion when context budget is exceeded

### Component Summary

| Component | v3.3.0 | v3.4.0 | Change |
|-----------|--------|--------|--------|
| Agents | 29 | 29 | - |
| Commands | 25 | 25 | - |
| Skills | 16 | 19 | +3 |
| MCP Servers | 1 | 1 | - |

## [3.3.0] - 2026-02-06

### Sync with Original Plugin v2.30.0

### Added

- **`js-schema-drift-detector` agent** - Detects unrelated migration and schema drift in PRs
  - Supports Prisma, TypeORM, Knex, Sequelize, Drizzle migrations
  - Detects lock file drift (package-lock.json, yarn.lock, pnpm-lock.yaml)
  - Provides clear fix instructions per ORM
- **`js-orchestrating-swarms` skill** - Comprehensive guide to multi-agent swarm orchestration
  - Covers primitives: Agent, Team, Teammate, Leader, Task, Inbox, Message, Backend
  - Documents subagents vs teammates spawning methods
  - Includes 6 orchestration patterns and 3 complete workflows
- **`/js-slfg` command** - Swarm-enabled variant of `/js-lfg` for parallel execution

### Changed

- **`/js-workflows:work` command** - Added optional Swarm Mode section for parallel execution
- **`/js-workflows:plan` command** - Added brainstorm detection, research decision logic, learnings-researcher integration, consolidated research step, and updated post-generation options
- **`/js-workflows:review` command** - Added Protected Artifacts section and Conditional Agents for migration PRs (Prisma, TypeORM, Knex, Sequelize, Drizzle)
- **`js-best-practices-researcher` agent** - Added Phase 1 skill discovery, Phase 1.5 API deprecation checking, and 3-phase research methodology
- **`CLAUDE.md`** - Added Skill Compliance Checklist section

### Component Summary

| Component | v3.2.0 | v3.3.0 | Change |
|-----------|--------|--------|--------|
| Agents | 28 | 29 | +1 |
| Commands | 24 | 25 | +1 |
| Skills | 15 | 16 | +1 |
| MCP Servers | 1 | 1 | - |

## [3.2.0] - 2026-01-30

### Major Rename: Plugin Renamed to js-compound-engineering

This release renames the entire plugin from `compound-engineering-nodejs` to `js-compound-engineering` and adds `js-` prefix to all components to avoid conflicts with the original `compound-engineering` plugin.

### Changed

**Plugin Rename:**
- Plugin renamed from `compound-engineering-nodejs` to `js-compound-engineering`
- All 28 agents now prefixed with `js-` (e.g., `js-modern-nodejs-reviewer`, `js-security-sentinel`)
- All 24 commands now prefixed with `js-` (e.g., `/js-lfg`, `/js-deepen-plan`)
- All 15 skills now prefixed with `js-` (e.g., `js-modern-nodejs-style`, `js-gemini-imagegen`)
- Workflow commands now use `js-workflows:` prefix (e.g., `/js-workflows:plan`, `/js-workflows:review`)

**Cross-Reference Updates:**
- All internal references updated to use new `js-` prefixed names
- Task agent calls updated (e.g., `Task js-pr-comment-resolver`)
- Skill invocations updated (e.g., `skill: js-git-worktree`)
- Command invocations updated throughout all workflow files

**Installation:**
```bash
claude /plugin install js-compound-engineering
```

## [3.1.0] - 2026-01-29

### Major Update: Sync with Original Plugin v2.28.0

This release brings the Node.js fork up to feature parity with the original compound-engineering plugin v2.28.0, with all content adapted for Node.js/TypeScript development.

### Added

**New Agent (1):**
- `js-learnings-researcher` - Search documented learnings in `docs/solutions/` for institutional knowledge. Uses grep-first filtering to find relevant past solutions.

**New Commands (6):**
- `/js-workflows:brainstorm` - Pre-planning command for exploring WHAT to build before HOW
- `/js-deepen-plan` - Enhance plans with parallel research agents, skills discovery, and learnings integration
- `/js-lfg` - Full autonomous engineering workflow: plan -> deepen-plan -> work -> review -> resolve_todo_parallel -> test-browser -> feature-video
- `/js-feature-video` - Record video walkthroughs using agent-browser CLI and add to PR descriptions
- `/js-test-browser` - Run browser tests on PR-affected pages using agent-browser CLI (replaces `/js-playwright-test`)
- `/js-agent-native-audit` - Comprehensive agent-native architecture review with 8 scored principles

**New Skills (3):**
- `js-agent-browser` - Headless browser automation using Vercel's agent-browser CLI with ref-based element selection
- `js-brainstorming` - Framework for exploring requirements before implementation
- `js-rclone` - Cloud file transfer and sync using rclone CLI

### Changed

**Browser Automation:**
- Replaced Playwright MCP with `agent-browser` CLI skill (following original plugin's direction)
- All browser-related commands now use agent-browser instead of Playwright MCP tools
- Removed `playwright` MCP server from plugin.json, kept only `context7`

**`/js-workflows:work` Command - Major Enhancements:**
- Added incremental commits feature with decision table (when to commit vs wait)
- Added branch safety checks (detects if on default branch, requires explicit confirmation)
- Added checkbox tracking (automatically marks `[ ]` -> `[x]` in plan files)
- Added Compound Engineered badge to PR template
- Updated reviewer agents list to include `js-modern-nodejs-reviewer` and `js-kieran-typescript-reviewer`
- Changed screenshot capture from Playwright MCP to agent-browser CLI

**Node.js Adaptations:**
- All route mappings adapted for Node.js frameworks (Next.js Pages/App Router, Express, Fastify, Hono, Remix)
- All `bin/dev` references changed to `npm run dev`
- All `dhh-rails-style` skill references changed to `js-modern-nodejs-style`
- All `kieran-rails-reviewer` references changed to `js-kieran-nodejs-reviewer`

### Removed

- `/js-playwright-test` command (replaced by `/js-test-browser`)
- `playwright` MCP server (browser automation now via agent-browser skill)

### Component Summary

| Component | v3.0.0 | v3.1.0 | Change |
|-----------|--------|--------|--------|
| Agents | 27 | 28 | +1 |
| Commands | 19 | 24 | +5 (net, after removing playwright-test) |
| Skills | 12 | 15 | +3 |
| MCP Servers | 2 | 1 | -1 (removed Playwright) |

---

## [3.0.0] - 2025-12-18

### Breaking Changes

**Complete migration from Ruby/Rails to Node.js patterns.** This is a major breaking change for users who relied on Ruby-specific skills and agents.

### Philosophy Replacements

- **DHH (Rails)** -> **Modern Node.js style** (TJ Holowaychuk + Matteo Collina + Yusuke Wada patterns)
- **Andrew Kane (Ruby gems)** -> **Sindre Sorhus style** (1000+ npm packages patterns)
- **DSPy.rb** -> **DSPy Python** (Stanford's original Python implementation)
- **Added Hono.js** alongside Express and Fastify as recommended lightweight framework

### Removed

**Skills (deleted):**
- `dhh-rails-style` - Rails conventions and DHH patterns
- `dhh-ruby-style` - Ruby style guide
- `andrew-kane-gem-writer` - Ruby gem writing patterns
- `dspy-ruby` - DSPy.rb for Ruby LLM apps

**Agents (deleted):**
- `dhh-rails-reviewer` - Rails review from DHH's perspective
- `kieran-rails-reviewer` - Rails code review with strict conventions
- `ankane-readme-writer` - Ankane-style README for Ruby gems

### Added

**Skills (new):**
- `js-modern-nodejs-style` - Write Node.js code with modern, pragmatic patterns (MVP-focused, minimal dependencies, async-first)
- `js-sindre-sorhus-package-writer` - Write npm packages following Sindre Sorhus's proven patterns (ESM-first, zero deps, TypeScript definitions)
- `js-dspy-python` - Build type-safe LLM applications with Stanford's original Python DSPy framework

**Agents (new):**
- `js-modern-nodejs-reviewer` - Modern Node.js review with minimalist, pragmatic approach
- `js-kieran-nodejs-reviewer` - Node.js code review with strict conventions
- `js-sorhus-readme-writer` - Create READMEs following Sindre Sorhus style for npm packages

### Changed

**Commands updated:**
- `js-generate_command` - Changed `bin/rails test` -> `npm test`, `bundle exec standardrb` -> `npx eslint .`
- `js-test-browser` - Changed Rails server commands to Node.js (`npm run dev`)
- `js-ce:review` - Updated parallel agents list for Node.js

**Documentation updated:**
- README.md - All agent and skill descriptions updated for Node.js
- Framework references changed from Rails to Express/Fastify/Hono
- File pattern mappings updated for Node.js project structure

---

## [2.15.1] - 2025-12-18

### Changed

- **`/js-workflows:review` command** - Section 7 now detects project type (Web, iOS, or Hybrid) and offers appropriate testing. Web projects get `/js-test-browser`, iOS projects get `/js-xcode-test`, hybrid projects can run both.

## [2.15.0] - 2025-12-18

### Added

- **`/js-xcode-test` command** - Build and test iOS apps on simulator using XcodeBuildMCP. Discovers projects/schemes, builds for simulator, installs and launches apps, takes screenshots, captures console logs, and supports human verification for Sign in with Apple, push notifications, and in-app purchases. Checks for XcodeBuildMCP installation first.

## [2.14.0] - 2025-12-18

### Added

- **`/js-playwright-test` command** - Run end-to-end browser tests on pages affected by a PR or branch. Uses Playwright MCP to navigate pages, capture snapshots, check console errors, test interactions, and pause for human verification on OAuth/email/payment flows. Creates P1 todos for failures and retries until passing.

### Changed

- **`/js-workflows:review` command** - Added optional Playwright testing phase (Section 7). After review agents complete, offers to spawn `/js-playwright-test` as a subagent to verify affected pages in a real browser.

## [2.13.0] - 2025-12-15

### Added

- **`js-modern-nodejs-style` skill** - Write Node.js code with modern, pragmatic patterns. MVP-focused, minimal dependencies, async-first. Covers Express, Fastify, Hono, and TypeScript patterns.

## [2.12.0] - 2025-12-15

### Added

- **`js-data-migration-expert` agent** - New review agent for validating database migrations and data backfills. Ensures ID mappings match production reality, checks for swapped values, verifies rollback safety, and provides SQL verification snippets. Prevents silent data corruption from mismatched enum/ID mappings.
- **`js-deployment-verification-agent` agent** - New review agent that produces Go/No-Go deployment checklists for risky data changes. Creates pre/post-deploy SQL verification queries, defines data invariants, documents rollback procedures, and plans post-deploy monitoring.

### Changed

- **`/js-workflows:review` command** - Added conditional agents section. Now automatically runs `js-data-migration-expert` and `js-deployment-verification-agent` when PR contains database migrations, data backfills, or ID/enum mapping changes.

## [2.11.0] - 2025-12-10

### Changed

- **Command naming convention** - Workflow commands now use `js-workflows:` prefix to avoid collisions with built-in Claude Code commands:
  - `/js-workflows:plan` (was `/js-plan`)
  - `/js-workflows:review` (was `/js-review`)
  - `/js-workflows:work` (was `/js-work`)
  - `/js-workflows:compound` (was `/js-compound`)

  This ensures no collision with Claude Code's built-in `/plan` command.

### Fixed

- **`js-heal-skill`** - Added missing `name:` frontmatter field
- **`js-create-agent-skill`** - Added missing `name:` frontmatter field

### Removed

- **`js-prime`** - Removed from plugin (personal setup command, not for distribution)
- **`js-codify`** - Removed deprecated command (replaced by `/js-ce:compound`)

## [2.10.0] - 2025-12-10

### Added

- **`js-agent-native-reviewer` agent** - New review agent that verifies features are agent-native. Checks that any action a user can take, an agent can also take (Action Parity), and anything a user can see, an agent can see (Context Parity). Enforces the principle: "Whatever the user can do, the agent can do."
- **`js-agent-native-architecture` skill** - Build AI agents using prompt-native architecture where features are defined in prompts, not code. Includes patterns for MCP tool design, system prompts, self-modification, and refactoring to prompt-native.

### Changed

- **`/js-review` command** - Added `js-agent-native-reviewer` to the parallel review agents. Code reviews now automatically check if new features are accessible to agents.

## [2.9.4] - 2025-12-08

### Changed

- **`/js-work` command** - Improved screenshot documentation for PR creation. Made capturing screenshots REQUIRED for any UI changes.

## [2.9.3] - 2025-12-05

### Changed

- **`/js-plan` command** - Added "Open plan in editor" as the first option in post-generation menu.

## [2.9.2] - 2025-12-04

### Added

- **`/js-work` command** - Added screenshot documentation step for UI changes.

## [2.9.1] - 2025-12-04

### Changed

- **`/js-plan` command** - Reordered post-generation options: Review first, Work locally second, Work on remote third.

## [2.9.0] - 2025-12-02

### Changed

- **Plugin renamed** from `compounding-engineering-nodejs` to `compound-engineering-nodejs`. Shorter name, same philosophy.

### Fixed

- **Documentation counts** - Updated all documentation to reflect actual component counts (24 agents, 19 commands).

## [2.8.3] - 2025-11-29

### Fixed

- **`js-gemini-imagegen` skill** - Added critical documentation about file format handling. Gemini returns JPEG by default, so using `.jpg` extension is required to avoid "Image does not match media type" API errors.

## [2.8.2] - 2025-11-28

### Changed

- **`js-gemini-imagegen` skill** - Updated to use only Pro model by default. Added explicit options for aspect ratio and resolution.

## [2.8.1] - 2025-11-27

### Added

- **`/js-plan` command** - Added "Create Issue" option to post-generation menu. Detects project tracker (GitHub or Linear) and creates issues accordingly.

## [2.8.0] - 2025-11-27

### Added

- **`js-julik-frontend-races-reviewer` agent** - New review agent specializing in JavaScript and Stimulus code race conditions.

## [2.7.0] - 2025-11-27

### Changed

- **`/js-codify` -> `/js-compound`** - Renamed the documentation command to better reflect the compounding engineering philosophy.
- **`js-codify-docs` -> `js-compound-docs`** - Renamed the skill to match the new command name.

## [2.6.2] - 2025-11-27

### Improved

- **`/js-plan` command** - Added AskUserQuestion tool for post-generation options and year note (2025) for accurate date awareness.
- **Research agents** - Added year note (2025) to all 4 research agents for accurate date awareness.

## [2.6.1] - 2025-11-26

### Improved

- **`/js-plan` command** - Replaced vague "keep asking questions" ending with clear post-generation options menu.

## [2.6.0] - 2024-11-26

### Removed

- **`js-feedback-codifier` agent** - Removed from workflow agents.

## [2.5.0] - 2024-11-25

### Added

- **`/js-report-bug` command** - New slash command for reporting bugs in the js-compound-engineering plugin.

## [2.4.1] - 2024-11-24

### Improved

- **`js-design-iterator` agent** - Added focused screenshot guidance.

## [2.4.0] - 2024-11-24

### Fixed

- **MCP Configuration** - Moved MCP servers back to `plugin.json` following working examples.

## [2.3.0] - 2024-11-24

### Changed

- **MCP Configuration** - Moved MCP servers from inline `plugin.json` to separate `.mcp.json` file.

## [2.2.1] - 2024-11-24

### Fixed

- **Playwright MCP Server** - Added missing `"type": "stdio"` field.

## [2.2.0] - 2024-11-24

### Added

- **Context7 MCP Server** - Bundled Context7 for instant framework documentation lookup.

## [2.1.0] - 2024-11-24

### Added

- **Playwright MCP Server** - Bundled `@playwright/mcp` for browser automation.

### Changed

- Replaced all Puppeteer references with Playwright across agents and commands.

## [2.0.2] - 2024-11-24

### Changed

- `js-design-iterator` agent - Updated description to emphasize proactive usage.

## [2.0.1] - 2024-11-24

### Added

- `CLAUDE.md` - Project instructions with versioning requirements and pre-commit checklist

## [2.0.0] - 2024-11-24

Major reorganization consolidating agents, commands, and skills from multiple sources into a single, well-organized plugin.

### Added

**New Agents (7)**
- `js-design-iterator` - Iteratively refine UI through systematic design iterations
- `js-design-implementation-reviewer` - Verify UI implementations match Figma designs
- `js-figma-design-sync` - Synchronize web implementations with Figma designs
- `js-bug-reproduction-validator` - Systematically reproduce and validate bug reports
- `js-spec-flow-analyzer` - Analyze user flows and identify gaps in specifications
- `js-lint` - Run linting and code quality checks on JavaScript and TypeScript files
- `js-sorhus-readme-writer` - Create READMEs following Sindre Sorhus style for npm packages

**New Commands (9)**
- `/js-changelog` - Create engaging changelogs for recent merges
- `/js-plan_review` - Multi-agent plan review in parallel
- `/js-resolve_parallel` - Resolve TODO comments in parallel
- `/js-resolve_pr_parallel` - Resolve PR comments in parallel
- `/js-reproduce-bug` - Reproduce bugs using logs and console
- `/js-create-agent-skill` - Create or edit Claude Code skills
- `/js-heal-skill` - Fix skill documentation issues
- `/js-codify` - Document solved problems for knowledge base

**New Skills (10)**
- `js-sindre-sorhus-package-writer` - Write npm packages following Sindre Sorhus patterns
- `js-compound-docs` - Capture solved problems as categorized documentation
- `js-create-agent-skills` - Expert guidance for creating Claude Code skills
- `js-modern-nodejs-style` - Write Node.js code with modern, pragmatic patterns
- `js-dspy-python` - Build type-safe LLM applications with DSPy Python
- `js-every-style-editor` - Review copy for Every's style guide compliance
- `js-file-todos` - File-based todo tracking system
- `js-frontend-design` - Create production-grade frontend interfaces
- `js-git-worktree` - Manage Git worktrees for parallel development
- `js-skill-creator` - Guide for creating effective Claude Code skills

### Changed

**Agents Reorganized by Category**
- `review/` (10 agents) - Code quality, security, performance reviewers
- `research/` (4 agents) - Documentation, patterns, history analysis
- `design/` (3 agents) - UI/design review and iteration
- `workflow/` (6 agents) - PR resolution, bug validation, linting
- `docs/` (1 agent) - README generation

---

## [1.1.0] - 2024-11-22

### Added

**js-gemini-imagegen Skill**
- Text-to-image generation with Google's Gemini API
- Image editing and manipulation
- Multi-turn refinement via chat interface
- Multiple reference image composition (up to 14 images)

### Fixed
- Corrected component counts in documentation (17 agents, not 15)

### Documentation
- Added comprehensive README with all components listed
- Added this changelog

---

## [1.0.0] - 2024-10-09

Initial release of the compound-engineering plugin (Node.js fork).

### Added

**17 Specialized Agents**

*Code Review (5)*
- `js-kieran-nodejs-reviewer` - Node.js code review with strict conventions
- `js-kieran-python-reviewer` - Python code review with quality standards
- `js-kieran-typescript-reviewer` - TypeScript code review
- `js-modern-nodejs-reviewer` - Node.js review from modern perspective
- `js-code-simplicity-reviewer` - Final pass for simplicity and minimalism

*Analysis & Architecture (4)*
- `js-architecture-strategist` - Architectural decisions and compliance
- `js-pattern-recognition-specialist` - Design pattern analysis
- `js-security-sentinel` - Security audits and vulnerability assessments
- `js-performance-oracle` - Performance analysis and optimization
- `js-data-integrity-guardian` - Database migrations and data integrity

*Research (4)*
- `js-framework-docs-researcher` - Framework documentation research
- `js-best-practices-researcher` - External best practices gathering
- `js-git-history-analyzer` - Git history and code evolution analysis
- `js-repo-research-analyst` - Repository structure and conventions

*Workflow (3)*
- `js-every-style-editor` - Every's style guide compliance
- `js-pr-comment-resolver` - PR comment resolution
- `js-feedback-codifier` - Feedback pattern codification

**6 Slash Commands**
- `/js-plan` - Create implementation plans
- `/js-review` - Comprehensive code reviews
- `/js-work` - Execute work items systematically
- `/js-triage` - Triage and prioritize issues
- `/js-resolve_todo_parallel` - Resolve TODOs in parallel
- `/js-generate_command` - Generate new slash commands

**Infrastructure**
- MIT license
- Plugin manifest (`plugin.json`)
- Pre-configured permissions for Node.js/TypeScript development
