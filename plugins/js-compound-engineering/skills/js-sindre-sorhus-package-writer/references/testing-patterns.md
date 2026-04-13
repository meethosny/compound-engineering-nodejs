# Testing Patterns

## Node.js Built-in Test Runner

Sindre and modern Node.js packages use `node:test` -- no external test runner needed.

```javascript
// test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {doThing} from './index.js';

test('basic functionality', () => {
  assert.equal(doThing('hello'), 'processed hello');
});

test('with options', () => {
  assert.equal(
    doThing('hello', {uppercase: true}),
    'PROCESSED HELLO',
  );
});

test('throws on invalid input', () => {
  assert.throws(
    () => doThing(123),
    {name: 'TypeError', message: /Expected a string/},
  );
});

test('async operation', async () => {
  const result = await doAsyncThing('hello');
  assert.equal(result, 'processed hello');
});
```

## Test File Structure

```
test/
├── core.js           # Core functionality tests
├── options.js        # Options handling tests
├── errors.js         # Error case tests
└── fixtures/         # Test data
    ├── valid.json
    └── invalid.json
```

Or for simple packages, a single `test.js` at the root.

## Multi-Version Testing with GitHub Actions

```yaml
# .github/workflows/main.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      fail-fast: false
      matrix:
        node-version:
          - 18
          - 20
          - 22

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - run: npm install

      - run: npm test
```

## Package.json Test Script

```json
{
  "scripts": {
    "test": "node --test",
    "test:watch": "node --test --watch"
  }
}
```

## Assertion Patterns

```javascript
import assert from 'node:assert/strict';

// Equality
assert.equal(actual, expected);
assert.deepEqual(actualObject, expectedObject);

// Truthiness
assert.ok(value);

// Throws
assert.throws(() => badCode(), {name: 'TypeError'});
await assert.rejects(async () => badAsyncCode(), {name: 'Error'});

// Negation
assert.notEqual(actual, unexpected);
assert.notDeepEqual(actualObject, unexpectedObject);
```

## Test Helpers

```javascript
// test/helpers.js
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

export async function createTempDir() {
  return mkdtemp(join(tmpdir(), 'test-'));
}

export async function cleanTempDir(dir) {
  await rm(dir, {recursive: true, force: true});
}
```

## Testing with Environment Variables

```javascript
test('reads from environment', () => {
  const original = process.env.MY_VAR;
  process.env.MY_VAR = 'test-value';

  try {
    const result = doThing();
    assert.equal(result, 'test-value');
  } finally {
    if (original === undefined) {
      delete process.env.MY_VAR;
    } else {
      process.env.MY_VAR = original;
    }
  }
});
```

## Type Checking in CI

```yaml
# Add to CI workflow
- run: npx tsd
```

```json
{
  "devDependencies": {
    "tsd": "^0.31.0"
  }
}
```

```typescript
// index.test-d.ts
import {expectType, expectError} from 'tsd';
import {doThing} from './index.js';

expectType<string>(doThing('hello'));
expectError(doThing(123));
```
