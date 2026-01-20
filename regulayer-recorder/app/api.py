"""
Regulayer Decision Recorder - HTTP API

Ingestion endpoint for decision events.

Contract:
    POST /v1/decisions
    - 201 Created → accepted & recorded
    - 400 Bad Request → schema violation
    - 401 Unauthorized → auth/signature invalid
    - 409 Conflict → duplicate
    - 422 Unprocessable Entity → semantic inconsistency
"""

from fastapi import APIRouter, Header, HTTPException, Depends, status
from typing import Optional

from .models import DecisionEvent, RecordConfirmation, ErrorResponse
from .storage import AsyncSession, get_db_session
from .validator import validate_decision_event
from .signer import create_verifier
from .canonicalizer import canonicalize_event
from .recorder import record_decision
from .config import settings
from .errors import (
    RecorderError,
    SchemaValidationError,
    SignatureVerificationError,
    DuplicateDecisionError,
    SemanticValidationError,
    TimestampAnomalyError
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1")


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
    event: DecisionEvent,
    x_regulayer_signature: str = Header(..., alias="X-Regulayer-Signature"),
    x_regulayer_algorithm: str = Header(..., alias="X-Regulayer-Algorithm"),
    x_regulayer_sdk_version: str = Header(..., alias="X-Regulayer-SDK-Version"),
    session: AsyncSession = Depends(get_db_session)
) -> RecordConfirmation:
    """
    Ingest a decision event.
    
    Flow:
    1. Validate schema (Pydantic - automatic)
    2. Verify signature
    3. Validate semantics
    4. Record decision (append-only)
    
    Args:
        event: DecisionEvent from SDK
        x_regulayer_signature: Event signature
        x_regulayer_algorithm: Signature algorithm
        x_regulayer_sdk_version: SDK version
        session: Database session
    
    Returns:
        RecordConfirmation
    
    Raises:
        HTTPException: Various error codes based on failure type
    """
    try:
        # 1. Schema validation (already done by Pydantic)
        
        # 2. Verify signature
        canonical_payload = canonicalize_event(event)
        verifier = create_verifier(settings.hmac_secret_key)
        
        # Check algorithm matches
        if x_regulayer_algorithm != verifier.get_algorithm():
            raise SignatureVerificationError(
                f"Unsupported algorithm: {x_regulayer_algorithm}",
                decision_id=str(event.decision_id)
            )
        
        # Verify signature
        if not verifier.verify(canonical_payload, x_regulayer_signature):
            raise SignatureVerificationError(
                "Signature verification failed",
                decision_id=str(event.decision_id)
            )
        
        # 3. Semantic validation
        validate_decision_event(event)
        
        # 4. Record decision
        confirmation = await record_decision(session, event)
        
        logger.info(f"Decision recorded: {confirmation.decision_id}, record_id={confirmation.record_id}")
        
        return confirmation
    
    except SchemaValidationError as e:
        logger.warning(f"Schema validation failed: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "SchemaValidationError",
                "message": e.message,
                "decision_id": e.decision_id
            }
        )
    
    except SignatureVerificationError as e:
        logger.warning(f"Signature verification failed: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "SignatureVerificationError",
                "message": e.message,
                "decision_id": e.decision_id
            }
        )
    
    except DuplicateDecisionError as e:
        logger.warning(f"Duplicate decision: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "error": "DuplicateDecisionError",
                "message": e.message,
                "decision_id": e.decision_id
            }
        )
    
    except (SemanticValidationError, TimestampAnomalyError) as e:
        logger.warning(f"Semantic validation failed: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": e.__class__.__name__,
                "message": e.message,
                "decision_id": e.decision_id
            }
        )
    
    except RecorderError as e:
        logger.error(f"Recorder error: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": e.__class__.__name__,
                "message": e.message,
                "decision_id": e.decision_id
            }
        )
    
    except Exception as e:
        # Unexpected error - log but don't expose stack trace
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "InternalServerError",
                "message": "An unexpected error occurred"
            }
        )
