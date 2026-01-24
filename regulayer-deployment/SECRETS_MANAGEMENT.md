# Regulayer Secrets Management

## Key Rings

| Ring | Purpose | Rotation |
|------|---------|----------|
| SDK API Keys | Customer authentication | On revoke |
| Attestation Keys | Ed25519 signing | Annual |
| Service Auth | Inter-service tokens | Monthly |
| Database | RDS credentials | Quarterly |
| Queue | Redis auth | Quarterly |

---

## Storage

| Secret Type | Storage | Access |
|-------------|---------|--------|
| Attestation Private Keys | AWS KMS / HSM | Attestation service only |
| API Keys (hashed) | PostgreSQL | Control Plane |
| Service Tokens | AWS Secrets Manager | Per-service IAM role |
| TLS Certificates | AWS ACM | Load balancers |

---

## Critical Rule

> **Attestation private keys NEVER leave the secure boundary.**
> They are generated in KMS/HSM and used only for signing.

---

## Key Lifecycle

### SDK API Keys
```
Create → Store (hashed) → Active → Revoke → Audit log
```

### Attestation Keys
```
Generate (HSM) → Deploy → Sign → Rotate → Archive
```

---

## Access Logging

All key access is logged (append-only):

```json
{
  "event": "key_access",
  "key_type": "attestation",
  "action": "sign",
  "service": "attestation-service",
  "timestamp": "2026-01-24T22:00:00Z"
}
```

---

## Rotation Procedures

### Emergency (Key Compromise)

1. Revoke compromised key immediately
2. Generate new key in KMS
3. Deploy to service
4. Log incident with impact window
5. Notify affected customers

### Scheduled

1. Generate new key
2. Deploy alongside old
3. Cut over traffic
4. Archive old key
5. Update audit log

---

## Environment Separation

| Environment | Key Ring |
|-------------|----------|
| dev | kms/regulayer-dev |
| staging | kms/regulayer-staging |
| prod | kms/regulayer-prod |

**Keys NEVER shared across environments.**
