---
name: js-git-commit-push-pr
description: Commit, push, and open a PR with an adaptive, value-first description. Use when the user says "commit and PR", "push and open a PR", "ship this", "create a PR", "open a pull request", "commit push PR", or wants to go from working changes to an open pull request in one step. Also use when the user says "update the PR description", "refresh the PR description", "freshen the PR", or wants to rewrite an existing PR description. Produces PR descriptions that scale in depth with the complexity of the change, avoiding cookie-cutter templates.
---

# Git Commit, Push, and PR

Go from working tree changes to an open pull request in a single workflow, or update an existing PR description. The key differentiator of this skill is PR descriptions that communicate *value and intent* proportional to the complexity of the change.

## Mode detection

If the user is asking to update, refresh, or rewrite an existing PR description (with no mention of committing or pushing), this is a **description-only update**. The user may also provide a focus for the update (e.g., "update the PR description and add the benchmarking results"). Note any focus instructions for use in DU-3.

For description-only updates, follow the Description Update workflow below. Otherwise, follow the full workflow.

## Context

**If you are not Claude Code**, skip to the "Context fallback" section below and run the command there to gather context.

**If you are Claude Code**, the six labeled sections below (Git status, Working tree diff, Current branch, Recent commits, Remote default branch, Existing PR check) contain pre-populated data. Use them directly throughout this skill -- do not re-run these commands.

**Git status:**
!`git status`

**Working tree diff:**
!`git diff HEAD`

**Current branch:**
!`git branch --show-current`

**Recent commits:**
!`git log --oneline -10`

**Remote default branch:**
!`git rev-parse --abbrev-ref origin/HEAD 2>/dev/null || echo 'DEFAULT_BRANCH_UNRESOLVED'`

**Existing PR check:**
!`gh pr view --json url,title,state 2>/dev/null || echo 'NO_OPEN_PR'`

### Context fallback

**If you are Claude Code, skip this section -- the data above is already available.**

Run this single command to gather all context:

```bash
printf '=== STATUS ===\n'; git status; printf '\n=== DIFF ===\n'; git diff HEAD; printf '\n=== BRANCH ===\n'; git branch --show-current; printf '\n=== LOG ===\n'; git log --oneline -10; printf '\n=== DEFAULT_BRANCH ===\n'; git rev-parse --abbrev-ref origin/HEAD 2>/dev/null || echo 'DEFAULT_BRANCH_UNRESOLVED'; printf '\n=== PR_CHECK ===\n'; gh pr view --json url,title,state 2>/dev/null || echo 'NO_OPEN_PR'
```

---

## Description Update workflow

### DU-1: Confirm intent

Ask the user to confirm: "Update the PR description for this branch?" Use the platform's blocking question tool (`AskUserQuestion` in Claude Code, `request_user_input` in Codex, `ask_user` in Gemini). If no question tool is available, present the question and wait for the user's reply.

If the user declines, stop.

### DU-2: Find the PR

Use the current branch and existing PR check from the context above. If the current branch is empty (detached HEAD), report that there is no branch to update and stop.

If the existing PR check returned JSON with `state: OPEN`, an open PR exists -- proceed to DU-3. Otherwise (`NO_OPEN_PR` or a non-OPEN state), report no open PR and stop.

### DU-3: Write and apply the updated description

Read the current PR description:

```bash
gh pr view --json body --jq '.body'
```

Build the updated description in this order:

1. **Get the full branch diff** -- follow "Detect the base branch and remote" and "Gather the branch scope" in Step 6. Use the PR found in DU-2 as the existing PR for base branch detection.
2. **Classify commits** -- follow "Classify commits before writing" in Step 6. This matters especially for description updates, where the recent commits that prompted the update are often fix-up work (code review fixes, lint fixes) rather than feature work.
3. **Decide on evidence** -- check if the current PR description already contains evidence (a `## Demo` or `## Screenshots` section with image embeds). If evidence exists, preserve it unless the user's focus specifically asks to refresh or remove it. If no evidence exists, follow "Evidence for PR descriptions" in Step 6. Description-only updates may be specifically intended to add evidence.
4. **Write the new description** -- follow the writing principles in Step 6, driven by feature commits, final diff, and evidence decision.
   - If the user provided a focus, incorporate it alongside the branch diff context.
