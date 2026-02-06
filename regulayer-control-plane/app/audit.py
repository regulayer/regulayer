
"""
Audit Log Service
"""
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import desc

from .storage import AuditLogDB
from .models import AuditLog

class AuditService:
    def __init__(self, db: Session):
        self.db = db

    def log(
        self,
        organization_id: UUID,
        action: str,
        resource_type: str,
        actor_id: Optional[UUID] = None,
        actor_email: Optional[str] = None,
        resource_id: Optional[UUID] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> AuditLog:
        """Record an audit log entry."""
        log_entry = AuditLogDB(
            organization_id=organization_id,
            actor_id=actor_id,
            actor_email=actor_email,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent,
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(log_entry)
        self.db.commit()
        self.db.refresh(log_entry)
        
        return AuditLog(
            id=log_entry.id,
            organization_id=log_entry.organization_id,
            actor_id=log_entry.actor_id,
            actor_email=log_entry.actor_email,
            action=log_entry.action,
            resource_type=log_entry.resource_type,
            resource_id=log_entry.resource_id,
            details=log_entry.details,
            ip_address=log_entry.ip_address,
            user_agent=log_entry.user_agent,
            created_at=log_entry.created_at
        )

    def get_logs(
        self, 
        organization_id: UUID, 
        limit: int = 50, 
        offset: int = 0
    ) -> List[AuditLog]:
        """Get audit logs for an organization."""
        logs = (
            self.db.query(AuditLogDB)
            .filter(AuditLogDB.organization_id == organization_id)
            .order_by(desc(AuditLogDB.created_at))
            .limit(limit)
            .offset(offset)
            .all()
        )
        
        return [
            AuditLog(
                id=log.id,
                organization_id=log.organization_id,
                actor_id=log.actor_id,
                actor_email=log.actor_email,
                action=log.action,
                resource_type=log.resource_type,
                resource_id=log.resource_id,
                details=log.details,
                ip_address=log.ip_address,
                user_agent=log.user_agent,
                created_at=log.created_at
            )
            for log in logs
        ]
