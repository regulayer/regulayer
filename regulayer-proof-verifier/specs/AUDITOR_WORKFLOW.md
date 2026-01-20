# Auditor Verification Workflow

**Version:** 1.0.0
**Status:** DRAFT

## 1. Overview

This document outlines the standard operating procedure (SOP) for an independent auditor to verify Regulayer decision records. The verification process is **offline**, **local**, and **trustless**—it relies solely on cryptographic math, not on Regulayer's servers or status indicators.

## 2. Prerequisites

The auditor requires:
1.  **The Proof Bundle(s)**: JSON files exported from the Regulayer Recorder.
2.  **The Verifier Tool**: The `regulayer-proof-verifier` CLI (Python package).
3.  **A Clean Environment**: A trusted local machine (air-gapped if desired).

## 3. Workflow Steps

### Step 1: Obtain the Proof Bundle
The System Administrator (Auditee) provides the proof bundles.
- **Source**: `GET /v1/decisions/{id}/export` or "Export Proof Bundle" button in the Dashboard.
- **Format**: `.json` files.

### Step 2: Install the Verifier
The auditor installs the tool on their trusted machine.
```bash
pip install regulayer-proof-verifier
```
*Note: The auditor may also choose to inspect the source code of the verifier or write their own implementation based on `PROOF_BUNDLE_SPEC.md`.*

### Step 3: Verify a Single Decision
To verify a specific high-impact decision:

```bash
regulayer verify proof decision-123.json
```

**Expected Output:**
```text
[PASS] Hash Check: OK
[PASS] Signature Check: OK (Identity: 550e8400-...)
[PASS] Canonicalization: OK
Verification Successful.
```

**What this proves:**
1.  The data has not been modified since it was recorded.
2.  The decision was definitely signed by the holder of the private key for `IdentityID`.

### Step 4: Verify a Chain Segment
To verify the integrity of a timeline (e.g., "All decisions from Jan 1 to Jan 31"):

```bash
regulayer verify chain ./monthly-audit-jan/ --strict
```

**Expected Output:**
```text
Loaded 5,000 records.
[PASS] Chain Continuity (No Gaps)
[PASS] Hash Linking (Record N links to N-1)
[PASS] Individual Integrity (All signatures valid)
Chain Verification Successful.
```

**What this proves:**
1.  No records have been deleted or removed from the sequence.
2.  No records have been inserted retroactively.
3.  The history is linear and complete.

## 4. Interpreting Failures

If the tool reports `FAIL`, the evidence is suspect.

| Error Code | Meaning | Implication |
| :--- | :--- | :--- |
| `INVALID_HASH` | The computed hash of the event does not match the `record_hash`. | **Tampering**. The `canonical_event` content has been modified after recording. |
| `INVALID_SIGNATURE` | The Ed25519 signature is invalid for the provided public key. | **Forgery**. The event was not signed by the claimed identity, or the signature was altered. |
| `BROKEN_CHAIN` | `previous_record_hash` does not match the predecessor. | **Deletion/Insertion**. Records have been removed or inserted into the history. |
| `CANONICALIZATION_MISMATCH` | The JSON structure is unstable. | **Format Exploit**. The JSON might contain hidden fields or exploit parser differences. |

## 5. Automation
For automated continuous auditing, use the `--json` flag to integrate with SIEM or GRC tools:

```bash
regulayer verify chain ./daily-export/ --json > report.json
```