5. **Compare and confirm** -- summarize the substantial changes vs the current description (e.g., "Added coverage of the new caching layer, updated test plan, removed outdated migration notes").
   - If the user provided a focus, confirm it was addressed.
   - Ask the user to confirm before applying. Use the platform's blocking question tool (`AskUserQuestion` in Claude Code, `request_user_input` in Codex, `ask_user` in Gemini). If no question tool is available, present the summary and wait for the user's reply.

If confirmed, apply:

```bash
gh pr edit --body "$(cat <<'EOF'
Updated description here
EOF
)"
```

Report the PR URL.

---

## Full workflow

### Step 1: Gather context

Use the context above (git status, working tree diff, current branch, recent commits, remote default branch, and existing PR check). All data needed for this step and Step 3 is already available -- do not re-run those commands.

The remote default branch value returns something like `origin/main`. Strip the `origin/` prefix to get the branch name. If it returned `DEFAULT_BRANCH_UNRESOLVED` or a bare `HEAD`, try:

```bash
gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'
```

If both fail, fall back to `main`.

If the current branch from the context above is empty, the repository is in detached HEAD state. Explain that a branch is required before committing and pushing. Ask whether to create a feature branch now. Use the platform's blocking question tool (`AskUserQuestion` in Claude Code, `request_user_input` in Codex, `ask_user` in Gemini). If no question tool is available, present the options and wait for the user's reply.

- If the user agrees, derive a descriptive branch name from the change content, create it with `git checkout -b <branch-name>`, then run `git branch --show-current` again and use that result as the current branch name for the rest of the workflow.
- If the user declines, stop.

If the git status from the context above shows a clean working tree (no staged, modified, or untracked files), determine the next action based on upstream state and PR status. The current branch and existing PR check are already available from the context above. Additionally:

1. Run `git rev-parse --abbrev-ref --symbolic-full-name @{u}` to check whether an upstream is configured.
2. If the command succeeds, run `git log <upstream>..HEAD --oneline` using the upstream name from the previous command.

Then follow this decision tree:

- **On default branch** (`main`, `master`, or the resolved default branch) with no upstream or unpushed commits:
  - Ask whether to create a feature branch first (pushing the default branch directly is not supported by this workflow). Use the platform's blocking question tool (`AskUserQuestion` in Claude Code, `request_user_input` in Codex, `ask_user` in Gemini). If no question tool is available, present the options and wait for the user's reply.
  - If yes -> create branch with `git checkout -b <branch-name>`, continue from Step 5 (push)
  - If no -> stop
- **On default branch**, all commits pushed, no open PR:
  - Report there is no feature branch work to open as a PR. Stop.
- **No upstream configured** (feature branch, never pushed):
  - Skip Step 4 (commit), continue from Step 5 (push)
- **Unpushed commits exist** (feature branch, upstream configured):
  - Skip Step 4 (commit), continue from Step 5 (push)
- **All commits pushed, no open PR** (feature branch):
  - Skip Steps 4-5, continue from Step 6 (PR description) and Step 7 (create PR)
- **All commits pushed, open PR exists**:
  - Report that everything is up to date. Stop.

### Step 2: Determine conventions

Follow this priority order for commit messages *and* PR titles:

1. **Repo conventions already in context** -- If project instructions (AGENTS.md, CLAUDE.md, or similar) are loaded and specify conventions, follow those. Do not re-read these files; they are loaded at session start.
2. **Recent commit history** -- If no explicit convention exists, match the pattern visible in the last 10 commits.
3. **Default: conventional commits** -- `type(scope): description` as the fallback.

### Step 3: Check for existing PR

Use the current branch and existing PR check from the context above. If the current branch is empty, report that the workflow is in detached HEAD state and stop.

