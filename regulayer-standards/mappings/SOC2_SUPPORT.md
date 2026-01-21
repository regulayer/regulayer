# SOC 2 — Evidence Support Mapping

Version: 1.0.0  
Framework: SOC 2 Type II (AICPA)  
Document Type: Evidence Alignment (NOT Compliance Claim)

---

## Framework Overview

SOC 2 evaluates controls related to security, availability, processing integrity, confidentiality, and privacy. This document maps Regulayer evidence capabilities to relevant Trust Service Criteria.

---

## CC1 — Control Environment

### CC1.3 — Oversight Responsibility

**What the standard asks:**  
Management establishes structures and processes to oversee internal controls.

**What Regulayer provides:**
- Role-based access control with defined permissions
- Segregation of duties enforcement
- Governance action logging
- Approval workflow tracking

**Evidence artifacts:**
- Access control module (access_control.py)
- Governance audit logs

---

## CC5 — Control Activities

### CC5.2 — Logical Access Controls

**What the standard asks:**  
Logical access to data is restricted to authorized personnel.

**What Regulayer provides:**
- Five defined roles: SYSTEM, ANALYST, COMPLIANCE, AUDITOR, ADMIN
- Permission-based access control
- Conflict of interest checking
- Access attempt logging

**What Regulayer does NOT provide:**
- User authentication
- Identity provider integration
- Session management

**Evidence artifacts:**
- ROLE_PERMISSIONS mapping
- Access control audit logs

---

### CC5.3 — Physical Access Controls

**What the standard asks:**  
Physical access to facilities is restricted.

**What Regulayer provides:**
- N/A (Regulayer is software infrastructure)

**What Regulayer does NOT provide:**
- Physical security controls

---

## CC6 — Logical and Physical Access

### CC6.1 — Access Management

**What the standard asks:**  
The entity implements controls to manage access.

**What Regulayer provides:**
- Hard-coded role definitions (not configurable)
- Permission enforcement in API layer
- X-Actor-Role header validation
- 403 responses for unauthorized access

**Evidence artifacts:**
- API endpoint documentation
- Access control error codes

---

## CC7 — System Operations

### CC7.2 — Security Incident Response

**What the standard asks:**  
Security incidents are identified, reported, and responded to.

**What Regulayer provides:**
- Incident declaration registry
- Severity classification
- Affected scope determination
- Mitigation tracking
- Disclosure document generation

**What Regulayer does NOT provide:**
- Incident detection (relies on external triggers)
- Automated response

**Evidence artifacts:**
- Incident registry (registry.py)
- Trust impact resolver (impact.py)
- Disclosure documents

---

## CC8 — Change Management

### CC8.1 — Infrastructure Changes

**What the standard asks:**  
Changes to infrastructure are authorized, tested, and approved.

**What Regulayer provides:**
- Immutable record architecture (changes are visible)
- Key rotation logging
- Algorithm snapshot preservation

**What Regulayer does NOT provide:**
- Change approval workflow for infrastructure
- Code deployment controls

---

## PI1 — Processing Integrity

### PI1.1 — Complete and Accurate Processing

**What the standard asks:**  
System processing is complete, accurate, and authorized.

**What Regulayer provides:**
- ⭐ Hash chain verification (completeness)
- ⭐ Canonical payload hashing (accuracy)
- ⭐ Attestation signing (authorization)
- ⭐ Chain integrity reports

**What Regulayer does NOT provide:**
- Validation of AI decision correctness
- Data input validation

**Evidence artifacts:**
- Proof bundles
- Chain integrity reports

---

### PI1.2 — Processing Validity

**What the standard asks:**  
Policies exist to validate processing.

**What Regulayer provides:**
- Policy evaluation engine
- Workflow enforcement
- Review state management

**Evidence artifacts:**
- Policy evaluation logs
- Workflow engine documentation

---

## A1 — Availability

### A1.1 — System Availability

**What the standard asks:**  
The entity maintains system availability commitments.

**What Regulayer provides:**
- Offline verification capability (no dependency on Regulayer uptime)
- Exportable evidence packages
- Independent verification tools

---

## C1 — Confidentiality

### C1.1 — Confidentiality Protection

**What the standard asks:**  
Confidential information is protected.

**What Regulayer provides:**
- Cryptographic hashing of sensitive data
- Role-based access restrictions
- Auditor read-only access mode

**What Regulayer does NOT provide:**
- Encryption at rest (depends on storage layer)
- Data classification

---

## Summary: SOC 2 Trust Service Criteria Alignment

| Category | Criteria | Regulayer Support | Limitation |
|----------|----------|-------------------|------------|
| CC1 | Control Environment | Role-based oversight | — |
| CC5 | Control Activities | Logical access controls | Not physical |
| CC6 | Access | Permission enforcement | Not authentication |
| CC7 | Operations | Incident response support | Not incident detection |
| CC8 | Change Management | Immutable audit trail | Not change workflow |
| PI1 | Processing Integrity | ⭐ STRONG SUPPORT | Not AI validation |
| A1 | Availability | Offline verification | — |
| C1 | Confidentiality | Access controls | Not encryption |

---

**DISCLAIMER:**  
This document demonstrates evidence alignment, not SOC 2 certification.
Regulayer provides verifiable evidence that may support SOC 2 controls.
It does not replace SOC 2 Type II audit or certification.

---

**END OF SOC 2 MAPPING**
