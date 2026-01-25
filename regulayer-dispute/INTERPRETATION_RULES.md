# Interpretation Rules

**Immutable Meanings for Verification Outcomes**

To prevent reinterpretation attacks (e.g., claiming a "soft fail" is actually a pass), these definitions are frozen.

## 1. Verified (VALID)
**Definition**: The SHA-256 hash of the payload matches the record, the Ed25519 signature is valid for the claimed Authoritative Key, and the key was valid at the timestamp.
**Meaning**: "The record is authentic and unaltered."

## 2. Integrity Failure (INVALID)
**Definition**: The computed hash does not match the stored `record_hash`.
**Meaning**: "The record has been tampered with or corrupted. It is inadmissible."

## 3. Authenticity Failure (INVALID)
**Definition**: The signature is invalid, or the key was not authorized.
**Meaning**: "The record was not created by the claimed authority (Forgery)."

## 4. Revoked (VALID_WITH_CAVEATS)
**Definition**: The record is mathematically valid, but the signing key was later revoked due to compromise.
**Meaning**: "The record implies integrity, but the signer is no longer trusted."
