# Audit Scope Definition

## Purpose

This document defines the exact scope of cryptographic audit for the Regulayer platform.
It establishes clear boundaries to protect both auditors and Regulayer legally.

## Core Principle

**Audits observe. They never participate.**

Auditors:
- ❌ Do not sign
- ❌ Do not run production code
- ❌ Do not deploy fixes
- ❌ Do not certify compliance

Auditors:
- ✅ Verify invariants
- ✅ Publish findings
- ✅ Document limitations

---

## IN SCOPE

### 1. Hash Chaining Logic

| Component | Description |
|-----------|-------------|
| Canonicalization | JSON canonicalization (RFC 8785) implementation |
| Hash computation | SHA-256 computation over canonical form |
| Chain linking | Previous hash inclusion in each record |
| Determinism | Same input → same hash, always |

### 2. Attestation Enforcement

| Component | Description |
|-----------|-------------|
| Signature creation | Ed25519/ECDSA signing of record hash |
| Key binding | Signature tied to registered key |
| Timestamp binding | Signature covers recording timestamp |
| Non-repudiation | Signature cannot be disavowed |

### 3. Offline Verifier

| Component | Description |
|-----------|-------------|
| Correctness | Verifier accepts valid proofs |
| Soundness | Verifier rejects invalid proofs |
| Independence | No network access required |
| Determinism | Same bundle → same result |

### 4. Evidence Export

| Component | Description |
|-----------|-------------|
| Completeness | All required fields included |
| Determinism | Same record → same export |
| Self-containment | No external dependencies |
| Schema conformance | Matches published schema |

### 5. Key Management

| Component | Description |
|-----------|-------------|
| Key generation | Cryptographically secure RNG |
| Key storage | Protection at rest |
| Key rotation | Validity periods enforced |
| Key revocation | Revoked keys cannot sign |

### 6. Revocation Semantics

| Component | Description |
|-----------|-------------|
| Revocation enforcement | Revoked keys rejected |
| Attestation preservation | Pre-revocation signatures valid |
| Time binding | Revocation timestamp respected |

---

## Audit Questions

For each in-scope component, auditors should answer:

1. **Correctness**: Does it do what it claims?
2. **Soundness**: Can it be bypassed?
3. **Determinism**: Is it reproducible?
4. **Independence**: Does it require trust in Regulayer?

---

## Audit Artifacts Required

Auditors will be provided:

1. Source code for recorder and verifier
2. Test vectors with expected outputs
3. Sample proof bundles
4. Key material (test keys only)
5. Schema definitions

Auditors will NOT be provided:

- Production keys
- Production databases
- Customer data
- Operational secrets

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
| Status | Frozen |
