# Regulayer Billing Enforcement Model

## Core Principle

> **Billing controls access, never truth.**

---

## Enforcement Matrix

| Org State | Ingest | Dashboard | Verify | Export |
|-----------|--------|-----------|--------|--------|
| Active | ✅ | ✅ | ✅ | ✅ |
| Trial Ended | ❌ | ✅ | ✅ | ✅ |
| Frozen | ❌ | ⚠️ Limited | ✅ | ✅ |
| Cancelled | ❌ | ⚠️ Export only | ✅ | ✅ |

---

## Enforcement Layer Map

| Layer | Enforces Billing? | Why |
|-------|-------------------|-----|
| Ingestion Gateway | ✅ YES | Blocks new decisions |
| Control Plane | ✅ YES | API key validation |
| Web UI | ✅ YES | Disable ingestion buttons |
| Recorder | ❌ NEVER | Blind to money |
| Proof Verifier | ❌ NEVER | Math only |
| Export APIs | ❌ NEVER | Evidence always available |

---

## State Transitions

```
Active
  ↓ (payment fails)
Frozen
  ↓ (30 days)
Cancelled
```

```
Trial
  ↓ (14 days)
Trial Ended
  ↓ (payment added)
Active
```

---

## Critical Guarantees

### If Stripe Dies
- Proofs still export
- Verification still works
- Only new ingestion blocked

### If Customer Cancels
- 30-day export window
- All proofs valid forever
- No data deletion without request

### If Regulayer Dies
- Exported proofs work offline
- No dependency on infrastructure

---

## UI Behavior When Frozen

Banner text:
> "Ingestion paused due to billing status. Proof export remains available."

Disabled actions:
- Record decision (SDK)
- Create API key
- Upgrade storage

Enabled actions:
- Export proofs
- View decisions
- Download reports

---

## Webhook Flow

```
Stripe Event
  → regulayer-billing webhook
  → Update org state
  → Control Plane sync
  → Gateway reflects change
```

Recorder is NEVER in this flow.
