# Trust Language Guide

## Purpose

This document defines the exact vocabulary Regulayer uses.
Precision in language preserves trust with regulators, courts, and enterprises.

---

## Canonical Terms

### Core Vocabulary

| Term | Definition | Use |
|------|------------|-----|
| **Proof** | Cryptographic artifact that can be independently verified | "Export a proof bundle" |
| **Verified** | Has passed mathematical verification | "The signature is verified" |
| **Trust** | Ability to verify independently | "Trust through verification" |
| **Evidence** | Data that can be independently checked | "Evidence of the decision" |
| **Record** | An immutable entry in the chain | "The decision record" |
| **Attestation** | Cryptographic signature binding content to time and author | "Attestation by Regulayer" |

### Governance Vocabulary

| Term | Definition | Use |
|------|------------|-----|
| **Governance** | Organizational overlay (visibility, access, retention) | "Governance does not affect proofs" |
| **Visibility** | What users can see in the UI | "Visibility can be restricted" |
| **Deletion** | Hiding from view, not destroying | "Deletion hides the record" |
| **Retention** | How long governance data is kept | "Retention policy for metadata" |
| **Custody** | Current organizational ownership | "Custody transferred to Org B" |
| **Origin** | Original author (never changes) | "Origin preserved permanently" |

### Technical Vocabulary

| Term | Definition | Use |
|------|------------|-----|
| **Hash** | Cryptographic fingerprint (SHA-256) | "The record hash" |
| **Chain** | Linked sequence of records | "Append-only chain" |
| **Signature** | Cryptographic proof of authorship | "Ed25519 signature" |
| **Canonical** | Standardized format for hashing | "Canonical JSON (RFC 8785)" |
| **Deterministic** | Same input → same output, always | "Deterministic verification" |

---

## Verb Guide

### Approved Verbs

| Verb | When to Use | Example |
|------|-------------|---------|
| Provides | Making something available | "Regulayer provides evidence" |
| Supports | Enabling a workflow | "Supports audit requirements" |
| Produces | Creating an artifact | "Produces proof bundles" |
| Records | Capturing data immutably | "Records AI decisions" |
| Verifies | Mathematical checking | "Verifies signature validity" |
| Detects | Identifying anomalies | "Detects tampering" |
| Exports | Making available externally | "Exports for offline use" |
| Preserves | Maintaining over time | "Preserves original authorship" |

### Prohibited Verbs

| Verb | Why Prohibited | Alternative |
|------|----------------|-------------|
| Ensures | Implies guarantee | Supports |
| Guarantees | Legal liability | Provides |
| Certifies | Authority we don't have | Provides evidence for |
| Approves | We never approve | Records |
| Prevents | We detect, not prevent | Detects |
| Validates | Model validation not our role | Records |
| Fixes | We don't fix decisions | Records |

---

## Phrasing Patterns

### Passive Voice for Claims

Use passive voice when describing what the system does.
This avoids agency claims.

✅ "Tampering is detectable"
❌ "Regulayer detects tampering"

✅ "Records are verified offline"
❌ "Regulayer verifies your records"

### Active Voice for Actions

Use active voice for user actions.

✅ "Export your proof bundle"
✅ "Verify the signature"
✅ "Review the decision record"

---

## Regulator-Safe Phrasing

### Pattern

```
"[ARTIFACT] that [PROPERTY], which [ENABLES/SUPPORTS] [WORKFLOW]."
```

### Examples

✅ "Proof bundles that are independently verifiable, which support regulatory review."

✅ "Attestations that bind decisions to timestamps, which enable audit trail reconstruction."

✅ "Evidence exports that conform to open schemas, which support third-party tool integration."

---

## Court-Safe Phrasing

### Pattern

```
"The record shows [FACT], verified by [METHOD], as of [TIME]."
```

### Examples

✅ "The record shows this decision was submitted at 2026-01-15T14:30:00Z, verified by cryptographic signature."

✅ "The chain shows 1,247 records, verified by hash linking, with no detected gaps."

### Avoid

❌ "This proves the company made the right decision."
❌ "This certifies the AI system is safe."
❌ "This guarantees regulatory compliance."

---

## Press-Safe Phrasing

### Pattern

```
"Regulayer helps organizations [VERB] AI decisions by [METHOD]."
```

### Examples

✅ "Regulayer helps organizations document AI decisions by creating cryptographic records."

✅ "Regulayer helps regulators review AI systems by providing independently verifiable evidence."

### Avoid

❌ "Regulayer ensures AI is used responsibly."
❌ "Regulayer makes AI safe."
❌ "Regulayer prevents AI harms."

---

## Consistency Checklist

Before publishing any text:

- [ ] All terms match canonical definitions
- [ ] No prohibited verbs
- [ ] Claims use approved phrasing patterns
- [ ] Passive voice for system claims
- [ ] Active voice for user actions only

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
