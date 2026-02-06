# REGULAYER — PRODUCTION READINESS & LAUNCH SPECIFICATION
**Canonical Master Document**

## Purpose
This document defines the complete intended behavior of Regulayer as a production SaaS platform.
It bridges the gap between the current demo-integrated system and a fully functional, market-ready product.

This is the source of truth for:
- Architecture
- UI behavior
- API behavior
- Trust boundaries
- Business readiness
- Launch readiness

---

## 1. What Regulayer Is (At Launch)

Regulayer is a forensic infrastructure SaaS that allows organizations to:
- Record AI/automation decisions
- Make those decisions cryptographically immutable
- Prove later what happened, when, and by whom
- Export evidence that remains verifiable without Regulayer

Regulayer:
- ❌ Does NOT judge correctness
- ❌ Does NOT certify compliance
- ❌ Does NOT claim safety or fairness
- ✅ Provides tamper-detectable evidence

---

## 2. Core System Pillars (Non-Negotiable)

| Pillar | Meaning |
| :--- | :--- |
| **Cryptographic Truth** | Lives ONLY in `regulayer-recorder` |
| **Separation of Concerns** | UI, billing, governance never touch crypto |
| **Offline Verifiability** | Proofs verify without Regulayer |
| **Append-Only** | No deletes, no edits, no rewrites |
| **Explicit Failure** | Rejections are visible, not silent |

---

## 2.1. Source of Truth Precedence

If systems disagree, truth is determined in this order:
1. **Offline proof verification result** (Highest Authority)
2. Recorder database state
3. Export bundle contents
4. Verifier API
5. UI display
6. Status page
7. Logs / dashboards

> **Rule**: If the UI or API contradicts offline verification, the UI/API is wrong.

---

## 3. Current State vs Target State

| Current (Demo) | Target (Production) |
| :--- | :--- |
| Demo org auto-created | Real signup → real org → real project |
| Demo decisions pre-seeded | No data until customer ingests |
| Dashboard populated artificially | SDK keys work immediately |
| No real customer onboarding | All pages populated from real APIs |
| SDK exists but not fully wired | Governance, reports, exports all functional |
| Governance UI partially present | Billing enforced |
| Reports exist but not connected everywhere | Demo isolated and optional |

---

## 4. User Types & Permissions

| Role | Can Do | Cannot Do |
| :--- | :--- | :--- |
| **Owner** | Everything incl billing | Modify crypto |
| **Admin** | Governance, approvals | Billing |
| **Member** | Annotate, tag | Export proofs |
| **Auditor** | View, export only | Annotate |

---

## 5. Org Lifecycle (Real World)

### Signup Flow
1. User signs up
2. Org created
3. Default project created
4. API key generated (ingest scope)
5. Wizard starts (5-step)

### Org States
| State | Ingest | Verify | Export |
| :--- | :--- | :--- | :--- |
| **Active** | ✅ | ✅ | ✅ |
| **Trial Ended** | ❌ | ✅ | ✅ |
| **Frozen** | ❌ | ✅ | ✅ |
| **Closed** | ❌ | ❌ | ✅ |

---

## 5.1. Customer Lifecycle Enforcement

**Formal Onboarding Lifecycle**
`Signup` → `Trial` (14 days) → `Active` → `TrialEnded` → `Frozen` → `Closed`

**Lifecycle Rules**

| Behavior | Trial | Active | TrialEnded | Frozen | Closed |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ingest** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Verify** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Export** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **UI Banner** | "Trial: X days left" | None | "Trial Ended" | "Account Frozen" | N/A |

**Key Definitions**
- **Quota Reset**: Monthly on billing cycle anchor date.
- **Trial Start**: Immediately upon Signup.
- **Billing Kick-in**: When upgrading to Active OR when Trial expires (if card on file).
- **Multiple Projects**: Allowed, but all share the Org's billing status.
- **API Keys**: Scoped per Project. Frozen if Org is Frozen.
- **Export Guarantee**: User data is **ALWAYS** exportable, even if they never pay.

---

## 6. Web Application — Required Pages (Production)

