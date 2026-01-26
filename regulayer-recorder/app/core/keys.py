import os
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization
import logging

logger = logging.getLogger(__name__)

class KeyManager:
    def __init__(self, key_path: str):
        self.key_path = key_path
        self._private_key = None
        self._public_key_hex = None

    def bootstrap(self) -> ed25519.Ed25519PrivateKey:
        """
        Load the signing key from disk, or generate a new one if it doesn't exist.
        """
        if os.path.exists(self.key_path):
            logger.info(f"Loading existing signing key from {self.key_path}")
            with open(self.key_path, "rb") as key_file:
                self._private_key = serialization.load_pem_private_key(
                    key_file.read(),
                    password=None
                )
        else:
            logger.warning(f"No signing key found at {self.key_path}. Generating NEW Identity.")
            self._private_key = ed25519.Ed25519PrivateKey.generate()
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(self.key_path), exist_ok=True)
            
            # Save to disk
            pem = self._private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            )
            with open(self.key_path, "wb") as f:
                f.write(pem)
            logger.info("New signing key persited to disk.")

        # Cache public key hex for quick access
        public_key = self._private_key.public_key()
        pub_bytes = public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )
        self._public_key_hex = pub_bytes.hex()
        logger.info(f"Recorder Identity (Public Key): {self._public_key_hex}")
        
        return self._private_key

    def get_signing_key(self) -> ed25519.Ed25519PrivateKey:
        if not self._private_key:
            raise RuntimeError("KeyManager not bootstrapped!")
        return self._private_key

    def get_public_key_hex(self) -> str:
        if not self._public_key_hex:
            # Ensure loaded if accessed before bootstrap (shouldn't happen in app flow)
            if self._private_key:
                public_key = self._private_key.public_key()
                pub_bytes = public_key.public_bytes(
                   encoding=serialization.Encoding.Raw,
                   format=serialization.PublicFormat.Raw
                )
                self._public_key_hex = pub_bytes.hex()
        return self._public_key_hex
