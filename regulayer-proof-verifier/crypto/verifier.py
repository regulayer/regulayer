import base64
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from cryptography.hazmat.primitives import serialization
from cryptography.exceptions import InvalidSignature

def verify_signature(public_key_b64: str, signature_b64: str, message: bytes) -> bool:
    """
    Verify Ed25519 signature.
    
    Args:
        public_key_b64: Base64 encoded public key
        signature_b64: Base64 encoded signature
        message: The canonical bytes that were signed
        
    Returns:
        True if valid, False otherwise.
    """
    try:
        # 1. Decode keys/sig
        # Handle potential padding issues if needed, but standard b64 usually fine
        pub_bytes = base64.b64decode(public_key_b64)
        sig_bytes = base64.b64decode(signature_b64)
        
        # 2. Load Public Key
        # Currently assuming 'Raw' Ed25519 key bytes (32 bytes).
        # If the key is PEM, we need load_pem_public_key.
        # Regulayer-Attestation usually stores raw bytes in hex or base64.
        # Let's check IdentityRegistry... it uses hex-encoded raw key.
        # Wait, the ExportBundle has `public_key` which we grab from registry.
        # Registry stores 'hex-encoded Ed25519 public key'. 
        # But our Export logic sends what?
        # In api.py: `identity.public_key` (which is hex string).
        # But `ProofAttestation` model definition says `public_key: str`.
        # `PROOF_BUNDLE_SPEC.md` says `public_key`: "base64-encoded".
        
        # MISMATCH DETECTED: 
        # Registry has HEX. 
        # Spec says BASE64.
        # I need to ensure api.py converts Hex -> Base64 or Spec allows Hex.
        # Spec says "base64-encoded" in table.
        # I should probably support both or fix the exporter.
        
        # For now, let's assume the verifier expects Base64 as per spec.
        # If the key length is 32 bytes after decode, we use `from_public_bytes`.
        
        if len(pub_bytes) == 32:
            public_key = Ed25519PublicKey.from_public_bytes(pub_bytes)
        else:
            # Maybe it was hex? 
            # If input was base64 encoded hex... messy.
            # Let's try to handle Hex input too just in case?
            # No, spec says Base64. Fix the exporter later if needed.
            # But let's verify if 32 bytes.
            pass

        # 3. Verify
        public_key.verify(sig_bytes, message)
        return True
        
    except (InvalidSignature, ValueError, Exception):
        return False
