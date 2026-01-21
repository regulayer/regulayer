# NIST AI Risk Management Framework (AI RMF) — Evidence Mapping

Version: 1.0.0  
Framework: NIST AI RMF 1.0  
Document Type: Evidence Alignment (NOT Compliance Claim)

---

## Framework Overview

The NIST AI Risk Management Framework provides guidance for managing AI risks. This document maps Regulayer evidence capabilities to AI RMF requirements.

---

## GOVERN (GV) — Governance

### GV-1: Accountability Structures

**What the standard asks:**  
Organizations should have clear accountability structures for AI systems.

**What Regulayer provides:**
- Identity-attested decision records (who authorized what)
- Append-only governance annotations
- Role-based access control with segregation of duties
- Immutable audit logs of all governance actions

**What Regulayer does NOT provide:**
- Definition of accountability policies
- Assignment of responsible parties
- Organizational structure design

**Evidence artifacts:**
- Proof bundles with attestation section
- Governance evidence exports
- Access control audit logs

---

### GV-2: Risk Management Integration

**What the standard asks:**  
AI risk management should integrate with enterprise risk management.

**What Regulayer provides:**
- Incident disclosure framework
- Trust degradation tracking
- Time-bounded impact analysis

**What Regulayer does NOT provide:**
- Risk scoring or assessment
- Risk appetite determination
- Enterprise risk framework integration

**Evidence artifacts:**
- Incident disclosure documents
- Trust status reports

---

## MAP (MP) — Context & Use

### MP-2: System Purposes Documentation

**What the standard asks:**  
Document the purposes for which AI systems are used.

**What Regulayer provides:**
- Decision record metadata (system name, context)
- Canonical payload preservation
- Timestamp of each decision

**What Regulayer does NOT provide:**
- Purpose definition
- Use case validation
- Appropriateness determination

**Evidence artifacts:**
- Decision trust reports
- System identification fields

---

## MEASURE (ME) — Risk Assessment

### ME-1: Performance Measurement

**What the standard asks:**  
Measure AI system performance and outcomes.

**What Regulayer provides:**
- Complete decision history
- Timestamp accuracy
- Record integrity verification

**What Regulayer does NOT provide:**
- Performance metrics calculation
- Outcome evaluation
- Bias or fairness measurement

**Evidence artifacts:**
- Chain integrity reports
- Decision records with outcomes

---

### ME-3: Risk Identification

**What the standard asks:**  
Identify and document AI system risks.

**What Regulayer provides:**
- Incident declaration and tracking
- Affected scope determination
- Trust degradation matrix

**What Regulayer does NOT provide:**
- Risk identification methodology
- Risk probability assessment
- Risk prioritization

**Evidence artifacts:**
- Incident registry
- Disclosure documents

---

## MANAGE (MG) — Risk Response

### MG-2: Impact Mitigation

**What the standard asks:**  
Mitigate negative impacts when they occur.

**What Regulayer provides:**
- Affected evidence identification
- Unaffected evidence preservation
- Mitigation record tracking
- Transparent disclosure

**What Regulayer does NOT provide:**
- Mitigation strategy development
- Root cause analysis
- Corrective action implementation

**Evidence artifacts:**
- Incident mitigation records
- Trust status by decision

---

## Summary: AI RMF Alignment

| Function | Regulayer Support | Limitation |
|----------|-------------------|------------|
| GOVERN | Evidence of actions | Not policy definition |
| MAP | Decision record preservation | Not purpose validation |
| MEASURE | Complete audit trail | Not risk assessment |
| MANAGE | Incident tracking | Not mitigation strategy |

---

**DISCLAIMER:**  
This document demonstrates evidence alignment, not compliance certification.
Regulayer provides verifiable evidence that may support AI RMF implementation.
It does not replace a comprehensive AI risk management program.

---

**END OF NIST AI RMF MAPPING**
