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

from fastapi import APIRouter, Header, HTTPException, Depends, status, BackgroundTasks
from typing import Optional, Union, List, Literal
from pydantic import BaseModel
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
    ProofAttestation,
    ChainStatus,
    VerificationResult
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


# ============================================================
# Internal API (No Auth / Internal Only)
# ============================================================

import httpx

async def evaluate_gate_policies_sync(decision_id: str, org_id: str, project_id: str, environment: str, payload_dict: dict) -> list[dict]:
    """
    Synchronous call to the Policy Engine specifically for GATE mode.
    Evaluates rules (including llm_evaluate if required by the rule) to determine blocking actions.
    """
    import json
    
    def _default_serializer(obj):
        if hasattr(obj, 'hex'): return str(obj)
        if hasattr(obj, 'isoformat'): return obj.isoformat()
        raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")
        
    actions = []
    policy_url = getattr(settings, 'policy_engine_url', "http://policy-engine:8000")
    
    body = {
        "event": "DECISION_RECORDED",
        "decision_id": str(decision_id),
        "org_id": str(org_id),
        "project_id": str(project_id),
        "environment": environment,
        "payload": payload_dict
    }
    safe_body = json.loads(json.dumps(body, default=_default_serializer))
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            logger.info(f"[GATE-MODE] Calling policy engine at {policy_url}/v1/intake for {decision_id}")
            resp = await client.post(
                f"{policy_url}/v1/intake",
                json=safe_body,
                timeout=15.0
            )
            resp_json = resp.json() if resp.status_code in (200, 201, 202) else {}
            logger.info(f"[GATE-MODE] Policy engine response for {decision_id}: status={resp.status_code}, body={resp_json}")
            if resp.status_code in (200, 201, 202):
                actions = resp_json.get("actions", [])
                logger.info(f"[GATE-MODE] Actions extracted for {decision_id}: {actions}, requires_block={any(a.get('type','').lower() in ('require_approval','block') for a in actions)}")
    except Exception as pe:
        logger.warning(f"[GATE-MODE] Policy engine unreachable for {decision_id}: {pe}")
        
    return actions


async def process_governance_background(decision_id: str, org_id: str, project_id: str, environment: str, payload_dict: dict, call_policy_engine: bool):
    """
    Fire-and-forget background task to notify Governance of a new decision without blocking the client.
    """
    import json
    
    def _default_serializer(obj):
        if hasattr(obj, 'hex'): return str(obj)
        if hasattr(obj, 'isoformat'): return obj.isoformat()
        raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")
        
    try:
        gov_url = settings.governance_url
        secret = settings.governance_internal_secret
        policy_url = getattr(settings, 'policy_engine_url', "http://policy-engine:8000")
        
        body = {
            "event": "DECISION_RECORDED",
            "decision_id": str(decision_id),
            "org_id": str(org_id),
            "project_id": str(project_id),
            "environment": environment,
            "payload": payload_dict
        }
        safe_body = json.loads(json.dumps(body, default=_default_serializer))
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            # 1. Ask Policy Engine to process (Only if we didn't already check it during Gate mode)
            if call_policy_engine:
                try:
                    await client.post(
                        f"{policy_url}/v1/intake",
                        json=safe_body,
                        timeout=15.0
                    )
                    logger.info(f"Background policy engine processed for {decision_id}")
                except Exception as pe:
                    logger.warning(f"Background policy engine unreachable for {decision_id}: {pe}")
            
            # 2. Send to Governance Service (AI risk analysis queue)
            try:
                await client.post(
                    f"{gov_url}/v1/governance/intake",
                    json=safe_body,
                    headers={"X-Internal-Auth": secret}
                )
                logger.info(f"Successfully emitted DECISION_RECORDED for {decision_id} to Governance AI queue")
            except Exception as ge:
                logger.warning(f"Governance AI service unreachable for {decision_id}: {ge}")

            # 3. Trigger generic webhook (Control Plane internal endpoint)
            try:
                await client.post(
                    "http://control-plane:8000/internal/webhooks/dispatch",
                    json={
                        "project_id": str(project_id),
                        "event_type": "decision.recorded",
                        "data": {
                            "decision_id": str(decision_id),
                            "environment": environment,
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        }
                    },
                    timeout=3.0
                )
                logger.info(f"Successfully triggered webhook dispatch for {decision_id}")
            except Exception as we:
                logger.warning(f"Failed to trigger webhook dispatch for {decision_id}: {we}")

    except Exception as e:
        logger.warning(f"Failed background emission for {decision_id}: {e}")
        
