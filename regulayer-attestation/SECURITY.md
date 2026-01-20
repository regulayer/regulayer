# Security Policy - Regulayer Attestation (Phase 2.1)

## 🔐 Security Requirements

1. **Private Keys**
   - Must NEVER leave the SDK environment.
   - Must be generated and stored securely.
   - Are never logged or exported.

2. **Public Keys**
   - Stored immutably in the Identity Registry.
   - Used for offline verification.

3. **Signature Verification**
   - Must be performed in constant-time to prevent timing attacks.
   - Must reject any payload that does not match the canonical format.

4. **Revocation**
   - Revoked identities are permanently marked.
   - Old records signed *before* revocation remain valid but flagged.
   - New records signed *after* revocation are strictly rejected.

5. **Chain of Trust**
   - The Hash Chain (Phase 1) remains the root of integrity.
   - Attestation (Phase 2) adds the layer of responsibility.
