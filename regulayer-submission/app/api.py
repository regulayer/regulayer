"""
Regulayer Submission - API Endpoints

READ-ONLY export endpoint for submission packages.
"""

from fastapi import APIRouter, Response
from fastapi.responses import StreamingResponse
from typing import List, Optional
from uuid import UUID
import io

from .assembler import package_assembler
from .models import SubmissionPackage, SubmissionPackageRequest

router = APIRouter(prefix="/v1/submissions", tags=["submissions"])


@router.post(
    "/build",
    response_model=SubmissionPackage,
    summary="Build a submission package"
)
async def build_submission(
    request: SubmissionPackageRequest
) -> StreamingResponse:
    """
    Build a complete submission package.
    
    Returns a ZIP archive containing:
    - manifest.json (integrity anchor)
    - cover_letter.md (regulator-facing)
    - reports/ (trust reports)
    - proof_bundles/ (cryptographic evidence)
    - governance_evidence/ (if requested)
    
    The package is deterministic: same inputs produce same output.
    """
    zip_bytes, package = package_assembler.assemble_package(
        decision_ids=request.decision_ids,
        chain_id=request.chain_id,
        include_governance=request.include_governance,
        include_legacy=request.include_legacy
    )
    
    filename = f"submission-{package.submission_id}.zip"
    
    return StreamingResponse(
        io.BytesIO(zip_bytes),
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "X-Submission-ID": str(package.submission_id),
            "X-File-Count": str(package.total_files),
            "X-Disclaimer-Hash": package.disclaimer_hash
        }
    )


@router.get(
    "/build",
    summary="Quick build with query parameters"
)
async def build_submission_get(
    decision_ids: str,
    chain_id: Optional[str] = None,
    include_governance: bool = True,
    include_legacy: bool = True
) -> StreamingResponse:
    """
    Build a submission package using query parameters.
    
    decision_ids should be comma-separated UUIDs.
    """
    ids = [UUID(id.strip()) for id in decision_ids.split(',')]
    
    zip_bytes, package = package_assembler.assemble_package(
        decision_ids=ids,
        chain_id=chain_id,
        include_governance=include_governance,
        include_legacy=include_legacy
    )
    
    filename = f"submission-{package.submission_id}.zip"
    
    return StreamingResponse(
        io.BytesIO(zip_bytes),
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "X-Submission-ID": str(package.submission_id),
            "X-File-Count": str(package.total_files)
        }
    )
