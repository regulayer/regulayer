# Governance Separation Invariants

## Purpose

This document proves that governance operations NEVER affect cryptographic truth.
This is the boundary auditors must verify is inviolate.

---

## INVARIANT: Governance Cannot Modify Hashes

**CLAIM**: No governance operation (RBAC, deletion, annotation) can modify a record's hash.

**VIOLATION**: If this were false, governance could alter evidence.

**TEST**:
1. Record decision, capture hash H1
2. Perform governance operations:
   - Add annotations
   - Change visibility
   - Apply retention policy
   - Transfer custody
3. Re-export proof bundle
4. Hash MUST equal H1

---

## INVARIANT: Deletion Does Not Delete

**CLAIM**: "Deletion" hides visibility; it never removes cryptographic records.

**VIOLATION**: If this were false, deletion would destroy evidence.

**TEST**:
1. Record decision
2. Request deletion
3. Decision hidden from UI
4. Export proof bundle with explicit decision ID
5. Proof bundle contains complete record
6. Verification passes

---

## INVARIANT: RBAC Does Not Affect Proofs

**CLAIM**: Access control determines who can view, not what exists.

**VIOLATION**: If this were false, RBAC could suppress evidence.

**TEST**:
1. User A records decision
2. User B cannot view (RBAC)
3. User A exports proof bundle
4. User B receives proof bundle
5. User B can verify (no RBAC in verification)

---

## INVARIANT: Annotations Are Separate

**CLAIM**: Governance annotations are stored separately from cryptographic records.

**VIOLATION**: If this were false, annotations could contaminate evidence.

**TEST**:
1. Record decision with hash H1
2. Add governance annotations (tags, notes)
3. Proof bundle contains only cryptographic data
4. Hash still H1
5. Annotations in separate governance layer

---

## INVARIANT: Retention Does Not Affect Crypto

**CLAIM**: Retention policies affect governance data, never cryptographic records.

**VIOLATION**: If this were false, retention could destroy proofs.

**TEST**:
1. Set retention policy: 30 days
2. Record decision
3. Wait > 30 days
4. Governance metadata may be archived
5. Cryptographic record and proof still valid
6. Export and verify → passes

---

## INVARIANT: Custody Transfer Preserves Origin

**CLAIM**: Transferring custody never changes the original recording metadata.

**VIOLATION**: If this were false, transfers could rewrite history.

**TEST**:
1. Org A records decision at time T1
2. Custody transferred to Org B at time T2
3. Proof bundle shows origin: Org A, time T1
4. Origin cannot be modified by Org B
5. Hash unchanged

---

## INVARIANT: Provenance Links Are Metadata

**CLAIM**: Provenance links between decisions are contextual, not cryptographic.

**VIOLATION**: If this were false, links could create false dependencies.

**TEST**:
1. Decision A exists with hash HA
2. Decision B exists with hash HB
3. Create provenance link A → B
4. HA unchanged, HB unchanged
5. Remove link → HA, HB still valid
6. Each decision independently verifiable

---

## Boundary Visualization

```
┌─────────────────────────────────────────────────────────┐
│                   GOVERNANCE LAYER                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │   RBAC   │  │ Deletion │  │Annotations│  │Provenance│ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
├─────────────────────────────────────────────────────────┤
│                    IMMUTABLE BOUNDARY                    │
│              (This line cannot be crossed)               │
├─────────────────────────────────────────────────────────┤
│                 CRYPTOGRAPHIC LAYER                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Hashes  │  │Signatures│  │  Chain   │  │  Proofs  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Auditor Verification

Auditors should verify:

1. **Code inspection**: No governance code path writes to crypto tables
2. **Database schema**: Crypto tables have no FK to governance tables
3. **API analysis**: No governance endpoint modifies crypto data
4. **Integration test**: All governance operations → hash unchanged

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
