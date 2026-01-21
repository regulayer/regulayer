# Auditor Certification Guide

**Version:** 1.0.0
**Status:** FINAL

This document provides independent auditors with everything required to verify Regulayer evidence without trusting Regulayer.

---

## 1. Scope of Verification

### What Can Be Verified Cryptographically
- **Integrity**: The decision record has not been modified since recording.
- **Ordering**: Records are in a strict, unbroken sequence.
- **Authorship**: Attested records are attributable to a specific signing identity.
- **Detectability**: Any tampering will produce explicit, machine-parsable errors.

### What Cannot Be Verified
- **AI Correctness**: The quality or fairness of the AI model's decision.
- **Input Truth**: Whether the data provided to the model was accurate.
- **Regulatory Compliance**: Regulayer provides evidence, not legal opinions.
- **Intent**: The motivation behind decisions.

---

## 2. Preconditions

### Required Tools
| Tool | Version | Purpose |
| :--- | :--- | :--- |
| Python | 3.9+ | Runtime |
| `regulayer-proof-verifier` | 1.0.0 | Verification CLI |

### Installation
```bash
cd regulayer-proof-verifier
pip install -e .
```

### Network Requirements
**None.** All verification is performed offline using local files only.

### Infrastructure Requirements
**None.** No access to Regulayer servers, databases, or APIs is required.

---

## 3. Verification Procedures

### 3.1 Single Proof Verification

**Purpose:** Verify a single decision record for integrity and authorship.

```bash
regulayer verify-proof valid_attested_bundle.json
```

**Expected Output (PASS):**
```text
PASS: valid_attested_bundle.json verified successfully.
```

**JSON Output (for automation):**
```bash
regulayer verify-proof valid_attested_bundle.json --json
```
```json
{
  "status": "PASS",
  "file": "valid_attested_bundle.json"
}
```

---

### 3.2 Tampering Detection

**Purpose:** Confirm the verifier detects modified payloads.

```bash
regulayer verify-proof tampered_bundle.json
```

**Expected Output (FAIL):**
```text
FAIL: INVALID_HASH - Hash mismatch. Computed: abc123... Expected: def456...
```

**Interpretation:** The `canonical_event` content was altered after recording.

---

### 3.3 Chain Verification

**Purpose:** Verify a sequence of records for completeness and order.

```bash
regulayer verify-chain mixed_chain/ --strict
```

**Expected Output (PASS):**
```text
PASS: Chain verified successfully. 4 records checked.
```

**Strict Mode:** Ensures no gaps in `record_id` sequence (e.g., 1, 2, 3, 4).

---

## 4. Failure Interpretation Table

| Error Code | Meaning | Audit Implication |
| :--- | :--- | :--- |
| `INVALID_HASH` | Payload modified after recording | **Evidence Tampered** |
| `INVALID_SIGNATURE` | Signature does not match public key | **Non-Repudiation Failure** |
| `BROKEN_CHAIN` | Previous hash link mismatch | **Audit Trail Incomplete** |
| `CANONICALIZATION_MISMATCH` | JSON structure unstable | **Format Exploit Detected** |
| `UNSUPPORTED_VERSION` | Unknown proof bundle version | **Incompatible Evidence** |
| `REVOKED_IDENTITY` | Signer was revoked at time of signing | **Governance Violation** |

---

## 5. Sample Evidence Pack

The `SAMPLE_EVIDENCE_PACK/` directory contains pre-built artifacts for auditor training:

| File | Expected Result | Purpose |
| :--- | :--- | :--- |
| `valid_attested_bundle.json` | PASS | Demonstrates valid, signed record |
| `tampered_bundle.json` | FAIL (INVALID_HASH) | Demonstrates tampering detection |
| `revoked_identity_bundle.json` | PASS (with warning) | Demonstrates revoked-after semantics |
| `legacy_bundle.json` | PASS | Demonstrates legacy (unsigned) record |
| `mixed_chain/` | PASS (strict) | Demonstrates real-world chain verification |

---

## 6. Auditor Attestation

After verification, the auditor may produce a statement such as:

> "Using the Regulayer Independent Verifier (v1.0.0), I verified [N] proof bundles exported from [System Name] on [Date]. All records passed integrity and chain verification. No tampering was detected."

This statement is the auditor's own. Regulayer does not provide or certify it.
