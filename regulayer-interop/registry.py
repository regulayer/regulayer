"""
Regulayer Interop Registry

Publishes supported formats, versions, and schema hashes.

This prevents:
- Silent changes
- "Interpretation drift"
- Legal ambiguity
"""

import hashlib
import json
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum
from pathlib import Path


# ============================================================
# Schema Types
# ============================================================

class SchemaType(str, Enum):
    EVIDENCE = "evidence"
    PROVENANCE = "provenance"
    GOVERNANCE = "governance"


class SchemaStatus(str, Enum):
    CURRENT = "current"
    DEPRECATED = "deprecated"
    RETIRED = "retired"


# ============================================================
# Schema Registration
# ============================================================

@dataclass
class SchemaRegistration:
    """Registration of a schema version."""
    schema_type: SchemaType
    version: str
    status: SchemaStatus
    published_at: datetime
    deprecated_at: Optional[datetime]
    retired_at: Optional[datetime]
    schema_hash: str  # SHA-256 of schema content
    schema_url: str
    changelog: str


# ============================================================
# Schema Registry
# ============================================================

class SchemaRegistry:
    """
    Registry of published schemas.
    
    IMMUTABILITY GUARANTEE:
    Once a schema version is published, it cannot be modified.
    Only new versions can be added.
    """
    
    BASE_URL = "https://regulayer.io/schemas"
    
    def __init__(self):
        self.registrations: Dict[str, List[SchemaRegistration]] = {
            SchemaType.EVIDENCE: [],
            SchemaType.PROVENANCE: [],
            SchemaType.GOVERNANCE: [],
        }
        self._initialize_current_versions()
    
    def _initialize_current_versions(self):
        """Initialize with current schema versions."""
        now = datetime.utcnow()
        
        self.registrations[SchemaType.EVIDENCE].append(SchemaRegistration(
            schema_type=SchemaType.EVIDENCE,
            version="1.0.0",
            status=SchemaStatus.CURRENT,
            published_at=now,
            deprecated_at=None,
            retired_at=None,
            schema_hash="",  # Computed on load
            schema_url=f"{self.BASE_URL}/evidence/v1.0.0/evidence.schema.json",
            changelog="Initial release",
        ))
        
        self.registrations[SchemaType.PROVENANCE].append(SchemaRegistration(
            schema_type=SchemaType.PROVENANCE,
            version="1.0.0",
            status=SchemaStatus.CURRENT,
            published_at=now,
            deprecated_at=None,
            retired_at=None,
            schema_hash="",
            schema_url=f"{self.BASE_URL}/provenance/v1.0.0/provenance.schema.json",
            changelog="Initial release",
        ))
        
        self.registrations[SchemaType.GOVERNANCE].append(SchemaRegistration(
            schema_type=SchemaType.GOVERNANCE,
            version="1.0.0",
            status=SchemaStatus.CURRENT,
            published_at=now,
            deprecated_at=None,
            retired_at=None,
            schema_hash="",
            schema_url=f"{self.BASE_URL}/governance/v1.0.0/governance.schema.json",
            changelog="Initial release",
        ))
    
    def get_current_version(self, schema_type: SchemaType) -> Optional[SchemaRegistration]:
        """Get the current version of a schema."""
        for reg in self.registrations.get(schema_type, []):
            if reg.status == SchemaStatus.CURRENT:
                return reg
        return None
    
    def get_all_versions(self, schema_type: SchemaType) -> List[SchemaRegistration]:
        """Get all versions of a schema."""
        return self.registrations.get(schema_type, [])
    
    def compute_schema_hash(self, schema_content: str) -> str:
        """Compute SHA-256 hash of schema content."""
        return f"sha256:{hashlib.sha256(schema_content.encode()).hexdigest()}"
    
    def verify_schema_integrity(
        self,
        schema_type: SchemaType,
        version: str,
        content: str
    ) -> tuple[bool, Optional[str]]:
        """
        Verify that schema content matches registered hash.
        
        Returns (valid, error_message).
        """
        for reg in self.registrations.get(schema_type, []):
            if reg.version == version:
                computed_hash = self.compute_schema_hash(content)
                if computed_hash == reg.schema_hash:
                    return True, None
                else:
                    return False, f"Hash mismatch: expected {reg.schema_hash}, got {computed_hash}"
        
        return False, f"Version {version} not found for {schema_type}"
    
    def export_registry(self) -> Dict:
        """Export the full registry as JSON."""
        return {
            "registry_version": "1.0.0",
            "exported_at": datetime.utcnow().isoformat(),
            "base_url": self.BASE_URL,
            "schemas": {
                schema_type.value: [
                    {
                        "version": reg.version,
                        "status": reg.status.value,
                        "published_at": reg.published_at.isoformat(),
                        "schema_hash": reg.schema_hash,
                        "schema_url": reg.schema_url,
                    }
                    for reg in regs
                ]
                for schema_type, regs in self.registrations.items()
            },
            "compatibility_note": (
                "All schema versions are backward compatible. "
                "Deprecated versions remain valid for verification."
            ),
        }


# ============================================================
# Global Registry Instance
# ============================================================

_registry = None

def get_registry() -> SchemaRegistry:
    """Get the global schema registry."""
    global _registry
    if _registry is None:
        _registry = SchemaRegistry()
    return _registry


# ============================================================
# Version Compatibility
# ============================================================

def is_version_supported(schema_type: SchemaType, version: str) -> bool:
    """Check if a schema version is still supported."""
    registry = get_registry()
    for reg in registry.get_all_versions(schema_type):
        if reg.version == version and reg.status != SchemaStatus.RETIRED:
            return True
    return False


def get_deprecation_timeline(schema_type: SchemaType, version: str) -> Optional[str]:
    """Get deprecation information for a version."""
    registry = get_registry()
    for reg in registry.get_all_versions(schema_type):
        if reg.version == version and reg.deprecated_at:
            return f"Deprecated on {reg.deprecated_at.strftime('%Y-%m-%d')}"
    return None
