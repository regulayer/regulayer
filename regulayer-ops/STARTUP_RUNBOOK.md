# Regulayer Startup Runbook

## Pre-Flight Checklist

- [ ] AWS credentials configured
- [ ] Terraform state backend accessible
- [ ] KMS keys created per environment
- [ ] RDS credentials in Secrets Manager
- [ ] Redis auth token configured

---

## Bootstrap Sequence

### 1. Infrastructure

```bash
cd infra/environments/prod
terraform init
terraform plan
terraform apply
```

### 2. Database Migration

```bash
# From Recorder container
python -m alembic upgrade head
```

### 3. Service Deployment

Order matters:

1. **Control Plane** (creates org/project/key tables)
2. **Redis** (queue backend)
3. **Recorder** (depends on DB + Redis)
4. **Gateway** (depends on Control Plane + Redis)
5. **Web** (depends on Control Plane)
6. **Status** (depends on all)

### 4. Health Verification

```bash
# Gateway
curl https://api.regulayer.io/health

# Recorder (internal only)
curl http://recorder.internal:8000/health

# Status
curl https://status.regulayer.io/v1/status
```

---

## Post-Startup Validation

- [ ] Health endpoints return 200
- [ ] Test API key authenticates
- [ ] Test decision records
- [ ] Proof export works
- [ ] Offline verification passes
- [ ] Status page shows OPERATIONAL

---

## Rollback

If startup fails:

1. Check logs in CloudWatch
2. Verify network connectivity
3. Check secrets access
4. Rollback Terraform if needed

```bash
terraform apply -target=module.specific -var-file=...
```
