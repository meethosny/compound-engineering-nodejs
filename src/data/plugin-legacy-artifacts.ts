/**
 * Historical / stale artifact names for the fork's `js-compound-engineering`
 * plugin, derived at build time from `plans/phase2-stale.json` and inlined here
 * (do NOT read that JSON at runtime — it is a planning artifact).
 *
 * The v3 fork renamed every skill and agent from `js-*` to `js-ce-*` (and
 * removed `js-dspy-python` + `js-claude-permissions-optimizer`). Because the
 * fork converts plugin AGENTS to SKILLS (agents-as-skills), a stale agent name
 * appears in a target's output as a stale SKILL directory, not a separate agent
 * file. So the set of stale skill-dir names to sweep is the union of the old
 * skill dirs and the old agent names.
 */

type LegacyPluginArtifacts = {
  skills?: string[]
  agents?: string[]
  commands?: string[]
}

/** Old skill directory names removed/renamed by the js-ce-* rename. */
const STALE_SKILL_DIR_NAMES = [
  "js-proof",
  "js-deploy-docs",
  "js-test-xcode",
  "js-test-browser",
  "js-agent-native-audit",
  "js-report-bug-ce",
  "js-git-commit-push-pr",
  "js-git-worktree",
  "js-gemini-imagegen",
  "js-git-commit",
  "js-modern-nodejs-style",
  "js-lfg",
  "js-todo-create",
  "js-frontend-design",
  "js-git-clean-gone-branches",
  "js-resolve-pr-feedback",
  "js-onboarding",
  "js-every-style-editor",
  "js-document-review",
  "js-changelog",
  "js-todo-triage",
  "js-sindre-sorhus-package-writer",
  "js-agent-native-architecture",
  "js-todo-resolve",
  // Removed skills (no js-ce-* replacement)
  "js-dspy-python",
  "js-claude-permissions-optimizer",
]

/** Old agent names. Agents are written as skill dirs, so these double as stale skill dirs. */
const STALE_AGENT_DIR_NAMES = [
  "js-learnings-researcher",
  "js-slack-researcher",
  "js-best-practices-researcher",
  "js-session-historian",
  "js-repo-research-analyst",
  "js-git-history-analyzer",
  "js-framework-docs-researcher",
  "js-issue-intelligence-analyst",
  "js-design-implementation-reviewer",
  "js-figma-design-sync",
  "js-design-iterator",
  "js-adversarial-document-reviewer",
  "js-design-lens-reviewer",
  "js-security-lens-reviewer",
  "js-feasibility-reviewer",
  "js-coherence-reviewer",
  "js-scope-guardian-reviewer",
  "js-product-lens-reviewer",
  "js-sorhus-readme-writer",
  "js-performance-oracle",
  "js-adversarial-reviewer",
  "js-kieran-typescript-reviewer",
  "js-testing-reviewer",
  "js-pattern-recognition-specialist",
  "js-schema-drift-detector",
  "js-cli-readiness-reviewer",
  "js-modern-nodejs-reviewer",
  "js-project-standards-reviewer",
  "js-maintainability-reviewer",
  "js-julik-frontend-races-reviewer",
  "js-data-migration-expert",
  "js-data-migrations-reviewer",
  "js-deployment-verification-agent",
  "js-security-sentinel",
  "js-kieran-python-reviewer",
  "js-kieran-nodejs-reviewer",
  "js-data-integrity-guardian",
  "js-correctness-reviewer",
  "js-code-simplicity-reviewer",
  "js-api-contract-reviewer",
  "js-architecture-strategist",
  "js-reliability-reviewer",
  "js-agent-native-reviewer",
  "js-previous-comments-reviewer",
  "js-security-reviewer",
  "js-cli-agent-readiness-reviewer",
  "js-performance-reviewer",
  "js-spec-flow-analyzer",
  "js-pr-comment-resolver",
]

/**
 * Common name variants converters might have produced historically. Colon ->
 * hyphen forms cover the workflow skills (`js-ce:plan` sanitized to `js-ce-plan`
 * already lives under the current names, but pre-rename colon dirs like
 * `js-ce:review` may linger). These are ownership-gated like everything else,
 * so listing extras is safe.
 */
const STALE_VARIANT_DIR_NAMES = [
  "js-ce-brainstorm",
  "js-ce-compound",
  "js-ce-compound-refresh",
  "js-ce-ideate",
  "js-ce-plan",
  "js-ce-review",
  "js-ce-work",
  "js-ce-work-beta",
]

const ALL_STALE_SKILL_DIRS = [
  ...new Set([
    ...STALE_SKILL_DIR_NAMES,
    ...STALE_AGENT_DIR_NAMES,
    ...STALE_VARIANT_DIR_NAMES,
  ]),
].sort()

const EXTRA_LEGACY_ARTIFACTS_BY_PLUGIN: Record<string, LegacyPluginArtifacts> = {
  "js-compound-engineering": {
    // Agents are emitted as skill dirs, so the stale skill-dir sweep is the
    // union of old skill dirs and old agent names (+ historical variants).
    skills: ALL_STALE_SKILL_DIRS,
    agents: [...STALE_AGENT_DIR_NAMES].sort(),
    commands: [],
  },
}

export function getLegacyPluginArtifacts(pluginName?: string): LegacyPluginArtifacts {
  if (!pluginName) return {}
  return EXTRA_LEGACY_ARTIFACTS_BY_PLUGIN[pluginName] ?? {}
}
