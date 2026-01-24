# Regulayer Trust Registry

Public, immutable reference point for trust models, schemas, and audit documentation.

## Core Principle

**Claims are public. Proofs are private. Verification is universal.**

## Purpose

This registry lets third parties definitively answer:

> "This evidence claims to follow Regulayer Trust Model vX.Y — here is the canonical definition."

## What This Is

- ✅ A verifiable claims index
- ✅ A public reference point
- ✅ An immutable definition store

## What This Is NOT

- ❌ A blockchain
- ❌ A certificate authority
- ❌ A compliance certification

## Structure

```
regulayer-trust-registry/
├── registry/
│   ├── TRUST_MODELS.json       # Trust model definitions
│   ├── AUDIT_VERSIONS.json     # Audit documentation versions
│   ├── SCHEMA_VERSIONS.json    # Schema versions
│   └── DEPRECATION_POLICY.json # Lifecycle policy
├── integrity/
│   ├── registry_hash.txt       # SHA-256 of registry
│   ├── registry_signature.txt  # Ed25519 signature
│   └── signing_key_info.md     # Key documentation
├── api/
│   └── api.py                  # Read-only API
└── README.md
```

## Trust Models

Each trust model defines:

| Field | Description |
|-------|-------------|
| `trust_model_id` | Unique identifier (e.g., `regulayer-core-v1`) |
| `invariants` | Cryptographic guarantees |
| `capabilities` | What the model supports |
| `schemas` | Compatible schema versions |
| `status` | current, deprecated, sunset, archived |

Proof bundles reference a trust model:

```json
{
  "trust_model": "regulayer-core-v1",
  ...
}
```

## Public API

| Endpoint | Description |
|----------|-------------|
| `GET /v1/trust-models` | All trust models |
| `GET /v1/trust-models/{id}` | Specific trust model |
| `GET /v1/audits` | Audit documentation |
| `GET /v1/schemas` | Schema versions |
| `GET /v1/deprecation-policy` | Lifecycle policy |

**No authentication. No rate limits. No mutation.**

## Integrity Verification

The registry itself is:

1. **Hashed**: SHA-256 of combined registry files
2. **Signed**: Ed25519 signature over hash
3. **Versioned**: Each update increments version
4. **Publicly cacheable**: CDN-friendly

```bash
# Verify registry integrity
curl https://trust.regulayer.io/integrity/registry_hash.txt
curl https://trust.regulayer.io/integrity/registry_signature.txt
# Verify signature locally
```

## Deprecation Policy

| Stage | Recording | Verification | Documentation |
|-------|-----------|--------------|---------------|
| current | ✅ | ✅ | ✅ |
| deprecated | ✅ | ✅ | ✅ |
| sunset | ❌ | ✅ | ✅ |
| archived | ❌ | ✅ | ❌ |

**Key guarantee**: Proofs remain valid forever, regardless of deprecation status.

## Usage

### For Court Citations

> "This decision record was created under Regulayer Core Trust Model v1.0, 
> which guarantees hash chain immutability and cryptographic non-repudiation. 
> The canonical definition is published at trust.regulayer.io."

### For Academic References

> "We evaluate AI decision logging using the Regulayer Core Trust Model [1], 
> which defines seven cryptographic invariants including append-only chain 
> integrity and offline verifiability."

### For Regulator Briefings

> "The evidence presented conforms to a publicly documented trust model 
> with independently verifiable invariants. The model definitions are 
> published and signed to prevent silent changes."

## What This Unlocks

- Court citations
- Academic references
- Regulator briefings
- Public transparency
- Standards committee participation
- Enterprise trust validation
