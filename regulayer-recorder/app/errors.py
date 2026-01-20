"""
Regulayer Decision Recorder - Explicit Error Taxonomy

All errors are explicit and typed for proper handling.
"""


class RecorderError(Exception):
    """Base error for all recorder exceptions."""
    
    def __init__(self, message: str, decision_id: str = None):
        self.message = message
        self.decision_id = decision_id
        super().__init__(message)


class SchemaValidationError(RecorderError):
    """Schema validation failed - malformed event."""
    pass


class SignatureVerificationError(RecorderError):
    """Signature verification failed - authentication invalid."""
    pass


class DuplicateDecisionError(RecorderError):
    """Duplicate decision_id detected - replay attempt."""
    pass


class ChainIntegrityError(RecorderError):
    """Hash chain integrity violation - tampering detected."""
    pass


class TimestampAnomalyError(RecorderError):
    """Timestamp is invalid or out of acceptable range."""
    pass


class SemanticValidationError(RecorderError):
    """Semantic validation failed - logically inconsistent event."""
    pass


class StorageError(RecorderError):
    """Storage operation failed."""
    pass


class ServiceDegradedError(RecorderError):
    """Service is degraded and cannot accept new records."""
    pass
