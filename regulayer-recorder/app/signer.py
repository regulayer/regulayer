"""
Regulayer Decision Recorder - Signature Verification

Abstracted signature verification interface with HMAC Phase 1 implementation.

WARNING: HMAC-SHA256 is Phase 1 placeholder ONLY.
Interface allows asymmetric verification (Ed25519/RSA) in future phases.
"""

import hmac
import hashlib
from typing import Protocol
from abc import abstractmethod


class SignatureVerifier(Protocol):
    """
    Signature verifier protocol.
    
    This interface enables swapping verification algorithms
    without breaking the service.
    
    Future implementations may include:
    - Ed25519Verifier
    - RSAVerifier
    - ECDSAVerifier
    """
    
    @abstractmethod
    def verify(self, payload: str, signature: str) -> bool:
        """
        Verify a signature against a payload.
        
        Args:
            payload: Canonical JSON string
            signature: Signature to verify (hex string)
        
        Returns:
            True if signature is valid, False otherwise
        """
        pass
    
    @abstractmethod
    def get_algorithm(self) -> str:
        """
        Get the verification algorithm identifier.
        
        Returns:
            Algorithm name (e.g., "HMAC-SHA256", "Ed25519")
        """
        pass


class HMACVerifier:
    """
    Phase 1 HMAC-SHA256 verifier.
    
    WARNING: HMAC provides integrity but NOT non-repudiation.
    This will be replaced with asymmetric verification in future phases.
    """
    
    def __init__(self, secret_key: str):
        """
        Initialize HMAC verifier.
        
        Args:
            secret_key: Secret key for HMAC verification
        """
        if not secret_key:
            raise ValueError("Secret key is required for HMAC verification")
        
        self.secret_key = secret_key.encode('utf-8')
    
    def verify(self, payload: str, signature: str) -> bool:
        """
        Verify HMAC-SHA256 signature.
        
        Args:
            payload: Canonical JSON string
            signature: HMAC signature (hex string)
        
        Returns:
            True if signature is valid, False otherwise
        """
        # Compute expected signature
        h = hmac.new(
            self.secret_key,
            payload.encode('utf-8'),
            hashlib.sha256
        )
        expected_signature = h.hexdigest()
        
        # Constant-time comparison to prevent timing attacks
        return hmac.compare_digest(expected_signature, signature)
    
    def get_algorithm(self) -> str:
        """Get verification algorithm identifier."""
        return "HMAC-SHA256"


def create_verifier(secret_key: str) -> SignatureVerifier:
    """
    Create a signature verifier instance.
    
    Phase 1: Returns HMACVerifier
    Future: May return Ed25519Verifier, RSAVerifier, etc. based on configuration
    
    Args:
        secret_key: Secret key for verification
    
    Returns:
        SignatureVerifier instance
    
    Note:
        This factory function is the swap point for future algorithms.
        All service code should use this function, not HMACVerifier directly.
    """
    return HMACVerifier(secret_key)
