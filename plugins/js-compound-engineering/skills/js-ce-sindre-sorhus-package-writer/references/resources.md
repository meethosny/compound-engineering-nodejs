# Sindre Sorhus Resources

## Primary Documentation

- **Pure ESM Package Guide**: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
  - Essential reading for modern Node.js package authoring
  - Covers ESM migration, TypeScript definitions, testing

## Top npm Packages by Downloads

### HTTP & Networking

| Package | Weekly Downloads | Description | Source |
|---------|-----------------|-------------|--------|
| **got** | 20M+ | Human-friendly HTTP requests | https://github.com/sindresorhus/got |
| **ky** | 5M+ | Tiny HTTP client for browsers | https://github.com/sindresorhus/ky |
| **p-limit** | 100M+ | Run promises with concurrency | https://github.com/sindresorhus/p-limit |

### File System & CLI

| Package | Weekly Downloads | Description | Source |
|---------|-----------------|-------------|--------|
| **execa** | 80M+ | Better child_process | https://github.com/sindresorhus/execa |
| **globby** | 50M+ | User-friendly globbing | https://github.com/sindresorhus/globby |
| **del** | 20M+ | Delete files and directories | https://github.com/sindresorhus/del |
| **ora** | 20M+ | Elegant terminal spinners | https://github.com/sindresorhus/ora |

### Types & Utilities

| Package | Weekly Downloads | Description | Source |
|---------|-----------------|-------------|--------|
| **type-fest** | 50M+ | Essential TypeScript types | https://github.com/sindresorhus/type-fest |
| **camelcase** | 100M+ | Convert to camelCase | https://github.com/sindresorhus/camelcase |
| **open** | 50M+ | Open URLs/files/executables | https://github.com/sindresorhus/open |

## Key Source Files to Study

### Entry Point Patterns
- https://github.com/sindresorhus/execa/blob/main/index.js
- https://github.com/sindresorhus/p-limit/blob/main/index.js
- https://github.com/sindresorhus/ora/blob/main/index.js

### TypeScript Definitions
- https://github.com/sindresorhus/p-limit/blob/main/index.d.ts
- https://github.com/sindresorhus/del/blob/main/index.d.ts
- https://github.com/sindresorhus/type-fest/tree/main/source

### Test Setups
- https://github.com/sindresorhus/execa/tree/main/test
- https://github.com/sindresorhus/p-limit/blob/main/test.js

## GitHub Profile

- **Profile**: https://github.com/sindresorhus
- **npm Profile**: https://www.npmjs.com/~sindresorhus
- **Website**: https://sindresorhus.com/

## Design Philosophy Summary

From studying 1000+ packages, Sindre's consistent principles:

1. **One thing well** - Each package does exactly one thing
2. **Zero dependencies when possible** - Minimize attack surface and bloat
3. **ES Modules only** - No CJS compatibility layer
4. **TypeScript definitions always** - First-class type support via `.d.ts`
5. **Node.js built-in test runner** - No external test frameworks
6. **Options objects** - Single config parameter with smart defaults
7. **Fail fast** - Validate input immediately with TypeError
8. **Clear README** - Install, usage example, API docs, related packages
9. **Semantic versioning** - Strict semver, breaking changes documented
10. **Minimal documentation** - Code is self-documenting, README is examples
