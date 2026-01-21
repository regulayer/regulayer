# Regulatory Alignment Note

**Version:** 1.0.0
**Status:** INFORMATIONAL

This document describes how Regulayer's capabilities map to common regulatory and audit concepts. It is intended to help regulators understand the system without claiming specific compliance.

> **IMPORTANT:** This document uses phrases like "supports", "enables", and "can be used as evidence for". It does NOT claim certification, compliance, or regulatory approval.

---

## Capability Mapping

| Regulatory Concept | Regulayer Capability | How It Works |
| :--- | :--- | :--- |
| **Audit Trail** | Hash-chained decision records | Each record links to the previous via SHA-256 hash. The chain cannot be modified without detection. |
| **Non-Repudiation** | Ed25519 digital signatures | Attested records include a cryptographic signature proving authorship. |
| **Evidence Integrity** | Offline proof verification | Third parties can verify bundles without Regulayer infrastructure. |
| **Forensic Reproducibility** | Clean-room verifier | The `regulayer-proof-verifier` is a standalone tool that can be audited and reimplemented. |
| **Record Retention** | Append-only database | Records cannot be deleted or modified at the application level. |
| **Traceability** | Unique decision_id and record_id | Each decision is uniquely identified and sequentially ordered. |

---

## Alignment with Audit Principles

### Principle: "Records should be complete and unaltered"
**Regulayer Support:** The hash chain mathematically proves completeness. Any gap or alteration breaks the chain.

### Principle: "Evidence should be independently verifiable"
**Regulayer Support:** The verifier CLI operates offline with no network access. Auditors do not need to trust Regulayer's servers.

### Principle: "Authorship should be attributable"
**Regulayer Support:** Ed25519 signatures bind a specific identity to each attested record.

---

## What This Document Is NOT

1. **NOT a compliance certificate.** Regulayer does not certify compliance with any specific regulation.
2. **NOT legal advice.** Consult qualified legal professionals for compliance determinations.
3. **NOT an endorsement.** Regulayer does not endorse any specific regulatory interpretation.

---

## Use in Procurement

When evaluating Regulayer for procurement, the following evidence is available:
1. **Technical Specifications:** See `regulayer-assurance/` directory.
2. **Independent Verifier:** See `regulayer-proof-verifier/` directory.
3. **Sample Evidence Pack:** See `SAMPLE_EVIDENCE_PACK/` directory.

All claims are cryptographically falsifiable. Procurement teams are encouraged to verify independently.
