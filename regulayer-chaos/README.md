# Regulayer Chaos Harness

**Trust-Safe Failure Injection Framework**

This module provides a controlled environment to intentionally break system availability while verifying that cryptographic truth remains uncorrupted.

## Core Principle
> "We intentionally break the system to prove that nothing untrue can ever be recorded."

## Directory Structure
- `scenarios/`: Declarative YAML definitions of failures.
- `reports/`: Generated artifacts from chaos runs.
- `harness.py`: Main orchestration script.
- `assertions.py`: Strict cryptographic invariants.
- `evidence_capture.py`: Safe state snapshotting tools.

## Usage

### Run a Scenario
```bash
python harness.py gateway_kill
```

### Dry Run (Verify Harness)
```bash
python harness.py gateway_kill --dry-run
```

## Scenarios
1. **Gateway Kill**: Verify no partial records when ingest halts.
2. **Queue Partition**: Verify strict ordering is preserved during split.
3. **Recorder Crash**: Verify atomicity of writes.
4. **Duplicate Replay**: Verify idempotency (HTTP 409).
5. **Out-of-Order**: Verify sequence enforcement (HTTP 409).
6. **Full Outage**: Verify offline verification capabilities.

## Output
Every run generates a folder in `reports/<scenario_id>_<timestamp>/` containing:
- `chaos_report.md`: Detailed verdict and timeline.
- `baseline_snapshot.json`: System state before failure.
- `post_failure_snapshot.json`: System state after recovery.

## Critical Rules
1. **No Crypto Parsing**: The harness respects cryptography as a black box.
2. **No Auto-Repair**: The harness observes; it does not fix.
3. **Verification First**: Determine PASS/FAIL solely on cryptographic invariants.
