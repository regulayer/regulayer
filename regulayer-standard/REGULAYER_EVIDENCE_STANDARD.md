# Evidence Standard

## Document Status

| Property | Value |
|----------|-------|
| Standard Version | 1.0.0 |
| Status | Stable |
| Last Updated | 2026-01-25 |
| Normative | Yes |

---

## Abstract

This document defines the structure and semantics of verifiable decision
evidence. It describes what constitutes valid evidence, how evidence is
structured, and how it can be verified independently.

This standard is implementation-agnostic. Any system MAY implement it.

---

## 1. Scope

This standard defines:
- Evidence bundle structure
- Required and optional fields
- Verification requirements
- Export format

This standard does NOT define:
- Implementation details
- Specific cryptographic libraries
- Deployment architecture
- Vendor-specific features

---

## 2. Normative References

| Reference | Description |
|-----------|-------------|
| RFC 8785 | JSON Canonicalization Scheme |
| RFC 4648 | Base64 Encoding |
| RFC 8032 | Edwards-Curve Digital Signature Algorithm (Ed25519) |
| RFC 3339 | Date and Time on the Internet: Timestamps |

---

## 3. Terms and Definitions

### 3.1 Evidence Bundle

A self-contained data structure that encapsulates a decision record,
its cryptographic attestation, and metadata sufficient for independent
verification.

### 3.2 Decision Record

A data object representing an action, decision, or event that has been
recorded for later verification.

### 3.3 Attestation

A cryptographic signature binding a decision record to a specific time
and key holder.

### 3.4 Verification

The process of mathematically confirming that evidence has not been
tampered with and was created by the claimed party.

---

## 4. Evidence Bundle Structure

### 4.1 Overview

An evidence bundle SHALL contain the following components:

```
Evidence Bundle
├── Decision Record (REQUIRED)
├── Attestation (REQUIRED)
├── Chain Position (REQUIRED)
└── Verification Metadata (REQUIRED)
```

### 4.2 Decision Record

The decision record SHALL contain:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| decision_id | string | YES | Unique identifier |
| record_hash | string | YES | SHA-256 hash of canonical record |
| recorded_at | datetime | YES | RFC 3339 timestamp |
| [application fields] | any | NO | Application-specific data |

The `record_hash` SHALL be computed as follows:

1. Create a copy of the decision record WITHOUT the `record_hash` field
2. Canonicalize using RFC 8785
3. Compute SHA-256 hash
4. Encode as `sha256:<hex>`

### 4.3 Attestation

The attestation SHALL contain:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| signature | string | YES | Base64-encoded signature |
| algorithm | string | YES | Signature algorithm identifier |
| key_id | string | YES | Key identifier |

The signature SHALL be computed over the `record_hash` value.

### 4.4 Chain Position

The chain position SHALL contain:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sequence_number | integer | YES | Position in chain (≥1) |
| previous_hash | string | YES | Hash of previous record |

For the first record in a chain:
- sequence_number SHALL be 1
- previous_hash MAY be empty or a defined genesis value

### 4.5 Verification Metadata

The verification metadata SHALL contain:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| verifiable_offline | boolean | YES | Whether bundle is self-contained |

---

## 5. Verification Procedure

### 5.1 Hash Verification

To verify the record hash:

1. Extract the decision record
2. Remove the `record_hash` field
3. Canonicalize per RFC 8785
4. Compute SHA-256 hash
5. Compare with claimed `record_hash`

The verification PASSES if hashes match.

### 5.2 Signature Verification

To verify the attestation signature:

1. Obtain the public key for `key_id`
2. Decode the signature from Base64
3. Verify signature over `record_hash`

The verification PASSES if signature is valid.

### 5.3 Chain Verification

To verify chain integrity (multiple records):

1. For each record after the first:
   - Compute hash of previous record
   - Compare with current record's `previous_hash`

The verification PASSES if all links are valid.

---

## 6. Export Format

Evidence bundles SHALL be exported as JSON with:
- UTF-8 encoding
- No byte order mark
- Standard JSON syntax

---

## 7. Conformance

An implementation conforms to this standard if it:

1. Produces evidence bundles with all REQUIRED fields
2. Computes hashes according to Section 4.2
3. Enables verification per Section 5
4. Exports per Section 6

---

## Appendix A: Example Evidence Bundle

```json
{
  "schema_version": "1.0.0",
  "decision": {
    "decision_id": "dec_example",
    "record_hash": "sha256:abc123...",
    "recorded_at": "2026-01-15T14:30:00Z"
  },
  "attestation": {
    "signature": "base64...",
    "algorithm": "Ed25519",
    "key_id": "key-2026"
  },
  "chain_position": {
    "sequence_number": 42,
    "previous_hash": "sha256:def456..."
  },
  "verification": {
    "verifiable_offline": true
  }
}
```
