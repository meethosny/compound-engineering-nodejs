---
name: js-setup
description: This skill should be used when configuring which review agents run during /js-workflows:review and /js-workflows:work. It auto-detects the project stack and writes a js-compound-engineering.local.md settings file.
---

# Setup - Review Agent Configurator

Interactive configurator for which review agents run during `/js-workflows:review` and `/js-workflows:work`. Auto-detects the project type and writes a `js-compound-engineering.local.md` settings file.

## When to Use

- First time running `/js-workflows:review` (no settings file exists)
- Changing which agents run during reviews
- Setting up a new project with compound-engineering

## Workflow

### 1. Detect Project Stack

Scan the repository root to identify the project type:

```bash
ls package.json tsconfig.json .eslintrc* next.config* nuxt.config* vite.config* webpack.config* requirements.txt pyproject.toml setup.py Pipfile 2>/dev/null
```

**Detection rules:**

| Files Found | Stack | Default Agents |
|-------------|-------|----------------|
| `tsconfig.json` | TypeScript | js-kieran-typescript-reviewer, js-code-simplicity-reviewer, js-security-sentinel, js-performance-oracle |
| `package.json` (no tsconfig) | Node.js | js-kieran-nodejs-reviewer, js-modern-nodejs-reviewer, js-code-simplicity-reviewer, js-security-sentinel, js-performance-oracle |
| `requirements.txt` or `pyproject.toml` or `setup.py` or `Pipfile` | Python | js-kieran-python-reviewer, js-code-simplicity-reviewer, js-security-sentinel, js-performance-oracle |
| `package.json` + `tsconfig.json` | TypeScript (full) | js-kieran-typescript-reviewer, js-kieran-nodejs-reviewer, js-modern-nodejs-reviewer, js-code-simplicity-reviewer, js-security-sentinel, js-performance-oracle |
| None of the above | Generic | js-code-simplicity-reviewer, js-security-sentinel, js-performance-oracle |

**Frontend detection (additive):**

| Files Found | Additional Agents |
|-------------|------------------|
| `next.config.*` or `nuxt.config.*` or `vite.config.*` or `webpack.config.*` or `src/**/*.{tsx,jsx,vue,svelte}` | js-julik-frontend-races-reviewer |

### 2. Present Detection Results

Show the user what was detected and proposed:

```
Detected: TypeScript + React (Next.js)

Proposed review agents:
  1. js-kieran-typescript-reviewer
  2. js-kieran-nodejs-reviewer
  3. js-modern-nodejs-reviewer
  4. js-code-simplicity-reviewer
  5. js-security-sentinel
  6. js-performance-oracle
  7. js-julik-frontend-races-reviewer

Always-on (not configurable):
  - js-agent-native-reviewer
  - js-learnings-researcher
```

Use **AskUserQuestion** to ask:

**Question:** "Accept these review agents, or customize?"

**Options:**
1. **Accept defaults** - Use the detected configuration
2. **Customize** - Choose which agents to include
3. **Minimal** - Only code-simplicity + security (fastest reviews)

### 3. Customize (if selected)

If user chooses "Customize", present each agent category with **AskUserQuestion** (multiSelect: true):

**Node.js/TypeScript reviewers:**
- js-kieran-typescript-reviewer
- js-kieran-nodejs-reviewer
- js-modern-nodejs-reviewer

**Quality reviewers:**
- js-code-simplicity-reviewer
- js-pattern-recognition-specialist
- js-architecture-strategist

**Security & Performance:**
- js-security-sentinel
- js-performance-oracle

**Frontend:**
- js-julik-frontend-races-reviewer

**Data:**
- js-data-integrity-guardian

### 4. Write Settings File

Write `js-compound-engineering.local.md` to the repository root:

```markdown
# js-compound-engineering Settings

## Review Agents

review_agents:
- js-kieran-typescript-reviewer
- js-kieran-nodejs-reviewer
- js-modern-nodejs-reviewer
- js-code-simplicity-reviewer
- js-security-sentinel
- js-performance-oracle
- js-julik-frontend-races-reviewer

## Notes

- Edit this file to change which agents run during `/js-workflows:review`
- The agents `js-agent-native-reviewer` and `js-learnings-researcher` always run regardless of this setting
- Conditional agents (schema-drift-detector, data-migration-expert, deployment-verification-agent) run based on PR file patterns
- Re-run `/js-compound-engineering:js-setup` to reconfigure interactively
```

### 5. Add to .gitignore (Optional)

Use **AskUserQuestion** to ask:

**Question:** "Add `js-compound-engineering.local.md` to .gitignore? (Team-shared vs personal config)"

**Options:**
1. **Yes, personal config** - Add to .gitignore (each dev configures their own)
2. **No, share with team** - Commit the settings file so the team uses the same agents

If "Yes": append `js-compound-engineering.local.md` to `.gitignore`.

### 6. Confirm

```
Setup complete! Settings written to js-compound-engineering.local.md

Your review workflow will now use 7 agents instead of the full 11.
Run /js-workflows:review to try it out.
```
