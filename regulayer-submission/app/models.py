"""
Regulayer Submission - Data Models

CRITICAL CONSTRAINTS:
1. Submissions do not add trust - they only freeze and reference existing trust
2. No new verification, no recomputation, no signing of facts
3. Same inputs → same package bytes (deterministic)
"""

from datetime import datetime
from typing import List, Dict, Optional, Literal
from uuid import UUID
from pydantic import BaseModel, Field


class ManifestEntry(BaseModel):
    """Entry in the manifest file list."""
    path: str
    sha256: str
    size_bytes: int


class SubmissionManifest(BaseModel):
    """
    The manifest is the single source of truth for package integrity.
    
    Rules:
    - Every file MUST be listed
    - No extra files allowed
    - Hash mismatch = package invalid
    """
    submission_version: str = "1.0.0"
    submission_id: UUID
    generated_at: datetime
    
    contents: Dict[str, str] = Field(
        description="Map of relative path -> SHA-256 hash"
    )
    
    file_count: int
    total_size_bytes: int
    
    disclaimer_hash: str = Field(
        description="SHA-256 of the disclaimer text for integrity"
    )
    
    includes_governance: bool = False
    includes_legacy_records: bool = False


class SubmissionPackageRequest(BaseModel):
    """Request to create a submission package."""
    decision_ids: List[UUID]
    chain_id: Optional[str] = None
    include_governance: bool = True
    include_legacy: bool = True


class SubmissionPackage(BaseModel):
    """Metadata about a created submission package."""
    submission_id: UUID
    submission_version: str = "1.0.0"
    included_decisions: List[UUID]
    chain_id: Optional[str] = None
    generated_at: datetime
    disclaimer_hash: str
    
    # Package statistics
    report_count: int
    proof_bundle_count: int
    governance_evidence_count: int
    total_files: int
    total_size_bytes: int


class PackageContents(BaseModel):
    """Internal structure tracking what's in the package."""
    reports: List[str] = Field(default_factory=list)
    proof_bundles: List[str] = Field(default_factory=list)
    governance_evidence: List[str] = Field(default_factory=list)
    other_files: List[str] = Field(default_factory=list)
