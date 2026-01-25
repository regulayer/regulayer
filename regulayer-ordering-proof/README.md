# Regulayer Ordering Proofs

**Formal Verification of Ordering Under Partial Failure**

This module provides an adversarial runner to prove that asynchrony, delays, and partial outages never permute history.

## Core Principle
> "Time may delay truth — it cannot rearrange it. Asynchrony is allowed. Reordering is not."

## Directory Structure
- `scenarios/`: Declarative YAML definitions for network conditions (delay, partition) and expected chains.
- `reports/`: Generated proof artifacts.
- `runner.py`: Orchestrator for sequence submission and timing injection.
- `assertions.py`: Strict ordering and monotonicity guards.
- `ordering_observer.py`: State verification tool.

## Usage

### Run a Proof
```bash
python runner.py async_delay
```

### Dry Run
```bash
python runner.py gateway_partition --dry-run
```

## Scenarios
1. **Async Delay**: Enforce A before B, even if B arrives first (via strict seq checks).
2. **Queue Restart**: Verify FIFO integrity during restart.
3. **Recorder Restart**: Verify atomicity of commits.
4. **Gateway Partition**: Verify buffering safety.
5. **Mixed Load**: Verify project isolation.

## Verdict
Every report concludes with:
"Asynchronous delivery and partial failures did not reorder cryptographic history."
