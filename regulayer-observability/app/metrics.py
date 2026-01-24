"""
Regulayer Observability

Tracks operational metrics without logging payloads.

NEVER LOGGED:
- Decision payloads
- PII
- Cryptographic keys

ALWAYS LOGGED:
- Request counts
- Latency
- Error codes
- Rate limit events
"""

from datetime import datetime, timezone
from typing import Dict, Optional
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict
import asyncio


class MetricType(str, Enum):
    """Types of metrics tracked."""
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"


@dataclass
class Metric:
    """A single metric."""
    name: str
    type: MetricType
    value: float
    labels: Dict[str, str] = field(default_factory=dict)
    recorded_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class MetricsCollector:
    """
    Collects operational metrics.
    
    No payload logging. Ever.
    """
    
    def __init__(self):
        self._counters: Dict[str, int] = defaultdict(int)
        self._gauges: Dict[str, float] = {}
        self._histograms: Dict[str, list] = defaultdict(list)
    
    def increment(self, name: str, value: int = 1, **labels) -> None:
        """Increment a counter."""
        key = self._make_key(name, labels)
        self._counters[key] += value
    
    def gauge(self, name: str, value: float, **labels) -> None:
        """Set a gauge value."""
        key = self._make_key(name, labels)
        self._gauges[key] = value
    
    def observe(self, name: str, value: float, **labels) -> None:
        """Record a histogram observation."""
        key = self._make_key(name, labels)
        self._histograms[key].append(value)
        
        # Keep last 1000 observations
        if len(self._histograms[key]) > 1000:
            self._histograms[key] = self._histograms[key][-1000:]
    
    def _make_key(self, name: str, labels: Dict) -> str:
        """Create metric key from name and labels."""
        if not labels:
            return name
        label_str = ",".join(f"{k}={v}" for k, v in sorted(labels.items()))
        return f"{name}{{{label_str}}}"
    
    def get_counter(self, name: str, **labels) -> int:
        """Get counter value."""
        key = self._make_key(name, labels)
        return self._counters.get(key, 0)
    
    def get_gauge(self, name: str, **labels) -> Optional[float]:
        """Get gauge value."""
        key = self._make_key(name, labels)
        return self._gauges.get(key)
    
    def get_percentile(self, name: str, percentile: float, **labels) -> Optional[float]:
        """Get percentile from histogram."""
        key = self._make_key(name, labels)
        values = self._histograms.get(key, [])
        
        if not values:
            return None
        
        sorted_values = sorted(values)
        idx = int(len(sorted_values) * percentile / 100)
        return sorted_values[min(idx, len(sorted_values) - 1)]


# ============================================================
# Pre-defined Metrics
# ============================================================

METRICS = MetricsCollector()


def record_ingestion_request(project_id: str, success: bool) -> None:
    """Record an ingestion request."""
    METRICS.increment("ingestion_requests_total", project_id=project_id)
    if success:
        METRICS.increment("ingestion_requests_success", project_id=project_id)
    else:
        METRICS.increment("ingestion_requests_failed", project_id=project_id)


def record_ingestion_latency(project_id: str, latency_ms: float) -> None:
    """Record ingestion latency."""
    METRICS.observe("ingestion_latency_ms", latency_ms, project_id=project_id)


def record_rate_limit_hit(project_id: str) -> None:
    """Record a rate limit hit."""
    METRICS.increment("rate_limit_hits_total", project_id=project_id)


def record_quota_hit(project_id: str) -> None:
    """Record a quota exceeded event."""
    METRICS.increment("quota_exceeded_total", project_id=project_id)


def record_queue_depth(depth: int) -> None:
    """Record current queue depth."""
    METRICS.gauge("queue_depth", float(depth))


def record_recorder_latency(latency_ms: float) -> None:
    """Record recorder processing latency."""
    METRICS.observe("recorder_latency_ms", latency_ms)


def get_metrics_summary() -> dict:
    """Get summary of key metrics."""
    return {
        "ingestion": {
            "total": METRICS.get_counter("ingestion_requests_total"),
            "success": METRICS.get_counter("ingestion_requests_success"),
            "failed": METRICS.get_counter("ingestion_requests_failed"),
            "p50_latency_ms": METRICS.get_percentile("ingestion_latency_ms", 50),
            "p95_latency_ms": METRICS.get_percentile("ingestion_latency_ms", 95),
        },
        "limits": {
            "rate_limit_hits": METRICS.get_counter("rate_limit_hits_total"),
            "quota_exceeded": METRICS.get_counter("quota_exceeded_total"),
        },
        "queue": {
            "depth": METRICS.get_gauge("queue_depth"),
        },
        "recorder": {
            "p50_latency_ms": METRICS.get_percentile("recorder_latency_ms", 50),
            "p95_latency_ms": METRICS.get_percentile("recorder_latency_ms", 95),
        }
    }
