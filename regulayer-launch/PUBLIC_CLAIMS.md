# Public Claims

## Purpose

This document defines what Regulayer IS allowed to claim publicly.
All statements must be verifiable, backed by exported artifacts, and technically provable.

---

## Allowed Claims

### Core Technical Claims

| Claim | Justification |
|-------|---------------|
| ✅ "Regulayer produces cryptographically verifiable records of AI decisions." | Backed by attestation system |
| ✅ "Proof bundles can be verified offline without Regulayer." | Backed by offline verifier |
| ✅ "Tampering with recorded decisions is mathematically detectable." | Backed by hash chain invariants |
| ✅ "Governance metadata never alters cryptographic evidence." | Backed by governance separation |
| ✅ "Records are append-only and cannot be deleted from the chain." | Backed by chain architecture |
| ✅ "Each decision is signed with a cryptographic key." | Backed by attestation invariants |

### Trust Model Claims

| Claim | Justification |
|-------|---------------|
| ✅ "Evidence can be independently verified by any third party." | Offline verifier is public |
| ✅ "Proof validity does not depend on Regulayer's continued operation." | Self-contained bundles |
| ✅ "Original authorship is preserved across custody transfers." | Lineage invariants |
| ✅ "Provenance links are contextual metadata, not cryptographic dependencies." | Provenance architecture |

### Audit & Governance Claims

| Claim | Justification |
|-------|---------------|
| ✅ "All system actions are logged for audit purposes." | Audit log system |
| ✅ "Human oversight can be recorded alongside AI decisions." | Human review workflow |
| ✅ "Deletion affects visibility, not cryptographic records." | Governance separation |
| ✅ "Retention policies apply to governance data, not proofs." | Retention architecture |

### Interoperability Claims

| Claim | Justification |
|-------|---------------|
| ✅ "Evidence exports conform to published open schemas." | JSON Schema definitions |
| ✅ "Third-party tools can consume proof bundles without Regulayer." | Open interop standards |
| ✅ "Trust models are publicly documented and versioned." | Trust registry |

---

## Language Rules for Claims

### Use These Words

| Word | Meaning |
|------|---------|
| Verifiable | Can be mathematically checked |
| Detectable | Tampering produces observable evidence |
| Observable | Can be seen by any party |
| Supports | Enables a workflow (not guarantees an outcome) |
| Provides | Makes available (not ensures) |

### Avoid These Words

| Word | Problem |
|------|---------|
| Ensures | Implies guarantee of outcome |
| Guarantees | Legal liability |
| Proves (correctness) | Beyond scope |
| Prevents | Cannot prevent human action |
| Certifies | We don't certify |

---

## Claim Construction Pattern

### Template

```
"Regulayer [VERB] [ARTIFACT] that [PROPERTY]."
```

### Examples

✅ "Regulayer produces proof bundles that can be verified offline."
✅ "Regulayer provides evidence that tampering is detectable."
✅ "Regulayer supports audit workflows with exportable records."

### Anti-Pattern

❌ "Regulayer ensures your AI is compliant."
❌ "Regulayer guarantees your decisions are correct."
❌ "Regulayer prevents fraud in AI systems."

---

## Website Copy Examples

### Hero Section (Allowed)

> "Cryptographically verifiable records of AI decisions.
> Evidence that survives scrutiny.
> Proofs you can export and verify yourself."

### Feature Section (Allowed)

> **Tamper-Evident Records**
> Every decision is hashed and signed. Modifications are mathematically detectable.
>
> **Offline Verification**
> Export proof bundles and verify them anywhere, anytime, without us.
>
> **Governance Without Compromise**
> Manage visibility, access, and retention without touching cryptographic truth.

---

## Review Checklist

Before publishing any claim, verify:

- [ ] Is this backed by a technical artifact?
- [ ] Can this be independently verified?
- [ ] Does this avoid implying correctness or compliance?
- [ ] Does this use approved vocabulary?
- [ ] Would a regulator find this precise and modest?

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
| Status | Active |
