# Sindre Sorhus Resources

Links to Sindre's repositories, guides, and articles.

## Sindre Sorhus

- **GitHub**: https://github.com/sindresorhus
- **npm**: https://www.npmjs.com/~sindresorhus
- **Website**: https://sindresorhus.com
- **Twitter/X**: https://twitter.com/sindresorhus

## Essential Reading

### ESM Migration
- **ESM Package Guide**: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
- **Pure ESM Package**: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

### Package Writing
- **Awesome Node.js**: https://github.com/sindresorhus/awesome-nodejs
- **Awesome npm**: https://github.com/sindresorhus/awesome-npm
- **np (Better npm publish)**: https://github.com/sindresorhus/np

## Exemplary Packages

Study these for patterns:

### Simple Utility
- **slugify**: https://github.com/sindresorhus/slugify
- **camelcase**: https://github.com/sindresorhus/camelcase
- **p-limit**: https://github.com/sindresorhus/p-limit

### Promise Utilities
- **p-map**: https://github.com/sindresorhus/p-map
- **p-retry**: https://github.com/sindresorhus/p-retry
- **p-queue**: https://github.com/sindresorhus/p-queue

### CLI Tools
- **np**: https://github.com/sindresorhus/np
- **trash-cli**: https://github.com/sindresorhus/trash-cli
- **fkill-cli**: https://github.com/sindresorhus/fkill-cli

### TypeScript
- **type-fest**: https://github.com/sindresorhus/type-fest
- **ts-extras**: https://github.com/sindresorhus/ts-extras

## Package Templates

### Minimal package.json

```json
{
  "name": "package-name",
  "version": "1.0.0",
  "description": "One thing well",
  "license": "MIT",
  "repository": "username/package-name",
  "type": "module",
  "exports": "./index.js",
  "types": "./index.d.ts",
  "engines": { "node": ">=18" },
  "scripts": { "test": "node --test" },
  "files": ["index.js", "index.d.ts"]
}
```

### .gitignore

```
node_modules
coverage
*.log
.DS_Store
```

### .npmignore

```
test.js
.github
.gitignore
```

## Publishing Tools

- **np**: https://github.com/sindresorhus/np - Better `npm publish`
- **semantic-release**: https://github.com/semantic-release/semantic-release - Automated versioning

## Style Guides

- **XO**: https://github.com/xojs/xo - Sindre's linting config
- **Prettier**: https://prettier.io - Code formatting

## Community

- **Node.js Package Maintenance WG**: https://github.com/nodejs/package-maintenance
- **OpenJS Foundation**: https://openjsf.org
