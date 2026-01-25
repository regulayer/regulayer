# Regulayer Consistency Proofs

**Formal Verification of Cross-Service Consistency**

This module provides an adversarial runner to prove that all Regulayer interfaces (Gateway, Recorder, Verifier, Export, UI) observe a single, consistent cryptographic reality.

## Core Principle
> "There is exactly one history, and every interface agrees on it. No split-brain."

## Directory Structure
- `scenarios/`: Declarative YAML definitions for cross-service states.
- `reports/`: Generated proof artifacts.
- `runner.py`: Orchestrator for consistency checks.
- `assertions.py`: Invariant guards (Single Source of Truth).
- `observers/`: specific service state checkers.

## Usage

### Run a Proof
```bash
python runner.py gateway_accept_recorder_down
```

### Dry Run
```bash
python runner.py verifier_vs_export --dry-run
```

## Scenarios
1. **Gateway Accept/Recorder Down**: Ensure no "ghost" records visible if not persisted.
2. **Queue/Recorder Fail**: Ensure retries don't leak partial visibility.
3. **Verifier/Export**: Ensure verified records are always exportable.
4. **Offline/Online**: Ensure mathematical parity.
5. **UI/API**: Ensure UI doesn't hallucinate.

## Verdict
Every report concludes with:
"All Regulayer interfaces observed a single, consistent cryptographic history."
