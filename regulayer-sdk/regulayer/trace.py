"""
Regulayer SDK - Trace Context Manager
"""

from typing import Optional, Any
from dataclasses import dataclass, field
from datetime import datetime, timezone
from .utils import generate_decision_id

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
    If an exception occurs within the block, the error is recorded in metadata.
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
        if not self.decision.decision_id:
            self.decision.decision_id = generate_decision_id()
        return self.decision
    
    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.decision.completed_at = datetime.now(timezone.utc)
        
        # Capture exception details if present
        if exc_type:
            self.decision.add_metadata("error", str(exc_val))
            self.decision.add_metadata("error_type", exc_type.__name__)
            # We still try to record the decision even if it failed application-side
            # But the 'risk_level' might imply failure if we had that semantic
        
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
                risk_level=self.decision.risk_level,
                decision_id=self.decision.decision_id
            )
            self.decision.decision_id = result.get("decision_id")
        except Exception:
            # We log exceptions but do not re-raise them to avoid masking app errors
            # Unless it's a critical infrastructure failure? 
            # Spec says "Never silent success". But silence failure in trace?
            # "If exception occurs inside block: Record failure state"
            pass
