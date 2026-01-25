# Minimal Recorder

## Purpose

This document describes a minimal evidence recorder.
It is educational, not production-ready.

**Implementable in <200 lines in any language.**

---

## Scope

A minimal recorder:
- ✅ Accepts claims (JSON)
- ✅ Canonicalizes content
- ✅ Computes hash
- ✅ Appends to chain
- ✅ Signs attestation

A minimal recorder does NOT:
- ❌ Handle networking
- ❌ Manage authentication
- ❌ Implement access control
- ❌ Provide a UI

---

## Data Structures

### Record

```
Record {
    decision_id: string      // Unique identifier
    record_hash: string      // "sha256:<hex>"
    recorded_at: string      // RFC 3339 timestamp
    content: object          // Application data
}
```

### Chain Entry

```
ChainEntry {
    record: Record
    sequence_number: integer
    previous_hash: string
}
```

### Attestation

```
Attestation {
    signature: string        // Base64-encoded
    algorithm: string        // "Ed25519"
    key_id: string
}
```

---

## Algorithm

### Input

```
claim: object (arbitrary JSON)
```

### Process

```
function record(claim):
    # 1. Create record
    record = {
        decision_id: uuid(),
        recorded_at: now_utc(),
        content: claim
    }
    
    # 2. Canonicalize (RFC 8785)
    canonical = canonicalize(record)
    
    # 3. Hash
    hash = "sha256:" + sha256(canonical)
    record.record_hash = hash
    
    # 4. Get chain position
    last = get_last_entry()
    if last:
        seq = last.sequence_number + 1
        prev = last.record.record_hash
    else:
        seq = 1
        prev = null
    
    # 5. Sign
    signature = ed25519_sign(PRIVATE_KEY, hash)
    
    # 6. Store
    entry = {
        record: record,
        sequence_number: seq,
        previous_hash: prev,
        attestation: {
            signature: base64(signature),
            algorithm: "Ed25519",
            key_id: KEY_ID
        }
    }
    append_to_storage(entry)
    
    return entry
```

---

## Pseudocode Implementation

```python
import hashlib
import json
import base64
from datetime import datetime
from typing import Optional, Dict, Any

# Storage (in-memory for minimal implementation)
CHAIN = []
PRIVATE_KEY = None  # Ed25519 private key
KEY_ID = "minimal-key-001"


def canonicalize(obj: Any) -> str:
    """RFC 8785 canonicalization."""
    if obj is None:
        return "null"
    elif isinstance(obj, bool):
        return "true" if obj else "false"
    elif isinstance(obj, (int, float)):
        return str(int(obj)) if obj == int(obj) else str(obj)
    elif isinstance(obj, str):
        escaped = obj.replace("\\", "\\\\").replace('"', '\\"')
        return f'"{escaped}"'
    elif isinstance(obj, list):
        return "[" + ",".join(canonicalize(x) for x in obj) + "]"
    elif isinstance(obj, dict):
        pairs = [f'{canonicalize(k)}:{canonicalize(obj[k])}' 
                 for k in sorted(obj.keys())]
        return "{" + ",".join(pairs) + "}"


def compute_hash(obj: Dict) -> str:
    """Compute SHA-256 hash of canonical JSON."""
    canonical = canonicalize(obj)
    hash_bytes = hashlib.sha256(canonical.encode("utf-8")).digest()
    return f"sha256:{hash_bytes.hex()}"


def record(claim: Dict) -> Dict:
    """Record a claim to the chain."""
    
    # Create record
    record_obj = {
        "decision_id": str(uuid.uuid4()),
        "recorded_at": datetime.utcnow().isoformat() + "Z",
        **claim  # Include claim content
    }
    
    # Compute hash (excluding hash field)
    record_hash = compute_hash(record_obj)
    record_obj["record_hash"] = record_hash
    
    # Get chain position
    if CHAIN:
        sequence_number = CHAIN[-1]["sequence_number"] + 1
        previous_hash = CHAIN[-1]["record"]["record_hash"]
    else:
        sequence_number = 1
        previous_hash = ""
    
    # Sign
    signature = ed25519_sign(PRIVATE_KEY, record_hash.encode("utf-8"))
    
    # Create entry
    entry = {
        "record": record_obj,
        "sequence_number": sequence_number,
        "previous_hash": previous_hash,
        "attestation": {
            "signature": base64.b64encode(signature).decode(),
            "algorithm": "Ed25519",
            "key_id": KEY_ID
        }
    }
    
    # Append
    CHAIN.append(entry)
    
    return entry
```

---

## Storage Options

The minimal recorder can use any append-only storage:

| Option | Implementation |
|--------|----------------|
| File | Append JSON lines to file |
| SQLite | INSERT-only table with sequence check |
| Memory | Append to list (non-persistent) |

---

## What's Missing (Production Considerations)

| Feature | Why Needed in Production |
|---------|-------------------------|
| Key management | Secure key storage |
| Networking | Remote access |
| Authentication | Access control |
| High availability | Reliability |
| Backup | Disaster recovery |
| Monitoring | Operations |

---

## Conformance

A minimal recorder conforms if:

- [x] Uses SHA-256 for hashing
- [x] Uses RFC 8785 for canonicalization
- [x] Appends only (no modification)
- [x] Links records via previous_hash
- [x] Signs with approved algorithm
