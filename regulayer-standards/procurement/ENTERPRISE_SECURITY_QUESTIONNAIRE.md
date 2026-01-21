# Enterprise Security Questionnaire — Pre-Answered

Version: 1.0.0  
Document Type: Procurement Support

---

## Purpose

This document pre-answers common enterprise security questionnaire questions about Regulayer. All answers reference existing implementation, not promises.

---

## 1. Data Security

### Q: Where is data stored?

**A:** Decision records are stored in the customer's designated database. Regulayer does not operate a shared data store. Data residency is controlled by customer infrastructure.

**Reference:** Customer deployment configuration

---

### Q: Is data encrypted at rest?

**A:** Regulayer operates at the application layer. Encryption at rest depends on the customer's chosen database and storage configuration. Regulayer recommends enabling database-level encryption.

**Reference:** Customer infrastructure responsibility

---

### Q: Is data encrypted in transit?

**A:** All API communications use HTTPS/TLS. Customers should configure TLS 1.2+ for all endpoints.

**Reference:** API documentation

---

### Q: How long is data retained?

**A:** Decision records are append-only and retained indefinitely by design. This supports long-term regulatory requirements. Retention beyond Regulayer's append-only guarantees is a customer policy decision.

**Reference:** ARCHIVAL_TRUST_MODEL.md

---

## 2. Access Control

### Q: How is access controlled?

**A:** Regulayer implements role-based access control with five defined roles:
- SYSTEM: Internal SDK operations
- ANALYST: Can view, annotate, tag
- COMPLIANCE: Can approve decisions
- AUDITOR: Read-only access
- ADMIN: Full access except governance actions

**Reference:** access_control.py

---

### Q: Is segregation of duties enforced?

**A:** Yes. Conflict-of-interest checking prevents the same user from both creating and approving a decision. Auditors are explicitly read-only.

**Reference:** check_approver_conflict() in access_control.py

---

### Q: How are access events logged?

**A:** All governance actions are logged to an immutable audit table (GovernanceAccessLogDB). Logs include actor, action, target, timestamp, and result.

**Reference:** audit_logger.py

---

## 3. Cryptography

### Q: What cryptographic algorithms are used?

**A:**
- Hashing: SHA-256
- Signatures: Ed25519
- Canonicalization: RFC 8785 (JSON)

All are NIST-approved or industry-standard.

**Reference:** CRYPTO_AGILITY_NOTE.md

---

### Q: How are keys managed?

**A:** Regulayer records key fingerprints and rotation events. Key generation and storage are customer responsibilities. Regulayer integrates with customer KMS.

**Reference:** KEY_ROTATION_POLICY.md

---

### Q: How is key rotation handled?

**A:** Key rotation is logged in an append-only key rotation log. Historical signatures remain valid. Rotation does not invalidate past evidence.

**Reference:** KEY_ROTATION_POLICY.md

---

## 4. Incident Response

### Q: How are incidents handled?

**A:**
1. Incident declared in append-only registry
2. Affected scope determined (time, identity, component)
3. Trust status assigned (TRUSTED/DEGRADED/UNTRUSTED)
4. Disclosure document generated
5. Mitigation recorded as separate entry

**Reference:** regulayer-incident/ package

---

### Q: How quickly are incidents disclosed?

**A:** Incident declaration is immediate upon detection. Disclosure documents are generated on-demand. Customer notification timelines are per customer SLA.

**Reference:** disclosure.py

---

### Q: Are unaffected records preserved?

**A:** Yes. Incident response explicitly scopes affected vs unaffected evidence. Unaffected records remain TRUSTED. No silent invalidation occurs.

**Reference:** TRUST_DEGRADATION_MATRIX.md

---

## 5. Compliance

### Q: What regulations does Regulayer comply with?

**A:** Regulayer provides evidence that may support compliance with various regulations. It does not certify compliance. Specific compliance determinations should be made by qualified assessors.

**Reference:** NON_COMPLIANCE_STATEMENT.md

---

### Q: Does Regulayer support EU AI Act?

**A:** Regulayer provides evidence relevant to:
- Article 12: Record-keeping (strong support)
- Article 14: Human oversight (governance layer)

It does not support accuracy/bias requirements (Articles 9, 15).

**Reference:** EU_AI_ACT.md

---

### Q: Is Regulayer SOC 2 certified?

**A:** This document describes controls that may support SOC 2 requirements. Actual certification requires independent audit. Regulayer provides documented controls for auditor evaluation.

**Reference:** SOC2_SUPPORT.md

---

## 6. Business Continuity

### Q: What happens if Regulayer shuts down?

**A:** All evidence is independently verifiable:
1. Evidence packages are self-contained
2. Verification tools are open-source
3. No Regulayer API access required
4. Standard cryptographic algorithms used

Customer evidence remains valid forever.

**Reference:** ARCHIVAL_TRUST_MODEL.md

---

### Q: Can evidence be exported?

**A:** Yes. Complete submission packages include:
- Proof bundles (cryptographic evidence)
- Manifest (integrity anchor)
- Reports (human-readable summaries)
- Governance evidence (if applicable)

All exports are verifiable offline.

**Reference:** regulayer-submission/ package

---

## 7. Third-Party Verification

### Q: Can external auditors verify evidence?

**A:** Yes. Auditors can:
1. Download evidence packages
2. Use open-source verification tools
3. Verify without Regulayer access
4. Reproduce verification independently

**Reference:** AUDITOR_RFP_RESPONSE.md

---

### Q: What tools are available for verification?

**A:**
- regulayer-proof-verifier CLI
- Open-source, auditable
- Deterministic output
- No network dependencies

**Reference:** regulayer-proof-verifier documentation

---

**END OF ENTERPRISE SECURITY QUESTIONNAIRE**
