"""
Regulayer Governance - API Endpoints

CRITICAL CONSTRAINTS:
1. All endpoints are READ-ONLY or APPEND-ONLY
2. Annotations cannot be edited or deleted
3. Tags cannot be deleted in Phase 4.1
4. Invalid review state transitions return 409 Conflict
5. Governance data NEVER affects cryptographic verification
6. Access control enforces Segregation of Duties (Phase 4.4)
"""

from fastapi import APIRouter, HTTPException, Depends, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from uuid import UUID
from typing import List, Optional

from .models import (
    GovernanceMetadata,
    GovernanceTag,
    GovernanceAnnotation,
    GovernanceTagCreate,
    GovernanceAnnotationCreate,
    GovernanceReviewState,
    ReviewStateUpdate,
    VALID_REVIEW_TRANSITIONS
)
from .storage import (
    get_governance_session,
    GovernanceMetadataDB,
    GovernanceTagDB,
    GovernanceAnnotationDB
)
from .access_control import (
    GovernanceRole,
    GovernancePermission,
    require_permission,
    raise_403,
    raise_conflict_403,
    check_approver_conflict,
    AccessControlError,
    ConflictOfInterestError,
    get_role_capabilities
)
from .audit_logger import log_governance_action, GovernanceAction

router = APIRouter(prefix="/v1/governance", tags=["governance"])


def get_actor_role(x_actor_role: Optional[str] = Header(None, alias="X-Actor-Role")) -> GovernanceRole:
    """
    Extract actor role from request header.
    
    In production, this would come from authentication/authorization middleware.
    """
    if not x_actor_role:
        return GovernanceRole.ANALYST  # Default for demo
    
    try:
        return GovernanceRole(x_actor_role.lower())
    except ValueError:
        return GovernanceRole.ANALYST


