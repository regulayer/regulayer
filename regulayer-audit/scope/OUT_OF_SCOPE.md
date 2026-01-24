# Out of Scope

## Purpose

This document explicitly defines what is NOT subject to cryptographic audit.
This protects Regulayer from audit overreach and sets clear expectations.

---

## EXPLICITLY OUT OF SCOPE

### 1. User Interface

| Exclusion | Rationale |
|-----------|-----------|
| Web application | UI is presentation layer only |
| Dashboard | Does not affect cryptographic truth |
| Settings pages | Configuration, not attestation |
| Visual styling | No security relevance |

### 2. Billing & Commercial

| Exclusion | Rationale |
|-----------|-----------|
| Payment processing | Third-party (Stripe) responsibility |
| Usage metering | Business metric, not evidence |
| Plan limits | Commercial constraint, not crypto |
| Subscription logic | No cryptographic relevance |

### 3. SaaS Operations

| Exclusion | Rationale |
|-----------|-----------|
| Uptime SLAs | Operational, not cryptographic |
| Deployment pipeline | Ops, not attestation logic |
| Monitoring systems | Observability, not trust |
| Infrastructure scaling | Capacity, not integrity |

### 4. Compliance Claims

| Exclusion | Rationale |
|-----------|-----------|
| GDPR compliance | Legal determination, not crypto |
| AI Act compliance | Regulatory interpretation |
| SOC2 certification | Audit standard, not Regulayer scope |
| Industry certifications | Third-party assessments |

### 5. Governance Layer

| Exclusion | Rationale |
|-----------|-----------|
| RBAC implementation | Policy, not attestation |
| Audit logging | Operational logs, not proofs |
| Retention policies | Data management, not crypto |
| Deletion semantics | Visibility, not chain integrity |

**Note**: The SEPARATION between governance and crypto IS in scope.

### 6. Customer Business Logic

| Exclusion | Rationale |
|-----------|-----------|
| What customers record | Content, not mechanism |
| Decision correctness | Business judgment |
| AI model quality | ML, not attestation |
| Use case validity | Application-specific |

### 7. Third-Party Integrations

| Exclusion | Rationale |
|-----------|-----------|
| SSO providers | Identity, delegated trust |
| Cloud providers | Infrastructure abstraction |
| CDN/networking | Transport layer |
| Email/notifications | Communication, not evidence |

---

## Why Out-of-Scope Matters

### Legal Protection

By explicitly excluding these areas:
- Auditors cannot expand scope mid-audit
- Findings are bounded to cryptographic claims
- Regulayer is not liable for excluded areas

### Audit Focus

Excluding non-cryptographic components:
- Keeps audit focused and efficient
- Reduces cost and timeline
- Improves finding quality

### Clear Communication

Enterprise customers understand:
- What the audit covers
- What it does not cover
- Where else to look for assurance

---

## Governance/Crypto Boundary

The **boundary** between governance and cryptography IS auditable:

| Question | In Scope |
|----------|----------|
| Does governance modify hashes? | ❌ Never (verifiable) |
| Does deletion affect proofs? | ❌ Never (verifiable) |
| Does RBAC affect chain? | ❌ Never (verifiable) |

The governance **implementation** is out of scope.
The governance **non-interference** is in scope.

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
| Status | Frozen |
