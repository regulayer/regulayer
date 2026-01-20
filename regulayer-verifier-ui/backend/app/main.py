"""
Regulayer Verification UI - FastAPI Application

Read-only verification interface.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import sys
import os

# Add recorder to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../regulayer-recorder'))

from regulayer_recorder.app.storage import init_db

from .api import router
from .config import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format='[%(asctime)s] %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting Regulayer Verification UI Backend...")
    logger.info("⚠️  READ-ONLY MODE - No write operations allowed")
    
    # Validate read-only configuration
    try:
        settings.validate_readonly_access()
        logger.info("✓ Read-only configuration validated")
    except Exception as e:
        logger.warning(f"Configuration validation warning: {e}")
    
    # Initialize database connection (read-only)
    try:
        await init_db()
        logger.info("✓ Database connection established (read-only)")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down Verification UI Backend...")


# Create FastAPI app
app = FastAPI(
    title="Regulayer Verification UI",
    description="Internal integrity verification and inspection interface (READ-ONLY)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET"],  # Only GET allowed
    allow_headers=["*"],
)

# Include API router
app.include_router(router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Regulayer Verification UI",
        "version": "1.0.0",
        "status": "operational",
        "access": "READ-ONLY",
        "endpoints": {
            "chain_status": "GET /v1/verify/chain",
            "full_verification": "GET /v1/verify/chain/full",
            "decision_list": "GET /v1/decisions",
            "decision_detail": "GET /v1/decisions/{decision_id}",
            "spot_verification": "GET /v1/verify/decision/{decision_id}"
        },
        "security_note": "This is an internal forensic tool. Not for regulator-facing evidence."
    }


@app.get("/health")
async def health():
    """Health check."""
    return {
        "status": "healthy",
        "mode": "read-only"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=False,
        log_level=settings.log_level.lower()
    )
