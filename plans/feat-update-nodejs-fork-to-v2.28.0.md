# Plan: Update Node.js Fork to Match Original Plugin v2.28.0

**Date:** 2026-01-29
**Type:** Feature Enhancement (Major Update)
**Target Version:** 3.1.0 (Node.js Fork)

---

## Overview

Update the `compound-engineering-nodejs` plugin to incorporate all new features from the original `compound-engineering` plugin (v2.28.0), while maintaining Node.js-first philosophy. This involves adding missing commands, agents, and skills while adapting any Ruby/Rails-specific content to Node.js equivalents.

## Problem Statement

The Node.js fork is significantly behind the original plugin:

| Component | Original (v2.28.0) | Node.js Fork (v2.15.1) | Gap |
|-----------|-------------------|------------------------|-----|
| Agents | 28 | 27 | -1 |
| Commands | 24 | 19 | -5 |
| Skills | 15 | 12 | -3 |
| MCP Servers | 1 (context7 only) | 2 (context7 + playwright) | Different approach |

The original plugin has evolved with:
- New `/lfg` autonomous workflow command
- New `/workflows:brainstorm` command for pre-planning
- New `/deepen-plan` command for research enhancement
- New `/agent-native-audit` command for architecture review
- New `/feature-video` and `/test-browser` commands for browser automation
- New `brainstorming` skill for collaborative dialogue
- New `rclone` skill for cloud file transfers
- Enhanced `workflows:work` with incremental commits and branch safety
- Replaced Playwright MCP with `agent-browser` CLI

## Proposed Solution

### Decision: Adopt Original's agent-browser CLI Approach

**Rationale:** The original plugin moved FROM Playwright MCP TO agent-browser CLI (v2.26.0) for simpler, Bash-based browser automation. This is a deliberate design decision we should follow because:

1. **Simpler** - No MCP server complexity
2. **More portable** - Works via npm global install
3. **Better for Node.js developers** - Already npm-native

**Action:** Remove Playwright MCP server, add agent-browser skill instead.

---

## Implementation Phases

### Phase 1: Add Missing Language-Agnostic Agents (1 agent)

- [x] **1.1** Copy `learnings-researcher.md` from original to `agents/research/`
  - This agent searches `docs/solutions/` for institutional knowledge
  - 100% language-agnostic - no changes needed
  - File: `agents/research/learnings-researcher.md`

### Phase 2: Add Missing Commands (5 commands)

- [x] **2.1** Add `/workflows:brainstorm` command
  - Copy from `commands/workflows/brainstorm.md`
  - 100% language-agnostic - no changes needed
  - File: `commands/workflows/brainstorm.md`

- [x] **2.2** Add `/agent-native-audit` command
  - Copy from `commands/agent-native-audit.md`
  - 100% language-agnostic - no changes needed
  - File: `commands/agent-native-audit.md`

- [x] **2.3** Add `/deepen-plan` command
  - Copy from `commands/deepen-plan.md`
  - **Adaptation needed:** Replace `dhh-rails-style` skill reference with `modern-nodejs-style`
  - File: `commands/deepen-plan.md`

- [x] **2.4** Add `/feature-video` command
  - Copy from `commands/feature-video.md`
  - **Adaptation needed:**
    - Replace Rails route mapping patterns with Node.js equivalents (Express, Fastify, Next.js)
    - Update file pattern table for Node.js conventions
    - Replace `bin/dev` with `npm run dev`
  - File: `commands/feature-video.md`

- [x] **2.5** Add `/lfg` command
  - Copy from `commands/lfg.md`
  - **Adaptation needed:** Replace `test-browser` with appropriate Node.js browser test command
  - This is an orchestration command - minimal changes
  - File: `commands/lfg.md`

### Phase 3: Replace Playwright MCP with agent-browser Skill (1 skill + remove MCP)

- [x] **3.1** Add `agent-browser` skill
  - Copy from `skills/agent-browser/SKILL.md`
  - 100% language-agnostic - CLI-based, no changes needed
  - Create directory: `skills/agent-browser/`
  - File: `skills/agent-browser/SKILL.md`

- [x] **3.2** Remove Playwright MCP server from plugin.json
  - Remove the `playwright` entry from `mcpServers` in `.claude-plugin/plugin.json`
  - Keep `context7` MCP server (HTTP-based, no issues)

