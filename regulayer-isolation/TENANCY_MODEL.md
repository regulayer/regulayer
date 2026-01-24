# Regulayer Tenancy Model

## Multi-Tenant Isolation Guarantees

### Hierarchy
```
Organization (Org)
  └── Project
       └── API Key (scoped)
            └── Decisions
```

### Isolation Boundaries

| Boundary | Guarantee |
|----------|-----------|
| Org → Org | Complete data isolation |
| Project → Project | Separate hash chains |
| Key → Key | Scoped permissions |

### Database Isolation

- **No cross-org joins possible** — enforced at schema level
- Every query includes `org_id` or `project_id` filter
- Row-level security where supported

### Queue Isolation

- Separate Redis streams per project
- Per-project ordering guarantees
- No message visibility across projects

### Cryptographic Isolation

- Each project has independent hash chain
- Attestation keys are project-scoped
- Proofs are self-contained (no external references)

### Failure Isolation

- Org quota exceeded → only that org blocked
- Project rate limited → only that project throttled
- Key revoked → only that key fails
- Recorder outage affects all (unavoidable)

### What Is NOT Isolated

| Shared Resource | Why |
|-----------------|-----|
| Recorder service | Single source of truth |
| Attestation service | Centralized signing |
| Infrastructure | Cost efficiency |

**Important**: Shared infrastructure does NOT compromise isolation of facts.
Each org's proofs are independently verifiable regardless of other tenants.

## Provable Guarantees

1. **No data leakage**: Org A cannot see Org B's decisions
2. **No priority bypass**: Rate limits apply equally
3. **No chain entanglement**: Tampering in Org A doesn't affect Org B's proofs
4. **Independent verification**: Each org's proofs work offline, standalone
