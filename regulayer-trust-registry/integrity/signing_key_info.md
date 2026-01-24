# Signing Key Information

## Purpose

This document describes the key used to sign the Trust Registry.
Registry signatures prove the registry has not been tampered with.

## Current Signing Key

| Property | Value |
|----------|-------|
| Key ID | `trust-registry-signing-2026` |
| Algorithm | Ed25519 |
| Created | 2026-01-01 |
| Expires | 2028-01-01 |
| Status | Active |

## Public Key

```
-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEA[placeholder-for-real-public-key-when-generated]
-----END PUBLIC KEY-----
```

**Note**: The actual public key will be generated and published when the registry goes live.

## Key Distribution

The signing key is distributed via:

1. **This repository**: Committed to source control
2. **Trust Registry API**: Available at `/v1/signing-key`
3. **Certificate Transparency**: Logged to public CT logs
4. **Keybase**: Published to Regulayer's Keybase profile

## Verification Process

To verify the registry signature:

```bash
# 1. Fetch the registry
curl -o TRUST_MODELS.json https://trust.regulayer.io/v1/trust-models

# 2. Fetch the signature
curl -o registry_signature.txt https://trust.regulayer.io/integrity/signature

# 3. Fetch the public key
curl -o signing_key.pem https://trust.regulayer.io/integrity/public-key

# 4. Verify
openssl dgst -sha256 -verify signing_key.pem -signature registry_signature.txt TRUST_MODELS.json

# Expected output: Verified OK
```

## Key Rotation

| Event | Action |
|-------|--------|
| Annual rotation | New key generated, old key deprecated |
| Compromise | Immediate rotation, incident report published |
| Algorithm upgrade | New key with stronger algorithm |

## Previous Keys

| Key ID | Status | Deprecated | Reason |
|--------|--------|------------|--------|
| (none) | N/A | N/A | First key |

## Trust Assumptions

By verifying the registry signature, you trust that:

1. The registry content is authentic
2. The registry has not been modified
3. Regulayer (the key holder) published this registry

You do NOT need to trust:

- The CDN or hosting provider
- The network path
- Any intermediary

## Key Independence

The registry signing key is:

- **Separate** from attestation signing keys
- **Separate** from TLS/SSL keys
- **Solely** for registry integrity

Compromising this key does not affect proof validity.
