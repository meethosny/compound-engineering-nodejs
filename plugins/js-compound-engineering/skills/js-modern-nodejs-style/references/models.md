# Models - Modern Node.js Style

## Prisma as Default ORM

```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role     @default(USER)
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

## Service Functions (Not Classes)

```javascript
// src/services/user.service.js
import {db} from '../lib/db.js';

export async function list({page = 1, limit = 20} = {}) {
  return db.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {createdAt: 'desc'},
  });
}

export async function getById(id) {
  return db.user.findUnique({where: {id}});
}

export async function create(data) {
  return db.user.create({data});
}

export async function update(id, data) {
  return db.user.update({where: {id}, data});
}

export async function remove(id) {
  return db.user.delete({where: {id}});
}
```

## Validation Schemas (Zod)

```javascript
// src/schemas/user.js
import {z} from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
});

export const updateUserSchema = createUserSchema.partial();
```

## Soft Delete Pattern

Use a `deletedAt` timestamp instead of actual deletion:

```javascript
export async function softDelete(id) {
  return db.user.update({
    where: {id},
    data: {deletedAt: new Date()},
  });
}

// Middleware to filter deleted records
const activeUsers = db.user.findMany({
  where: {deletedAt: null},
});
```

## Transaction Pattern

```javascript
export async function transferFunds(fromId, toId, amount) {
  return db.$transaction(async (tx) => {
    const from = await tx.account.update({
      where: {id: fromId},
      data: {balance: {decrement: amount}},
    });

    if (from.balance < 0) {
      throw new Error('Insufficient funds');
    }

    await tx.account.update({
      where: {id: toId},
      data: {balance: {increment: amount}},
    });

    return {from: fromId, to: toId, amount};
  });
}
```

## Drizzle Alternative

```javascript
import {pgTable, text, timestamp, uuid} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```
