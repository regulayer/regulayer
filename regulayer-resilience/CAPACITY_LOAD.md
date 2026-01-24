# Regulayer Capacity & Load Behavior

## Capacity Assumptions

| Dimension | Design Target | Burst Capacity |
|-----------|---------------|----------------|
| Decisions/second | 10,000 | 50,000 |
| Projects/org | 100 | 1,000 |
| Payload size | 64 KB | 1 MB |
| Queue depth | 1M messages | 10M messages |

---

## Load Behavior

### Normal Load (< 80% capacity)

- All requests processed synchronously
- p99 latency < 100ms
- No rate limiting triggered

### Elevated Load (80-100% capacity)

- Queuing begins
- p99 latency increases to < 1s
- Rate limiting protects stability

### Overload (> 100% capacity)

- Rate limiting active
- Some requests rejected (429)
- Queue depth grows
- Backpressure propagates

---

## Backpressure Behavior

### Layer 1: Rate Limiting

Per-key token bucket:
- Bucket fills at 100 req/s (default)
- Burst capacity: 1000 tokens
- Exceeded → 429 + Retry-After

### Layer 2: Quota

Per-project daily limit:
- Free: 1,000 decisions/day
- Pro: 100,000 decisions/day
- Enterprise: Unlimited

Exceeded → 429 + reset time

### Layer 3: Queue Saturation

If queue exceeds depth limit:
- Gateway returns 503
- Circuit breaker opens
- Gradual recovery

---

## What Happens Under 10x Traffic

1. **Minute 0-1**: Rate limiting activates
2. **Minute 1-5**: Queue grows, latency increases
3. **Minute 5+**: Steady state at reduced throughput
4. **Recovery**: Queue drains, latency normalizes

**Trust impact**: None. Throttled ≠ compromised.

---

## Why Crypto Truth is Unaffected

| Concern | Answer |
|---------|--------|
| Dropped requests? | No proof created = honest |
| Reordered requests? | Queue preserves order |
| Duplicate records? | Idempotency prevents |
| Corrupted payloads? | Hash verification detects |

---

## Load Testing Evidence

| Test | Result |
|------|--------|
| Sustained 10k rps | ✅ Stable |
| Burst to 50k rps | ✅ Graceful degradation |
| 1M queued messages | ✅ Recovered in 15 min |
| 100 concurrent projects | ✅ No cross-impact |

> **Scale is operational. Trust is unchanged.**
