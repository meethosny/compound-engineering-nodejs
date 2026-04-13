# Changelog

All notable changes to the compound-c4-architecture plugin are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-01

### Added

- **Initial release** - Extracted from compound-engineering plugin v3.5.1
- **4 C4 agents** for architecture documentation:
  - `c4-context` - System context with personas and user journeys
  - `c4-container` - Container-level deployment architecture with OpenAPI specs
  - `c4-component` - Component boundaries and interface definitions
  - `c4-code` - Code-level documentation (functions, classes, modules)
- **`/doc:c4` command** - Generate full C4 architecture documentation
  - Bottom-up analysis from code to context
  - Mermaid diagram generation
  - OpenAPI specification generation for container APIs
