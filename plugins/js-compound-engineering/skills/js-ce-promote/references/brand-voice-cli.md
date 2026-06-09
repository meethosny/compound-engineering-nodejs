# Brand-voice CLI reference

An optional brand-voice CLI drafts copy in a user's brand voice. `js-ce-promote` uses it as an **optional enhancement** — every call must be wrapped so a missing, unauthed, or erroring CLI never blocks the skill.

This reference is written against a generic brand-voice CLI contract: a `write` command that takes a prompt and returns JSON drafts, plus a device-code `login` / `auth status` pair. The default binary name used throughout is `voice`. If a team uses a differently named CLI that exposes the same `write` / `auth status` / `login --json` contract, substitute the binary name; everything else applies unchanged. If no such CLI exists, the skill simply runs Path B (direct drafting) and never needs this file.

## Detection — three states

```bash
which voice
voice auth status --json 2>/dev/null
```

- **Absent** — `which voice` finds nothing. → Path 0 (offer to install + connect).
- Otherwise parse `voice auth status --json`:
  - **Ready** — `"authenticated": true` (equivalently `"status": "authenticated"`, any `source`). Use Path A.
  - **Unauthed** — `"authenticated": false`. → Path 0 (offer to sign in).
  - **Older CLI** that ignores `--json` (output isn't JSON): fall back to the human-readable signal in that same output — ready iff it reports an authenticated/signed-in state, else unauthed.

Prefer the JSON `authenticated` flag over substring-matching status text — the flag is the designed contract, and the substring is only the backward-compat fallback. Any error or timeout → treat as not-ready and continue; never block.

## Path 0 — Offer setup (first run, declinable)

When the CLI is unauthed or absent, offer setup once. First check the opt-out so this never nags.

### Check the opt-out

Read the project config (resolve the repo root, never CWD):

```bash
cat "$(git rev-parse --show-toplevel 2>/dev/null)/.js-compound-engineering/config.local.yaml" 2>/dev/null || echo '__NO_CONFIG__'
```

If the contents have an **uncommented** top-level `js_ce_promote_brand_voice_optout: true` line, **skip Path 0** and go straight to Path B. **Ignore commented lines** — a config template may ship a `# js_ce_promote_brand_voice_optout: true` example, and a commented line is documentation, not an opt-out (a naive substring match would wrongly suppress the offer for any project that accepted the default template). Otherwise, offer setup.

### Ask

Use the platform's blocking-question tool: `AskUserQuestion` in Claude Code (call `ToolSearch` with `select:AskUserQuestion` first if its schema isn't loaded), `request_user_input` in Codex, `ask_user` in Gemini. If no blocking tool exists or the call errors, present the same options as a numbered list in chat and wait for a reply — never silently skip.

For the **unauthed** state, the **agent itself** runs the device-code login (`voice login --json`): it's non-blocking and the API key never passes through the agent — the agent shares the returned `auth_url`, the user approves in a browser, and the credential is delivered server->CLI. The blocking question is mainly the escape hatch.

Use the question stem to teach the mechanic, offer the escape hatch, AND disclose that declining is durable (so the permanent side effect isn't hidden behind a transient-sounding label): "The brand-voice CLI personalizes and humanizes the copy in your voice. [It's installed but not signed in / It isn't installed yet] — sign in now, or have the agent draft directly without it? (Declining drafts your copy now and won't bring up the brand-voice CLI again in this project; you can set it up anytime by asking.)"

Offer exactly **two** options (labels must be self-contained):

- **Unauthed** state: `Sign in to the brand-voice CLI` · `Draft directly without it`
- **Absent** state: `Install the brand-voice CLI` · `Draft directly without it`

There is deliberately no separate "don't ask again" option: **dismissing is itself the opt-out.** A single first-run decline records the flag and the offer never recurs in this repo. This is what keeps a per-ship skill from nagging — never make the user choose a special variant to stop being asked.

### Act on the choice

