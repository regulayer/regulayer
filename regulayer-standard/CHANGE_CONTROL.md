# Change Control

## Document Status

| Property | Value |
|----------|-------|
| Version | 1.0.0 |
| Status | Stable |
| Last Updated | 2026-01-25 |
| Authority | FROZEN |

---

## Purpose

This document defines how the standard evolves while maintaining backward
compatibility and long-term stability. It is critical for courts, regulators,
and organizations with 10+ year retention requirements.

---

## 1. Immutability Guarantees

### 1.1 What Can NEVER Change

The following are PERMANENTLY FROZEN:

| Element | Guarantee |
|---------|-----------|
| Hash algorithm | SHA-256 semantics |
| Hash format | `sha256:<hex>` |
| Canonicalization | RFC 8785 |
| Chain linking | previous_hash semantics |
| Signature semantics | Signature over record_hash |
| Ed25519 | Algorithm support |

### 1.2 Why These Are Frozen

These elements are frozen because:

1. **Proofs already exist** using these formats
2. **Courts may reference** specific versions
3. **Long-term retention** requires stability
4. **Independent verifiers** depend on consistency

### 1.3 Eternal Validity

> **Proofs created today SHALL remain verifiable forever.**

This guarantee requires:
- Backward-compatible changes only
- Deprecated algorithms remain valid
- Old proof formats remain parseable

---

## 2. Versioning

### 2.1 Version Format

```
MAJOR.MINOR.PATCH
```

| Component | When Incremented |
|-----------|------------------|
| MAJOR | Breaking changes (VERY RARE) |
| MINOR | Backward-compatible additions |
| PATCH | Clarifications, typo fixes |

### 2.2 Current Version

```
1.0.0
```

---

## 3. Change Categories

### 3.1 Clarifications (PATCH)

Changes that:
- Fix typos
- Improve wording
- Add examples
- Clarify ambiguity

DO NOT change semantics.

### 3.2 Additions (MINOR)

Changes that:
- Add new OPTIONAL fields
- Support new algorithms (in addition to existing)
- Add new verification methods

DO NOT break existing implementations.

### 3.3 Breaking Changes (MAJOR)

Changes that:
- Modify hash semantics
- Change signature format
- Alter chain linking
- Remove supported algorithms

EXTREMELY RARE. Require multi-year notice.

---

## 4. Deprecation Policy

### 4.1 Deprecation Timeline

| Stage | Duration | Description |
|-------|----------|-------------|
| Current | Ongoing | Recommended for new use |
| Deprecated | 3+ years | Still valid, migration recommended |
| Legacy | Indefinite | Valid forever, no new implementations |

### 4.2 What Deprecation Means

- New implementations SHOULD use newer version
- Old proofs remain valid
- Verification MUST continue working
- Documentation remains available

### 4.3 What Deprecation Does NOT Mean

- Old proofs become invalid ❌
- Verification stops working ❌
- Standards are removed ❌

---

## 5. Algorithm Aging

### 5.1 Cryptographic Evolution

As cryptographic algorithms age:

1. New algorithms are added (MINOR version bump)
2. New implementations SHOULD use newer algorithms
3. Old algorithms remain supported indefinitely
4. Old proofs remain valid

### 5.2 Example: SHA-256 Aging

If SHA-256 is ever considered weak:

1. SHA-3 (or successor) added as option
2. New proofs SHOULD use SHA-3
3. SHA-256 proofs remain valid
4. SHA-256 verification continues working

### 5.3 Long-Term Timestamping

For very long-term validity:
- Wrap proofs with current-algorithm signatures
- Creates timestamped re-attestation
- Original proof remains untouched inside

---

## 6. Change Process

### 6.1 Proposal

1. Draft change proposal
2. Public review period (minimum 90 days)
3. Reference implementation (if semantic change)
4. Compatibility analysis

### 6.2 Approval Criteria

Changes MUST:
- Maintain backward compatibility
- Have reference implementation
- Pass independent review
- Not break existing proofs

### 6.3 Publication

1. Final review
2. Version bump
3. Changelog publication
4. Reference implementation update

---

## 7. Backward Compatibility Matrix

| Standard Version | 1.0 Proofs Valid? | 1.0 Verification Works? |
|------------------|-------------------|------------------------|
| 1.0.x | ✅ | ✅ |
| 1.1.x | ✅ | ✅ |
| 1.x.x | ✅ | ✅ |
| 2.x.x | ✅ | ✅ (with compatibility layer) |

---

## 8. Regulatory Considerations

### 8.1 Court Citations

Courts may cite specific standard versions:

> "Evidence verified per Evidence Standard v1.0.0"

This citation SHALL remain meaningful indefinitely.

### 8.2 Regulatory References

Regulatory requirements may reference:

> "Evidence conforming to Attestation Standard v1.x"

Minor version flexibility allows evolution without breaking references.

---

## 9. Change Log

### Version 1.0.0 (2026-01-25)

- Initial stable release
- Evidence Standard v1.0.0
- Attestation Standard v1.0.0
- Chain Standard v1.0.0
- Governance Overlay Standard v1.0.0

---

## 10. Contact

For change proposals or questions:

- Repository: [Public repository TBD]
- Mailing list: [TBD]
- Issue tracker: [TBD]

---

## Summary

> **The standard is designed to outlive any company.**

Changes are made carefully, backward compatibility is mandatory, and proofs
created today will remain valid for decades.
