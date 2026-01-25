# Formal Assertions for Independent Reproduction

## Axioms
1. **Algorithm Independence**: Verification MUST depend only on standard algorithms (SHA-256, Ed25519), not vendor implementations.
2. **Context Completeness**: The Proof Bundle MUST contain all necessary data to reconstruct the signed message.

## Assertions

### 1. Hash Determinism
ASSERT that for any Record `R`:
`SHA256(Canonical(R.payload)) == R.payload_hash`

### 2. Structural Integrity
ASSERT that for any Record `R`:
`SHA256(Format(R.meta, R.payload_hash)) == R.record_hash`

### 3. Chain Continuity
ASSERT that for any sequential Records `R1, R2`:
`R2.previous_record_hash == R1.record_hash`

### 4. Authoritative Signature
ASSERT that:
`Ed25519_Verify(Key(R.key_id), R.signature, R.record_hash) == TRUE`

## Failure Conditions (If any hold, TRUST IS BROKEN)
- Any script using standard libraries fails to verify a "Valid" bundle.
- A bundle verifies successfully despite having a modified payload.
- A bundle verifies successfully despite having a broken chain link.
