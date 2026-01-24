# Regulayer Deployment Modes

## Core Principle

> **Deployment choices must not affect cryptographic truth.**
> **Isolation is operational — trust remains universal.**

---

## Mode 1: SaaS (Multi-Tenant)

**Default: regulayer.io**

| Aspect | Details |
|--------|---------|
| Infrastructure | Regulayer-managed |
| Ingestion | api.regulayer.io |
| Storage | Shared (isolated) |
| Verification | Universal |

**Customer controls:**
- API keys
- Projects
- Quotas

**Regulayer controls:**
- Infrastructure
- Availability
- Updates

---

## Mode 2: Dedicated VPC

**Single-tenant cloud deployment**

| Aspect | Details |
|--------|---------|
| Infrastructure | Isolated VPC per customer |
| Ingestion | customer.regulayer.io |
| Storage | Dedicated database |
| Verification | Universal |

**Customer controls:**
- Network ACLs
- Region selection
- Scaling

**Regulayer controls:**
- Software updates
- Security patches
- SLA

---

## Mode 3: Hybrid

**Customer ingress → Regulayer recorder**

| Aspect | Details |
|--------|---------|
| Ingestion Gateway | Customer-hosted |
| Recorder | Regulayer-managed |
| Storage | Regulayer-managed |
| Verification | Universal |

**Customer controls:**
- Ingestion layer
- Rate limiting
- Pre-processing (NOT hashing)

**Regulayer controls:**
- Cryptographic operations
- Chain integrity
- Attestation

---

## Mode 4: On-Prem Verify

**Proof verification only**

| Aspect | Details |
|--------|---------|
| Ingestion | Not applicable |
| Recorder | Not applicable |
| Verification | Customer-hosted |
| Proofs | Exported from SaaS |

**Use case:**
- Air-gapped environments
- Compliance verification
- Legal proceedings

**Customer controls:**
- Everything (verifier is standalone)

---

## Verification Remains Universal

Regardless of deployment mode:

✅ Proofs export identically
✅ Offline verification works the same
✅ Ed25519 signatures verify anywhere
✅ Hash chains are deterministic

**The deployment model is operational. The trust model is universal.**
