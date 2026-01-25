# Golden Proof Corpus

## Purpose

This corpus provides test cases for verification implementations.
Each case includes expected results and legal interpretation notes.

## Test Cases

| Directory | Description | Expected Result |
|-----------|-------------|-----------------|
| `valid_chain/` | Valid proof bundles | ✓ VALID |
| `tampered_hash/` | Hash mismatch | ✗ INVALID |
| `revoked_identity/` | Key revoked after signing | ⚠ CONDITIONAL |
| `degraded_incident/` | Recorded during incident | ⚠ VALID_WITH_CAVEATS |
| `mixed_legacy_attested/` | Pre-attestation records | ⚠ VALID_LEGACY |

## Usage

### Python
```bash
python reference_verifier.py golden_proofs/valid_chain/proof_001.json
```

### Go
```bash
go run verifier.go golden_proofs/tampered_hash/proof_001.json
```

### Rust
```bash
cargo run -- golden_proofs/revoked_identity/proof_001.json
```

## Verification Matrix

| Case | Hash Check | Signature Check | Chain Check |
|------|------------|-----------------|-------------|
| valid_chain | ✓ Pass | ✓ Pass | ✓ Pass |
| tampered_hash | ✗ Fail | N/A | ✓ Pass |
| revoked_identity | ✓ Pass | ⚠ Check time | ✓ Pass |
| degraded_incident | ✓ Pass | ✓ Pass | ✓ Pass |
| mixed_legacy_attested | ✓ Pass | N/A (legacy) | ✓ Pass |

## Legal Notes

Each proof includes a `notes.legal` field explaining the legal interpretation.

For court proceedings:
- VALID: Full cryptographic proof
- INVALID: Tampering detected
- CONDITIONAL: Valid for specific time period
- VALID_WITH_CAVEATS: Valid with known limitations
- VALID_LEGACY: Reduced guarantees (pre-attestation)
