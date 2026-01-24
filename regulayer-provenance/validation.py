"""
Regulayer Provenance Validation

Validates provenance links without affecting crypto.

CRITICAL GUARANTEES:
- No cross-chain enforcement
- No crypto dependency
- Validation is for graph integrity only
"""

from typing import Optional, Tuple, Set, List
from uuid import UUID

from .models import (
    ProvenanceLink,
    ProvenanceLinkCreate,
    RelationshipType,
)


# ============================================================
# Validation Errors
# ============================================================

class ProvenanceValidationError(Exception):
    """Base exception for provenance validation errors."""
    pass


class CycleDetectedError(ProvenanceValidationError):
    """Detected cycle in provenance graph."""
    pass


class InvalidLinkError(ProvenanceValidationError):
    """Invalid link configuration."""
    pass


# ============================================================
# Link Validator
# ============================================================

class LinkValidator:
    """
    Validates provenance links.
    
    IMPORTANT: Validation is for graph integrity only.
    This NEVER affects cryptographic verification.
    """
    
    def validate_link(
        self,
        link: ProvenanceLinkCreate,
        existing_links: List[ProvenanceLink]
    ) -> Tuple[bool, Optional[str]]:
        """
        Validate a proposed link.
        
        Returns (valid, error_message).
        """
        # Check self-reference
        if link.source_decision_id == link.target_decision_id:
            return False, "Cannot link a decision to itself"
        
        # Check for duplicate links
        for existing in existing_links:
            if (existing.source_decision_id == link.source_decision_id and
                existing.target_decision_id == link.target_decision_id and
                existing.relationship == link.relationship and
                existing.active):
                return False, "Duplicate link already exists"
        
        return True, None
    
    def check_cycles(
        self,
        source_id: UUID,
        target_id: UUID,
        existing_links: List[ProvenanceLink]
    ) -> Tuple[bool, Optional[str]]:
        """
        Check if adding a link would create a cycle.
        
        Returns (has_cycle, path_description).
        """
        # Build adjacency list
        adjacency: dict = {}
        for link in existing_links:
            if not link.active:
                continue
            src = str(link.source_decision_id)
            tgt = str(link.target_decision_id)
            if src not in adjacency:
                adjacency[src] = []
            adjacency[src].append(tgt)
        
        # Add proposed link
        src = str(source_id)
        tgt = str(target_id)
        if src not in adjacency:
            adjacency[src] = []
        adjacency[src].append(tgt)
        
        # DFS to detect cycle
        visited: Set[str] = set()
        rec_stack: Set[str] = set()
        
        def dfs(node: str) -> bool:
            visited.add(node)
            rec_stack.add(node)
            
            for neighbor in adjacency.get(node, []):
                if neighbor not in visited:
                    if dfs(neighbor):
                        return True
                elif neighbor in rec_stack:
                    return True
            
            rec_stack.remove(node)
            return False
        
        # Check from source
        if dfs(src):
            return True, f"Adding link would create a cycle"
        
        return False, None


# ============================================================
# Decision Existence Validator
# ============================================================

class DecisionValidator:
    """
    Validates that decisions exist.
    
    In production, this would query the recorder.
    """
    
    def exists(self, decision_id: str) -> bool:
        """Check if a decision exists."""
        # Placeholder - in production, query recorder
        return True
    
    def belongs_to_org(self, decision_id: str, org_id: str) -> bool:
        """Check if a decision belongs to an org."""
        # Placeholder - in production, check custody
        return True


# ============================================================
# Validation Functions
# ============================================================

def validate_link(
    link: ProvenanceLinkCreate,
    existing_links: List[ProvenanceLink]
) -> Tuple[bool, Optional[str]]:
    """
    Validate a provenance link.
    
    Checks:
    1. Source exists
    2. Target exists
    3. No cycles
    4. No duplicates
    """
    validator = LinkValidator()
    decision_validator = DecisionValidator()
    
    # Check decisions exist
    if not decision_validator.exists(str(link.source_decision_id)):
        return False, "Source decision does not exist"
    
    if not decision_validator.exists(str(link.target_decision_id)):
        return False, "Target decision does not exist"
    
    # Check link validity
    valid, error = validator.validate_link(link, existing_links)
    if not valid:
        return False, error
    
    # Check for cycles
    has_cycle, cycle_error = validator.check_cycles(
        link.source_decision_id,
        link.target_decision_id,
        existing_links
    )
    if has_cycle:
        return False, cycle_error
    
    return True, None


def validate_relationship_semantics(
    relationship: RelationshipType,
    source_context: dict,
    target_context: dict
) -> Tuple[bool, Optional[str]]:
    """
    Validate relationship makes semantic sense.
    
    This is advisory only, not enforced.
    """
    # All relationships are valid from a graph perspective
    # Semantic validation is informational
    return True, None
