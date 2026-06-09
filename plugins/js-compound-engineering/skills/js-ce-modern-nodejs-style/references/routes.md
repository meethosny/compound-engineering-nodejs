# Routes - Modern Node.js Style

## RESTful Route Organization

```javascript
// src/routes/users.js
import {Router} from 'express';
import {authenticate, authorize} from '../middleware/auth.js';
import {validate} from '../middleware/validate.js';
import {createUserSchema, updateUserSchema} from '../schemas/user.js';
import * as userService from '../services/user.service.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const users = await userService.list(req.query);
  res.json(users);
});

router.get('/:id', authenticate, async (req, res) => {
  const user = await userService.getById(req.params.id);
  if (!user) return res.status(404).json({error: 'Not found'});
  res.json(user);
});

router.post('/', validate(createUserSchema), async (req, res) => {
  const user = await userService.create(req.body);
  res.status(201).json(user);
});

router.put('/:id', authenticate, validate(updateUserSchema), async (req, res) => {
  const user = await userService.update(req.params.id, req.body);
  res.json(user);
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  await userService.remove(req.params.id);
  res.status(204).end();
});

export default router;
```

## Validation Middleware

```javascript
// src/middleware/validate.js
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(422).json({
        error: 'Validation failed',
        issues: result.error.issues,
      });
    }
    req.body = result.data;
    next();
  };
}
```

## Error Handling

Centralized error handler as last middleware:

```javascript
// src/middleware/error-handler.js
import {logger} from '../lib/logger.js';

export function errorHandler(error, req, res, _next) {
  logger.error({err: error, path: req.path}, 'Request error');

  const status = error.status ?? error.statusCode ?? 500;
  res.status(status).json({
    error: error.expose ? error.message : 'Internal server error',
  });
}
```

Use `http-errors` for structured errors:
```javascript
import createError from 'http-errors';

if (!user) throw createError(404, 'User not found');
if (!canEdit) throw createError(403, 'Not authorized');
```

## Fastify Alternative

```javascript
import Fastify from 'fastify';

const app = Fastify({logger: true});

app.get('/users', {
  schema: {
    querystring: {type: 'object', properties: {limit: {type: 'integer'}}},
    response: {200: {type: 'array', items: userSchema}},
  },
}, async (request) => {
  return userService.list(request.query);
});
```

## Middleware Composition

```javascript
// Apply middleware to specific route groups
app.use('/api', authenticate);
app.use('/api/admin', authorize('admin'));
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
```
