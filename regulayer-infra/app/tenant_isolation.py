"""
Regulayer Infrastructure - Tenant Isolation

Ensures strict isolation between tenants.

GUARANTEES:
- One tenant cannot access another's data
- Row-level security enforcement
- Audit trail of cross-tenant access attempts
"""

from uuid import UUID
from typing import Optional, List
from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy import event
from sqlalchemy.orm import Session


@dataclass
class TenantIsolationViolation:
    """Record of an isolation violation attempt."""
    timestamp: datetime
    actor_org_id: Optional[UUID]
    target_org_id: UUID
    resource_type: str
    resource_id: UUID
    action: str


class TenantIsolationError(Exception):
    """Raised when tenant isolation is violated."""
    def __init__(self, message: str, violation: TenantIsolationViolation):
        self.violation = violation
        super().__init__(message)


class TenantIsolationEnforcer:
    """
    Enforces tenant isolation at the application layer.
    
    Provides defense-in-depth alongside database-level RLS.
    """
    
    def __init__(self):
        self._violations: List[TenantIsolationViolation] = []
    
    def check_access(
        self,
        actor_org_id: Optional[UUID],
        target_org_id: UUID,
        resource_type: str,
        resource_id: UUID,
        action: str
    ) -> None:
        """
        Check if access is allowed.
        
        Raises TenantIsolationError if access is denied.
        """
        # No actor = system-level access (allowed)
        if actor_org_id is None:
            return
        
        # Same org = always allowed
        if actor_org_id == target_org_id:
            return
        
        # Different org = NEVER allowed
        violation = TenantIsolationViolation(
            timestamp=datetime.now(timezone.utc),
            actor_org_id=actor_org_id,
            target_org_id=target_org_id,
            resource_type=resource_type,
            resource_id=resource_id,
            action=action
        )
        
        self._record_violation(violation)
        
        raise TenantIsolationError(
            f"Access denied: org {actor_org_id} cannot access {resource_type} "
            f"belonging to org {target_org_id}",
            violation
        )
    
    def _record_violation(self, violation: TenantIsolationViolation) -> None:
        """Record a violation for audit."""
        self._violations.append(violation)
        # In production: also log to security audit log
    
    def get_violations(self) -> List[TenantIsolationViolation]:
        """Get recorded violations (for security audit)."""
        return list(self._violations)


# ============================================================
# Query Filters
# ============================================================

def apply_tenant_filter(query, org_id: UUID, org_id_column):
    """
    Apply tenant filter to a query.
    
    ALWAYS use this when querying tenant-scoped data.
    """
    return query.filter(org_id_column == org_id)


def apply_project_filter(query, project_id: UUID, project_id_column):
    """
    Apply project filter to a query.
    
    Projects are already scoped to orgs, but this provides extra safety.
    """
    return query.filter(project_id_column == project_id)


# ============================================================
# Row-Level Security Setup (PostgreSQL)
# ============================================================

RLS_SETUP_SQL = """
-- Enable RLS on tenant-scoped tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own org
CREATE POLICY org_isolation ON organizations
    USING (id = current_setting('app.current_org_id')::uuid);

-- Policy: Users can only see projects in their org
CREATE POLICY project_isolation ON projects
    USING (organization_id = current_setting('app.current_org_id')::uuid);

-- Policy: Users can only see API keys in their org's projects
CREATE POLICY key_isolation ON api_keys
    USING (project_id IN (
        SELECT id FROM projects 
        WHERE organization_id = current_setting('app.current_org_id')::uuid
    ));

-- Policy: Users can only see users in their org
CREATE POLICY user_isolation ON users
    USING (organization_id = current_setting('app.current_org_id')::uuid);
"""


def set_tenant_context_for_session(session: Session, org_id: UUID) -> None:
    """
    Set tenant context for a database session (PostgreSQL RLS).
    
    Call this at the start of each request.
    """
    session.execute(
        f"SET app.current_org_id = '{org_id}';"
    )


# ============================================================
# Global Instance
# ============================================================

_enforcer: Optional[TenantIsolationEnforcer] = None


def get_isolation_enforcer() -> TenantIsolationEnforcer:
    """Get or create the global isolation enforcer."""
    global _enforcer
    
    if _enforcer is None:
        _enforcer = TenantIsolationEnforcer()
    
    return _enforcer


def check_tenant_access(
    actor_org_id: Optional[UUID],
    target_org_id: UUID,
    resource_type: str,
    resource_id: UUID,
    action: str = "access"
) -> None:
    """
    Check tenant access (convenience function).
    
    Raises TenantIsolationError if access is denied.
    """
    get_isolation_enforcer().check_access(
        actor_org_id=actor_org_id,
        target_org_id=target_org_id,
        resource_type=resource_type,
        resource_id=resource_id,
        action=action
    )
