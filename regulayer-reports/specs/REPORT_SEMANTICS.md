# Regulayer Report Semantics Specification

Version: 1.0.0  
Status: NORMATIVE

---

## Purpose

This document defines the semantic meaning of Regulayer trust reports.
It establishes what reports prove, what they don't prove, and how they should be interpreted.

---

## Core Principle

> **Reports do not create trust. Reports only present already-proven trust.**

Reports are static snapshots. They contain no verification logic, no signing capability, and no modification capability.

---

## Report Types

### 1. System Trust Report

**Answers:** "Can this system be trusted at all?"

**Contains:**
- Architecture description
- Cryptographic guarantees
- Threat coverage
- Operational assumptions
- Explicit disclaimers

**Proves:**
- System design intent
- Claimed security properties

**Does NOT Prove:**
- Correct deployment
- Operational integrity
- Key custody practices

---

### 2. Decision Trust Report

**Answers:** "Can this specific decision be trusted?"

**Contains:**
- Decision identification
- Integrity proof (hashes)
- Attestation proof (signature)
- Verification results (pre-computed)
- Governance context (non-authoritative)

**Proves:**
- Record integrity (hash matches)
- Chain linkage (previous hash correct)
- Authorship (if attested)

**Does NOT Prove:**
- AI correctness
- AI fairness
- Legal compliance
- Business appropriateness

---

### 3. Chain Integrity Report

**Answers:** "Is the historical record intact?"

**Contains:**
- Chain summary
- Verification result
- Break location (if applicable)

**Proves:**
- Chain continuity
- Tampering detection

**Does NOT Prove:**
- Individual record correctness
- Completeness (records may be missing from before chain start)

---

## Interpretation Rules

### Integrity Status

| Status | Meaning |
|--------|---------|
| VALID | Hash and chain checks pass |
| INVALID | One or more checks failed |

### Attestation Status

| Status | Meaning |
|--------|---------|
| SIGNED | Record has valid signature from active identity |
| LEGACY | Record predates attestation (unsigned) |
| REVOKED_AFTER | Signature valid but identity revoked after signing |

### Chain Result

| Result | Meaning |
|--------|---------|
| INTACT | All records verified, no breaks |
| BROKEN | Chain discontinuity detected |

---

## Governance Context (Non-Authoritative)

The "Governance Context" section in reports is **informational only**.

It represents organizational process, not cryptographic fact.

Auditors may choose to ignore this section entirely.

---

## Version Compatibility

Reports include a schema version. Consumers should:

1. Check `generator_version` before processing
2. Reject reports from incompatible versions
3. Maintain version-specific parsers

---

## Disclaimer Hash

Every report includes a `disclaimer_hash` field.

This is a SHA-256 hash of the disclaimer text.

If the hash changes, the legal boundaries have changed.

---

## Archival

Reports are designed for long-term archival:

- JSON format is self-contained
- No external references required
- Timestamps in ISO-8601 format
- Deterministic serialization

---

**END OF SPECIFICATION**
