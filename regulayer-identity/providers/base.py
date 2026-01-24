"""
Regulayer Identity - Base Provider

Abstract base class for identity providers.
"""

from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from dataclasses import dataclass


@dataclass
class AuthenticationResult:
    """Result of SSO authentication attempt."""
    success: bool
    external_user_id: Optional[str] = None
    email: Optional[str] = None
    display_name: Optional[str] = None
    groups: list = None
    error: Optional[str] = None
    raw_assertion: Optional[Dict[str, Any]] = None
    
    def __post_init__(self):
        if self.groups is None:
            self.groups = []


class IdentityProviderBase(ABC):
    """
    Abstract base class for identity providers.
    
    TRUST RULE: SSO authentication is ONLY for access control.
    - No crypto keys are generated
    - No tokens are shared with Recorder
    - Proof export remains independent
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.issuer = config.get("issuer")
        self.enabled = config.get("enabled", False)
    
    @abstractmethod
    async def get_login_url(self, redirect_uri: str, state: str) -> str:
        """
        Generate URL to redirect user to IdP for authentication.
        
        Args:
            redirect_uri: Where to redirect after authentication
            state: CSRF protection state parameter
            
        Returns:
            URL to redirect user to
        """
        pass
    
    @abstractmethod
    async def validate_assertion(self, assertion: str) -> AuthenticationResult:
        """
        Validate authentication assertion from IdP.
        
        Args:
            assertion: SAML assertion or OIDC token
            
        Returns:
            AuthenticationResult with user info or error
        """
        pass
    
    @abstractmethod
    async def test_connection(self) -> bool:
        """
        Test connectivity to the identity provider.
        
        Returns:
            True if connection successful
        """
        pass
    
    def get_metadata(self) -> Dict[str, Any]:
        """Get provider metadata for configuration."""
        return {
            "issuer": self.issuer,
            "enabled": self.enabled,
        }
