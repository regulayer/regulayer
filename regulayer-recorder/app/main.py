import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router
from app.core.keys import KeyManager

from app.config import settings
from app.models import HealthStatus
from app.storage import get_last_record, get_total_records, AsyncSessionLocal, init_db

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

# Basic Error Handler for Validation logging
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    import logging
    msg = f"PYDANTIC VALIDATION ERROR: {exc.errors()}\nBody: {exc.body}"
    print(msg, flush=True) # Force stdout
    logging.error(msg)
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(exc.body)},
    )

@app.on_event("startup")
async def startup_event():
    import logging
    logging.basicConfig(level=logging.DEBUG)
    print("DEBUG LOGGING ENABLED", flush=True)
    
    # Bootstrap Cryptographic Identity
    key_manager.bootstrap()
    
    # Initialize Database Tables
    await init_db()
    
    # ---------------------------------------------------------
    # PHASE I.4.4: Boot Integrity Check (Production Only)
    # ---------------------------------------------------------
    env_name = getattr(settings, 'recorder_environment', 'dev')
    if env_name == 'prod':
        try:
            from app.verifier import verify_full_integrity
            print("PRODUCTION MODE: Running Boot Integrity Check...", flush=True)
            
            # Create session for check
            async with AsyncSessionLocal() as session:
                integrity = await verify_full_integrity(session)
                
            if integrity["status"] != "VALID":
                err_msg = f"BOOT INTEGRITY FAILED: {integrity['first_error']}"
                logging.critical(err_msg)
                print(f"CRITICAL: {err_msg}", flush=True)
                
                # EMIT INCIDENT (Critical)
                try:
                    import httpx
                    inc_url = f"{settings.incidents_url}/internal/incidents"
                    # We need to await this since startup_event is async
                    async with httpx.AsyncClient(timeout=2.0) as client:
                        await client.post(
                            inc_url,
                            json={
                                "incident_type": "INTEGRITY_CHECK_FAILED",
                                "severity": "critical",
                                "source": "recorder",
                                "message": f"Recorder Boot Integrity Failed. Service Aborted. Error: {integrity['first_error']}",
                                "metadata": {"error": integrity['first_error']}
                            },
                            headers={"X-Internal-Auth": settings.incidents_internal_secret}
                        )
                except Exception as e_inc:
                    print(f"FAILED TO EMIT INCIDENT: {e_inc}", flush=True)

                sys.exit(1) # Fail fast
            
            print(f"Integrity Check PASSED. {integrity['records_checked']} records verified.", flush=True)
            
        except ImportError:
            logging.error("Could not import verification logic")
            sys.exit(1)
        except Exception as e:
            err_msg = f"BOOT INTEGRITY CHECK CRASHED: {str(e)}"
            logging.critical(err_msg, exc_info=True)
            print(f"CRITICAL: {err_msg}", flush=True)
            sys.exit(1)
    else:
        print(f"Environment '{env_name}': Skipping strict boot integrity check.", flush=True)
    # ---------------------------------------------------------

    print("Recorder Service Started. Identity Loaded & DB Initialized.")

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
    import hashlib
    
    current_key_hex = key_manager.get_public_key_hex()
    # Simple fingerprint: SHA256 of the hex key (or bytes? usage varies, hex is safer for display consistency)
    fingerprint = hashlib.sha256(bytes.fromhex(current_key_hex)).hexdigest()
    
    return {
        "current_key": current_key_hex,
        "algorithm": "Ed25519",
        "fingerprint": fingerprint,
        "active_since": "genesis", 
        "keys": [
            {
                "public_key": current_key_hex,
                "algorithm": "Ed25519",
                "fingerprint": fingerprint,
                "created_at": "2024-01-01T00:00:00Z", # Placeholder for genesis
                "status": "active"
            }
        ]
    }


