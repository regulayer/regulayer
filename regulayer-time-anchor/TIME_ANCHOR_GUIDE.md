# Time Anchor Guide

## Purpose

External, optional, non-authoritative time anchoring for evidence records.

> **Time anchors prove existence BY a date, not correctness.**

---

## Core Principle

Time anchoring is **evidence, not authority**.

- ✅ Verification remains purely mathematical
- ✅ Anchors are optional
- ✅ Missing anchors don't invalidate records
- ✅ Invalid anchors don't invalidate records
- ❌ Anchors never affect hash/signature/chain validity

---

## What Time Anchors Provide

### Independent Proof of Existence

A time anchor proves:
> "This record_hash existed at or before [timestamp]"

It does NOT prove:
- Record correctness
- Record accuracy
- Decision quality

### External Verification

Anchors come from external sources:
- Time-Stamp Authorities (RFC 3161)
- Transparency logs
- Public blockchains
- Legal notaries

Regulayer is not the source of time evidence.

---

## Supported Anchor Types

| Type | Trust Model | Latency | Court Admissibility |
|------|-------------|---------|---------------------|
| RFC 3161 TSA | External authority | Seconds | Strong |
| Transparency Log | Public auditability | Seconds | Moderate |
| Public Blockchain | Decentralized | Minutes-Hours | Moderate |
| Court Notary | Jurisdictional | Variable | Strongest |

### RFC 3161 (Recommended)

- Well-established standard
- Many trusted providers
- Fast response
- Strong legal precedent

### Transparency Log

- Public append-only log
- Cryptographic inclusion proofs
- Multiple independent operators

### Public Blockchain

- Bitcoin or Ethereum
- Highest immutability
- Slowest confirmation
- No central authority

### Court Notary

- Traditional notarization
- Jurisdiction-specific
- Human attestation
- Best for legal proceedings

---

## How Anchoring Works

```
1. Record is created
   ↓
2. record_hash is computed
   ↓
3. anchoring_hash = SHA-256(record_hash)
   ↓
4. Submit to anchor service
   ↓
5. Receive anchor response
   ↓
6. Attach to bundle (optional field)
```

---

## Evidence Bundle with Anchors

```json
{
  "decision": { ... },
  "attestation": { ... },
  "chain_position": { ... },
  "verification": { ... },
  "time_anchors": [
    {
      "anchor_type": "rfc3161",
      "anchor_reference": "tsa:timestamp.digicert.com:abc123",
      "anchor_timestamp": "2026-01-15T14:30:05Z",
      "anchoring_hash": "sha256:def456...",
      "verification_hint": "Verify with DigiCert TSA"
    }
  ]
}
```

---

## Verification Semantics

| Check | Result | Record Status |
|-------|--------|---------------|
| Hash valid | ✅ | Valid |
| Signature valid | ✅ | Valid |
| Chain valid | ✅ | Valid |
| **Anchor missing** | ⚠️ | **Still Valid** |
| **Anchor invalid** | ❌ (anchor only) | **Still Valid** |

**Time anchors NEVER invalidate records.**

---

## When to Use Time Anchors

### Use Cases

1. **Court proceedings** - External time evidence
2. **Long-term retention** - Proof across decades
3. **Insolvency scenarios** - Timeline proof beyond company existence
4. **Regulatory disputes** - Independent verification
5. **Cross-border evidence** - Jurisdiction-specific anchoring

### When NOT Needed

- Internal operations
- Short-term use cases
- When ordering alone is sufficient
- When Regulayer attestation is trusted

---

## Removal and Absence

### If Anchors Are Removed

- Record remains valid
- Proof bundle still verifies
- Only time corroboration is lost

### If Anchors Were Never Created

- Record remains valid
- Proof bundle still verifies
- Recorded_at timestamp still exists (internal)

---

## Multiple Anchors

Records can have multiple anchors:

```json
{
  "time_anchors": [
    {"anchor_type": "rfc3161", ...},
    {"anchor_type": "public_blockchain", ...},
    {"anchor_type": "notary", ...}
  ]
}
```

This provides:
- Redundancy
- Multiple trust models
- Jurisdiction coverage

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
