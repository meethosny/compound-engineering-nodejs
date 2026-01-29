# Modern Node.js Patterns Reference

Comprehensive code patterns for pragmatic, MVP-focused Node.js development.

## Express Application Setup

### Minimal Express App

```javascript
import express from 'express';
import helmet from 'helmet';
import { config } from './config.js';
import { errorHandler } from './middleware/error.js';
import { userRoutes } from './routes/users.js';

const app = express();

// Essential middleware only
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
```

### Fastify Alternative (Performance-First)

```javascript
import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/users/:id', async (request, reply) => {
  const user = await userService.findById(request.params.id);
  if (!user) return reply.code(404).send({ error: 'Not found' });
  return user;
});

await fastify.listen({ port: 3000 });
```

### Hono Alternative (Ultrafast, Edge-Ready)

[Hono](https://hono.dev/) is an ultrafast, lightweight web framework (~14kb) that runs on any JavaScript runtime including Node.js, Deno, Bun, and edge platforms like Cloudflare Workers.

```javascript
import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

app.get('/users/:id', async (c) => {
  const user = await userService.findById(c.req.param('id'));
  if (!user) return c.json({ error: 'Not found' }, 404);
  return c.json(user);
});

app.get('/health', (c) => c.json({ status: 'ok' }));

serve({ fetch: app.fetch, port: 3000 });
```

## Middleware Composition

### Authentication Chain

```javascript
// Individual middlewares
const extractToken = (req, res, next) => {
  req.token = req.headers.authorization?.split(' ')[1];
  next();
};

const verifyToken = async (req, res, next) => {
  if (!req.token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = await jwt.verify(req.token, config.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Compose
const adminOnly = [extractToken, verifyToken, requireRole('admin')];
app.delete('/users/:id', ...adminOnly, deleteUser);
```

## Service Layer Pattern

### Clean Service Design

```javascript
// services/user.js
export const createUserService = (db, emailService) => {
  const create = async (data) => {
    const user = await db.users.insert({
      ...data,
      createdAt: new Date()
    });
    await emailService.sendWelcome(user.email);
    return user;
  };

  const findById = async (id) => {
    return db.users.findOne({ id });
  };

  const update = async (id, data) => {
    return db.users.updateOne({ id }, { $set: data });
  };

  return { create, findById, update };
};
```

### Dependency Injection Setup

```javascript
// container.js
import { createUserService } from './services/user.js';
import { createEmailService } from './services/email.js';
import { db } from './db.js';

const emailService = createEmailService(config.smtp);
const userService = createUserService(db, emailService);

export { userService, emailService };
```

## Database Patterns

### Connection Pooling (PostgreSQL)

```javascript
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: config.dbUrl,
  max: 20,
  idleTimeoutMillis: 30000
});

export const query = (text, params) => pool.query(text, params);
```

### Simple Query Helpers

```javascript
export const db = {
  users: {
    async findOne(where) {
      const keys = Object.keys(where);
      const values = Object.values(where);
      const conditions = keys.map((k, i) => `${k} = $${i + 1}`).join(' AND ');
      const { rows } = await query(
        `SELECT * FROM users WHERE ${conditions} LIMIT 1`,
        values
      );
      return rows[0];
    },
    async insert(data) {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const { rows } = await query(
        `INSERT INTO users (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return rows[0];
    }
  }
};
```

## Validation Patterns

### Simple Validation (No Library)

```javascript
const validateUser = (data) => {
  const errors = [];
  
  if (!data.email?.includes('@')) {
    errors.push('Invalid email');
  }
  if (!data.name || data.name.length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  if (errors.length) {
    throw new ValidationError(errors.join(', '));
  }
  
  return data;
};
```

### With Zod (When Needed)

```javascript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().int().positive().optional()
});

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }
  req.validated = result.data;
  next();
};

app.post('/users', validateBody(userSchema), createUser);
```

## Logging with Pino

```javascript
import pino from 'pino';

export const logger = pino({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  transport: config.nodeEnv === 'development' 
    ? { target: 'pino-pretty' } 
    : undefined
});

// Usage
logger.info({ userId: user.id }, 'User created');
logger.error({ err, requestId: req.id }, 'Request failed');
```

## Graceful Shutdown

```javascript
const gracefulShutdown = async (signal) => {
  logger.info({ signal }, 'Shutting down gracefully');
  
  server.close(async () => {
    await pool.end();
    logger.info('Connections closed');
    process.exit(0);
  });
  
  // Force exit after timeout
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```
