# Regulayer Independent Proof Verifier

Offline verification tool for Regulayer proof bundles.

## Installation

```bash
pip install -e .
```

## Usage

### Verify a single proof bundle

```bash
regulayer verify-proof bundle.json
```

### Verify with JSON output

```bash
regulayer verify-proof bundle.json --json
```

### Verify a chain of bundles

```bash
regulayer verify-chain ./proofs/ --strict
```

## Specifications

See `specs/` directory for:
- `PROOF_BUNDLE_SPEC.md` - JSON format definition
- `AUDITOR_WORKFLOW.md` - How auditors should use this tool
