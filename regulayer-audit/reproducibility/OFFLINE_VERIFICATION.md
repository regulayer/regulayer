# Offline Verification

## Purpose

This document proves that Regulayer proofs can be verified without any network access.
Offline verification is the ultimate proof of trust independence.

---

## GUARANTEE: No Network Required

**Claim**: Proof verification requires zero network access to Regulayer or any other service.

**Proof**:
1. Verifier binary is self-contained
2. Proof bundle contains all required data
3. Public keys can be embedded or pre-distributed
4. No HTTP calls, no DNS lookups, no socket connections

---

## GUARANTEE: No Regulayer Trust

**Claim**: Verification does not require trusting Regulayer systems.

**Proof**:
1. Verification is mathematical (signature verification)
2. Anyone can implement a verifier
3. Regulayer's verifier source is open for inspection
4. Third-party implementations are possible

---

## Offline Verification Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PROOF BUNDLE                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │  Decision   │ │ Attestation │ │ Chain Position      ││
│  │   Record    │ │  Signature  │ │ Previous Hash       ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  OFFLINE VERIFIER                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │  Hash       │ │  Signature  │ │ Schema              ││
│  │  Check      │ │  Check      │ │ Validation          ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
│                          │                               │
│                    [Public Key]                          │
│                    (embedded or                          │
│                     pre-distributed)                     │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ VALID/INVALID │
                    └───────────────┘

NO NETWORK REQUIRED AT ANY STEP
```

---

## Verification Steps (Offline)

### Step 1: Schema Validation

```python
def verify_schema(bundle):
    # Load schema from embedded copy
    schema = load_embedded_schema("evidence_v1.0.0.json")
    
    # Validate bundle structure
    jsonschema.validate(bundle, schema)
    
    return True
```

### Step 2: Hash Verification

```python
def verify_hash(bundle):
    # Extract record and claimed hash
    record = bundle["decision"]
    claimed_hash = record["record_hash"]
    
    # Recompute hash
    canonical = canonicalize(record)
    computed_hash = f"sha256:{sha256(canonical).hexdigest()}"
    
    # Compare
    return claimed_hash == computed_hash
```

### Step 3: Signature Verification

```python
def verify_signature(bundle, public_key):
    attestation = bundle["attestation"]
    
    # Extract signature components
    signature = base64.b64decode(attestation["signature"])
    message = bundle["decision"]["record_hash"].encode()
    
    # Verify using appropriate algorithm
    if attestation["algorithm"] == "Ed25519":
        return ed25519.verify(public_key, message, signature)
```

### Step 4: Chain Verification (Optional)

```python
def verify_chain_position(bundle, previous_bundle=None):
    if previous_bundle is None:
        # Genesis record
        return bundle["chain_position"]["sequence_number"] == 1
    
    # Verify link
    expected_previous = previous_bundle["decision"]["record_hash"]
    actual_previous = bundle["chain_position"]["previous_hash"]
    
    return expected_previous == actual_previous
```

---

## Key Distribution

For offline verification, public keys must be available. Options:

### Option 1: Embedded in Verifier

```python
EMBEDDED_KEYS = {
    "regulayer-prod-2026": "base64-encoded-public-key...",
}
```

### Option 2: Bundled with Proof

```json
{
  "attestation": {
    "key_id": "regulayer-prod-2026",
    "public_key": "base64-encoded-public-key..."
  }
}
```

### Option 3: Pre-distributed

Keys published to:
- Certificate transparency logs
- Key registry (fetched once, cached)
- Enterprise key distribution

---

## Air-Gapped Verification

For maximum security (government, defense):

1. Download verifier on connected machine
2. Compute checksum of verifier
3. Transfer verifier via secure media
4. Transfer proof bundles via secure media
5. Run verification on air-gapped machine
6. No network required at any step

---

## Third-Party Verifiers

Regulayer's verifier is not required. Implementation requirements:

1. **Hash algorithm**: SHA-256
2. **Canonicalization**: RFC 8785 (JSON Canonicalization Scheme)
3. **Signature algorithms**: Ed25519, ECDSA-P256, RSA-PSS
4. **Schema**: Published JSON Schema

Anyone can build a compatible verifier.

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
