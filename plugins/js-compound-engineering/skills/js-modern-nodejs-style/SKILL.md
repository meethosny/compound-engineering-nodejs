---
name: js-modern-nodejs-style
description: Write Node.js code following modern, pragmatic patterns. Use this skill when writing Node.js applications, Express/Fastify/Hono APIs, creating modules, or any JavaScript/TypeScript server-side code. MVP-focused, minimal dependencies, async-first design. Triggers on Node.js code generation, API development, middleware patterns, or when user wants modern server-side JavaScript.
---

# Modern Node.js Style Guide

Write Node.js code following pragmatic, MVP-focused patterns: **minimalism**, **composability**, **async-first design**, and **ship fast**.

## Quick Reference

### Middleware Patterns (Express/Fastify/Hono)
- **Single responsibility**: One middleware, one task
- **Composition over configuration**: Chain small middlewares
- **Early returns**: Exit conditions first
- **Error handling**: Centralized error middleware

```javascript
// Good: Single-purpose middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    req.user = await verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Good: Compose middlewares
app.use('/api', authenticate, rateLimit, validateInput);
```

### Route Handler Design
- Short, focused handlers (5-15 lines)
- Extract business logic to modules
- Use async/await with proper error handling
- Return early for error conditions

```javascript
// Good: Clean, focused handler
const createUser = async (req, res, next) => {
  try {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

// Good: Early return pattern
const getUser = async (req, res, next) => {
  const user = await userService.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
};
```

### Module Design (MVP-Focused)
- Named exports over default exports
- Factory functions for configuration
- Explicit dependencies (no globals)
- Pure functions when possible
- Zero external deps when feasible

```javascript
// Good: Named exports, factory pattern
export const createUserService = (db) => ({
  async create(data) {
    return db.users.insert(data);
  },
  async findById(id) {
    return db.users.findOne({ id });
  }
});

// Good: Explicit dependencies
export const userRoutes = (userService, authMiddleware) => {
  const router = express.Router();
  router.get('/:id', authMiddleware, async (req, res) => {
    const user = await userService.findById(req.params.id);
    res.json(user);
  });
  return router;
};
```

### Error Handling
- Centralized error handler
- Custom error classes for business logic
- Operational vs programmer errors
- Never swallow errors silently

```javascript
// Custom errors
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

// Centralized handler (last middleware)
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

### Configuration Pattern
- Environment variables via process.env
- Config module with validation
- Fail fast on missing required config

```javascript
// config.js
const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
};

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  dbUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
};
```

### Async Patterns
- Always use async/await (no callbacks)
- Promise.all for parallel operations
- Avoid nested promises
- Handle rejections properly

```javascript
// Good: Parallel operations
const [users, posts] = await Promise.all([
  userService.findAll(),
  postService.findRecent()
]);

// Good: Sequential when needed
const user = await userService.findById(id);
const posts = await postService.findByUser(user.id);
```

### Project Structure (Minimal)

```
src/
├── index.js          # Entry point
├── app.js            # Express/Fastify/Hono app setup
├── config.js         # Configuration
├── routes/           # Route handlers
│   └── users.js
├── services/         # Business logic
│   └── user.js
├── middleware/       # Custom middleware
│   └── auth.js
└── utils/            # Shared utilities
```

### Testing (Node.js Test Runner)
- Use built-in test runner (Node 20+)
- Simple, focused tests
- Test behavior, not implementation

```javascript
import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('UserService', () => {
  test('creates user with valid data', async () => {
    const user = await userService.create({ name: 'Test' });
    assert.strictEqual(user.name, 'Test');
  });
});
```

## Anti-Patterns to Avoid

| Anti-Pattern | Why Bad | Do Instead |
|--------------|---------|------------|
| Callback hell | Unreadable, error-prone | async/await |
| Global state | Hard to test, race conditions | Dependency injection |
| Massive files | Hard to maintain | Small, focused modules |
| Premature abstraction | Over-engineering | YAGNI - build when needed |
| Deep nesting | Hard to follow | Early returns, flat code |
| Sync file I/O | Blocks event loop | Use async versions |
| console.log in prod | No structure, perf hit | Pino or similar logger |

## Performance (Without Over-Optimization)

- Use streaming for large responses
- Connection pooling for databases
- Avoid blocking the event loop
- Cache expensive operations when obvious

## Philosophy Summary

1. **Minimalism**: Small modules, minimal dependencies
2. **Composability**: Build from interchangeable parts
3. **Async-first**: Never block the event loop
4. **Ship fast**: MVP first, enhance based on feedback
5. **Explicit over magic**: Clear code over clever code
6. **Pragmatic**: Working code beats perfect code

## Detailed References

For deeper patterns, see:
- `references/patterns.md` - Complete code patterns with examples
- `references/resources.md` - Links to influential repos and articles
