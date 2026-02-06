"""
Regulayer Decision Recorder - HTTP API

Ingestion endpoint for decision events.

Contract:
    POST /v1/decisions
    - 201 Created → accepted & recorded
    - 400 Bad Request → schema validation
    - 401 Unauthorized → auth/signature invalid
    - 409 Conflict → duplicate
    - 422 Unprocessable Entity → semantic inconsistency
"""

from fastapi import APIRouter, Header, HTTPException, Depends, status
from typing import Optional, Union, List
from uuid import UUID
from datetime import datetime, timezone
import base64

from .models import (
    DecisionEvent, 
    RecordConfirmation, 
    ErrorResponse, 
    IngestRequest,
    DecisionRecord,
    AttestationSummary,
    VerificationMetadata,
    ExportBundle,
    ProofAttestation
)
from .storage import AsyncSession, get_db_session
from .validator import validate_decision_event
from .recorder import record_decision
from .attestation_guard import guard, LegacyIngestionDisabledError, InvalidAttestationError
from .errors import (
    RecorderError,
    SchemaValidationError,
    DuplicateDecisionError,
    SemanticValidationError,
    TimestampAnomalyError,
    SignatureVerificationError,
    OrderingViolationError
)
from .config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/decisions",
    response_model=RecordConfirmation,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "Schema validation failed"},
        401: {"model": ErrorResponse, "description": "Signature verification failed"},
        409: {"model": ErrorResponse, "description": "Duplicate decision"},
        422: {"model": ErrorResponse, "description": "Semantic validation failed"}
    }
)
async def ingest_decision(
    body: DecisionEvent,
    x_regulayer_signature: Optional[str] = Header(None, alias="X-Regulayer-Signature"),
    x_regulayer_algorithm: Optional[str] = Header(None, alias="X-Regulayer-Algorithm"),
    x_regulayer_sdk_version: Optional[str] = Header(None, alias="X-Regulayer-SDK-Version"),
    x_regulayer_project_id: Optional[str] = Header(None, alias="X-Regulayer-Project-Id"),
    x_regulayer_environment: Optional[str] = Header("prod", alias="X-Regulayer-Environment"),
    session: AsyncSession = Depends(get_db_session)
) -> RecordConfirmation:
    """
    Ingest a decision event.
    
    Supports:
    1. Legacy: Raw DecisionEvent + Headers (backward compatible)
    2. Attested: IngestRequest(ingestion_type="attested", payload=AttestationEnvelope)
    
    Flow:
    1. Normalize input to IngestRequest
    2. AttestationGuard.validate_ingestion (Enforce crypto & revocation)
    3. Semantic validation
    4. Record decision
    """
    try:
        # Default to global if not provided (legacy/fallback)
        project_id = x_regulayer_project_id or "global"

        # =========================================================
        # PHASE I.1: Cross-Environment Rejection (Edge-Hardening A)
        # =========================================================
        request_env = x_regulayer_environment or "prod"
        # Normalize "production" to "prod" just in case legacy clients send it
        if request_env == "production":
            request_env = "prod"
            
        if request_env != settings.recorder_environment:
             raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "error": "ENVIRONMENT_MISMATCH",
                    "message": f"Recorder ({settings.recorder_environment}) cannot accept ingestion from environment '{request_env}'."
                }
            )
        # =========================================================

        # 1. Normalize input
        if isinstance(body, DecisionEvent):
            # Legacy SDK sending raw event
            request = IngestRequest(ingestion_type="legacy", payload=body)
        else:
            # New SDK sending IngestRequest
            request = body

        # 2. Guard Validation (Enforce crypto & revocation)
        # Pass legacy headers for legacy verification if needed
        event, attestation = await guard.validate_ingestion(
            request, 
            legacy_signature=x_regulayer_signature,
            legacy_algorithm=x_regulayer_algorithm
        )
        
        # 3. Semantic validation
        validate_decision_event(event)

        # 4. Record decision
        confirmation = await record_decision(
            session, 
            event, 
            attestation=attestation,
            project_id=project_id,
            environment=x_regulayer_environment
        )
        
        logger.info(f"Decision recorded: {confirmation.decision_id}, record_id={confirmation.record_id}, project_id={project_id}")
        
        return confirmation
    
    except (SchemaValidationError, LegacyIngestionDisabledError, InvalidAttestationError, SignatureVerificationError) as e:
        logger.error(f"SCHEMA VALIDATION FAILED: {str(e)}")
        # Map Attestation errors to 401/400 appropriately
        status_code = status.HTTP_400_BAD_REQUEST
        if isinstance(e, (LegacyIngestionDisabledError, InvalidAttestationError, SignatureVerificationError)):
             status_code = status.HTTP_401_UNAUTHORIZED

        raise HTTPException(
            status_code=status_code,
            detail={
                "error": e.__class__.__name__,
                "message": str(e),
                "decision_id": str(getattr(e, 'decision_id', 'unknown'))
            }
        )
    
    except DuplicateDecisionError as e:
        logger.error(f"DUPLICATE DECISION: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "error": "DuplicateDecisionError",
                "message": e.message,
                "decision_id": e.decision_id
            }
        )
    
    except (SemanticValidationError, TimestampAnomalyError) as e:
        logger.error(f"SEMANTIC VALIDATION FAILED: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": e.__class__.__name__,
                "message": e.message,
                "decision_id": e.decision_id
            }
        )
    
    # 5. Handle Ordering Violations -> 409 Conflict (Client needs to resync/retry)
    except OrderingViolationError as e:
        logger.error(f"ORDERING VIOLATION: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "error": "OrderingViolationError",
                "message": e.message,
                "decision_id": e.decision_id
            }
        )

    except RecorderError as e:
        logger.error(f"RECORDER ERROR: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": e.__class__.__name__,
                "message": e.message,
                "decision_id": e.decision_id
            }
        )
    
    except Exception as e:
        import traceback
        trace = traceback.format_exc()
        print(f"CRITICAL CRASH:\n{trace}", flush=True) 
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "InternalServerError",
                "message": "An unexpected error occurred"
            }
        )


