import { readFile } from "fs/promises"
import path from "path"
import { describe, expect, test } from "bun:test"

async function readRepoFile(relativePath: string): Promise<string> {
  return readFile(path.join(process.cwd(), relativePath), "utf8")
}

describe("js-ce:work review contract", () => {
  test("requires code review before shipping", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work/SKILL.md")
    // Review content extracted to references/shipping-workflow.md
    const shipping = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work/references/shipping-workflow.md")

    // SKILL.md should not contain extracted content
    expect(content).not.toContain("3. **Code Review**")
    expect(content).not.toContain("Consider Code Review")
    expect(content).not.toContain("Code Review** (Optional)")

    // Phase 3 has a conditional Simplify step at position 2 (js-ce-simplify-code, gated on >=30 LOC)
    // and code review at position 3 (Tier 1 when available; Tier 2 on criteria only)
    expect(shipping).toContain("2. **Simplify**")
    expect(shipping).toContain("js-ce-simplify-code")
    expect(shipping).toContain("3. **Code Review**")

    // Two-tier rubric in reference file: Tier 1 when harness has built-in review,
    // Tier 2 is js-ce-review (risk-based escalation only — not when Tier 1 missing)
    expect(shipping).toContain("**Tier 1 -- harness-native review")
    expect(shipping).toContain("**Tier 2 -- `js-ce-review` (escalation only).**")
    expect(shipping).toContain("not** because Tier 1 is missing")
    expect(shipping).toContain("js-ce-review")
    expect(shipping).toContain("review-findings-followup.md")
    expect(shipping).toMatch(/review is not fix|2a\. Review|2b\. Apply/i)
    expect(shipping).toContain("mode:agent")

    // Quality checklist includes review
    expect(shipping).toContain("Code review: Tier 1 completed, or Tier 2 when escalated")
  })

  test("delegates commit and PR to dedicated skills", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work/SKILL.md")
    // Commit/PR delegation content extracted to references/shipping-workflow.md
    const shipping = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work/references/shipping-workflow.md")

    expect(shipping).toContain("`js-git-commit-push-pr` skill")
    expect(shipping).toContain("`js-git-commit` skill")

    // Should not contain inline PR templates or attribution placeholders
    expect(content).not.toContain("gh pr create")
    expect(content).not.toContain("[HARNESS_URL]")
  })

  test("js-ce:work-beta mirrors review and commit delegation", async () => {
    const beta = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work-beta/SKILL.md")
    // Review/commit content extracted to references/shipping-workflow.md
    const shipping = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work-beta/references/shipping-workflow.md")

    // Extracted content in reference file
    expect(shipping).toContain("2. **Code Review**")
    expect(shipping).toContain("`git-commit-push-pr` skill")
    expect(shipping).toContain("`git-commit` skill")

    // Negative assertions stay on SKILL.md
    expect(beta).not.toContain("Consider Code Review")
    expect(beta).not.toContain("gh pr create")
  })

  test("includes per-task testing deliberation in execution loop", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work/SKILL.md")

    // Testing deliberation exists in the execution loop
    expect(content).toContain("Assess testing coverage")

    // Deliberation is between "Run tests after changes" and "Mark task as completed"
    const runTestsIdx = content.indexOf("Run tests after changes")
    const assessIdx = content.indexOf("Assess testing coverage")
    const markDoneIdx = content.indexOf("Mark task as completed")
    expect(runTestsIdx).toBeLessThan(assessIdx)
    expect(assessIdx).toBeLessThan(markDoneIdx)
  })

  test("quality checklist says 'Testing addressed' not 'Tests pass'", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work/SKILL.md")
    // Quality checklist extracted to references/shipping-workflow.md
    const shipping = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work/references/shipping-workflow.md")

    // New language present in reference file
    expect(shipping).toContain("Testing addressed")

    // Old language fully removed from both
    expect(content).not.toContain("Tests pass (run project's test command)")
    expect(content).not.toContain("- All tests pass")
    expect(shipping).not.toContain("Tests pass (run project's test command)")
  })

  test("js-ce:work-beta mirrors testing deliberation and checklist changes", async () => {
    const beta = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work-beta/SKILL.md")
    // Checklist extracted to references/shipping-workflow.md
    const shipping = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work-beta/references/shipping-workflow.md")

    // Testing deliberation stays in SKILL.md (Phase 2 content)
    expect(beta).toContain("Assess testing coverage")

    // New checklist language in reference file
    expect(shipping).toContain("Testing addressed")

    // Old language removed from both
    expect(beta).not.toContain("Tests pass (run project's test command)")
    expect(beta).not.toContain("- All tests pass")
    expect(shipping).not.toContain("Tests pass (run project's test command)")
  })

  test("SKILL.md stub points to shipping-workflow reference", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work/SKILL.md")

    // Stub references the shipping-workflow file
    expect(content).toContain("`references/shipping-workflow.md`")

    // Extracted content is not in SKILL.md
    expect(content).not.toContain("2. **Code Review**")
    expect(content).not.toContain("## Quality Checklist")
    expect(content).not.toContain("## Code Review Tiers")
  })

  test("js-ce:work-beta SKILL.md stub points to shipping-workflow reference", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work-beta/SKILL.md")

    // Stub references the shipping-workflow file
    expect(content).toContain("`references/shipping-workflow.md`")

    // Extracted content is not in SKILL.md
    expect(content).not.toContain("2. **Code Review**")
    expect(content).not.toContain("## Quality Checklist")
    expect(content).not.toContain("## Code Review Tiers")
  })

  test("js-ce:work remains the stable non-delegating surface", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work/SKILL.md")

    expect(content).not.toContain("## Argument Parsing")
    expect(content).not.toContain("## Codex Delegation Mode")
    expect(content).not.toContain("delegate:codex")
  })
})

