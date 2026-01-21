# Key Rotation Policy

Version: 1.0.0  
Status: NORMATIVE

---

## Purpose

This document defines how key rotation is handled in Regulayer without breaking historical verification.

---

## Core Principle

> **Key rotation does NOT invalidate past signatures.**

Signatures made with old keys remain valid forever.
Revocation is contextualized via timestamps.

---

## Key Rotation Rules

### 1. Rotation is Append-Only

The key rotation log:
- Only accepts new entries
- Never modifies existing entries
- Never deletes entries

### 2. Signatures Are Time-Dependent

When verifying a signature:
1. Determine when the signature was made
2. Look up which key was valid at that time
3. Verify against the historically-valid key

### 3. Revocation ≠ Invalidation

If a key is revoked:
- Signatures made BEFORE revocation remain valid
- Signatures made AFTER revocation are invalid
- The revocation timestamp is authoritative

---

## Key Rotation Log Format

```json
{
  "entry_id": "uuid",
  "identity_id": "guard-001",
  "old_key_fingerprint": "ed25519:abc123...",
  "new_key_fingerprint": "ed25519:def456...",
  "effective_at": "2026-01-21T00:00:00Z",
  "reason": "Scheduled rotation",
  "signatures_before_rotation_valid": true,
  "rotation_recorded_at": "2026-01-21T00:00:00Z"
}
```

---

## Rotation Reasons

| Reason | Description | Historical Impact |
|--------|-------------|-------------------|
| Scheduled rotation | Regular security practice | None |
| Key compromise | Security incident | None (past still valid) |
| Personnel change | Role transition | None |
| Algorithm upgrade | Moving to stronger key | None |

---

## Verification Algorithm

```python
def verify_historical_signature(signature, signed_at, identity_id):
    # 1. Find the key valid at signing time
    key = key_rotation_log.get_valid_key_at(identity_id, signed_at)
    
    # 2. Verify signature with historical key
    return verify_signature(signature, key)
```

---

## Archival Considerations

When creating archival bundles:
1. Include relevant key rotation history
2. Include public key fingerprints
3. Document which key was valid at signing

This allows future verifiers to understand key context.

---

## Compliance Notes

Key rotation policy supports:
- SOC 2 key management requirements
- NIST SP 800-57 key lifecycle
- PCI DSS key rotation requirements

---

**END OF KEY ROTATION POLICY**