If the existing PR check returned JSON with `state: OPEN`, note the URL -- continue to Step 4 and Step 5, then skip to Step 7 (existing PR flow). Otherwise (`NO_OPEN_PR` or a non-OPEN state), continue to Step 4 through Step 8.

### Step 4: Branch, stage, and commit

1. If the current branch from the context above is `main`, `master`, or the resolved default branch from Step 1, create a descriptive feature branch first with `git checkout -b <branch-name>`. Derive the branch name from the change content.
2. Before staging everything together, scan the changed files for naturally distinct concerns. If modified files clearly group into separate logical changes (e.g., a refactor in one set of files and a new feature in another), create separate commits for each group. Keep this lightweight -- group at the **file level only** (no `git add -p`), split only when obvious, and aim for two or three logical commits at most. If it's ambiguous, one commit is fine.
3. For each commit group, stage and commit in a single call. Avoid `git add -A` or `git add .` to prevent accidentally including sensitive files. Follow the conventions from Step 2. Use a heredoc for the message:
   ```bash
   git add file1 file2 file3 && git commit -m "$(cat <<'EOF'
   commit message here
   EOF
   )"
   ```

### Step 5: Push

```bash
git push -u origin HEAD
```

### Step 6: Write the PR description

Before writing, determine the **base branch** and gather the **full branch scope**. The working-tree diff from Step 1 only shows uncommitted changes at invocation time -- the PR description must cover **all commits** that will appear in the PR.

#### Detect the base branch and remote

Resolve the base branch **and** the remote that hosts it. In fork-based PRs the base repository may correspond to a remote other than `origin` (commonly `upstream`).

Use this fallback chain. Stop at the first that succeeds:

1. **PR metadata** (if an existing PR was found in Step 3):
   ```bash
   gh pr view --json baseRefName,url
   ```
   Extract `baseRefName` as the base branch name. The PR URL contains the base repository (`https://github.com/<owner>/<repo>/pull/...`). Determine which local remote corresponds to that repository:
   ```bash
   git remote -v
   ```
   Match the `owner/repo` from the PR URL against the fetch URLs. Use the matching remote as the base remote. If no remote matches, fall back to `origin`.
2. **Remote default branch from context above:** If the remote default branch resolved (not `DEFAULT_BRANCH_UNRESOLVED`), strip the `origin/` prefix and use that. Use `origin` as the base remote.
3. **GitHub default branch metadata:**
   ```bash
   gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'
   ```
   Use `origin` as the base remote.
4. **Common branch names** -- check `main`, `master`, `develop`, `trunk` in order. Use the first that exists on the remote:
   ```bash
   git rev-parse --verify origin/<candidate>
   ```
   Use `origin` as the base remote.

If none resolve, ask the user to specify the target branch. Use the platform's blocking question tool (`AskUserQuestion` in Claude Code, `request_user_input` in Codex, `ask_user` in Gemini). If no question tool is available, present the options and wait for the user's reply.

#### Gather the branch scope

Once the base branch and remote are known, gather the full scope in as few calls as possible.

First, verify the remote-tracking ref exists and fetch if needed:

```bash
git rev-parse --verify <base-remote>/<base-branch> 2>/dev/null || git fetch --no-tags <base-remote> <base-branch>
```

Then gather the merge base, commit list, and full diff in a single call:

```bash
MERGE_BASE=$(git merge-base <base-remote>/<base-branch> HEAD) && echo "MERGE_BASE=$MERGE_BASE" && echo '=== COMMITS ===' && git log --oneline $MERGE_BASE..HEAD && echo '=== DIFF ===' && git diff $MERGE_BASE...HEAD
```

Use the full branch diff and commit list as the basis for the PR description -- not the working-tree diff from Step 1.

#### Evidence for PR descriptions

Decide whether evidence capture is possible from the full branch diff before writing the PR description.

**Evidence is possible** when the final diff changes observable product behavior that can be demonstrated from the workspace: UI rendering or interactions, CLI commands and output, API/library behavior with runnable example code, generated artifacts, or workflow behavior with visible output.