describe("js-ce:work-beta codex delegation contract", () => {
  test("has argument parsing with delegate tokens", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work-beta/SKILL.md")

    // Argument parsing section exists with delegation tokens
    expect(content).toContain("## Argument Parsing")
    expect(content).toContain("`delegate:codex`")
    expect(content).toContain("`delegate:local`")

    // Resolution chain present
    expect(content).toContain("### Settings Resolution Chain")
    expect(content).toContain("work_delegate")
    expect(content).toContain("config.local.yaml")
  })

  test("argument-hint includes delegate:codex for discoverability", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work-beta/SKILL.md")

    expect(content).toContain("argument-hint:")
    expect(content).toContain("delegate:codex")
  })

  test("remains manual-invocation beta during rollout", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work-beta/SKILL.md")

    expect(content).toContain("disable-model-invocation: true")
    expect(content).toContain("Invoke `js-ce:work-beta` manually")
    expect(content).toContain("planning and workflow handoffs remain pointed at stable `js-ce:work`")
  })

  test("SKILL.md has delegation routing stub pointing to reference", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work-beta/SKILL.md")

    expect(content).toContain("## Codex Delegation Mode")
    expect(content).toContain("references/codex-delegation-workflow.md")
    // Delegation details are NOT in SKILL.md body — they're in the reference
    expect(content).not.toContain("### Pre-Delegation Checks")
    expect(content).not.toContain("### Prompt Template")
    expect(content).not.toContain("### Execution Loop")
  })

  test("delegation routing gate in Phase 1 Step 4", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work-beta/SKILL.md")

    const gateIdx = content.indexOf("Delegation routing gate")
    const strategyTableIdx = content.indexOf("| **Inline**")
    expect(gateIdx).toBeGreaterThan(0)
    expect(gateIdx).toBeLessThan(strategyTableIdx)
    expect(content).toContain("Codex delegation requires a plan file")
  })

  test("delegation branches in Phase 2 task loop", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work-beta/SKILL.md")

    expect(content).toContain("If delegation_active: branch to the Codex Delegation Execution Loop")
  })

  test("delegation reference has all required sections", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work-beta/references/codex-delegation-workflow.md")

    // Pre-delegation checks
    expect(content).toContain("## Pre-Delegation Checks")
    expect(content).toContain("Platform Gate")
    expect(content).toContain("CODEX_SANDBOX")
    expect(content).toContain("command -v codex")
    expect(content).toContain("Consent Flow")

    // Batching
    expect(content).toContain("## Batching")

    // Prompt template
    expect(content).toContain("## Prompt Template")
    expect(content).toContain("<task>")
    expect(content).toContain("<constraints>")
    expect(content).toContain("<output_contract>")
    expect(content).toContain("the orchestrator will not re-run verification independently")

    // Result schema and execution loop
    expect(content).toContain("## Result Schema")
    expect(content).toContain("## Execution Loop")
    expect(content).toContain("codex exec")

    // Circuit breaker
    expect(content).toContain("consecutive_failures")
    expect(content).toContain("3 consecutive failures")

    // Rollback safety
    expect(content).toContain("git diff --quiet HEAD")
    expect(content).toContain("git checkout -- .")
    expect(content).toContain("Do NOT use bare `git clean -fd` without path arguments")

    // Mixed-model attribution
    expect(content).toContain("## Mixed-Model Attribution")
  })

  test("delegation reference has decision prompts for ask mode", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work-beta/references/codex-delegation-workflow.md")

    expect(content).toContain("## Delegation Decision")
    expect(content).toContain("work_delegate_decision")
    expect(content).toContain("Execute with Claude Code instead")
    expect(content).toContain("Delegate to Codex anyway")
    expect(content).toContain("the cost of delegating outweighs having Claude Code do them")
  })

  test("settings resolution includes delegation decision setting", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work-beta/SKILL.md")

    expect(content).toContain("work_delegate_decision")
    expect(content).toContain("`auto`")
    expect(content).toContain("`ask`")
  })

  test("has frontend design guidance ported from beta", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-work-beta/SKILL.md")

    expect(content).toContain("**Frontend Design Guidance**")
    expect(content).toContain("`frontend-design` skill")
  })
})

