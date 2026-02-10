# Regulayer SDK Trust Model

## Purpose

This document defines what the SDK does AND what it does NOT do.
Critical for security reviews and auditor conversations.

---

## What the SDK IS

| Description |
|-------------|
| A **transport layer** for decision data |
| A **convenience wrapper** for the API |
| A **structured capture tool** |
| A **developer experience** |

## What the SDK is NOT

| Description |
|-------------|
| A **cryptographic library** |
| A **proof generator** |
| A **signing authority** |
| A **source of truth** |

---

## Trust Statements

### SDK Does NOT Prove Truth

The SDK produces **claims**, not facts.

```
SDK → Gateway → Recorder → Hash Chain
     (claim)              (fact)
```

### SDK Does NOT Hash

Hashing happens server-side. Why?
- Consistent algorithm
- Auditable implementation
- No SDK version dependency

### SDK Does NOT Sign

Signing happens in isolated attestation service. Why?
- Key isolation (HSM)
- Audit trail
- No key exposure to developers

### SDK Compromise ≠ Proof Compromise

If an attacker compromises the SDK:
- They can submit false claims
- They CANNOT forge past proofs
- They CANNOT break the hash chain
- They CANNOT sign as Regulayer

### Offline Verification Does NOT Trust SDK

The verifier checks:
- Hash chain integrity
- Attestation signatures
- Canonical encoding

None of these rely on SDK behavior.

---

## SDK Guarantees

| Guarantee | How |
|-----------|-----|
| Explicit capture only | No automatic logging |
| Never crashes user code | All errors caught |
| No persistence | No local state |
| No network retries | User controls retry |
| No background threads | Synchronous only |

---

## Why This Matters

For auditors:
> "The SDK is a pen, not a judge. It captures what you write. The server timestamps, hashes, and signs."

For security reviews:
> "SDK compromise has limited blast radius. It cannot forge history."

For developers:
> "The SDK is boring on purpose. Trust lives in the server."

---

## Installation Verification

```bash
# Download and verify
pip download regulayer==1.0.0
sha256sum regulayer-1.0.0.whl
# Compare with registry.json
```

The checksum in `registry.json` is authoritative.
