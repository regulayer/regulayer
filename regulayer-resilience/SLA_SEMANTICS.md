# Regulayer SLA Semantics

## Purpose

This document defines the precise meaning of SLA terms.
Unambiguous language for unambiguous trust.

---

## Definitions

### "Available"

The system is **available** when:

- Ingestion gateway responds to health checks
- New decisions can be submitted
- Existing proofs can be exported

**Available does NOT mean:**
- Instant processing (queuing is acceptable)
- Zero latency (bounded latency is acceptable)

---

### "Delayed"

The system is **delayed** when:

- Ingestion is accepted but not immediately processed
- Queue depth exceeds normal bounds
- Attestation is pending

**Delayed guarantees:**
- No data loss
- Order preserved
- Eventually processed

---

### "Degraded"

The system is **degraded** when:

- Some components are unhealthy
- Latency exceeds SLA bounds
- Capacity is reduced

**Degraded guarantees:**
- Existing proofs remain valid
- Queue continues to buffer
- Recovery is in progress

---

### "Unavailable"

The system is **unavailable** when:

- Ingestion cannot accept new decisions
- Health checks fail
- API returns 503

**Unavailable guarantees:**
- Existing proofs STILL verify offline
- No new records created = no false claims
- Queue persists buffered data

---

### "Unverifiable" (Rare, Critical)

A record is **unverifiable** when:

- Hash chain is broken (tampering detected)
- Attestation signature fails
- Record is missing from chain

**This should never happen in normal operation.**
If detected, this triggers incident response.

---

## SLA Metrics

| Metric | Definition |
|--------|------------|
| Uptime | % of time Available or Delayed |
| Latency (p99) | Time from submit to recorded |
| Error rate | % of requests returning 5xx |

---

## What SLA Does NOT Cover

| Exclusion | Reason |
|-----------|--------|
| Proof validity | Proofs are math, not ops |
| Offline verification | Always works |
| Historical exports | Once exported, eternal |

---

## Credits

| Downtime | Credit |
|----------|--------|
| < 10 min | None |
| 10-60 min | 5% monthly |
| 1-4 hours | 10% monthly |
| > 4 hours | 25% monthly |

---

## The Fundamental Guarantee

> **SLA covers availability.**
> **Math covers truth.**
> **They are different things.**
