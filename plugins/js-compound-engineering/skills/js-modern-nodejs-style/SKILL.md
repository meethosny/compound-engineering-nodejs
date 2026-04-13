---
name: js-modern-nodejs-style
description: Write Node.js code following modern, pragmatic patterns inspired by TJ Holowaychuk, Matteo Collina, and Sindre Sorhus. Use when writing Node.js applications, Express/Fastify/Hono APIs, creating modules, or any JavaScript/TypeScript server-side code. Triggers on Node.js code generation, refactoring requests, code review, or when the user wants clean, minimal, production-ready server-side JavaScript/TypeScript.
---

<objective>
Apply modern Node.js conventions to JavaScript and TypeScript code. This skill provides comprehensive domain expertise extracted from analyzing production-grade Node.js projects and the coding patterns of influential engineers like TJ Holowaychuk, Matteo Collina, and Sindre Sorhus.
</objective>

<essential_principles>
## Core Philosophy

"Simple modules, composed together. The best code is the code you don't write."

**Vanilla Node.js is plenty:**
- Pure functions and modules over class hierarchies
- Route handlers over controller abstractions
- Middleware for cross-cutting concerns
- Schema validation over manual parsing
- Built-in Node.js APIs over heavy frameworks
- Build solutions before reaching for packages

**What to deliberately avoid:**
- express-validator (use Zod/AJV directly)
- passport (write ~50 lines of auth middleware)
- sequelize (use Prisma, Drizzle, or raw SQL)
- moment.js (use native Date, Temporal, or date-fns)
- lodash (use native Array/Object methods)
- class-based service layers (use plain functions)
- GraphQL for simple APIs (REST is sufficient)
- jest for new projects (use Vitest or node:test)

**Development Philosophy:**
- Ship, Validate, Refine -- prototype-quality code to production to learn
- Fix root causes, not symptoms
- Async-first, streaming when possible
- Dependency-free when reasonable
</essential_principles>

<intake>
What are you working on?

1. **Routes & Handlers** - REST mapping, middleware, request/response patterns
2. **Data & Models** - Database patterns, Prisma/Drizzle, validation, schemas
3. **Frontend Integration** - Server-rendered HTML, htmx, API responses
4. **Architecture** - Project structure, auth, background jobs, caching
5. **Testing** - Vitest, node:test, integration tests
6. **Dependencies** - What to use vs avoid
7. **Code Review** - Review code against modern Node.js style
8. **General Guidance** - Philosophy and conventions

**Specify a number or describe your task.**
</intake>

<routing>

| Response | Reference to Read |
|----------|-------------------|
| 1, route, handler, middleware, API | `references/routes.md` |
| 2, model, database, prisma, drizzle, schema | `references/models.md` |
| 3, frontend, template, htmx, SSR | `references/frontend.md` |
| 4, architecture, auth, job, cache, structure | `references/architecture.md` |
| 5, test, testing, vitest | `references/testing.md` |
| 6, dependency, package, library | `references/dependencies.md` |
| 7, review | Read all references, then review code |
| 8, general task | Read relevant references based on context |

**After reading relevant references, apply patterns to the user's code.**
</routing>

<quick_reference>
## Naming Conventions

**Functions:** `createUser`, `validateEmail`, `sendNotification` (verb + noun)

**Middleware:** `authenticate`, `rateLimit`, `validateBody` (verb describing what it does)

**Modules:** `user.service.js`, `auth.middleware.js`, `order.routes.js` (noun + role)

**Constants:** `MAX_RETRIES`, `DEFAULT_TIMEOUT`, `CACHE_TTL`

## REST Mapping

Standard RESTful routes with Express/Fastify/Hono:

```
GET    /users          -> list
GET    /users/:id      -> get
POST   /users          -> create
PUT    /users/:id      -> update
DELETE /users/:id      -> remove
```

Instead of custom actions, create new resources:

```
POST /users/:id/suspend   -> POST /users/:id/suspension
DELETE /users/:id/suspend  -> DELETE /users/:id/suspension
```

## JavaScript/TypeScript Syntax Preferences

```javascript
// Destructuring with defaults
const {timeout = 5000, retries = 3} = options;

// Early returns over nested if/else
if (!user) return reply.code(404).send({error: 'Not found'});

// Async/await over callbacks or .then()
const user = await db.user.findUnique({where: {id}});

// Template literals over concatenation
const message = `User ${user.name} created successfully`;

// Optional chaining
const email = user?.profile?.email;

// Nullish coalescing
const port = process.env.PORT ?? 3000;
```

## Key Patterns

**Validation with Zod:**
```javascript
import {z} from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['user', 'admin']).default('user'),
});
```

**Error Handling Middleware:**
```javascript
function errorHandler(error, request, response, next) {
  const status = error.status ?? 500;
  response.status(status).json({
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && {stack: error.stack}),
  });
}
```

**Graceful Shutdown:**
```javascript
process.on('SIGTERM', async () => {
  await server.close();
  await db.$disconnect();
  process.exit(0);
});
```
</quick_reference>

<reference_index>
## Domain Knowledge

All detailed patterns in `references/`:

| File | Topics |
|------|--------|
| `references/routes.md` | REST mapping, middleware, validation, API patterns |
| `references/models.md` | Prisma/Drizzle patterns, schemas, migrations, validation |
| `references/frontend.md` | Server-rendered HTML, htmx, Tailwind, API responses |
| `references/architecture.md` | Project structure, auth, jobs, caching, database patterns |
| `references/testing.md` | Vitest, node:test, integration tests, fixtures |
| `references/dependencies.md` | What to use vs avoid, decision framework |
</reference_index>

<success_criteria>
Code follows modern Node.js style when:
- Route handlers are thin, delegating to service functions
- Validation uses schema libraries (Zod, AJV), not manual parsing
- No unnecessary abstractions or service-object hierarchies
- Database queries use Prisma/Drizzle or prepared SQL, not string concatenation
- Middleware handles cross-cutting concerns (auth, logging, error handling)
- Tests use Vitest or node:test with real database when possible
- Native Node.js APIs preferred over heavy utility libraries
- ES Modules throughout, no CommonJS
- Environment config via `process.env` with validation at startup
- Graceful shutdown and structured logging
</success_criteria>

<credits>
Inspired by the pragmatic philosophies of:
- **TJ Holowaychuk** (Express, Koa, co, debug, commander) -- small modules, middleware composition
- **Matteo Collina** (Fastify, Pino, undici, Platformatic) -- performance-first, schema validation, plugin architecture
- **Sindre Sorhus** (execa, got, ky, p-limit) -- one thing well, zero deps, ES Modules only

These are community-observed patterns, not endorsed style guides.
</credits>
