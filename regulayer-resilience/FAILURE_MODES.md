# Regulayer Failure Modes

## Core Principle

> **Availability may degrade — trust must not.**
> **Outages are allowed. Ambiguity is not.**

---

## Failure Classification

| Failure | Impact | Trust Impact |
|---------|--------|--------------|
| Gateway Down | Ingestion paused | None |
| Queue Saturated | Ingestion delayed | None |
| Recorder Down | Writes fail | None (queue buffers) |
| Region Offline | Region unavailable | None |
| Attestation Down | Signing delayed | None |
| Database Down | Writes fail | None |

---

## Detailed Failure Modes

### 1. Ingestion Gateway Failure

**Symptoms:**
- 503 errors on `/v1/ingest/decision`
- Health check fails

**Behavior:**
- SDK retries with backoff
- Requests queue client-side
- No data loss if SDK handles retries

**Trust Impact:** None. No records created = no false claims.

---

### 2. Queue System Failure

**Symptoms:**
- Gateway accepts but queue fails
- Increased latency

**Behavior:**
- Gateway returns 503
- Circuit breaker activates
- No partial writes

**Trust Impact:** None. Failed enqueue = honest failure response.

---

### 3. Recorder Failure

**Symptoms:**
- Queue grows
- Records not appearing

**Behavior:**
- Queue buffers up to limit
- Order preserved per project
- Recovery replays in order

**Trust Impact:** None. Delayed ≠ compromised.

---

### 4. Regional Outage

**Symptoms:**
- Entire region unreachable
- Failover triggers (if configured)

**Behavior:**
- Traffic redirects to backup region
- Queue drains to surviving recorder
- Order preserved within project

**Trust Impact:** None. Proofs from either region verify identically.

---

### 5. Attestation Service Failure

**Symptoms:**
- Records created but unsigned
- Export shows unsigned records

**Behavior:**
- Records still hashed and chained
- Attestation retries on recovery
- Unsigned records flagged

**Trust Impact:** Reduced (no signature) but hash chain intact.

---

## What Cannot Fail

| Guarantee | Why |
|-----------|-----|
| Hash integrity | Computed locally, deterministic |
| Chain linking | Previous hash included |
| Proof verification | Works offline |
| Export correctness | Deterministic bundle |

---

## Recovery Invariants

1. **No gaps**: Every sequence number accounted for
2. **No reordering**: Per-project order preserved
3. **No duplication**: Idempotency enforced
4. **No silent loss**: DLQ captures all failures
