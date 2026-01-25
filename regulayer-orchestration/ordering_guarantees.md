# Ordering Guarantees

## Overview

This document formalizes what ordering guarantees exist and why.

---

## Guarantee Levels

| Scope | Guarantee | Status |
|-------|-----------|--------|
| Global ordering | All records ordered globally | ❌ Not required |
| Per-project ordering | Within project, strict order | ✅ **Mandatory** |
| Per-identity ordering | Within identity, strict order | ⚠️ Optional (future) |

---

## Per-Project Ordering (Mandatory)

### Definition

Within a single project, records are strictly ordered:

```
Project: proj_123

Record 1: sequence=1, previous_hash=null
    ↓
Record 2: sequence=2, previous_hash=hash(Record 1)
    ↓
Record 3: sequence=3, previous_hash=hash(Record 2)
```

### Enforcement Points

| Component | Enforcement Mechanism |
|-----------|----------------------|
| Queue | Per-project FIFO |
| Recorder | Sequence number check |
| Chain | Previous hash linking |

### Violation Detection

```python
def check_ordering(record, previous):
    # Sequence must increment by 1
    if record.sequence_number != previous.sequence_number + 1:
        raise OrderingViolation("Sequence gap detected")
    
    # Hash must link
    if record.previous_hash != previous.record_hash:
        raise OrderingViolation("Chain link broken")
```

---

## Why Global Ordering Is NOT Required

### Reasons

1. **Independence**: Projects are independent chains
2. **Scalability**: Global ordering limits throughput
3. **Trust model**: Each project has its own trust boundary
4. **Usability**: Cross-project ordering has no semantic meaning

### What This Means

```
Project A: [R1, R2, R3]  ← Ordered within A
Project B: [R1, R2]      ← Ordered within B

R1(A) vs R1(B): NO ordering relationship
```

---

## What Breaks Ordering

### Queue Failures

| Failure | Effect | Mitigation |
|---------|--------|------------|
| Queue crash | Potential reorder | Per-project partition |
| Network partition | Potential reorder | Single writer per project |
| Timeout | Retry may reorder | Idempotency keys |

### Recorder Failures

| Failure | Effect | Mitigation |
|---------|--------|------------|
| Crash before commit | Message replayed | Idempotency check |
| Crash after commit | Success | No issue |
| Duplicate processing | Potential gap | Sequence validation |

---

## Cryptographic Chain Prevents Silent Corruption

### Why the Chain Works

```
Record 2 contains: previous_hash = hash(Record 1)
Record 3 contains: previous_hash = hash(Record 2)

If Record 2 is modified or removed:
  - Record 3's previous_hash won't match
  - Chain verification FAILS
  - Corruption is DETECTED
```

### Detection Guarantee

| Corruption Type | Detected By |
|-----------------|-------------|
| Record modified | Hash mismatch |
| Record deleted | Chain gap |
| Record reordered | Previous hash mismatch |
| Record inserted | Sequence conflict |

---

## Ordering Verification

### Single Record

```python
def verify_single(record, previous):
    # Check sequence
    expected_seq = (previous.sequence_number + 1) if previous else 1
    if record.chain_position.sequence_number != expected_seq:
        return False, "Sequence violation"
    
    # Check link
    if previous:
        if record.chain_position.previous_hash != previous.record_hash:
            return False, "Chain link broken"
    
    return True, "Order verified"
```

### Full Chain

```python
def verify_chain(records):
    sorted_records = sorted(records, key=lambda r: r.sequence_number)
    
    for i, record in enumerate(sorted_records):
        if i == 0:
            if record.sequence_number != 1:
                return False, "First record must be sequence 1"
            continue
        
        previous = sorted_records[i-1]
        valid, msg = verify_single(record, previous)
        if not valid:
            return False, f"At position {i}: {msg}"
    
    return True, "Chain verified"
```

---

## Ordering in Distributed Context

### Single Writer Rule

Each project has at most ONE writer at a time:

```
Project A ←── Writer 1 (exclusive)
Project B ←── Writer 2 (exclusive)
```

This prevents ordering conflicts.

### Partition Handling

If network partitions:
1. Writer loses lock
2. New writer elected
3. Gap detection on recovery
4. Manual reconciliation if needed

---

## Summary

| Property | Guarantee |
|----------|-----------|
| Per-project order | **Strict** |
| Cross-project order | None (by design) |
| Detection of violations | Cryptographic |
| Recovery from violations | Manual + alerting |

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
