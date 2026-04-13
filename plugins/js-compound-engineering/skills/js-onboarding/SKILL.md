---
name: js-onboarding
description: "Generate or regenerate ONBOARDING.md to help new contributors understand a codebase. Use when the user asks to 'create onboarding docs', 'generate ONBOARDING.md', 'document this project for new developers', 'write onboarding documentation', 'vonboard', 'vonboarding', 'prepare this repo for a new contributor', 'refresh the onboarding doc', or 'update ONBOARDING.md'. Also use when someone needs to onboard a new team member and wants a written artifact, or when a codebase lacks onboarding documentation and the user wants to generate one."
---

# Generate Onboarding Document

Crawl a repository and generate `ONBOARDING.md` at the repo root -- a document that helps new contributors understand the codebase without requiring the creator to explain it.

Onboarding is a general problem in software, but it is more acute in fast-moving codebases where code is written faster than documentation -- whether through AI-assisted development, rapid prototyping, or simply a team that ships faster than it documents. This skill reconstructs the mental model from the code itself.

This skill always regenerates the document from scratch. It does not read or diff a previous version. If `ONBOARDING.md` already exists, it is overwritten.

## Core Principles

1. **Write for humans first** -- Clear prose that a new developer can read and understand. Agent utility is a side effect of good human writing, not a separate goal.
2. **Show, don't just tell** -- Use ASCII diagrams for architecture and flow, markdown tables for structured information, and backtick formatting for all file paths, commands, and code references.
3. **Six sections, each earning its place** -- Every section answers a question a new contributor will ask in their first hour. No speculative sections. Section 2 may be skipped for pure infrastructure with no consuming audience, producing five sections.
4. **State what you can observe, not what you must infer** -- Do not fabricate design rationale or assess fragility. If the code doesn't reveal why a decision was made, don't guess.
5. **Never include secrets** -- The onboarding document is committed to the repository. Never include API keys, tokens, passwords, connection strings with credentials, or any other secret values. Reference environment variable *names* (`STRIPE_SECRET_KEY`), never their *values*. If a `.env` file contains actual secrets, extract only the variable names.
6. **Link, don't duplicate** -- When existing documentation covers a topic well, link to it inline rather than re-explaining.

## Execution Flow

### Phase 1: Gather Inventory

Run the bundled inventory script (`scripts/inventory.mjs`) to get a structural map of the repository without reading every file:

```bash
node scripts/inventory.mjs --root .
```

Parse the JSON output. This provides:
- Project name, languages, frameworks, package manager, test framework
- Directory structure (top-level + one level into source directories)
- Entry points per detected ecosystem
- Available scripts/commands
- Existing documentation files (with first-heading titles for triage)
- Test infrastructure
- Infrastructure and external dependencies (env files, docker services, detected integrations)
- Monorepo structure (if applicable)

If the script fails or returns an error field, report the issue to the user and stop. Do not attempt to write `ONBOARDING.md` from incomplete data.

### Phase 2: Read Key Files

Guided by the inventory, read files that are essential for understanding the codebase. Use the native file-read tool (not shell commands).

**What to read and why:**

Read files in parallel batches where there are no dependencies between them. For example, batch README.md, entry points, and AGENTS.md/CLAUDE.md together in a single turn since none depend on each other's content.

Only read files whose content is needed to write the six sections with concrete, specific detail. The inventory already provides structure, languages, frameworks, scripts, and entry point paths -- don't re-read files just to confirm what the inventory already says. Different repos need different amounts of reading; a small CLI tool might need 4 files, a complex monorepo might need 20. Let the sections drive what you read, not an arbitrary count.

**Priority order:**

1. **README.md** (if exists) -- for project purpose and setup instructions
2. **Primary entry points** -- the files listed in `entryPoints` from the inventory. These reveal what the application does when it starts.
3. **Route/controller files** -- look for `src/routes/`, `src/api/`, `src/controllers/`, or similar directories from the inventory structure. Read the main route file to understand the primary flow.
4. **Configuration files that reveal architecture and external dependencies** -- `docker-compose.yml`, `.env.example`, `.env.sample`, database config, `next.config.*`, `vite.config.*`, or similar. Only read these if they exist in the inventory. **Never read `.env` itself** -- only `.env.example` or `.env.sample` templates. Extract variable names only, never values.
5. **AGENTS.md or CLAUDE.md** (if exists) -- for project conventions and patterns already documented.
6. **Discovered documentation** -- the inventory's `docs` list includes each file's title (first heading). Use those titles to decide which docs are relevant to the five sections without reading them first. Only read the full content of docs whose titles indicate direct relevance. Skip dated brainstorm/plan files unless the focus hint specifically calls for them.

Do not read files speculatively. Every file read should be justified by the inventory output and traceable to a section that needs it.

