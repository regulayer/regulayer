# Recorder Crash Runbook

## Incident: Decision Recorder Service Down

### Severity: P1 (Critical - Recording stopped)

---

## Quick Reference

| Property | Value |
|----------|-------|
| Impact | Recording stopped |
| Trust Impact | **None** |
| Partial records | **Impossible** (transactional) |
| Verification | Works |
| Export | Works (existing records) |

---

## Symptoms

- Queue depth increasing (not draining)
- No new records in storage
- Alert: "Recorder health check failed"
- SDK timeouts

---

## Immediate Actions

### 1. Confirm Recorder Down

```bash
# Check recorder health
curl -s https://internal-recorder/health

# Check container/pod status
kubectl get pods -l app=recorder

# Check recent logs
kubectl logs -l app=recorder --tail=100
```

### 2. Check Database Connectivity

```bash
# Can recorder reach database?
kubectl exec -it recorder-pod -- pg_isready -h database

# Database health
./scripts/check-database-health.sh
```

---

## Resolution Steps

### Option A: Restart Recorder

```bash
# Graceful restart (wait for in-progress)
kubectl rollout restart deployment/recorder

# Force restart (after confirming no in-progress writes)
kubectl delete pod -l app=recorder
```

### Option B: Disk Full

```bash
# Check disk usage
kubectl exec -it recorder-pod -- df -h

# Clear logs/temp files
kubectl exec -it recorder-pod -- rm -rf /tmp/large-files

# Expand volume
kubectl apply -f storage/recorder-pvc-expanded.yaml
```

### Option C: HSM Issue

```bash
# Check HSM connectivity
./scripts/check-hsm.sh

# Restart HSM connection
kubectl exec -it recorder-pod -- ./restart-hsm-connection.sh
```

---

## Critical: No Half-Written Records

The recorder uses transactional writes:

```
BEGIN TRANSACTION
  → Compute hash
  → Sign attestation
  → Insert record
  → Update chain head
COMMIT (all or nothing)
```

If recorder crashes:
- Before COMMIT → Nothing written
- After COMMIT → Complete record

There are **no partial records**.

---

## Verification After Recovery

```bash
# Check last committed record
./scripts/last-record.sh --project=<id>

# Verify chain integrity
./scripts/verify-chain.sh --project=<id>

# Confirm queue draining
watch ./scripts/queue-depth.sh

# Validate no gaps
./scripts/detect-gaps.sh --all-projects
```

---

## What NOT To Do

| Action | Why Not |
|--------|---------|
| Manually write to database | Bypasses signing |
| Skip HSM | Creates unsigned records |
| Delete queue messages | Data loss |
| Force sequence numbers | Breaks chain |

---

## Customer Communication

```
Status: Recording Temporarily Unavailable

What's happening:
- New decision recording is paused
- Pending records are safely queued
- All existing records are unaffected
- Verification and export work normally

No data is lost. Recording will resume shortly.
```

---

## Post-Incident

After recovery:

1. Verify chain integrity for all active projects
2. Check for any gaps (should be none)
3. Confirm queue drained completely
4. Document root cause

---

## Escalation

| Time | Action |
|------|--------|
| 0-5 min | On-call investigates |
| 5-10 min | Restart attempted |
| 10-15 min | Escalate to recorder owner |
| 15-30 min | Page engineering leadership |
| 30+ min | Incident commander activated |