- **Sign in** (installed, unauthed) — the agent runs `voice login --json` itself. It's non-blocking, and the **API key never touches the agent** (the token is exchanged server->CLI via a device-code flow). Parse the JSON `status`:
  - `already_authenticated` — `{ "authenticated": true, "status": "already_authenticated", "prefix": "..." }`: a credential already exists; nothing to approve. Go to Path A. (To switch accounts the user runs `voice logout` first.)
  - `pending` — `{ "status": "pending", "auth_url": "...", "user_code": "ABCD-2345", "expires_in": 900 }`: surface the `auth_url` for the user to open and approve in their browser (the `user_code` is embedded in the URL — show it too so they can confirm it matches), then wait. Once the user says they've approved, confirm by running `voice auth status --json`: it returns `"authenticated": true` when claimed, or `"status": "pending"` if not yet (re-check, don't busy-loop with sleeps — let the user's confirmation drive the re-check). If it stays unclaimed or the code expires (~`expires_in`s), offer to retry or fall to Path B. On success -> Path A.
  - **Never have the user paste an API key into chat** — with agent login the agent never handles the key at all.
  - **Older CLI (no agent login):** if `voice login --json` returns a legacy "API key required ... --token" message instead of JSON, suggest upgrading the CLI via its documented install command, or have the user run `voice login` themselves in their terminal (browser sign-in) and re-check `voice auth status`. If they would rather not, go to Path B.
- **Install** (absent) — most brand-voice CLIs offer a single pairing-code command that installs and connects in one step. Direct the user to their CLI's web-app settings (typically a "Connect an Agent" or "CLI / API access" page) to copy a fresh pairing-code command, which usually looks like:
  ```bash
  npx <brand-voice-cli-package>@latest setup --pairing-code <code>
  ```
  The pairing code is single-use and expires (~15 minutes), so the user must fetch a fresh one from the web app — do not hardcode it. Once installed, if still unauthed, follow the **Sign in** flow above (`voice login --json`). If the user can't or won't install, go to Path B.