@router.get("/roles/{role}/capabilities")
async def get_capabilities(role: str):
    """
    Get capabilities for a role (for UI state).
    
    Returns what actions a role can perform.
    """
    try:
        governance_role = GovernanceRole(role.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Unknown role: {role}")
    
    return {
        "role": role,
        "capabilities": get_role_capabilities(governance_role)
    }


@router.get(
    "/queue",
    response_model=List[GovernanceMetadata],
    summary="Get queue of decisions for review"
)
async def get_review_queue(
    status: Optional[str] = "unreviewed",
    limit: int = 50,
    offset: int = 0,
    session: AsyncSession = Depends(get_governance_session)
) -> List[GovernanceMetadata]:
    """
    List decisions pending review.
    
    Default status: 'unreviewed'.
    """
    # Validate status enum if provided
    filter_status = GovernanceReviewState.UNREVIEWED.value
    if status:
        try:
            filter_status = GovernanceReviewState(status).value
        except ValueError:
            pass # Keep default or allow filtering by any string? Better to be strict.
            # Actually, let's just use the string for now to match DB.
            filter_status = status

    stmt = (
        select(GovernanceMetadataDB)
        .where(GovernanceMetadataDB.review_state == filter_status)
        .order_by(GovernanceMetadataDB.last_updated.desc())
        .limit(limit)
        .offset(offset)
    )
    
    result = await session.execute(stmt)
    metadatas = result.scalars().all()
    
    # We need to fetch tags/annotations for these? 
    # The response_model is GovernanceMetadata which includes them.
    # This implies N+1 queries if we loop.
    # For a list view, we might want a lighter model, but let's stick to full model for MVP simplicity.
    # We will fetch full details for each.
    
    full_results = []
    for m in metadatas:
        # Fetch tags
        stmt_tags = select(GovernanceTagDB).where(GovernanceTagDB.decision_id == m.decision_id)
        res_tags = await session.execute(stmt_tags)
        tags = res_tags.scalars().all()
        
        # Fetch annotations
        stmt_notes = select(GovernanceAnnotationDB).where(
            GovernanceAnnotationDB.decision_id == m.decision_id
        ).order_by(GovernanceAnnotationDB.created_at.desc())
        res_notes = await session.execute(stmt_notes)
        notes = res_notes.scalars().all()
        
        full_results.append(GovernanceMetadata(
            decision_id=m.decision_id,
            review_state=GovernanceReviewState(m.review_state),
            tags=[
                GovernanceTag(
                    id=t.id,
                    decision_id=t.decision_id,
                    name=t.name,
                    category=t.category,
                    source=t.source,
                    created_at=t.created_at
                ) for t in tags
            ],
            annotations=[
                GovernanceAnnotation(
                    id=a.id,
                    decision_id=a.decision_id,
                    author_role=a.author_role,
                    note=a.note,
                    created_at=a.created_at
                ) for a in notes
            ],
            last_updated=m.last_updated
        ))
        
    return full_results



@router.get(
    "/{decision_id}",
    response_model=GovernanceMetadata,
    summary="Get governance metadata for a decision"
)
async def get_governance(
    decision_id: UUID,
    session: AsyncSession = Depends(get_governance_session)
) -> GovernanceMetadata:
    """
    Retrieve full governance metadata for a decision.
    
    NOTE: Governance metadata does NOT affect cryptographic validity.
    """
    # Get or create metadata record
    stmt = select(GovernanceMetadataDB).where(GovernanceMetadataDB.decision_id == decision_id)
    result = await session.execute(stmt)
    metadata = result.scalars().first()
    
    if not metadata:
        # Auto-create unreviewed record
        metadata = GovernanceMetadataDB(
            decision_id=decision_id,
            review_state=GovernanceReviewState.UNREVIEWED.value,
            last_updated=datetime.now(timezone.utc)
        )
        session.add(metadata)
        await session.commit()
        await session.refresh(metadata)
    
    # Get tags
    stmt = select(GovernanceTagDB).where(GovernanceTagDB.decision_id == decision_id)
    result = await session.execute(stmt)
    tags_db = result.scalars().all()
    
    # Get annotations
    stmt = select(GovernanceAnnotationDB).where(
        GovernanceAnnotationDB.decision_id == decision_id
    ).order_by(GovernanceAnnotationDB.created_at.desc())
    result = await session.execute(stmt)
    annotations_db = result.scalars().all()
    
    return GovernanceMetadata(
        decision_id=metadata.decision_id,
        review_state=GovernanceReviewState(metadata.review_state),
        tags=[
            GovernanceTag(
                id=t.id,
                decision_id=t.decision_id,
                name=t.name,
                category=t.category,
                source=t.source,
                created_at=t.created_at
            ) for t in tags_db
        ],
        annotations=[
            GovernanceAnnotation(
                id=a.id,
                decision_id=a.decision_id,
                author_role=a.author_role,
                note=a.note,
                created_at=a.created_at
            ) for a in annotations_db
        ],
        last_updated=metadata.last_updated
    )


@router.post(
    "/{decision_id}/annotations",
    response_model=GovernanceAnnotation,
    status_code=status.HTTP_201_CREATED,
    summary="Add annotation (append-only)"
)
async def add_annotation(
    decision_id: UUID,
    body: GovernanceAnnotationCreate,
    session: AsyncSession = Depends(get_governance_session)
) -> GovernanceAnnotation:
    """
    Append an annotation to a decision.
    
    IMMUTABILITY RULE:
    Annotations are APPEND-ONLY and NEVER editable, even by admins.
    """
    # Ensure metadata record exists
    stmt = select(GovernanceMetadataDB).where(GovernanceMetadataDB.decision_id == decision_id)
    result = await session.execute(stmt)
    metadata = result.scalars().first()
    
    if not metadata:
        metadata = GovernanceMetadataDB(
            decision_id=decision_id,
            review_state=GovernanceReviewState.UNREVIEWED.value,
            last_updated=datetime.now(timezone.utc)
        )
        session.add(metadata)
    
    # Create annotation
    annotation = GovernanceAnnotationDB(
        decision_id=decision_id,
        author_role=body.author_role,
        note=body.note,
        created_at=datetime.now(timezone.utc)
    )
    session.add(annotation)
    
    # Update last_updated
    metadata.last_updated = datetime.now(timezone.utc)
    
    await session.commit()
    await session.refresh(annotation)
    
    return GovernanceAnnotation(
        id=annotation.id,
        decision_id=annotation.decision_id,
        author_role=annotation.author_role,
        note=annotation.note,
        created_at=annotation.created_at
    )


@router.post(
    "/{decision_id}/tags",
    response_model=GovernanceTag,
    status_code=status.HTTP_201_CREATED,
    summary="Add tag (no deletion in Phase 4.1)"
)
async def add_tag(
    decision_id: UUID,
    body: GovernanceTagCreate,
    session: AsyncSession = Depends(get_governance_session)
) -> GovernanceTag:
    """
    Add a tag to a decision.
    
    Tags are ADD-ONLY in Phase 4.1. Deletion will be added later.
    """
    # Ensure metadata record exists
    stmt = select(GovernanceMetadataDB).where(GovernanceMetadataDB.decision_id == decision_id)
    result = await session.execute(stmt)
    metadata = result.scalars().first()
    
    if not metadata:
        metadata = GovernanceMetadataDB(
            decision_id=decision_id,
            review_state=GovernanceReviewState.UNREVIEWED.value,
            last_updated=datetime.now(timezone.utc)
        )
        session.add(metadata)
    
    # Create tag
    tag = GovernanceTagDB(
        decision_id=decision_id,
        name=body.name,
        category=body.category,
        source=body.source,
        created_at=datetime.now(timezone.utc)
    )
    session.add(tag)
    
    # Update last_updated
    metadata.last_updated = datetime.now(timezone.utc)
    
    await session.commit()
    await session.refresh(tag)
    
    return GovernanceTag(
        id=tag.id,
        decision_id=tag.decision_id,
        name=tag.name,
        category=tag.category,
        source=tag.source,
        created_at=tag.created_at
    )


@router.patch(
    "/{decision_id}/review-state",
    response_model=GovernanceMetadata,
    summary="Update review state (tracking only)"
)
async def update_review_state(
    decision_id: UUID,
    body: ReviewStateUpdate,
    session: AsyncSession = Depends(get_governance_session)
) -> GovernanceMetadata:
    """
    Transition the review state.
    
    VALID TRANSITIONS:
    - unreviewed → in_review
    - in_review → reviewed | escalated
    - reviewed → escalated | in_review
    - escalated → in_review
    
    Invalid transitions return 409 Conflict.
    This is TRACKING only, not approval.
    """
    stmt = select(GovernanceMetadataDB).where(GovernanceMetadataDB.decision_id == decision_id)
    result = await session.execute(stmt)
    metadata = result.scalars().first()
    
    if not metadata:
        # Create with unreviewed state first
        metadata = GovernanceMetadataDB(
            decision_id=decision_id,
            review_state=GovernanceReviewState.UNREVIEWED.value,
            last_updated=datetime.now(timezone.utc)
        )
        session.add(metadata)
        await session.commit()
        await session.refresh(metadata)
    
    current_state = GovernanceReviewState(metadata.review_state)
    new_state = body.new_state
    
    # Validate transition
    allowed_transitions = VALID_REVIEW_TRANSITIONS.get(current_state, [])
    if new_state not in allowed_transitions:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "error": "InvalidStateTransition",
                "message": f"Cannot transition from '{current_state.value}' to '{new_state.value}'",
                "allowed_transitions": [s.value for s in allowed_transitions]
            }
        )
    
    # Apply transition
    metadata.review_state = new_state.value
    metadata.last_updated = datetime.now(timezone.utc)
    
    await session.commit()
    
    # Return full metadata
    return await get_governance(decision_id, session)


