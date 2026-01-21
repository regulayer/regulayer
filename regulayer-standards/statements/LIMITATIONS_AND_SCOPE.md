# Limitations and Scope Statement

Version: 1.0.0  
Document Type: Technical & Legal Boundary Document

---

## Purpose

This document clearly defines what Regulayer can and cannot do. Reference this document when claims about Regulayer are being evaluated.

---

## In Scope — What Regulayer DOES

### Record Integrity
✅ Prove records exist
✅ Prove records weren't altered
✅ Detect tampering in hash chains
✅ Verify record ordering

### Authorship Attribution
✅ Prove who signed records
✅ Prove when records were signed
✅ Track key rotation history
✅ Preserve historical key validity

### Governance Evidence
✅ Record review states
✅ Record approvals
✅ Record annotations
✅ Enforce segregation of duties

### Incident Management
✅ Declare incidents immutably
✅ Scope affected evidence
✅ Generate disclosure documents
✅ Track trust degradation

### Long-Term Verification
✅ Offline verification capability
✅ Cryptographic snapshots
✅ Secondary hash algorithms
✅ Archive-ready evidence packages

---

## Out of Scope — What Regulayer does NOT DO

### AI Evaluation
❌ Assess AI correctness
❌ Measure AI accuracy
❌ Evaluate AI fairness
❌ Detect AI bias
❌ Validate AI outputs

### Compliance Certification
❌ Certify regulatory compliance
❌ Provide legal opinions
❌ Replace compliance programs
❌ Guarantee approval

### Risk Assessment
❌ Identify risks
❌ Score risk severity
❌ Prioritize risks
❌ Recommend mitigations

### Real-Time Intervention
❌ Stop AI decisions
❌ Override AI outputs
❌ Reject AI actions
❌ Modify AI behavior

---

## Technical Limitations

### Cryptographic Assumptions
- SHA-256 remains secure (may be deprecated in 15-20 years)
- Ed25519 remains secure (quantum concerns in 10-20 years)
- Mitigated by secondary hashes and cryptographic snapshots

### Dependency on Input
- Regulayer records what it receives
- Cannot verify input accuracy
- "Garbage in, garbage recorded"

### Timestamp Accuracy
- Timestamps reflect when Regulayer received data
- Cannot verify when AI actually made decision
- Clock accuracy depends on infrastructure

### Storage Durability
- Depends on underlying database
- Regulayer does not provide storage guarantees
- Append-only is logical, not physical

---

## Legal Limitations

### Not Legal Advice
Regulayer documentation is not legal advice. Consult qualified legal counsel for compliance determinations.

### Not Conformity Assessment
Regulayer is not a conformity assessment body. Third-party assessment is required for regulatory certification.

### Jurisdiction Variability
Evidence admissibility varies by jurisdiction. Consult local legal counsel.

---

## Liability Boundaries

### What Regulayer Warrants
- Hash computations are correct
- Chain linkage is correct
- Signatures are verified correctly
- Verification is deterministic

### What Regulayer Does NOT Warrant
- AI decision quality
- AI decision legality
- AI decision fairness
- Regulatory compliance
- Business appropriateness

---

## Summary Table

| Area | Can Do | Cannot Do |
|------|--------|-----------|
| Records | Prove integrity | Prove correctness |
| Signatures | Prove authorship | Prove authorization |
| Governance | Record process | Guarantee quality |
| Incidents | Track degradation | Assess risk |
| Compliance | Provide evidence | Certify compliance |

---

**END OF LIMITATIONS AND SCOPE STATEMENT**
