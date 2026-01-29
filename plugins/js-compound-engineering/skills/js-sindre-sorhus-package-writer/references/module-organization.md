# ES Module Organization

Patterns for organizing modern ES Module packages following Sindre Sorhus's approach.

## Single Export Package

Most packages should do one thing. Single export is cleanest:

```javascript
// index.js
export function slugify(string, options = {}) {
  // Implementation
}
```

```typescript
// index.d.ts
export function slugify(string: string, options?: Options): string;
```

## Multiple Related Exports

When exports are closely related, use named exports:

```javascript
// index.js
export function parse(input) { /* ... */ }
export function stringify(object) { /* ... */ }
export function validate(input) { /* ... */ }
```

```typescript
// index.d.ts
export function parse(input: string): ParsedResult;
export function stringify(object: object): string;
export function validate(input: string): boolean;
```

## Subpath Exports

For packages with distinct features that users may want to import separately:

```json
{
  "exports": {
    ".": "./index.js",
    "./parse": "./parse.js",
    "./stringify": "./stringify.js"
  }
}
```

```javascript
// Usage
import { parse } from 'package-name/parse';
import { stringify } from 'package-name/stringify';
```

## Re-exporting Pattern

Keep implementation separate, export from index:

```
src/
├── index.js          # Re-exports only
├── parse.js          # Implementation
├── stringify.js      # Implementation
└── utils.js          # Internal only
```

```javascript
// index.js
export { parse } from './parse.js';
export { stringify } from './stringify.js';
// utils.js is NOT exported - internal use only
```

## Constants and Types

```javascript
// index.js
export const VERSION = '1.0.0';
export const DEFAULTS = Object.freeze({
  timeout: 5000,
  retries: 3
});
```

```typescript
// index.d.ts
export const VERSION: string;
export const DEFAULTS: {
  readonly timeout: number;
  readonly retries: number;
};
```

## Factory Pattern

When instances are needed:

```javascript
// index.js
export function createClient(options = {}) {
  const { baseUrl, timeout = 5000 } = options;
  
  if (!baseUrl) {
    throw new Error('baseUrl is required');
  }

  return {
    async get(path) {
      // Implementation
    },
    async post(path, data) {
      // Implementation
    }
  };
}
```

## Class Export (When Appropriate)

Classes when there's real state management:

```javascript
// index.js
export class Cache {
  #store = new Map();
  
  constructor(options = {}) {
    this.maxSize = options.maxSize ?? 100;
  }
  
  get(key) {
    return this.#store.get(key);
  }
  
  set(key, value) {
    if (this.#store.size >= this.maxSize) {
      const firstKey = this.#store.keys().next().value;
      this.#store.delete(firstKey);
    }
    this.#store.set(key, value);
  }
}
```

## Avoid Default Exports

```javascript
// ❌ Bad - default export
export default function doThing() {}

// ✅ Good - named export
export function doThing() {}
```

Reasons to avoid default exports:
- Harder to rename consistently
- No autocomplete at import site
- Mixed usage with named exports is confusing
- Tree-shaking is less effective
