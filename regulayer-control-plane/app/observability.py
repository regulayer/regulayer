"""
Regulayer - Observability & Security Middleware

Includes:
- Request ID generation (X-Request-ID)
- Structured JSON logging
- Security Headers (HSTS, No-Sniff, etc.)
"""

import time
import uuid
import json
import logging
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# Configure JSON Logger
handler = logging.StreamHandler()
formatter = logging.Formatter('%(message)s')
handler.setFormatter(formatter)

logger = logging.getLogger("regulayer.access")
logger.setLevel(logging.INFO)
logger.addHandler(handler)


class RequestIdMiddleware(BaseHTTPMiddleware):
    """
    Generates a unique ID for each request.
    """
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


class StructuredLoggerMiddleware(BaseHTTPMiddleware):
    """
    Logs requests and responses in JSON format.
    """
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Prepare context
        request_id = getattr(request.state, "request_id", "unknown")
        
        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            
            log_data = {
                "timestamp": time.time(),
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": round(process_time, 2),
                "ip": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
            }
            
            # Log valid requests as INFO
            logger.info(json.dumps(log_data))
            
            return response
            
        except Exception as e:
            process_time = (time.time() - start_time) * 1000
            log_data = {
                "timestamp": time.time(),
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": 500,
                "duration_ms": round(process_time, 2),
                "error": str(e),
                "type": type(e).__name__
            }
            logger.error(json.dumps(log_data))
            raise e


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Adds security headers to every response.
    """
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        # Note: Content-Security-Policy is omitted intentionally.
        # CSP is for HTML documents, not JSON API responses. Setting it here
        # can interfere with cross-origin XHR requests from the frontend.
        
        return response
