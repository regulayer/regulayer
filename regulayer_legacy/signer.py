"""
Regulayer SDK Event Signing

Cryptographic signing interface with HMAC-SHA256 Phase 1 implementation.

WARNING:
    HMAC-SHA256 is a Phase 1 placeholder ONLY.
    All signing logic is abstracted behind a Signer protocol to allow
    asymmetric signing (Ed25519/RSA) in Phase 2+ without breaking SDK contracts.
    HMAC does not provide non-repudiation required for regulatory compliance.
"""

import hmac
import hashlib
from typing import Protocol
from abc import abstractmethod


class Signer(Protocol):
    """
    Signer protocol for event signing.
    
    This interface enables swapping signing algorithms
    without breaking SDK contracts.
    
    Future implementations may include:
    - Ed25519 (fast, small signatures)
    - RSA (widely supported)
    - ECDSA (standard)
    """
    
    @abstractmethod
    def sign(self, payload: str) -> str:
        """
        Sign a payload.
        
        Args:
            payload: JSON string to sign
        
        Returns:
            Signature as hex string
        """
        pass
    
    @abstractmethod
    def get_algorithm(self) -> str:
        """
        Get the signing algorithm identifier.
        
        Returns:
            Algorithm name (e.g., "HMAC-SHA256", "Ed25519", "RSA-SHA256")
        """
        pass


class HMACSigner:
    """
    Phase 1 HMAC-SHA256 signer.
    
    WARNING:
        This is a temporary placeholder.
        HMAC provides integrity but NOT non-repudiation.
        
    Note:
        This implementation will be replaced with asymmetric signing
        in future phases. The Signer protocol ensures this swap
        won't break existing SDK usage.
    """
    
    def __init__(self, secret_key: str):
        """
        Initialize HMAC signer.
        
        Args:
            secret_key: Secret key for HMAC
        """
        if not secret_key:
            raise ValueError("Secret key is required for HMAC signing")
        
        self.secret_key = secret_key.encode('utf-8')
    
    def sign(self, payload: str) -> str:
        """
        Sign payload using HMAC-SHA256.
        
        Args:
            payload: JSON string to sign
        
        Returns:
            HMAC-SHA256 signature as hex string
        """
        h = hmac.new(
            self.secret_key,
            payload.encode('utf-8'),
            hashlib.sha256
        )
        return h.hexdigest()
    
    def get_algorithm(self) -> str:
        """Get signing algorithm identifier."""
        return "HMAC-SHA256"


def create_signer(secret_key: str) -> Signer:
    """
    Create a signer instance.
    
    Phase 1: Returns HMACSigner
    Future: May return Ed25519Signer, RSASigner, etc. based on configuration
    
    Args:
        secret_key: Secret key for signing
    
    Returns:
        Signer instance
    
    Note:
        This factory function is the swap point for future algorithms.
        All SDK code should use this function, not HMACSigner directly.
    """
    return HMACSigner(secret_key)
