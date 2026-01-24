# Regulayer Interoperability Module

Open, stable, regulator-friendly interfaces for external systems.

## Core Principle (Non-Negotiable)

**Interoperability exposes facts — never authority.**

External systems can:
- ✅ Read
- ✅ Verify
- ✅ Reason

External systems cannot:
- ❌ Write
- ❌ Sign
- ❌ Mutate
- ❌ Re-attest
- ❌ Extend cryptographic trust

## Open Schemas

All schemas are:
- Versioned
- Immutable once published
- Backward compatible only

### Evidence Bundle (`formats/evidence.schema.json`)

Canonical definition for proof bundles:
- Decision record
- Cryptographic attestation
- Chain position
- Verification metadata

### Provenance Graph (`formats/provenance.schema.json`)

Multi-system decision relationships:
- Nodes (decisions)
- Edges (relationships)
- Contextual metadata only

### Governance Overlay (`formats/governance.schema.json`)

Governance metadata:
- Annotations
- Reviews
- Classifications
- Retention policies
- Visibility controls

**Critical invariant**: Governance never affects proof validity.

## External Adapters

All adapters are **read-only**:
- Never call recorder
- Never touch crypto
- Process exported artifacts only

### Court Adapter (`adapters/court.py`)

Generates judge-friendly evidence packets:
- Plain English summary
- Technical appendix
- Verification instructions

### Auditor Adapter (`adapters/auditor.py`)

Generates SOC2/ISO evidence feeds:
- Control mappings
- Evidence collection
- Audit-ready export

### Regulator Adapter (`adapters/regulator.py`)

Generates regulatory review packages:
- EU AI Act documentation
- Sector-specific reports
- Executive summaries

## Registry

The registry publishes:
- Supported schema versions
- Deprecation timelines
- Schema content hashes

This prevents:
- Silent changes
- Interpretation drift
- Legal ambiguity

## Validation

Third parties can validate:
- "This bundle conforms to Regulayer Evidence v1.0"
- "This provenance graph is well-formed"
- "This governance overlay did not affect proofs"

## Trust Model

```
Regulayer                           External Systems
-----------                         ----------------
Recorder [Writes]                   Courts [Read, Verify]
Attestation [Signs]      →          Auditors [Read, Validate]
Chain [Appends]                     Regulators [Read, Review]
                                    Third Parties [Verify]
```

## Language Rules

Documents use:
- "Supports"
- "Enables"
- "Can be used by"

Never:
- "Certifies"
- "Guarantees compliance"
