---
name: sindre-sorhus-package-writer
description: Write npm packages following Sindre Sorhus's proven patterns and philosophy. Use when creating new npm packages, Node.js libraries, CLI tools, or when the user wants clean, minimal, production-ready JavaScript/TypeScript library code. Triggers on requests like "create a package", "write an npm library", "design a module API", or mentions of package publishing.
---

# Sindre Sorhus Package Writer

Write npm packages following Sindre Sorhus's battle-tested patterns from 1000+ packages with billions of downloads.

## Core Philosophy

**Do one thing well.** Zero runtime dependencies when possible. ES Modules first. TypeScript definitions always. Ship fast, iterate based on feedback.

## Package Structure

```
package-name/
├── index.js          # Main entry (ESM)
├── index.d.ts        # TypeScript definitions
├── package.json      # Minimal, correct
├── readme.md         # Clear, comprehensive
├── license           # MIT
└── test.js           # Simple tests
```

## Package.json Pattern

```json
{
  "name": "package-name",
  "version": "1.0.0",
  "description": "Do one specific thing well",
  "license": "MIT",
  "repository": "username/package-name",
  "author": {
    "name": "Your Name",
    "email": "you@example.com",
    "url": "https://yoursite.com"
  },
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
  "keywords": [
    "relevant",
    "keywords",
    "here"
  ]
}
```

## Entry Point Pattern

```javascript
// index.js - Clean, focused API
export function doThing(input, options = {}) {
  if (typeof input !== 'string') {
    throw new TypeError(`Expected string, got ${typeof input}`);
  }

  const {
    optionA = true,
    optionB = 10
  } = options;

  // Implementation
  return result;
}

// Multiple exports when needed
export function relatedThing(input) {
  // ...
}
```

## TypeScript Definitions

```typescript
// index.d.ts
export interface Options {
  /**
   * Description of optionA.
   * @default true
   */
  readonly optionA?: boolean;

  /**
   * Description of optionB.
   * @default 10
   */
  readonly optionB?: number;
}

/**
 * Does one specific thing well.
 * 
 * @param input - The input to process.
 * @param options - Configuration options.
 * @returns The processed result.
 * 
 * @example
 * ```
 * import { doThing } from 'package-name';
 * 
 * doThing('hello');
 * //=> 'processed hello'
 * ```
 */
export function doThing(input: string, options?: Options): string;
```

## README Pattern

````markdown
# package-name

> One-line description of what it does

## Install

```sh
npm install package-name
```

## Usage

```js
import { doThing } from 'package-name';

doThing('hello');
//=> 'processed hello'

doThing('hello', { optionA: false });
//=> 'alternate result'
```

## API

### doThing(input, options?)

#### input

Type: `string`

Description of the input.

#### options

Type: `object`

##### optionA

Type: `boolean`\
Default: `true`

Description of optionA.

##### optionB

Type: `number`\
Default: `10`

Description of optionB.

## Related

- [related-package](https://github.com/user/related-package) - Does X
- [another-package](https://github.com/user/another-package) - Does Y
````

## Input Validation

```javascript
// Validate immediately, fail fast
export function processItems(items, options = {}) {
  if (!Array.isArray(items)) {
    throw new TypeError(`Expected array, got ${typeof items}`);
  }

  if (items.length === 0) {
    throw new Error('Expected non-empty array');
  }

  const { limit = Infinity } = options;

  if (typeof limit !== 'number' || limit < 0) {
    throw new TypeError('Option `limit` must be a positive number');
  }

  // Implementation after validation
}
```

## Error Handling

```javascript
// Custom errors for specific failures
class PackageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PackageNameError';
  }
}

// Use built-in errors appropriately
throw new TypeError('message');    // Wrong type
throw new RangeError('message');   // Out of range
throw new Error('message');        // General errors
```

## Testing (Node.js Test Runner)

```javascript
// test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { doThing } from './index.js';

test('basic usage', () => {
  assert.equal(doThing('hello'), 'processed hello');
});

test('with options', () => {
  assert.equal(
    doThing('hello', { optionA: false }),
    'alternate result'
  );
});

test('throws on invalid input', () => {
  assert.throws(
    () => doThing(123),
    { name: 'TypeError' }
  );
});
```

## CLI Pattern (When Applicable)

```javascript
#!/usr/bin/env node
// cli.js
import { doThing } from './index.js';

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help')) {
  console.log(`
  Usage
    $ package-name <input>

  Options
    --option-a  Description
    --help      Show this help

  Examples
    $ package-name hello
    processed hello
  `);
  process.exit(0);
}

const input = args[0];
console.log(doThing(input));
```

## Publishing Checklist

1. Update version in package.json
2. Update changelog if present
3. Run tests: `npm test`
4. Publish: `npm publish`
5. Create GitHub release

## Anti-Patterns to Avoid

| Anti-Pattern | Why Bad | Do Instead |
|--------------|---------|------------|
| Default exports | Less clear, refactoring issues | Named exports |
| CommonJS (require) | Legacy, no tree-shaking | ES Modules |
| Many dependencies | Attack surface, bloat | Zero deps when possible |
| Complex config | Hard to use | Smart defaults |
| Giant README | TL;DR | Concise with examples |
| No types | Poor DX | Always include .d.ts |

## Philosophy Summary

1. **One thing well**: Single-purpose packages
2. **Zero dependencies**: Minimize attack surface
3. **ES Modules first**: Modern JavaScript
4. **TypeScript definitions**: First-class type support
5. **Clear documentation**: README with examples
6. **Semantic versioning**: Strict semver
7. **Ship fast**: MVP first, iterate on feedback

## Detailed References

For deeper patterns, see:
- `references/module-organization.md` - ESM patterns and exports
- `references/testing-patterns.md` - Comprehensive testing approaches
- `references/resources.md` - Links to Sindre's repos and guides
