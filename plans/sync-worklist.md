# Phase 0 authoritative worklist — sync to upstream 3.11.2

Derived from upstream `CHANGELOG.md` (releases 2.66.0 → 3.11.2) cross-checked against the fork↔upstream component diff. Fork baseline = upstream 2.65.0, so **only ≥2.66.0 deltas need porting**; components with no ≥2.66.0 changelog entry are already at content parity (their large normalized diffs are the fork's intentional Node adaptation, which is preserved) and need only the Phase 2 rename.

Baseline test: **654 pass / 0 fail**.

## Cross-reference strategy (couples Phase 1 → Phase 2)
- **All Phase 1 cross-references** (skill→agent, skill→skill) use **final `js-ce-<name>`** form (forward-correct; Phase 2 renames everything to `js-ce-*` anyway).
- A component's **own `name:` frontmatter + directory** keeps its **current** name in Phase 1 (must match dir for Claude Code). Phase 2 renames dir+name and sweeps residual `js-<name>` refs in non-merged files (fork-original skills, plugin.json, CLI registries, docs).
- Upstream `ce-<x>` refs in ported content → rewrite to `js-ce-<x>`.
- Preserve fork Node/TS adaptation; adopt upstream behavior deltas. Keep refs self-contained per skill (AGENTS.md rule).

## SKILL merges (port ≥2.66.0 deltas; keep current name)
| upstream | fork SKILL dir | deltas to port |
|---|---|---|
| ce-plan | js-ce-plan | 3.9.0 contract-driven sections + optional HTML; 3.6.0 Implementation Units as headings; 3.3.0 inline post-gen menu routing; 2.67.0 reliable interactive handoff menus; 3.10.0 CONCEPTS-aware |
| ce-brainstorm | js-ce-brainstorm | 3.9.0 contract-driven + optional HTML; 2.67.0 handoff menus; 3.10.0 CONCEPTS-aware |
| ce-code-review | js-ce-review | 3.0.0 per-finding judgment loop; 3.2.0 best-judgment auto-resolve + artifacts→/tmp + autofix_class rubric; 3.3.0 model override at dispatch; 3.3.1 queue reviewers on slot fill; 3.4.1 Write to JSON-pipeline reviewers; 3.4.2 stable finding numbers; 3.8.1 prose-driven base detection (drop resolve-base.sh); 3.4.0 harness-native default, escalate on risk |
| ce-doc-review | js-document-review | 3.0.0 tiers + chain grouping + rewrite; 3.2.0 rename LFG path to best-judgment; 3.6.1 cut plan-review noise + scope personas |
| ce-ideate | js-ce-ideate | 2.68.0 mode-aware v2; 3.1.0 subject gate + surprise-me + warrant contract |
| ce-compound | js-ce-compound | 3.0.0 YAML reserved-indicator quoting; 3.2.0 frontmatter parser-safety validator; 3.4.0 non-git CWD; 3.4.2 remove bash param expansion from ! backtick; 3.10.0 CONCEPTS-aware |
| ce-compound-refresh | js-ce-compound-refresh | 3.10.0 CONCEPTS-aware (verify other deltas) |
| ce-sessions | js-ce-sessions | 3.2.0 (via session-historian); 3.4.0 non-git CWD + permission fix; 3.4.2 remove bash param expansion; 3.7.2 unblock session-history on Claude Code |
| ce-debug | js-ce-debug | 3.2.0 delegate commit/PR + branch check |
| ce-demo-reel | js-ce-demo-reel | 3.2.0 wait for network idle + reject blank frames |
| ce-setup | js-ce-setup | 3.1.0 check ast-grep CLI + agent skill; 3.4.1 detect codex global skills |
| ce-update | js-ce-update | 3.1.0 compare against main plugin.json + derive cache dir from CLAUDE_PLUGIN_ROOT parent |
| ce-resolve-pr-feedback | js-resolve-pr-feedback | 3.7.3 paginate GraphQL connections (+ 3.11.2 repo auto-detect fail-loud / GHE node-id) |
| ce-worktree | js-git-worktree | 3.6.0 resolve script path against skill dir, not CWD |
| lfg | js-lfg | 3.0.0/3.1.0 platform-neutral skill references |
| ce-work-beta | js-ce-work-beta | 3.3.0 defer model + reasoning effort to Codex config |
| ce-work | js-ce-work | 3.10.0 CONCEPTS-aware (verify; otherwise at parity) |

## AGENT merges (port ≥2.66.0 deltas; keep current name)
| upstream | fork agent | deltas |
|---|---|---|
| ce-coherence-reviewer | document-review/js-coherence-reviewer | 3.8.3 remove Bash from tool allowlist |
| ce-session-historian | research/js-session-historian | 3.2.0 cap deep-dives + keyword filter primitive + tighten dispatch |
| ce-learnings-researcher | research/js-learnings-researcher | 3.0.0 tiers + chain grouping + rewrite |

## ADD new skills (js-ce-* prefix; copy dir incl. references/+scripts/, then adapt)
- js-ce-polish (ce-polish, stable 3.11.0) — has references/ + scripts/
- js-ce-simplify-code (ce-simplify-code)
- js-ce-strategy (ce-strategy, 3.4.0) — has references/
- js-ce-product-pulse (ce-product-pulse, 3.4.0) — has references/
- js-ce-release-notes (ce-release-notes, 2.68.0) — has scripts/; distinct from fork-original js-changelog (keep both)
- js-ce-riffrec-feedback-analysis (ce-riffrec-feedback-analysis, 3.5.0) — references/+scripts/; **genericize Every/Riffrec internal refs**
- js-ce-dogfood-beta (ce-dogfood-beta) — references/; **genericize Every-internal refs**
- js-ce-promote (ce-promote) — references/; **genericize Every-internal refs if any**

## ADD new agents (js-ce-* prefix)
- js-ce-web-researcher (ce-web-researcher) → research/
- js-ce-swift-ios-reviewer (ce-swift-ios-reviewer) → review/

## REMOVE skills (+ register in cleanup machinery in Phase 2/3)
- js-claude-permissions-optimizer (upstream dropped 2.67.0)
- js-dspy-python (user request; scrub README/CHANGELOG/plugin.json/marketplace.json/docs + js-best-practices-researcher ref)

## Agent allowlist / shell sweep (Phase 1d)
- 3.2.0 #701 replace case statements blocked by permission check; 3.3.0 #711 replace shell antipatterns blocked by permission check. Sweep skill bash blocks.

## LEAVE ALONE (already at content parity; Phase 2 rename only)
Skills: js-agent-native-architecture, js-agent-native-audit, js-frontend-design, js-gemini-imagegen, js-git-clean-gone-branches, js-git-commit, js-git-commit-push-pr, js-ce-slack-research, js-proof, js-report-bug-ce, js-test-browser, js-test-xcode, js-ce-optimize, js-modern-nodejs-style, js-sindre-sorhus-package-writer (fork-original).
Fork-original skills (keep): js-changelog, js-deploy-docs, js-every-style-editor, js-onboarding, js-todo-create, js-todo-resolve, js-todo-triage.
Agents: all shared reviewer/research/design agents not in the merge list (already at parity) + fork-original agents (js-cli-agent-readiness-reviewer, js-cli-readiness-reviewer, js-data-migration-expert, js-kieran-*, js-modern-nodejs-reviewer, js-schema-drift-detector).

## Post-sync counts (projected)
Skills: 41 − 2 removed + 8 added = **47**. Agents: 49 + 2 added = **51**.