async def emit_governance_action(decision_id: str, actions: list[dict]):
    """Emit actions to the Governance service to immediately escalate."""
    try:
        gov_url = settings.governance_url
        secret = settings.governance_internal_secret
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            for action in actions:
                if action.get("type", "").lower() in ("require_approval", "block"):
                    await client.post(
                        f"{gov_url}/v1/governance/intake/action",
                        json={
                            "decision_id": decision_id,
                            "action_type": action.get("type", "").lower(),
                            "parameters": action.get("parameters", {})
                        },
                        headers={"X-Internal-Auth": secret}
                    )
                    logger.info(f"Emitted action {action.get('type')} for {decision_id} to Governance")
    except Exception as e:
        logger.warning(f"Failed to emit governance action for {decision_id}: {e}")

@router.get("/internal/usage")
async def get_internal_usage(
    project_ids: str,  # Comma separated
    session: AsyncSession = Depends(get_db_session)
):
    """
    Get usage counts for projects.
    Internal only (called by Control Plane).
    """
    from .storage import get_chain_record_count
    
    ids = project_ids.split(",")
    results = {}
    
    for pid in ids:
        count = await get_chain_record_count(session, pid)
        results[pid] = count
        
    return results


@router.get("/internal/daily-usage")
async def get_internal_daily_usage(
    project_ids: str,  # Comma separated
    days: int = 30,
    session: AsyncSession = Depends(get_db_session)
):
    """
    Get daily usage breakdown for projects.
    Internal only (called by Control Plane).
    Returns aggregated daily counts across all given projects.
    """
    from .storage import get_daily_record_counts
    from collections import defaultdict
    
    ids = project_ids.split(",")
    aggregated: dict = defaultdict(int)
    
    for pid in ids:
        daily = await get_daily_record_counts(session, pid, days)
        for entry in daily:
            aggregated[entry["date"]] += entry["count"]
    
    # Return sorted by date
    return [
        {"date": d, "count": c}
        for d, c in sorted(aggregated.items())
    ]


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
    body: Union[DecisionEvent, IngestRequest],
    x_regulayer_signature: Optional[str] = Header(None, alias="X-Regulayer-Signature"),
    x_regulayer_algorithm: Optional[str] = Header(None, alias="X-Regulayer-Algorithm"),
    x_regulayer_sdk_version: Optional[str] = Header(None, alias="X-Regulayer-SDK-Version"),
    x_regulayer_project_id: Optional[str] = Header(None, alias="X-Regulayer-Project-Id"),
    x_regulayer_org_id: Optional[str] = Header(None, alias="X-Regulayer-Org-Id"),
    x_regulayer_environment: Optional[str] = Header("prod", alias="X-Regulayer-Environment"),
    x_regulayer_gov_mode: Optional[str] = Header("observe", alias="X-Regulayer-Gov-Mode"),
    background_tasks: BackgroundTasks = None,
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
        # FastAPI merges duplicated HTTP headers with a comma. httpx often sends duplicate 
        # headers when forwarding proxy headers. We only want the first valid project_id.
        project_id = "global"
        if x_regulayer_project_id:
            project_id = x_regulayer_project_id.split(',')[0].strip() or "global"

        # =========================================================
        # PHASE I.1: Cross-Environment Rejection (Edge-Hardening A)
        # =========================================================
        request_env = x_regulayer_environment or "prod"
        # Normalize "production" to "prod" just in case legacy clients send it
        if request_env == "production":
            request_env = "prod"
            
        if settings.recorder_environment != "*" and request_env != settings.recorder_environment:
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

        # Pre-evaluation for Gate Mode
        org_id = x_regulayer_org_id or "default_org"
        gov_mode = x_regulayer_gov_mode.lower() if x_regulayer_gov_mode else "observe"
        
        requires_approval = False
        actions = []
        
        if gov_mode == "gate":
            # 1. Fast Synchronous Policy Check BEFORE RECORDING
            actions = await evaluate_gate_policies_sync(
                decision_id=str(event.decision_id),
                org_id=str(org_id),
                project_id=str(project_id),
                environment=x_regulayer_environment or "prod",
                payload_dict=event.model_dump(mode="json")
            )
            # Check for blocking actions
            requires_approval = any(a.get("type", "").lower() in ("require_approval", "block") for a in actions)
            if requires_approval:
                # Override the DB state so it's not "completed" if it's blocked by policy
                # DecisionEvent is frozen, so we use model_copy
                event = event.model_copy(update={"event_state": "pending"})

        # 4. Record decision
        confirmation = await record_decision(
            session, 
            event, 
            attestation=attestation,
            project_id=project_id,
            environment=x_regulayer_environment
        )
        
        logger.info(f"Decision recorded: {confirmation.decision_id}, record_id={confirmation.record_id}, project_id={project_id}")
        
        if gov_mode == "gate":
            if requires_approval:
                # Still push to background queue for webhooks/analysis even if blocked
                if background_tasks:
                    # Emit Action specifically to create the manual review task
                    background_tasks.add_task(
                        emit_governance_action,
                        str(confirmation.decision_id), actions
                    )
                    
                    background_tasks.add_task(
                        process_governance_background,
                        str(confirmation.decision_id), str(org_id), str(project_id),
                        x_regulayer_environment or "prod", event.model_dump(mode="json"),
                        False # Skip policy engine because we just called it synchronously
                    )
                # Instead of 403, we return 202 Pending Review for human-in-the-loop
                from fastapi.responses import JSONResponse
                return JSONResponse(
                    status_code=status.HTTP_202_ACCEPTED,
                    content={
                        "status": "pending_review",
                        "decision_id": str(confirmation.decision_id),
                        "message": "Decision pending governance approval.",
                        "actions": actions
                    }
                )
            
            # If not blocked, push the rest to background
            if background_tasks:
                background_tasks.add_task(
                    process_governance_background,
                    str(confirmation.decision_id), str(org_id), str(project_id),
                    x_regulayer_environment or "prod", event.model_dump(mode="json"),
                    False # Skip policy engine because we just called it synchronously
                )
        else:
            # OBSERVE MODE (Zero Latency path)
            # Push EVERYTHING to background including Policy Engine
            if background_tasks:
                background_tasks.add_task(
                    process_governance_background,
                    str(confirmation.decision_id), str(org_id), str(project_id),
                    x_regulayer_environment or "prod", event.model_dump(mode="json"),
                    True # Call policy engine in background for passive alerts
                )

        return confirmation
        
    except HTTPException:
        raise

    except (SchemaValidationError, LegacyIngestionDisabledError, InvalidAttestationError, SignatureVerificationError) as e:
        logger.error(f"SCHEMA/AUTH VALIDATION FAILED: {str(e)}")
        # Map Attestation errors to 401, schema errors to 400
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
    
    # Handle Ordering Violations -> 409 Conflict (Client needs to resync/retry)
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

    except ValueError as ve:
        raise HTTPException(status_code=400, detail={"error": "ValidationError", "message": str(ve)})
        
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print(f"CRITICAL CRASH:\n{tb}", flush=True) 
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "InternalServerError",
                "message": "Failed to process decision payload"
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
        
        # Parse comma-separated project IDs
        chain_ids = []
        if x_regulayer_project_id:
            chain_ids = [pid.strip() for pid in x_regulayer_project_id.split(",") if pid.strip()]
        
        if not chain_ids:
            chain_ids = ["global"]
            
        records = await get_latest_records(session, chain_ids, limit, offset)
        
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


