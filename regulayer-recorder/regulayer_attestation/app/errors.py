class AttestationError(Exception):
    """Base class for all attestation errors."""
    code: str = "INTERNAL_ERROR"

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)

    def __str__(self):
        return f"[{self.code}] {self.message}"

class InvalidSignatureError(AttestationError):
    code = "INVALID_SIGNATURE"

class IdentityNotFoundError(AttestationError):
    code = "IDENTITY_NOT_FOUND"

class RevokedIdentityError(AttestationError):
    code = "REVOKED_IDENTITY"

class MalformedEnvelopeError(AttestationError):
    code = "MALFORMED_ENVELOPE"
