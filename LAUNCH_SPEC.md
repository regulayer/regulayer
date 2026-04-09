# REGULAYER — OFFICIAL LAUNCH SPECIFICATION (v1.0)

## 1️⃣ Product Definition
**What Regulayer Is**
Regulayer is a cryptographic evidence infrastructure platform for AI and automated decision systems.

It enables organizations to:
- Record decisions
- Seal them cryptographically
- Prove later what happened
- Export verifiable evidence
- Survive audits and disputes

**What Regulayer Is NOT**
- ❌ Not an AI safety tool
- ❌ Not a compliance certification tool
- ❌ Not a model monitoring platform
- ❌ Not a fairness auditor
- ❌ Not a blockchain

## 2️⃣ Core Product Pillars (Must Be True at Launch)
- **Cryptographic truth lives ONLY in Recorder**
- **Append-only enforcement at DB level**
- **Offline verification works without Regulayer**
- **Governance never affects crypto**
- **Billing never affects proof validity**
- **Demo environment fully isolated**
- **Async ingestion (202) and Sync Gate Mode (201/403)**
- **Deterministic export**
- **Multi-DB isolation**
- **RDS production ready**

## 3️⃣ Full Architecture (Launch Version)

### Core Services
| Service | Purpose | Database |
| :--- | :--- | :--- |
| `regulayer-recorder` | Crypto truth | `regulayer_recorder` |
| `regulayer-ingestion-gateway` | Ingestion + policy | none |
| `regulayer-ingestion-queue` | Async processing | Redis |
| `regulayer-control-plane` | Auth + orgs + billing | `regulayer_control` |
| `regulayer-governance` | Review + tags | `regulayer_governance` |
| `regulayer-incidents` | Trust alerts | `regulayer_incidents` |
| `regulayer-web` | Frontend | none |

## 4️⃣ External Services at Launch

### Required

**1. AWS RDS (PostgreSQL 15+)**
- 4 databases
- SSL required
- No master user access
- Strict isolation

**2. AWS EC2 (App Hosting)**
- Docker deployment
- Production environment

**3. Redis (Elasticache or self-hosted)**
- Async queue
- DLQ support

**4. Stripe**
- Billing
- Subscription
- Webhooks

**5. Cloudflare**
- DNS
- SSL termination
- CDN
- Rate limiting (optional)

### Optional (Future)
- AWS KMS (Key management)
- S3 (Export archive)
- SES (Email)
- IPFS (Trust freeze mirror)
- Sentry (Error tracking)

## 5️⃣ Landing Page (Launch Design)

### Hero Section
- **Headline**: Cryptographic Proof for AI Decisions.
- **Subtext**: Record. Seal. Prove. Survive audits.
- **CTA**: Get Started | View Docs

### Problem Section
“AI decisions are easy to change. Logs can be edited. Databases can be altered.”

### Solution Section
- Append-only hash chain
- Ed25519 signatures
- Offline verification
- Governance overlay

### How It Works Section
1. Record decision
2. Seal cryptographically
3. Export and verify

### Trust Section
- Open algorithms
- Independent verification
- No vendor lock-in
- Offline capable

### Pricing Section
- Starter
- Growth
- Enterprise

### Footer
- Docs
- Security
- Status page
- GitHub reference verifier
- Privacy Policy
- Terms

## 6️⃣ Onboarding Flow

### Step 1 — Signup Form
- Full Name
- Work Email
- Company Name
- Password
- Accept Terms
- *Optional*: Company Size, Industry

### Step 2 — Organization Created
*Auto-create:*
- Org
- Default project
- API key

### Step 3 — Onboarding Wizard
- **Page 1**: “What system are you recording?” (Dropdown: Loan Approval / Insurance / HR / Custom)
- **Page 2**: Copy-paste SDK snippet
- **Page 3**: Test ingestion button
- **Page 4**: Verify first record
- **Page 5**: Invite team members

## 7️⃣ Dashboard (Launch Requirements)

### Top Section — Trust Status
- **Badge**: Green / Yellow / Red
- **Text**: "System Trust Status"
- **Shows**: Chain integrity, Incident alerts, Governance availability