### Phase 3: Write ONBOARDING.md

Synthesize the inventory data and key file contents into the sections defined below. Write the file to the repo root.

**Title**: Use `# {Project Name} Onboarding Guide` as the document heading. Derive the project name from the inventory. Do not use the filename as a heading.

**Writing style -- the document should read like a knowledgeable teammate explaining the project over coffee, not like generated documentation.**

Voice and tone:
- Write in second person ("you") -- speak directly to the new contributor
- Use active voice and present tense: "The router dispatches requests to handlers" not "Requests are dispatched by the router to handlers"
- Be direct. Lead sentences with what matters, not with setup: "Run `npm run dev` to start the server" not "In order to start the development server, you will need to run the following command"
- Match the formality of the codebase. A scrappy prototype gets casual prose. An enterprise system gets more precise language. Read the README and existing docs for tone cues.

Clarity:
- Every sentence should teach the reader something or tell them what to do. Cut any sentence that doesn't.
- Prefer concrete over abstract: "`src/services/billing.ts` charges the customer's card" not "The billing module handles payment-related business logic"
- When introducing a term, define it immediately in context. Don't make the reader scroll to a glossary.
- Use the simplest word that's accurate. "Use" not "utilize." "Start" not "initialize." "Send" not "transmit."

What to avoid:
- Filler and throat-clearing: "It's important to note that", "As mentioned above", "In this section we will"
- Vague summarization: "This module handles various aspects of..." -- say specifically what it does
- Hedge words when stating facts: "This essentially serves as", "This is basically" -- if you know what it does, say it plainly
- Superlatives and marketing language: "robust", "powerful", "comprehensive", "seamless"
- Meta-commentary about the document itself: "This document aims to..." -- just do the thing

**Formatting requirements -- apply consistently throughout:**
- Use backticks for all file names (`package.json`), paths (`src/routes/`), commands (`npm test`), function/class names, environment variables, and technical terms
- Use markdown headers (`##`) for each section
- Use ASCII diagrams and markdown tables where specified below
- Use bold for emphasis sparingly
- Keep paragraphs short -- 2-4 sentences

**Section separators** -- Insert a horizontal rule (`---`) between each `##` section.

**Width constraint for code blocks -- 80 columns max.** Apply these rules to all content inside ``` fences:

- **ASCII architecture diagrams**: Stack boxes vertically instead of laying them out horizontally. Never place more than 2 boxes on the same horizontal line, and keep each box label under 20 characters.
- **Flow diagrams**: Keep file path + annotation under 80 chars.
- **Directory trees**: Keep inline `# comments` under 30 characters.

#### Section 1: What Is This?

Answer: What does this project do, who is it for, and what problem does it solve?

Draw from `README.md`, manifest descriptions (e.g., `package.json` description field), and what the entry points reveal about the application's purpose.

Keep to 1-3 paragraphs.

#### Section 2: How It's Used

Answer: What does it look like to be on the consuming side of this project?

Title this section based on who consumes the project:

- **End-user product** -- Title: **"User Experience"**
- **Developer tool** -- Title: **"Developer Experience"**
- **Both** -- Title: **"User and Developer Experience"**

Skip this section only for codebases with no consuming audience (pure infrastructure, internal deployment tooling).

---

#### Section 3: How Is It Organized?

Answer: What is the architecture, what are the key modules, how do they connect, and what does the system depend on externally?

Cover both the **internal structure** and the **system boundary**.

Include an ASCII directory tree, module responsibility table, and external dependencies table as appropriate.

#### Section 4: Key Concepts and Abstractions

Answer: What vocabulary and patterns does someone need to understand to talk about this codebase?

Cover domain terms and architectural abstractions in a single table. Aim for 5-15 entries.

#### Section 5: Primary Flows

Answer: What happens when the main things this app does actually happen?

Trace one flow per distinct surface or user type. Include an ASCII flow diagram for the most important flow.

#### Section 6: Developer Guide

Answer: How do I set up the project, run it, and make common changes?

Cover: Setup, Running and testing, Common change patterns, Key files to start with (for complex projects), Practical tips (for complex projects).

### Phase 4: Quality Check

Before writing the file, verify:

- [ ] Every section answers its question without padding or filler
- [ ] No secrets, API keys, tokens, passwords, or credential values anywhere
- [ ] No fabricated design rationale
- [ ] File paths referenced correspond to real files from the inventory
- [ ] All technical terms use backtick formatting
- [ ] All code block content fits within 80 columns
- [ ] ASCII diagrams are present in the architecture and/or primary flow sections
- [ ] Writing is direct and concrete

Write the file to the repo root as `ONBOARDING.md`.

### Phase 5: Present Result

After writing, inform the user that `ONBOARDING.md` has been generated. Offer next steps:

1. Open the file for review
2. Share to Proof
3. Done
