# Court Affidavit Template

## Purpose

Template for court affidavits regarding Regulayer evidence verification.
Suitable for legal proceedings requiring sworn statements about evidence integrity.

---

## AFFIDAVIT OF EVIDENCE VERIFICATION

**Case**: [Case Name and Number]
**Court**: [Court Name]
**Date**: [Date]

---

### Affiant Identification

I, [Full Name], declare under penalty of perjury:

1. I am [Title/Position] at [Organization].
2. I have [X] years of experience in [relevant field].
3. I have personal knowledge of the facts stated herein.

---

### Evidence Examined

4. I examined cryptographic proof bundles produced by Regulayer,
   a service that creates verifiable records of AI system decisions.

5. The evidence examined consists of:
   - [Number] proof bundles
   - Covering the period [Start Date] to [End Date]
   - Related to [AI system/decision type]

---

### Verification Performed

6. I performed the following verification steps:

   a. **Hash Verification**: I recomputed SHA-256 hashes for all
      decision records and compared them against the claimed hashes
      in each proof bundle.

   b. **Signature Verification**: I verified digital signatures
      using Ed25519 public key cryptography against the public keys
      published by Regulayer.

   c. **Chain Verification**: I confirmed that each record correctly
      references the hash of the preceding record, establishing an
      unbroken chain.

7. Verification was performed using [specify tool/method].

8. Verification [did / did not] require access to Regulayer systems.

---

### Findings

9. Based on my verification:
   - [X] of [Y] bundles passed hash verification
   - [X] of [Y] bundles passed signature verification
   - [X] of [Y] bundles showed valid chain linking

10. [Describe any anomalies or notable findings]

---

### Interpretation

11. The successful verification establishes:
    - The decision records have not been modified since recording
    - Regulayer attested to these specific records at specific times
    - The records form an unbroken chronological sequence

12. The verification does NOT establish:
    - The correctness or appropriateness of the decisions themselves
    - Compliance with any particular regulation
    - The intent or context of the decision-makers

---

### Qualifications

13. My qualifications to perform this verification include:
    [List relevant qualifications, certifications, experience]

---

### Declaration

I declare under penalty of perjury under the laws of [Jurisdiction]
that the foregoing is true and correct.

Executed on [Date] at [City, State/Country].

---

**Signature**: _________________________

**Printed Name**: [Full Name]

**Title**: [Title]

**Organization**: [Organization]
