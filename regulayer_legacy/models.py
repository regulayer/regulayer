"""
Regulayer SDK Data Models

Pydantic models for decision events and validation.
"""

from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, field_validator


class RuntimeFingerprint(BaseModel):
    """
    Runtime environment fingerprint.
    
    Note:
        SDK version MUST match the installed package version exactly.
        This is non-negotiable for forensic integrity.
    """
    
    python_version: str = Field(..., description="Python version (e.g., '3.10.5')")
    os: str = Field(..., description="Operating system (e.g., 'Linux', 'Darwin', 'Windows')")
    sdk_version: str = Field(..., description="SDK version (must match installed package)")
    sdk_instance_id: str = Field(..., description="SDK instance ID (UUID v4, unique per process)")
    
    class Config:
        frozen = True  # Immutable
        extra = "forbid"  # No extra fields allowed


class DecisionEvent(BaseModel):
    """
    Complete decision trace event.
    
    This is the core data structure transmitted to the Regulayer backend.
    
    Note - Trust Boundary:
        This event represents a CLAIM, not a fact.
        The backend is the source of truth.
        Attestation and verification occur server-side.
    
    Note - Nullable Output Hash:
        output_hash MAY be null if execution fails before output capture.
        This is a valid forensic state indicating incomplete execution
        while preserving input and execution metadata.
        When output_hash is null, event_state will be "failed".
    """
    
    # Event metadata
    event_version: str = Field(default="1.0", description="Event schema version")
    event_state: Literal["completed", "failed"] = Field(
        ...,
        description="Explicit execution state for clearer forensics"
    )
    
    # Decision identification
    decision_id: str = Field(..., description="Unique decision ID (UUID v4)")
    system_name: str = Field(..., description="System generating the decision")
    risk_level: str = Field(..., description="Risk level of the decision")
    
    # Model information
    model_name: str = Field(..., description="Model name")
    model_version: str = Field(..., description="Model version")
    
    # Data hashes (NO raw data)
    input_hash: Optional[str] = Field(None, description="SHA-256 hash of input data (if provided)")
    output_hash: Optional[str] = Field(None, description="SHA-256 hash of output data (if provided)")
    prompt_hash: Optional[str] = Field(None, description="SHA-256 hash of prompt (if applicable)")
    tool_calls_hashes: Optional[List[str]] = Field(
        None,
        description="SHA-256 hashes of tool calls (if applicable)"
    )
    
    # Timing (wall clock for timestamps, monotonic for duration)
    start_timestamp: datetime = Field(..., description="Start time (ISO 8601 UTC)")
    end_timestamp: datetime = Field(..., description="End time (ISO 8601 UTC)")
    execution_duration_ms: float = Field(
        ...,
        description="Execution duration in milliseconds (from monotonic clock)"
    )
    
    # Runtime environment
    runtime_fingerprint: RuntimeFingerprint = Field(..., description="Execution environment")
    
    @field_validator('input_hash', 'output_hash', 'prompt_hash')
    @classmethod
    def validate_hash(cls, v: Optional[str]) -> Optional[str]:
        """Validate that hashes are 64-character hex strings (SHA-256)."""
        if v is not None:
            if len(v) != 64:
                raise ValueError("Hash must be 64 characters (SHA-256 hex)")
            if not all(c in '0123456789abcdef' for c in v.lower()):
                raise ValueError("Hash must be hexadecimal")
        return v
    
    @field_validator('tool_calls_hashes')
    @classmethod
    def validate_tool_calls_hashes(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        """Validate that all tool call hashes are 64-character hex strings."""
        if v is not None:
            for h in v:
                if len(h) != 64:
                    raise ValueError("Hash must be 64 characters (SHA-256 hex)")
                if not all(c in '0123456789abcdef' for c in h.lower()):
                    raise ValueError("Hash must be hexadecimal")
        return v
    
    class Config:
        frozen = True  # Immutable once created
        extra = "forbid"  # No extra fields allowed - strict validation
