# Time Anchor Module

## Purpose

Optional, external, non-authoritative time anchoring.

> **Time anchoring is evidence, not authority.**
> **Verification remains purely mathematical.**

---

## Core Guarantee

Time anchors:
- ✅ Are optional
- ✅ Come from external sources
- ✅ Never affect record validity
- ✅ Provide corroborating evidence
- ❌ Never replace mathematical verification

---

## Module Contents

### Code

| File | Purpose |
|------|---------|
| `models.py` | Time anchor data models |
| `anchors.py` | Anchor registry and operations |
| `evidence.py` | Evidence bundle integration |
| `api.py` | REST API endpoints |

### Adapters

| Adapter | Trust Model |
|---------|-------------|
| `adapters/rfc3161.py` | External time authority |
| `adapters/transparency_log.py` | Public append-only |
| `adapters/public_blockchain.py` | Blockchain immutability |
| `adapters/notary.py` | Jurisdictional authority |

### Documentation

| Document | Audience |
|----------|----------|
| `TIME_ANCHOR_GUIDE.md` | Developers, operators |
| `COURT_TIME_EVIDENCE.md` | Legal, courts |

---

## Supported Anchor Types

| Type | Description | Latency |
|------|-------------|---------|
| RFC 3161 | Time-Stamp Authority | Seconds |
| Transparency Log | Public append-only | Seconds |
| Public Blockchain | Bitcoin/Ethereum | Minutes-Hours |
| Court Notary | Legal notarization | Variable |

---

## Usage

### Create Anchor

```python
from regulayer_time_anchor import AnchorRegistry, AnchorType
from regulayer_time_anchor.adapters import RFC3161Adapter

registry = AnchorRegistry()
registry.register(AnchorType.RFC3161, RFC3161Adapter(
    tsa_url="http://timestamp.digicert.com"
))

result = await registry.create_anchor(record_hash, AnchorType.RFC3161)
```

### Add to Bundle

```python
from regulayer_time_anchor.evidence import add_anchors_to_bundle

bundle_with_anchors = add_anchors_to_bundle(bundle, [anchor])
```

### Verify

```python
result = await registry.verify_anchor(anchor, record_hash)
# result.valid is independent of record validity
```

---

## Verification Semantics

| Check | Result | Record Status |
|-------|--------|---------------|
| Hash valid | ✅ | Valid |
| Signature valid | ✅ | Valid |
| Chain valid | ✅ | Valid |
| Anchor missing | ⚠️ | **Still Valid** |
| Anchor invalid | ❌ (anchor) | **Still Valid** |

---

## Language Rules

### Safe Phrases

- "Corroborates temporal claims"
- "Supports time evidence"
- "External attestation"
- "Existence by date"

### Prohibited Phrases

- "Guarantees time"
- "Prevents backdating"
- "Authoritative timestamp"
- "Time authority"

---

## What This Unlocks

- ✅ Stronger court admissibility
- ✅ Long-term disputes (10–20 years)
- ✅ Insolvency-proof timelines
- ✅ Jurisdiction-specific evidence
- ✅ Government confidence

---

## Version

| Field | Value |
|-------|-------|
| Module Version | 1.0.0 |
| Last Updated | 2026-01-25 |
