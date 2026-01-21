# Regulator Audit Simulation

Version: 1.0.0  
Scenario Type: Regulatory Examination

---

## Scenario Description

A financial services regulator is auditing your AI decision-making system. They want to verify that decisions are recorded with integrity and that you can prove non-tampering.

---

## Question 1: "How do you know this decision wasn't altered?"

### Evidence Artifact
- Proof bundle: `proof_bundles/decision_<id>.json`
- Contains: record_hash, previous_record_hash, canonical_payload

### Verification Step
```bash
regulayer-proof-verifier verify proof_bundles/decision_<id>.json
```

### Expected Result
```
✅ Hash Valid: Record hash matches computed hash
✅ Chain Valid: Previous hash links correctly
✅ Integrity: VERIFIED
```

### Failure Boundary
Regulayer proves record integrity, NOT decision correctness. The AI may have made a wrong decision that was recorded correctly.

---

## Question 2: "Who signed this decision?"

### Evidence Artifact
- Attestation section in proof bundle
- Contains: identity_id, signature, algorithm, signed_at

### Verification Step
```bash
regulayer-proof-verifier verify-attestation proof_bundles/decision_<id>.json
```

### Expected Result
```
Identity: guard-001
Algorithm: Ed25519
Signed At: 2026-01-15T14:30:00Z
Signature: VALID
```

### Failure Boundary
Regulayer proves WHO signed, not WHETHER they should have signed. Authorization is organizational policy.

---

## Question 3: "What if your signing key was compromised?"

### Evidence Artifact
- Key rotation log: `/v1/archival/key-rotations`
- Incident disclosure (if applicable)

### Verification Step
1. Check key rotation log for compromise timestamp
2. Check if decision was signed before or after compromise
3. If before: signature remains valid per KEY_ROTATION_POLICY.md

### Expected Result
- Signatures before compromise: VALID (historical context)
- Signatures during compromise: DEGRADED or UNTRUSTED per TRUST_DEGRADATION_MATRIX.md

### Failure Boundary
Key compromise does not invalidate historical signatures. Trust status is explicit, not silent.

---

## Question 4: "What if your company shuts down?"

### Evidence Artifact
- Offline proof bundle
- Cryptographic snapshot
- Open-source verifier tool

### Verification Step
```bash
# No Regulayer infrastructure needed
regulayer-proof-verifier verify proof.json --offline
```

### Expected Result
Verification succeeds using only:
- Standard SHA-256 library
- Standard Ed25519 library
- The proof bundle itself

### Failure Boundary
Regulayer provides portable evidence. Long-term key custody is customer responsibility.

---

## Question 5: "What evidence can we verify independently?"

### Evidence Artifact
- Complete submission package (ZIP)

### Verification Step
1. Extract package
2. Verify manifest.json against all files (SHA-256)
3. Verify each proof bundle with open-source tool
4. No API access required

### Expected Result
```
Package Integrity: VALID
Proof Bundles: ALL VERIFIED
Independence: COMPLETE
```

### Failure Boundary
Regulayer cannot verify AI correctness. Only recording and integrity can be proven.

---

## Summary Table

| Question | Artifact | Verification | Boundary |
|----------|----------|--------------|----------|
| Alteration proof | Proof bundle | Hash verification | Integrity, not correctness |
| Signer identity | Attestation | Signature verification | Identity, not authorization |
| Key compromise | Rotation log + disclosure | Time-bounded evaluation | Historical signatures valid |
| Vendor shutdown | Offline bundle | Independent verification | Portable evidence |
| Independent verification | Submission package | Offline tools | Regulayer not required |

---

**END OF REGULATOR AUDIT SIMULATION**
