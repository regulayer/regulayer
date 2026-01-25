# Failure Propagation

## Core Principle

> **Availability failures are allowed. Ambiguity is not.**

Every failure mode results in a clear, unambiguous state.

---

## Failure Propagation Matrix

| Component Down | Ingest | Verify | Export | Trust Status |
|----------------|--------|--------|--------|--------------|
| Gateway | ❌ | ✅ | ✅ | **Intact** |
| Queue | ❌ | ✅ | ✅ | **Intact** |
| Recorder | ❌ | ⚠️ delayed | ⚠️ delayed | **Intact** |
| Governance | ✅ | ✅ | ✅ | **Intact** |
| Storage | ❌ | ❌ | ❌ | **Intact** |
| Billing | ❌ | ✅ | ✅ | **Intact** |
| All Regulayer | ❌ | ❌ | ❌ | **Offline verification works** |

---

## Component Failure Details

### Gateway Down

```
Impact:
  - New ingestion: BLOCKED
  - Existing records: UNAFFECTED
  - Verification: WORKS
  - Export: WORKS

Trust: INTACT
Reason: Gateway has no cryptographic role
```

### Queue Down

```
Impact:
  - New ingestion: BLOCKED (after gateway buffer)
  - Existing records: UNAFFECTED
  - Verification: WORKS
  - Export: WORKS

Trust: INTACT
Reason: Queue has no cryptographic role
```

### Recorder Down

```
Impact:
  - New ingestion: BLOCKED
  - Existing records: UNAFFECTED
  - Verification: DELAYED (new records not available)
  - Export: DELAYED (new records not available)

Trust: INTACT
Reason: Recorder creates, doesn't modify existing
```

### Governance Down

```
Impact:
  - New ingestion: WORKS
  - Existing records: UNAFFECTED
  - Verification: WORKS
  - Export: WORKS (without governance metadata)

Trust: INTACT
Reason: Governance is overlay, not cryptographic
```

### Storage Down

```
Impact:
  - New ingestion: BLOCKED (can't persist)
  - Existing records: UNAVAILABLE
  - Verification: BLOCKED (can't retrieve)
  - Export: BLOCKED (can't retrieve)

Trust: INTACT
Reason: Data is unavailable, not corrupted
Recovery: Restore from backup, chain re-validates
```

### Billing Down

```
Impact:
  - New ingestion: MAY BLOCK (policy decision)
  - Existing records: UNAFFECTED
  - Verification: WORKS
  - Export: WORKS

Trust: INTACT
Reason: Billing has no cryptographic role
```

### All Regulayer Down

```
Impact:
  - New ingestion: BLOCKED
  - Verification: OFFLINE WORKS
  - Export: USE EXISTING BUNDLES

Trust: INTACT
Reason: Proofs are self-contained
```

---

## Failure Behavior by Phase

### Ingestion Failures

| Failure Point | Behavior | Client Sees |
|---------------|----------|-------------|
| Gateway timeout | Client retries | 504 or timeout |
| Gateway reject | No retry | 4xx error |
| Queue full | Backpressure | 503 |
| Queue timeout | Gateway retries | 504 |
| Recorder reject | Dead letter | 4xx error |

### Verification Failures

| Failure Point | Behavior | Result |
|---------------|----------|--------|
| Bundle not found | Clear error | "Not found" |
| Bundle corrupted | Detection | "Invalid" |
| Hash mismatch | Detection | "Tampered" |
| Signature invalid | Detection | "Invalid signature" |
| Service unavailable | Offline mode | Use local verifier |

### Export Failures

| Failure Point | Behavior | Result |
|---------------|----------|--------|
| Record not found | Clear error | "Not found" |
| Partial chain | Reject | "Incomplete chain" |
| Storage timeout | Retry | Eventually succeeds or fails |

---

## Recovery Procedures

### Queue Recovery

```
1. Queue restarts
2. Unprocessed messages replayed
3. Idempotency keys prevent duplicates
4. Recorder validates sequence
5. Chain integrity preserved
```

### Recorder Recovery

```
1. Recorder restarts
2. Loads last committed sequence per project
3. Rejects any duplicate submissions
4. Continues from last committed record
5. No data loss, no ambiguity
```

### Storage Recovery

```
1. Restore from backup
2. Verify chain integrity for each project
3. Alerting on any gaps
4. Manual investigation for gaps
5. Trust remains intact (verification still works)
```

---

## Ambiguity Prevention

### State is Always Clear

| State | Meaning |
|-------|---------|
| NOT SUBMITTED | Client has not sent |
| SUBMITTED | Gateway received, ACK not guaranteed |
| ACCEPTED | Queue has message |
| COMMITTED | Record is immutable |
| FAILED | Explicit rejection |

### Never Ambiguous

- **No "maybe committed"**
- **No "partially recorded"**
- **No "lost in transit"** (unless explicit failure)

---

## Client Recommendations

### Retry Policy

```python
def submit_with_retry(claim, max_retries=3):
    for attempt in range(max_retries):
        try:
            result = submit(claim)
            if result.status == "accepted":
                return result.record_id
            elif result.status == "rejected":
                raise PermanentError(result.error)
        except TimeoutError:
            # Safe to retry due to idempotency
            continue
        except NetworkError:
            # Safe to retry due to idempotency
            continue
    
    raise MaxRetriesExceeded()
```

### Idempotency

Always include idempotency key:
- Same key → same outcome
- Retry is always safe
- No duplicate records

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
