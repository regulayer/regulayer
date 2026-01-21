# Regulayer Archival Trust Model

Version: 1.0.0  
Status: NORMATIVE

---

## Purpose

This document defines what remains verifiable over time, what degrades gracefully, and what is explicitly not guaranteed.

No marketing language. Pure engineering.

---

## Core Principles

### 1. Past Truth Must Outlive Present Systems

Evidence created today must be verifiable in 2035, 2045, and beyond.

This is achieved through:
- Cryptographic snapshots at creation time
- Algorithm-agnostic verification paths
- Offline verification capability

### 2. Key Rotation Must Not Break History

When keys are rotated:
- Previous signatures remain valid
- Rotation is timestamped
- Historical keys are preserved

### 3. Algorithm Aging Must Be Addressable

When algorithms are deprecated:
- Original hashes are preserved
- Secondary hashes provide verification path
- Snapshot defines applicable standards

### 4. Verification Must Be Possible Offline Forever

All verification requires only:
- The proof bundle
- The archival bundle (snapshot + key history)
- Standard cryptographic libraries

No Regulayer infrastructure required.

---

## What Remains Verifiable Forever

| Artifact | Durability | Notes |
|----------|------------|-------|
| Record hash | ∞ | Immutable, never modified |
| Chain linkage | ∞ | Mathematical relationship |
| Signature (at-time) | ∞ | Valid per snapshot context |
| Canonical payload | ∞ | Original bytes preserved |

---

## What Degrades Gracefully

| Artifact | Degradation | Mitigation |
|----------|-------------|------------|
| Algorithm security | Crypto aging | Secondary hashes |
| Key validity | Rotation | Key rotation log |
| Infrastructure | Systems retire | Offline verification |
| Personnel | People leave | Documentation |

---

## What Is Explicitly NOT Guaranteed

⚠️ **Clear Boundaries**

1. **AI Correctness**: Not guaranteed. Recording doesn't imply correctness.
2. **Current Algorithm Security**: May deprecate; secondary hashes mitigate.
3. **Real-time Verification**: Archival verification may require offline tools.
4. **Legal Interpretation**: Technical proof ≠ legal compliance.
5. **Vendor Continuity**: Regulayer may not exist; verification continues.

---

## Archival Verification Mode

When verifying historical evidence:

```bash
regulayer-proof-verifier verify proof.json --archival
```

Behavior:
- Uses snapshot crypto context
- Ignores current crypto recommendations
- Accepts algorithms valid at creation time
- Uses historical key state

---

## Time Horizons

### Short Term (1-5 years)
- All algorithms remain secure
- Verification uses current mode
- No special handling required

### Medium Term (5-15 years)
- Monitor algorithm recommendations
- Compute secondary hashes for high-value records
- Test archival verification paths

### Long Term (15+ years)
- Use secondary hashes if primary deprecated
- Archival mode becomes standard
- Consider quantum-safe algorithms

---

## Algorithm Migration Path

If SHA-256 is deprecated (hypothetical 2040):

1. Original SHA-256 hashes preserved (never modified)
2. SHA3-512 secondary hashes become verification path
3. Archival mode uses snapshot to understand original context
4. Verification succeeds via secondary hash

---

## Cryptographic Library Requirements

For future verification, systems need:
- SHA-256 (for original hashes)
- SHA3-512 (for secondary hashes)
- Ed25519 (for signatures)
- JSON canonicalization (RFC 8785)

These are standard, widely-implemented algorithms.

---

**END OF ARCHIVAL TRUST MODEL**