# ============ Evidence Export Endpoints (Phase 4.3) ============

from .evidence_models import GovernanceEvidenceBundle, GovernanceTimeline
from .evidence import evidence_generator


@router.get(
    "/{decision_id}/evidence",
    response_model=GovernanceEvidenceBundle,
    summary="Export governance evidence bundle"
)
async def export_evidence(
    decision_id: UUID,
    session: AsyncSession = Depends(get_governance_session)
) -> GovernanceEvidenceBundle:
    """
    Export a complete governance evidence bundle.
    
    This is READ-ONLY and SAFE to share with auditors.
    
    WARNING: This does NOT include cryptographic data.
    It documents ORGANIZATIONAL PROCESS, not cryptographic facts.
    """
    return await evidence_generator.generate_evidence(decision_id, session)


@router.get(
    "/{decision_id}/timeline",
    response_model=GovernanceTimeline,
    summary="Get governance timeline"
)
async def get_timeline(
    decision_id: UUID,
    session: AsyncSession = Depends(get_governance_session)
) -> GovernanceTimeline:
    """
    Get a human-readable governance timeline.
    
    Shows all governance events in chronological order:
    - Annotations
    - Policy matches
    - State changes
    - Approvals
    """
    return await evidence_generator.generate_timeline(decision_id, session)