**Evidence is not possible** for docs-only, markdown-only, changelog-only, release metadata, CI/config-only, test-only, or pure internal refactors with no observable output change. It is also not possible when the behavior requires unavailable credentials, paid/cloud services, bot tokens, deploy-only infrastructure, or hardware the user has not provided. In those cases, do not ask about capturing evidence; omit the evidence section and, if relevant, mention the skip reason in the final user report.

When evidence is possible, ask whether to include it in the PR description. Use the platform's blocking question tool (`AskUserQuestion` in Claude Code, `request_user_input` in Codex, `ask_user` in Gemini). If no question tool is available, present the options and wait for the user's reply.

**Question:** "This PR has observable behavior. Capture evidence for the PR description?"

**Options:**
1. **Capture evidence now**: load the `js-ce-demo-reel` skill with a target description as the argument (e.g., "the new settings page" or "CLI output of the migrate command"). Infer the target from the branch diff. js-ce-demo-reel returns `Tier`, `Description`, and `URL`. Use the URL and description to build a `## Demo` or `## Screenshots` section (browser-reel/terminal-recording/screenshot-reel use "Demo", static uses "Screenshots").
2. **Use existing evidence**: ask the user for the URL or markdown embed, then include it in the PR body.
3. **Skip evidence**: write the PR description without an evidence section.

If the user chooses capture, check js-ce-demo-reel's output for failure: `Tier: skipped` or `URL: "none"` means no evidence was captured. Do not add a placeholder section. Summarize the skip reason in the final user report.

Place the evidence embed before the Compound Engineering badge, typically after the summary or within the changes section. Do not label test output as "Demo" or "Screenshots".

#### Classify commits before writing

Before writing the description, scan the commit list and classify each commit:

- **Feature commits** -- implement the purpose of the PR (new functionality, intentional refactors, design changes). These drive the description.
- **Fix-up commits** -- work product of getting the branch ready: code review fixes, lint/type error fixes, test fixes, rebase conflict resolutions, style cleanups, typo corrections in the new code. These are invisible to the reader.

Only feature commits inform the description. Fix-up commits are noise -- they describe the iteration process, not the end result. The full diff already includes whatever the fix-up commits changed, so their intent is captured without narrating them. When sizing and writing the description, mentally subtract fix-up commits: a branch with 12 commits but 9 fix-ups is a 3-commit PR in terms of description weight.

#### Frame the narrative before sizing

After classifying commits, articulate the PR's narrative frame:

1. **Before**: What was broken, limited, or impossible? (One sentence.)
2. **After**: What's now possible or improved? (One sentence.)
3. **Scope rationale** (only if the PR touches 2+ separable-looking concerns): Why do these ship together? (One sentence.)

This frame becomes the opening of the description. For small+simple PRs (the sizing table routes to 1-2 sentences), the "after" sentence alone may be the entire description -- that's fine.

#### Sizing the change

The description must be **adaptive** -- its depth should match the complexity of the change. A one-line bugfix does not need a table of performance results. A large architectural change should not be a bullet list.

Assess the PR along two axes before writing, based on the full branch diff:

- **Size**: How many files changed? How large is the diff?
- **Complexity**: Is this a straightforward change (rename, dependency bump, typo fix) or does it involve design decisions, trade-offs, new patterns, or cross-cutting concerns?

Use this to select the right description depth:

| Change profile | Description approach |
|---|---|
| Small + simple (typo, config, dep bump) | 1-2 sentences, no headers. Total body under ~300 characters. |
| Small + non-trivial (targeted bugfix, behavioral change) | Short "Problem / Fix" narrative, ~3-5 sentences. Enough for a reviewer to understand *why* without reading the diff. No headers needed unless there are two distinct concerns. |
| Medium feature or refactor | Open with the narrative frame (before/after/scope), then a section explaining what changed and why. Call out design decisions. |
| Large or architecturally significant | Full narrative: problem context, approach chosen (and why), key decisions, migration notes or rollback considerations if relevant. |
| Performance improvement | Include before/after measurements if available. A markdown table is effective here. |

