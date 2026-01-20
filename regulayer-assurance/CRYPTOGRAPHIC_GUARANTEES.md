# Cryptographic & Forensic Guarantees

**Version:** 1.0.0
**Status:** DRAFT

## 1. Introduction

This document specifies the exact cryptographic mechanisms used by Regulayer and the mathematically provable guarantees they provide. It avoids marketing language in favor of technical fact.

## 2. Cryptographic Primitives

Regulayer relies on a minimal set of industry-standard primitives. We do not implement custom cryptography.

| Primitive | Usage | Specification | Justification |
| :--- | :--- | :--- | :--- |
| **SHA-256** | Hashing | NIST FIPS 180-4 | Standard collision resistance (128-bit security). Ubiquitous support. |
| **Ed25519** | Digital Signatures | RFC 8032 | High performance, small keys (32 bytes), deterministic (no random nonce needed), resistant to side-channel attacks. |
| **Canonical JSON** | Serialization | RFC 8785 (JCS) | Ensures deterministic byte-for-byte representation of JSON data for hashing (e.g., key sorting, whitespace removal). |
| **UUID v4** | Identification | RFC 4122 | Probabilistic uniqueness for distributed ID generation ($2^{122}$ entropy space). |

## 3. Guarantees Provided

### 3.1. Integrity (Tamper Detection)
**Guarantee:** Any modification to a recorded event—whether payload, timestamp, or metadata—will invalidate the cryptographic hash of that record OR the hash link of the subsequent record.
- **Mechanism:** `Record[N].hash = SHA256(Canonical(Payload) + Metadata + Record[N-1].hash)`
- **Proof:** To modify Record $N$, an attacker must find a collision for $Hash(N)$ or modify all records $N...Head$.

### 3.2. Non-Repudiation (Attribution)
**Guarantee:** A valid signature on an event cryptographically proves that the holder of the private key authorized that specific payload.
- **Mechanism:** `Verify(PublicKey, Signature, Canonical(Payload))` MUST return `True`.
- **Constraint:** This requires the private key to remain secret (see Operational Assumptions).

### 3.3. Global Ordering (Causality)
**Guarantee:** Events are strictly ordered. It is mathematically impossible to insert an event between Record $N$ and Record $N+1$ without breaking the hash chain.
- **Mechanism:** Record $N+1$ explicitly includes `SHA256(Record[N])`.

### 3.4. Forensic Replay (Offline Verification)
**Guarantee:** Verification does not depend on the specific code version of the Regulayer Verifier.
- **Mechanism:** The `ExportBundle` contains all data needed to re-derive the hashes and verify signatures using standard tools (e.g., `openssl`, simple python scripts).
- **Independence:** An auditor does not need to trust the Regulayer UI; they can write their own verifier in <50 lines of code.

## 4. Revocation Semantics

Regulayer implements **Point-in-Time Revocation**.

### 4.1. The Check
When a signed event is received, the Recorder checks:
```python
if CheckSignature(Event) == VALID:
    if Identity.Status == REVOKED:
        Reject()
    else:
        Accept()
```

### 4.2. Historical Validity
**Guarantee:** Revocation is forward-looking.
- If Identity $A$ is revoked at time $T_{revocation}$.
- Events signed at $T < T_{revocation}$ remain **VALID** and Verified.
- Events signed at $T \ge T_{revocation}$ are **REJECTED**.

### 4.3. Key Compromise Handling
If a key is stolen, the generated signatures are mathematically valid but semantically fraudulent.
- **Control:** The compromise must be detected and the identity revoked.
- **Gap:** There is an unavoidable window of vulnerability between compromise and revocation.
- **Audit:** Any records signed during this window are valid *to the system* but may be flagged in a forensic report if the "Identity Status at Verification" check is performed.