### Core Metrics
- Total Decisions
- Pending Decisions
- Sealed Decisions
- Projects Count
- Storage Usage

### Recent Decisions Table
- `decision_id`
- Project
- System
- Status (Pending / Sealed)
- Created At
- Actions (View / Export)

### Alerts Widget
- DLQ failures
- Integrity check failures
- Governance unavailable

## 8️⃣ Projects Page
- Project Name
- Project ID
- Created Date
- API Keys Count
- Decisions Count
- **Actions**: Create project, Delete project (soft only), View project usage

## 9️⃣ API Keys Page
- Key ID
- Scope
- Created
- Last Used
- Status
- **Actions**: Create, Revoke, Rotate
- **Rules**: Scoped per project. Frozen org disables ingestion.

## 🔟 Governance Page
**For each decision:**

### Sections
1. **Cryptographic Record** (Read-only): `record_hash`, `signature`, `previous_hash`, `timestamp`
2. **Governance Overlay**: Tags, Annotations, Review State, Reviewer, Timestamp

### Actions
- **Export Button**: Download evidence bundle

### Rules
- Frozen org = read-only
- Member role = no review
- Overlay not part of signature

## 1️⃣1️⃣ Reports Page
**Report Types**:
- Chain Integrity Report
- Decision Trust Report
- System Trust Report
*Each downloadable as JSON.*

## 1️⃣2️⃣ Alerts Page
Lists incidents from `regulayer-incidents`:
- Incident Type
- Severity
- Timestamp
- Affected Component
- Status (Resolved/Active)

## 1️⃣3️⃣ Billing Page
**Stripe Integration**:
- Plan
- Usage
- Ingest quota
- Overages
- Billing history
- Upgrade plan

**Rules**:
- Billing blocks ingestion only
- Never blocks export
- Stripe failure does not corrupt crypto

## 1️⃣4️⃣ Documentation (Must Exist at Launch)
- **Getting Started**: Install SDK, First trace
- **Ingestion Semantics**: 202 vs 409 vs 429 vs 403
- **Governance**: Concepts
- **Export & Verification**: Offline verification guide
- **Architecture**: Trust model
- **FAQ**: Blockchain? Correctness? Deletion? Shutdown?

## 1️⃣5️⃣ SDK Requirements
**Language**: Python v1 at launch
**Must support**:
- `trace()`
- `configure()`
- `decision_id` generation
- idempotency
- retry logic
- 202 handling
- explicit error types

## 1️⃣6️⃣ Full Technical Flow
`SDK` → `Gateway` → `Queue` → `Recorder` → `DB` → `Dashboard`

**Export**: Recorder verifies chain, signs record, attaches governance, returns JSON.
**Offline**: Verifier validates hash, signatures, and chain.

## 1️⃣7️⃣ Production Infrastructure
- **AWS EC2**: Dockerized services
- **AWS RDS**: 4 DBs, SSL
- **Redis**: Queue + DLQ
- **Cloudflare**: DNS, HTTPS
- **Stripe**: Billing
- **SES**: OTP emails

## 1️⃣8️⃣ Security Requirements
- JWT auth
- Role-based governance
- DB isolation
- SSL enforced
- No public governance port
- No crypto in UI
- No master DB usage
- Append-only enforcement

## 1️⃣9️⃣ Definition of Launch Ready
Regulayer is launch ready when:
- [ ] New user signs up
- [ ] Org created
- [ ] API key created
- [ ] SDK records decision
- [ ] Gateway returns 202
- [ ] Dashboard shows Pending
- [ ] Worker processes
- [ ] Dashboard shows Sealed
- [ ] Governance works
- [ ] Export works
- [ ] Offline verification passes
- [ ] Billing blocks ingestion
- [ ] Frozen blocks ingestion
- [ ] Export always works
- [ ] RDS production DB connected
- [ ] SSL enforced
- [ ] No demo leakage
- [ ] Incident system live
- [ ] Status page live

## 2️⃣0️⃣ Startup Positioning
**Regulayer is positioned as**: "Forensic-grade cryptographic evidence infrastructure for AI systems."
**Target customers**: Fintech, Insurance, Healthcare AI, HR tech, Enterprise AI deployments, Regulated industries.
