# Hash Chain Invariants

## Purpose

This document defines the formal invariants for Regulayer's hash chain.
Each invariant is written as a falsifiable claim that auditors can test.

## Format

Each invariant follows this structure:

```
INVARIANT: [Name]
CLAIM: [What must always be true]
VIOLATION: [What would happen if false]
TEST: [How to verify]
```

---

## INVARIANT: Chain Immutability

**CLAIM**: Once a record is added to the chain, its hash cannot be modified without detection.

**VIOLATION**: If this were false, a modified record would verify as valid, allowing evidence tampering.

**TEST**:
1. Record a decision, export proof bundle
2. Modify any byte in the record
3. Re-verify → MUST fail
4. Restore original → MUST pass

---

## INVARIANT: Chain Ordering

**CLAIM**: Records are strictly ordered. Record N always references the hash of Record N-1.

**VIOLATION**: If this were false, records could be reordered, backdated, or removed without detection.

**TEST**:
1. Export N consecutive records
2. Verify each record's `previous_hash` equals prior record's hash
3. Remove any record → chain verification MUST fail
4. Swap any two records → chain verification MUST fail

---

## INVARIANT: Chain Append-Only

**CLAIM**: New records can only be appended. No insertions, deletions, or modifications.

**VIOLATION**: If this were false, historical evidence could be manipulated.

**TEST**:
1. Record sequence [A, B, C]
2. Attempt to insert X between A and B → MUST fail
3. Attempt to delete B → chain verification MUST fail
4. Record D → D's previous_hash MUST equal C's hash

---

## INVARIANT: Hash Determinism

**CLAIM**: The same canonical input always produces the same hash.

**VIOLATION**: If this were false, verification would be non-reproducible and proofs unreliable.

**TEST**:
1. Compute hash of record R
2. Serialize R, deserialize R'
3. Compute hash of R'
4. Hashes MUST be identical
5. Repeat across different machines/environments

---

## INVARIANT: Canonicalization Stability

**CLAIM**: JSON canonicalization (RFC 8785) produces identical output regardless of input ordering.

**VIOLATION**: If this were false, semantically identical records would produce different hashes.

**TEST**:
1. Create record with fields in order [a, b, c]
2. Create identical record with fields in order [c, a, b]
3. Canonicalize both
4. Results MUST be byte-identical
5. Hashes MUST be identical

---

## INVARIANT: Previous Hash Binding

**CLAIM**: Each record cryptographically binds to its predecessor via `previous_hash`.

**VIOLATION**: If this were false, records could be orphaned or chains forked undetectably.

**TEST**:
1. Record A (genesis, previous_hash = null or genesis marker)
2. Record B (previous_hash = hash(A))
3. Verify B's previous_hash exactly matches computed hash of A
4. Modify A → B's chain verification MUST fail

---

## INVARIANT: Genesis Handling

**CLAIM**: The first record in a chain has a well-defined genesis marker.

**VIOLATION**: If this were false, chain origin would be ambiguous.

**TEST**:
1. Create new chain
2. First record has `sequence_number = 1`
3. First record has `previous_hash` = defined genesis value
4. Genesis marker is documented and consistent

---

## Verification Matrix

| Invariant | Offline Verifiable | Auditor Testable | Court Explainable |
|-----------|-------------------|------------------|-------------------|
| Immutability | ✅ | ✅ | ✅ |
| Ordering | ✅ | ✅ | ✅ |
| Append-Only | ✅ | ✅ | ✅ |
| Determinism | ✅ | ✅ | ✅ |
| Canonicalization | ✅ | ✅ | ✅ |
| Previous Hash | ✅ | ✅ | ✅ |
| Genesis | ✅ | ✅ | ✅ |

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
