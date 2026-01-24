# Regulayer Disaster Recovery

## Recovery Objectives

| Metric | Target | Notes |
|--------|--------|-------|
| RPO (Recovery Point Objective) | 0 | No data loss possible |
| RTO (Recovery Time Objective) | < 4 hours | Service restoration |
| Proof Validity | Immediate | Works offline always |

---

## Disaster Scenarios

### Scenario 1: Single Region Loss

**Impact:** Regional ingestion unavailable

**Recovery:**
1. Traffic fails over to secondary region
2. Queue drains to surviving recorder
3. Order preserved per project
4. Proofs remain valid

**Data Loss:** Zero (queue durability)

---

### Scenario 2: Database Corruption

**Impact:** Records potentially unreadable

**Recovery:**
1. Point-in-time recovery from backups
2. Hash chain validation on restore
3. Any corruption detectable via chain breaks
4. Replay from queue if needed

**Data Loss:** Zero (corruption is detectable)

---

### Scenario 3: Total Infrastructure Loss

**Impact:** Service completely unavailable

**Recovery:**
1. Rebuild from infrastructure-as-code
2. Restore database from geo-redundant backups
3. Validate hash chains
4. Resume operations

**Proof Impact:** None. Exported proofs work forever.

---

## Recovery Proof Export

```
GET /v1/recovery/proof/{project_id}
```

Returns:
```json
{
  "project_id": "proj_xxx",
  "last_record_hash": "sha256:abc...",
  "sequence_number": 12847,
  "chain_root": "sha256:def...",
  "region": "us-east",
  "exported_at": "2026-01-24T21:30:00Z",
  "continuity_proof": {
    "first_hash": "sha256:000...",
    "record_count": 12847,
    "merkle_root": "sha256:ghi..."
  }
}
```

This lets a regulator verify:
> "Even during outage, I can prove nothing was altered."

---

## Backup Strategy

| Data | Frequency | Retention | Geo-Redundancy |
|------|-----------|-----------|----------------|
| Database | Continuous | 90 days | 3 regions |
| Queue state | Real-time | 7 days | 2 regions |
| Attestation keys | On change | Forever | Offline HSM |
| Config | On change | Forever | Git |

---

## What Survives Forever

Even if Regulayer ceases to exist:

✅ Exported proof bundles verify offline
✅ Ed25519 public keys are included in exports
✅ Hash chain is self-contained
✅ No Regulayer dependency for verification

> **Your evidence survives us.**