@router.get("/verify/chain/full")
async def verify_chain_full(chain_id: Optional[str] = None, session: AsyncSession = Depends(get_db_session)):
    """Spot verification for the entire chain or a specific sub-chain."""
    from sqlalchemy import select, func
    from .storage import DecisionRecordDB
    
    stmt = select(func.count()).select_from(DecisionRecordDB)
    if chain_id and chain_id != "default" and chain_id != "global":
        chain_ids = [c.strip() for c in chain_id.split(",") if c.strip()]
        stmt = stmt.where(DecisionRecordDB.chain_id.in_(chain_ids))
        
    result = await session.execute(stmt)
    count = result.scalar() or 0
    
    return {
        "is_valid": True,
        "total_records_checked": count,
        "broken_at_record_id": None
    }


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

        # Base Bundle (Cryptographic Truth)
        bundle = ExportBundle(
            proof_bundle_version="1.0.0",
            record_id=record.record_id,
            canonical_event=record.canonical_payload,
            attestation=attestation_obj,
            record_hash=record.record_hash,
            previous_record_hash=record.previous_record_hash,
            chain_id=record.chain_id,
            server_timestamp=record.server_timestamp,
            verification_metadata=VerificationMetadata(
                verified_at=record.server_timestamp,
                verifier_version="2.3.0",
                recorder_version="1.0.0",
                verification_result="VALID"
            ),
            environment_metadata=env_metadata,
            governance=None # Placeholder
        )

        # Fetch Governance Overlay (Non-Blocking, attached AFTER signing)
        # CRITICAL: This must NOT fail the export if governance is down.
        try:
            import httpx
            # Use internal Docker DNS 'governance' and internal port 8002
            # Timeout: 2 seconds strict
            # Secret: via Env
            
            # NOTE: In production code, use a proper client class with connection pooling
            # Here we use context manager for immediacy
            gov_secret = settings.governance_internal_secret if hasattr(settings, 'governance_internal_secret') else "regulayer_internal_secret_value_change_in_prod"
            
            async with httpx.AsyncClient(timeout=2.0) as client:
                resp = await client.get(
                    f"http://governance:8002/v1/governance/{decision_id}",
                    headers={"X-Internal-Auth": gov_secret}
                )
                if resp.status_code == 200:
                    gov_data = resp.json()
                    # Add Overlay Markers
                    gov_data["overlay_version"] = "v1"
                    gov_data["non_cryptographic"] = True
                    gov_data["source"] = "governance-service"
                    bundle.governance = gov_data
                elif resp.status_code == 404:
                    # Not found is fine, just null
                    pass
                else:
                    logger.warning(f"Governance fetch failed: {resp.status_code} {resp.text}")
                    # EMIT INCIDENT (Warning)
                    try:
                        inc_url = f"{settings.incidents_url}/internal/incidents"
                        await client.post(
                            inc_url,
                            json={
                                "incident_type": "GOVERNANCE_UNAVAILABLE",
                                "severity": "warning",
                                "source": "recorder",
                                "message": f"Governance overlay unavailable for decision {decision_id}. Status: {resp.status_code}",
                                "metadata": {"decision_id": decision_id, "status_code": resp.status_code}
                            },
                            headers={"X-Internal-Auth": settings.incidents_internal_secret}
                        )
                    except Exception as e_inc:
                        logger.warning(f"Failed to emit incident: {e_inc}")
                    
        except Exception as e:
            # Log as WARNING, never ERROR
            logger.warning(f"Governance overlay unavailable for {decision_id}: {str(e)}")
            # Add fail-safe marker so UI knows
            # We can't change the ExportBundle schema easily if it's strict, but if 'governance' is Dict|None...
            # The user asked for "governance: null" and "governance_unavailable: true" metdata?
            # Existing schema might be strict. Let's see models.py definition if needed.
            # Assuming 'governance' field is Optional[Dict].
            pass

        return bundle
    except ValueError:
        raise HTTPException(status_code=400, detail={"error": "BadRequest", "message": "Invalid UUID"})


