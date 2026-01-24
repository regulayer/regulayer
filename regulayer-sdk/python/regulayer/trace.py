"""
Regulayer SDK - Trace Context Manager

Convenient way to record decisions using context managers.
"""

from typing import Optional, Any
from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class Decision:
    """Captured decision data."""
    system: str
    decision_type: str = "default"
    risk_level: str = "standard"
    input_data: dict = field(default_factory=dict)
    output_data: dict = field(default_factory=dict)
    metadata: dict = field(default_factory=dict)
    started_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    decision_id: Optional[str] = None
    
    def set_input(self, data: dict) -> None:
        """Set the decision input."""
        self.input_data = data
    
    def set_output(self, data: dict) -> None:
        """Set the decision output."""
        self.output_data = data
    
    def add_metadata(self, key: str, value: Any) -> None:
        """Add metadata to the decision."""
        self.metadata[key] = value


class trace:
    """
    Context manager for tracing decisions.
    
    Example:
        with trace(system="loan_approval", risk_level="high") as t:
            t.set_input({"income": 50000, "credit_score": 720})
            
            # Your AI logic here
            result = your_ai_model.predict(...)
            
            t.set_output({"approved": result.approved})
    
    The decision is automatically recorded when the context exits.
    """
    
    def __init__(
        self,
        system: str,
        decision_type: str = "default",
        risk_level: str = "standard",
        **metadata
    ):
        self.decision = Decision(
            system=system,
            decision_type=decision_type,
            risk_level=risk_level,
            metadata=metadata
        )
    
    def __enter__(self) -> Decision:
        return self.decision
    
    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.decision.completed_at = datetime.now(timezone.utc)
        
        # Record the decision
        from .client import get_client
        
        try:
            client = get_client()
            result = client.record_decision(
                system=self.decision.system,
                decision_type=self.decision.decision_type,
                input_data=self.decision.input_data,
                output_data=self.decision.output_data,
                metadata=self.decision.metadata,
                risk_level=self.decision.risk_level
            )
            self.decision.decision_id = result.get("decision_id")
        except RuntimeError:
            # SDK not configured - skip recording
            pass
    
    def set_input(self, data: dict) -> None:
        """Set the decision input."""
        self.decision.set_input(data)
    
    def set_output(self, data: dict) -> None:
        """Set the decision output."""
        self.decision.set_output(data)
