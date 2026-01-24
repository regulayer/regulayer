"""
Regulayer Provenance Models

Data models for multi-system evidence linking.

CORE PRINCIPLE (ABSOLUTE):
Linkage is contextual, not cryptographic.
Chains remain independent.
Relationships are declared, not enforced.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel


# ============================================================
# Relationship Types
# ============================================================

class RelationshipType(str, Enum):
    """Types of relationships between decisions."""
    
    INPUT_TO = "input_to"
    """This decision was input to another decision."""
    
    DERIVED_FROM = "derived_from"
    """This decision was derived from another decision."""
    
    REVIEWED_BY = "reviewed_by"
    """This decision was reviewed by another (human approval)."""
    
    APPROVED_BY = "approved_by"
    """This decision was approved by another decision."""
    
    OVERRIDES = "overrides"
    """This decision overrides a previous decision."""
    
    AGGREGATED_INTO = "aggregated_into"
    """This decision was aggregated into a higher-level decision."""
    
    DEPENDS_ON = "depends_on"
    """This decision depends on another decision."""
    
    VALIDATES = "validates"
    """This decision validates another decision."""


# ============================================================
# Provenance Link
# ============================================================

class ProvenanceLink(BaseModel):
    """
    A declared relationship between two decisions.
    
    CRITICAL INVARIANT:
    Links NEVER affect hashes, chains, or proofs.
    This is contextual metadata only.
    """
    
    id: UUID
    
    # Source and target decisions
    source_decision_id: UUID
    target_decision_id: UUID
    
    # Relationship type
    relationship: RelationshipType
    
    # Include cross-org/cross-system metadata
    source_org_id: Optional[UUID] = None
    target_org_id: Optional[UUID] = None
    source_system: Optional[str] = None  # e.g., "risk-model-v2"
    target_system: Optional[str] = None  # e.g., "portfolio-optimizer"
    
    # Declaration metadata
    declared_by: UUID  # org or user who declared this
    declared_by_name: Optional[str] = None
    declared_at: datetime
    
    # Optional context
    context: Optional[str] = None  # e.g., "Part of Q4 risk assessment pipeline"
    
    # Status
    active: bool = True


class ProvenanceLinkCreate(BaseModel):
    """Request to create a provenance link."""
    source_decision_id: UUID
    target_decision_id: UUID
    relationship: RelationshipType
    context: Optional[str] = None


# ============================================================
# Decision Relationships (Full Graph)
# ============================================================

class DecisionRelationships(BaseModel):
    """
    Complete relationship graph for a decision.
    """
    
    decision_id: UUID
    decision_hash: str
    
    # Incoming links (decisions that point to this one)
    incoming: List[ProvenanceLink] = []
    
    # Outgoing links (decisions this points to)
    outgoing: List[ProvenanceLink] = []
    
    def get_summary(self) -> str:
        """Get summary of relationships."""
        total = len(self.incoming) + len(self.outgoing)
        if total == 0:
            return "No linked decisions"
        return f"{len(self.incoming)} incoming, {len(self.outgoing)} outgoing relationships"


# ============================================================
# Provenance Graph (Multi-Decision)
# ============================================================

class ProvenanceNode(BaseModel):
    """A node in the provenance graph."""
    decision_id: UUID
    decision_hash: str
    org_id: Optional[UUID] = None
    org_name: Optional[str] = None
    system: Optional[str] = None
    recorded_at: datetime


class ProvenanceEdge(BaseModel):
    """An edge in the provenance graph."""
    source_id: UUID
    target_id: UUID
    relationship: RelationshipType


class ProvenanceGraph(BaseModel):
    """
    A graph of connected decisions.
    
    Note: This is for visualization only.
    Each decision's proof is independently verifiable.
    """
    
    nodes: List[ProvenanceNode] = []
    edges: List[ProvenanceEdge] = []
    
    # Graph metadata
    root_decision_id: Optional[UUID] = None
    generated_at: datetime


# ============================================================
# Audit Events
# ============================================================

class ProvenanceEventType(str, Enum):
    LINK_CREATED = "link_created"
    LINK_REMOVED = "link_removed"
    GRAPH_EXPORTED = "graph_exported"


class ProvenanceEvent(BaseModel):
    """Append-only audit log for provenance events."""
    id: UUID
    event_type: ProvenanceEventType
    
    # Actor
    actor: str
    org_id: UUID
    
    # Details
    link_id: Optional[UUID] = None
    source_decision_id: Optional[UUID] = None
    target_decision_id: Optional[UUID] = None
    
    # Timestamp
    timestamp: datetime


# ============================================================
# Linking Semantics
# ============================================================

LINKING_ACTIONS = {
    "does": {
        "ui": "Shows dependency graph",
        "audits": "Explains workflows",
        "courts": "Reconstructs timelines",
        "governance": "Enables reasoning",
    },
    "never_does": {
        "merge_chains": "❌ Never merges chains",
        "create_hashes": "❌ Never creates new hashes",
        "affect_verification": "❌ Never affects verification",
        "change_custody": "❌ Never changes custody",
        "alter_proofs": "❌ Never alters proofs",
    }
}
