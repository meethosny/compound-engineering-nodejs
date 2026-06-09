# Testing - Modern Node.js Style

## Core Philosophy

"Vitest or node:test -- simple, fast, no magic." Prioritize pragmatism over ceremony.

## Why Vitest Over Jest

- **Faster**: Native ESM support, no transform overhead
- **Compatible**: Jest-compatible API for easy migration
- **Built-in**: TypeScript support without config
- **Watch mode**: Instant feedback during development

## Test Structure

```javascript
// tests/services/user.test.js
import {describe, it, expect, beforeEach} from 'vitest';
import {db} from '../../src/lib/db.js';
import * as userService from '../../src/services/user.service.js';

describe('userService', () => {
  beforeEach(async () => {
    await db.user.deleteMany();
  });

  it('creates a user', async () => {
    const user = await userService.create({
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(user.email).toBe('test@example.com');
    expect(user.id).toBeDefined();
  });

  it('rejects duplicate emails', async () => {
    await userService.create({email: 'dup@example.com', name: 'First'});

    await expect(
      userService.create({email: 'dup@example.com', name: 'Second'}),
    ).rejects.toThrow();
  });
});
```

## Integration Tests

Test full HTTP request/response cycles:

```javascript
import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import {app} from '../../src/app.js';
import supertest from 'supertest';

const request = supertest(app);

describe('POST /api/users', () => {
  it('creates a user', async () => {
    const response = await request
      .post('/api/users')
      .send({email: 'new@example.com', name: 'New User'})
      .expect(201);

    expect(response.body.email).toBe('new@example.com');
  });

  it('validates input', async () => {
    const response = await request
      .post('/api/users')
      .send({email: 'invalid'})
      .expect(422);

    expect(response.body.error).toBe('Validation failed');
  });
});
```

## Test Database Setup

Use a separate test database, reset between tests:

```javascript
// tests/setup.js
import {db} from '../src/lib/db.js';

export async function resetDatabase() {
  const tables = await db.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;

  for (const {tablename} of tables) {
    if (tablename !== '_prisma_migrations') {
      await db.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE`);
    }
  }
}
```

## node:test Alternative

For packages and simple projects:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';

test('basic operation', async () => {
  const result = await doThing('input');
  assert.equal(result, 'expected output');
});
```

## Testing Principles

1. **Test behavior, not implementation** -- check what the function returns, not how it works
2. **Use real databases** -- avoid mocking the database layer
3. **Tests ship with features** -- same PR, not before or after
4. **Integration tests over unit tests** -- test the full stack when possible
5. **Security fixes always include regression tests**

## File Organization

```
tests/
├── routes/            # HTTP integration tests
├── services/          # Service function tests
├── middleware/         # Middleware tests
├── helpers/           # Test utilities
├── fixtures/          # Test data (JSON, SQL)
└── setup.js           # Global test setup
```
