"""
Regulayer Control Plane - Authentication

API key validation and management.
"""

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session
from .enums import ApiKeyScope

from .models import (
    ApiKey, ApiKeyCreate, ApiKeyWithSecret,
    KeyValidationResult, TenantContext
)
from .storage import (
    ApiKeyDB, ProjectDB, OrganizationDB,
    generate_api_key, hash_api_key
)


class AuthService:
    """
    API key authentication service.
    
    Handles key creation, validation, and revocation.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_api_key(
        self,
        project_id: UUID,
        request: ApiKeyCreate
    ) -> ApiKeyWithSecret:
        """
        Create a new API key for a project.
        
        Returns the key with secret - this is the only time the secret is available!
        """
        # Verify project exists
        project = self.db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        if not project:
            raise ValueError(f"Project {project_id} not found")
        
        # Check if org is demo
        org = self.db.query(OrganizationDB).filter(
            OrganizationDB.id == project.organization_id
        ).first()
        is_demo = org.is_demo if org else False
        
        # Generate key with appropriate prefix
        full_key, key_prefix, key_hash = generate_api_key(is_demo=is_demo)
        
        # Store in database
        db_key = ApiKeyDB(
            project_id=project_id,
            name=request.name,
            key_prefix=key_prefix,
            key_hash=key_hash,
            scopes=[s.value for s in request.scopes],
            is_demo_key=is_demo
        )
        
        self.db.add(db_key)
        self.db.commit()
        self.db.refresh(db_key)
        
        return ApiKeyWithSecret(
            id=db_key.id,
            project_id=db_key.project_id,
            name=db_key.name,
            key_prefix=db_key.key_prefix,
            scopes=[ApiKeyScope(s) for s in db_key.scopes],
            is_demo_key=db_key.is_demo_key,
            created_at=db_key.created_at,
            key_secret=full_key
        )
    
    def validate_api_key(self, api_key: str) -> KeyValidationResult:
        """
        Validate an API key and return tenant context.
        
        This is called by other services to validate SDK requests.
        """
        if not api_key or not api_key.startswith("rl_"):
            return KeyValidationResult(valid=False, error="Invalid key format")
        
        # Hash the provided key
        key_hash = hash_api_key(api_key)
        
        # Look up by hash
        db_key = self.db.query(ApiKeyDB).filter(
            ApiKeyDB.key_hash == key_hash
        ).first()
        
        if not db_key:
            return KeyValidationResult(valid=False, error="Key not found")
        
        # Check if revoked
        if db_key.revoked_at is not None:
            return KeyValidationResult(valid=False, error="Key has been revoked")
        
        # Get project and org
        project = self.db.query(ProjectDB).filter(
            ProjectDB.id == db_key.project_id
        ).first()
        
        if not project:
            return KeyValidationResult(valid=False, error="Project not found")
        
        org = self.db.query(OrganizationDB).filter(
            OrganizationDB.id == project.organization_id
        ).first()
        
        if not org:
            return KeyValidationResult(valid=False, error="Organization not found")

        # We DO NOT block suspended/frozen orgs here.
        # Rationale: They must still be able to export evidence and view decisions.
        # Gateway enforces "Active Only" for ingestion.
        
        # Update last used
        db_key.last_used_at = datetime.now(timezone.utc)
        self.db.commit()
        
        return KeyValidationResult(
            valid=True,
            organization_id=org.id,
            project_id=project.id,
            environment=project.environment.value,
            org_status=org.status,  # Pass status to Gateway
            is_demo_key=db_key.is_demo_key,
            scopes=[ApiKeyScope(s) for s in db_key.scopes]
        )
    
    def revoke_api_key(self, key_id: UUID) -> bool:
        """Revoke an API key."""
        db_key = self.db.query(ApiKeyDB).filter(ApiKeyDB.id == key_id).first()
        
        if not db_key:
            return False
        
        if db_key.revoked_at is not None:
            return True  # Already revoked
        
        db_key.revoked_at = datetime.now(timezone.utc)
        self.db.commit()
        
        return True
    
    def get_project_keys(self, project_id: UUID) -> list[ApiKey]:
        """Get all API keys for a project."""
        db_keys = self.db.query(ApiKeyDB).filter(
            ApiKeyDB.project_id == project_id
        ).all()
        
        return [
            ApiKey(
                id=k.id,
                project_id=k.project_id,
                name=k.name,
                key_prefix=k.key_prefix,
                scopes=[ApiKeyScope(s) for s in k.scopes],
                is_demo_key=k.is_demo_key,
                created_at=k.created_at,
                revoked_at=k.revoked_at,
                last_used_at=k.last_used_at
            )
            for k in db_keys
        ]
    
    def build_tenant_context(
        self,
        validation: KeyValidationResult,
        key_id: Optional[UUID] = None
    ) -> Optional[TenantContext]:
        """Build tenant context from validation result."""
        if not validation.valid:
            return None
        
        return TenantContext(
            organization_id=validation.organization_id,
            project_id=validation.project_id,
            api_key_id=key_id,
            scopes=validation.scopes
        )
