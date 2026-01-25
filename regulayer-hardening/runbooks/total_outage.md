# Total Outage Runbook

## Incident: Complete Service Outage

### Severity: P0 (Critical - All services down)

---

## Quick Reference

| Property | Value |
|----------|-------|
| Impact | All operations stopped |
| Trust Impact | **NONE** |
| Offline verification | **Works** |
| Exported bundles | **Still valid** |

---

## Symptoms

- All health checks failing
- All API endpoints returning errors
- Complete unavailability

---

## Immediate Actions

### 1. Confirm Total Outage

```bash
# Check all services
./scripts/health-check-all.sh

# Check cloud provider status
open https://status.cloudprovider.com

# Check DNS
nslookup api.regulayer.io
```

### 2. Identify Scope

| Check | Command |
|-------|---------|
| Region-specific? | `./scripts/check-region.sh` |
| Cloud-wide? | Cloud status page |
| DNS issue? | `dig api.regulayer.io` |
| Network issue? | `traceroute api.regulayer.io` |

---

## During Outage

### Customer Guidance

```
All Regulayer services are currently unavailable.

IMPORTANT: Your existing proofs remain valid.

What still works:
✓ Offline verification (use reference verifier)
✓ Exported bundles are complete and valid
✓ No data has been lost or corrupted

What doesn't work:
✗ New ingestion
✗ API access
✗ Export requests
```

### Offline Verification

Customers can verify proofs locally:

```bash
# Download reference verifier (from GitHub)
git clone https://github.com/regulayer/reference-verifier

# Verify bundle
python verify.py my_bundle.json

# Output: VALID ✓
```

---

## Recovery Steps

### Step 1: Restore Core Infrastructure

```bash
# Cloud provider recovery
./scripts/dr-restore-infra.sh

# Verify network connectivity
./scripts/verify-network.sh
```

### Step 2: Restore Database

```bash
# Check database status
./scripts/check-database.sh

# If needed, restore from backup
./scripts/dr-restore-database.sh --latest

# Verify data integrity
./scripts/verify-all-chains.sh
```

### Step 3: Restore Services (In Order)

```bash
# 1. Storage (must be first)
kubectl apply -f dr/storage-restore.yaml
./scripts/wait-healthy.sh storage

# 2. Recorder
kubectl apply -f dr/recorder-restore.yaml
./scripts/wait-healthy.sh recorder

# 3. Queue
kubectl apply -f dr/queue-restore.yaml
./scripts/wait-healthy.sh queue

# 4. Gateway
kubectl apply -f dr/gateway-restore.yaml
./scripts/wait-healthy.sh gateway
```

### Step 4: Verify Integrity

```bash
# Full chain verification
./scripts/verify-all-chains.sh

# Compare to last known good state
./scripts/compare-checksums.sh --baseline=last-backup

# Smoke test
./scripts/smoke-test-all.sh
```

---

## What CANNOT Be Fixed Retroactively

| Situation | Reality |
|-----------|---------|
| Records during outage | Not created (expected) |
| Chain gaps | None (queue preserved) |
| Corrupted proofs | None (isolated storage) |

---

## What NOT To Do

| Action | Why Not |
|--------|---------|
| Panic about proof validity | Proofs work offline |
| Manually fix chains | Unnecessary, integrity preserved |
| Skip verification | Always verify after restore |
| Rush recovery | Careful restoration prevents issues |

---

## Post-Recovery Verification

Mandatory checks:

```bash
# 1. All chains verify
./scripts/verify-all-chains.sh
# Expected: All projects pass

# 2. No sequence gaps
./scripts/detect-gaps.sh --all
# Expected: No gaps

# 3. Pending queue drains
watch ./scripts/queue-depth.sh
# Expected: Decreasing to 0

# 4. New records created successfully
./scripts/smoke-test-ingest.sh
# Expected: Success
```

---

## Customer Communication

### During Outage

```
Status: Service Unavailable

All Regulayer services are currently down.

Your existing proofs are unaffected:
- Exported bundles remain valid
- Offline verification works
- No data corruption possible

We are working to restore service.
```

### After Recovery

```
Status: Fully Operational

Service has been restored.

Impact assessment:
- Duration: X hours
- Records affected: 0 (no corruption)
- Proofs affected: 0 (no invalidation)
- Chain integrity: Verified

All systems verified and operational.
```

---

## Why Trust Remains Intact

Even during complete outage:

1. **Proofs are mathematical** - Math doesn't need servers
2. **Bundles are self-contained** - All data included
3. **Reference verifier is open** - Anyone can run it
4. **No online dependency** - Designed for this scenario

---

## Escalation

| Time | Action |
|------|--------|
| 0 min | Page all on-call |
| 5 min | Incident commander activated |
| 10 min | Executive notification |
| 30 min | Status page updated |
| Ongoing | Hourly updates to customers |
