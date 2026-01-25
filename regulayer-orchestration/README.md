# Runtime Orchestration

## Purpose

This module documents how all services interact at runtime,
with explicit guarantees about ordering, trust, and failure.

> **Services may coordinate. They may never reinterpret, re-sign, or re-order cryptographic facts.**

---

## Contents

### Core Documentation

| Document | Purpose |
|----------|---------|
| `runtime_flow.md` | End-to-end flow with trust boundaries |
| `service_contracts.md` | Explicit contracts between services |
| `ordering_guarantees.md` | What ordering is guaranteed |
| `failure_propagation.md` | How failures propagate |
| `enforcement_boundaries.md` | What each layer can/cannot enforce |

### Diagrams

| Diagram | Purpose |
|---------|---------|
| `diagrams/ingest_to_recorder.md` | Ingestion flow with trust zones |
| `diagrams/outage_modes.md` | Behavior during outages |
| `diagrams/trust_boundaries.md` | Layer separation |

---

## Key Guarantees

### 1. Ordering

- **Per-project**: Strict ordering ✅
- **Cross-project**: No ordering (by design)
- **Cryptographic**: Chain prevents reordering

### 2. Trust Boundaries

- **Operational layer**: Access, billing, visibility
- **Cryptographic layer**: Hashing, signing, chaining
- **Separation**: Operational cannot affect cryptographic

### 3. Failure Modes

- **Availability may degrade**
- **Trust never degrades**
- **Offline verification always works**

---

## Service Flow

```
SDK → Gateway → Queue → Recorder → Storage → Export
            ↓              ↓          ↓
        Billing       Governance   Archive
```

Each transition has explicit contracts documented in `service_contracts.md`.

---

## Trust Zones

| Zone | Components | Authority |
|------|------------|-----------|
| Untrusted | SDK, Clients | None |
| Operational | Gateway, Queue, UI, Billing | Access control |
| Cryptographic | Recorder, Verifier | Truth creation |
| Storage | Database, Archive | Durability |

---

## What This Enables

- ✅ Regulators understand runtime behavior
- ✅ Enterprises trust deployment at scale
- ✅ Engineers operate without violating trust
- ✅ SOC2 / ISO evidence becomes trivial
- ✅ Auditors can trace exact behavior without code

---

## Version

| Field | Value |
|-------|-------|
| Module Version | 1.0.0 |
| Last Updated | 2026-01-25 |
