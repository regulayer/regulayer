"""
Regulayer Demo Mode

Pre-loaded demonstration organization for:
- Enterprise demos
- Regulator walkthroughs
- Investor meetings

RULES:
- Read-only recorder
- Fake billing
- Real proofs (exportable)
"""

from datetime import datetime, timezone, timedelta
from typing import List
from dataclasses import dataclass, field
from uuid import uuid4
import hashlib
import json


@dataclass
class DemoDecision:
    """A pre-loaded demo decision."""
    id: str
    system: str
    input_data: dict
    output_data: dict
    risk_level: str
    timestamp: datetime
    record_hash: str
    prev_hash: str
    sequence: int


def generate_demo_decisions(count: int = 50) -> List[DemoDecision]:
    """Generate realistic demo decisions."""
    decisions = []
    prev_hash = "genesis"
    base_time = datetime.now(timezone.utc) - timedelta(days=30)
    
    systems = ["loan_approval", "fraud_detection", "content_moderation", "credit_scoring"]
    
    for i in range(count):
        decision_time = base_time + timedelta(hours=i * 2)
        system = systems[i % len(systems)]
        
        input_data = {
            "request_id": f"req_{uuid4().hex[:8]}",
            "user_id": f"user_{1000 + (i % 100)}",
            "timestamp": decision_time.isoformat(),
        }
        
        output_data = {
            "decision": "approved" if i % 3 != 0 else "denied",
            "confidence": 0.85 + (i % 10) * 0.01,
            "factors": ["income", "history", "risk_score"],
        }
        
        risk_level = "high" if i % 5 == 0 else ("medium" if i % 3 == 0 else "standard")
        
        # Compute hash
        record = {
            "sequence": i + 1,
            "prev_hash": prev_hash,
            "system": system,
            "input": input_data,
            "output": output_data,
            "timestamp": decision_time.isoformat(),
        }
        record_hash = hashlib.sha256(
            json.dumps(record, sort_keys=True).encode()
        ).hexdigest()
        
        decisions.append(DemoDecision(
            id=f"dec_{uuid4().hex[:12]}",
            system=system,
            input_data=input_data,
            output_data=output_data,
            risk_level=risk_level,
            timestamp=decision_time,
            record_hash=record_hash,
            prev_hash=prev_hash,
            sequence=i + 1,
        ))
        
        prev_hash = record_hash
    
    return decisions


class DemoOrg:
    """
    Demo organization with pre-loaded data.
    """
    
    ORG_ID = "org_demo_regulayer"
    PROJECT_ID = "proj_demo_lending"
    
    def __init__(self):
        self.decisions = generate_demo_decisions(50)
        self.created_at = datetime.now(timezone.utc) - timedelta(days=30)
        
        self.stats = {
            "total_decisions": len(self.decisions),
            "high_risk": sum(1 for d in self.decisions if d.risk_level == "high"),
            "chain_valid": True,
            "last_activity": self.decisions[-1].timestamp,
        }
    
    def get_decisions(self, limit: int = 20) -> List[DemoDecision]:
        """Get demo decisions (read-only)."""
        return self.decisions[-limit:]
    
    def export_proof(self) -> dict:
        """Generate exportable proof bundle (works offline)."""
        return {
            "version": "1.0",
            "org_id": self.ORG_ID,
            "project_id": self.PROJECT_ID,
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "record_count": len(self.decisions),
            "first_hash": self.decisions[0].record_hash,
            "last_hash": self.decisions[-1].record_hash,
            "chain_valid": True,
            "decisions": [
                {
                    "id": d.id,
                    "sequence": d.sequence,
                    "hash": d.record_hash,
                    "prev_hash": d.prev_hash,
                }
                for d in self.decisions
            ]
        }


# Global demo org instance
_demo_org = None


def get_demo_org() -> DemoOrg:
    """Get or create demo org."""
    global _demo_org
    if _demo_org is None:
        _demo_org = DemoOrg()
    return _demo_org
