# Regulayer Incident Trust Model

Version: 1.0.0  
Status: NORMATIVE

---

## Purpose

This document defines what incidents can affect, what they cannot affect, and the legal boundaries of incident disclosure.

---

## Core Principle

> **Incidents do NOT rewrite facts.**

Evidence is never deleted or altered. Trust degradation is explicit, scoped, and timestamped.

---

## What Incidents CAN Affect

| Component | Impact Type | Example |
|-----------|-------------|---------|
| SDK | Recording reliability | Client SDK bug causing duplicate records |
| Recorder | Storage integrity | Database corruption event |
| Signing Keys | Attestation validity | Key compromise |
| Governance | Metadata reliability | Workflow logic error |
| Infrastructure | Availability | Outage affecting recording |

---

## What Incidents CANNOT Affect

| Property | Why |
|----------|-----|
| Cryptographic proofs | Mathematical facts don't change |
| Historical record bytes | Data is immutable |
| Timestamp ordering | Established at creation |
| Hash linkage | Mathematical relationship |

---

## Trust Status Definitions

### TRUSTED
- No incident overlap
- Evidence fully reliable
- No caveats required

### DEGRADED
- Evidence is cryptographically valid
- Trust context is caveated
- Additional scrutiny recommended

### UNTRUSTED
- Evidence integrity may be compromised
- Independent verification required
- Cryptographic proofs still verifiable

### OUT_OF_SCOPE
- Incident does not apply to this evidence
- No impact from declared incident

---

## Incident Scoping Rules

An incident affects a decision if ALL of the following match:

1. **Time Scope**: Decision falls within affected time range
2. **Identity Scope**: Decision's attester is in affected identities (if specified)
3. **Component Scope**: Decision's pathway includes affected component

If any scope doesn't match, decision is OUT_OF_SCOPE.

---

## Immutability Rules

### Incidents
- Once declared, cannot be modified
- New mitigations are separate records
- Original declaration preserved

### Evidence
- Never deleted or altered
- Trust status is metadata overlay
- Cryptographic facts unchanged

### Disclosure
- Generated at request time
- Deterministic from inputs
- Archived copies are valid

---

## Regulator Implications

### What Regulators Can Rely On
- Incident timeline is accurate
- Affected scope is clearly defined
- Unaffected evidence is still trusted

### What Regulators Should Verify
- Cryptographic proofs (independently)
- Scope applicability to their case
- Current mitigation status

---

## Legal Boundaries

Disclosure documents state:

> "This disclosure does not invalidate unaffected records.
> Affected records retain cryptographic integrity but trust context is caveated."

**What this means:**
- Math still works
- Trust assessment is updated
- Facts are not erased

---

**END OF INCIDENT TRUST MODEL**
