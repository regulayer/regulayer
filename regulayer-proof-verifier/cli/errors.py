class ErrorCode:
    INVALID_HASH = "INVALID_HASH"
    INVALID_SIGNATURE = "INVALID_SIGNATURE"
    BROKEN_CHAIN = "BROKEN_CHAIN"
    REVOKED_IDENTITY = "REVOKED_IDENTITY"
    CANONICALIZATION_MISMATCH = "CANONICALIZATION_MISMATCH"
    UNSUPPORTED_VERSION = "UNSUPPORTED_VERSION"
    FILE_NOT_FOUND = "FILE_NOT_FOUND"
    INVALID_JSON = "INVALID_JSON"
    SCHEMA_ERROR = "SCHEMA_ERROR"

class VerificationError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)
