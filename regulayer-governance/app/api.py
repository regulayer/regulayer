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
from sqlalchemy import select, desc
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
    GovernanceTagDB,
    GovernanceAnnotationDB,
    GovernanceReviewHistoryDB
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
from .config import settings

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

def verify_internal_auth(x_internal_auth: Optional[str] = Header(None, alias="X-Internal-Auth")):
    """
    Verify request comes from trusted internal source (Gateway/Recorder).
    """
    if not x_internal_auth or x_internal_auth != settings.governance_internal_secret:
        raise HTTPException(status_code=403, detail="Forbidden: Internal Auth Required")

def verify_org_not_frozen(x_org_status: Optional[str] = Header(None, alias="X-Org-Status")):
    """
    Block writes if Organization is Frozen.
    """
    if x_org_status and x_org_status.lower() == "frozen":
        raise HTTPException(
            status_code=403, 
            detail="Forbidden: Organization is Frozen. Governance actions are disabled."
        )

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


async def get_current_review_state(session: AsyncSession, decision_id: UUID) -> GovernanceReviewState:
    """
    Compute current review state from history.
    """
    stmt = (
        select(GovernanceReviewHistoryDB)
        .where(GovernanceReviewHistoryDB.decision_id == decision_id)
        .order_by(desc(GovernanceReviewHistoryDB.timestamp))
        .limit(1)
    )
    result = await session.execute(stmt)
    history = result.scalars().first()
    
    if history:
        return GovernanceReviewState(history.review_state)
    return GovernanceReviewState.UNREVIEWED


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
    
    NOTE: With event sourcing, efficient querying for 'latest state' is complex.
    For this phase, we might need a simplified approach or a specific view.
    
    For now, we just list latest history items that match status.
    This is an approximation: it might show old states if we don't dedupe.
    
    Correct approach: DISTINCT ON (decision_id) ... in Postgres.
    """
    # Using Postgres DISTINCT ON to get latest per decision_id
    from sqlalchemy import text
    
    # This is rough raw SQL because DISTINCT ON is dialect specific and simpler here
    # We want latest history entry for each decision
    # Then filter by status
    
    # Allow filtering
    filter_status = GovernanceReviewState.UNREVIEWED.value
    if status:
        try:
            filter_status = GovernanceReviewState(status).value
        except ValueError:
            filter_status = status

    # Complex query to get decisions where LATEST state is X
    # SELECT DISTINCT ON (decision_id) * FROM governance_review_history ORDER BY decision_id, timestamp DESC
    stmt = (
        select(GovernanceReviewHistoryDB)
        .distinct(GovernanceReviewHistoryDB.decision_id)
        .order_by(GovernanceReviewHistoryDB.decision_id, desc(GovernanceReviewHistoryDB.timestamp))
    )
    
    # We fetch all distinct latest (inefficient for huge DB, fine for now)
    # Then filter in memory or wrap in subquery. 
    # Subquery is better.
    
    subq = (
        select(GovernanceReviewHistoryDB)
        .distinct(GovernanceReviewHistoryDB.decision_id)
        .order_by(GovernanceReviewHistoryDB.decision_id, desc(GovernanceReviewHistoryDB.timestamp))
    ).subquery()
    
    stmt = select(subq).where(subq.c.review_state == filter_status).limit(limit).offset(offset)
    
    result = await session.execute(stmt)
    histories = result.all() # These are Row objects from subquery
    
    full_results = []
    for h in histories:
        # h is a Row, need attribute access via column names
        d_id = h.decision_id
        
        # Get details
        # Tags
        stmt_tags = select(GovernanceTagDB).where(GovernanceTagDB.decision_id == d_id)
        res_tags = await session.execute(stmt_tags)
        tags = res_tags.scalars().all()
        
        # Annotations
        stmt_notes = select(GovernanceAnnotationDB).where(
            GovernanceAnnotationDB.decision_id == d_id
        ).order_by(desc(GovernanceAnnotationDB.created_at))
        res_notes = await session.execute(stmt_notes)
        notes = res_notes.scalars().all()
        
        full_results.append(GovernanceMetadata(
            decision_id=d_id,
            review_state=GovernanceReviewState(h.review_state),
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
            last_updated=h.timestamp
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
    """
    # 1. Compute Review State (Deterministic)
    current_state = await get_current_review_state(session, decision_id)
    
    # 2. Get tags
    stmt = select(GovernanceTagDB).where(GovernanceTagDB.decision_id == decision_id)
    result = await session.execute(stmt)
    tags_db = result.scalars().all()
    
    # 3. Get annotations
    stmt = select(GovernanceAnnotationDB).where(
        GovernanceAnnotationDB.decision_id == decision_id
    ).order_by(desc(GovernanceAnnotationDB.created_at))
    result = await session.execute(stmt)
    annotations_db = result.scalars().all()
    
    # 4. Get last updated timestamp from latest history or annotation
    last_updated = datetime.now(timezone.utc) # Default?
    # Ideally max(latest_history, latest_annotation, latest_tag)
    # Simplify: just use now or latest_history timestamp if available
    
    stmt = (
        select(GovernanceReviewHistoryDB.timestamp)
        .where(GovernanceReviewHistoryDB.decision_id == decision_id)
        .order_by(desc(GovernanceReviewHistoryDB.timestamp))
        .limit(1)
    )
    res_ts = await session.execute(stmt)
    ts = res_ts.scalar_one_or_none()
    if ts:
        last_updated = ts

    return GovernanceMetadata(
        decision_id=decision_id,
        review_state=current_state,
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
        last_updated=last_updated
    )


