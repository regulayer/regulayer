# Regulayer Audit Module

Comprehensive documentation for independent cryptographic audits.

## Core Principle

**Audits observe. They never participate.**

Auditors:
- ✅ Verify invariants
- ✅ Publish findings
- ✅ Document limitations

Auditors do NOT:
- ❌ Sign production data
- ❌ Run production code
- ❌ Deploy fixes
- ❌ Certify compliance

## Structure

```
regulayer-audit/
├── scope/
│   ├── AUDIT_SCOPE.md      # What auditors review
│   └── OUT_OF_SCOPE.md     # What auditors don't review
├── invariants/
│   ├── HASH_CHAIN_INVARIANTS.md
│   ├── ATTESTATION_INVARIANTS.md
│   ├── NON_REPUDIATION_INVARIANTS.md
│   └── GOVERNANCE_SEPARATION.md
├── reproducibility/
│   ├── DETERMINISM_TESTS.md
│   ├── REPLAY_PROCEDURES.md
│   └── OFFLINE_VERIFICATION.md
├── adversarial/
│   └── ADVERSARIAL_SCENARIOS.md
├── findings/
│   └── AUDIT_REPORT_TEMPLATE.md
└── README.md
```

## Invariants Defined

| Category | Invariants |
|----------|------------|
| Hash Chain | Immutability, Ordering, Append-Only, Determinism |
| Attestation | Signature Validity, Key Binding, Timestamp Inclusion |
| Non-Repudiation | Customer, Regulayer, Timestamp, Content, Export |
| Governance | Separation from crypto layer |

## Adversarial Scenarios

| Scenario | Customer Proofs Survive |
|----------|------------------------|
| Malicious Customer | ✅ |
| Compromised SDK | ✅ |
| Key Compromise | ✅ (pre-compromise) |
| Insider Threat | ✅ |
| Total Regulayer Compromise | ✅ |
| Regulayer Shutdown | ✅ |

## Ultimate Guarantee

> Even if Regulayer ceases to exist, exported proofs remain mathematically valid.

## For Auditors

1. Start with `AUDIT_SCOPE.md`
2. Test each invariant in `invariants/`
3. Run reproducibility tests
4. Model adversarial scenarios
5. Use `AUDIT_REPORT_TEMPLATE.md` for findings

## Language Guidelines

Use: "Verified", "Tested", "Observed", "Documented"

Never use: "Certified", "Approved", "Compliant", "Guaranteed"
