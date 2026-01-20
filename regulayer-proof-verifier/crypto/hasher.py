import hashlib

def compute_hash(data: bytes) -> str:
    """
    Compute SHA-256 hash of bytes.
    Returns hex digest.
    """
    return hashlib.sha256(data).hexdigest()
