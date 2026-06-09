# Persona Catalog

16 reviewer personas organized into always-on, cross-cutting conditional, and stack-specific conditional layers, plus CE-specific agents. The orchestrator uses this catalog to select which reviewers to spawn for each review.

## Always-on (4 personas + 2 CE agents)

Spawned on every review regardless of diff content.

**Persona agents (structured JSON output):**

| Persona | Agent | Focus |
|---------|-------|-------|
| `correctness` | `js-ce-correctness-reviewer` | Logic errors, edge cases, state bugs, error propagation, intent compliance |
| `testing` | `js-ce-testing-reviewer` | Coverage gaps, weak assertions, brittle tests, missing edge case tests |
| `maintainability` | `js-ce-maintainability-reviewer` | Structural quality, complexity deletion, 1k-line regressions, coupling, type-boundary leaks, dead code, premature abstraction |
| `project-standards` | `js-ce-project-standards-reviewer` | CLAUDE.md and AGENTS.md compliance -- frontmatter, references, naming, cross-platform portability, tool selection |

**CE agents (unstructured output, synthesized separately):**

| Agent | Focus |
|-------|-------|
| `js-ce-agent-native-reviewer` | Verify new features are agent-accessible |
| `js-ce-learnings-researcher` | Search docs/solutions/ for past issues related to this PR's modules and patterns |

## Conditional (8 personas)

Spawned when the orchestrator identifies relevant patterns in the diff. The orchestrator reads the full diff and reasons about selection -- this is agent judgment, not keyword matching.

| Persona | Agent | Select when diff touches... |
|---------|-------|---------------------------|
| `security` | `js-ce-security-reviewer` | Auth middleware, public endpoints, user input handling, permission checks, secrets management |
| `performance` | `js-ce-performance-reviewer` | Database queries, ORM calls, loop-heavy data transforms, caching layers, async/concurrent code |
| `api-contract` | `js-ce-api-contract-reviewer` | Route definitions, serializer/interface changes, event schemas, exported type signatures, API versioning |
| `data-migration` | `js-ce-data-migration-reviewer` | Migration files, schema artifacts (`prisma/schema.prisma`, `db/schema.ts`), backfill scripts, data transformations -- **not** model/query-only changes without migration artifacts |
| `reliability` | `js-ce-reliability-reviewer` | Error handling, retry logic, circuit breakers, timeouts, background jobs, async handlers, health checks |
| `adversarial` | `js-ce-adversarial-reviewer` | Diff has >=50 changed non-test, non-generated, non-lockfile lines, OR touches auth, payments, data mutations, external API integrations, or other high-risk domains |
| `cli-readiness` | `js-ce-cli-readiness-reviewer` | CLI command definitions, argument parsing, CLI framework usage, command handler implementations |
| `previous-comments` | `js-ce-previous-comments-reviewer` | **PR-only AND comment-gated.** Reviewing a PR that has existing review comments or review threads from prior review rounds. Skip entirely when no PR metadata was gathered in Stage 1, OR when Stage 1's `hasPriorComments` flag is false (no `reviews` and no `comments` on the PR). |

## Stack-Specific Conditional (4 personas)

These reviewers keep their opinionated lens. They cover runtime behavior and stack conventions the always-on personas do not specialize in, and are additive with the cross-cutting personas above -- not replacements for them. Structural and maintainability concerns live in the always-on `maintainability` persona -- do not spawn extra stack reviewers for philosophy or convention-only passes.

| Persona | Agent | Select when diff touches... |
|---------|-------|---------------------------|
| `js-modern-nodejs` | `js-ce-modern-nodejs-reviewer` | Node.js architecture, service objects, authentication/session choices, Hotwire-vs-SPA boundaries, or abstractions that may fight Node.js conventions |
| `kieran-typescript` | `js-ce-kieran-typescript-reviewer` | Node.js/TypeScript application-layer code -- controllers, models, views, jobs, components, routes, services, hooks, utilities, or shared types where clarity and conventions matter |
| `kieran-python` | `js-ce-kieran-python-reviewer` | Python modules, endpoints, services, scripts, or typed domain code |
| `julik-frontend-races` | `js-ce-julik-frontend-races-reviewer` | Stimulus/Turbo controllers, DOM event wiring, timers, async UI flows, animations, or frontend state transitions with race potential |

## CE Conditional Agents (migration-specific)

Spawn `js-ce-deployment-verification-agent` when the migration-artifact gate applies **and** the change is risky (destructive DDL, backfills, NOT NULL without default, column renames/drops). Schema drift and migration safety live in the `data-migration` persona -- not separate CE agents.

| Agent | Focus |
|-------|-------|
| `js-ce-deployment-verification-agent` | Go/No-Go deployment checklist with SQL verification queries and rollback procedures |

## Selection rules

1. **Always spawn all 4 always-on personas** plus the 2 CE always-on agents.
2. **For each cross-cutting conditional persona**, the orchestrator reads the diff and decides whether the persona's domain is relevant. This is a judgment call, not a keyword match.
3. **For each stack-specific conditional persona**, use file types and changed patterns as a starting point, then decide whether the diff actually introduces meaningful work for that reviewer. Do not spawn language-specific reviewers just because one config or generated file happens to match the extension.
4. **For `data-migration`**, spawn only when the diff includes migration or schema artifacts (`prisma/migrations/*`, `prisma/schema.prisma`, `db/schema.ts`, TypeORM/Knex/Sequelize/Drizzle migration paths, or explicit backfill/data-transform scripts). Do **not** spawn for model-only or query-only changes without those files.
5. **For CE conditional agents**, spawn `js-ce-deployment-verification-agent` when the migration-artifact gate applies and the change is risky (see above).
6. **Announce the team** before spawning with a one-line justification per conditional reviewer selected.
