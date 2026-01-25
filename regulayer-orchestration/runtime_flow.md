# Runtime Flow

## Core Principle

> **Services may coordinate. They may never reinterpret, re-sign, or re-order cryptographic facts.**

---

## Canonical End-to-End Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        RUNTIME FLOW                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   SDK/API Client                                                     │
│        │                                                             │
│        ▼                                                             │
│   ┌──────────────┐                                                   │
│   │   Gateway    │  Rate limit, authenticate, validate              │
│   └──────────────┘                                                   │
│        │                                                             │
│        ▼                                                             │
│   ┌──────────────┐                                                   │
│   │    Queue     │  Buffer, preserve order, retry                   │
│   └──────────────┘                                                   │
│        │                                                             │
│        ▼                                                             │
│   ┌──────────────┐                                                   │
│   │  Recorder    │  Hash, chain, attest  ◄── CRYPTOGRAPHIC BOUNDARY │
│   └──────────────┘                                                   │
│        │                                                             │
│        ├──────────────┐                                              │
│        ▼              ▼                                              │
│   ┌──────────────┐  ┌──────────────┐                                │
│   │  Governance  │  │   Archive    │                                │
│   │   Overlay    │  │   Storage    │                                │
│   └──────────────┘  └──────────────┘                                │
│        │                   │                                         │
│        └───────┬───────────┘                                         │
│                ▼                                                     │
│   ┌──────────────┐                                                   │
│   │   Export     │  Package proofs                                  │
│   └──────────────┘                                                   │
│        │                                                             │
│        ▼                                                             │
│   VERIFICATION  ◄── Offline, deterministic                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Stage Responsibilities

### SDK / API Client

| Allowed | Forbidden |
|---------|-----------|
| Create claim | Hash (that's recorder's job) |
| Add metadata | Sign (that's recorder's job) |
| Specify project | Reorder claims |

### Ingestion Gateway

| Allowed | Forbidden |
|---------|-----------|
| Authenticate request | Inspect payload content |
| Rate limit | Modify payload |
| Validate format | Conditional forwarding based on content |
| Route to queue | Reorder requests |

### Ingestion Queue

| Allowed | Forbidden |
|---------|-----------|
| Buffer messages | Mutate payload |
| Retry on failure | Reorder within project |
| Preserve ordering | Partial batch commits |
| Dead letter routing | Silent drops |

### Decision Recorder

| Allowed | Forbidden |
|---------|-----------|
| Verify format | Interpret meaning |
| Canonicalize | Evaluate correctness |
| Compute hash | Apply policy logic |
| Append to chain | Skip records |
| Sign attestation | Conditional recording |

### Governance Overlay

| Allowed | Forbidden |
|---------|-----------|
| Add annotations | Modify record_hash |
| Apply visibility | Modify signature |
| Track review state | Modify chain_position |
| Manage retention | Delete cryptographic data |

### Archive / Storage

| Allowed | Forbidden |
|---------|-----------|
| Store durably | Modify stored data |
| Replicate | Compress cryptographic fields |
| Backup | Lazy deletion |

### Export

| Allowed | Forbidden |
|---------|-----------|
| Package bundles | Re-compute hashes |
| Include anchors | Re-sign |
| Add verification hints | Filter chain selectively |

### Verification

| Allowed | Forbidden |
|---------|-----------|
| Verify math | Check access control |
| Return pass/fail | Evaluate governance state |
| Output diagnostics | Modify anything |

---

## Data Flow Guarantees

### 1. Byte-for-Byte Integrity

```
SDK payload → Gateway → Queue → Recorder
                              ↓
                     FIRST MODIFICATION
                     (hash computed here)
```

The payload is immutable until the recorder processes it.

### 2. Order Preservation

```
Per-project ordering is STRICT:

  Claim A (t=1) → Claim B (t=2) → Claim C (t=3)
       ↓              ↓              ↓
  Record 1       Record 2       Record 3
  (seq=1)        (seq=2)        (seq=3)
```

### 3. Cryptographic Isolation

```
Gateway │ Queue │ Recorder ║ Governance │ Export
        │       │          ║            │
    NO CRYPTO   │   CRYPTO ║   NO CRYPTO
        │       │   ONLY   ║
```

Only the Recorder performs cryptographic operations.

---

## Runtime Invariants

### I1: No Silent Drops

Every claim either:
- Becomes a record, OR
- Generates an explicit error

### I2: No Ambiguous State

At any point, a record is either:
- Not yet committed (not visible)
- Committed (immutable)

### I3: No Retroactive Changes

Once committed:
- Hash cannot change
- Signature cannot change
- Chain position cannot change

---

## Timing Semantics

| Stage | Latency Target | Failure Mode |
|-------|---------------|--------------|
| Gateway | <50ms | Reject with error |
| Queue | <100ms enqueue | Retry with backoff |
| Recorder | <500ms | Reject with error |
| Governance | Async | Does not block recording |
| Export | On-demand | Fail if data unavailable |

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
