# Auditor RFP Response Guide

Version: 1.0.0  
Document Type: Audit Engagement Support

---

## Purpose

This document explains how external auditors should use Regulayer during examinations. It reduces audit friction by providing clear guidance on evidence requests, tools, and conclusions.

---

## For Auditors: How to Use Regulayer

### Step 1: Request Evidence Package

Request a submission package for the audit period:

```
GET /v1/submissions/build
Parameters:
  - from_date: Start of audit period
  - to_date: End of audit period
  - include_governance: true (optional)
```

You will receive a ZIP file containing:
- manifest.json (integrity anchor)
- reports/ (human-readable summaries)
- proof_bundles/ (cryptographic evidence)
- governance_evidence/ (optional)

---

### Step 2: Verify Package Integrity

Before examining contents, verify the package wasn't corrupted:

```bash
# Check manifest integrity
sha256sum -c manifest.json

# All files should show "OK"
```

---

### Step 3: Verify Individual Records

Use the open-source verification tool:

```bash
git clone https://github.com/regulayer/regulayer-proof-verifier
cd regulayer-proof-verifier

# Verify a single record
python -m regulayer_proof_verifier verify proof_bundles/decision_123.json

# Verify entire chain
python -m regulayer_proof_verifier verify-chain proof_bundles/
```

---

### Step 4: Sample Verification

For statistical sampling:

1. Select random sample of decision IDs
2. Verify each individually
3. Document verification results
4. Compare to sample expectations

---

### Step 5: Review Governance Evidence

If governance evidence was requested:

1. Review approval workflows
2. Check segregation of duties
3. Verify auditor access was read-only
4. Check for conflict-of-interest violations

**Note:** Governance evidence is organizational process, not cryptographic proof.

---

## What Tools Are Available

### Proof Verifier CLI

- **Source:** Open-source, auditable
- **Output:** Deterministic, reproducible
- **Dependencies:** Standard Python, no network
- **Commands:**
  - `verify` - Single record verification
  - `verify-chain` - Full chain verification
  - `verify-attestation` - Signature verification

### Verification UI

- Internal web interface for visual verification
- Read-only for auditors
- Shows chain integrity visualizations

---

## What Conclusions You CAN Draw

### From Verified Proof Bundles

✅ Record was not altered after creation
✅ Hash chain is intact
✅ Signature was made by attested identity
✅ Timestamp order is consistent

### From Governance Evidence

✅ Review workflow was followed
✅ Approvals were logged
✅ Segregation of duties was enforced
✅ Access was appropriately restricted

---

## What Conclusions You CANNOT Draw

### From Regulayer Evidence Alone

❌ AI decision was correct
❌ AI decision was fair
❌ Organization complied with regulations
❌ Risk was appropriately managed
❌ AI model is accurate

---

## Common Audit Questions

### "How do I know this wasn't fabricated?"

Each record includes the previous record's hash. Fabricating a record would require:
1. Computing a hash that includes the (unknown) future record's hash
2. This is mathematically impossible

### "What if the signing key was stolen?"

Check the key rotation log. Signatures made before key compromise remain valid. Only signatures during the compromise window are questioned.

### "Can I trust the verification tool?"

The tool is open-source. You can:
1. Audit every line of code
2. Fork and run your own version
3. Implement verification yourself using standard SHA-256/Ed25519

### "What if Regulayer is colluding with the client?"

The evidence is independently verifiable. You can:
1. Use your own verification tools
2. Use standard cryptographic libraries
3. Verify without any Regulayer infrastructure

---

## Evidence Request Template

```
To: [Customer]
Subject: Regulayer Evidence Request for Audit

Please provide:

1. Submission package for period [DATE] to [DATE]
   - Include all decision records
   - Include governance evidence
   - Include any incident disclosures

2. Access to verification tools
   - Proof verifier source code or URL
   - Documentation for verification commands

3. Incident log for audit period
   - All declared incidents
   - All mitigations
   - Affected scope documentation

4. Key rotation log
   - All rotations during period
   - Current key fingerprints
   - Historical key fingerprints

Please confirm that no records have been modified after initial creation.
```

---

## Reporting Guidance

When documenting Regulayer evidence in audit reports:

### Positive Finding Example
> "We verified [N] decision records using the Regulayer verification tool. All records passed integrity verification. The hash chain was intact with no evidence of tampering."

### Limitation Statement Example
> "Regulayer verification confirms record integrity. It does not confirm the correctness, fairness, or appropriateness of the underlying AI decisions."

---

**END OF AUDITOR RFP RESPONSE GUIDE**