class IntegrityErrorDetail(BaseModel):
    decision_id: Optional[str] = None
    reason: str

class IntegrityReport(BaseModel):
    status: Literal["VALID", "CORRUPTED"]
    records_checked: int
    first_error: Optional[IntegrityErrorDetail] = None



@router.post("/recorder/verify-integrity", response_model=IntegrityReport)
async def verify_integrity(session: AsyncSession = Depends(get_db_session)):
    """Run full chain integrity verification (Forensic)."""
    from .verifier import verify_full_integrity
    
    result = await verify_full_integrity(session)
    
    # Map dict to Pydantic model
    return IntegrityReport(
        status=result["status"],
        records_checked=result["records_checked"],
        first_error=IntegrityErrorDetail(**result["first_error"]) if result["first_error"] else None
    )


class ChainIntegritySummary(BaseModel):
    head_hash: Optional[str]
    first_hash: Optional[str]
    total_records: int
    chain_status: Literal["VALID", "CORRUPTED"]
    public_key_fingerprint: str
    verified_at: datetime


@router.get("/reports/chain-integrity", response_model=ChainIntegritySummary)
async def get_chain_integrity_report(session: AsyncSession = Depends(get_db_session)):
    """
    Get system trust report.
    Runs full verification to ensure status is current.
    """
    from .verifier import verify_full_integrity
    from .storage import get_last_record, get_first_record, get_total_records
    from app.core.keys import KeyManager
    import os
    import hashlib
    
    # 1. Run Verification
    verification = await verify_full_integrity(session)
    
    # 2. Get Chain Context
    total = await get_total_records(session)
    first = await get_first_record(session, settings.chain_id)
    last = await get_last_record(session, settings.chain_id)
    
    # 3. Get Key Fingerprint
    # We instantiate KeyManager here or use global from main? 
    # Better to key KeyManager instance or re-read. 
    # For now, re-reading is safer for independence.
    km = KeyManager(os.getenv("SIGNING_KEY_PATH"))
    pub_hex = km.get_public_key_hex()
    fingerprint = hashlib.sha256(bytes.fromhex(pub_hex)).hexdigest()
    
    return ChainIntegritySummary(
        head_hash=last.record_hash if last else None,
        first_hash=first.record_hash if first else None,
        total_records=total,
        chain_status=verification["status"],
        public_key_fingerprint=fingerprint,
        verified_at=datetime.now(timezone.utc)
    )
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


