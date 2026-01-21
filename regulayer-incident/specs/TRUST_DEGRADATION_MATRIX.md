# Trust Degradation Matrix

Version: 1.0.0  
Status: NORMATIVE

---

## Purpose

Truth table for determining trust outcomes based on incident scope, time, and identity.

---

## Matrix Structure

```
Scope × Time × Identity → Trust Outcome
```

---

## Scope Impact Table

| Affected Scope | Impact on Hashes | Impact on Signatures | Impact on Governance |
|----------------|------------------|----------------------|----------------------|
| SDK | None | None | None |
| Recorder | Possible | None | None |
| Signing Keys | None | Affected | None |
| Governance | None | None | Affected |
| Infrastructure | Possible | Possible | Possible |

---

## Time Overlap Rules

| Decision Time | Incident Start | Incident End | Result |
|---------------|----------------|--------------|--------|
| Before start | Any | Any | OUT_OF_SCOPE |
| Within range | Before decision | After decision | OVERLAPS |
| After end | Any | Any | OUT_OF_SCOPE |

---

## Identity Matching Rules

| Incident Identities | Decision Attester | Result |
|---------------------|-------------------|--------|
| NULL (all) | Any | MATCHES |
| Specific list | In list | MATCHES |
| Specific list | Not in list | NO_MATCH |

---

## Combined Trust Outcome

| Scope Match | Time Overlap | Identity Match | Severity | Trust Status |
|-------------|--------------|----------------|----------|--------------|
| No | - | - | - | OUT_OF_SCOPE |
| Yes | No | - | - | OUT_OF_SCOPE |
| Yes | Yes | No | - | OUT_OF_SCOPE |
| Yes | Yes | Yes | Low | DEGRADED |
| Yes | Yes | Yes | Medium | DEGRADED |
| Yes | Yes | Yes | High | DEGRADED |
| Yes | Yes | Yes | Critical | UNTRUSTED |

---

## Component-Specific Rules

### SDK Incidents
```
Impact: Recording delay, duplicate records
Trust Result: DEGRADED (timing may be off)
Crypto Impact: None
```

### Recorder Incidents
```
Impact: Storage corruption, ordering issues
Trust Result: DEGRADED or UNTRUSTED
Crypto Impact: Hash verification may fail
```

### Signing Key Incidents
```
Impact: Key compromise, unauthorized signatures
Trust Result: DEGRADED (signatures before compromise valid)
Crypto Impact: Signatures during compromise untrusted
```

### Governance Incidents
```
Impact: Workflow logic errors
Trust Result: DEGRADED
Crypto Impact: None (governance is non-authoritative)
```

### Infrastructure Incidents
```
Impact: Broad system issues
Trust Result: Depends on severity
Crypto Impact: Potential across all layers
```

---

## Special Cases

### Multiple Incidents
If multiple incidents affect a decision:
- Use highest severity
- Combine all impact notes
- List all affecting incidents

### Mitigated Incidents
- Original incident record preserved
- Mitigation adds context
- Trust status per original declaration

### Future Incidents
Incidents declared after decision creation:
- Can still mark decision as affected
- Time range determines scope
- Retroactive disclosure allowed

---

## Verification Algorithm

```python
def determine_trust(decision, incident):
    if not scope_matches(decision, incident):
        return OUT_OF_SCOPE
    if not time_overlaps(decision, incident):
        return OUT_OF_SCOPE
    if not identity_matches(decision, incident):
        return OUT_OF_SCOPE
    
    if incident.severity == CRITICAL:
        return UNTRUSTED
    else:
        return DEGRADED
```

---

**END OF TRUST DEGRADATION MATRIX**
