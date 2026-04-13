---
name: js-sindre-sorhus-package-writer
description: Write npm packages following Sindre Sorhus's proven patterns and philosophy. Use when creating new npm packages, Node.js libraries, CLI tools, or when the user wants clean, minimal, production-ready JavaScript/TypeScript library code. Triggers on requests like "create a package", "write an npm library", "design a module API", or mentions of Sindre Sorhus's style.
---

# Sindre Sorhus Package Writer

Write npm packages following Sindre Sorhus's battle-tested patterns from 1000+ packages with billions of downloads (got, execa, ky, p-limit, del, ora, chalk, boxen, meow, globby).

## Core Philosophy

**Do one thing well.** Zero or minimal dependencies. ES Modules only. TypeScript definitions always. Every pattern serves real-world use cases.

## Entry Point Structure

Every package follows this exact pattern in `index.js`:

```javascript
// 1. No dependencies when possible (use Node.js built-ins)

// 2. Simple, focused API
export function doThing(input, options = {}) {
  if (typeof input !== 'string') {
    throw new TypeError(`Expected a string, got ${typeof input}`);
  }

  const {
    optionA = true,
    optionB = 10,
  } = options;

  // Implementation
  return result;
}
```

## Options Object Pattern

The signature Sorhus pattern -- single options object with smart defaults:

```javascript
// Usage
import {execa} from 'execa';
await execa('npm', ['run', 'test'], {cwd: '/path', timeout: 5000});

// Implementation
export function doThing(input, options = {}) {
  const {
    cwd = process.cwd(),
    timeout = 0,
    signal,
  } = options;

  // Validate options explicitly
  if (timeout !== 0 && typeof timeout !== 'number') {
    throw new TypeError(`Expected \`timeout\` to be a number, got ${typeof timeout}`);
  }

  // Implementation
}
```

## Framework Integration

**Always use pure ESM -- never require CommonJS compatibility:**

```javascript
// WRONG - dual CJS/ESM
"main": "index.cjs",
"module": "index.js",

// CORRECT - ESM only
"type": "module",
"exports": "./index.js",
```

**For packages that enhance frameworks (Express, Fastify, etc.):**

```javascript
// Export middleware/plugin that follows framework conventions
export default function myMiddleware(options = {}) {
  return (request, response, next) => {
    // Implementation
    next();
  };
}
```

## Configuration Pattern

Use options objects, not configuration singletons:

```javascript
// WRONG - global mutable state
import {configure} from 'my-package';
configure({timeout: 5000});

// CORRECT - per-call options
import {doThing} from 'my-package';
doThing(input, {timeout: 5000});
```

For packages that genuinely need shared config (like `got` instances):

```javascript
import ky from 'ky';

const api = ky.create({
  prefixUrl: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'x-api-key': process.env.API_KEY,
  },
});

// Extend for specific use cases
const authApi = api.extend({
  hooks: {
    beforeRequest: [addAuthHeader],
  },
});
```

## Error Handling

Custom error classes with useful properties:

```javascript
export class PackageError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'PackageNameError';
    this.code = options.code;
  }
}

// Validate early with TypeError
export function doThing(input) {
  if (typeof input !== 'string') {
    throw new TypeError(`Expected a string, got ${typeof input}`);
  }
}
```

## Testing (Node.js Built-in Test Runner)

```javascript
// test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {doThing} from './index.js';

test('basic usage', () => {
  assert.equal(doThing('hello'), 'processed hello');
});

test('with options', () => {
  assert.equal(
    doThing('hello', {optionA: false}),
    'alternate result',
  );
});

test('throws on invalid input', () => {
  assert.throws(
    () => doThing(123),
    {name: 'TypeError'},
  );
});
```

## Package.json Pattern

Zero runtime dependencies when possible:

```json
{
  "name": "package-name",
  "version": "1.0.0",
  "description": "Do one specific thing well",
  "license": "MIT",
  "repository": "username/package-name",
  "type": "module",
  "exports": "./index.js",
  "types": "./index.d.ts",
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "test": "node --test"
  },
  "files": [
    "index.js",
    "index.d.ts"
  ],
  "keywords": ["relevant", "keywords"]
}
```

## Anti-Patterns to Avoid

- Default exports for utility packages (use named exports)
- CommonJS `require()` (use ES Modules)
- `index.ts` compiled to CJS (ship ESM with `.d.ts`)
- Configuration singletons (use options objects)
- Many runtime dependencies (zero deps when possible)
- Giant monolith packages (one thing well)
- No TypeScript definitions (always include `.d.ts`)
- Complex class hierarchies (prefer functions)

## Reference Files

For deeper patterns, see:
- `references/module-organization.md` - ESM patterns, exports, directory layouts
- `references/framework-integration.md` - Express, Fastify, Hono patterns
- `references/database-adapters.md` - Multi-database support patterns
- `references/testing-patterns.md` - Node.js test runner, CI setup
- `references/resources.md` - Links to Sindre's repos and articles
