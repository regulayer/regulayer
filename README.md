# Regulayer Python SDK

**Enterprise-grade AI Trust Infrastructure - Decision Tracing SDK**

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

Regulayer is a production-grade Python SDK that captures deterministic, non-PII metadata about AI decisions with cryptographic integrity. It provides the foundational trust infrastructure for regulated AI systems.

### Key Features

- ✅ **Zero PII Storage** - Only cryptographic hashes are transmitted
- ✅ **Deterministic Hashing** - Same input always produces same hash
- ✅ **Explicit Capture** - No automatic data inspection
- ✅ **Never Crashes** - Silent failure, never blocks user code
- ✅ **Cryptographically Signed** - Tamper-evident event transmission
- ✅ **Minimal Overhead** - Typically <5ms, non-blocking
- ✅ **Production Ready** - Thread-safe, async-safe, enterprise-grade

## Installation

```bash
pip install regulayer
```

**Requirements:**
- Python 3.10 or higher
- `httpx>=0.24.0`
- `pydantic>=2.0.0`

## Quick Start

```python
from regulayer import trace, configure

# Configure SDK (one-time setup)
configure(
    api_key="your-api-key",
    endpoint="https://api.regulayer.io/v1/events"
)

# Trace an AI decision
with trace(
    system="loan_approval",
    risk="high",
    model_name="credit_model",
    model_version="v1.2.3"
) as t:
    # Your AI decision code
    input_data = {"user_id": "12345", "amount": 50000}
    decision = model.predict(input_data)
    
    # Explicitly capture input and output (hashed)
    t.set_input(input_data)
    t.set_output(decision)
```

## Core Concepts

### Trust Boundary

> **IMPORTANT**: The SDK is **not** a source of truth. The backend is the source of truth. SDK events are **claims, not facts**. Attestation and verification occur server-side.

### Explicit Capture

The SDK **NEVER** attempts to automatically inspect or guess inputs/outputs. This prevents:
- Accidental PII capture
- Non-deterministic behavior
- Trust violations

You **MUST** explicitly call `t.set_input()` and `t.set_output()`.

### What Gets Transmitted

For each decision, the SDK transmits:

**Metadata** (plaintext):
- Decision ID (UUID v4)
- System name, risk level
- Model name and version
- Timestamps and duration
- Runtime fingerprint (Python version, OS, SDK version, instance ID)
- Event version and state

**Data** (hashed only):
- Input hash (SHA-256, if explicitly set)
- Output hash (SHA-256, if explicitly set)
- Prompt hash (SHA-256, if provided)
- Tool calls hashes (SHA-256, if provided)

**NEVER transmitted:**
- Raw input data
- Raw output data
- Raw prompts
- Any PII

##API Reference

### `configure(api_key, endpoint, log_level)`

Configure the Regulayer SDK.

**Parameters:**
- `api_key` (str): API authentication key
- `endpoint` (str, optional): Backend endpoint URL (must be HTTPS)
- `log_level` (str, optional): Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)

**Example:**
```python
configure(
    api_key="your-api-key",
    endpoint="https://api.regulayer.io/v1/events",
    log_level="WARNING"
)
```

**Environment Variables:**
- `REGULAYER_API_KEY` - API key
- `REGULAYER_ENDPOINT` - Endpoint URL
- `REGULAYER_LOG_LEVEL` - Log level

### `trace(system, risk, model_name, model_version, prompt)`

Context manager for tracing an AI decision.

**Parameters:**
- `system` (str): System name generating the decision
- `risk` (str): Risk level (e.g., "high", "medium", "low")
- `model_name` (str): Model name
- `model_version` (str): Model version
- `prompt` (str, optional): Prompt text (will be hashed)

**Yields:**
- `TraceContext`: Context object with methods to capture data

**Example:**
```python
with trace(
    system="fraud_detection",
    risk="critical",
    model_name="xgboost_fraud",
    model_version="v2.1.0",
    prompt="Analyze this transaction"
) as t:
    t.set_input(transaction_data)
    result = model.predict(transaction_data)
    t.set_output(result)
```

### TraceContext Methods

#### `set_input(data)`

Explicitly capture input data (will be hashed).

**Parameters:**
- `data` (Any): Input data to hash (dict, list, str, int, float, bool, None, datetime)

#### `set_output(data)`

Explicitly capture output data (will be hashed).

**Parameters:**
- `data` (Any): Output data to hash

