# Incident Post-Mortem Replay Simulation

Version: 1.0.0  
Scenario Type: Trust Degradation Timeline

---

## Scenario Description

This simulation replays a realistic incident timeline to verify that:
- Pre-incident trust remains verifiable
- Degraded trust is explicit
- No silent invalidation occurred
- Disclosure documents match scope

---

## Timeline

### Day 1: Decision Created (2026-01-15T10:00:00Z)

**Event:** AI system makes lending decision for customer C-1001.

**Records Created:**
- Decision ID: `d7e8f9a0-1234-5678-90ab-cdef12345678`
- Record ID: 1001
- Signed by: `guard-001`
- Record Hash: `sha256:abc123...`

**Trust Status at Time:** TRUSTED

---

### Day 30: Identity Revoked (2026-02-14T00:00:00Z)

**Event:** Security audit reveals potential key exposure for `guard-001`.

**Action Taken:**
- Key rotation initiated
- Old key revoked effective 2026-02-14T00:00:00Z
- New key `guard-001-v2` issued

**Key Rotation Log Entry:**
```json
{
  "identity_id": "guard-001",
  "old_key_fingerprint": "ed25519:abc123...",
  "new_key_fingerprint": "ed25519:def456...",
  "effective_at": "2026-02-14T00:00:00Z",
  "reason": "Potential key exposure"
}
```

---

### Day 31: Incident Declared (2026-02-15T09:00:00Z)

**Event:** Security team declares formal incident.

**Incident Record:**
```json
{
  "incident_id": "inc-2026-001",
  "severity": "high",
  "affected_scope": ["signing_keys"],
  "affected_identities": ["guard-001"],
  "affected_time_range": ["2026-02-01T00:00:00Z", "2026-02-14T00:00:00Z"],
  "title": "Potential Key Exposure",
  "description": "Signing key for guard-001 may have been exposed..."
}
```

---

### Day 60: Regulator Review (2026-03-16T00:00:00Z)

**Event:** Regulator requests verification of decision D-1001.

---

## Verification Points

### 1. Pre-Incident Decision Trust

**Question:** Is decision D-1001 (created Day 1) still trusted?

**Analysis:**
- Decision created: 2026-01-15T10:00:00Z
- Incident affected range: 2026-02-01 to 2026-02-14
- Decision is BEFORE affected range

**Result:** `OUT_OF_SCOPE` - Decision predates incident window

**Verification:**
```bash
regulayer-proof-verifier verify decision_d7e8f9a0.json --archival
# Output: VERIFIED (historical context applied)

curl /v1/trust-status/d7e8f9a0-1234-5678-90ab-cdef12345678
# Output: { "trust_status": "trusted", "affecting_incidents": [] }
```

---

### 2. During-Incident Decision Trust

**Hypothetical:** Another decision D-2002 created 2026-02-10T14:00:00Z

**Analysis:**
- Decision created: 2026-02-10T14:00:00Z
- Incident affected range: 2026-02-01 to 2026-02-14
- Decision is WITHIN affected range
- Identity matches: guard-001

**Result:** `DEGRADED` - Decision affected by high-severity incident

**Verification:**
```bash
curl /v1/trust-status/d2002-uuid
# Output: { 
#   "trust_status": "degraded",
#   "affecting_incidents": ["inc-2026-001"],
#   "impact_summary": "Decision affected by high-severity incident"
# }
```

---

### 3. Post-Incident Decision Trust

**Hypothetical:** Decision D-3003 created 2026-02-20T10:00:00Z

**Analysis:**
- Decision created: 2026-02-20T10:00:00Z
- Incident affected range: 2026-02-01 to 2026-02-14
- Decision is AFTER affected range
- New key used: guard-001-v2

**Result:** `TRUSTED` - Decision created with new key after incident

---

### 4. Disclosure Document Matches Scope

**Request:** Generate disclosure for incident inc-2026-001

**Expected Disclosure:**
```json
{
  "incident_id": "inc-2026-001",
  "affected_time_range": ["2026-02-01", "2026-02-14"],
  "trust_status_summary": {
    "trusted": 450,
    "degraded": 23,
    "untrusted": 0,
    "out_of_scope": 1527
  },
  "statement": "This disclosure does not invalidate unaffected records."
}
```

**Verification:**
- Decisions outside time range: OUT_OF_SCOPE (1527 records)
- Decisions inside but different identity: OUT_OF_SCOPE
- Decisions inside with matching identity: DEGRADED (23 records)
- No UNTRUSTED (incident was "high" not "critical")

---

### 5. No Silent Invalidation

**Check:** Verify that pre-incident decisions are not quietly marked as untrusted.

**Verification:**
```bash
# Check decision created before incident
regulayer-proof-verifier verify decision_d7e8f9a0.json

# Expected: VERIFIED (not degraded, not untrusted)
# Cryptographic integrity: VALID
# Signature: VALID (historical key context applied)
```

**Audit Log Check:**
- Decision record: UNCHANGED (immutable)
- Trust status overlay: Added (new metadata)
- No modification to original bytes

---

## Post-Mortem Checklist

| Verification Point | Expected | Actual | Status |
|--------------------|----------|--------|--------|
| Pre-incident decision verifiable | TRUSTED | TRUSTED | ✅ |
| During-incident decision degraded | DEGRADED | DEGRADED | ✅ |
| Post-incident decision trusted | TRUSTED | TRUSTED | ✅ |
| Disclosure scope matches incident | Exact | Exact | ✅ |
| No silent invalidation | None | None | ✅ |
| Original records immutable | Yes | Yes | ✅ |
| Key rotation logged | Yes | Yes | ✅ |

---

## Lessons Documented

1. **Incident declaration was append-only** - Original incident record preserved
2. **Key rotation was time-bounded** - Historical signatures remain valid
3. **Trust degradation was explicit** - Clear status for each decision
4. **Disclosure was deterministic** - Same inputs → same disclosure
5. **Regulator can replay** - All evidence available months later

---

**END OF INCIDENT POST-MORTEM REPLAY SIMULATION**