@router.post(
    "/{decision_id}/annotations",
    response_model=GovernanceAnnotation,
    status_code=status.HTTP_201_CREATED,
    summary="Add annotation (append-only)",
    dependencies=[Depends(verify_internal_auth), Depends(verify_org_not_frozen)]
)
async def add_annotation(
    decision_id: UUID,
    body: GovernanceAnnotationCreate,
    session: AsyncSession = Depends(get_governance_session)
) -> GovernanceAnnotation:
    """
    Append an annotation to a decision.
    """
    # Create annotation
    annotation = GovernanceAnnotationDB(
        decision_id=decision_id,
        author_role=body.author_role,
        note=body.note,
        created_at=datetime.now(timezone.utc)
    )
    session.add(annotation)
    
    # Audit Log
    # Need actor_id from somewhere? For now generate random or from header if we had it
    # We will assume a system/user ID is passed or use a placeholder for this phase
    import uuid
    dummy_actor_id = uuid.uuid4() 

    await log_governance_action(
        session,
        decision_id=decision_id,
        action=GovernanceAction.ANNOTATION_ADDED,
        actor_id=dummy_actor_id, # TODO: Phase 2 Auth
        actor_role=body.author_role,
        details={"note_preview": body.note[:50]}
    )
    
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
    summary="Add tag (no deletion in Phase 4.1)",
    dependencies=[Depends(verify_internal_auth), Depends(verify_org_not_frozen)]
)
async def add_tag(
    decision_id: UUID,
    body: GovernanceTagCreate,
    session: AsyncSession = Depends(get_governance_session)
) -> GovernanceTag:
    """
    Add a tag to a decision.
    """
    # Create tag
    tag = GovernanceTagDB(
        decision_id=decision_id,
        name=body.name,
        category=body.category,
        source=body.source,
        created_at=datetime.now(timezone.utc)
    )
    session.add(tag)
    
    import uuid
    dummy_actor_id = uuid.uuid4()

    await log_governance_action(
        session,
        decision_id=decision_id,
        action=GovernanceAction.TAG_ADDED,
        actor_id=dummy_actor_id,
        actor_role="system", # Tags often auto / analyst
        details={"tag": body.name, "category": body.category}
    )
    
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


@router.post(
    "/{decision_id}/reviews", # Changed from PATCH review-state to POST reviews (append)
    response_model=GovernanceMetadata,
    summary="Submit review decision (append-only)",
    dependencies=[Depends(verify_internal_auth), Depends(verify_org_not_frozen)]
)
async def update_review_state(
    decision_id: UUID,
    body: ReviewStateUpdate,
    x_actor_role: str = Header(..., alias="X-Actor-Role"), # Required for review
    session: AsyncSession = Depends(get_governance_session)
) -> GovernanceMetadata:
    """
    Submit a review decision.
    
    Appends to history. Latest wins.
    """
    # Role Enforcement
    role = GovernanceRole(x_actor_role.lower())
    if role not in [GovernanceRole.ADMIN, GovernanceRole.OWNER, GovernanceRole.COMPLIANCE]:
         # Strict check: Members/Analysts/Auditors cannot review
         # Only Admin, Owner, Compliance
         raise HTTPException(status_code=403, detail="Forbidden: Insufficient permissions to review.")

    current_state = await get_current_review_state(session, decision_id)
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
    
    # Append History
    import uuid
    dummy_actor_id = uuid.uuid4()
    
    history_entry = GovernanceReviewHistoryDB(
        decision_id=decision_id,
        review_state=new_state.value,
        actor_role=role.value,
        actor_id=dummy_actor_id,
        timestamp=datetime.now(timezone.utc)
    )
    session.add(history_entry)
    
    await log_governance_action(
        session,
        decision_id=decision_id,
        action=GovernanceAction.REVIEW_COMPLETED, # Or specific state
        actor_id=dummy_actor_id,
        actor_role=role.value,
        details={"old_state": current_state.value, "new_state": new_state.value}
    )
    
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
    """
    return await evidence_generator.generate_timeline(decision_id, session)
