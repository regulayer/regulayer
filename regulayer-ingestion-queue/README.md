# Regulayer Ingestion Queue

Async ingestion buffer for scaling and backpressure safety.

## Architecture

```
SDK / Client
   ↓
Ingestion Gateway
   ↓
Durable Queue ← NEW (this service)
   ↓
Decision Recorder
```

## Core Principle

> **Async ≠ reordering, mutation, or loss. We buffer transport, not truth.**

## Guarantees

| Guarantee | Status |
|-----------|--------|
| At-least-once delivery | ✅ |
| Per-project ordering | ✅ |
| No payload mutation | ✅ |
| Bounded retries | ✅ |
| Dead Letter Queue | ✅ |

## Backend Options

- **Memory** - For testing only
- **Redis Streams** - Production recommended

## Configuration

| Env Var | Default | Description |
|---------|---------|-------------|
| QUEUE_REDIS_URL | redis://localhost:6379 | Redis URL |
| QUEUE_MAX_RETRIES | 5 | Max retry attempts |
| QUEUE_RECORDER_URL | http://localhost:8000 | Recorder URL |

## Usage

### Producer (Gateway integration)
```python
from regulayer_ingestion_queue.app.producer import enqueue_decision

request_id = await enqueue_decision(
    project_id=project_id,
    org_id=org_id,
    payload=body,
    headers=headers
)

# Return 202 Accepted immediately
return {"status": "queued", "request_id": request_id}
```

### Consumer (Worker)
```python
from regulayer_ingestion_queue.app.consumer import run_consumer

await run_consumer(["project-1", "project-2"])
```

## Dead Letter Queue

Failed messages go to DLQ with:
- Original payload
- Failure reason
- Timestamp
- Retry count

Messages in DLQ need manual intervention.
