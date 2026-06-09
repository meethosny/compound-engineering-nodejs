## Code Review Results

**Scope:** merge-base with main -> working tree
**Intent:** Demonstrate stable finding numbering
**Mode:** interactive

**Reviewers:** correctness, testing, maintainability

### Applied (safe, verified)

| # | File | Fix | Reviewer |
|---|------|-----|----------|
| 4 | `export-service.ts:60 (+test)` | Tightened export file perms 0644 -> 0600 (security-posture — verify in diff) | security |

Validation: tests 18 -> 19; suite 96 pass, lint clean.

### P1 -- High

| # | File | Issue | Reviewer | Confidence |
|---|------|-------|----------|------------|
| 1 | `export-service.ts:87` | Loads all orders into memory | performance | 100 |
| 2 | `export-service.ts:91` | Missing pagination contract | api-contract | 75 |

- **#1** — `Order.where(...).toArray()` materializes the full result set; stream with a cursor or paginate.

### P2 -- Moderate

| # | File | Issue | Reviewer | Confidence |
|---|------|-------|----------|------------|
| 3 | `export-service.ts:45` | Missing error handling | correctness | 75 |

### Actionable Findings

| # | File | Issue | Route | Next Step |
|---|------|-------|-------|-----------|
| 2 | `export-service.ts:91` | Missing pagination contract | `manual -> downstream-resolver` | Defer via tracker with API contract context |
| 3 | `export-service.ts:45` | Missing error handling | `gated_auto -> downstream-resolver` | Defer via tracker pending behavior approval |
