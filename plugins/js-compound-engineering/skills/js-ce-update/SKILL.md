---
name: js-ce-update
description: |
  Check if the compound-engineering plugin is up to date and fix stale cache if not.
  Use when the user says "update compound engineering", "check compound engineering version",
  "ce update", "is compound engineering up to date", "update ce plugin", or reports issues
  that might stem from a stale compound-engineering plugin version. This skill only works
  in Claude Code — it relies on the plugin harness cache layout.
disable-model-invocation: true
ce_platforms: [claude]
allowed-tools: Bash(bash *upstream-version.sh), Bash(bash *cache-info.sh)
---

# Check & Fix Plugin Version

Verify the installed compound-engineering plugin version matches the upstream
`plugin.json` on `main`, and fix stale marketplace/cache state if it doesn't.
Claude Code only.

The upstream version comes from `plugins/compound-engineering/.claude-plugin/plugin.json`
on `main` rather than the latest GitHub release tag, because the marketplace
installs plugin contents from `main` HEAD. Comparing against release tags
false-positives whenever `main` is ahead of the last tag (the normal state
between releases).

## Step 1: Probe versions

Run these two scripts via the Bash tool, in parallel. Each prints to stdout;
capture the values for the decision logic below. Use `${CLAUDE_SKILL_DIR}` so
the path resolves correctly in both `claude --plugin-dir` local-development
sessions and standard marketplace-cached installs.

```bash
bash "${CLAUDE_SKILL_DIR}/scripts/upstream-version.sh"
bash "${CLAUDE_SKILL_DIR}/scripts/cache-info.sh"
```

`scripts/upstream-version.sh` reads `plugin.json` on `main` via `gh api`. It
prints the version string, or the sentinel `__CE_UPDATE_VERSION_FAILED__` if
`gh` is unavailable or rate-limited.

`scripts/cache-info.sh` derives the marketplace cache location from
`${CLAUDE_PLUGIN_ROOT}` rather than from a hardcoded marketplace name: a standard
install resolves `${CLAUDE_PLUGIN_ROOT}` to the plugin's version directory
`<plugins-root>/cache/<marketplace>/<plugin>/<version>`, so the cache base is its
great-grandparent (`.../cache`) and the marketplace name is the basename two
parents up. Deriving from the path keeps this working under any marketplace name
this fork ships as. It prints three lines:

- `CACHE_BASE=<path>` — the cache base directory, or `__CE_UPDATE_ROOT_FAILED__`
  if `${CLAUDE_PLUGIN_ROOT}` is empty or an unresolved literal.
- `MARKETPLACE=<name>` — the derived marketplace segment, or
  `__CE_UPDATE_ROOT_FAILED__`.
- `VERSIONS=<v1> <v2> ...` — space-separated cached version folder names for the
  `compound-engineering` plugin, or `__CE_UPDATE_CACHE_FAILED__` if no such cache
  directory exists (typical for a local dev checkout or fresh install).

## Step 2: Apply decision logic

### 1. Platform gate

If `CACHE_BASE` is `__CE_UPDATE_ROOT_FAILED__`: `${CLAUDE_PLUGIN_ROOT}` is empty
or unresolved, so this is not a Claude Code session. Tell the user this skill
requires Claude Code and stop. No further action.

### 2. Compare versions

If `scripts/upstream-version.sh` printed `__CE_UPDATE_VERSION_FAILED__`: tell the
user the upstream version could not be fetched (gh may be unavailable or
rate-limited) and stop.

If `VERSIONS` is `__CE_UPDATE_CACHE_FAILED__`: no marketplace cache exists. Tell
the user: "No marketplace cache found — this appears to be a local dev checkout
or fresh install." and stop.

Take the **upstream version** and the `VERSIONS` folder list.

**Up to date** — exactly one cached folder exists AND its name matches the upstream version:
- Tell the user: "compound-engineering **v{version}** is installed and up to date."

**Out of date or corrupted** — multiple cached folders exist, OR the single folder name
does not match the upstream version. Use the `CACHE_BASE` and `MARKETPLACE` values
from Step 1 to construct the delete path.

**Clear the stale cache:**
```bash
rm -rf "<CACHE_BASE>/<MARKETPLACE>/compound-engineering"
```

Tell the user:
- "compound-engineering was on **v{old}** but **v{upstream}** is available."
- "Cleared the plugin cache. Now run `/plugin marketplace update` in this session, then restart Claude Code to pick up v{upstream}."
