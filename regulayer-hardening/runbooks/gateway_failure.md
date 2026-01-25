# Gateway Failure Runbook

## Incident: Gateway Service Down

### Severity: P2 (High - Ingest impacted)

---

## Quick Reference

| Property | Value |
|----------|-------|
| Impact | New ingest blocked |
| Trust Impact | **None** |
| Verification | Works |
| Export | Works |
| Existing records | Unaffected |

---

## Symptoms

- 5xx errors from gateway
- Connection timeouts from SDKs
- Alert: "Gateway health check failed"

---

## Immediate Actions

### 1. Confirm Gateway Down

```bash
# Check gateway health
curl -s https://api.regulayer.io/health

# Check container/pod status
kubectl get pods -l app=gateway
```

### 2. Check Downstream Services

```bash
# Queue should be healthy
curl -s https://internal-queue/health

# Recorder should be healthy
curl -s https://internal-recorder/health
```

If queue/recorder healthy: Gateway issue only

---

## Resolution Steps

### Option A: Restart Gateway

```bash
# Restart gateway pods
kubectl rollout restart deployment/gateway

# Monitor rollout
kubectl rollout status deployment/gateway
```

### Option B: Scale Gateway

```bash
# Add capacity
kubectl scale deployment/gateway --replicas=5

# If specific node issue, drain node
kubectl drain <node-name>
```

### Option C: Failover to Standby

```bash
# Switch traffic to backup region
./scripts/failover-gateway.sh --region=backup
```

---

## What NOT To Do

| Action | Why Not |
|--------|---------|
| Modify queue messages | Will corrupt evidence |
| Bypass gateway | Auth/rate limits needed |
| Force-restart recorder | Not the issue |
| Delete pending messages | Data loss |

---

## Verification After Recovery

```bash
# Submit test record
./scripts/smoke-test-ingest.sh

# Verify existing chains
./scripts/verify-all-chains.sh --sample=100
```

---

## Customer Communication

```
Status: Ingest Temporarily Unavailable

What's happening:
- New decision recording is paused
- All existing records are unaffected
- Verification and export work normally

No proof integrity is affected.
```

---

## Escalation

| Time | Action |
|------|--------|
| 0-5 min | On-call engineer investigates |
| 5-15 min | Restart/failover attempted |
| 15-30 min | Escalate to senior engineer |
| 30+ min | Page engineering leadership |
