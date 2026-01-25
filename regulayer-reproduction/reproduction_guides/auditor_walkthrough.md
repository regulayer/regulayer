# Auditor Reproduction Guide

**Goal**: Independently verify a Regulayer Proof Bundle without trusting the Regulayer vendor or SDK.

## Prerequisites
- Python 3.10+ (Standard Library only)
- `cryptography` library (Standard PyPI, no vendor dependencies)
- A Proof Bundle JSON file
- The Public Key (PEM format)

## Step 1: Verify Payload Hash
The `canonical_payload_hash` in the proof is the SHA-256 of the sorted, minimized JSON payload.

1. Extract `canonical_payload`.
2. Serialize to JSON: `sort_keys=True`, `separators=(',', ':')`.
3. Compute SHA-256 hex digest.
4. **ASSERT**: Computed hash matches `canonical_payload_hash`.

## Step 2: Verify Record Hash
The `record_hash` is the SHA-256 of the concatenated metadata fields.

1. Construct string: `proof_version|record_timestamp|decision_id|previous_record_hash|canonical_payload_hash`.
2. Compute SHA-256 hex digest.
3. **ASSERT**: Computed hash matches `record_hash`.

## Step 3: Verify Signature
The `signature` proves the `record_hash` was signed by the Authoritative Key.

1. Load Public Key (Ed25519).
2. Decode `signature.value` (Base64).
3. Verify signature against `record_hash` bytes.
4. **ASSERT**: Signature is VALID.

## Conclusion
If all steps pass, the record is mathematically valid and authentic.
