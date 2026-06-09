---
name: js-ce-sessions
description: "Search and ask questions about your coding agent session history. Use when asking what you worked on, what was tried before, how a problem was investigated across sessions, what happened recently, or any question about past agent sessions. Also use when the user references prior sessions, previous attempts, or past investigations — even without saying 'sessions' explicitly."
---

# /js-ce-sessions

Search your session history.

## Usage

```
/js-ce-sessions [question or topic]
/js-ce-sessions
```

## Pre-resolved context

**Git branch (pre-resolved):** !`git rev-parse --abbrev-ref HEAD 2>/dev/null || true`

If the line above resolved to a plain branch name (like `feat/my-branch`), pass it to the agent for branch filtering. If it is empty or still contains a backtick command string (e.g., the working directory is not a git repository), omit it and let the agent derive the branch at runtime.

**Repo root (pre-resolved):** !`git rev-parse --show-toplevel 2>/dev/null || true`

If the line above resolved to a path, take its last path component as the repo folder name and pass that to the agent for session discovery. If it is empty or still contains a backtick command string (e.g., a non-git working directory), omit it and let the agent derive the repo name at runtime.

## Execution

If no argument is provided, ask what the user wants to know about their session history. Use the platform's blocking question tool: `AskUserQuestion` in Claude Code (call `ToolSearch` with `select:AskUserQuestion` first if its schema isn't already loaded — it is a deferred tool and may not be available at session start), `request_user_input` in Codex, `ask_user` in Gemini. Fall back to asking in plain text only when no blocking tool exists in the harness or the call errors (e.g., Codex edit modes) — not because a schema load is required. Never silently skip the question.

Dispatch the `js-ce-session-historian` subagent via the platform's subagent primitive (`Agent`/`Task` in Claude Code, `spawn_agent` in Codex) with the user's question as the task prompt. Omit the `mode` parameter so the user's configured permission settings apply. Include in the dispatch prompt:

- The user's question
- The current working directory
- The repo folder name (last path component of the pre-resolved repo root) and git branch from pre-resolved context — pass each only if it resolved to a plain value; do not pass literal command strings or empty values
