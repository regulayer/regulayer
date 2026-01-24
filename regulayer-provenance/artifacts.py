"""
Regulayer Provenance Artifacts

Generates legal and audit documentation for provenance.

Language rules:
- "Linked for context"
- "No cryptographic dependency"
- "Independently verifiable"
"""

from datetime import datetime
from typing import List

from .models import (
    ProvenanceLink,
    ProvenanceGraph,
    DecisionRelationships,
    LINKING_ACTIONS,
)


# ============================================================
# Document Generators
# ============================================================

def generate_provenance_trust_note() -> str:
    """Generate PROVENANCE_TRUST_NOTE.md content."""
    does = LINKING_ACTIONS["does"]
    never = LINKING_ACTIONS["never_does"]
    
    return f"""# Provenance Trust Note

## Core Principle

**Linkage is contextual, not cryptographic.**

Chains remain independent.
Relationships are declared, not enforced.

## What Linking DOES

| Purpose | Effect |
|---------|--------|
| UI | {does["ui"]} |
| Audits | {does["audits"]} |
| Courts | {does["courts"]} |
| Governance | {does["governance"]} |

## What Linking NEVER Does

| Area | Guarantee |
|------|-----------|
| Chains | {never["merge_chains"]} |
| Hashes | {never["create_hashes"]} |
| Verification | {never["affect_verification"]} |
| Custody | {never["change_custody"]} |
| Proofs | {never["alter_proofs"]} |

## Verification Independence

Each linked decision has its own:

1. Cryptographic hash
2. Chain position
3. Proof bundle
4. Offline verification capability

Provenance links are metadata that help humans understand context.
They have no effect on cryptographic verification.

---
Generated: {datetime.utcnow().isoformat()}
"""


def generate_multi_system_audit_explanation() -> str:
    """Generate MULTI_SYSTEM_AUDIT_EXPLANATION.md content."""
    return f"""# Multi-System Audit Explanation

## Purpose

This document explains how Regulayer represents relationships between decisions across multiple AI systems, projects, and organizations.

## Architecture

```
System A (Risk Model)     System B (Approval Engine)     System C (Portfolio)
     │                           │                            │
     ▼                           ▼                            ▼
 Decision A1    ──────▶     Decision B1    ──────▶      Decision C1
    │                           │                            │
 [Hash: abc...]             [Hash: def...]              [Hash: ghi...]
    │                           │                            │
 [Chain: A]                 [Chain: B]                  [Chain: C]
```

## Key Points for Auditors

### 1. Independent Chains

Each system maintains its own chain. Provenance links connect decisions across chains without merging them.

### 2. Relationship Types

- **Input to**: Data flow from one decision to another
- **Derived from**: Decision based on another
- **Reviewed by**: Human oversight relationship
- **Approved by**: Approval workflow
- **Aggregated into**: Roll-up relationship

### 3. Verification

To verify a multi-system workflow:

1. Verify each decision independently
2. Use provenance links to understand the flow
3. Each decision's validity is independent

### 4. Timeline Reconstruction

Provenance links enable auditors to:

- Trace decision flow across systems
- Understand data dependencies
- Reconstruct event sequences

## Important Note

Provenance links explain context. They do not affect the cryptographic validity of any decision.

---
This document does not constitute legal advice.
Generated: {datetime.utcnow().isoformat()}
"""


def generate_court_dependency_reconstruction() -> str:
    """Generate COURT_DEPENDENCY_RECONSTRUCTION.md content."""
    return f"""# Court Dependency Reconstruction

## Purpose

This document explains how courts and regulators can use Regulayer provenance data to reconstruct decision dependencies across multiple systems.

## Reconstruction Process

### Step 1: Identify Root Decisions

Start with the decision(s) of interest. Each decision has:

- Unique ID
- Cryptographic hash
- Recording timestamp
- Organization/system of origin

### Step 2: Expand Relationships

Use provenance links to find connected decisions:

- Upstream: Decisions that informed this one
- Downstream: Decisions influenced by this one
- Lateral: Related decisions at the same level

### Step 3: Verify Independently

Each decision in the graph can be verified independently:

```
For each decision in the graph:
    Export proof bundle
    Run offline verifier
    Confirm: VALID / INVALID
```

### Step 4: Build Timeline

Using timestamps and relationships:

1. Order decisions chronologically
2. Map data flow between systems
3. Identify human intervention points
4. Reconstruct the full decision pipeline

## Presentation Format

For court presentation, we recommend:

| Time | System | Decision | Relationship | Verified |
|------|--------|----------|-------------|----------|
| T1 | Risk Model | R-001 | — | ✓ |
| T2 | Approval | A-001 | Reviews R-001 | ✓ |
| T3 | Portfolio | P-001 | Aggregates A-001 | ✓ |

## Important Clarification

- Provenance links are **declared relationships**, not **cryptographic dependencies**
- Each decision is **independently verifiable**
- Chain integrity is **maintained per-system**
- Links are **metadata for auditors**, not cryptographic proofs

---
This document does not constitute legal advice.
Generated: {datetime.utcnow().isoformat()}
"""


def generate_graph_export(graph: ProvenanceGraph) -> dict:
    """
    Generate exportable graph structure.
    
    This is for visualization and audit purposes only.
    """
    return {
        "provenance_graph": {
            "root_decision": str(graph.root_decision_id) if graph.root_decision_id else None,
            "generated_at": graph.generated_at.isoformat(),
            "nodes": [
                {
                    "decision_id": str(n.decision_id),
                    "decision_hash": n.decision_hash,
                    "org_name": n.org_name,
                    "system": n.system,
                    "recorded_at": n.recorded_at.isoformat(),
                }
                for n in graph.nodes
            ],
            "edges": [
                {
                    "source": str(e.source_id),
                    "target": str(e.target_id),
                    "relationship": e.relationship.value,
                }
                for e in graph.edges
            ],
            "verification_note": (
                "This graph is for contextual understanding only. "
                "Each node (decision) is independently verifiable. "
                "Edges (links) do not affect cryptographic proofs."
            ),
        }
    }
