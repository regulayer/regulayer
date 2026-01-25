# Attestation Standard

## Document Status

| Property | Value |
|----------|-------|
| Standard Version | 1.0.0 |
| Status | Stable |
| Last Updated | 2026-01-25 |
| Normative | Yes |

---

## Abstract

This document defines the requirements for cryptographic attestation of
decision records. It specifies supported algorithms, key management
requirements, and signature semantics.

---

## 1. Scope

This standard defines:
- Attestation structure
- Supported signature algorithms
- Key management requirements
- Revocation semantics

This standard does NOT define:
- Key generation procedures
- Key storage implementation
- Certificate authority operations

---

## 2. Normative References

| Reference | Description |
|-----------|-------------|
| RFC 8032 | Edwards-Curve Digital Signature Algorithm (Ed25519) |
| FIPS 186-4 | Digital Signature Standard (ECDSA) |
| RFC 8017 | RSA Cryptography Specifications (RSA-PSS) |
| RFC 4648 | Base64 Encoding |

---

## 3. Attestation Structure

### 3.1 Required Fields

| Field | Type | Description |
|-------|------|-------------|
| signature | string | Base64-encoded signature bytes |
| algorithm | string | Algorithm identifier |
| key_id | string | Unique key identifier |

### 3.2 Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| signed_at | datetime | Timestamp of signature creation |
| public_key | string | Base64-encoded public key (for self-contained bundles) |

---

## 4. Supported Algorithms

### 4.1 Algorithm Identifiers

| Identifier | Algorithm | Key Size | Status |
|------------|-----------|----------|--------|
| Ed25519 | Edwards-Curve DSA | 256-bit | RECOMMENDED |
| ECDSA-P256 | ECDSA over P-256 | 256-bit | SUPPORTED |
| RSA-PSS | RSA with PSS padding | 2048-bit minimum | SUPPORTED |

### 4.2 Ed25519 (RECOMMENDED)

Ed25519 is the RECOMMENDED algorithm for new implementations.

Properties:
- Deterministic signatures
- Fast verification
- Small key and signature sizes
- Defined in RFC 8032

### 4.3 ECDSA-P256 (SUPPORTED)

ECDSA over the NIST P-256 curve is SUPPORTED for compatibility.

Note: ECDSA signatures are non-deterministic unless RFC 6979 is used.

### 4.4 RSA-PSS (SUPPORTED)

RSA with PSS padding is SUPPORTED for legacy systems.

Requirements:
- Minimum 2048-bit keys
- SHA-256 hash function

---

## 5. Signature Semantics

### 5.1 Signed Message

The signature SHALL be computed over:

```
message = record_hash
```

Where `record_hash` is the UTF-8 encoded string of the SHA-256 hash.

### 5.2 Signature Meaning

A valid signature attests that:

1. The record existed at the signing time
2. The signer had access to the signing key
3. The record_hash was computed correctly

A valid signature does NOT attest:

- The correctness of the decision
- Compliance with any regulation
- The intent of the decision-maker

---

## 6. Key Management

### 6.1 Key Identifier

Each key SHALL have a unique `key_id` that:
- Is stable across the key's lifetime
- Does not reveal key material
- Can be used to retrieve the public key

### 6.2 Key Validity Period

Keys SHALL have defined validity periods:
- `valid_from`: When the key becomes valid
- `valid_until`: When the key expires

Signatures created outside the validity period SHALL be considered invalid.

### 6.3 Key Revocation

Keys MAY be revoked before their expiration.

Revocation properties:
- `revoked_at`: Timestamp of revocation
- `revocation_reason`: Reason for revocation

---

## 7. Revocation Semantics

### 7.1 Pre-Revocation Signatures

Signatures created BEFORE revocation remain valid.

Verification procedure:
1. Check signature validity
2. Check `recorded_at < revoked_at`
3. If both pass, signature is valid

### 7.2 Post-Revocation Signatures

Signatures with `recorded_at >= revoked_at` SHALL be rejected.

---

## 8. Verification Procedure

To verify an attestation:

1. Obtain the public key for `key_id`
2. Check key validity at `recorded_at`
3. Check key is not revoked (or revoked after `recorded_at`)
4. Decode signature from Base64
5. Verify signature over `record_hash`

The attestation is VALID if all checks pass.

---

## 9. Conformance

An implementation conforms to this standard if it:

1. Uses supported algorithms only
2. Computes signatures per Section 5
3. Respects key validity and revocation
4. Verifies per Section 8

---

## Appendix A: Example Attestation

```json
{
  "attestation": {
    "signature": "MEUCIQDKZokqnCjr...",
    "algorithm": "Ed25519",
    "key_id": "attestation-key-2026",
    "signed_at": "2026-01-15T14:30:00Z"
  }
}
```
