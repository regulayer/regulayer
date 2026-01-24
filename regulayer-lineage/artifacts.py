"""
Regulayer Evidence Lineage Artifacts

Generates legal and audit documentation for lineage.

Language rules:
- "Transferred custody"
- "Original authorship preserved"
- "Cryptographic facts unchanged"
"""

from datetime import datetime
from typing import Optional

from .models import (
    EvidenceLineage,
    CustodyTransfer,
    TransferReason,
    TRANSFER_ACTIONS,
)


# ============================================================
# Document Generators
# ============================================================

def generate_evidence_custody_model() -> str:
    """Generate EVIDENCE_CUSTODY_MODEL.md content."""
    does = TRANSFER_ACTIONS["does"]
    never = TRANSFER_ACTIONS["never_does"]
    
    return f"""# Evidence Custody Model

## Core Principle

**Evidence may change custody. Facts never change authorship.**

Ownership ≠ Origin.

## What a Transfer DOES

| Area | Effect |
|------|--------|
| UI Visibility | {does["ui_visibility"]} |
| Governance Metadata | {does["governance_metadata"]} |
| Billing | {does["billing"]} |
| Access | {does["access"]} |

## What a Transfer NEVER Does

| Area | Guarantee |
|------|-----------|
| Rehash | {never["rehash"]} |
| Re-sign | {never["resign"]} |
| Modify Chain | {never["modify_chain"]} |
| Change decision_id | {never["change_decision_id"]} |
| Change record_hash | {never["change_record_hash"]} |

## Origin Preservation

The original recording organization and timestamp are permanently preserved in:

1. The immutable evidence origin record
2. The proof bundle lineage section
3. All exported documentation

No custody transfer can modify this information.

---
Generated: {datetime.utcnow().isoformat()}
"""


def generate_ma_transfer_note(transfer: Optional[CustodyTransfer] = None) -> str:
    """Generate M&A_EVIDENCE_TRANSFER_NOTE.md content."""
    context = ""
    if transfer:
        context = f"""
## Transfer Details

- **From**: {transfer.from_org_name}
- **To**: {transfer.to_org_name}
- **Reason**: {transfer.reason.value}
- **Executed**: {transfer.executed_at.isoformat() if transfer.executed_at else 'Pending'}
"""
    
    return f"""# M&A Evidence Transfer Note

## Purpose

This document explains how decision records are handled during mergers, acquisitions, spin-offs, and asset transfers.

{context}

## Key Guarantees

### 1. Original Authorship Preserved

The acquiring organization receives **custody** of the evidence, not **authorship**.

- Original recording organization remains in the permanent record
- Original recording timestamp is immutable
- Decision hash is unchanged

### 2. Cryptographic Integrity Maintained

- No records are rehashed or re-signed
- Chain integrity is preserved
- All historical proofs remain valid

### 3. Audit Trail Complete

- Transfer request logged
- Approval workflow recorded
- Execution timestamp captured
- Full lineage available in proofs

## Verification

Proofs exported after the transfer can be verified using the same offline verification tool.
The lineage section shows the custody history for auditor information.

## Important Note

Custody transfer is a governance operation, not a cryptographic operation.
The evidence record itself is never modified.

---
This document does not constitute legal advice.
Generated: {datetime.utcnow().isoformat()}
"""


def generate_court_transfer_explanation() -> str:
    """Generate COURT_TRANSFER_EXPLANATION.md content."""
    return f"""# Court Transfer Explanation

## Context

This document explains how evidence records are handled when transferred pursuant to a court order.

## Process

1. **Court Order Received**: Legal department receives court-ordered transfer
2. **Transfer Initiated**: Custody transfer request created with reason: court_order
3. **Transfer Executed**: Visibility and billing moved to receiving party
4. **Original Record Preserved**: No modification to cryptographic record

## What Courts and Regulators Should Understand

### Origin is Immutable

The original recording cannot be altered. Even after custody transfer:

- Original organization name is preserved
- Original recording timestamp is preserved
- Original decision hash is preserved

### Verification Remains Valid

Proofs exported before, during, or after the transfer verify identically.
The offline verifier does not depend on custody information.

### Lineage is Transparent

The full custody history is available in the proof bundle's lineage section.
This includes:

- All transfers with timestamps
- Reasons for each transfer
- Approval workflow records

## For Court Records

When presenting evidence from a transferred custody:

1. The proof bundle contains the original recording metadata
2. The lineage section documents the custody chain
3. Verification confirms the record has not been tampered with

---
This document does not constitute legal advice.
Generated: {datetime.utcnow().isoformat()}
"""


def generate_insolvency_note() -> str:
    """Generate documentation for insolvency scenarios."""
    return f"""# Evidence Handling During Insolvency

## Scenario

When an organization becomes insolvent, its decision records may need to be transferred to:

- Acquiring entities
- Regulatory bodies
- Designated custodians

## Guarantees During Insolvency Transfer

### 1. Records Remain Valid

Even if the original recording organization ceases to exist:

- All proofs remain cryptographically valid
- Offline verification continues to work
- No dependency on original organization's systems

### 2. Original Authorship Preserved

The record permanently shows:

- Original organization's identity (even if dissolved)
- Original recording timestamp
- Original project context

### 3. Custody Transfer Documented

The insolvency transfer is recorded with:

- Reason: insolvency
- Receiving party information
- Transfer timestamp

## For Regulators

Decision records created by an insolvent organization:

1. Can be exported by the new custodian
2. Contain original authorship information
3. Verify identically to pre-insolvency exports
4. Do not depend on the original organization's continued existence

---
This document does not constitute legal advice.
Generated: {datetime.utcnow().isoformat()}
"""
