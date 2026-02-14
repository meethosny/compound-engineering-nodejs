---
name: js-document-review
description: This skill should be used when reviewing brainstorm documents, plan files, or specifications for clarity, completeness, specificity, and YAGNI compliance. It performs structured self-review and auto-fixes minor issues while asking approval for substantive changes.
---

# Document Review

Structured self-review for brainstorm and plan documents. Assesses clarity, completeness, specificity, and YAGNI compliance. Auto-fixes minor issues, asks approval for substantive changes.

## When to Use

- After generating a plan with `/js-workflows:plan`
- After a brainstorm session with `/js-workflows:brainstorm`
- When reviewing any specification or design document
- As a quality gate before starting implementation

## Input

The document to review. Can be:
- A file path to a markdown document (e.g., `docs/plans/2026-02-14-feat-auth-plan.md`)
- Inline content from a previous command

## Review Dimensions

### 1. Clarity

- Is each section understandable without additional context?
- Are technical terms defined or commonly understood?
- Are sentences concise and unambiguous?
- Could a developer implement from this document alone?

### 2. Completeness

- Are all necessary sections present for the chosen detail level?
- Are acceptance criteria specific and testable?
- Are edge cases and error scenarios addressed?
- Are dependencies and prerequisites listed?
- Are file paths and code references included where helpful?

### 3. Specificity

- Do acceptance criteria use measurable language (not "should be fast" but "responds in <200ms")?
- Are implementation details concrete enough to act on?
- Are technology choices explicit (not "use a cache" but "use Redis/node-cache")?
- Do code examples reference real project paths?

### 4. YAGNI Compliance

- Does the plan include unnecessary features or abstractions?
- Are there "nice to have" items mixed in with core requirements?
- Is the scope minimal for the stated goal?
- Are future considerations clearly separated from MVP?

### 5. Consistency

- Do section headers follow the plan template conventions?
- Is the YAML frontmatter complete (title, type, date)?
- Do references use consistent formatting?
- Are checkbox lists properly formatted?

## Review Process

### Step 1: Read and Assess

Read the document completely. For each dimension, assign a grade:

| Grade | Meaning |
|-------|---------|
| PASS | Meets standard, no changes needed |
| MINOR | Small issues, auto-fixable |
| NEEDS WORK | Substantive gaps, requires user input |

### Step 2: Auto-Fix Minor Issues

For MINOR issues, fix them directly without asking:

- Typos and grammar errors
- Formatting inconsistencies (heading levels, list styles)
- Missing YAML frontmatter fields (add defaults)
- Broken markdown syntax
- Inconsistent checkbox formatting

Use the Edit tool to apply fixes, then note what was changed.

### Step 3: Flag Substantive Issues

For NEEDS WORK items, present them to the user using **AskUserQuestion**:

```
Document Review: [document name]

Clarity: PASS
Completeness: NEEDS WORK
  - Missing error handling section for API failures
  - No rollback strategy defined
Specificity: MINOR (auto-fixed)
  - Added response time targets to acceptance criteria
YAGNI: PASS
Consistency: MINOR (auto-fixed)
  - Fixed heading hierarchy

Would you like to address the completeness gaps?
```

**Options:**
1. **Address gaps** - Guide me through adding missing sections
2. **Accept as-is** - Proceed without changes
3. **Simplify** - Remove sections to reduce scope

### Step 4: Iterate

If the user chooses "Address gaps":
- Ask targeted questions about each gap
- Update the document with their answers
- Re-run assessment on changed sections only

## Output

After review is complete, summarize:

```
Document Review Complete: [filename]

Scores: Clarity PASS | Completeness PASS | Specificity PASS | YAGNI PASS | Consistency PASS

Auto-fixed: 3 minor issues
Addressed: 1 completeness gap (error handling section added)

The document is ready for implementation.
```
