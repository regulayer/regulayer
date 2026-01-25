# Enforcement Boundaries

## Purpose

This document defines what each layer CAN and CANNOT enforce.
It becomes court-grade evidence of separation of concerns.

---

## Core Principle

> **Only the Recorder touches cryptographic truth.**
> **Everything else is operational or presentational.**

---

## Enforcement Matrix

| Layer | Can Enforce | Cannot Enforce |
|-------|-------------|----------------|
| Gateway | Billing, rate limits, auth | Truth, ordering, validity |
| UI | Visibility, presentation | Evidence, proofs |
| Governance | Review state, annotations | Proof validity, hashes |
| Recorder | Cryptography, chain | Billing, access, policy |
| Verifier | Math only | Access, governance |
| Billing | Payment, quotas | Truth, recording |

---

## Layer Details

### Gateway

```yaml
layer: gateway
role: Access control and traffic management

can_enforce:
  - authentication
  - authorization
  - rate_limiting
  - request_validation
  - billing_eligibility

cannot_enforce:
  - record_validity
  - chain_ordering
  - cryptographic_properties
  - proof_correctness
```

**Why**: Gateway is a traffic cop, not a judge.

### UI / Web Dashboard

```yaml
layer: ui
role: Presentation and user interaction

can_enforce:
  - visibility_filters
  - user_preferences
  - display_formatting
  - navigation_paths

cannot_enforce:
  - evidence_validity
  - record_content
  - proof_properties
  - cryptographic_state
```

**Why**: UI displays truth, it doesn't define it.

### Governance Overlay

```yaml
layer: governance
role: Organizational workflow and review

can_enforce:
  - review_state
  - annotations
  - access_control
  - visibility_rules
  - retention_metadata

cannot_enforce:
  - record_hash
  - attestation_signature
  - chain_position
  - proof_validity
```

**Why**: Governance is a lens, not a filter.

### Decision Recorder

```yaml
layer: recorder
role: Cryptographic truth creation

can_enforce:
  - hash_computation
  - chain_linking
  - attestation_signing
  - sequence_ordering
  - append_only_semantics

cannot_enforce:
  - billing_decisions
  - access_policies
  - governance_state
  - business_logic
```

**Why**: Recorder is pure cryptography.

### Verifier

```yaml
layer: verifier
role: Mathematical verification

can_enforce:
  - hash_correctness
  - signature_validity
  - chain_integrity
  - pass_fail_determination

cannot_enforce:
  - access_control
  - governance_state
  - billing_status
  - visibility_rules
```

**Why**: Math doesn't care about permissions.

### Billing

```yaml
layer: billing
role: Commercial operations

can_enforce:
  - payment_status
  - usage_quotas
  - feature_access
  - plan_limits

cannot_enforce:
  - record_validity
  - proof_correctness
  - chain_integrity
  - verification_results
```

**Why**: Money doesn't change math.

---

## Cross-Layer Guarantees

### Cryptographic Layer Isolation

```
┌─────────────────────────────────────────────────┐
│         OPERATIONAL LAYER                        │
│   Gateway, UI, Governance, Billing               │
│   CAN: restrict access, visibility, features    │
│   CANNOT: affect cryptographic properties       │
├─────────────────────────────────────────────────┤
│         CRYPTOGRAPHIC LAYER                      │
│   Recorder, Verifier, Chain                      │
│   CAN: create and verify proofs                 │
│   CANNOT: enforce business rules                │
└─────────────────────────────────────────────────┘
```

### Properties Preserved Across Layers

| Property | Where Created | Where Verified | Never Modified By |
|----------|---------------|----------------|-------------------|
| record_hash | Recorder | Verifier | Gateway, UI, Governance |
| signature | Recorder | Verifier | Gateway, UI, Governance |
| chain_position | Recorder | Verifier | Gateway, UI, Governance |
| previous_hash | Recorder | Verifier | Gateway, UI, Governance |

---

## Violations and Detection

### Layer Violation Examples

| Violation | Detection | Response |
|-----------|-----------|----------|
| Gateway modifies payload | Hash mismatch | Alert, reject |
| UI filters chain records | Verification gap | Alert |
| Governance edits record | Signature invalid | Alert, reject |
| Billing blocks verification | Architecture error | Design fix |

### Enforcement

Layer boundaries are enforced by:
1. **Code separation**: Different services
2. **Access controls**: Limited permissions
3. **Cryptographic detection**: Verification catches violations
4. **Auditing**: Logs at boundaries

---

## Regulatory Implications

### What This Means for Auditors

- **Clear responsibility**: Each layer has explicit scope
- **Tamper detection**: Cryptographic layer catches violations
- **Evidence integrity**: Operational layers cannot corrupt proofs

### What This Means for Courts

- **Access denial ≠ Evidence tampering**: Hiding a record doesn't change its validity
- **Billing ≠ Truth**: Non-payment affects access, not cryptographic properties
- **Governance ≠ Proof**: Annotations don't affect verification

---

## Summary Table

| Question | Answer |
|----------|--------|
| Can Gateway affect proof validity? | **NO** |
| Can UI affect record content? | **NO** |
| Can Governance affect chain? | **NO** |
| Can Billing affect verification? | **NO** |
| Can non-payment invalidate proofs? | **NO** |
| Can access denial change evidence? | **NO** |

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
