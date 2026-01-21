"""
Regulayer Reports - JSON Renderer

Renders reports as deterministic JSON.

Rules:
- Deterministic ordering
- No null stripping
- Version-locked schema
"""

import json
from datetime import datetime
from typing import Any
from uuid import UUID

from ..models import (
    SystemTrustReport,
    DecisionTrustReport,
    ChainIntegrityReport
)


class JSONRenderer:
    """Renders reports as deterministic JSON."""
    
    def __init__(self):
        self.indent = 2
        self.sort_keys = True  # Deterministic ordering
    
    def _serialize(self, obj: Any) -> Any:
        """Custom serializer for complex types."""
        if isinstance(obj, datetime):
            return obj.isoformat()
        elif isinstance(obj, UUID):
            return str(obj)
        elif hasattr(obj, 'model_dump'):
            return obj.model_dump()
        elif hasattr(obj, '__dict__'):
            return obj.__dict__
        return obj
    
    def render(self, report: Any) -> str:
        """
        Render a report to JSON string.
        
        Uses deterministic ordering for reproducibility.
        """
        data = report.model_dump()
        return json.dumps(
            data,
            indent=self.indent,
            sort_keys=self.sort_keys,
            default=self._serialize
        )
    
    def render_system_report(self, report: SystemTrustReport) -> str:
        """Render System Trust Report to JSON."""
        return self.render(report)
    
    def render_decision_report(self, report: DecisionTrustReport) -> str:
        """Render Decision Trust Report to JSON."""
        return self.render(report)
    
    def render_chain_report(self, report: ChainIntegrityReport) -> str:
        """Render Chain Integrity Report to JSON."""
        return self.render(report)


# Global renderer instance
json_renderer = JSONRenderer()