describe("js-ce:plan remains neutral during ce:work-beta rollout", () => {
  test("removes delegation-specific execution posture guidance", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-plan/SKILL.md")

    // Old tag removed from execution posture signals
    expect(content).not.toContain("add `Execution target: external-delegate`")

    // Old tag removed from execution note examples
    expect(content).not.toContain("Execution note: Execution target: external-delegate")

    // Planner stays neutral instead of teaching beta-only invocation
    expect(content).not.toContain("delegate:codex")
  })
})

describe("js-ce:brainstorm review contract", () => {
  test("requires document review before handoff", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-brainstorm/SKILL.md")
    const handoff = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-brainstorm/references/handoff.md")

    // Document review is no longer a forced Phase 3.5 step. Users opt in from the Phase 4 menu.
    expect(content).not.toContain("Phase 3.5")

    // Phase 3 and Phase 4 are extracted to references for token optimization.
    // Phase 3 now points at brainstorm-sections.md (content contract) plus a
    // format-rendering ref; Phase 4 points at handoff.md.
    expect(content).toContain("`references/brainstorm-sections.md`")
    expect(content).toContain("`references/handoff.md`")

    // Phase 4 menu exposes agent review as a first-class option and routes to js-document-review
    expect(handoff).toContain("Agent review of requirements doc with `js-document-review`")
    expect(handoff).toContain("Load the `js-document-review` skill")

    // Subsequent-round residual findings are surfaced as a prose nudge, not a separate menu option
    expect(handoff).toContain("Post-review nudge")
    expect(handoff).not.toContain("**Review and refine**")
  })
})

describe("js-ce:plan testing contract", () => {
  test("flags blank test scenarios on feature-bearing units as incomplete", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-plan/SKILL.md")

    // Phase 5.1 review checklist addresses blank test scenarios
    expect(content).toContain("blank or missing test scenarios")
    expect(content).toContain("Test expectation: none")

    // Template comment mentions the annotation convention
    expect(content).toContain("Test expectation: none -- [reason]")
  })
})

describe("js-ce:plan review contract", () => {
  test("requires document review after confidence check", async () => {
    // Document review instructions extracted to references/plan-handoff.md
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-plan/references/plan-handoff.md")

    // Phase 5.3.8 runs document-review before final checks (5.3.9)
    expect(content).toContain("## 5.3.8 Document Review")
    expect(content).toContain("`js-document-review` skill")

    // Document review must come before final checks so auto-applied edits are validated
    const docReviewIdx = content.indexOf("5.3.8 Document Review")
    const finalChecksIdx = content.indexOf("5.3.9 Final Checks")
    expect(docReviewIdx).toBeLessThan(finalChecksIdx)
  })

  test("SKILL.md stub points to plan-handoff reference", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-plan/SKILL.md")

    // Stub references the handoff file and marks document review as mandatory
    expect(content).toContain("`references/plan-handoff.md`")
    expect(content).toContain("Document review is mandatory")
  })

  test("uses headless mode by default and in pipeline context", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-plan/references/plan-handoff.md")

    // Default at Phase 5.3.8 is `mode:headless` so users opt into deeper interactive review
    // explicitly from the post-generation menu rather than being forced through it.
    expect(content).toContain("js-document-review` with `mode:headless`")
    expect(content).not.toContain("skip document-review and return control")

    // The interactive walkthrough is opt-in via the post-generation menu, not automatic
    expect(content).toContain("Run deeper doc review")
  })

  test("handoff options expose deeper-review opt-in alongside js-ce:work", async () => {
    const content = await readRepoFile("plugins/js-compound-engineering/skills/js-ce-plan/references/plan-handoff.md")

    // js-ce:work remains the recommended next-stage action (planning is done; review already ran)
    expect(content).toContain("**Start `/js-ce:work`** (recommended) - Begin implementing this plan in the current session")

    // Deeper review is a first-class menu fixture so users can engage with surfaced findings
    // without relying on free-form prompting; routed through js-document-review without headless mode.
    expect(content).toContain("**Run deeper doc review**")
    expect(content).toContain("`js-document-review`")
    expect(content).toContain("without** `mode:headless`")

    // Deeper-review menu fixture is hidden when no actionable findings remain so the menu
    // collapses back to a 4-option AskUserQuestion-friendly shape on Claude Code. FYI-only
    // state also hides the option since js-document-review's walkthrough is gated to actionable
    // findings (anchor 75/100, gated_auto/manual) and FYIs (anchor 50) bypass it.
    expect(content).toContain("Hide `Run deeper doc review` when no actionable findings remain")
    expect(content).toContain("proposed_fixes_count + decisions_count > 0")

    // Summary line above the menu surfaces autofix counts and remaining-bucket counts
    expect(content).toContain("Summary line above the menu")

    // No conditional ordering based on plan depth (review already ran)
    expect(content).not.toContain("**Options when js-document-review is recommended:**")
    expect(content).not.toContain("**Options for Standard or Lightweight plans:**")
  })
})