**Brevity matters for small changes.** A 3-line bugfix with a 20-line PR description signals the author didn't calibrate. Match the weight of the description to the weight of the change. When in doubt, shorter is better -- reviewers can read the diff.

#### Writing voice

If the user has documented writing style preferences (in CLAUDE.md, project instructions, or prior feedback), follow those. Otherwise, apply these defaults:

- Use active voice throughout. No em dashes or double-hyphen (`--`) substitutes. Use periods, commas, colons, or parentheses instead.
- Vary sentence length deliberately -- mix short punchy sentences with longer ones. Never write three sentences of similar length in a row.
- Do not make a claim and then immediately explain it in the next sentence. Trust the reader.
- Write in plain English. If there's a simpler word, that's preferable. Never use business jargon when a common word will do. Technical jargon is fine when it's the clearest term for a developer audience.
- No filler phrases: "it's worth noting", "importantly", "essentially", "in order to", "leverage", "utilize."
- Use digits for numbers ("3 files", "7 subcommands"), not words ("three files", "seven subcommands").

#### Writing principles

- **Lead with value**: The first sentence should tell the reviewer *what's now possible or fixed*, not what was moved around.
- **No orphaned opening paragraphs**: If the description uses `##` section headings anywhere, the opening summary must also be under a heading (e.g., `## Summary`).
- **Describe the net result, not the journey**: The PR description is about the end state -- what changed and why. Do not include work-product details like bugs found and fixed during development.
- **When commits conflict, trust the final diff**: The commit list is supporting context, not the source of truth.
- **Explain the non-obvious**: If the diff is self-explanatory, don't narrate it.
- **Use structure when it earns its keep**: Headers, bullet lists, and tables are tools -- use them when they aid comprehension.
- **No empty sections**: If a section doesn't apply, omit it entirely.
- **Test plan -- only when it adds value**: Include a test plan section when the testing approach is non-obvious.

#### Numbering and references

**Never prefix list items with `#`** in PR descriptions. GitHub interprets `#1`, `#2`, etc. as issue/PR references and auto-links them.

When referencing actual GitHub issues or PRs, use the full format: `org/repo#123` or the full URL.

#### Compound Engineering badge

Append a badge footer to the PR description, separated by a `---` rule. Do not add one if the description already contains a Compound Engineering badge.

**Badge:**

```markdown
---

[![Compound Engineering](https://img.shields.io/badge/Built_with-Compound_Engineering-6366f1)](https://github.com/anthropics/claude-code)
![HARNESS](https://img.shields.io/badge/MODEL_SLUG-COLOR?logo=LOGO&logoColor=white)
```

Fill in at PR creation time using the harness lookup (for logo and color) and model slug below.

**Harness lookup:**

| Harness | `LOGO` | `COLOR` |
|---------|--------|---------|
| Claude Code | `claude` | `D97757` |
| Codex | (omit logo param) | `000000` |
| Gemini CLI | `googlegemini` | `4285F4` |

**Model slug:** Replace spaces with underscores in the model name. Append context window and thinking level in parentheses if known, separated by commas.

### Step 7: Create or update the PR

#### New PR (no existing PR from Step 3)

```bash
gh pr create --title "the pr title" --body "$(cat <<'EOF'
PR description here
EOF
)"
```

Use the badge from the Compound Engineering badge section above. Keep the PR title under 72 characters. The title follows the same convention as commit messages (Step 2).

#### Existing PR (found in Step 3)

The new commits are already on the PR from the push in Step 5. Report the PR URL, then ask the user whether they want the PR description updated to reflect the new changes. Use the platform's blocking question tool.

- If **yes**: Write the description as if fresh, following Step 6's writing principles. Apply with `gh pr edit --body`.
- If **no** -- done. The push was all that was needed.

### Step 8: Report

Output the PR URL so the user can navigate to it directly.
