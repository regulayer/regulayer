# Queue Partition Runbook

## Incident: Queue Service Partitioned or Degraded

### Severity: P2 (High - Ingest delayed)

---

## Quick Reference

| Property | Value |
|----------|-------|
| Impact | Ingest delayed |
| Trust Impact | **None** |
| Order | **Preserved** (on recovery) |
| Verification | Works |
| Export | Works |

---

## Symptoms

- Messages not being delivered
- Queue depth growing
- Recorder showing no activity
- Alert: "Queue partition detected"

---

## Immediate Actions

### 1. Confirm Partition

```bash
# Check queue connectivity to recorder
./scripts/check-queue-recorder-connectivity.sh

# Check queue health
curl -s https://internal-queue/health

# Check network
kubectl exec -it queue-pod -- ping recorder-service
```

### 2. Assess Queue State

```bash
# Check queue depth
./scripts/queue-depth.sh

# Check oldest message age
./scripts/oldest-message.sh

# Check per-project partitions
./scripts/queue-partitions.sh
```

---

## Resolution Steps

### Option A: Network Recovery

```bash
# Reset network policies
kubectl apply -f network-policies/queue-to-recorder.yaml

# Force DNS refresh
kubectl rollout restart deployment/coredns
```

### Option B: Queue Failover

```bash
# Switch to standby queue cluster
./scripts/failover-queue.sh --target=standby

# Replicate pending messages
./scripts/queue-sync.sh --from=primary --to=standby
```

### Option C: Manual Recovery

```bash
# Export pending messages
./scripts/export-queue.sh --output=pending-messages.json

# Restore to healthy queue
./scripts/import-queue.sh --input=pending-messages.json
```

---

## Ordering Guarantee

After recovery, verify ordering:

```bash
# Check per-project order preserved
./scripts/verify-project-order.sh --project=<id>

# Output should show:
# Project <id>: Order preserved ✓
# Sequence: 1 → 2 → 3 → ... (no gaps)
```

---

## What NOT To Do

| Action | Why Not |
|--------|---------|
| Delete old messages | Data loss |
| Reorder manually | Breaks ordering |
| Process out of partition | Breaks per-project order |
| Skip messages | Creates chain gaps |

---

## Verification After Recovery

```bash
# Verify queue is draining
watch ./scripts/queue-depth.sh

# Verify chains are extending correctly
./scripts/verify-chains-live.sh

# Check for sequence gaps
./scripts/detect-gaps.sh
```

---

## Customer Communication

```
Status: Ingest Delayed

What's happening:
- New recordings may be delayed
- All records will be processed in order
- No data is lost
- Existing records unaffected

Ordering is preserved. No integrity impact.
```

---

## Escalation

| Time | Action |
|------|--------|
| 0-15 min | On-call investigates queue |
| 15-30 min | Attempt recovery |
| 30-60 min | Escalate to queue owner |
| 60+ min | Page infrastructure lead |
