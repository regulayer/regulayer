"""
Regulayer Infrastructure - Secrets Management

Secure key loading from environment or KMS.

RULES:
- No keys in code
- No keys in DB
- No keys in logs
"""

import os
import base64
from typing import Optional, Dict
from dataclasses import dataclass
from enum import Enum


class SecretSource(str, Enum):
    """Where secrets are loaded from."""
    ENVIRONMENT = "environment"
    AWS_KMS = "aws_kms"
    GCP_KMS = "gcp_kms"
    AZURE_KEYVAULT = "azure_keyvault"
    HASHICORP_VAULT = "hashicorp_vault"


@dataclass
class SecretMetadata:
    """Metadata about a secret (never the secret itself)."""
    name: str
    source: SecretSource
    version: str
    loaded_at: str
    key_fingerprint: Optional[str] = None  # First 8 chars of hash


class SecretsManager:
    """
    Load and manage secrets securely.
    
    Supports environment variables with fallback to KMS.
    """
    
    def __init__(self, source: SecretSource = SecretSource.ENVIRONMENT):
        self.source = source
        self._cache: Dict[str, bytes] = {}
        self._metadata: Dict[str, SecretMetadata] = {}
    
    def load_signing_key(self, key_name: str = "REGULAYER_SIGNING_KEY") -> bytes:
        """
        Load Ed25519 signing key.
        
        Expected format: base64-encoded 32-byte seed or 64-byte keypair
        """
        return self._load_key(key_name)
    
    def load_hmac_key(self, key_name: str = "REGULAYER_HMAC_KEY") -> bytes:
        """
        Load HMAC key.
        
        Expected format: base64-encoded bytes
        """
        return self._load_key(key_name)
    
    def _load_key(self, key_name: str) -> bytes:
        """Load a key from configured source."""
        if key_name in self._cache:
            return self._cache[key_name]
        
        if self.source == SecretSource.ENVIRONMENT:
            key = self._load_from_env(key_name)
        elif self.source == SecretSource.AWS_KMS:
            key = self._load_from_aws_kms(key_name)
        elif self.source == SecretSource.GCP_KMS:
            key = self._load_from_gcp_kms(key_name)
        else:
            raise ValueError(f"Unsupported secret source: {self.source}")
        
        self._cache[key_name] = key
        self._record_metadata(key_name, key)
        
        return key
    
    def _load_from_env(self, key_name: str) -> bytes:
        """Load key from environment variable."""
        value = os.environ.get(key_name)
        
        if not value:
            raise ValueError(
                f"Secret '{key_name}' not found in environment. "
                "Set it as a base64-encoded environment variable."
            )
        
        try:
            return base64.b64decode(value)
        except Exception as e:
            raise ValueError(f"Failed to decode secret '{key_name}': {e}")
    
    def _load_from_aws_kms(self, key_name: str) -> bytes:
        """Load key from AWS KMS / Secrets Manager."""
        # Placeholder for AWS integration
        # In production: use boto3 to fetch from Secrets Manager
        raise NotImplementedError("AWS KMS integration not yet implemented")
    
    def _load_from_gcp_kms(self, key_name: str) -> bytes:
        """Load key from GCP Secret Manager."""
        # Placeholder for GCP integration
        raise NotImplementedError("GCP Secret Manager integration not yet implemented")
    
    def _record_metadata(self, key_name: str, key_bytes: bytes) -> None:
        """Record metadata about loaded key (never the key itself)."""
        import hashlib
        from datetime import datetime, timezone
        
        fingerprint = hashlib.sha256(key_bytes).hexdigest()[:8]
        
        self._metadata[key_name] = SecretMetadata(
            name=key_name,
            source=self.source,
            version="1",
            loaded_at=datetime.now(timezone.utc).isoformat(),
            key_fingerprint=fingerprint
        )
    
    def get_metadata(self, key_name: str) -> Optional[SecretMetadata]:
        """Get metadata about a loaded key (safe to log)."""
        return self._metadata.get(key_name)
    
    def all_metadata(self) -> Dict[str, SecretMetadata]:
        """Get metadata for all loaded keys."""
        return dict(self._metadata)
    
    def clear_cache(self) -> None:
        """Clear cached secrets (for rotation)."""
        self._cache.clear()
        # Metadata preserved for audit


# ============================================================
# Global Instance
# ============================================================

_secrets_manager: Optional[SecretsManager] = None


def get_secrets_manager() -> SecretsManager:
    """Get or create the global secrets manager."""
    global _secrets_manager
    
    if _secrets_manager is None:
        source = SecretSource(
            os.environ.get("REGULAYER_SECRET_SOURCE", "environment")
        )
        _secrets_manager = SecretsManager(source)
    
    return _secrets_manager


def load_signing_key() -> bytes:
    """Convenience function to load signing key."""
    return get_secrets_manager().load_signing_key()


def load_hmac_key() -> bytes:
    """Convenience function to load HMAC key."""
    return get_secrets_manager().load_hmac_key()