#### `set_tool_calls(tool_calls)`

Explicitly capture tool calls (each will be hashed individually).

**Parameters:**
- `tool_calls` (List[Any]): List of tool call objects

## Exception Handling

User exceptions are **always re-raised**. Events are **still transmitted** even if exceptions occur.

```python
try:
    with trace(...) as t:
        t.set_input(data)
        raise ValueError("Something went wrong")
except ValueError:
    # Exception is propagated
    # Event is still sent with event_state="failed"
    pass
```

If an exception occurs before `set_output()` is called:
- `output_hash` will be `null`
- `event_state` will be `"failed"`
- This is a **valid forensic state**

## Event States

- **`completed`**: Output was captured (output_hash is not null)
- **`failed`**: Output was not captured (output_hash is null)

## Security Guarantees

### Deterministic Hashing

- **Guarantee**: Same input → same hash, always
- **Algorithm**: SHA-256
- **Canonicalization**:
  - Sorted JSON keys
  - UTF-8 encoding
  - Canonical float formatting
  - ISO 8601 UTC datetime normalization

### Supported Hash Types

- `dict`, `list`, `str`, `int`, `float`, `bool`, `None`
- `datetime` (with timezone)

### Rejected Types

- Custom objects
- `NaN`, `Infinity` (non-deterministic)
- Naive datetimes (no timezone)
- `bytes` (use string instead)

**Rule**: If deterministic serialization cannot be guaranteed, hashing fails explicitly.

### Event Signing

**Phase 1**: HMAC-SHA256 (placeholder)

> **WARNING**: HMAC-SHA256 is a **Phase 1 placeholder ONLY**. All signing logic is abstracted to allow asymmetric signing (Ed25519/RSA) in future phases without breaking SDK contracts.

## Performance

- **Overhead**: Negligible and bounded (<5ms typical)
- **Non-blocking**: Never on critical execution path
- **Async-safe**: Uses asyncio for backend communication
- **Thread-safe**: Concurrent configuration updates supported

## Resilience

### Network Failures

- **Retry**: Exponential backoff (3 attempts, starting at 1s)
- **Queue**: In-memory event queue (default 1000 events)
- **Overflow**: Drops oldest events when queue is full
- **Failure**: Silent (logs errors, never crashes user code)

### Graceful Shutdown

Queue drain task:
- Started **lazily** on first event submission
- Shuts down **gracefully** on process exit
- Prevents background task leaks

## Advanced Usage

### Custom Tool Calls

```python
with trace(...) as t:
    tool_calls = [
        {"name": "search", "args": {"query": "Paris weather"}},
        {"name": "calculator", "args": {"expr": "250 * 1.2"}}
    ]
    t.set_tool_calls(tool_calls)
```

### Prompt Hashing

```python
with trace(
    system="chatbot",
    risk="low",
    model_name="gpt-4",
    model_version="2024-01",
    prompt="You are a helpful assistant"  # Automatically hashed
) as t:
    response = llm.generate(messages)
    t.set_output(response)
```

### Multi-Process Forensics

Each process gets a unique `sdk_instance_id` (UUID v4), enabling multi-process tracking and duplicate detection.

## Testing

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=regulayer --cov-report=term-missing
```

## FAQ

**Q: Does the SDK store raw data?**  
A: No. Only SHA-256 hashes are transmitted. Raw data never leaves your system.

**Q: What if the SDK fails?**  
A: The SDK never crashes your code. Failures are logged and handled silently.

**Q: Can I trust the hashes?**  
A: Yes. Hashing is deterministic and cryptographically signed. Same input always produces same hash.

**Q: What about performance?**  
A: Overhead is negligible (<5ms typical) and non-blocking. Events are queued and sent asynchronously.

**Q: Is it thread-safe?**  
A: Yes. Configuration updates and event submission are thread-safe.

**Q: What happens if my model crashes?**  
A: The exception is re-raised normally. An event is still sent with `event_state="failed"`.

**Q: Do I need to capture input and output?**  
A: No. Capture is optional and explicit. Only capture what's forensically relevant.

**Q: What if I forget to call `set_output()`?**  
A: The event is sent with `output_hash=null` and `event_state="failed"`. This is a valid forensic state.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or feedback:
- GitHub Issues: [https://github.com/regulayer/regulayer-python](https://github.com/regulayer/regulayer-python)
- Email: support@regulayer.io

---

**Built with ❤️ for trustworthy AI**
