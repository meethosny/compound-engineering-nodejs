# Dependencies - Modern Node.js Style

## What to Use

**Web Frameworks:**
- **Fastify** - Performance-first, schema validation built-in (Matteo Collina)
- **Hono** - Ultra-lightweight, works everywhere (Node, Deno, Bun, Edge)
- **Express** - When team familiarity matters

**Database:**
- **Prisma** - Type-safe ORM, excellent DX
- **Drizzle** - Lightweight, SQL-like TypeScript ORM
- **postgres** (porsager) - Zero-dep PostgreSQL client

**Validation:**
- **Zod** - TypeScript-first schema validation
- **AJV** - JSON Schema validation (used by Fastify)

**Auth:**
- **jose** - JWT/JWE/JWS implementation
- Custom middleware (~50 lines vs passport)

**Logging:**
- **Pino** - Fast, structured JSON logging (Matteo Collina)

**HTTP Client:**
- **ky** or **got** - For external API calls (Sindre Sorhus)
- **undici** - Node.js built-in HTTP client (Matteo Collina)

**Testing:**
- **Vitest** - Fast, ESM-native test runner
- **node:test** - For packages, zero-dep testing

**Background Jobs:**
- **BullMQ** - Redis-backed job queue
- **node-cron** - Simple scheduled tasks

## What to Deliberately Avoid

| Instead of | Use |
|------------|-----|
| passport | Custom JWT middleware (~50 lines) |
| sequelize | Prisma or Drizzle |
| moment.js | date-fns or native Date/Temporal |
| lodash | Native Array/Object methods |
| express-validator | Zod or AJV |
| class-based services | Plain functions |
| winston | Pino |
| jest (new projects) | Vitest or node:test |
| axios | ky, got, or undici |
| dotenv | Node.js --env-file flag (v20.6+) |

## Decision Framework

Before adding a dependency:

1. **Can Node.js built-ins do this?** -- `node:fs`, `node:crypto`, `node:test`, `fetch()`
2. **Is the complexity worth it?** -- 50 lines of custom code vs 10,000-line package
3. **Does it add infrastructure?** -- Redis? Consider database-backed alternatives
4. **How maintained is it?** -- Check last publish date, open issues, bus factor
5. **How many transitive deps?** -- Each dep is an attack surface

The philosophy: use packages when they genuinely solve a problem you have, not a problem you might have.
