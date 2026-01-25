# Comparison Guide

## Purpose

This document compares evidence architecture categories on technical grounds.
It makes no marketing claims—only factual technical distinctions.

---

## Comparison Scope

This comparison covers:
- Evidence integrity approaches
- Verification capabilities
- Architectural properties

This comparison does NOT cover:
- Specific vendor products
- Pricing or features
- Implementation quality

---

## Category Comparison

### Overview Matrix

| Property | Hash-Chain Evidence | Traditional Logging | Blockchain | Database Audit |
|----------|---------------------|---------------------|------------|----------------|
| Append-only | ✅ | ❌ | ✅ | ⚠️ |
| Tamper-evident | ✅ | ⚠️ | ✅ | ⚠️ |
| Offline verification | ✅ | ❌ | ⚠️ | ❌ |
| Vendor independence | ✅ | ❌ | ⚠️ | ❌ |
| Mutability | ❌ | ✅ | ❌ | ✅ |
| Governance overlay | ✅ | ✅ | ⚠️ | ✅ |
| Cryptographic attestation | ✅ | ❌ | ✅ | ⚠️ |
| Lightweight | ✅ | ✅ | ❌ | ✅ |
| No cryptocurrency | ✅ | ✅ | ❌ | ✅ |

### Legend

- ✅ Fully supported
- ⚠️ Partially supported or depends on implementation
- ❌ Not supported or not designed for this

---

## Detailed Comparison

### 1. Hash-Chain Evidence (This Standard)

**Architecture**: Records linked by cryptographic hashes, signed by attester.

| Property | Detail |
|----------|--------|
| Integrity | SHA-256 hash chain |
| Attestation | Digital signatures (Ed25519, etc.) |
| Verification | Offline, deterministic |
| Independence | Can verify without vendor |
| Storage | Centralized or distributed |
| Performance | High throughput |

**Best for**: Enterprise compliance, regulated industries, long-term evidence.

### 2. Traditional Logging

**Architecture**: Sequential log files, typically stored centrally.

| Property | Detail |
|----------|--------|
| Integrity | File system or database |
| Attestation | None or log signing |
| Verification | Requires log server access |
| Independence | Depends on log provider |
| Storage | Typically centralized |
| Performance | Very high throughput |

**Limitations**:
- Logs can be modified by administrators
- No cryptographic binding
- Vendor-dependent verification

**Best for**: Operational debugging, non-evidentiary purposes.

### 3. Public Blockchain

**Architecture**: Distributed consensus, public visibility.

| Property | Detail |
|----------|--------|
| Integrity | Consensus mechanism |
| Attestation | Network consensus |
| Verification | Requires node or light client |
| Independence | Highly independent |
| Storage | Distributed, replicated |
| Performance | Low throughput, high latency |

**Limitations**:
- Public visibility (privacy concerns)
- High cost per record
- Environmental concerns
- Slow confirmation times
- Cryptocurrency dependency

**Best for**: Public timestamping, cross-organization trust.

### 4. Database Audit Trails

**Architecture**: Database triggers, temporal tables.

| Property | Detail |
|----------|--------|
| Integrity | Database constraints |
| Attestation | None |
| Verification | Requires database access |
| Independence | Database-dependent |
| Storage | Database storage |
| Performance | High throughput |

**Limitations**:
- DBAs can modify history
- No cryptographic guarantees
- Vendor-specific formats

**Best for**: Application-level auditing, non-evidentiary trails.

---

## Property Deep Dives

### Append-Only Semantics

| Category | Implementation | Guarantee Level |
|----------|----------------|-----------------|
| Hash-Chain | Each record includes previous hash | Cryptographic |
| Traditional | File append, no linking | Policy-based |
| Blockchain | Block includes previous hash | Cryptographic + Consensus |
| Database | Insert-only tables | Policy-based |

### Tamper Detection

| Category | Method | Detection Confidence |
|----------|--------|---------------------|
| Hash-Chain | Hash verification | 100% (mathematical) |
| Traditional | Log analysis | Low (can be hidden) |
| Blockchain | Consensus disagreement | Very high |
| Database | Audit table comparison | Medium |

### Offline Verification

| Category | Capability | Requirements |
|----------|------------|--------------|
| Hash-Chain | Full verification | Proof bundle only |
| Traditional | None | Live server access |
| Blockchain | Light client possible | Network access or snapshot |
| Database | None | Database access |

### Vendor Independence

| Category | Can Switch Vendors? | Data Portability |
|----------|---------------------|------------------|
| Hash-Chain | Yes (open format) | Full |
| Traditional | Difficult | Varies |
| Blockchain | Chain-locked | On-chain only |
| Database | Difficult | Varies |

---

## Decision Framework

### When to Use Hash-Chain Evidence

- ✅ Regulatory compliance requirements
- ✅ Long-term evidence retention (10+ years)
- ✅ Need for offline verification
- ✅ Want vendor independence
- ✅ High-volume decision recording
- ✅ Privacy-sensitive data

### When to Use Traditional Logging

- ✅ Operational debugging
- ✅ Non-evidentiary purposes
- ✅ Maximum performance needed
- ✅ No regulatory requirements

### When to Use Blockchain

- ✅ Cross-organization trust (no shared vendor)
- ✅ Public timestamping
- ✅ Low volume, high value
- ✅ No privacy requirements

### When to Use Database Audit

- ✅ Application-internal tracking
- ✅ Non-regulatory purposes
- ✅ Integration with existing DB
- ✅ Mutable data is acceptable

---

## Summary

| If You Need... | Consider |
|----------------|----------|
| Court-ready evidence | Hash-Chain Evidence |
| High performance, no evidence needs | Traditional Logging |
| Cross-org trust, no central authority | Blockchain |
| Simple application auditing | Database Audit |

---

## Disclaimer

This comparison is based on architectural properties of categories,
not specific products. Individual implementations may vary.
