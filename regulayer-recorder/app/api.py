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
from typing import Optional, Union

from .models import DecisionEvent, RecordConfirmation, ErrorResponse, IngestRequest
from .storage import AsyncSession, get_db_session
from .validator import validate_decision_event
from .recorder import record_decision
from .attestation_guard import guard, LegacyIngestionDisabledError, InvalidAttestationError
from .errors import (
    RecorderError,
    SchemaValidationError,
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
    body: Union[IngestRequest, DecisionEvent],
    x_regulayer_signature: Optional[str] = Header(None, alias="X-Regulayer-Signature"),
    x_regulayer_algorithm: Optional[str] = Header(None, alias="X-Regulayer-Algorithm"),
    x_regulayer_sdk_version: Optional[str] = Header(None, alias="X-Regulayer-SDK-Version"),
    session: AsyncSession = Depends(get_db_session)
) -> RecordConfirmation:
    """
    Ingest a decision event.
    
    Supports:
    1. Legacy: Raw DecisionEvent + Headers (backward compatible)
    2. Attested: IngestRequest(ingestion_type="attested", payload=AttestationEnvelope)
    
    Flow:
    1. Normalize input to IngestRequest
    2. AttestationGuard.validate_ingestion (Enforce crypto/revocation)
    3. Validate semantics
    4. Record decision
    """
    try:
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
        confirmation = await record_decision(session, event, attestation=attestation)
        
        logger.info(f"Decision recorded: {confirmation.decision_id}, record_id={confirmation.record_id}")
        
        return confirmation
    
    except (SchemaValidationError, LegacyIngestionDisabledError, InvalidAttestationError) as e:
        logger.warning(f"Validation failed: {str(e)}")
        # Map Attestation errors to 401/400 appropriately
        status_code = status.HTTP_400_BAD_REQUEST
        if isinstance(e, (LegacyIngestionDisabledError, InvalidAttestationError)):
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
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "InternalServerError",
                "message": "An unexpected error occurred"
            }
        )