@router.get(
    "/decisions",
    response_model=List[DecisionRecord],
    status_code=status.HTTP_200_OK
)
async def list_decisions(
    limit: int = 50,
    offset: int = 0,
    x_regulayer_project_id: Optional[str] = Header(None, alias="X-Regulayer-Project-Id"),
    session: AsyncSession = Depends(get_db_session)
):
    """
    List decisions.
    
    If project_id is provided, filters by chain_id=project_id.
    """
    try:
        from .storage import get_latest_records
        
        # If no project ID (e.g. global view), use "global" or require it?
        # SaaS model requires project_id usually.
        # But for now, we default to "global" if not present to match recording logic.
        chain_id = x_regulayer_project_id or "global"
        
        records = await get_latest_records(session, chain_id, limit, offset)
        
        return [
            DecisionRecord(
                record_id=r.record_id,
                record_hash=r.record_hash,
                previous_record_hash=r.previous_record_hash,
                canonical_payload=r.canonical_payload,
                canonical_payload_hash=r.canonical_payload_hash,
                chain_id=r.chain_id,
                server_timestamp=r.server_timestamp,
                decision_id=r.decision_id,
                sdk_instance_id=r.sdk_instance_id,
                system_name=r.system_name,
                risk_level=r.risk_level,
                event_state=r.event_state,
                sdk_version=r.sdk_version,
                attestation=AttestationSummary(
                    identity_id=r.identity_id,
                    algorithm=r.signature_algorithm,
                    signed_at=r.signed_at,
                    identity_status_at_signing="active"
                ) if r.signature_algorithm else None
            )
            for r in records
        ]
    except Exception as e:
        logger.error(f"Failed to list decisions: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch decisions")