- [x] **3.3** Rename `playwright-test.md` to `test-browser.md`
  - Update command to use agent-browser CLI instead of Playwright MCP tools
  - **Adaptation needed:**
    - Replace all Playwright MCP tool calls with agent-browser CLI commands
    - Update route mapping patterns for Node.js (Express, Fastify, Next.js routes)
    - Update server start command from Rails to Node.js
  - File: `commands/test-browser.md`

### Phase 4: Add Missing Language-Agnostic Skills (2 skills)

- [x] **4.1** Add `brainstorming` skill
  - Copy from `skills/brainstorming/SKILL.md`
  - 100% language-agnostic - no changes needed
  - Create directory: `skills/brainstorming/`
  - File: `skills/brainstorming/SKILL.md`

- [x] **4.2** Add `rclone` skill
  - Copy from `skills/rclone/SKILL.md`
  - 100% language-agnostic - CLI-based, no changes needed
  - Create directory: `skills/rclone/`
  - File: `skills/rclone/SKILL.md`

### Phase 5: Update Existing Commands with Original's Improvements

- [x] **5.1** Update `workflows:work` command
  - Add incremental commits feature
  - Add branch safety (check if on feature branch or default branch)
  - Add checkbox tracking (mark `[ ]` → `[x]` in plan files)
  - Add Compound Engineered badge to PR template
  - Replace `bin/dev` → `npm run dev`
  - Keep Node.js-specific reviewer references (kieran-nodejs-reviewer)

- [x] **5.2** Update `workflows:plan` command
  - Checked original - no significant changes needed for Node.js fork

### Phase 6: Update Metadata Files

- [x] **6.1** Update `.claude-plugin/plugin.json`
  - Version: `2.15.1` → `3.1.0`
  - Update description counts: `28 agents, 24 commands, 15 skills, 1 MCP server`
  - Remove Playwright from mcpServers
  - Update agent list with learnings-researcher

- [x] **6.2** Update `../../.claude-plugin/marketplace.json`
  - Match plugin.json description and version

- [x] **6.3** Update `README.md`
  - Update component counts table
  - Add new agents to agents table
  - Add new commands to commands table
  - Add new skills to skills table
  - Remove Playwright MCP, add agent-browser CLI reference
  - Update any Rails references to Node.js equivalents

- [x] **6.4** Update `CHANGELOG.md`
  - Document all additions in v3.1.0 section
  - Note the switch from Playwright MCP to agent-browser CLI
  - List all new components

---

## File-by-File Changes

### New Files to Create

```
plugins/compound-engineering-nodejs/
├── agents/
│   └── research/
│       └── learnings-researcher.md          # Copy from original (no changes)
├── commands/
│   ├── workflows/
│   │   └── brainstorm.md                    # Copy from original (no changes)
│   ├── agent-native-audit.md                # Copy from original (no changes)
│   ├── deepen-plan.md                       # Copy + adapt skill refs
│   ├── feature-video.md                     # Copy + adapt route mapping
│   ├── lfg.md                               # Copy + adapt command refs
│   └── test-browser.md                      # Rename from playwright-test + full rewrite
└── skills/
    ├── agent-browser/
    │   └── SKILL.md                         # Copy from original (no changes)
    ├── brainstorming/
    │   └── SKILL.md                         # Copy from original (no changes)
    └── rclone/
        └── SKILL.md                         # Copy from original (no changes)
```

### Files to Modify

```
plugins/compound-engineering-nodejs/
├── .claude-plugin/
│   └── plugin.json                          # Update version, counts, remove Playwright MCP
├── commands/
│   └── workflows/
│       └── work.md                          # Add incremental commits, branch safety
├── README.md                                # Update all tables and counts
└── CHANGELOG.md                             # Document all changes
.claude-plugin/
└── marketplace.json                         # Update version and description
```

### Files to Delete

```
plugins/compound-engineering-nodejs/
└── commands/
    └── playwright-test.md                   # Replaced by test-browser.md
```

---

## Adaptation Details

### Route Mapping for Node.js (for test-browser, feature-video)

Replace Rails route mapping:

| Original (Rails) | Node.js Equivalent |
|-----------------|-------------------|
| `app/views/users/*` | `src/pages/users/*`, `app/users/*`, `views/users/*` |
| `app/controllers/settings_controller.rb` | `src/routes/settings.ts`, `controllers/settings.js` |
| `app/javascript/controllers/*_controller.js` | `src/components/*`, `public/js/*` |
| `app/components/*_component.rb` | `src/components/*`, `components/*` |
| `app/views/layouts/*` | `src/layouts/*`, `views/layouts/*` |
| `app/assets/stylesheets/*` | `src/styles/*`, `public/css/*`, `styles/*` |
| `app/helpers/*_helper.rb` | `src/utils/*`, `helpers/*`, `lib/*` |

