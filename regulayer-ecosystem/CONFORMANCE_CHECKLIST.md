# Conformance Checklist

## Purpose

A checklist that any third party can answer YES/NO to.
No scoring. No certification. Just facts.

---

## How to Use

For each requirement:
1. Test your implementation
2. Mark YES, NO, or N/A
3. Document evidence

This is a self-assessment. No external certification required.

---

## Recording Conformance

### R1: Hashing

| ID | Requirement | Pass |
|----|-------------|------|
| R1.1 | Uses SHA-256 for record hashing | ☐ |
| R1.2 | Hash includes all record fields except record_hash | ☐ |
| R1.3 | Hash is formatted as "sha256:<hex>" | ☐ |
| R1.4 | Hash is deterministic (same input → same hash) | ☐ |

### R2: Canonicalization

| ID | Requirement | Pass |
|----|-------------|------|
| R2.1 | Uses RFC 8785 JSON Canonicalization | ☐ |
| R2.2 | Object keys sorted alphabetically | ☐ |
| R2.3 | No whitespace between tokens | ☐ |
| R2.4 | Numbers formatted per RFC 8785 | ☐ |
| R2.5 | Strings properly escaped | ☐ |

### R3: Chain

| ID | Requirement | Pass |
|----|-------------|------|
| R3.1 | Append-only storage | ☐ |
| R3.2 | Each record includes previous_hash | ☐ |
| R3.3 | First record has sequence_number = 1 | ☐ |
| R3.4 | Sequence numbers are consecutive | ☐ |
| R3.5 | Modifications are rejected | ☐ |
| R3.6 | Deletions are rejected | ☐ |

### R4: Attestation

| ID | Requirement | Pass |
|----|-------------|------|
| R4.1 | Uses approved algorithm (Ed25519, ECDSA-P256, RSA-PSS) | ☐ |
| R4.2 | Signature computed over record_hash | ☐ |
| R4.3 | Signature is Base64 encoded | ☐ |
| R4.4 | Key ID is included | ☐ |
| R4.5 | Algorithm is specified | ☐ |

---

## Verification Conformance

### V1: Hash Verification

| ID | Requirement | Pass |
|----|-------------|------|
| V1.1 | Recomputes hash from canonical JSON | ☐ |
| V1.2 | Compares computed and claimed hash | ☐ |
| V1.3 | Detects modified records | ☐ |
| V1.4 | Reports mismatch clearly | ☐ |

### V2: Signature Verification

| ID | Requirement | Pass |
|----|-------------|------|
| V2.1 | Supports Ed25519 | ☐ |
| V2.2 | Verifies signature over record_hash | ☐ |
| V2.3 | Rejects invalid signatures | ☐ |
| V2.4 | Reports invalid clearly | ☐ |

### V3: Chain Verification

| ID | Requirement | Pass |
|----|-------------|------|
| V3.1 | Checks previous_hash linking | ☐ |
| V3.2 | Checks sequence ordering | ☐ |
| V3.3 | Detects breaks in chain | ☐ |
| V3.4 | Reports breaks clearly | ☐ |

### V4: Offline Verification

| ID | Requirement | Pass |
|----|-------------|------|
| V4.1 | Works without network access | ☐ |
| V4.2 | Does not require external services | ☐ |
| V4.3 | Self-contained verification | ☐ |

---

## Export Conformance

### E1: Bundle Format

| ID | Requirement | Pass |
|----|-------------|------|
| E1.1 | Exports as JSON | ☐ |
| E1.2 | Includes decision record | ☐ |
| E1.3 | Includes attestation | ☐ |
| E1.4 | Includes chain_position | ☐ |
| E1.5 | Includes verification metadata | ☐ |
| E1.6 | Self-contained (no external references) | ☐ |

### E2: Interoperability

| ID | Requirement | Pass |
|----|-------------|------|
| E2.1 | Bundles parseable by reference verifier | ☐ |
| E2.2 | Passes interop test suite | ☐ |
| E2.3 | Compatible with standard schema | ☐ |

---

## Summary Scorecard

| Category | Requirements | Passing |
|----------|-------------|---------|
| Recording - Hashing | 4 | ⬜/4 |
| Recording - Canonicalization | 5 | ⬜/5 |
| Recording - Chain | 6 | ⬜/6 |
| Recording - Attestation | 5 | ⬜/5 |
| Verification - Hash | 4 | ⬜/4 |
| Verification - Signature | 4 | ⬜/4 |
| Verification - Chain | 4 | ⬜/4 |
| Verification - Offline | 3 | ⬜/3 |
| Export - Bundle | 6 | ⬜/6 |
| Export - Interop | 3 | ⬜/3 |
| **Total** | **44** | **⬜/44** |

---

## Certification Statement

This checklist is for **self-assessment only**.

- ✅ No external certification required
- ✅ No fees or approvals
- ✅ No authority grants privileges

Completing this checklist does NOT:
- Grant any certification
- Imply endorsement
- Create legal standing