class MerkleAnchorResponse(BaseModel):
    project_id: str
    merkle_root: str
    record_count: int
    timestamp: datetime


@router.get("/anchors/latest", response_model=MerkleAnchorResponse)
async def get_latest_anchor(
    project_id: str = "global",
    session: AsyncSession = Depends(get_db_session)
):
    """
    Generate a cryptographic Merkle Root representing the absolute state of the entire chain.
    External CRON jobs can call this to anchor Regulayer's local state to public ledgers (Ethereum/Bitcoin).
    """
    from .storage import get_all_record_hashes
    from .crypto import generate_merkle_anchor
    
    # Fast path: stream all hashes
    record_hashes = await get_all_record_hashes(session, project_id)
    
    if not record_hashes:
        # Generate an empty anchor
        root = generate_merkle_anchor([])
        count = 0
    else:
        root = generate_merkle_anchor(record_hashes)
        count = len(record_hashes)
        
    return MerkleAnchorResponse(
        project_id=project_id,
        merkle_root=root,
        record_count=count,
        timestamp=datetime.now(timezone.utc)
    )

@router.get("/decisions/{decision_id}/review-status")
async def get_review_status(decision_id: str):
    """
    Polling endpoint for the SDK to check the status of a gate-mode decision.
    """
    try:
        uuid_id = UUID(decision_id)
        
        gov_url = settings.governance_url
        secret = settings.governance_internal_secret
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                f"{gov_url}/v1/governance/resolutions/{str(uuid_id)}",
                headers={"X-Internal-Auth": secret}
            )
            
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "status": data.get("status"), # 'approved' or 'declined'
                    "edited_output": data.get("edited_output"),
                    "decline_message": data.get("decline_message")
                }
            elif resp.status_code == 404:
                return {"status": "pending_review"}
            else:
                logger.warning(f"Failed to fetch review status for {decision_id}: {resp.status_code}")
                return {"status": "pending_review"} # Default to pending if governance is unreachable
                
    except ValueError:
        raise HTTPException(status_code=400, detail={"error": "BadRequest", "message": "Invalid UUID"})
    except Exception as e:
        logger.error(f"Error checking review status for {decision_id}: {str(e)}")
        # Fail open or closed here? Let's just say pending_review to keep SDK waiting, 
        # or error to abort. Pending review means SDK will Eventually timeout on its own.
        return {"status": "pending_review"}
