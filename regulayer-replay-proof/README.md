# Regulayer Replay Proofs

**Formal Verification of Idempotency & Temporal Safety**

This module provides an adversarial runner to prove that duplicates, replays, and ordering violations never corrupt the ledger.

## Core Principle
> "Failure is allowed. Duplication is not. You cannot accidentally create truth twice."

## Directory Structure
- `scenarios/`: Declarative YAML definitions for replay attacks.
- `reports/`: Generated proof artifacts.
- `runner.py`: Orchestrator for submission and verification.
- `assertions.py`: Strict idempotency guards.
- `recorder_observer.py`: State verification tool.

## Usage

### Run a Proof
```bash
python runner.py exact_duplicate
```

### Dry Run
```bash
python runner.py retry_storm --dry-run
```

## Scenarios
1. **Exact Duplicate**: Submit same ID twice. Expect HTTP 409.
2. **Delayed Replay**: Submit same ID after delay. Expect HTTP 409.
3. **Retry Storm**: 50 concurrent requests. Expect exactly 1 accept.
4. **Out-of-Order**: Submit seq N then N+2. Expect HTTP 409.
5. **Cross-Project**: Verify project isolation.

## Verdict
Every report concludes with:
"Replay attempts did not create additional facts."
