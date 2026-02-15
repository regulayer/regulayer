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
from .enums import UserRole, OrgStatus, ProjectEnvironment
from .storage import UserDB, SessionDB, OrganizationDB, PasswordResetTokenDB, OtpCodeDB, ProjectDB


# ============================================================
# OTP Service (Signup)
# ============================================================



class OtpService:
    """Manages OTP-based signup flow."""
    
    def __init__(self, db: DBSession):
        self.db = db
        self.user_auth = UserAuthService(db)

    def request_otp(self, email: str) -> str:
        """
        Generate and store an OTP for the given email.
        Returns the cleartext code (to be sent via email).
        """
        # 1. Check if user already exists
        existing_user = self.db.query(UserDB).filter(UserDB.email == email).first()
        if existing_user:
            raise ValueError("User with this email already exists")

        # 2. Generate Code (6 digits)
        code = "".join([str(secrets.randbelow(10)) for _ in range(6)])
        code_hash = hashlib.sha256(code.encode()).hexdigest()
        
        # 3. Store in DB
        otp_record = OtpCodeDB(
            id=uuid4(),
            email=email,
            code_hash=code_hash,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
            verified=False
        )
        self.db.add(otp_record)
        self.db.commit()
        
        return code

    def verify_otp(self, email: str, code: str) -> Optional[str]:
        """
        Verify the OTP code.
        If valid, marks as verified and returns a 'signup_token' (the record ID).
        """
        code_hash = hashlib.sha256(code.encode()).hexdigest()
        
        # Find valid, unexpired, matching code
        otp_record = self.db.query(OtpCodeDB).filter(
            OtpCodeDB.email == email,
            OtpCodeDB.code_hash == code_hash,
            OtpCodeDB.expires_at > datetime.now(timezone.utc),
            OtpCodeDB.verified == False
        ).order_by(OtpCodeDB.created_at.desc()).first()
        
        if not otp_record:
            return None
            
        # Mark verified
        otp_record.verified = True
        self.db.commit()
        
        return str(otp_record.id)

    def complete_signup(self, signup_token: str, org_name: str, password: str) -> tuple[str, User]:
        """
        Complete signup using a verified signup_token.
        Creates Organization, User, and logs them in.
        Returns (session_token, User).
        """
        # 1. Validate Token
        try:
            token_uuid = UUID(signup_token)
        except ValueError:
            raise ValueError("Invalid signup token format")

        otp_record = self.db.query(OtpCodeDB).filter(
            OtpCodeDB.id == token_uuid,
            OtpCodeDB.verified == True
        ).first()
        
        if not otp_record:
            raise ValueError("Invalid or expired signup token")
            
        # 2. Create Org & User (Reusing logic from UserAuthService would be cleaner, but avoiding circular dep)
        # Check email again just in case
        existing = self.db.query(UserDB).filter(UserDB.email == otp_record.email).first()
        if existing:
            raise ValueError("User already registered")

        # Org
        org = OrganizationDB(
            id=uuid4(),
            name=org_name,
            status=OrgStatus.ACTIVE,
            is_demo=False,
            environment="prod"
        )
        self.db.add(org)
        
        # User
        user = UserDB(
            id=uuid4(),
            organization_id=org.id,
            email=otp_record.email,
            password_hash=hash_password(password),
            role=UserRole.OWNER
        )
        self.db.add(user)
        
        # Default Project
        project = ProjectDB(
            id=uuid4(),
            organization_id=org.id,
            name="Default Project",
            environment=ProjectEnvironment.DEV
        )
        self.db.add(project)

        # Cleanup OTP
        self.db.delete(otp_record)
        
        self.db.commit()
        
        # 3. Login
        return self.user_auth.login(user.email, password)



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
    


    def create_reset_token(self, email: str) -> Optional[str]:
        """
        Generate a password reset token for the given email.
        Returns the token string if user exists, else None.
        """
        user = self.db.query(UserDB).filter(UserDB.email == email).first()
        if not user:
            return None
            
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        reset_token = PasswordResetTokenDB(
            id=uuid4(),
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        
        self.db.add(reset_token)
        self.db.commit()
        
        return token

    def reset_password(self, token: str, new_password: str) -> bool:
        """
        Reset password using a valid token.
        Returns True if successful, False if token invalid/expired.
        """
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        reset_token = self.db.query(PasswordResetTokenDB).filter(
            PasswordResetTokenDB.token_hash == token_hash,
            PasswordResetTokenDB.used == False,
            PasswordResetTokenDB.expires_at > datetime.now(timezone.utc)
        ).first()
        
        if not reset_token:
            return False
            
        user = self.db.query(UserDB).filter(UserDB.id == reset_token.user_id).first()
        if not user:
            return False
            
        # Update User Password
        user.password_hash = hash_password(new_password)
        
        # Mark token used
        reset_token.used = True
        
        # Invalidate all existing sessions (Security best practice)
        self.session_service.invalidate_user_sessions(user.id)
        
        self.db.commit()
        return True
