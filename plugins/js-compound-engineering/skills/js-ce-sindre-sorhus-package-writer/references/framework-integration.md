# Framework Integration Patterns

## Express/Fastify Middleware Pattern

```javascript
// Middleware factory with options
export default function myMiddleware(options = {}) {
  const {timeout = 5000, onError} = options;

  return (request, response, next) => {
    // Implementation
    next();
  };
}
```

## Fastify Plugin Pattern

```javascript
import fp from 'fastify-plugin';

async function myPlugin(fastify, options) {
  const {prefix = '/api'} = options;

  fastify.decorate('myFeature', {
    doThing(input) {
      // Implementation
    },
  });
}

export default fp(myPlugin, {
  name: 'my-plugin',
  fastify: '5.x',
});
```

## Hono Middleware Pattern

```javascript
export function myMiddleware(options = {}) {
  return async (context, next) => {
    // Before
    await next();
    // After
  };
}
```

## Database Adapter Pattern

Abstract base with dialect-specific implementations:

```javascript
// source/adapters/base.js
export class BaseAdapter {
  constructor(connection) {
    this.connection = connection;
  }

  async query(sql, params) {
    throw new Error('Not implemented');
  }
}

// source/adapters/postgres.js
export class PostgresAdapter extends BaseAdapter {
  async query(sql, params) {
    return this.connection.query(sql, params);
  }

  async setTimeout(ms) {
    await this.query(`SET statement_timeout = ${ms}`);
  }
}

// source/adapters/mysql.js
export class MySQLAdapter extends BaseAdapter {
  async query(sql, params) {
    const [rows] = await this.connection.execute(sql, params);
    return rows;
  }

  async setTimeout(ms) {
    await this.query(`SET max_execution_time = ${ms}`);
  }
}
```

## Adapter Detection

```javascript
export function createAdapter(connection) {
  const dialect = detectDialect(connection);

  switch (dialect) {
    case 'postgres': return new PostgresAdapter(connection);
    case 'mysql': return new MySQLAdapter(connection);
    case 'sqlite': return new SQLiteAdapter(connection);
    default: return new BaseAdapter(connection);
  }
}

function detectDialect(connection) {
  if (connection.constructor.name.includes('Pool')) return 'postgres';
  if (connection.constructor.name.includes('Connection')) return 'mysql';
  return 'unknown';
}
```

## ORM Integration (Prisma/Drizzle)

```javascript
// Works with any ORM by accepting the client
export function createHelper(prisma) {
  return {
    async findOrCreate(model, where, data) {
      const existing = await prisma[model].findUnique({where});
      if (existing) return existing;
      return prisma[model].create({data: {...where, ...data}});
    },
  };
}
```
