import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router
from app.core.keys import KeyManager

from app.config import settings
from app.models import HealthStatus
from app.storage import get_last_record, get_total_records, AsyncSessionLocal

# Fail-Fast Environment Check
REQUIRED_ENV_VARS = ["DATABASE_URL", "SIGNING_KEY_PATH"]
for var in REQUIRED_ENV_VARS:
    if not os.getenv(var) and not getattr(settings, var.lower(), None):
        # Allow pydantic settings to have picked it up too, but explicit check is safer for criticals
        # Actually checking os.environ is safest for 'Fail Fast' before app boot
        if not os.getenv(var):
            sys.stderr.write(f"CRITICAL: Missing required environment variable: {var}\n")
            sys.exit(1)

app = FastAPI(title="Regulayer Recorder", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Key Manager
key_manager = KeyManager(os.getenv("SIGNING_KEY_PATH"))

@app.on_event("startup")
def startup_event():
    # Bootstrap Cryptographic Identity
    key_manager.bootstrap()
    
    # Create tables (for dev simplicity, usually use alembic)
    # Base.metadata.create_all(bind=engine) 
    print("Recorder Service Started. Identity Loaded.")

app.include_router(router, prefix="/v1")

@app.get("/health", response_model=HealthStatus)
async def health_check():
    """Health check endpoint."""
    try:
        async with AsyncSessionLocal() as session:
            total_records = await get_total_records(session)
            last_record = await get_last_record(session, settings.chain_id)
            
            return HealthStatus(
                status="healthy",
                database_reachable=True,
                chain_writable=True,
                last_record_timestamp=last_record.server_timestamp if last_record else None,
                total_records=total_records
            )
    except Exception as e:
        return HealthStatus(
                status="degraded",
                database_reachable=False,
                chain_writable=False,
                last_record_timestamp=None,
                total_records=0
            )

@app.get("/v1/recorder/keys")
def get_recorder_keys():
    """
    Expose the current public key. 
    In the future, this would return a list of historical keys for rotation support.
    """
    return {
        "current_key": key_manager.get_public_key_hex(),
        "active_since": "genesis", 
        "keys": [
            {
                "public_key": key_manager.get_public_key_hex(),
                "status": "active"
            }
        ]
    }

# Admin-only integrity check (Stub for now)
@app.post("/v1/recorder/verify-integrity")
def verify_integrity():
    # TODO: Implement full chain re-scan
    return {"status": "success", "message": "Integrity verify job queued (stub)"}
