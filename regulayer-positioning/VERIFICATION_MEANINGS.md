# Verification Meanings

**Frozen Semantics for Verification States**

These definitions are authoritative. Future software versions cannot redefine them.

## VALID
**Meaning**: "The Record is Authentic and Unaltered."
- The cryptographic hash matches the payload.
- The signature is valid for the claimed key.
- The key was valid at the time of signing.

## INVALID
**Meaning**: "The Record is Corrupt, Forged, or Tampered."
- The hash does not match (Tampering).
- OR The signature is invalid (Forgery).
- OR The chain is broken (Deletion/Reordering).

## DEGRADED
**Meaning**: "The Record is Valid, but Context is Missing."
- Example: The Time Anchor cannot be reached, so the exact timestamp cannot be cross-verified, but the signature holds.

## REVOKED
**Meaning**: "The Record verifies mathematically, but the Signer is no longer trusted."
- Example: The key was leaked and added to a revocation list *after* the record was created.
