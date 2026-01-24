"""
Regulayer Status - Health Checks

Probes for each system component.

PRINCIPLE: Operational failures must never create cryptographic ambiguity.
"""

import asyncio
from datetime import datetime, timezone
from typing import Optional
import httpx

from .models import ComponentHealth, ComponentStatus


class HealthChecker:
    """
    Health check probes for all services.
    
    Checks operational status, not cryptographic validity.
    """
    
    def __init__(self):
        self.timeout_seconds = 5.0
    
    async def check_service(
        self,
        name: str,
        url: str,
        endpoint: str = "/health"
    ) -> ComponentHealth:
        """Check if a service is reachable and healthy."""
        try:
            start = datetime.now(timezone.utc)
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.get(f"{url}{endpoint}")
                latency = (datetime.now(timezone.utc) - start).total_seconds() * 1000
                
            if response.status_code == 200:
                return ComponentHealth(
                    name=name,
                    status=ComponentStatus.OPERATIONAL,
                    latency_ms=latency
                )
            else:
                return ComponentHealth(
                    name=name,
                    status=ComponentStatus.DEGRADED,
                    latency_ms=latency,
                    message=f"Returned {response.status_code}"
                )
                
        except httpx.TimeoutException:
            return ComponentHealth(
                name=name,
                status=ComponentStatus.MAJOR_OUTAGE,
                message="Health check timed out"
            )
        except Exception as e:
            return ComponentHealth(
                name=name,
                status=ComponentStatus.MAJOR_OUTAGE,
                message=f"Unreachable: {type(e).__name__}"
            )
    
    async def check_ingestion_gateway(self, url: str = "http://localhost:8400") -> ComponentHealth:
        """Check ingestion gateway health."""
        return await self.check_service("ingestion", url)
    
    async def check_recorder(self, url: str = "http://localhost:8000") -> ComponentHealth:
        """Check recorder health."""
        return await self.check_service("recorder", url)
    
    async def check_control_plane(self, url: str = "http://localhost:8100") -> ComponentHealth:
        """Check control plane health."""
        return await self.check_service("control_plane", url)
    
    async def check_billing(self, url: str = "http://localhost:8500") -> ComponentHealth:
        """Check billing service health."""
        return await self.check_service("billing", url)
    
    async def check_queue(self, redis_url: str = "redis://localhost:6379") -> ComponentHealth:
        """Check queue (Redis) health."""
        try:
            import redis.asyncio as redis_client
            
            start = datetime.now(timezone.utc)
            client = redis_client.from_url(redis_url)
            await client.ping()
            latency = (datetime.now(timezone.utc) - start).total_seconds() * 1000
            await client.close()
            
            return ComponentHealth(
                name="queue",
                status=ComponentStatus.OPERATIONAL,
                latency_ms=latency
            )
        except Exception as e:
            return ComponentHealth(
                name="queue",
                status=ComponentStatus.MAJOR_OUTAGE,
                message=f"Redis unavailable: {type(e).__name__}"
            )
    
    async def check_verification(self, url: str = "http://localhost:8200") -> ComponentHealth:
        """Check verification service health."""
        return await self.check_service("verification", url)


# ============================================================
# Global Instance
# ============================================================

_checker: Optional[HealthChecker] = None


def get_health_checker() -> HealthChecker:
    """Get or create health checker."""
    global _checker
    if _checker is None:
        _checker = HealthChecker()
    return _checker