**Must Exist & Be Fully Wired**

**Public**
- Landing
- Pricing
- Docs
- Login
- Signup

**App (Authenticated)**
- Dashboard
- Projects
- API Keys
- Usage
- Billing
- Exports
- Governance
- Reports
- Alerts
- Team
- Org Settings
- Audit Log
- Identity / SSO
- Residency
- Retention
- Lineage
- Provenance
- Deployment Mode

❗ **Demo data must NOT appear in real orgs**

---

## 7. Dashboard (Production Behavior)

**What It Shows**
- Trust status (live from Status Service)
- Usage (from Control Plane)
- Recent decisions (from Recorder)
- Alerts (from Status + Incident)
- No fake numbers

**What It Never Shows**
- Hashes
- Keys
- Signatures
- Chain internals

### Mandatory Empty States & Error UX

| Scenario | UX Behavior / Text |
| :--- | :--- |
| **Zero Decisions** | "No decisions recorded yet. Run your first trace:" (Show Code Snippet) |
| **Recorder Down** | **Alert Banner**: "Ingestion Latency Detected - Queueing Active" |
| **Queue Stalled** | **Warning**: "Processing Delays - Your data is safe" |
| **Governance Empty** | "Governance applies after recording. Waiting for data..." |
| **Reports Empty** | "Reports become available after first decision is finalized." |


---

## 8. SDK Integration (Critical Gap Today)

**What Must Work**
```python
from regulayer import trace, configure

configure(api_key="rl_live_xxx")

with trace(system="loan_approval") as t:
    t.set_input(...)
    t.set_output(...)
```

**Required Backend Wiring**
1. SDK → Gateway
2. Gateway → Control Plane (auth)
3. Gateway → Queue
4. Queue → Recorder
5. Recorder → DB
6. UI → Recorder read APIs


---

## 8.1 SDK Contract Definition

The SDK must handle failures explicitly. "First Success" means:

| Condition | HTTP Status | SDK Behavior |
| :--- | :--- | :--- |
| **Success** | `201 Created` | Return Trace ID (Success) |
| **Queued** | `202 Accepted` | **Warn**: "Decision queued for async processing" |
| **Duplicate** | `409 Conflict` | Raise `DuplicateDecisionError` |
| **Throttled** | `429 Too Many Requests` | Auto-retry w/ exp. backoff (max 3x) |
| **Frozen** | `403 Forbidden` | Raise `OrgFrozenError` |
| **Auth Fail** | `401 Unauthorized` | Raise `InvalidApiKeyError` |
| **Server Fail** | `5xx` | Auto-retry w/ exp. backoff -> Raise `ServiceUnavailableError` |


**Critical Rule**: The SDK **MUST NEVER** treat a request as successful unless it receives a `201` or `202` response from the Gateway.

**Idempotency Guarantee**: Client-side (via `request_id` or similar unique trace nonce). 


---

## 9. Ingestion Guarantees (Production)

| Scenario | Result |
| :--- | :--- |
| Duplicate decision_id | 409 |
| Out-of-order sequence | 409 |
| Invalid signature | 401 |
| Org frozen | 403 |
| Rate limit | 429 |
| Recorder down | 202 queued |

---

## 10. Governance (Currently Incomplete)

**Must Be Fully Functional**
- Tags
- Annotations
- Review states
- Policies
- Approvals
- Evidence export

**Governance:**
- Uses separate DB
- Never modifies recorder data
- Always append-only

**Data Deletion Policy**
> Regulayer does not support retroactive deletion of cryptographic records. Legal deletion requests result in redaction or access restriction, not removal of evidence.

---

## 11. Reports & Evidence (Must Be Wired)

**Report Types**
- System Trust Report
- Decision Trust Report
- Chain Integrity Report

**Evidence Bundles**
- Proof bundle
- Governance evidence
- Incident disclosures

**Export Rules**
- Always available
- Even if org frozen
- Even if Regulayer offline (offline verification)

---

## 12. Demo Mode (Current vs Intended)

**Demo Mode Rules**
- Separate org
- Separate banner
- Clearly labeled
- Limited ingestion
- Can export proofs

