# Attestation Invariants

## Purpose

This document defines the formal invariants for Regulayer's attestation system.
Attestations are the cryptographic signatures that prove who recorded what and when.

---

## INVARIANT: Signature Validity

**CLAIM**: Every attestation contains a valid cryptographic signature over the record hash.

**VIOLATION**: If this were false, unsigned or incorrectly signed records could pass verification.

**TEST**:
1. Export proof bundle with attestation
2. Extract signature and record hash
3. Verify signature using public key
4. Verification MUST pass
5. Modify signature by 1 bit → verification MUST fail

---

## INVARIANT: Signature Coverage

**CLAIM**: The signature covers the complete record hash, not a subset.

**VIOLATION**: If this were false, parts of the record could be modified without detection.

**TEST**:
1. Examine signed message construction
2. Confirm signed_message = record_hash
3. Confirm record_hash = hash(canonical_record)
4. Modify any field in record → hash changes → signature invalid

---

## INVARIANT: Key Binding

**CLAIM**: Each signature is bound to a specific, identifiable key.

**VIOLATION**: If this were false, signatures could be attributed to wrong keys.

**TEST**:
1. Export attestation with key_id
2. Retrieve public key for key_id
3. Verify signature with retrieved key → MUST pass
4. Verify with different key → MUST fail

---

## INVARIANT: Timestamp Inclusion

**CLAIM**: The recording timestamp is included in the signed data.

**VIOLATION**: If this were false, records could be backdated.

**TEST**:
1. Record decision at time T1
2. Verify timestamp T1 is in signed record
3. Attempt to present record with timestamp T2 → verification MUST fail
4. Signature validates T1 is the authentic recording time

---

## INVARIANT: Algorithm Correctness

**CLAIM**: Only approved cryptographic algorithms are used.

**VIOLATION**: If this were false, weak algorithms could compromise security.

**TEST**:
1. Enumerate all attestations
2. Verify algorithm ∈ {Ed25519, ECDSA-P256, RSA-PSS}
3. Verify key sizes meet minimum requirements
4. Reject unknown or weak algorithms

---

## INVARIANT: Single Signer

**CLAIM**: Each record has exactly one attestation from the recorder.

**VIOLATION**: If this were false, records could have ambiguous or conflicting attestations.

**TEST**:
1. Each record has exactly one attestation
2. Attestation identifies one signer
3. No multi-sig requirements (simplicity guarantee)

---

## INVARIANT: Attestation Persistence

**CLAIM**: Attestations are stored alongside records and cannot be removed.

**VIOLATION**: If this were false, records could lose their proof of authenticity.

**TEST**:
1. Record decision
2. Export proof bundle
3. Verify attestation is present
4. Re-export at later time → attestation identical

---

## Verification Matrix

| Invariant | Offline Verifiable | Mathematically Provable |
|-----------|-------------------|------------------------|
| Signature Validity | ✅ | ✅ |
| Signature Coverage | ✅ | ✅ |
| Key Binding | ✅ | ✅ |
| Timestamp Inclusion | ✅ | ✅ |
| Algorithm Correctness | ✅ | ✅ |
| Single Signer | ✅ | ✅ |
| Persistence | ✅ | ✅ |

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
