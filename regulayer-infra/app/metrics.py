"""
Regulayer Infrastructure - Observability

Metrics and monitoring without leaking trust data.

RULES:
- No payloads in logs/metrics
- No hashes in logs/metrics  
- No secrets in logs/metrics
"""

import time
from typing import Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime, timezone
from threading import Lock


@dataclass
class ServiceMetrics:
    """Aggregated metrics for a service."""
    ingest_count: int = 0
    verification_count: int = 0
    export_count: int = 0
    error_count: int = 0
    
    total_latency_ms: float = 0.0
    request_count: int = 0
    
    chain_length: int = 0
    last_updated: Optional[datetime] = None
    
    @property
    def avg_latency_ms(self) -> float:
        if self.request_count == 0:
            return 0.0
        return self.total_latency_ms / self.request_count


class MetricsCollector:
    """
    Collect and expose operational metrics.
    
    Thread-safe metrics collection without leaking sensitive data.
    """
    
    def __init__(self):
        self._metrics = ServiceMetrics()
        self._lock = Lock()
    
    def record_ingest(self) -> None:
        """Record a decision ingestion."""
        with self._lock:
            self._metrics.ingest_count += 1
            self._metrics.last_updated = datetime.now(timezone.utc)
    
    def record_verification(self) -> None:
        """Record a verification request."""
        with self._lock:
            self._metrics.verification_count += 1
            self._metrics.last_updated = datetime.now(timezone.utc)
    
    def record_export(self) -> None:
        """Record an export request."""
        with self._lock:
            self._metrics.export_count += 1
            self._metrics.last_updated = datetime.now(timezone.utc)
    
    def record_error(self) -> None:
        """Record an error."""
        with self._lock:
            self._metrics.error_count += 1
            self._metrics.last_updated = datetime.now(timezone.utc)
    
    def record_request(self, latency_ms: float) -> None:
        """Record a request with latency."""
        with self._lock:
            self._metrics.request_count += 1
            self._metrics.total_latency_ms += latency_ms
            self._metrics.last_updated = datetime.now(timezone.utc)
    
    def set_chain_length(self, length: int) -> None:
        """Update the current chain length."""
        with self._lock:
            self._metrics.chain_length = length
            self._metrics.last_updated = datetime.now(timezone.utc)
    
    def get_metrics(self) -> Dict:
        """
        Get metrics for export.
        
        Safe to expose - no sensitive data.
        """
        with self._lock:
            return {
                "ingest_count": self._metrics.ingest_count,
                "verification_count": self._metrics.verification_count,
                "export_count": self._metrics.export_count,
                "error_count": self._metrics.error_count,
                "request_count": self._metrics.request_count,
                "avg_latency_ms": round(self._metrics.avg_latency_ms, 2),
                "chain_length": self._metrics.chain_length,
                "last_updated": self._metrics.last_updated.isoformat() if self._metrics.last_updated else None
            }
    
    def get_prometheus_metrics(self) -> str:
        """
        Get metrics in Prometheus format.
        """
        with self._lock:
            lines = [
                f"regulayer_ingest_total {self._metrics.ingest_count}",
                f"regulayer_verification_total {self._metrics.verification_count}",
                f"regulayer_export_total {self._metrics.export_count}",
                f"regulayer_error_total {self._metrics.error_count}",
                f"regulayer_request_total {self._metrics.request_count}",
                f"regulayer_latency_avg_ms {self._metrics.avg_latency_ms:.2f}",
                f"regulayer_chain_length {self._metrics.chain_length}",
            ]
            return "\n".join(lines)


class RequestTimer:
    """Context manager for timing requests."""
    
    def __init__(self, collector: MetricsCollector):
        self.collector = collector
        self.start_time: Optional[float] = None
    
    def __enter__(self):
        self.start_time = time.perf_counter()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.start_time:
            elapsed_ms = (time.perf_counter() - self.start_time) * 1000
            self.collector.record_request(elapsed_ms)
            
            if exc_type:
                self.collector.record_error()


# ============================================================
# Alert Conditions
# ============================================================

@dataclass
class AlertCondition:
    """Condition that triggers an alert."""
    name: str
    check: callable
    message: str
    severity: str = "warning"


class AlertChecker:
    """Check for alert conditions."""
    
    def __init__(self, collector: MetricsCollector):
        self.collector = collector
        self.conditions = [
            AlertCondition(
                name="high_error_rate",
                check=self._check_high_error_rate,
                message="Error rate exceeds 5%",
                severity="critical"
            ),
            AlertCondition(
                name="chain_stale",
                check=self._check_chain_stale,
                message="No new records in 1 hour",
                severity="warning"
            ),
        ]
    
    def _check_high_error_rate(self) -> bool:
        metrics = self.collector.get_metrics()
        total = metrics["request_count"]
        errors = metrics["error_count"]
        
        if total < 100:  # Not enough data
            return False
        
        return (errors / total) > 0.05
    
    def _check_chain_stale(self) -> bool:
        metrics = self.collector.get_metrics()
        last_updated = metrics["last_updated"]
        
        if not last_updated:
            return True
        
        # Parse ISO format and check staleness
        from datetime import timedelta
        last = datetime.fromisoformat(last_updated.replace("Z", "+00:00"))
        return datetime.now(timezone.utc) - last > timedelta(hours=1)
    
    def check_all(self) -> list:
        """Check all conditions and return triggered alerts."""
        alerts = []
        for condition in self.conditions:
            if condition.check():
                alerts.append({
                    "name": condition.name,
                    "message": condition.message,
                    "severity": condition.severity
                })
        return alerts


# ============================================================
# Global Instance
# ============================================================

_metrics_collector: Optional[MetricsCollector] = None


def get_metrics_collector() -> MetricsCollector:
    """Get or create the global metrics collector."""
    global _metrics_collector
    
    if _metrics_collector is None:
        _metrics_collector = MetricsCollector()
    
    return _metrics_collector
