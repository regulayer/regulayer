# Regulayer Security Overview

## For Enterprise Security Reviews

### Architecture

```
Customer SDK
     ↓
Ingestion Gateway (rate limiting, auth)
     ↓
Durable Queue (per-project ordering)
     ↓
Decision Recorder (hash chain, attestation)
     ↓
Immutable Storage
```

### Cryptographic Guarantees

| Feature | Algorithm | Purpose |
|---------|-----------|---------|
| Record Hashing | SHA-256 | Tamper detection |
| Chain Linking | Hash chain | Ordering proof |
| Attestation | Ed25519 | Non-repudiation |
| Canonicalization | RFC 8785 | Determinism |

### Access Control

- API keys with scoped permissions
- Role-based access (Owner, Admin, Member, Auditor)
- Project-level isolation
- Audit logging of all access

### Data Protection

- TLS 1.3 in transit
- AES-256 at rest
- No payload inspection by Regulayer
- Customer-controlled retention

### Incident Response

- Cryptographic incident registry
- Trust impact assessment
- Automatic chain flagging
- Manual replay capability

---

## Common Security Questions

**Q: Can Regulayer read our decision data?**
A: No. Regulayer processes payloads but does not inspect content. SSH-style: we see metadata, not meaning.

**Q: What if Regulayer is compromised?**
A: Proofs are self-verifying. Export your proof bundles - they work offline, forever.

**Q: What if Regulayer disappears?**
A: Offline verifier works without Regulayer infrastructure. Your evidence survives.
