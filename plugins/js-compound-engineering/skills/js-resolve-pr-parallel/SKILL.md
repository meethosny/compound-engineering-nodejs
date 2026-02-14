---
name: js-resolve-pr-parallel
description: This skill should be used when resolving all PR review comments in parallel using multiple js-pr-comment-resolver agents. It provides structured parallel resolution of GitHub PR review comments.
disable-model-invocation: true
---

# Resolve PR Comments in Parallel

Structured parallel resolution of PR review comments. Spawns a `js-pr-comment-resolver` agent for each unresolved comment thread.

## When to Use

- After receiving code review feedback on a PR
- When there are multiple unresolved PR comment threads
- To efficiently address all review comments at once

## Workflow

### 1. Analyze

Get all unresolved comments for the current or specified PR:

```bash
gh pr status
gh pr view --json reviewRequests,reviews,comments
```

### 2. Plan

Create a task list of all unresolved items grouped by type:
- Code changes requested
- Questions to answer
- Suggestions to evaluate

### 3. Implement (PARALLEL)

Spawn a `js-pr-comment-resolver` agent for each unresolved comment:

```
For each unresolved comment:
  Task js-pr-comment-resolver(comment context + file + suggestion)
```

All agents run in parallel for maximum speed.

### 4. Commit & Resolve

- Stage and commit all changes
- Push to remote
- Verify all comments are addressed:

```bash
gh pr view --json reviews,comments
```

If any comments remain unresolved, repeat from step 1.
