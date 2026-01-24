# Regulayer Global Ordering Model

## Core Guarantee

> **Per-project strict ordering is absolute.**
> **Cross-project ordering is undefined by design.**

---

## Ordering Scope

| Scope | Guarantee |
|-------|-----------|
| Within Project | Strict total order |
| Across Projects | None (intentional) |
| Across Regions | Eventual consistency |

---

## Per-Project Ordering

### Guarantees

1. **Sequence numbers are monotonic** — never gaps, never duplicates
2. **Hash chain is ordered** — each record includes previous hash
3. **Retries preserve order** — DLQ replay respects sequence
4. **Failover preserves order** — region switch maintains sequence

### Implementation

```
Record N:
  sequence: N
  prev_hash: hash(Record N-1)
  timestamp: T
  
Record N+1:
  sequence: N+1
  prev_hash: hash(Record N)
  timestamp: T+delta
```

---

## Cross-Region Behavior

### Active-Passive

- One region writes at a time
- Failover continues sequence
- No split-brain possible

### Active-Active (Future)

- Per-project affinity to region
- No project spans regions during write
- Replication is async, read-only

---

## Why Cross-Project Ordering is Undefined

1. **Independence**: Projects are separate chains
2. **Isolation**: No cross-project joins
3. **Privacy**: Org A can't infer Org B's timing
4. **Simplicity**: Per-project ordering is tractable

---

## Ordering Under Failure

| Scenario | Ordering Impact |
|----------|-----------------|
| Gateway retry | Idempotency key prevents duplicate |
| Queue replay | DLQ preserves original sequence |
| Recorder restart | Picks up from last committed |
| Region failover | Continues from last sequence |

---

## Verification

Auditors can verify ordering by:

1. Checking sequence continuity (N, N+1, N+2...)
2. Validating prev_hash chain
3. Confirming timestamps are monotonic
4. Comparing against exported proofs

---

## Financial / Legal Defensibility

This ordering model supports:

✅ "Decision A happened before Decision B" — provable
✅ "No decisions were inserted retroactively" — provable
✅ "This is the complete history" — provable via chain
