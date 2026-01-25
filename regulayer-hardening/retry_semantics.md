# Retry Semantics

## Overview

How retries work without mutation, forking, or corruption.

---

## Delivery Guarantees

### At-Least-Once Delivery ✅

Every message is delivered at least once.

| Property | Guarantee |
|----------|-----------|
| Message loss | None (persistent queue) |
| Delivery | Guaranteed (eventually) |
| Duplicates | Possible (handled by idempotency) |

### Why Not Exactly-Once?

Exactly-once delivery is impossible in distributed systems.
We achieve exactly-once **processing** via idempotency.

```
Delivery: At-least-once
Processing: Exactly-once (via idempotency)
```

---

## Retry Configuration

### Bounded Retries ✅

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Max retries | 5 | Prevent infinite loops |
| Initial backoff | 1 second | Allow transient recovery |
| Max backoff | 60 seconds | Cap delay |
| Backoff multiplier | 2x | Exponential growth |

### Retry Schedule

```
Attempt 1: Immediate
Attempt 2: +1s
Attempt 3: +2s
Attempt 4: +4s
Attempt 5: +8s
Dead letter: After 5 failures
```

---

## Poison Message Isolation ✅

### Definition

A poison message is one that consistently fails processing.

### Handling

```
if retry_count >= MAX_RETRIES:
    move_to_dead_letter_queue(message)
    alert("Poison message detected")
    continue_processing_other_messages()
```

### Guarantee

| Property | Guaranteed |
|----------|------------|
| Poison blocks queue | **No** |
| Poison affects other messages | **No** |
| Poison is logged | **Yes** |
| Poison is alerted | **Yes** |

---

## No Partial Commits ✅

### Transaction Boundary

```python
async def process_message(message):
    async with database.transaction():
        # All-or-nothing
        record = create_record(message.payload)
        store_record(record)
        update_chain_head(record)
        store_idempotency_key(message.idempotency_key, record.id)
        
        # Only after ALL succeed:
        await commit()
    
    # Only after commit:
    ack_message(message)
```

### Failure Scenarios

| Failure Point | Result |
|---------------|--------|
| Before commit | All changes rolled back |
| During commit | Transaction fails, rollback |
| After commit, before ack | Message retried, idempotency catches |

---

## Why Retries Cannot Fork Chains

### Proof

A fork requires two records with the same previous_hash:

```
     [R3]
    /
[R2]
    \
     [R3']  ← Fork

This requires:
R3.previous_hash == hash(R2)
R3'.previous_hash == hash(R2)
```

Retries cannot create forks because:

1. **Same message** → Same idempotency key → Returns existing R3
2. **Different message** → Different sequence number → R3'.sequence ≠ R3.sequence
3. **Concurrent submission** → Serialized by per-project lock

### Serialization

```python
# Per-project write lock
async with project_lock(project_id):
    # Only one writer at a time
    next_sequence = get_next_sequence(project_id)
    previous_hash = get_chain_head(project_id)
    
    record = create_record(
        payload,
        sequence=next_sequence,
        previous_hash=previous_hash
    )
```

---

## Why Retries Cannot Reorder Per-Project Chains

### Proof

Per-project ordering is enforced by:

1. **Queue partitioning** - One partition per project
2. **FIFO delivery** - Within partition
3. **Single writer** - Per-project lock

Retry of message N:
- Happens after original attempt of N
- Does not affect message N+1 (already delivered in order)
- Returns existing record (idempotency)

### Visualization

```
Original: [M1] → [M2] → [M3] → [M4]
           ↓      ↓      ↓      ↓
Chain:    [R1] → [R2] → [R3] → [R4]

Retry M2:
- M2 already processed
- Return R2
- Chain unchanged
- Order preserved
```

---

## Retry State Machine

```
┌─────────────┐
│   PENDING   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     Success      ┌─────────────┐
│  DELIVERING │─────────────────►│  COMPLETED  │
└──────┬──────┘                   └─────────────┘
       │
       │ Failure
       ▼
┌─────────────┐
│   RETRYING  │◄────────┐
└──────┬──────┘         │
       │                │
       │ Failure        │
       ▼                │
┌─────────────┐         │
│  RETRY < N  │─────────┘
└──────┬──────┘
       │
       │ Retry >= N
       ▼
┌─────────────┐
│ DEAD_LETTER │
└─────────────┘
```

---

## Summary

| Property | Status | Mechanism |
|----------|--------|-----------|
| At-least-once | ✅ | Persistent queue |
| Bounded retries | ✅ | Max count config |
| Poison isolation | ✅ | Dead letter queue |
| No partial commits | ✅ | Database transactions |
| No forks | ✅ | Per-project serialization |
| No reordering | ✅ | FIFO + idempotency |

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
