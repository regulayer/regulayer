import os
import sys
from fastapi import FastAPI
from app.api import router
from app.core.keys import KeyManager

from app.config import settings
from app.models import HealthStatus
from app.storage import get_last_record, get_total_records, AsyncSessionLocal, init_db

# Fail-Fast Environment Check
REQUIRED_ENV_VARS = ["DATABASE_URL"]
# SIGNING_KEY_PATH is handled via settings now

for var in REQUIRED_ENV_VARS:
    # Check both os.environ AND settings
    # Note: DATABASE_URL is mapped in settings.__init__
    val_in_env = os.getenv(var)
    val_in_settings = getattr(settings, var.lower(), None)
    
    if not val_in_env and not val_in_settings:
        sys.stderr.write(f"CRITICAL: Missing required environment variable: {var}\n")
        sys.exit(1)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    import logging
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    logging.basicConfig(level=getattr(logging, log_level, logging.INFO))
    logging.info(f"Recorder starting with log level: {log_level}")
    
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
    
    yield
    
    print("Recorder Service Shutting Down.")

app = FastAPI(title="Regulayer Recorder", version="1.0.0", lifespan=lifespan)

# NOTE: No CORS middleware here. The gateway is the sole CORS layer.

# Global Key Manager
# Use settings.recorder_signing_key_path if env var is missing
key_path = os.getenv("SIGNING_KEY_PATH") or settings.recorder_signing_key_path
if not key_path:
    # Fallback to a default if somehow both are missing (though settings has default)
    key_path = "recorder_ed25519.key"

key_manager = KeyManager(key_path)

# Basic Error Handler for Validation logging
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    import logging
    # Safely convert errors to serializable format
    safe_errors = []
    for err in exc.errors():
        safe_err = {}
        for k, v in err.items():
            try:
                import json
                json.dumps(v)
                safe_err[k] = v
            except (TypeError, ValueError):
                safe_err[k] = str(v)
        safe_errors.append(safe_err)
    msg = f"PYDANTIC VALIDATION ERROR: {safe_errors}\nBody: {exc.body}"
    print(msg, flush=True) # Force stdout
    logging.error(msg)
    return JSONResponse(
        status_code=422,
        content={"detail": safe_errors, "body": str(exc.body)},
    )

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


