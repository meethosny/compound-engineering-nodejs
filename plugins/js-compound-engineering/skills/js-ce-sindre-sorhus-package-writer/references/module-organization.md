# Module Organization Patterns

## Simple Package Layout

```
package-name/
├── index.js          # Entry point, main API
├── index.d.ts        # TypeScript definitions
├── package.json      # Metadata
├── readme.md         # Documentation
├── license           # MIT
└── test.js           # Tests
```

## Complex Package Layout (execa/ky pattern)

```
package-name/
├── index.js          # Public API re-exports
├── index.d.ts        # TypeScript definitions
├── source/           # Internal modules
│   ├── core.js       # Core logic
│   ├── options.js    # Options normalization
│   ├── errors.js     # Custom error classes
│   └── utils.js      # Shared utilities
├── test/
│   ├── core.js
│   ├── options.js
│   └── errors.js
├── package.json
└── readme.md
```

## Functional Decomposition Pattern

Break large modules into focused files:

```javascript
// index.js - Public API
export {doThing} from './source/core.js';
export {doOtherThing} from './source/other.js';
export {PackageError} from './source/errors.js';

// source/core.js
import {validate} from './utils.js';

export function doThing(input, options = {}) {
  validate(input, options);
  // Implementation
}

// source/utils.js
export function validate(input, options) {
  if (typeof input !== 'string') {
    throw new TypeError(`Expected a string, got ${typeof input}`);
  }
}
```

## Exports Field Patterns

```json
{
  "exports": "./index.js"
}
```

For packages with multiple entry points:

```json
{
  "exports": {
    ".": "./index.js",
    "./browser": "./browser.js",
    "./utils": "./source/utils.js"
  }
}
```

## ESM Best Practices

Use explicit file extensions in imports:

```javascript
// CORRECT
import {helper} from './source/utils.js';

// WRONG - no extension
import {helper} from './source/utils';
```

Use `node:` protocol for built-in modules:

```javascript
// CORRECT
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

// AVOID
import {readFile} from 'fs/promises';
```

## TypeScript Definitions Organization

```typescript
// index.d.ts
export interface Options {
  /**
   * Description with JSDoc.
   * @default true
   */
  readonly optionA?: boolean;
}

export function doThing(input: string, options?: Options): string;
```

For complex packages, use separate `.d.ts` files:

```
├── index.d.ts        # Re-exports public types
├── source/
│   ├── core.d.ts
│   └── errors.d.ts
```

## Comments Style

Minimal, let the code speak:

```javascript
// Only for non-obvious logic
const timeout = options.timeout ?? (isCI ? 60_000 : 5000);
```
