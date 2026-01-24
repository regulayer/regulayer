# Regulayer Production Architecture

## Core Principle

> **Operations may fail. Trust must not.**
> **Production infrastructure must never introduce ambiguity into cryptographic truth.**

---

## Service Topology

```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │   WAF / DDoS    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │    Public NLB    │
                    └────────┬────────┘
                             │
┌────────────────────────────┼────────────────────────────┐
│  PUBLIC SUBNET             │                             │
│            ┌───────────────▼───────────────┐            │
│            │    Ingestion Gateway (EKS)    │            │
│            │    (rate limit, quota, auth)  │            │
│            └───────────────┬───────────────┘            │
└────────────────────────────┼────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────┐
│  PRIVATE SUBNET            │                             │
│            ┌───────────────▼───────────────┐            │
│            │      Redis (Queue)            │            │
│            └───────────────┬───────────────┘            │
│                            │                             │
│            ┌───────────────▼───────────────┐            │
│            │    Decision Recorder (EKS)    │◄───────┐   │
│            │    (hash chain, attestation)  │        │   │
│            └───────────────┬───────────────┘        │   │
│                            │                         │   │
│            ┌───────────────▼───────────────┐        │   │
│            │    PostgreSQL (RDS)           │        │   │
│            │    (decisions, chain state)   │        │   │
│            └───────────────────────────────┘        │   │
│                                                      │   │
│            ┌───────────────────────────────┐        │   │
│            │    Control Plane (EKS)        │────────┘   │
│            │    (projects, keys, orgs)     │            │
│            └───────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ISOLATED SUBNET (HSM Boundary)                          │
│            ┌───────────────────────────────┐            │
│            │    Attestation Service        │            │
│            │    (Ed25519 signing)          │            │
│            └───────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

---

## Network Tiers

| Tier | Services | Access |
|------|----------|--------|
| Public | Gateway, Web | Internet |
| Private | Recorder, Queue, Control | Internal only |
| Isolated | Attestation, KMS | HSM boundary |

---

## Service Independence

| Service | Can fail without breaking trust? |
|---------|----------------------------------|
| Gateway | ✅ Yes (queue buffers) |
| Queue | ✅ Yes (gateway returns 503) |
| Control Plane | ✅ Yes (existing keys work) |
| Billing | ✅ Yes (grace period) |
| Recorder | ⚠️ Delays, no loss |
| Attestation | ⚠️ Unsigned until recovery |

---

## Key Guarantees

1. **Recorder never exposed publicly**
2. **Gateway can die without data loss**
3. **Proofs work even if Regulayer is down**
4. **Each environment is fully isolated**
