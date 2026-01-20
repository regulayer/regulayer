# Regulayer Proof Bundle Specification

**Version:** 1.0.0
**Status:** DRAFT

## 1. Introduction

This document defines the strict JSON format for **Regulayer Proof Bundles**. A proof bundle is a self-contained, portable artifact that allows any third party to verify the integrity and authorship of a decision record without access to the Regulayer database or API.

## 2. JSON Structure

A valid proof bundle MUST be a valid JSON object adhering to the following schema.

```json
{
  "proof_bundle_version": "1.0.0",
  "record_id": 12345,
  "chain_id": "uuid-v4-string",
  "record_hash": "sha256-hex-digest",
  "previous_record_hash": "sha256-hex-digest-or-null",
  "canonical_event": {
    "decision_id": "uuid-v4-string",
    "timestamp": "iso-8601-string",
    "system": "string",
    "event_type": "string",
    "payload": { ... }
  },
  "attestation": {
    "identity_id": "uuid-v4-of-signer",
    "public_key": "base64-encoded-ed25519-public-key",
    "algorithm": "Ed25519",
    "signed_at": "iso-8601-string",
    "signature": "base64-encoded-signature-of-canonical-event"
  },
  "metadata": {
    "exported_at": "iso-8601-string",
    "verification_status_at_export": "VALID"
  }
}
```

## 3. Mandatory Fields

| Field | Type | Description | Strictness |
| :--- | :--- | :--- | :--- |
| `proof_bundle_version` | String | Must satisfy `^1\.0\.0$`. | Verifier MUST reject unknown versions. |
| `record_id` | Integer | The monotonic sequence number of the record. | Used for chain ordering. |
| `record_hash` | String | SHA-256 hash of the *Canonicalized* Event. | Must match re-computation. |
| `attestation` | Object | Cryptographic proof of authorship. | Required for attested events. Nullable for legacy. |
| `attestation.public_key` | String | Base64-encoded Ed25519 public key. | Verifier MUST use this key. NO external lookup. |

## 4. Canonicalization (RFC 8785)

To verify `record_hash` and `signature`, the verifier MUST:

1.  Extract the `canonical_event` object.
2.  De-canonicalize it (parse JSON).
3.  Re-canonicalize it using **JCS (RFC 8785)**.
    *   Sort keys lexicographically.
    *   Remove insignficant whitespace.
    *   Normalize numbers (e.g., `1.0` -> `1`).
4.  Assert that `Canonical(Parsed(canonical_event))` is byte-identical to the input source bytes for that section.
    *   *Rationale*: This protects against JSON parser differentials (e.g. distinct keys, duplicate keys, float representation).

## 5. Verification Algorithm

1.  **Version Check**: `proof_bundle_version` == "1.0.0"?
2.  **Canonicalization**: `bytes = JCS(canonical_event)`
3.  **Hash Check**: `SHA256(bytes).hexdigest() == record_hash`?
4.  **Signature Check** (if attestation exists):
    *   Key: `DecodeBase64(attestation.public_key)`
    *   Sig: `DecodeBase64(attestation.signature)`
    *   Data: `bytes` (from step 2)
    *   Algo: `Ed25519_Verify(Key, Sig, Data)` -> True?

## 6. Chain Verification Rules

For a sequence of bundles `B[0]...B[N]`:
1.  Sort by `B[i].record_id`.
2.  Assert `B[i].record_id == B[i-1].record_id + 1` (No Gaps).
3.  Assert `B[i].previous_record_hash == B[i-1].record_hash` (Hash Link).
4.  Assert all individual bundles pass Verification Algorithm.
