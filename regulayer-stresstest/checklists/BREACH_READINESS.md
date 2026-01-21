# Breach Readiness Checklist

Version: 1.0.0  
Use: During or after any security incident

---

## Immediate Actions (First 24 Hours)

### Incident Declaration
- [ ] Incident ID assigned
- [ ] Severity level determined (low/medium/high/critical)
- [ ] Affected scope identified
- [ ] Affected time range identified
- [ ] Affected identities identified

### Incident Record
- [ ] Incident logged in append-only registry
- [ ] Original declaration preserved immutably
- [ ] Timestamp recorded
- [ ] Declared by recorded

### Key Actions (if key-related)
- [ ] Affected key revoked
- [ ] New key issued
- [ ] Key rotation logged
- [ ] Effective timestamp recorded

---

## Affected Scope Determination

### Records Analysis
- [ ] Affected decisions identified
- [ ] Unaffected decisions confirmed
- [ ] Boundary between affected/unaffected clear
- [ ] Trust status for each: TRUSTED/DEGRADED/UNTRUSTED

### Preservation
- [ ] Original records NOT modified
- [ ] Trust status is metadata overlay only
- [ ] Cryptographic facts unchanged
- [ ] Evidence chain preserved

---

## Disclosure Generation

### Disclosure Document
- [ ] Disclosure generated for incident
- [ ] Affected evidence count accurate
- [ ] Trust status summary accurate
- [ ] Legal statement included

### Content Verification
- [ ] "What remains valid" list accurate
- [ ] "What is caveated" list accurate
- [ ] "What is invalid" list accurate
- [ ] Scope matches incident declaration

---

## Regulator Notification

### Notification Readiness
- [ ] Disclosure document ready
- [ ] Contact method confirmed
- [ ] Timeline for notification determined
- [ ] Legal review complete

### Supporting Materials
- [ ] Incident timeline documented
- [ ] Mitigation steps documented
- [ ] Residual risk documented
- [ ] Future prevention documented

---

## Verification Continuity

### Unaffected Evidence
- [ ] Can still be verified as TRUSTED
- [ ] Verification output unchanged
- [ ] No silent invalidation

### Affected Evidence
- [ ] Can still be cryptographically verified
- [ ] Trust status clearly marked
- [ ] Degradation explanation available
- [ ] Historical context applicable

### Post-Incident Evidence
- [ ] New key in use (if key incident)
- [ ] New records TRUSTED
- [ ] Clear separation from incident window

---

## Post-Incident Actions

### Mitigation Recording
- [ ] Mitigation ID assigned
- [ ] New status recorded (mitigated/resolved)
- [ ] Residual impact documented
- [ ] Mitigation record linked to incident

### Documentation Update
- [ ] Incident postmortem prepared
- [ ] Lessons learned documented
- [ ] Process improvements identified
- [ ] Timeline preserved for future reference

---

## Recovery Verification

### Trust Status Recovery
- [ ] Post-incident records: TRUSTED confirmed
- [ ] Affected period: correctly scoped
- [ ] Degraded records: list finalized
- [ ] Untrusted records: list finalized (if any)

### System Health
- [ ] New keys functioning
- [ ] Recording continues normally
- [ ] Verification continues normally
- [ ] No lingering issues

---

## Final Check

- [ ] All checklist items complete
- [ ] Legal team notified
- [ ] Regulator notification scheduled (if required)
- [ ] Postmortem scheduled

---

**BREACH RESPONSE COMPLETE: [ ]**