- **Draft directly without it** — record the opt-out (below) so the offer never re-prompts in this repo, then go to Path B. (A failed/abandoned **sign-in or install** attempt does NOT record the opt-out — only an explicit "draft directly" dismissal does — so a user whose auth didn't complete still gets one clean re-offer next run.)

### Record the opt-out (best-effort)

Resolve the repo root, then add `js_ce_promote_brand_voice_optout: true` as a top-level key to `<root>/.js-compound-engineering/config.local.yaml`, using the native file-write/edit tool:

- **File already exists:** ensure an **uncommented** `js_ce_promote_brand_voice_optout: true` line is present — add one (or uncomment the example) unless an uncommented one already exists. A commented `# js_ce_promote_brand_voice_optout: true` does **not** count as present; leaving only the comment would let the comment-ignoring read path re-prompt next run.
- **File absent:** create it (and its `.js-compound-engineering/` directory) with the key, AND make sure the machine-local config won't be committed. Check whether the root-relative path `<root>/.js-compound-engineering/config.local.yaml` is already ignored (`git check-ignore -q <path>`); if it isn't, append `.js-compound-engineering/*.local.yaml` to git's **local exclude file** — resolve that file's path with `git rev-parse --git-path info/exclude` (this is correct in worktrees too, where `.git` is a *file* and `info/exclude` lives in the common git dir; do **not** hardcode `<root>/.git/info/exclude`). Use the local exclude, **not** `.gitignore`: it keeps the rule local and avoids dirtying a tracked file on what was a drafts-only action. A project setup step is the canonical place to add the shared `.gitignore` entry for teammates. Without any ignore, a user who runs `/js-ce-promote` before any setup could accidentally commit machine-local opt-out state.

If the root can't be resolved or any write fails, proceed to Path B anyway; the opt-out is a convenience, never a blocker.

After recording, confirm it in one line so the write isn't silent and the user knows how to undo it — e.g. "Got it — I won't bring up the brand-voice CLI here again (saved to `.js-compound-engineering/config.local.yaml`, kept out of git). Want it back later? Just ask, or remove the `js_ce_promote_brand_voice_optout` key." Keep it to a single line; don't belabor it.

## Generate

```bash
voice write "<prompt>" --instant --num-drafts <1-5> --json
```

- `--instant` — skip clarifying questions. **Always use it**; this is a headless context with no human mid-call.
- `--json` — machine-readable output. Always use it.
- `--num-drafts <1-5>` — number of drafts (single-channel mode only; see gotcha).
- `--workspace <uuid>` — scope to a brand-voice workspace. List with `voice workspaces`. Use only if the user names one.
- `--style <uuid>` — pin a specific voice/style. Use only if the user names one.

### Output shape

JSON with a stable, documented shape:

```json
{
  "session_id": "uuid",
  "status": "complete | needs_input",
  "drafts": [
    { "id": "uuid", "title": "...", "content": "markdown", "channel": "x",
      "url": "https://<brand-voice-web-app>/chat/<session>?draft=<id>", "display_hint": "inline | expandable" }
  ],
  "text": "pipeline commentary — DO NOT show the user unless drafts is empty",
  "style_used": null,
  "quota_remaining": 42
}
```

- `channel` (lowercase) is one of `x`, `linkedin`, `email`, `newsletter`, `blog`, `instagram_tiktok`, `research`, or `null`.
- `url` opens that draft in the CLI's web app for editing. Drafts persist to the user's account — surface `session_id` + each `url` in your output (Phase 4).
- **Do not surface the `text` field** to the user — it's internal pipeline commentary. Only fall back to it if `drafts` is empty.
- With `--instant`, `status` should be `complete`. If it comes back `needs_input` (rare with `--instant`), don't relay the CLI's questions to the user — either answer from the context you already have via a `--session` follow-up, or fall back to Path B for that channel.

If parsing fails or `drafts` is empty, fall back to direct drafting for the affected channels.

## The multi-channel / cue-word gotcha (important)

Multi-channel output is **phrasing-driven, not a flag.** A brand-voice CLI typically enters "campaign mode" when the prompt contains **≥2 channel keywords** (tweet/X, LinkedIn, email, blog, …) **OR** any cue word: `campaign`, `across`, `multi-channel`, `everywhere`, `cross-post`.

Two consequences to encode:

### (a) To get N variations of ONE channel

Ask for `"3 tweet options for <feature>"` and:

- **Avoid** the cue words above. Ironically, a prompt literally containing `campaign` or `multi-channel` trips campaign mode — so describe the task **without** those words.
- Pass `--num-drafts 3`.

If you accidentally include a cue word, the CLI decides it's a single campaign piece and returns **1 draft**, ignoring `--num-drafts`.

✅ `voice write "3 tweet options for one-click CSV export" --instant --num-drafts 3 --json`
❌ `voice write "a tweet campaign for CSV export" --instant --num-drafts 3 --json`  (collapses to 1 draft)

### (b) To get a real multi-channel set

Phrase the prompt with the multiple channels named. The CLI returns **one set of drafts per channel**, each draft carrying its `channel`. In this mode **`--num-drafts` is ignored** — per-channel counts apply.

✅ `voice write "announcing one-click CSV export — a tweet and a LinkedIn post" --instant --json`
✅ `voice write "a campaign across email, LinkedIn, and Twitter for CSV export" --instant --json`

This one-call cross-channel set is the ideal fit for `js-ce-promote` when the user wants to announce across surfaces.

**The CLI picks per-channel counts itself.** In campaign mode the count per channel is the CLI's call, not yours — e.g. "a tweet and a LinkedIn post" can return 3 X drafts + 2 LinkedIn drafts (5 total), each tagged with its `channel`. Group the returned `drafts` by `channel` for Phase 4; don't assume one per channel.

## Failure handling

Detection that comes back not-ready routes through Path 0 above. Once on Path A, any of these → fall back to direct drafting (SKILL.md Path B), silently, for the affected channels:

- `voice write` exits non-zero, hangs, or emits non-JSON
- `drafts` is empty or missing expected fields

Never surface raw brand-voice CLI errors to the user as a blocker. The skill always produces drafts.
