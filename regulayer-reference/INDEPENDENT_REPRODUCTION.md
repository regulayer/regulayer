# Independent Reproduction Guide

## Purpose

This document explains how to verify Regulayer proofs with ZERO trust in Regulayer.
It is intended for courts, regulators, auditors, and third parties.

---

## Core Guarantee

> **You do not need Regulayer to verify Regulayer proofs.**

Everything required for verification is:
- Included in the proof bundle
- Documented in open specifications
- Implementable by anyone

---

## Step 1: Obtain the Proof Bundle

A proof bundle is a JSON file containing:

```json
{
  "decision": { ... },      // The recorded decision
  "attestation": { ... },   // Cryptographic signature
  "chain_position": { ... }, // Position in append-only chain
  "verification": { ... }   // Verification metadata
}
```

You can obtain proof bundles from:
- Regulayer exports (via web UI or API)
- Customer-provided evidence packages
- Third-party archives

---

## Step 2: Verify the Hash

### Purpose
Confirm the decision content has not been modified.

### Procedure

1. Extract the `decision` object
2. Remove the `record_hash` field (this is what we're verifying)
3. Canonicalize the JSON (RFC 8785)
4. Compute SHA-256 hash
5. Compare with claimed `record_hash`

### Algorithm (Pseudocode)

```
function verify_hash(decision):
    claimed_hash = decision.record_hash
    decision_copy = copy(decision)
    delete decision_copy.record_hash
    
    canonical = canonicalize_json(decision_copy)  // RFC 8785
    computed_hash = "sha256:" + sha256(canonical).hex()
    
    return claimed_hash == computed_hash
```

### Canonicalization Rules (RFC 8785)

- Objects: keys sorted alphabetically
- No whitespace between tokens
- Strings: UTF-8 encoded with escapes
- Numbers: no trailing zeros

---

## Step 3: Verify the Signature

### Purpose
Confirm Regulayer attested this specific hash at this specific time.

### Procedure

1. Obtain the public key for `attestation.key_id`
2. Extract the `signature` (base64 encoded)
3. Verify signature over `decision.record_hash`

### Algorithm (Pseudocode)

```
function verify_signature(attestation, decision):
    public_key = lookup_public_key(attestation.key_id)
    message = decision.record_hash.encode("utf-8")
    signature = base64_decode(attestation.signature)
    
    if attestation.algorithm == "Ed25519":
        return ed25519_verify(public_key, message, signature)
    else:
        return error("Unsupported algorithm")
```

### Public Key Sources

1. Regulayer public key registry
2. Certificate transparency logs
3. Pre-distributed key files
4. Proof bundle itself (if embedded)

---

## Step 4: Verify Chain Position

### Purpose
Confirm this record is part of an append-only sequence.

### Procedure

1. Extract `chain_position.sequence_number`
2. Extract `chain_position.previous_hash`
3. If verifying multiple records, confirm chain links correctly

### Single Record

- Sequence number should be ≥ 1
- Genesis record (seq 1) has no previous hash

### Multiple Records

```
for i in range(1, len(records)):
    current = records[i]
    previous = records[i-1]
    
    assert current.chain_position.previous_hash == previous.decision.record_hash
    assert current.chain_position.sequence_number == previous.chain_position.sequence_number + 1
```

---

## Step 5: Evaluate Result

| Check | Result | Meaning |
|-------|--------|---------|
| Hash matches | ✓ | Content unchanged |
| Signature valid | ✓ | Regulayer attested |
| Chain links | ✓ | Ordering preserved |

All checks pass → **Evidence is cryptographically valid**

---

## Building Your Own Verifier

### Requirements

To build a compatible verifier, you need:

1. **JSON canonicalization** (RFC 8785)
2. **SHA-256 hashing**
3. **Ed25519 signature verification**

### Reference Implementations

We provide clean-room implementations in:

| Language | File |
|----------|------|
| Python | `python/reference_verifier.py` |
| Go | `go/verifier.go` |
| Rust | `rust/verifier.rs` |

These share NO code with Regulayer production systems.

### Libraries

| Language | Canonicalization | Hashing | Signatures |
|----------|------------------|---------|------------|
| Python | json (sorted_keys) | hashlib | pynacl |
| Go | encoding/json | crypto/sha256 | crypto/ed25519 |
| Rust | serde_json + BTreeMap | sha2 | ed25519-dalek |

---

## Court/Regulator Verification

### For Courts

1. Request proof bundles from both parties
2. Run verification using any reference verifier
3. Compare results independently
4. Document verification steps

### For Regulators

1. Obtain proof bundles via official channels
2. Verify using in-house or third-party tools
3. No NDA or vendor access required
4. All specifications are public

---

## Dispute Resolution

If parties disagree about proof validity:

1. Both parties provide proof bundles
2. Neutral third party runs verification
3. Verification is deterministic (same result every time)
4. Mathematical proof resolves dispute

---

## Offline Verification

Verification requires:
- The proof bundle (JSON file)
- Public key (embedded or pre-distributed)
- A verifier program

Verification does NOT require:
- Network access
- Regulayer systems
- Any external service

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