### Framework-Specific Patterns

```markdown
| File Pattern | Route(s) |
|-------------|----------|
| `src/pages/**/*.tsx` (Next.js) | Corresponding routes based on file-system routing |
| `src/app/**/*.tsx` (Next.js App Router) | Corresponding routes based on folder structure |
| `routes/*.ts` (Express/Fastify) | Routes defined in the file |
| `src/routes/*.ts` (Hono) | Routes defined in the file |
| `src/components/**/*.tsx` | Pages importing those components |
| `views/**/*.ejs` (Express views) | Routes rendering those views |
```

### Command References Update

In `/deepen-plan`, replace:
- `dhh-rails-style` → `modern-nodejs-style`
- `kieran-rails-reviewer` → `kieran-nodejs-reviewer`
- `andrew-kane-gem-writer` → `sindre-sorhus-package-writer`

---

## Acceptance Criteria

### Functional Requirements

- [x] All 5 new commands work correctly when invoked
- [x] `learnings-researcher` agent can search `docs/solutions/`
- [x] `agent-browser` skill provides working browser automation
- [x] `brainstorming` skill integrates with `/workflows:plan`
- [x] `rclone` skill provides cloud upload instructions
- [x] `/lfg` orchestrates the full workflow correctly
- [x] `/test-browser` works with agent-browser CLI (not Playwright MCP)
- [x] `/feature-video` records and uploads videos correctly

### Non-Functional Requirements

- [x] No Ruby/Rails code or patterns remain in any file
- [x] All route mappings use Node.js conventions
- [x] All test commands use `npm test` not `bin/rails test`
- [x] All dev server commands use `npm run dev` not `bin/dev`

### Quality Gates

- [x] Component counts match actual files
- [x] plugin.json, marketplace.json, README.md all have matching counts
- [x] CHANGELOG.md documents all changes
- [x] All JSON files valid (pass `jq .`)

---

## Risk Analysis

| Risk | Mitigation |
|------|------------|
| agent-browser CLI may not be installed | Add installation check and instructions at start of commands |
| Breaking change removing Playwright MCP | Document migration in CHANGELOG, agent-browser provides equivalent features |
| Route mapping may miss framework patterns | Include patterns for Express, Fastify, Hono, Next.js, Remix |
| Version jump from 2.15.1 to 3.1.0 may confuse | Document as MINOR (3.1.0) since it adds features, no breaking API changes |

---

## Summary of Final Component Counts

After this update:

| Component | Count | Details |
|-----------|-------|---------|
| **Agents** | 28 | +1 (learnings-researcher) |
| **Commands** | 24 | +5 (brainstorm, agent-native-audit, deepen-plan, feature-video, lfg, test-browser) -1 (playwright-test removed) |
| **Skills** | 15 | +3 (agent-browser, brainstorming, rclone) |
| **MCP Servers** | 1 | -1 (removed Playwright, kept context7) |

---

## References

### Internal References
- Original plugin: `compound-engineering-plugin-main/plugins/compound-engineering/`
- Node.js fork: `plugins/compound-engineering-nodejs/`
- CLAUDE.md versioning requirements: `plugins/compound-engineering-nodejs/CLAUDE.md`

### Original Plugin Changelog
- v2.28.0: Added `/workflows:brainstorm`, enhanced `/workflows:plan`
- v2.27.0: Added Q&A to `/workflows:plan`, enhanced `/workflows:work`
- v2.26.0: Added `/lfg`, replaced Playwright with agent-browser
- v2.25.0: Replaced Playwright MCP with agent-browser skill
- v2.23.0: Added `/agent-native-audit`

---

## Implementation Order

Execute in this order for minimal conflicts:

1. **Phase 1** - Add learnings-researcher agent (independent)
2. **Phase 4** - Add brainstorming and rclone skills (independent)
3. **Phase 3** - Add agent-browser skill, remove Playwright MCP, create test-browser
4. **Phase 2** - Add new commands (depends on agent-browser skill)
5. **Phase 5** - Update existing commands (depends on all skills being available)
6. **Phase 6** - Update metadata files (must be last, after all files exist)

---

## Open Questions

None - all requirements are clear from the original plugin analysis.

---

## Next Steps

→ Run `/workflows:work plans/feat-update-nodejs-fork-to-v2.28.0.md` to begin implementation
