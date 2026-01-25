# Regulayer Reference Implementation

## Purpose

This module proves that Regulayer verification is reproducible by anyone.

> **"You don't need Regulayer to trust Regulayer."**

---

## Core Guarantee

If Regulayer disappears:
- ✅ Proofs still verify
- ✅ Verifiers still run
- ✅ Language still holds
- ✅ Claims remain true

---

## Contents

### Reference Verifiers

Clean-room implementations that share NO code with Regulayer production:

| Language | File | Dependencies |
|----------|------|--------------|
| Python | `python/reference_verifier.py` | pynacl |
| Go | `go/verifier.go` | stdlib only |
| Rust | `rust/verifier.rs` | ed25519-dalek, sha2 |

All verifiers:
- Implement the same specification
- Produce the same results
- Can be audited independently

### Golden Proof Corpus

Test cases for verification:

| Case | Expected Result |
|------|-----------------|
| `valid_chain/` | ✓ VALID |
| `tampered_hash/` | ✗ INVALID |
| `revoked_identity/` | ⚠ CONDITIONAL |
| `degraded_incident/` | ⚠ VALID_WITH_CAVEATS |
| `mixed_legacy_attested/` | ⚠ VALID_LEGACY |

### Documentation

| Document | Audience |
|----------|----------|
| `INDEPENDENT_REPRODUCTION.md` | Courts, regulators, auditors |
| `ASSERTION_TEMPLATES/` | Legal and regulatory proceedings |

### Assertion Templates

| Template | Use Case |
|----------|----------|
| `auditor_statement.md` | Independent audit reports |
| `regulator_observation.md` | Regulatory findings |
| `court_affidavit.md` | Sworn court statements |
| `expert_witness_note.md` | Expert testimony |

---

## Usage

### Verify a Proof Bundle

```bash
# Python
python python/reference_verifier.py bundle.json

# Go
go run go/verifier.go bundle.json

# Rust
cargo run --release -- bundle.json
```

### Run Golden Proof Tests

```bash
# Verify all test cases
for f in golden_proofs/*/proof_001.json; do
    python python/reference_verifier.py "$f"
done
```

---

## What This Proves

1. **Verification is deterministic** — Same proof → same result
2. **No vendor lock-in** — Any language can verify
3. **Offline works** — No network needed
4. **Courts can rely on it** — Independent reproduction possible

---

## Language Rules

All templates use safe language:

✅ Use: "Observed", "Verified", "Reproduced"
❌ Never: "Approved", "Certified", "Compliant"

---

## Version

| Field | Value |
|-------|-------|
| Specification Version | 1.0.0 |
| Last Updated | 2026-01-25 |
