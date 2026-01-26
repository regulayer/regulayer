# Trust Freeze Declaration

**Immutable Core Declaration**

To ensure long-term verifiability and institutional trust, the following components of the Regulayer Evidence Standard v1.0 are declared **IMMUTABLE** and **FROZEN**:

1.  **Proof Bundle Format (v1)**: The JSON schema defined in `PROOF_BUNDLE_SPEC.md` will not change. New fields may be added in v1.1, but v1.0 parsers MUST remain compatible.
2.  **Hash Algorithms**:
    - Payload Hash: `SHA-256`
    - Record Hash: `SHA-256`
    - Signature Scheme: `Ed25519`
3.  **Canonicalization**: `JCS` (RFC 8785) is the sole canonicalization method for v1.
4.  **Verification Logic**: The definition of a `VALID` chain (each link relates to `prev_hash`) is frozen.

Any change to these parameters constitutes a **Hard Fork** (v2.0) and requires a new governance epoch.
