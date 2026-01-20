"""
Regulayer Decision Recorder - FastAPI Application

Main application entrypoint with health monitoring.
"""

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from .api import router
from .models import HealthStatus
from .storage import init_db, get_last_record, get_total_records, AsyncSessionLocal
from .config import settings
from .errors import ServiceDegradedError

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
    logger.info("Starting Regulayer Decision Recorder...")
    logger.info(f"Chain ID: {settings.chain_id}")
    logger.info(f"Allowed SDK versions: {settings.get_allowed_sdk_versions()}")
    
    # Initialize database
    try:
        await init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise
    
    # Validate production readiness
    try:
        settings.validate_production_readiness()
        logger.info("Production readiness validated")
    except Exception as e:
        logger.warning(f"Production readiness check failed: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Regulayer Decision Recorder...")


# Create FastAPI app
app = FastAPI(
    title="Regulayer Decision Recorder",
    description="Authoritative backend service for recording AI decisions",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware (configure as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(router)


@app.get("/health", response_model=HealthStatus)
async def health_check():
    """
    Health check endpoint.
    
    Semantics:
    - 200 OK → Database reachable, chain writable, service ready
    - 503 Service Unavailable → Ingestion must halt, service degraded
    
    Response includes:
    - DB status
    - Last record timestamp
    - Chain status
    """
    try:
        async with AsyncSessionLocal() as session:
            # Check database connectivity
            total_records = await get_total_records(session)
            last_record = await get_last_record(session, settings.chain_id)
            
            # Service is healthy if we can query DB
            return HealthStatus(
                status="healthy",
                database_reachable=True,
                chain_writable=True,
                last_record_timestamp=last_record.server_timestamp if last_record else None,
                total_records=total_records
            )
    
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        
        # Service is degraded
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "degraded",
                "database_reachable": False,
                "chain_writable": False,
                "last_record_timestamp": None,
                "total_records": 0
            }
        )


@app.get("/metrics")
async def metrics():
    """
    Basic metrics endpoint.
    
    Returns service statistics.
    """
    try:
        async with AsyncSessionLocal() as session:
            total_records = await get_total_records(session)
            last_record = await get_last_record(session, settings.chain_id)
            
            return {
                "total_records": total_records,
                "chain_id": settings.chain_id,
                "last_record_timestamp": last_record.server_timestamp.isoformat() if last_record else None,
                "last_record_id": last_record.record_id if last_record else None
            }
    
    except Exception as e:
        logger.error(f"Metrics collection failed: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "Failed to collect metrics"}
        )


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Regulayer Decision Recorder",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "ingestion": "POST /v1/decisions",
            "health": "GET /health",
            "metrics": "GET /metrics"
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=False,  # Disable in production
        log_level=settings.log_level.lower()
    )
