# Scale Limits & Backpressure

## Core Principle

> **When overwhelmed, Regulayer slows down — it never guesses.**

---

## Truth-Safe Scale Boundaries

| Metric | Value | Behavior Under Pressure |
|--------|-------|------------------------|
| Max ingest burst | 10,000 rps | Backpressure, queue |
| Sustained ingest | 5,000 rps | Normal processing |
| Queue depth | 1,000,000 messages | Reject new, preserve existing |
| Recorder throughput | 2,000 rps | Backpressure to queue |
| Export concurrency | 100 parallel | Queue additional requests |
| Verification | Unlimited* | Pure computation |

*Verification is CPU-bound only, no state mutation.

---

## Overload Behavior

### Stage 1: Normal Operation

```
Ingest rate < capacity
Queue depth < threshold
Processing delay < SLA

Result: Normal operation
```

### Stage 2: Pressure

```
Ingest rate approaches capacity
Queue depth rising
Processing delay within SLA

Action: No degradation
Monitoring: Alert on trend
```

### Stage 3: Backpressure

```
Ingest rate exceeds capacity
Queue depth at threshold
Processing delay approaching SLA

Action:
- Gateway returns 429 (Too Many Requests)
- Client-side backoff
- Queue drains to safe level
- Recording continues at capacity
```

### Stage 4: Overload Protection

```
Ingest rate far exceeds capacity
Queue depth at limit
Processing delay exceeds SLA

Action:
- New ingestion rejected
- Existing queue processes
- Recording continues
- No data corruption
```

---

## Backpressure Mechanism

### Gateway Level

```python
async def handle_ingest(request):
    if queue_depth() > MAX_QUEUE_DEPTH:
        return Response(
            status=503,
            body={"error": "Service temporarily unavailable"},
            headers={"Retry-After": "30"}
        )
    
    if rate_limit_exceeded(request.org_id):
        return Response(
            status=429,
            body={"error": "Rate limit exceeded"},
            headers={"Retry-After": calculate_retry_after()}
        )
    
    # Normal processing
    return await process(request)
```

### Queue Level

```python
async def enqueue(message):
    if queue.size() >= MAX_QUEUE_SIZE:
        raise QueueFullError("Queue at capacity")
    
    await queue.put(message)
```

---

## What NEVER Happens Under Overload

| Dangerous Behavior | Status |
|--------------------|--------|
| Dropping messages silently | ❌ Never |
| Partial recording | ❌ Never |
| Reordering records | ❌ Never |
| Corrupting chain | ❌ Never |
| Skipping attestation | ❌ Never |
| Guessing sequence numbers | ❌ Never |

---

## Rate Limiting

### Per-Organization Limits

| Tier | Rate Limit | Burst |
|------|------------|-------|
| Free | 10 rps | 100 |
| Standard | 100 rps | 1,000 |
| Enterprise | 1,000 rps | 10,000 |
| Custom | Negotiated | Negotiated |

### Implementation

```python
def check_rate_limit(org_id: str) -> bool:
    limit = get_org_limit(org_id)
    current = get_current_rate(org_id)
    
    if current >= limit.rate:
        if current < limit.burst:
            # Allow burst
            return True
        return False
    return True
```

---

## Queue Sizing

### Calculation

```
Queue capacity = (Max delay acceptable) × (Recorder throughput)

Example:
  Max delay: 5 minutes = 300 seconds
  Recorder throughput: 2,000 rps
  Queue capacity: 300 × 2,000 = 600,000 messages
```

### Buffer

Queue sized at 1,000,000 to provide safety margin.

---

## Horizontal Scaling

### What Scales

| Component | Scaling Strategy |
|-----------|-----------------|
| Gateway | Horizontal (stateless) |
| Queue | Partitioned by project |
| Recorder | Per-project sharding |
| Storage | Distributed database |
| Export | Horizontal (stateless) |

### What Doesn't Scale (By Design)

| Component | Reason |
|-----------|--------|
| Per-project writer | Ordering requires serialization |
| Chain head | Single source of truth |

---

## Monitoring Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Queue depth | 60% | 80% | Page on-call |
| Ingest latency | 500ms | 1s | Investigate |
| Error rate | 1% | 5% | Investigate |
| Recorder lag | 10s | 60s | Scale/investigate |

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
