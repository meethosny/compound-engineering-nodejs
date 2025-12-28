# Every Marketplace (Node.js Fork)

> **🚀 Node.js Developer Edition** — This is a fork optimized for Node.js and TypeScript developers. All Ruby/Rails patterns have been replaced with modern Node.js equivalents using Express, Fastify, Hono, and TypeScript best practices.

The official **Node.js Edition** of the Every marketplace, maintained by [Hosni Mohamed](https://github.com/meethosny). Currently featuring the Compound Engineering Node.js plugin.

## Quick Start

### Standard Installation
Run Claude and add the marketplace:

```bash
/plugin marketplace add https://github.com/meethosny/compound-engineering-nodejs
```

Then install the plugin:

```bash
/plugin install compound-engineering-nodejs
```

### One-Command Installation
Use the [Claude Plugins CLI](https://claude-plugins.dev) to skip the marketplace setup:

```bash
npx claude-plugins install https://github.com/meethosny/compound-engineering-nodejs
```

This automatically adds the marketplace and installs the plugin in a single step.

### Factory (Droid) quick start

1) Install Droid (Factory).

```bash
bunx droid-factory
```

What this does: copies Claude Code marketplace commands/agents/subagents and converts them to Droid format.

Next:
- Start Droid
- In Settings, enable Sub-agents

You're done: use this source from Droid. You don't need to add it in Claude Code anymore.

---

# Compounding Engineering Plugin

AI-powered development tools that get smarter with every use. **Includes 27 specialized agents, 19 commands, 12 skills, and 2 MCP servers.**

Transform how you plan, build, and review code using AI-powered tools that systematically improve your development workflow.

## What Is Compounding Engineering?

**Each unit of engineering work should make subsequent units of work easier—not harder.**

Traditional development accumulates technical debt. Every feature adds complexity. Every change increases maintenance burden. The codebase becomes harder to work with over time.

Compounding engineering inverts this. Each feature you build:
- Documents patterns for the next feature
- Creates reusable components that accelerate future work
- Establishes conventions that reduce decision fatigue
- Codifies knowledge that compounds across the team

This plugin provides the tools to make compounding engineering practical. It transforms vague ideas into structured plans, executes those plans systematically, and ensures every change meets your quality bar before merging.

```mermaid
graph LR
    A[Plan<br/>Plan it out<br/>in detail] --> B[Delegate<br/>Do the work]
    B --> C[Assess<br/>Make sure<br/>it works]
    C --> D[Codify<br/>Record<br/>learnings]
    D --> A

    style A fill:#f9f,stroke:#fff,stroke-width:2px,color:#333
    style B fill:#bbf,stroke:#fff,stroke-width:2px,color:#333
    style C fill:#bfb,stroke:#fff,stroke-width:2px,color:#333
    style D fill:#ffb,stroke:#fff,stroke-width:2px,color:#333
```

## How It Works

The plugin follows a three-step workflow that makes development compound:

### 1. Plan: Turn Ideas Into Structured Issues

Use `/compound-engineering-nodejs:plan` to transform feature descriptions into comprehensive GitHub issues.

**What it does:**
- Researches your codebase to find similar patterns and conventions
- Analyzes framework documentation and best practices
- Creates detailed acceptance criteria and implementation plans
- Generates code examples that follow your existing patterns

**The result:** Issues that make implementation easier because they've already done the research and planning work.

### 2. Work: Execute Plans Systematically

Use `/compound-engineering-nodejs:work` to execute work plans with isolated worktrees and systematic task tracking.

**What it does:**
- Creates isolated git worktrees for clean development
- Breaks down plans into trackable todos
- Executes tasks systematically with continuous validation
- Runs tests and quality checks after each change

**The result:** Features built correctly the first time, with full test coverage and no regressions.

### 3. Review: Ensure Quality Before Merging

Use `/compound-engineering-nodejs:review` to perform exhaustive multi-agent code reviews.

**What it does:**
- Checks out your PR in an isolated worktree for deep analysis
- Runs 12+ specialized review agents in parallel
- Identifies security issues, performance problems, and architectural concerns
- Creates trackable todos for every finding

**The result:** Code that meets your quality bar and documents learnings for future work.

## Practical Examples

### Example: Plan a New Feature

```bash
# Create a detailed GitHub issue from a feature description
claude /compound-engineering-nodejs:plan "Add user profile avatars with S3 upload and automatic resizing"
```

The command will:
1. Research how your codebase handles file uploads
2. Find similar features in your repository
3. Check framework documentation for best practices
4. Generate a complete issue with acceptance criteria, technical approach, and code examples

You can choose detail levels:
- **Minimal:** Quick issues for simple features
- **More:** Standard issues with technical considerations
- **A lot:** Comprehensive issues for major features

### Example: Execute a Work Plan

```bash
# Execute a plan document systematically
claude /compound-engineering-nodejs:work path/to/plan.md
```

The command will:
1. Create a feature branch and isolated worktree
2. Analyze the plan and create a comprehensive todo list
3. Execute each task systematically
4. Run tests after every change
5. Create a pull request when complete

### Example: Review a Pull Request

```bash
# Review the latest PR
claude /compound-engineering-nodejs:review

# Review a specific PR
claude /compound-engineering-nodejs:review 123

# Review from a GitHub URL
claude /compound-engineering-nodejs:review https://github.com/user/repo/pull/123
```

The command will:
1. Check out the PR in an isolated worktree
2. Run 12+ specialized review agents in parallel:
   - Language-specific reviewers (Node.js, TypeScript, Python)
   - Security sentinel for vulnerability scanning
   - Performance oracle for optimization opportunities
   - Architecture strategist for design review
   - Data integrity guardian for database concerns
3. Present findings one by one for triage
4. Create todos for approved findings

## All Commands

The plugin includes 19 commands for different stages of development:

### `/compound-engineering-nodejs:plan [feature description]`
Creates detailed GitHub issues from feature descriptions. Includes research, acceptance criteria, and implementation guidance.

### `/compound-engineering-nodejs:work [plan file]`
Executes work plans systematically with worktrees, todos, and continuous validation.

### `/compound-engineering-nodejs:review [PR number or URL]`
Performs exhaustive multi-agent code reviews with security, performance, and architecture analysis.

### `/compound-engineering-nodejs:triage`
Presents findings one by one for review and converts approved items into trackable todos.

### `/compound-engineering-nodejs:resolve_todo_parallel`
Resolves multiple todos in parallel with systematic execution and quality checks.

### `/compound-engineering-nodejs:generate_command`
Generates new Claude Code commands from descriptions.

## All Agents

The plugin includes 27 specialized agents that provide expertise in different areas:

### Code Review Specialists
- **modern-nodejs-reviewer:** Modern Node.js review with minimalist, pragmatic approach (TJ Holowaychuk + Matteo Collina + Yusuke Wada style)
- **kieran-nodejs-reviewer:** Node.js code review with strict conventions
- **kieran-typescript-reviewer:** TypeScript code review with type safety and best practices
- **kieran-python-reviewer:** Python code review with focus on clarity and conventions
- **code-simplicity-reviewer:** Identifies opportunities to simplify complex code
- **agent-native-reviewer:** Verifies agent-native architecture patterns (DSPy, structured prompting)
- **data-integrity-guardian:** Database design review and data consistency checks
- **data-migration-expert:** Validates ID mappings and data migration plans
- **deployment-verification-agent:** Pre-deployment checklists and verification tasks
- **julik-frontend-races-reviewer:** Spots race conditions in frontend code

### Quality Guardians
- **security-sentinel:** Comprehensive security audits and vulnerability detection
- **performance-oracle:** Performance analysis and optimization recommendations
- **data-integrity-guardian:** Database design review and data consistency checks

### Architecture & Patterns
- **architecture-strategist:** System design review and architectural guidance
- **pattern-recognition-specialist:** Identifies patterns and suggests improvements

### Research & Analysis
- **repo-research-analyst:** Analyzes repository patterns and conventions
- **best-practices-researcher:** Researches best practices for technologies
- **framework-docs-researcher:** Fetches relevant framework documentation
- **git-history-analyzer:** Analyzes git history for context and patterns

### Workflow & Communication
- **sorhus-readme-writer:** Creates READMEs following Sindre Sorhus style for npm packages
- **every-style-editor:** Edits content to match Every's style guide
- **feedback-codifier:** Converts feedback into actionable improvements
- **pr-comment-resolver:** Systematically resolves PR review comments
- **lint:** Runs ESLint, Prettier, and npm audit for JavaScript/TypeScript quality
- **bug-reproduction-validator:** Systematically reproduces and validates bug reports
- **spec-flow-analyzer:** Analyzes user flows and identifies gaps in specifications

## Why This Makes Development Compound

Traditional development tools help you work faster. Compounding engineering tools make future work easier.

**Every `/compound-engineering-nodejs:plan` you create:**
- Documents patterns that inform the next plan
- Establishes conventions that reduce planning time
- Builds institutional knowledge

**Every `/compound-engineering-nodejs:work` execution:**
- Creates reusable components
- Refines your testing approach
- Improves your development process

**Every `/compound-engineering-nodejs:review` you run:**
- Catches issues earlier
- Documents learnings for the team
- Raises the quality bar systematically

Over time, you're not just building features—you're building a development system that gets better with each use.

## Philosophy in Practice

The plugin embodies these compounding engineering principles:

**Prefer duplication over complexity:** Simple, clear code that's easy to understand beats complex abstractions. The kieran-nodejs-reviewer enforces this strictly.

**Document as you go:** Every command generates documentation—issues, todos, review findings—that makes future work easier.

**Quality compounds:** High-quality code is easier to modify. The multi-agent review system ensures every change meets your quality bar.

**Systematic beats heroic:** Consistent processes beat individual heroics. The `/compound-engineering-nodejs:work` command executes plans systematically, with continuous validation.

**Knowledge should be codified:** Learnings should be captured and reused. The research agents analyze your codebase to apply your own patterns back to you.

## Getting Started

1. Install the plugin using one of the methods above
2. Run `/compound-engineering-nodejs:plan` on your next feature idea
3. Use `/compound-engineering-nodejs:work` to execute the plan
4. Run `/compound-engineering-nodejs:review` before merging
5. Repeat, and watch your development process compound

Each cycle makes the next cycle easier. That's compounding engineering.

## Learn More

[Read the full story](https://every.to/source-code/my-ai-had-already-fixed-the-code-before-i-saw-it) about how compounding engineering transforms development workflows.