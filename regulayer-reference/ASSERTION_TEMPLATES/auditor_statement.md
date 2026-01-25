# Auditor Assertion Statement Template

## Purpose

Template for independent auditors to document their verification of Regulayer proofs.
Uses safe language only: "observed", "verified", "reproduced".

---

## INDEPENDENT AUDITOR STATEMENT

**Auditor**: [Firm Name]
**Date**: [Date]
**Engagement Reference**: [Reference Number]

---

### Scope of Work

We were engaged to independently verify cryptographic proof bundles
produced by Regulayer. Our work was limited to technical verification
of the cryptographic properties of the provided evidence.

---

### Materials Examined

- Proof bundles: [Count] bundles spanning [Date Range]
- Hash algorithm: SHA-256
- Signature algorithm: Ed25519
- Schema version: [Version]

---

### Verification Procedures

We performed the following procedures using [our own / third-party / reference] verifier:

1. **Hash Verification**
   - Recomputed SHA-256 hashes for all decision records
   - Compared computed hashes against claimed record_hash values

2. **Signature Verification**
   - Obtained public keys from [source]
   - Verified Ed25519 signatures against record hashes
   - Confirmed key validity at signing time

3. **Chain Verification**
   - Verified sequential ordering of records
   - Confirmed previous_hash linking

---

### Observations

Based on our procedures, we observed:

| Check | Bundles Tested | Passed | Failed |
|-------|----------------|--------|--------|
| Hash integrity | [N] | [N] | [N] |
| Signature validity | [N] | [N] | [N] |
| Chain linking | [N] | [N] | [N] |

---

### Findings

[Describe any anomalies, failures, or notable observations]

---

### Limitations

This statement:
- Does NOT certify compliance with any regulation
- Does NOT attest to the correctness of recorded decisions
- Does NOT constitute a legal opinion
- Is limited to technical cryptographic verification

---

### Conclusion

Based on our independent verification procedures, we observed that the
examined proof bundles [passed / did not pass] cryptographic verification
as defined by Regulayer Trust Model v1.0.

---

**[Signature]**
[Name], [Title]
[Firm Name]
[Date]
