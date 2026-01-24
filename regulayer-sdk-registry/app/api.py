"""
Regulayer SDK Registry API

Read-only API for SDK distribution.

SECURITY RULES:
- Public, unauthenticated
- CDN cached
- Immutable responses
- SHA-256 integrity checkable
"""

import json
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel


app = FastAPI(
    title="Regulayer SDK Registry",
    description="Read-only SDK version and checksum registry",
    version="1.0.0"
)


# Load registry
REGISTRY_PATH = Path(__file__).parent.parent / "registry.json"


def load_registry() -> dict:
    """Load registry from JSON file."""
    if REGISTRY_PATH.exists():
        return json.loads(REGISTRY_PATH.read_text())
    return {"error": "Registry not found"}


# ============================================================
# Response Models
# ============================================================

class SDKVersionInfo(BaseModel):
    version: str
    sha256: str
    released_at: str
    min_server_version: str
    docs_url: str
    deprecated: bool = False


class SDKInfo(BaseModel):
    name: str
    latest: str
    repository: str
    versions: dict


# ============================================================
# Endpoints
# ============================================================

@app.get("/v1/sdk/registry", tags=["registry"])
async def get_registry():
    """
    Fetch the complete SDK registry.
    
    Use this to:
    - Discover available SDKs
    - Verify installation checksums
    - Check version compatibility
    """
    registry = load_registry()
    
    return JSONResponse(
        content=registry,
        headers={
            "Cache-Control": "public, max-age=3600",
            "X-Registry-Version": registry.get("registry_version", "unknown")
        }
    )


@app.get("/v1/sdk/{sdk_name}/latest", tags=["registry"])
async def get_latest_version(sdk_name: str):
    """Get the latest version info for an SDK."""
    registry = load_registry()
    sdks = registry.get("sdks", {})
    
    if sdk_name not in sdks:
        raise HTTPException(status_code=404, detail=f"SDK '{sdk_name}' not found")
    
    sdk = sdks[sdk_name]
    latest = sdk["latest"]
    version_info = sdk["versions"].get(latest, {})
    
    return {
        "sdk": sdk_name,
        "version": latest,
        "sha256": version_info.get("sha256"),
        "released_at": version_info.get("released_at"),
        "docs_url": version_info.get("docs_url"),
        "install": f"pip install regulayer=={latest}" if sdk_name == "python" else f"npm install @regulayer/sdk@{latest}"
    }


@app.get("/v1/sdk/{sdk_name}/{version}", tags=["registry"])
async def get_version_info(sdk_name: str, version: str):
    """Get specific version info for an SDK."""
    registry = load_registry()
    sdks = registry.get("sdks", {})
    
    if sdk_name not in sdks:
        raise HTTPException(status_code=404, detail=f"SDK '{sdk_name}' not found")
    
    sdk = sdks[sdk_name]
    
    if version not in sdk["versions"]:
        raise HTTPException(status_code=404, detail=f"Version '{version}' not found")
    
    version_info = sdk["versions"][version]
    
    return {
        "sdk": sdk_name,
        "version": version,
        "is_latest": version == sdk["latest"],
        **version_info
    }


@app.get("/health", tags=["system"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "sdk-registry"}