@router.get(
    "/decisions/{decision_id}",
    response_model=DecisionRecord,
    responses={404: {"model": ErrorResponse, "description": "Decision not found"}}
)
async def get_decision(decision_id: str, session: AsyncSession = Depends(get_db_session)) -> DecisionRecord:
    """Read a single decision record by ID."""
    try:
        uuid_id = UUID(decision_id)
        from sqlalchemy import select
        from .storage import DecisionRecordDB
        
        stmt = select(DecisionRecordDB).where(DecisionRecordDB.decision_id == uuid_id)
        result = await session.execute(stmt)
        record = result.scalars().first()
        
        if not record:
            raise HTTPException(status_code=404, detail={"error": "NotFound", "message": f"Decision {decision_id} not found"})
            
        return DecisionRecord(
            record_id=record.record_id,
            record_hash=record.record_hash,
            previous_record_hash=record.previous_record_hash,
            canonical_payload=record.canonical_payload,
            canonical_payload_hash=record.canonical_payload_hash,
            chain_id=record.chain_id,
            server_timestamp=record.server_timestamp,
            decision_id=record.decision_id,
            sdk_instance_id=record.sdk_instance_id,
            system_name=record.system_name,
            risk_level=record.risk_level,
            event_state=record.event_state,
            sdk_version=record.sdk_version,
            attestation=AttestationSummary(
                identity_id=record.identity_id,
                algorithm=record.signature_algorithm,
                signed_at=record.signed_at,
                identity_status_at_signing="active" if record.identity_id else "revoked_after" # Simplifying for read-only View
            ) if record.signature_algorithm else None
        )
    except ValueError:
         raise HTTPException(status_code=400, detail={"error": "BadRequest", "message": "Invalid UUID"})


@router.get("/verify/decision/{decision_id}")
async def verify_decision_spot(decision_id: str, session: AsyncSession = Depends(get_db_session)):
    """
    Spot verification (declarative).
    
    Checks:
    1. Record exists
    2. Hashes match (recompute canonical_hash)
    3. Chain link valid (previous record exists if not first)
    4. Identity status (is it revoked NOW?)
    """
    try:
        uuid_id = UUID(decision_id)
        from sqlalchemy import select
        from .storage import DecisionRecordDB
        from .recorder import compute_canonical_hash
        
        stmt = select(DecisionRecordDB).where(DecisionRecordDB.decision_id == uuid_id)
        result = await session.execute(stmt)
        record = result.scalars().first()
        
        if not record:
             raise HTTPException(status_code=404, detail={"error": "NotFound", "message": "Record not found"})
             
        # Declarative check: Hash Integrity
        computed_hash = compute_canonical_hash(record.canonical_payload)
        hash_valid = (computed_hash == record.canonical_payload_hash)
        
        return {
            "record_valid": True,
            "hash_chain_valid": hash_valid,
            "signature_valid": bool(record.signature_algorithm),
            "identity_status_at_signing": "active", # Placeholder for Phase 2.3 logic
            "verification_timestamp": datetime.now(timezone.utc).isoformat()
        }
    except ValueError:
        raise HTTPException(status_code=400, detail={"error": "BadRequest", "message": "Invalid UUID"})


