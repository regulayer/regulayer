# Evidence Preservation

## Core Guarantee

> **Evidence survives everything except intentional destruction.**

---

## What Evidence Survives

### Service Restarts

| Component | Restart Effect | Evidence Status |
|-----------|---------------|-----------------|
| Gateway | Connections drop | **Preserved** |
| Queue | Pending messages replay | **Preserved** |
| Recorder | Resumes from last commit | **Preserved** |
| Storage | Reconnects | **Preserved** |

### System Upgrades

| Upgrade Type | Evidence Status |
|--------------|-----------------|
| Gateway update | **Preserved** (no crypto role) |
| Queue update | **Preserved** (no crypto role) |
| Recorder update | **Preserved** (data persisted) |
| Schema migration | **Preserved** (additive only) |

### Key Rotations

| Key Event | Evidence Status |
|-----------|-----------------|
| New signing key | Old proofs **still valid** |
| Old key retired | Old signatures **still verify** |
| Emergency rotation | Existing proofs **unaffected** |

### Billing Freezes

| Billing State | Evidence Status |
|---------------|-----------------|
| Payment failed | Records **preserved** |
| Account suspended | Export **still works** |
| Account terminated | Export window provided |

### Ownership Transfers

| Transfer Type | Evidence Status |
|---------------|-----------------|
| Organization merge | Records **preserved** |
| Custody transfer | Original attestation **unchanged** |
| New ownership | Chain continues from last record |

---

## Exported Bundles

### Forever Valid

```
Exported bundle = Complete proof

No expiration
No online dependency
No future Regulayer requirement
```

### What's in a Bundle

```json
{
  "decision": { "record_hash": "sha256:..." },
  "attestation": { "signature": "...", "algorithm": "Ed25519" },
  "chain_position": { "sequence": 42, "previous_hash": "sha256:..." },
  "verification": { "verifiable_offline": true }
}
```

### Verification Independence

| Requirement | Status |
|-------------|--------|
| Regulayer online | **Not required** |
| Regulayer exists | **Not required** |
| Original key available | **Public key in bundle** |

---

## Data Retention

### Chain Data

| Data Type | Retention | Rationale |
|-----------|-----------|-----------|
| Record hash | Permanent | Core evidence |
| Attestation | Permanent | Proof of recording |
| Chain links | Permanent | Ordering evidence |

### Governance Overlay

| Data Type | Retention | Rationale |
|-----------|-----------|-----------|
| Annotations | Configurable | Non-evidentiary |
| Access logs | 7 years | Audit trail |
| Review state | Configurable | Non-evidentiary |

---

## Disaster Recovery

### Backup Strategy

| Data Type | Backup Frequency | Retention |
|-----------|------------------|-----------|
| Chain records | Continuous | Forever |
| Attestations | Continuous | Forever |
| Config | Daily | 90 days |
| Logs | Real-time | 7 years |

### Recovery Process

```
1. Restore from backup
2. Verify chain integrity (all records)
3. Compare to last known good state
4. Alert on any discrepancies
5. Resume operations
```

### Recovery Guarantee

After any recovery:
- All valid proofs remain valid
- Chain integrity verifies
- No data corruption

---

## Long-Term Preservation

### 10-Year Horizon

| Concern | Mitigation |
|---------|------------|
| Algorithm aging | Standard supports algorithm updates |
| Key expiration | Proofs reference key at signing time |
| Format obsolescence | JSON is universal, stable |
| Company closure | Bundles work without Regulayer |

### 30-Year Horizon

| Concern | Mitigation |
|---------|------------|
| SHA-256 weakness | Re-attestation with new algorithm |
| Format changes | Reference implementation preserved |
| Company closure | Open standard continues |

---

## Verification Procedure

To verify evidence preservation after any event:

```python
def verify_preservation(project_id):
    # Export full chain
    chain = export_chain(project_id)
    
    # Verify each record
    for record in chain:
        assert verify_hash(record)
        assert verify_signature(record)
    
    # Verify chain integrity
    for i, record in enumerate(chain):
        if i > 0:
            assert record.previous_hash == chain[i-1].record_hash
    
    return "PRESERVATION_VERIFIED"
```

---

## Summary

| Scenario | Evidence Status |
|----------|-----------------|
| Restart | ✅ Preserved |
| Upgrade | ✅ Preserved |
| Key rotation | ✅ Preserved |
| Billing freeze | ✅ Preserved |
| Ownership transfer | ✅ Preserved |
| Complete outage | ✅ Preserved (offline) |
| Company shutdown | ✅ Preserved (bundles work) |

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
