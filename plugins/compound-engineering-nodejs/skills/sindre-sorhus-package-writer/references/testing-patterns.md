# Testing Patterns

Testing patterns for npm packages using Node.js built-in test runner.

## Basic Test Structure

```javascript
// test.js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { doThing } from './index.js';

describe('doThing', () => {
  test('returns expected output', () => {
    assert.equal(doThing('input'), 'expected');
  });

  test('handles options', () => {
    assert.equal(
      doThing('input', { uppercase: true }),
      'EXPECTED'
    );
  });
});
```

## Running Tests

```bash
# Run all tests
node --test

# Run specific file
node --test test.js

# Watch mode
node --test --watch

# With coverage
node --test --experimental-test-coverage
```

## Testing Async Functions

```javascript
test('async operation', async () => {
  const result = await asyncDoThing('input');
  assert.equal(result, 'expected');
});

test('resolves with value', async () => {
  await assert.doesNotReject(async () => {
    await asyncDoThing('valid');
  });
});
```

## Testing Errors

```javascript
test('throws TypeError on invalid input', () => {
  assert.throws(
    () => doThing(123),
    {
      name: 'TypeError',
      message: /Expected string/
    }
  );
});

test('async rejection', async () => {
  await assert.rejects(
    async () => asyncDoThing('invalid'),
    {
      name: 'Error',
      message: 'Invalid input'
    }
  );
});
```

## Snapshot-like Testing

```javascript
test('complex output', () => {
  const result = transformData(complexInput);
  
  assert.deepEqual(result, {
    id: 1,
    name: 'expected',
    items: ['a', 'b', 'c']
  });
});
```

## Test Organization

```javascript
describe('publicAPI', () => {
  describe('parse', () => {
    test('basic parsing', () => { /* ... */ });
    test('with options', () => { /* ... */ });
  });

  describe('stringify', () => {
    test('basic stringify', () => { /* ... */ });
    test('with formatting', () => { /* ... */ });
  });
});
```

## Setup and Teardown

```javascript
import { before, after, beforeEach, afterEach } from 'node:test';

describe('with setup', () => {
  let tempDir;

  before(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'));
  });

  after(async () => {
    await fs.rm(tempDir, { recursive: true });
  });

  test('uses temp directory', async () => {
    // Test using tempDir
  });
});
```

## Mocking (Node.js 20+)

```javascript
import { mock } from 'node:test';

test('with mock', () => {
  const fn = mock.fn((x) => x * 2);
  
  const result = fn(5);
  
  assert.equal(result, 10);
  assert.equal(fn.mock.calls.length, 1);
  assert.deepEqual(fn.mock.calls[0].arguments, [5]);
});
```

## Package.json Scripts

```json
{
  "scripts": {
    "test": "node --test",
    "test:watch": "node --test --watch",
    "test:coverage": "node --test --experimental-test-coverage"
  }
}
```

## CI Configuration (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm install
      - run: npm test
```

## Alternative: Vitest

For more features (watch mode, UI, better DX):

```javascript
// vitest.config.js
export default {
  test: {
    globals: false
  }
};
```

```javascript
// test.js
import { test, expect } from 'vitest';
import { doThing } from './index.js';

test('basic usage', () => {
  expect(doThing('input')).toBe('expected');
});
```
