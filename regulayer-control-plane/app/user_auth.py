"""
Regulayer Control Plane - Human Authentication

User login, sessions, and password management.
RBAC enforcement for human users.
"""

import hashlib
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy.orm import Session as DBSession

from .models import User, TenantContext
from .enums import UserRole
from .storage import UserDB, SessionDB, OrganizationDB


# ============================================================
# Password Utilities
# ============================================================

def hash_password(password: str) -> str:
    """Hash a password using SHA-256 with salt."""
    salt = secrets.token_hex(16)
    hash_input = f"{salt}:{password}"
    password_hash = hashlib.sha256(hash_input.encode()).hexdigest()
    return f"{salt}:{password_hash}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify a password against stored hash."""
    try:
        salt, expected_hash = stored_hash.split(":", 1)
        hash_input = f"{salt}:{password}"
        actual_hash = hashlib.sha256(hash_input.encode()).hexdigest()
        return actual_hash == expected_hash
    except ValueError:
        return False


# ============================================================
# Session Management
# ============================================================

SESSION_DURATION_HOURS = 24


class SessionService:
    """Manages user sessions."""
    
    def __init__(self, db: DBSession):
        self.db = db
    
    def create_session(self, user_id: UUID) -> str:
        """Create a new session and return the token."""
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        session = SessionDB(
            id=uuid4(),
            user_id=user_id,
            token_hash=token_hash,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=SESSION_DURATION_HOURS)
        )
        
        self.db.add(session)
        self.db.commit()
        
        return token
    
    def validate_session(self, token: str) -> Optional[UUID]:
        """Validate session token and return user_id if valid."""
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        session = self.db.query(SessionDB).filter(
            SessionDB.token_hash == token_hash,
            SessionDB.expires_at > datetime.now(timezone.utc)
        ).first()
        
        if not session:
            return None
        
        return session.user_id
    
    def invalidate_session(self, token: str) -> bool:
        """Invalidate a session (logout)."""
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        result = self.db.query(SessionDB).filter(
            SessionDB.token_hash == token_hash
        ).delete()
        
        self.db.commit()
        return result > 0
    
    def invalidate_user_sessions(self, user_id: UUID) -> int:
        """Invalidate all sessions for a user."""
        result = self.db.query(SessionDB).filter(
            SessionDB.user_id == user_id
        ).delete()
        
        self.db.commit()
        return result


# ============================================================
# User Authentication
# ============================================================

class UserAuthService:
    """Handles user authentication."""
    
    def __init__(self, db: DBSession):
        self.db = db
        self.session_service = SessionService(db)
    
    def register_user(
        self,
        email: str,
        password: str,
        organization_id: UUID,
        role: UserRole = UserRole.MEMBER
    ) -> User:
        """Register a new user."""
        # Check if email exists
        existing = self.db.query(UserDB).filter(UserDB.email == email).first()
        if existing:
            raise ValueError("Email already registered")
        
        # Verify org exists
        org = self.db.query(OrganizationDB).filter(
            OrganizationDB.id == organization_id
        ).first()
        if not org:
            raise ValueError("Organization not found")
        
        # Create user
        user = UserDB(
            id=uuid4(),
            email=email,
            password_hash=hash_password(password),
            organization_id=organization_id,
            role=role
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return User(
            id=user.id,
            email=user.email,
            role=user.role,
            organization_id=user.organization_id,
            created_at=user.created_at
        )
    
    def login(self, email: str, password: str) -> Optional[tuple[str, User]]:
        """
        Authenticate user and return session token + user.
        
        Returns None if authentication fails.
        """
        user = self.db.query(UserDB).filter(UserDB.email == email).first()
        
        if not user or not user.password_hash:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        # Update last login
        user.last_login_at = datetime.now(timezone.utc)
        self.db.commit()
        
        # Create session
        token = self.session_service.create_session(user.id)
        
        return token, User(
            id=user.id,
            email=user.email,
            role=user.role,
            organization_id=user.organization_id,
            created_at=user.created_at,
            last_login_at=user.last_login_at
        )
    
    def logout(self, token: str) -> bool:
        """Logout user by invalidating session."""
        return self.session_service.invalidate_session(token)
    
    def get_user_from_token(self, token: str) -> Optional[User]:
        """Get user from session token."""
        user_id = self.session_service.validate_session(token)
        if not user_id:
            return None
        
        user = self.db.query(UserDB).filter(UserDB.id == user_id).first()
        if not user:
            return None
        
        return User(
            id=user.id,
            email=user.email,
            role=user.role,
            organization_id=user.organization_id,
            created_at=user.created_at,
            last_login_at=user.last_login_at
        )
    
    def change_role(self, user_id: UUID, new_role: UserRole) -> bool:
        """Change a user's role."""
        user = self.db.query(UserDB).filter(UserDB.id == user_id).first()
        if not user:
            return False
        
        user.role = new_role
        self.db.commit()
        return True
