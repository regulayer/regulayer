# Regulayer Incident Response

## Severity Levels

| Level | Definition | Response Time |
|-------|------------|---------------|
| SEV1 | Data integrity at risk | 15 min |
| SEV2 | Service down | 1 hour |
| SEV3 | Degraded performance | 4 hours |
| SEV4 | Minor issue | 24 hours |

---

## Incident Classification

### Cryptographic Incidents (SEV1)

- Hash chain break detected
- Attestation key compromise suspected
- Proof verification failure in prod

**Action**: Invoke Phase 6 incident registry

### Availability Incidents

- Gateway down → SEV2
- Recorder down → SEV2
- Queue saturated → SEV3
- Latency spike → SEV3

---

## Response Procedure

### 1. Acknowledge

```bash
# Log incident start
ops-cli incident declare --severity SEV2 --title "Gateway outage"
```

### 2. Assess Trust Impact

| Question | Answer |
|----------|--------|
| Are existing proofs affected? | Usually NO |
| Can new decisions be recorded? | Check |
| Is chain integrity intact? | Verify |

### 3. Communicate

- Update status.regulayer.io
- Notify affected customers (SEV1/2)
- Internal Slack channel

### 4. Remediate

Follow service-specific runbook

### 5. Resolve

```bash
ops-cli incident resolve --id INC-123 --resolution "..."
```

### 6. Post-Mortem

Required for SEV1/SEV2:
- Timeline
- Root cause
- Trust impact (if any)
- Prevention measures

---

## Trust Impact Assessment

For every incident, answer:

1. **Were any proofs invalidated?** (Should be NO)
2. **Was any chain broken?** (Should be NO)
3. **What window is affected?** (If applicable)
4. **What can customers still prove?** (Usually everything)

---

## Escalation

| Severity | Escalate To |
|----------|-------------|
| SEV1 | CTO + Legal (crypto incident) |
| SEV2 | On-call lead |
| SEV3 | Team channel |
| SEV4 | Ticket queue |
