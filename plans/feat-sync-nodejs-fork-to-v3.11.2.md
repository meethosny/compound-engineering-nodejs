# Plan: Sync js-compound-engineering fork to upstream v3.11.2 (100% parity)

**Status:** Draft for review (rev 2 — incorporates parity directive)
**Baseline:** fork @ `2.65.0` (2026-04-13) → upstream @ `3.11.2` (2026-06-06)
**Scope:** Both plugins (`js-compound-engineering`, `js-coding-tutor`) AND the Bun/TS CLI converter.

---

## 0. Governing principle (user-set)

> **The fork is upstream `compound-engineering` at the *same version, component-for-component* — Ruby/Rails-specific pieces adapted to the Node.js/TS/Python ecosystem — PLUS the fork's own Node-ecosystem additions and extra CLI targets. Same version number. One uniform `js-ce-` prefix.**

Concretely, the fork's component set is a **superset**:

| Bucket | Rule | Examples |
|---|---|---|
| **Shared** (in both) | Sync upstream content, re-apply `js-` adaptation, uniform prefix | `js-ce-plan`, `js-ce-review`, `js-ce-compound` |
| **Ruby/Rails-specific upstream** | Adapt to Node, don't copy verbatim | `ce-dhh-rails-style`→`js-ce-modern-nodejs-style`; `ce-ankane-readme-writer`→`js-ce-sorhus-readme-writer` |
| **Every-product-specific upstream** | Port but rewrite Every-internal refs (product names, Every's release flow) to generic equivalents | `ce-riffrec-feedback-analysis`, `ce-dogfood-beta`, `ce-promote` |
| **Non-Ruby upstream kept as-is** | Mirror with `js-ce-` prefix (user: keep these for parity) | `js-ce-swift-ios-reviewer`, `js-ce-test-xcode` |
| **Upstream-new since 2.65** | Add to fork with uniform prefix | `js-ce-polish`, `js-ce-simplify-code`, `js-ce-strategy`, `js-ce-web-researcher` |
| **Upstream-removed since 2.65** | Remove from fork too | `js-claude-permissions-optimizer` |
| **Fork-original Node value-add** | Keep (not in upstream, never was) | `js-ce-kieran-*`, `js-ce-todo-*`, `js-ce-schema-drift-detector`, `js-ce-every-style-editor`, `js-ce-onboarding`, `js-ce-deploy-docs` |
| **Fork-only, user wants removed** | Remove despite being fork-original | `js-dspy-python` skill (user has a separate DSPy plugin) |
| **Separate fork plugins** | Untouched by the upstream sync — not part of compound-engineering | `plugins/compound-c4-architecture` (C4), `plugins/js-coding-tutor` |

---

## 1. Why this is a major sync, not a routine bump

Fork is pre-upstream-**3.0.0**, whose breaking change was *"rename all skills/agents to a consistent `ce-` prefix."* The fork still shows that exact inconsistency: **15** skills `js-ce-*`, **26** skills `js-*`, all 49 agents `js-*`. Three coupling facts:

1. Prefix normalization is itself the 3.0.0 move — and breaks fork users' invocations.
2. The CLI diverged **bidirectionally** (fork added 3 targets + a `sync/` subsystem; upstream added a `cleanup` command + legacy-artifact machinery). A copy would destroy fork work.
3. Upstream's rename shipped **with** cleanup tooling (`legacy-cleanup.ts`, `plugin-legacy-artifacts.ts`, `managed-artifacts.ts`). The fork's own rename needs the same machinery so stale files are swept on upgrade. → Phase 2 and Phase 3 are coupled.

---

## 2. Decisions — now resolved by user (▲), still open (○)

| # | Decision | Resolution |
|---|---|---|
| ▲ D1 | Prefix scheme | **Uniform `js-ce-*`** across the compound-engineering plugin. (coding-tutor keeps its own `js-*` namespace — separate plugin.) |
| ▲ D2 | Fork version | **Plugin** (`plugin.json` + `marketplace.json`) hand-set to **`3.11.2`**. npm CLI (`@meethosny/js-compound-plugin`) stays on its own `semantic-release` track — no forced pin. |
| ▲ D7 | CLI target set | Keep `codex, copilot, droid, gemini, kiro, opencode, pi`; **add** `cursor, antigravity`; **remove** `openclaw, qwen, windsurf`. Final = **9 targets**. |
| ▲ D3 | New upstream skills | **Add all** with uniform prefix (parity). |
| ▲ D4 | `claude-permissions-optimizer` | **Remove** — upstream dropped it (2.67.0). |
| ▲ D5 | `test-xcode` / `swift-ios-reviewer` | **Keep `js-ce-test-xcode`, add `js-ce-swift-ios-reviewer`** — user wants parity. |
| ▲ D6 | `web-researcher` | **Add `js-ce-web-researcher`**. |
| ▲ Q-A | "execute" in user msg | Confirmed = **`test-xcode`**. Keep `js-ce-test-xcode`, add `js-ce-swift-ios-reviewer`. |
| ▲ Q-B | Every-product-internal skills (`riffrec-feedback-analysis`, `dogfood-beta`, `promote`) | **Port + adapt** Every-internal refs to generic Node-friendly equivalents. |

---

## 3. Phase 0 — Prep & safety

- [ ] Branch `feat/sync-upstream-3.11.2` off `main`.
- [ ] Baseline: `bun test` green; record counts; note upstream ref commit (3.11.2) in PR for traceability.
- [ ] Build the authoritative **component diff** at execution time: enumerate upstream 3.11.2 components vs fork components, classify each into the §0 buckets. The changelog is the *map*; this diff is the *territory*.
- [ ] Confirm `compound-engineering-plugin-main/` stays gitignored (read-only reference).

---

## 4. Phase 1 — Plugin content sync (the §0 "Shared" + "Adapt" + "Add" buckets)

For every **shared** skill/agent, the work is a **content merge**, not a copy: take upstream's current file, re-apply the fork's `js-` adaptation layer (frontmatter `name:`, internal `Agent`/`Task` refs to `js-ce-*`, Node framing), preserving any Node-specific divergence the fork already made.

### 1a. CONCEPTS.md substrate (3.10.0) — first; others depend on it
- [ ] Create `plugins/js-compound-engineering/CONCEPTS.md` (adapt vocabulary for Node where examples are Ruby).
- [ ] Re-port CONCEPTS-aware `js-ce-brainstorm`, `js-ce-plan`, `js-ce-compound`, `js-ce-compound-refresh`.

### 1b. Re-port shared skills upstream changed after 2.65.0
- [ ] `js-ce-plan` / `js-ce-brainstorm` — contract-driven sections + optional HTML (3.9.0); Implementation Units as headings (3.6.0); interactive handoff/menu routing (2.67.0, 3.3.0).
- [ ] `js-ce-review` (`ce-code-review`) — per-finding judgment loop (3.0.0); best-judgment auto-resolve (3.2.0); stable finding numbers (3.4.2); model override at dispatch (3.3.0); artifacts→`/tmp` (3.2.0); prose-driven base detection, drop `resolve-base.sh` (3.8.1); queue reviewers on slot fill (3.3.1); Write for JSON-pipeline reviewers (3.4.1).
- [ ] `js-document-review` + `js-learnings-researcher` — tiers, chain grouping, rewrite (3.0.0); cut plan-review noise, scope personas (3.6.1).
- [ ] `js-ce-ideate` — mode-aware v2 (2.68.0); subject gate, surprise-me, warrant contract (3.1.0).
- [ ] `js-ce-compound` — frontmatter parser-safety validator (3.2.0); YAML reserved-indicator quoting (3.0.0).
- [ ] `js-ce-sessions` + `js-session-historian` — unblock session-history (3.7.2); cap deep-dives + keyword filter (3.2.0); non-git CWD + permission fixes (3.4.0).
- [ ] `js-ce-debug` (3.2.0), `js-ce-demo-reel` (3.2.0), `js-ce-setup` (3.1.0/3.4.1), `js-ce-update` (3.0.x), `js-resolve-pr-feedback` (3.7.3), `js-git-worktree` (3.6.0), `js-lfg` (3.0.0) — per changelog.

### 1c. Add upstream-new components (uniform `js-ce-` prefix)
- [ ] `js-ce-polish` (`ce-polish`, stable 3.11.0).
- [ ] `js-ce-simplify-code` (`ce-simplify-code`).
- [ ] `js-ce-strategy`, `js-ce-product-pulse` (3.4.0).
- [ ] `js-ce-release-notes` (`ce-release-notes`, 2.68.0) — distinct from existing fork-original `js-changelog`; keep both.
- [ ] `js-ce-web-researcher` agent (D6).
- [ ] `js-ce-swift-ios-reviewer` agent (D5 — user wants parity).
- [ ] `js-ce-riffrec-feedback-analysis`, `js-ce-dogfood-beta`, `js-ce-promote` — port, then rewrite Every-internal references (Riffrec product, Every's release/distribution flow) into generic Node-friendly equivalents.

### 1d. Agent fixes
- [ ] `js-coherence-reviewer` — remove `Bash` from allowlist (3.8.3).
- [ ] Sweep agent tool allowlists / shell patterns for permission-check fixes (3.2.0 #701/#711).

### 1e. Removals
- [ ] Delete `js-claude-permissions-optimizer` skill (upstream dropped 2.67.0).
- [ ] Delete `js-dspy-python` skill entirely (user request — separate DSPy plugin exists). Scrub all references: `agents/research/js-best-practices-researcher.md`, `README.md`, `CHANGELOG.md`, `plugin.json`, `marketplace.json`, docs site. Do NOT port any DSPy skill/agent from upstream (upstream has none anyway).
- [ ] Register both removed dir names in the cleanup machinery (Phase 2/3) so installed copies are swept on upgrade.
- [ ] At execution, confirm via the Phase-0 diff that no other shared component silently disappeared upstream.

### Phase 1 invariant
Content at 3.11.2 parity; names still mixed. Tests/conversion still pass. **Do not rename yet.**

---

## 5. Phase 2 — Prefix normalization (the 3.0.0 move; BREAKING for fork users)

- [ ] Rename 26 `js-*` skill dirs → `js-ce-*`; update each `SKILL.md` `name:`.
- [ ] Rename all agent files → `js-ce-*`; update `name:`.
- [ ] Update **every** cross-reference: `Agent`/`Task` dispatch in skills (bare `js-ce-<name>` form), skill→skill invocations, `plugin.json`/`marketplace.json` lists, CLI registries (`src/release/components.ts`, `src/sync/registry.ts`), docs site.
- [ ] **Port legacy-cleanup machinery** seeded with the OLD `js-*`/`js-ce-*` names (couples to Phase 3): `STALE_SKILL_DIRS`/`STALE_AGENT_NAMES`/`STALE_PROMPT_FILES` (`src/utils/legacy-cleanup.ts`) + `EXTRA_LEGACY_ARTIFACTS_BY_PLUGIN` (`src/data/plugin-legacy-artifacts.ts`). Without this, every rename orphans a stale file on users' machines.
- [ ] Grep gate: zero non-`js-ce-` component refs remain (excluding prose like "Node.js").

---

## 6. Phase 3 — CLI converter target overhaul + upstream merge

### Target set (user-directed)
- **Keep + verify:** `codex`, `opencode`, `droid` (Factory — verify against current `.factory/droids/*.md` format).
- **Add (new targets):** `cursor`, `antigravity`.
- **Keep (upstream-standard, user-confirmed):** `copilot`, `gemini`, `kiro`, `pi`.
- **Remove:** `windsurf` (rebranded to Devin Desktop, but user wants it out), `openclaw`, `qwen`.
- **Final set (9):** `codex, copilot, droid, gemini, kiro, opencode, pi, cursor, antigravity`.

### Remove targets
- [ ] Delete `src/{targets,converters,types,sync}/{openclaw,qwen,windsurf}.ts` (+ `claude-to-*`) and deregister from `src/targets/index.ts` + `src/sync/registry.ts`. Update tests/fixtures.

### Add `cursor` target
- [ ] Per AGENTS.md "Adding a New Target Provider" checklist. Mapping (researched): agents → Cursor subagents; skills → `SKILL.md`; commands → `.cursor/commands/*.md`; rules → `.cursor/rules/*.mdc`; shared context → `AGENTS.md`. Config root `~/.cursor/` (user) / `.cursor/` (project).

### Add `antigravity` target
- [ ] Per checklist. Mapping (researched): commands → `.agent/workflows/*.md`; rules → `.agent/rules/*.md` + `~/.gemini/GEMINI.md`/`AGENTS.md`; skills → `skills.md`. **Gap:** Antigravity subagent support is not yet clearly documented — decide how to map plugin *agents* (e.g. fold into workflows/rules, or defer agents for this target). May reuse parts of the existing `gemini` converter (Antigravity is Gemini-based).

### Preserve fork infra (do not lose)
- [ ] `src/sync/` subsystem + `src/commands/sync.ts`; `src/parsers/claude-home.ts`.

### Pull from upstream (for the kept shared targets only)
- [ ] `src/commands/cleanup.ts`; `src/utils/legacy-cleanup.ts`; `src/data/plugin-legacy-artifacts.ts`; `src/targets/managed-artifacts.ts` (also needed by Phase 2 sweep).
- [ ] Diff shared converter files and apply upstream deltas: codex native install manifests + agents-only converter (3.0.0/3.1.0), hooks→`.codex/hooks.json` (3.6.0), `CODEX_HOME` (3.8.2), sidecar/config preservation (2.66.0); pi `pi-subagents` + `pi-ask-user` first-class support (3.0.0/3.1.0).
- [ ] Wire `cleanup` into `index.ts`; keep `sync`.

**Tests:** writer + CLI + converter specs for `cursor` and `antigravity`; regression-test kept targets; remove specs for deleted targets.

---

## 7. Phase 4 — coding-tutor parity + docs + counts

- [ ] **coding-tutor:** diff `plugins/coding-tutor` (upstream) vs `plugins/js-coding-tutor`; sync content for `quiz-me`/`teach-me`/`sync-tutorials` and the `coding-tutor` skill. Keep its `js-` namespace (separate plugin). Match upstream coding-tutor's version.
- [ ] Run `bun run release:validate` (exists at `scripts/release/validate.ts`) — the tool that would have caught the current drift — and fix every mismatch.
- [ ] Recompute and sync counts everywhere: `plugin.json`, `marketplace.json`, README, `CLAUDE.md` (currently wrong: 28/40), `docs/` pages (currently wrong: 29/25/19).
- [ ] Hand-set version to **3.11.2** in `plugins/js-compound-engineering/.claude-plugin/plugin.json` + `marketplace.json`. Leave the npm CLI (`package.json` / `semantic-release`) on its own track — do not force it. (coding-tutor → match its own upstream version separately.)
- [ ] Adopt upstream doc conventions: AGENTS.md canonical / CLAUDE.md shim; cleanup-registry requirement; bare `js-ce-` agent-ref rule; self-contained skill file refs; no platform-specific vars without fallback.

---

## 8. Phase 5 — Validation & release

- [ ] `bun test` green; `release:validate` clean.
- [ ] Smoke: `bun run convert --to codex` and `--to windsurf`; confirm renamed components appear and legacy ones are swept.
- [ ] Local install; invoke a renamed skill (`/js-ce-frontend-design`) + a synced one (`/js-ce-review`).
- [ ] Single CHANGELOG entry "Sync to upstream 3.11.2 + prefix normalization"; version `3.11.2`.

---

## 9. Risk register

| Risk | Mitigation |
|---|---|
| Prefix rename breaks cross-refs silently | Phase 2 grep gate + `release:validate` + local install smoke |
| CLI merge clobbers fork targets | §6 explicit preserve list; diff shared files only; per-target test |
| Users keep stale files after rename/removal | Port legacy-cleanup registries (non-optional) |
| Mistaking fork-original for upstream-removal | Phase-0 diff + changelog cross-check (already cleared schema-drift-detector & every-style-editor as fork-original) |
| Version pin fights release automation | Verify `.releaserc.json` flow; use `release-as` for the sync commit |

---

## 10. Commit sequencing

1. `feat(skill): CONCEPTS.md substrate + CONCEPTS-aware plan/brainstorm/compound`
2. `fix(review,doc-review): re-port upstream 3.x behavior`
3. `feat(skill): add polish, simplify-code, strategy, product-pulse, release-notes; swift-ios + web-researcher agents`
4. `fix(skill): remove claude-permissions-optimizer (upstream dropped); agent allowlist fixes`
5. `refactor!: normalize all components to js-ce-* prefix` (breaking)
6. `feat(cli): cleanup command + legacy sweep; merge codex/pi improvements`
7. `feat(coding-tutor): sync to upstream`
8. `docs: refresh counts, conventions, version 3.11.2`
