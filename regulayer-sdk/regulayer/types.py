"""
Regulayer SDK Types
"""
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime

class RuntimeFingerprint(BaseModel):
    sdk_version: str
    sdk_instance_id: str
    python_version: str
    os: str
    extra: Dict[str, Any] = Field(default_factory=dict)

class DecisionPayload(BaseModel):
    """
    Payload for recording a decision.
    """
    decision_id: str
    system_name: str
    decision_type: str
    risk_level: str
    event_version: str = "2.0"
    event_state: str = "completed"
    
    # Times
    start_timestamp: datetime
    end_timestamp: datetime
    execution_duration_ms: float = 0.0
    
    # Context
    model_name: str = "unknown"
    model_version: str = "unknown"
    runtime_fingerprint: RuntimeFingerprint
    
    # Data
    input: Dict[str, Any]
    output: Dict[str, Any]
    metadata: Dict[str, Any] = Field(default_factory=dict)

    model_config = ConfigDict(extra="forbid")

class SDKConfig(BaseModel):
    api_key: str
    endpoint: str
    timeout: float
    max_retries: int
    demo: bool
