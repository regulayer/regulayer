"""
Regulayer Reports Service - Entry Point
CORS is handled by the ingestion gateway (the public-facing layer).
Internal services must NOT add their own CORS headers to avoid duplicates.
"""

from fastapi import FastAPI
from .api import router
from .config import settings

app = FastAPI(
    title="Regulayer Reports Service",
    description="Trust Reports Generator",
    version="1.0.0"
)

# NOTE: No CORS middleware here. The gateway is the sole CORS layer.

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "reports"}

app.include_router(router)
