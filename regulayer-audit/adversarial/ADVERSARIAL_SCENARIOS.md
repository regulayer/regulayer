# Adversarial Scenarios

## Purpose

This document explicitly models adversarial scenarios that Regulayer must withstand.
Each scenario documents what breaks, what doesn't, and what remains provable.

---

## SCENARIO: Malicious Customer (SDK Abuse)

### Threat Model
A customer attempts to submit misleading or malicious decision records.

### Attack Vectors

| Attack | Outcome |
|--------|---------|
| Submit false decision | Recorded faithfully (garbage in, garbage out) |
| Backdate timestamp | ❌ Blocked - recorder sets timestamp |
| Modify after recording | ❌ Blocked - hash/signature verification fails |
| Claim "never recorded" | ❌ Blocked - non-repudiation via signature |
| Flood with garbage | Rate limited, billed, no chain corruption |

### What Breaks
- Nothing cryptographic
- Customer's own decision quality (their problem)

### What Remains Provable
- Customer submitted this exact content
- Submission occurred at this exact time
- Content has not been modified

### Mitigation
- Regulayer attests what was submitted, not its correctness
- Customer bears responsibility for decision content

---

## SCENARIO: Compromised SDK

### Threat Model
A customer's SDK or integration is compromised by an attacker.

### Attack Vectors

| Attack | Outcome |
|--------|---------|
| Submit unauthorized decisions | Recorded under customer's project |
| Exfiltrate API keys | Attacker can record as customer |
| Modify decisions before recording | Modified content is recorded |
| Forge proofs locally | ❌ Blocked - requires Regulayer signature |

### What Breaks
- Customer's control over their project
- Decisions recorded during compromise period

### What Remains Provable
- All decisions still have valid attestations
- Chain integrity maintained
- Timeline is accurate

### Mitigation
- Key rotation
- Audit logs show all actions
- Proofs from before/after compromise remain valid

---

## SCENARIO: Compromised Signing Keys

### Threat Model
Regulayer's signing keys are stolen or compromised.

### Attack Vectors

| Attack | Outcome |
|--------|---------|
| Sign fraudulent records | ⚠️ Valid signatures, but detectable |
| Backdate attestations | ⚠️ Possible with stolen key |
| Forge entire chain | ⚠️ Would require massive coordination |

### What Breaks
- Trust in signatures made during compromise window
- Non-repudiation for compromise period

### What Remains Provable
- Pre-compromise records remain valid
- Post-rotation records remain valid
- Compromise window is bounded and documented

### Mitigation
- Key rotation procedures
- Timestamp server integration (external binding)
- Certificate transparency for key publication
- Clear key validity periods

### Recovery
1. Detect compromise
2. Revoke compromised key
3. Rotate to new key
4. Audit compromise window
5. Publish incident report

---

## SCENARIO: Insider Threat (Regulayer Employee)

### Threat Model
A malicious Regulayer employee attempts to tamper with records.

### Attack Vectors

| Attack | Outcome |
|--------|---------|
| Delete records | ❌ Blocked - append-only |
| Modify records | ❌ Blocked - breaks hash chain |
| Backdate records | ❌ Blocked - chain ordering |
| Create fake records | ⚠️ Requires signing key access |
| Access production keys | ⚠️ Mitigated by access controls |

### What Breaks
- Depends on access level achieved
- Signing key access = key compromise scenario

### What Remains Provable
- Customer-exported proofs remain valid
- Third-party verified records remain valid

### Mitigation
- Separation of duties
- Key access requires multi-party approval
- Audit logs for all administrative actions
- No single point of trust

---

## SCENARIO: Total Regulayer Compromise

### Threat Model
Regulayer infrastructure is completely compromised (nation-state, etc.).

### Attack Vectors

| Attack | Outcome |
|--------|---------|
| All keys stolen | Keys rotated post-recovery |
| All data accessed | Confidentiality breach |
| All records deleted | ❌ Customer exports survive |
| Service unavailable | ⚠️ New records impossible |
| Forge new records | ⚠️ Detectable if monitored |

### What Breaks
- Active recording capability
- Confidentiality of stored data
- Trust in records during compromise

### What Remains Provable
- **Customer-exported proofs remain valid**
- **Offline verification works without Regulayer**
- Pre-compromise records verified by third parties

### Mitigation
- Encourage regular proof exports
- Third-party archival services
- Offline verifier distribution
- No central point of cryptographic failure

### Ultimate Guarantee
**Even if Regulayer ceases to exist, exported proofs remain mathematically valid.**

---

## SCENARIO: Regulayer Shutdown / Bankruptcy

### Threat Model
Regulayer goes out of business.

### Impact

| Aspect | Status |
|--------|--------|
| New recordings | ❌ Not possible |
| Exported proofs | ✅ Still valid |
| Offline verification | ✅ Still works |
| Support | ❌ Not available |
| Key revocation | ⚠️ Requires transition plan |

### What Survives
- All exported proof bundles
- Offline verifier (distribute source)
- Public key registrations
- Schema definitions

### Transition Plan
1. Open-source verifier
2. Publish key registry
3. Archive schemas
4. Customer notification
5. Transition period for exports

---

## Adversarial Matrix

| Scenario | Chain Integrity | Signatures Valid | Offline Verify | Customer Proofs |
|----------|----------------|------------------|----------------|-----------------|
| Malicious Customer | ✅ | ✅ | ✅ | ✅ |
| Compromised SDK | ✅ | ✅ | ✅ | ⚠️ |
| Key Compromise | ✅ | ⚠️ | ✅ | ⚠️ |
| Insider Threat | ✅ | ⚠️ | ✅ | ✅ |
| Total Compromise | ⚠️ | ⚠️ | ✅ | ✅ |
| Shutdown | N/A | ✅ | ✅ | ✅ |

**Key insight**: Customer-exported proofs and offline verification survive all scenarios.

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
