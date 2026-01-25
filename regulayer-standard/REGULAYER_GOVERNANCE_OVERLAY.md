# Governance Overlay Standard

## Document Status

| Property | Value |
|----------|-------|
| Standard Version | 1.0.0 |
| Status | Stable |
| Last Updated | 2026-01-25 |
| Normative | Yes |

---

## Abstract

This document defines how governance metadata overlays cryptographic evidence
without affecting its integrity. It establishes the separation between
cryptographic truth and organizational policy.

---

## 1. Scope

This standard defines:
- Governance overlay structure
- Relationship to cryptographic evidence
- Allowed overlay operations

This standard does NOT define:
- Access control implementation
- Retention policy enforcement
- Organization-specific policies

---

## 2. Fundamental Principle

> **Governance overlays NEVER affect cryptographic evidence.**

Governance operations:
- ✅ MAY modify visibility
- ✅ MAY modify access control
- ✅ MAY modify metadata
- ❌ SHALL NOT modify hashes
- ❌ SHALL NOT modify signatures
- ❌ SHALL NOT modify chain links

---

## 3. Overlay Structure

### 3.1 Overview

A governance overlay is metadata that sits ABOVE the cryptographic layer:

```
┌─────────────────────────────┐
│    GOVERNANCE OVERLAY       │  ← Policy, visibility, metadata
├─────────────────────────────┤
│    CRYPTOGRAPHIC LAYER      │  ← Hashes, signatures, chain
└─────────────────────────────┘
```

### 3.2 Overlay Fields

| Field | Type | Description |
|-------|------|-------------|
| decision_id | string | Reference to underlying record |
| annotations | array | User-added metadata |
| access_control | object | Visibility and permission rules |
| retention | object | Retention policy information |
| classifications | array | Organizational classifications |

---

## 4. Overlay Types

### 4.1 Annotations

Annotations are user-added metadata:

```json
{
  "annotations": [
    {
      "type": "note",
      "content": "Reviewed by legal team",
      "added_by": "user_123",
      "added_at": "2026-01-20T10:00:00Z"
    }
  ]
}
```

Annotations:
- ✅ Can be added, modified, removed
- ❌ Do not affect record_hash
- ❌ Do not affect signatures

### 4.2 Access Control

Access control defines visibility:

```json
{
  "access_control": {
    "visibility": "team",
    "allowed_roles": ["admin", "auditor"],
    "hidden": false
  }
}
```

Access control:
- ✅ Controls who can view records
- ❌ Does not prevent export to authorized users
- ❌ Does not affect cryptographic validity

### 4.3 Retention

Retention policies define data lifecycle:

```json
{
  "retention": {
    "policy_id": "standard-7-year",
    "expires_at": "2033-01-15T00:00:00Z",
    "applies_to": "governance_metadata_only"
  }
}
```

Retention:
- ✅ Controls governance metadata lifecycle
- ❌ NEVER affects cryptographic records
- ❌ Proof validity is permanent

### 4.4 Classifications

Classifications organize records:

```json
{
  "classifications": [
    {"type": "sensitivity", "value": "internal"},
    {"type": "category", "value": "lending-decisions"}
  ]
}
```

Classifications:
- ✅ Enable filtering and organization
- ❌ Do not affect cryptographic properties

---

## 5. Separation Guarantees

### 5.1 Hash Invariance

For any governance operation G on record R:

```
record_hash(R) after G = record_hash(R) before G
```

The hash SHALL NOT change.

### 5.2 Signature Invariance

For any governance operation G:

```
verify(signature) after G = verify(signature) before G
```

Signature validity SHALL NOT be affected.

### 5.3 Chain Invariance

For any governance operation G:

```
chain_integrity after G = chain_integrity before G
```

Chain links SHALL NOT be affected.

---

## 6. Deletion Semantics

### 6.1 Definition

"Deletion" in governance context means hiding from view.

### 6.2 What Deletion Does

- Removes record from default views
- Marks record as hidden in governance layer
- MAY prevent access by certain roles

### 6.3 What Deletion Does NOT Do

- Does NOT delete the cryptographic record
- Does NOT break the chain
- Does NOT invalidate proofs
- Does NOT prevent authorized export

### 6.4 Export Under Deletion

When exporting a "deleted" record:

```json
{
  "governance_overlay": {
    "visibility_status": "hidden",
    "hidden_at": "2026-01-20T00:00:00Z"
  },
  "decision": { ... },
  "attestation": { ... },
  "chain_position": { ... },
  "verification": {
    "verifiable_offline": true,
    "note": "Record hidden but cryptographically valid"
  }
}
```

---

## 7. Custody Transfer

### 7.1 Definition

Custody transfer changes organizational ownership.

### 7.2 What Transfers

- Access control
- Billing responsibility
- Governance metadata

### 7.3 What Does NOT Transfer

- Original authorship
- Recording timestamp
- Record hash
- Attestation

### 7.4 Origin Preservation

```json
{
  "origin": {
    "organization_id": "org_original",
    "recorded_at": "2026-01-15T14:30:00Z"
  },
  "current_custody": {
    "organization_id": "org_new",
    "transferred_at": "2026-01-20T00:00:00Z"
  }
}
```

Origin is IMMUTABLE despite custody transfer.

---

## 8. Verification Implications

### 8.1 Offline Verification

Offline verification examines only:
- Decision record
- Attestation
- Chain position

Governance overlays are NOT required for verification.

### 8.2 Governance-Aware Verification

Systems MAY check governance status, but:
- Governance does not affect cryptographic validity
- Hidden records are still cryptographically valid
- Expired retention does not invalidate proofs

---

## 9. Conformance

An implementation conforms to this standard if it:

1. Maintains separation per Section 5
2. Implements deletion per Section 6
3. Preserves origin per Section 7
4. Supports verification per Section 8

---

## Appendix A: Trust Statement

This standard guarantees:

> **Cryptographic records are never modified by governance operations.**

This is the foundational promise that enables regulatory and legal trust.
