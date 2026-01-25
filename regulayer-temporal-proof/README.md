# Regulayer Temporal Proofs

**Formal Verification of Historical Consistency**

This module provides an adversarial runner to prove that proofs do not decay, trust does not expire, and vendors cannot rewrite history.

## Core Principle
> "Time does not erode trust. Historical proofs remained verifiable and consistent across time, upgrades, and incidents."

## Directory Structure
- `scenarios/`: Declarative YAML definitions for temporal situations (upgrades, key rotation).
- `snapshots/`: Sample "frozen" proof bundles used as inputs.
- `reports/`: Generated proof artifacts.
- `runner.py`: Orchestrator for verifying snapshots in different contexts.
- `assertions.py`: Invariant guards (Result Stability).
- `snapshot_loader.py`: Utility to load historical data.

## Usage

### Run a Proof
```bash
python runner.py version_upgrade
```

### Dry Run
```bash
python runner.py offline_years_later --dry-run
```

## Scenarios
1. **Version Upgrade**: v1 proof verifies in v2 runner.
2. **Key Rotation**: Rotated keys do not invalidate old signatures.
3. **Incident**: Post-creation incidents do not affect validity.
4. **Billing Freeze**: Verification works even if org is frozen.
5. **Offline**: Verification works 5 years later without internet.

## Verdict
Every report concludes with:
"Historical proofs remained verifiable and consistent across time, upgrades, and incidents."
