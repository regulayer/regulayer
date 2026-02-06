"""
Regulayer SDK Trace Context Manager

Core context manager for AI decision tracing with explicit-only capture.

CRITICAL:
    The SDK NEVER attempts to automatically inspect or guess inputs/outputs.
    Users MUST explicitly provide data to hash.
    This prevents accidental PII capture and ensures deterministic behavior.
"""

import time
from datetime import datetime, timezone
from typing import Optional, Any, List
from contextlib import contextmanager

from .config import get_config
from .models import DecisionEvent, RuntimeFingerprint as RuntimeFingerprintModel
from .runtime import get_runtime_fingerprint
from .hasher import hash_data, HashingError
from .client import get_client
from .utils import generate_decision_id


class TraceContext:
    """
    Trace context for a single AI decision.
    
    Provides explicit methods for capturing input and output data.
    All data is hashed before transmission - NO raw data is stored or sent.
    
    Note - EXPLICIT Capture Only:
        The SDK NEVER guesses what inputs or outputs to capture.
        Trust is explicit and intentional.
    """
    
    def __init__(
        self,
        system: str,
        risk: str,
        model_name: str,
        model_version: str,
        prompt: Optional[str] = None
    ):
        """
        Initialize trace context.
        
        Args:
            system: System name generating the decision
            risk: Risk level (e.g., "high", "medium", "low")
            model_name: Model name
            model_version: Model version
            prompt: Optional prompt text
        """
        self.system_name = system
        self.risk_level = risk
        self.model_name = model_name
        self.model_version = model_version
        
        # Generate decision ID
        self.decision_id = generate_decision_id()
        
        # Capture runtime fingerprint
        self.runtime_fingerprint = get_runtime_fingerprint()
        
        # Timing (monotonic for duration, wall clock for timestamps)
        self.start_time_monotonic = time.monotonic_ns()
        self.start_timestamp = datetime.now(timezone.utc)
        self.end_time_monotonic: Optional[int] = None
        self.end_timestamp: Optional[datetime] = None
        
        # Data hashes (explicit capture only)
        self.input_hash: Optional[str] = None
        self.output_hash: Optional[str] = None
        self.prompt_hash: Optional[str] = None
        self.tool_calls_hashes: Optional[List[str]] = None
        
        # Hash prompt if provided
        if prompt:
            try:
                self.prompt_hash = hash_data(prompt)
            except HashingError as e:
                logger = get_config().get_logger()
                logger.warning(f"Failed to hash prompt: {e}")
        
        # Exception tracking
        self.exception: Optional[Exception] = None
    
    def set_input(self, data: Any):
        """
        Explicitly set input data (will be hashed).
        
        Args:
            data: Input data to hash
        
        Note:
            This is EXPLICIT capture. The SDK never automatically
            inspects or guesses what the input is.
        
        Example:
            >>> with trace(...) as t:
            ...     t.set_input({"user_id": "123", "amount": 1000})
            ...     result = model.predict(data)
        """
        try:
            self.input_hash = hash_data(data)
        except HashingError as e:
            logger = get_config().get_logger()
            logger.error(f"Failed to hash input for decision {self.decision_id}: {e}")
            # Continue execution - hashing failure doesn't block decision
    
    def set_output(self, data: Any):
        """
        Explicitly set output data (will be hashed).
        
        Args:
            data: Output data to hash
        
        Note:
            This is EXPLICIT capture. The SDK never automatically
            inspects or guesses what the output is.
        
        Example:
            >>> with trace(...) as t:
            ...     result = model.predict(data)
            ...     t.set_output(result)
        """
        try:
            self.output_hash = hash_data(data)
        except HashingError as e:
            logger = get_config().get_logger()
            logger.error(f"Failed to hash output for decision {self.decision_id}: {e}")
            # Continue execution - hashing failure doesn't block decision
    
    def set_tool_calls(self, tool_calls: List[Any]):
        """
        Explicitly set tool calls (will be hashed).
        
        Args:
            tool_calls: List of tool call data to hash
        
        Note:
            Each tool call is hashed individually.
        
        Example:
            >>> with trace(...) as t:
            ...     tool_calls = [{"name": "search", "args": {...}}]
            ...     t.set_tool_calls(tool_calls)
        """
        try:
            self.tool_calls_hashes = [hash_data(tc) for tc in tool_calls]
        except HashingError as e:
            logger = get_config().get_logger()
            logger.error(f"Failed to hash tool calls for decision {self.decision_id}: {e}")
            # Continue execution - hashing failure doesn't block decision
    
    def _finalize(self):
        """
        Finalize the trace and create decision event.
        
        Called when exiting the context manager.
        """
        # Capture end time (monotonic for duration, wall clock for timestamp)
        self.end_time_monotonic = time.monotonic_ns()
        self.end_timestamp = datetime.now(timezone.utc)
        
        # Compute duration using monotonic clock (nanosecond precision, immune to clock adjustments)
        duration_ns = self.end_time_monotonic - self.start_time_monotonic
        duration_ms = duration_ns / 1_000_000.0  # Convert to milliseconds
        
        # Determine event state
        # "completed" if output was captured, "failed" otherwise
        event_state = "completed" if self.output_hash is not None else "failed"
        
        try:
            # Create decision event
            event = DecisionEvent(
                event_version="1.0",
                event_state=event_state,
                decision_id=self.decision_id,
                system_name=self.system_name,
                risk_level=self.risk_level,
                model_name=self.model_name,
                model_version=self.model_version,
                input_hash=self.input_hash,
                output_hash=self.output_hash,
                prompt_hash=self.prompt_hash,
                tool_calls_hashes=self.tool_calls_hashes,
                start_timestamp=self.start_timestamp,
                end_timestamp=self.end_timestamp,
                execution_duration_ms=duration_ms,
                runtime_fingerprint=RuntimeFingerprintModel(
                    **self.runtime_fingerprint.to_dict()
                )
            )
            
            # Submit to backend (non-blocking, queued)
            client = get_client()
            client.submit_event(event)
            
        except Exception as e:
            # Silent failure - log but never crash user code
            logger = get_config().get_logger()
            logger.error(f"Failed to create/submit event for decision {self.decision_id}: {e}")


