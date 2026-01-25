# Emergency Powers

**Defining the Limits of Crisis Response**

## What constitutes an Emergency?
1.  **Cryptographic Break**: SHA-256 or Ed25519 is compromised globally.
2.  **Root Key Compromise**: The Regulayer Root Key is stolen.
3.  **Critical Vulnerability**: RCE in the Recorder node.

## Allowed Emergency Actions
- **Service Shutdown**: Turning off the SaaS API.
- **Key Rotation**: Issuing new Root Keys and revoking old ones (via CRL).
- **Incident Disclosure**: Publicly announcing the flaw.

## Forbidden Emergency Actions
- **Redefining Verification**: "We verified these 2 years ago, but now we say they allow X."
- **Invalidating Proofs**: "All proofs from 2025 are void." (We verify integrity; if the integrity holds, the proof holds, even if the system was buggy.)
- **Suppression**: Preventing users from exporting their own data.
