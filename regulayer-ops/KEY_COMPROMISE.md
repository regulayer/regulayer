# Key Compromise Runbook

## Classification: SEV1 (Always)

Any suspected key compromise is SEV1 by default.

---

## Key Types

| Key | Compromise Impact |
|-----|-------------------|
| SDK API Key | Unauthorized ingestion |
| Attestation Key | Future signatures untrusted |
| Database Creds | Data access risk |
| Service Token | Lateral movement |

---

## Immediate Actions

### SDK API Key Compromise

```bash
# 1. Revoke immediately
ops-cli key revoke --key-id rl_live_xxx --reason "compromise"

# 2. Log to audit
# Automatic via revocation

# 3. Verify revocation
curl -H "X-API-Key: rl_live_xxx" https://api.regulayer.io/v1/ingest/decision
# Should return 401
```

**Trust Impact**: 
- Future ingestion blocked
- Past proofs STILL VALID (key was valid when used)

---

### Attestation Key Compromise

**THIS IS CRITICAL**

```bash
# 1. Generate new key in KMS
ops-cli attestation rotate --environment prod

# 2. Deploy new key to service
kubectl rollout restart deployment/attestation

# 3. Mark old key as compromised
ops-cli attestation mark-compromised --key-id att_xxx --window "2026-01-20 to 2026-01-24"

# 4. Notify all customers
# Template in /templates/attestation-compromise.md
```

**Trust Impact**:
- Signatures during window are suspect
- Must disclose to customers
- Offline verification includes key metadata

---

## Post-Compromise

1. Root cause analysis
2. Customer notification
3. Incident registry entry
4. Prevention measures
5. Security review

---

## What Customers Can Still Prove

Even after compromise:

✅ Hash chain integrity (not signature-dependent)
✅ Record existence
✅ Ordering

❌ Attestation validity during window
