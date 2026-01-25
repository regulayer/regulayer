# Chaos Scenarios

## Core Principle

> **Failures may delay ingestion. Failures may degrade availability.**
> **Failures may NEVER corrupt, reorder, or ambiguate evidence.**

---

## Chaos Engineering Approach

Each scenario documents:
1. **Preconditions** - System state before failure
2. **Failure Injected** - What breaks
3. **Expected Outcome** - Correct behavior
4. **Evidence of Non-Ambiguity** - How we prove trust is intact

---

## Scenario 1: Gateway Kill

### Preconditions
- Normal operation
- Active ingest traffic
- Queue and recorder healthy

### Failure Injected
- Gateway process terminated abruptly
- All connections dropped

### Expected Outcome

| Aspect | Result |
|--------|--------|
| In-flight requests | Fail with timeout |
| Queue | No new messages |
| Recorder | Idle |
| Existing records | **Unchanged** |
| Partial records | **None** (gateway has no crypto role) |

### Evidence of Non-Ambiguity
- Chain length unchanged
- Last sequence number unchanged
- No orphaned records
- Verification passes for all existing records

---

## Scenario 2: Queue Partition

### Preconditions
- Normal operation
- Multiple projects ingesting
- Queue has pending messages

### Failure Injected
- Network partition between queue and recorder
- Messages buffered but not delivered

### Expected Outcome

| Aspect | Result |
|--------|--------|
| Buffered messages | Retained in queue |
| Delivery | Delayed, not lost |
| Order | Preserved per-project |
| Existing records | **Unchanged** |

### Evidence of Non-Ambiguity
- After recovery: messages delivered in order
- Sequence numbers continue correctly
- Previous hash links correctly
- No gaps in chain

---

## Scenario 3: Recorder Crash

### Preconditions
- Recorder processing a record
- Write in progress

### Failure Injected
- Recorder process killed mid-write
- Database connection severed

### Expected Outcome

| Aspect | Result |
|--------|--------|
| In-progress record | **Not committed** |
| Queue message | Retained for retry |
| Chain | No half-written entries |
| Database | Transactional rollback |

### Evidence of Non-Ambiguity
- Chain ends at last fully committed record
- Hash chain verifies completely
- No partial records visible
- Retry creates complete record

### Transaction Guarantee
```
BEGIN TRANSACTION
  Compute hash
  Sign attestation
  Insert record
  Confirm insertion
COMMIT

If failure before COMMIT → nothing persisted
```

---

## Scenario 4: Duplicate Delivery

### Preconditions
- Message delivered to recorder
- Record committed successfully
- Queue retries same message (at-least-once)

### Failure Injected
- Network timeout made queue think delivery failed
- Same message delivered again

### Expected Outcome

| Aspect | Result |
|--------|--------|
| Duplicate detection | By idempotency key |
| Chain | **Unchanged** (duplicate rejected) |
| Response | Same record ID returned |
| Sequence | Not incremented |

### Evidence of Non-Ambiguity
- One record per idempotency key
- Chain length matches unique submissions
- Hash chain intact

---

## Scenario 5: Out-of-Order Arrival

### Preconditions
- Messages sent: A, B, C (in order)
- Network causes: B arrives before A

### Failure Injected
- Network reordering

### Expected Outcome

| Aspect | Result |
|--------|--------|
| Message B | Held (waiting for A) |
| Message A | Processed, then B released |
| Message C | Processed after B |
| Order | **Preserved** |

### Evidence of Non-Ambiguity
- Sequence numbers: A=n, B=n+1, C=n+2
- Previous hash: B links to A, C links to B
- Chain order matches submission order

---

## Scenario 6: Billing Failure

### Preconditions
- Organization active
- Normal ingest

### Failure Injected
- Billing service down or payment failed
- Organization frozen

### Expected Outcome

| Aspect | Result |
|--------|--------|
| New ingest | Blocked (policy) |
| Existing records | **Unchanged** |
| Export | **Still works** |
| Verification | **Still works** |

### Evidence of Non-Ambiguity
- Records from before freeze intact
- Proofs still verify
- Bundles still export
- Trust unaffected

---

## Scenario 7: Storage Corruption

### Preconditions
- Normal operation
- Records stored

### Failure Injected
- Bit flip in storage
- Record content corrupted

### Expected Outcome

| Aspect | Result |
|--------|--------|
| Corruption detected | Hash verification fails |
| Alerted | Yes |
| Recovery | Restore from replica/backup |
| Corrupted record | Marked invalid |

### Evidence of Non-Ambiguity
- Corruption is DETECTED, not hidden
- Hash mismatch is unambiguous
- Recovery restores valid state
- No silent corruption

---

## Scenario 8: Total Outage

### Preconditions
- All Regulayer services down
- Customer has exported bundles

### Failure Injected
- Complete cloud outage
- All services unavailable

### Expected Outcome

| Aspect | Result |
|--------|--------|
| New ingest | Impossible |
| Existing bundles | **Still verify offline** |
| Proofs | **Valid without Regulayer** |

### Evidence of Non-Ambiguity
- Reference verifier runs locally
- Bundle is self-contained
- Math doesn't need network
- Trust survives total outage

---

## Chaos Test Checklist

| Scenario | Tested | Result | Date |
|----------|--------|--------|------|
| Gateway Kill | ☐ | - | - |
| Queue Partition | ☐ | - | - |
| Recorder Crash | ☐ | - | - |
| Duplicate Delivery | ☐ | - | - |
| Out-of-Order Arrival | ☐ | - | - |
| Billing Failure | ☐ | - | - |
| Storage Corruption | ☐ | - | - |
| Total Outage | ☐ | - | - |

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
