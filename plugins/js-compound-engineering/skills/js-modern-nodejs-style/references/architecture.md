# Architecture - Modern Node.js Style

## Project Structure

```
src/
├── routes/             # Route definitions
│   ├── users.js
│   └── orders.js
├── middleware/          # Express/Fastify middleware
│   ├── auth.js
│   ├── validate.js
│   └── error-handler.js
├── services/           # Business logic (plain functions)
│   ├── user.service.js
│   └── email.service.js
├── db/                 # Database schema and migrations
│   ├── schema.prisma   # or drizzle schema
│   └── migrations/
├── lib/                # Shared utilities
│   ├── config.js
│   └── logger.js
├── jobs/               # Background jobs
│   └── send-email.js
├── app.js              # App setup (middleware, routes)
└── server.js           # Server entry point
tests/
├── routes/
├── services/
└── helpers/
```

## Environment Configuration

Validate at startup, fail fast:

```javascript
// src/lib/config.js
import {z} from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  REDIS_URL: z.string().url().optional(),
});

export const config = schema.parse(process.env);
```

## Authentication

Custom JWT auth in ~50 lines:

```javascript
// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import {config} from '../lib/config.js';

export function authenticate(request, response, next) {
  const token = request.headers.authorization?.split(' ')[1];
  if (!token) return response.status(401).json({error: 'Token required'});

  try {
    request.user = jwt.verify(token, config.JWT_SECRET);
    next();
  } catch {
    response.status(401).json({error: 'Invalid token'});
  }
}

export function authorize(...roles) {
  return (request, response, next) => {
    if (!roles.includes(request.user.role)) {
      return response.status(403).json({error: 'Forbidden'});
    }
    next();
  };
}
```

## Background Jobs

Use BullMQ (Redis-backed) or simple in-process queues:

```javascript
// src/jobs/send-email.js
import {Queue, Worker} from 'bullmq';
import {config} from '../lib/config.js';

export const emailQueue = new Queue('email', {
  connection: {url: config.REDIS_URL},
});

new Worker('email', async (job) => {
  const {to, subject, body} = job.data;
  await sendEmail({to, subject, body});
}, {connection: {url: config.REDIS_URL}});
```

For projects without Redis, use a simple database-backed queue or node-cron.

## Caching

Use in-memory LRU for simple cases, Redis for distributed:

```javascript
import {LRUCache} from 'lru-cache';

const cache = new LRUCache({max: 500, ttl: 60_000});

export async function getCachedUser(id) {
  const cached = cache.get(`user:${id}`);
  if (cached) return cached;

  const user = await db.user.findUnique({where: {id}});
  if (user) cache.set(`user:${id}`, user);
  return user;
}
```

## Structured Logging

Use Pino (Matteo Collina's logger):

```javascript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: process.env.NODE_ENV === 'development'
    ? {target: 'pino-pretty'}
    : undefined,
});
```

## Graceful Shutdown

```javascript
// src/server.js
import {app} from './app.js';
import {config} from './lib/config.js';
import {logger} from './lib/logger.js';

const server = app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, async () => {
    logger.info(`Received ${signal}, shutting down...`);
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
}
```

## Security Patterns

```javascript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

app.use(helmet());
app.use(rateLimit({windowMs: 15 * 60 * 1000, max: 100}));
```

CORS configuration:
```javascript
import cors from 'cors';
app.use(cors({origin: config.ALLOWED_ORIGINS.split(',')}));
```
