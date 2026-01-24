"""
Regulayer Trust Registry Public API

Read-only API for accessing trust models, audit versions, schemas, and policies.

CRITICAL GUARANTEES:
- No authentication required
- No rate limits
- No mutation endpoints
- Publicly cacheable
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any


# ============================================================
# Registry Loader
# ============================================================

class TrustRegistry:
    """
    In-memory trust registry loaded from JSON files.
    
    In production, this would be served via FastAPI/Flask.
    """
    
    def __init__(self, registry_path: str = "registry"):
        self.registry_path = Path(registry_path)
        self._trust_models = None
        self._audit_versions = None
        self._schema_versions = None
        self._deprecation_policy = None
    
    def _load_json(self, filename: str) -> Dict[str, Any]:
        """Load a JSON file from the registry."""
        path = self.registry_path / filename
        with open(path, "r") as f:
            return json.load(f)
    
    @property
    def trust_models(self) -> Dict[str, Any]:
        if self._trust_models is None:
            self._trust_models = self._load_json("TRUST_MODELS.json")
        return self._trust_models
    
    @property
    def audit_versions(self) -> Dict[str, Any]:
        if self._audit_versions is None:
            self._audit_versions = self._load_json("AUDIT_VERSIONS.json")
        return self._audit_versions
    
    @property
    def schema_versions(self) -> Dict[str, Any]:
        if self._schema_versions is None:
            self._schema_versions = self._load_json("SCHEMA_VERSIONS.json")
        return self._schema_versions
    
    @property
    def deprecation_policy(self) -> Dict[str, Any]:
        if self._deprecation_policy is None:
            self._deprecation_policy = self._load_json("DEPRECATION_POLICY.json")
        return self._deprecation_policy


# ============================================================
# API Endpoints (Pseudo-code for FastAPI)
# ============================================================

"""
FastAPI implementation would look like:

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse

app = FastAPI(
    title="Regulayer Trust Registry",
    description="Public, read-only registry of trust models and schemas",
    version="1.0.0"
)

registry = TrustRegistry()


@app.get("/v1/trust-models")
async def get_trust_models():
    '''
    Get all trust models.
    
    Returns:
        List of trust models with invariants and capabilities.
    
    No authentication required.
    Publicly cacheable.
    '''
    return registry.trust_models


@app.get("/v1/trust-models/{model_id}")
async def get_trust_model(model_id: str):
    '''
    Get a specific trust model by ID.
    '''
    for model in registry.trust_models["trust_models"]:
        if model["trust_model_id"] == model_id:
            return model
    raise HTTPException(status_code=404, detail="Trust model not found")


@app.get("/v1/audits")
async def get_audits():
    '''
    Get all audit documentation versions.
    '''
    return registry.audit_versions


@app.get("/v1/schemas")
async def get_schemas():
    '''
    Get all schema versions.
    '''
    return registry.schema_versions


@app.get("/v1/deprecation-policy")
async def get_deprecation_policy():
    '''
    Get the deprecation policy.
    '''
    return registry.deprecation_policy


@app.get("/v1/integrity")
async def get_integrity_info():
    '''
    Get registry integrity information.
    '''
    return {
        "registry_version": registry.trust_models.get("registry_version"),
        "last_updated": registry.trust_models.get("last_updated"),
        "hash_url": "/integrity/registry_hash.txt",
        "signature_url": "/integrity/registry_signature.txt",
        "signing_key_url": "/integrity/signing_key_info.md"
    }
"""


# ============================================================
# Helper Functions
# ============================================================

def get_trust_model_by_id(registry: TrustRegistry, model_id: str) -> Optional[Dict]:
    """Get a specific trust model by ID."""
    for model in registry.trust_models.get("trust_models", []):
        if model.get("trust_model_id") == model_id:
            return model
    return None


def get_schema_by_id(registry: TrustRegistry, schema_id: str) -> Optional[Dict]:
    """Get a specific schema by ID."""
    for schema in registry.schema_versions.get("schemas", []):
        if schema.get("schema_id") == schema_id:
            return schema
    return None


def get_active_trust_models(registry: TrustRegistry) -> List[Dict]:
    """Get all active (non-deprecated) trust models."""
    return [
        model for model in registry.trust_models.get("trust_models", [])
        if model.get("status") == "active"
    ]


def get_invariants_for_model(registry: TrustRegistry, model_id: str) -> List[Dict]:
    """Get all invariants for a trust model."""
    model = get_trust_model_by_id(registry, model_id)
    if model:
        return model.get("invariants", [])
    return []


def is_model_deprecated(registry: TrustRegistry, model_id: str) -> bool:
    """Check if a trust model is deprecated."""
    model = get_trust_model_by_id(registry, model_id)
    if model:
        return model.get("status") in ["deprecated", "sunset", "archived"]
    return False


# ============================================================
# CLI Interface
# ============================================================

if __name__ == "__main__":
    import sys
    
    registry = TrustRegistry()
    
    if len(sys.argv) < 2:
        print("Usage: python api.py [trust-models|audits|schemas|deprecation-policy]")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "trust-models":
        print(json.dumps(registry.trust_models, indent=2))
    elif command == "audits":
        print(json.dumps(registry.audit_versions, indent=2))
    elif command == "schemas":
        print(json.dumps(registry.schema_versions, indent=2))
    elif command == "deprecation-policy":
        print(json.dumps(registry.deprecation_policy, indent=2))
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
