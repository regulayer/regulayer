# Crypto Agility Note

Version: 1.0.0  
Audience: Engineers, Security Teams, Architects

---

## Purpose

This document explains Regulayer's approach to cryptographic algorithm aging and future-proofing.

---

## The Problem

Cryptographic algorithms have finite lifespans:
- MD5: Deprecated (collision attacks)
- SHA-1: Deprecated (collision attacks)
- SHA-256: Currently secure, but may weaken
- Ed25519: Currently secure, quantum concerns

Evidence created today must remain verifiable decades later.

---

## The Solution: Layered Hashing

### Original Hash (Immutable)
```json
{
  "original_hash": "sha256:abc123...",
  "original_algorithm": "SHA-256"
}
```

The original hash is **NEVER modified**. It is the historical record.

### Secondary Hash (Layered)
```json
{
  "secondary_hash": "sha3-512:def456...",
  "secondary_algorithm": "SHA3-512",
  "computed_at": "2028-01-01T00:00:00Z"
}
```

Secondary hashes are **added alongside** original hashes.

---

## How It Works

1. Record created with SHA-256 hash (2026)
2. SHA-256 remains secure (2026-2035)
3. NIST recommends SHA3 (hypothetical 2035)
4. Secondary SHA3-512 hash computed (2035)
5. Original SHA-256 preserved for history
6. Verification uses SHA3-512 going forward

---

## Supported Algorithms

### Current (2026)
| Purpose | Algorithm | Status |
|---------|-----------|--------|
| Hashing | SHA-256 | NIST approved |
| Signing | Ed25519 | NIST approved |
| Secondary | SHA3-512 | NIST approved |

### Future-Ready
| Algorithm | Purpose | Notes |
|-----------|---------|-------|
| SHA3-256 | Hashing | Post-SHA2 standard |
| SHA3-512 | Hashing | Recommended for archival |
| BLAKE2b | Hashing | Fast, widely supported |
| BLAKE2s | Hashing | 32-bit optimized |

---

## When to Compute Secondary Hashes

### Proactive (Recommended)
- During archival bundle creation
- For high-value records
- As part of regular maintenance

### Reactive
- When algorithm deprecation announced
- When NIST issues guidance update
- When security concerns emerge

---

## Verification Modes

### Current Mode
```bash
regulayer-proof-verifier verify proof.json
```
Uses current algorithm recommendations.

### Archival Mode
```bash
regulayer-proof-verifier verify proof.json --archival
```
Uses snapshot crypto context.
Accepts deprecated algorithms if valid at creation.

### Secondary Hash Mode
```bash
regulayer-proof-verifier verify proof.json --use-secondary
```
Verifies using secondary hash instead of original.

---

## Quantum Readiness

### Current Status (2026)
- Ed25519 secure against classical computers
- Quantum threat timeline uncertain (10-20+ years)
- Post-quantum algorithms under standardization

### Future Path
- NIST post-quantum standardization (ongoing)
- Regulayer will add post-quantum signatures when standardized
- Existing signatures preserved (historical context)

---

## Implementation Notes

### Never Replace Originals
```python
# WRONG
record.hash = new_algo_hash(payload)

# RIGHT
record.secondary_hashes.append(SecondaryHash(
    original_hash=record.hash,
    secondary_hash=new_algo_hash(payload)
))
```

### Document Algorithm Context
```python
snapshot = CryptographicSnapshot(
    algorithms={"hash": "SHA-256", "signature": "Ed25519"},
    nist_recommendations_at_time="SP 800-57 (2026)"
)
```

---

## Summary

1. **Original hashes are immutable**
2. **Secondary hashes are layered**
3. **Snapshots preserve context**
4. **Verification adapts to time**

This ensures evidence created today remains verifiable indefinitely.

---

**END OF CRYPTO AGILITY NOTE**
