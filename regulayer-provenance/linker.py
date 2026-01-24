"""
Regulayer Provenance Linker

Creates and manages provenance links between decisions.

CRITICAL GUARANTEES:
- No cross-chain enforcement
- No crypto dependency
- Links are metadata only
"""

from datetime import datetime
from typing import Optional, List
from uuid import uuid4

from .models import (
    ProvenanceLink,
    ProvenanceLinkCreate,
    DecisionRelationships,
    ProvenanceGraph,
    ProvenanceNode,
    ProvenanceEdge,
    ProvenanceEvent,
    ProvenanceEventType,
    RelationshipType,
)


# ============================================================
# Provenance Linker
# ============================================================

class ProvenanceLinker:
    """
    Creates and manages provenance links.
    
    IMPORTANT: Links are contextual metadata only.
    They NEVER affect cryptographic verification.
    """
    
    def __init__(self, org_id: str):
        self.org_id = org_id
        self.links: List[ProvenanceLink] = []
        self.events: List[ProvenanceEvent] = []
    
    def create_link(
        self,
        source_decision_id: str,
        target_decision_id: str,
        relationship: RelationshipType,
        declared_by: str,
        context: Optional[str] = None
    ) -> ProvenanceLink:
        """
        Create a provenance link between two decisions.
        
        This creates a contextual relationship, not a cryptographic one.
        """
        link = ProvenanceLink(
            id=uuid4(),
            source_decision_id=source_decision_id,
            target_decision_id=target_decision_id,
            relationship=relationship,
            declared_by=declared_by,
            declared_at=datetime.utcnow(),
            context=context,
        )
        self.links.append(link)
        
        # Log the event
        event = ProvenanceEvent(
            id=uuid4(),
            event_type=ProvenanceEventType.LINK_CREATED,
            actor=declared_by,
            org_id=self.org_id,
            link_id=link.id,
            source_decision_id=source_decision_id,
            target_decision_id=target_decision_id,
            timestamp=datetime.utcnow(),
        )
        self.events.append(event)
        
        return link
    
    def remove_link(self, link_id: str, removed_by: str) -> bool:
        """
        Remove a provenance link (soft delete).
        
        This marks the link as inactive.
        Historical audit trail is preserved.
        """
        for link in self.links:
            if str(link.id) == link_id:
                link.active = False
                
                # Log the event
                event = ProvenanceEvent(
                    id=uuid4(),
                    event_type=ProvenanceEventType.LINK_REMOVED,
                    actor=removed_by,
                    org_id=self.org_id,
                    link_id=link.id,
                    timestamp=datetime.utcnow(),
                )
                self.events.append(event)
                
                return True
        
        return False
    
    def get_relationships(self, decision_id: str) -> DecisionRelationships:
        """Get all relationships for a decision."""
        incoming = [
            link for link in self.links
            if str(link.target_decision_id) == decision_id and link.active
        ]
        outgoing = [
            link for link in self.links
            if str(link.source_decision_id) == decision_id and link.active
        ]
        
        return DecisionRelationships(
            decision_id=decision_id,
            decision_hash="unchanged",  # Never modified by links
            incoming=incoming,
            outgoing=outgoing,
        )
    
    def build_graph(
        self,
        root_decision_id: str,
        max_depth: int = 5
    ) -> ProvenanceGraph:
        """
        Build a provenance graph starting from a decision.
        
        This traverses links to build a visualization graph.
        """
        visited = set()
        nodes = []
        edges = []
        
        def traverse(decision_id: str, depth: int):
            if depth > max_depth or decision_id in visited:
                return
            
            visited.add(decision_id)
            
            # Add node (mock data)
            nodes.append(ProvenanceNode(
                decision_id=decision_id,
                decision_hash="sha256:...",
                recorded_at=datetime.utcnow(),
            ))
            
            # Find connected decisions
            for link in self.links:
                if not link.active:
                    continue
                
                if str(link.source_decision_id) == decision_id:
                    edges.append(ProvenanceEdge(
                        source_id=link.source_decision_id,
                        target_id=link.target_decision_id,
                        relationship=link.relationship,
                    ))
                    traverse(str(link.target_decision_id), depth + 1)
                
                if str(link.target_decision_id) == decision_id:
                    edges.append(ProvenanceEdge(
                        source_id=link.source_decision_id,
                        target_id=link.target_decision_id,
                        relationship=link.relationship,
                    ))
                    traverse(str(link.source_decision_id), depth + 1)
        
        traverse(root_decision_id, 0)
        
        return ProvenanceGraph(
            nodes=nodes,
            edges=edges,
            root_decision_id=root_decision_id,
            generated_at=datetime.utcnow(),
        )


# ============================================================
# Relationship Helpers
# ============================================================

def get_relationship_label(relationship: RelationshipType) -> str:
    """Get human-readable label for relationship."""
    labels = {
        RelationshipType.INPUT_TO: "Input to",
        RelationshipType.DERIVED_FROM: "Derived from",
        RelationshipType.REVIEWED_BY: "Reviewed by",
        RelationshipType.APPROVED_BY: "Approved by",
        RelationshipType.OVERRIDES: "Overrides",
        RelationshipType.AGGREGATED_INTO: "Aggregated into",
        RelationshipType.DEPENDS_ON: "Depends on",
        RelationshipType.VALIDATES: "Validates",
    }
    return labels.get(relationship, relationship.value)


def get_inverse_relationship(relationship: RelationshipType) -> str:
    """Get the inverse relationship label."""
    inverses = {
        RelationshipType.INPUT_TO: "Receives input from",
        RelationshipType.DERIVED_FROM: "Is source of",
        RelationshipType.REVIEWED_BY: "Reviews",
        RelationshipType.APPROVED_BY: "Approves",
        RelationshipType.OVERRIDES: "Overridden by",
        RelationshipType.AGGREGATED_INTO: "Aggregates",
        RelationshipType.DEPENDS_ON: "Is dependency of",
        RelationshipType.VALIDATES: "Validated by",
    }
    return inverses.get(relationship, f"Inverse of {relationship.value}")
