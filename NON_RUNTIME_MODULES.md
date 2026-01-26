# Non-Runtime Modules

**Architecture Invariants**

The following modules are for **Documentation, Reference, or Offline Tooling ONLY**.
They MUST NOT be imported by runtime services (`recorder`, `gateway`, `control-plane`).
Linking these into the runtime binary violates the minimal trusted base.

## Forbidden Imports
- `regulayer-standard`
- `regulayer-audit`
- `regulayer-reference` (Except for specific shared crypto utils if strictly necessary, but prefer `regulayer-common`)
- `regulayer-ecosystem`
- `regulayer-chaos`
- `regulayer-replay-proof`
- `regulayer-ordering-proof`
- `regulayer-consistency-proof`
- `regulayer-temporal-proof`
- `regulayer-institutional`
- `regulayer-dispute`
- `regulayer-positioning`
- `regulayer-misuse`
- `regulayer-citation`
- `regulayer-governance-model`
- `regulayer-representation`

## Enforcement
CI/CD pipelines should scan for imports of these package names in `app/` directories and fail the build.
