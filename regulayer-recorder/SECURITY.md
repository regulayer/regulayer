# Security Policy

## Reporting Security Issues

**DO NOT** open public GitHub issues for security vulnerabilities.

Instead, email security@regulayer.io with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested mitigation (if any)

We will respond within 48 hours.

## Security Measures

### Cryptographic Integrity

- **Signature Verification**: All incoming events are signature-verified
- **Hash Chaining**: SHA-256-based chain ensures tamper detection
- **Immutable Storage**: Append-only database with blocked mutations

### Data Protection

- **No PII Storage**: Only cryptographic hashes stored
- **TLS Required**: All connections must use HTTPS
- **Prepared Statements**: SQL injection prevention
- **Constant-Time Comparison**: Signature verification immune to timing attacks

### Authentication

- **API Key Required**: HMAC secret key for signature verification
- **SDK Version Control**: Only allowed SDK versions accepted
- **Timestamp Validation**: Prevents replay attacks via drift limits

### Operational Security

- **No Stack Traces**: Error responses never expose implementation details
- **Minimal Logging**: No sensitive data in logs
- **Health Monitoring**: Service degradation detection
- **Permission Enforcement**: Database permissions enforce immutability

## Known Limitations (Phase 1)

### HMAC Signature (Temporary)

**Current:** HMAC-SHA256 signature verification  
**Limitation:** Does not provide non-repudiation  
**Mitigation:** Abstracted interface allows asymmetric upgrade (Ed25519/RSA) without breaking changes  
**Timeline:** Phase 2

### Single Chain

**Current:** Single global hash chain  
**Limitation:** Not horizontally scalable  
**Mitigation:** `chain_id` field enables future sharding  
**Timeline:** Phase 3+

### No Disk Queue

**Current:** In-memory processing only  
**Limitation:** Events lost if service crashes during ingestion  
**Mitigation:** SDK retry logic provides resilience  
**Timeline:** Phase 2

## Security Best Practices

### Secrets Management

- Store `HMAC_SECRET_KEY` in vault (HashiCorp Vault, AWS Secrets Manager, etc.)
- Rotate secrets periodically
- Never commit secrets to version control
- Minimum 32-character secret key

### Database Security

- Use PostgreSQL with TLS/SSL
- Configure pg_hba.conf for IP restrictions
- Grant INSERT-only permissions to app user
- Regular backup strategy for disaster recovery
- Monitor for unauthorized UPDATE/DELETE attempts

### Network Security

- Deploy behind Web Application Firewall (WAF)
- Rate limiting on ingestion endpoint
- DDoS protection
- TLS 1.2+ only

### Monitoring & Alerting

- Alert on health endpoint returning `503`
- Monitor for unusual ingestion patterns
- Regular chain integrity verification
- Database disk space monitoring
- Failed authentication attempts tracking

## Compliance Considerations

### Auditability

- Every decision recorded with server timestamp
- Full chain verification capability
- Immutable audit trail
- Tamper-evident storage

### Data Minimization

- Only hashes stored (no raw data)
- No PII collection
- Deterministic pseudonymization via hashing

### Integrity Guarantees

- Cryptographic hash chaining
- Signature verification
- Duplicate detection
- Timestamp validation

## Incident Response

In case of security incident:

1. **Immediate**: Isolate affected systems
2. **Assess**: Determine scope and impact
3. **Notify**: Contact security@regulayer.io
4. **Verify**: Run full chain integrity verification
5. **Document**: Record all findings
6. **Remediate**: Apply fixes and patches
7. **Review**: Post-incident analysis

## Security Updates

This document is updated with each release. Last updated: 2026-01-20

## Contact

Security Team: security@regulayer.io  
Response SLA: 48 hours for critical issues