@contextmanager
def trace(
    system: str,
    risk: str,
    model_name: str,
    model_version: str,
    prompt: Optional[str] = None
):
    """
    Trace an AI decision with explicit input/output capture.
    
    This is the main entry point for decision tracing.
    
    Args:
        system: System name generating the decision
        risk: Risk level (e.g., "high", "medium", "low")
        model_name: Model name
        model_version: Model version
        prompt: Optional prompt text
    
    Yields:
        TraceContext instance for explicit data capture
    
    Note - EXPLICIT Capture:
        The SDK NEVER automatically inspects inputs or outputs.
        You MUST explicitly call t.set_input() and t.set_output().
        This prevents accidental PII capture and ensures trust.
    
    Note - Exception Handling:
        User exceptions are always re-raised.
        Events are still transmitted even if exceptions occur.
        If output was not set before exception, event_state will be "failed".
    
    Note - Performance:
        Negligible and bounded overhead (<5ms typical).
        Non-blocking - never on critical execution path.
    
    Example:
        >>> from regulayer import trace
        >>> 
        >>> with trace(
        ...     system="loan_approval",
        ...     risk="high",
        ...     model_name="credit_model",
        ...     model_version="v1.2.3"
        ... ) as t:
        ...     input_data = {"user_id": "12345", "amount": 50000}
        ...     t.set_input(input_data)
        ...     
        ...     decision = model.predict(input_data)
        ...     
        ...     t.set_output(decision)
    """
    ctx = TraceContext(
        system=system,
        risk=risk,
        model_name=model_name,
        model_version=model_version,
        prompt=prompt
    )
    
    user_exception = None
    
    try:
        yield ctx
    
    except Exception as e:
        # Capture exception but don't suppress it
        user_exception = e
        ctx.exception = e
    
    finally:
        # Always finalize and send event
        try:
            ctx._finalize()
        except Exception as e:
            # Even finalization errors must not crash user code
            logger = get_config().get_logger()
            logger.error(f"Error in trace finalization: {e}")
        
        # Re-raise user exception if one occurred
        if user_exception is not None:
            raise user_exception
