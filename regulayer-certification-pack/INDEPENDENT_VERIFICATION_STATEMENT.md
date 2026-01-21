# Independent Verification Statement

**Version:** 1.0.0
**Effective Date:** January 2026

This document provides a plain-language explanation of what Regulayer proves and what it explicitly does not prove.

---

## What Regulayer Proves

### 1. Integrity of Recorded Decisions
Every decision event recorded by Regulayer is cryptographically hashed. Any modification to the payload—even a single character—will invalidate the hash and be detected by independent verification.

### 2. Ordering of Decisions
Records are linked in a linear, append-only chain. Each record references the hash of its predecessor. It is mathematically impossible to insert, delete, or reorder records without breaking this chain.

### 3. Authorship (When Attested)
When an AI agent signs a decision using Ed25519, the signature proves that the holder of the private key authorized that specific payload. This creates non-repudiation: the signer cannot later deny having signed.

### 4. Detectability of Tampering
The verification tooling will produce explicit, machine-parsable error codes when tampering is detected. Tampering cannot be hidden from an auditor using the provided tools.

---

## What Regulayer Does NOT Prove

### 1. AI Model Correctness
Regulayer records *what* the AI decided, not *whether* the decision was correct, accurate, or optimal. A model could output "2+2=5", and Regulayer would faithfully record it.

### 2. Fairness or Bias
Regulayer does not analyze the content of decisions for fairness, bias, or discrimination. It is a ledger, not an ethics engine.

### 3. Regulatory Compliance
Regulayer provides cryptographic evidence. It does not interpret regulations, certify compliance, or provide legal opinions. Compliance is determined by qualified legal and regulatory professionals.

### 4. Input Data Accuracy
Regulayer records the decision as presented by the SDK. It does not verify that the input data was accurate, complete, or truthful in the real world.

### 5. Absence of Malicious Intent
Regulayer cannot detect if a model was intentionally designed to produce harmful outcomes. It proves *what happened*, not *why it happened*.

---

## Liability Boundary

Regulayer's responsibility is limited to:
1. Correctly implementing the cryptographic controls described in the Assurance Package.
2. Providing accurate verification tooling.
3. Maintaining the integrity of the append-only ledger.

Regulayer is NOT responsible for:
1. The quality of AI models.
2. The accuracy of input data.
3. The decisions made by AI systems.
4. Regulatory interpretations.

---

## Closing Statement

Regulayer is an *evidence system*, not a *judgment system*. It creates cryptographic facts. The interpretation and use of those facts is the responsibility of the auditor, regulator, or court.
