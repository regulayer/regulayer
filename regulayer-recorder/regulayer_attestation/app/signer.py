from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization
from typing import Optional
import base64

class Ed25519Signer:
    """
    Wrapper for Ed25519 signing operations using cryptography library.
    """
    def __init__(self, private_key: Optional[ed25519.Ed25519PrivateKey] = None):
        self._private_key = private_key or ed25519.Ed25519PrivateKey.generate()
        self._public_key = self._private_key.public_key()

    def sign(self, payload: bytes) -> str:
        """
        Sign the payload bytes.
        Returns Base64 encoded signature.
        """
        signature_bytes = self._private_key.sign(payload)
        return base64.b64encode(signature_bytes).decode('utf-8')

    def get_public_key_hex(self) -> str:
        """
        Get the public key as a hex string (for storage in Identity).
        """
        public_bytes = self._public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )
        return public_bytes.hex()