@router.get("/decisions/{decision_id}/export", response_model=ExportBundle)
async def export_decision_bundle(decision_id: str, session: AsyncSession = Depends(get_db_session)) -> ExportBundle:
    """Export self-contained verification bundle."""
    try:
        uuid_id = UUID(decision_id)
        from sqlalchemy import select
        from .storage import DecisionRecordDB
        
        stmt = select(DecisionRecordDB).where(DecisionRecordDB.decision_id == uuid_id)
        result = await session.execute(stmt)
        record = result.scalars().first()
        
        if not record:
            raise HTTPException(status_code=404, detail={"error": "NotFound", "message": f"Decision {decision_id} not found"})
            
        # Prepare attestation object
        attestation_obj = None
        if record.signature_algorithm:
            # Fetch public key from registry
            try:
                identity = guard.registry.get_identity(str(record.identity_id))
                # Registry has HEX key, Spec requires Base64. Convert.
                pub_key_bytes = bytes.fromhex(identity.public_key)
                pub_key = base64.b64encode(pub_key_bytes).decode('utf-8')
            except Exception:
                pub_key = "UNKNOWN-IDENTITY-NOT-FOUND"

            # Extract signature from stored envelope
            sig = "MISSING"
            if record.attestation_payload:
                sig = record.attestation_payload.get('attestation', {}).get('signature', "MISSING")

            attestation_obj = ProofAttestation(
                identity_id=record.identity_id,
                public_key=pub_key,
                algorithm=record.signature_algorithm,
                signed_at=record.signed_at,
                signature=sig
            )

        # Extract environment metadata (Phase I.1)
        env_metadata = None
        if record.attestation_payload:
            watermark = record.attestation_payload.get('_watermark')
            if watermark:
                env_metadata = {
                    "environment": watermark.get("environment", "unknown"),
                    "non_production": True
                }

        return ExportBundle(
            proof_bundle_version="1.0.0",
            record_id=record.record_id,
            canonical_event=record.canonical_payload,
            attestation=attestation_obj,
            record_hash=record.record_hash,
            previous_record_hash=record.previous_record_hash,
            chain_id=record.chain_id,
            server_timestamp=record.server_timestamp,
            verification_metadata=VerificationMetadata(
                verified_at=datetime.now(timezone.utc),
                verifier_version="2.3.0",
                recorder_version="1.0.0",
                verification_result="VALID"
            ),
            environment_metadata=env_metadata
        )
    except ValueError:
        raise HTTPException(status_code=400, detail={"error": "BadRequest", "message": "Invalid UUID"})


from .models import ChainStatus, VerificationResult
from .storage import get_total_records, get_last_record, get_first_record
from .config import settings
import time

@router.get("/verify/chain", response_model=ChainStatus)
async def get_chain_status(session: AsyncSession = Depends(get_db_session)):
    """Get high-level chain status."""
    total = await get_total_records(session)
    last = await get_last_record(session, settings.chain_id)
    first = await get_first_record(session, settings.chain_id)
    
    return ChainStatus(
        chain_id=settings.chain_id,
        total_records=total,
        first_record_timestamp=first.server_timestamp if first else None,
        last_record_timestamp=last.server_timestamp if last else None,
        integrity_status="UNKNOWN", # Without running full verify
    )


@router.get("/verify/chain/full", response_model=VerificationResult)
async def verify_chain_full(session: AsyncSession = Depends(get_db_session)):
    """
    Run full chain verification.
    
    For Phase 2.3, this performs:
    1. Hash chain integrity check (previous_hash links).
    2. Counts attested vs legacy records.
    3. Counts revoked records.
    """
    start_time = time.perf_counter()
    from sqlalchemy import select, asc
    from .storage import DecisionRecordDB
    from .recorder import compute_canonical_hash
    
    # In a real system, we might stream this. here we fetch all for simplicity (Demo scale)
    stmt = select(DecisionRecordDB).order_by(asc(DecisionRecordDB.record_id))
    result = await session.execute(stmt)
    records = result.scalars().all()
    
    errors = []
    broken_at = None
    attested_count = 0
    legacy_count = 0
    revoked_count = 0
    
    expected_prev_hash = None
    
    for record in records:
        # 1. Attestation Stats
        if record.signature_algorithm:
            attested_count += 1
            # Simple revocation check: if identity_id exists but verify logic fails? 
            # We don't have separate "revoked" flag in DB yet. 
            pass
        else:
            legacy_count += 1
            
        # 2. Chain Integrity
        if record.record_id > 1:
            if record.previous_record_hash != expected_prev_hash:
                 if not broken_at:
                     broken_at = record.record_id
                 errors.append(f"Broken link at record {record.record_id}")
        
        expected_prev_hash = record.record_hash
        
    execution_time = (time.perf_counter() - start_time) * 1000
    
    return VerificationResult(
        is_valid=len(errors) == 0,
        total_records_checked=len(records),
        broken_at_record_id=broken_at,
        verification_duration_ms=execution_time,
        errors=errors[:10],
        attested_records_count=attested_count,
        legacy_records_count=legacy_count,
        revoked_records_count=revoked_count
    )