**Demo must NEVER:**
- Mix with real orgs
- Imply fake crypto
- Hide limitations

**Credential Separation**
> Demo org credentials must never generate "live" API keys, use the SDK without a demo flag, or be used to claim production capability. **Demo credentials are restricted to demo-mode gateways and are rejected by production ingestion endpoints.**

---

## 13. Billing & Enforcement

**Billing Enforces Only:**
- Ingestion
- Rate limits
- Quotas

**Billing NEVER Affects:**
- Proof validity
- Export
- Verification
- Stripe failure → system continues

---

## 14. Databases (Production)

| Service | DB |
| :--- | :--- |
| Recorder | `regulayer_recorder` |
| Control Plane | `regulayer_control` |
| Governance | `regulayer_governance` |

- No shared tables
- No cross-service writes

---

## 15. Environments

| Dev | Staging | Prod |
| :--- | :--- | :--- |
| Docker Compose | Same as prod | Managed DB |
| Demo enabled | Stripe test | KMS-backed secrets |
| | No demo | No demo |
| | | Audit logs enabled |

### Promotion Rules
1. **No Demo Mode in Staging**: Staging must mirror Prod perfectly.
2. **No Live Stripe in Dev**: Dev uses Test Mode only.
3. **Key Isolation**: Recorder keys are generated per ENV. Never reused.
4. **Watermarking**: Proofs generated in Staging must be marked "NON-PROD" in metadata.


---

## 16. Security & Keys
- Recorder keys persisted via volume
- Public keys exposed read-only
- Rotation manual only
- History preserved forever

---

## 17. Observability (Production)
- Structured logs
- Correlation IDs
- Health endpoints
- Status page
- Incident tracking

### Customer-Facing Incident Workflow
1. **Status Page**: The Source of Truth.
2. **UI Banners**: Mandatory if Status Page != All Systems Operational.
3. **Export Continuity**: Export button **MUST** function even during SEV-1 (via Direct Read-Replica or redundant path if possible, else Queue).

---

## 17.1. Continuity / 'Kill Switch' Protocol

If Regulayer ceases operations:
1. **Specs**: Hosted on GitHub (Public Repo).
2. **Reference Verifiers**: Hosted on GitHub + IPFS.
3. **Trust Registry**: Snapshot published to IPFS.

> **promise**: "If Regulayer ceases operations, customers retain full verification capability via published specs and reference tools."

---

---

## 18. What Is Still Missing Today (Explicit)

**Must Be Completed Before Launch**
- [ ] Remove demo data from real orgs
- [ ] Fully wire SDK → Gateway → Recorder
- [ ] Finish Governance UI wiring
- [ ] Finish Reports UI wiring
- [ ] Enforce billing gates
- [ ] Add real onboarding flow
- [ ] Add prod secrets handling
- [ ] Add staging environment
- [ ] Add monitoring & alerts
- [ ] Add launch-safe copy review

---

## 19. Launch Readiness Checklist
- [ ] Fresh org has zero data
- [ ] SDK records appear in dashboard
- [ ] Exports verify offline
- [ ] Billing blocks ingestion only
- [ ] Demo isolated
- [ ] All pages reachable
- [ ] No crypto exposed in UI
- [ ] Legal copy correct
- [ ] Status page live
- [ ] Incident workflow tested

### Commercial Readiness Gate
- [ ] Terms of Service live
- [ ] Privacy Policy live
- [ ] Support email active (`support@regulayer.ai`)
- [ ] Status page public (`status.regulayer.ai`)
- [ ] Sales language frozen
- [ ] "Kill Switch" repo public

**Support Boundaries**
> Regulayer support may assist with verification and export mechanics but **does not interpret, judge, or opine** on the meaning of decisions or outcomes.

---

## 20. Final Definition of “Done”

Regulayer is launch-ready when:
> A real customer can:
> 1. Sign up
> 2. Get an API key
> 3. Record a real decision from their app
> 4. See it in the dashboard
> 5. Govern it
> 6. Export it
> 7. Verify it offline
>
> **Even if Regulayer disappears**
