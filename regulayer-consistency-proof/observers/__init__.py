"""
Regulayer Consistency Proof - Observers

Implements read-only state checks for various system components.
"""
import requests
import os
from typing import Optional

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

class GatewayObserver:
    @staticmethod
    def last_status() -> int:
        # In a real runner, this returns the HTTP code captured by the runner.
        # But here we can also query metrics or logs if available.
        # For this design, the Runner captures the POST response, so this might be redundant
        # unless checking an async status endpoint.
        return 0 # Placeholder for observing internal gateway state if needed.

class RecorderObserver:
    @staticmethod
    def get_decision_state(decision_id: str) -> str:
        try:
            # Check internal debug or admin API
            resp = requests.get(f"{BASE_URL}/v1/internal/debug/decision/{decision_id}", timeout=2)
            if resp.status_code == 200:
                return "found"
            return "not_found"
        except:
            return "unavailable"

class VerifierObserver:
    @staticmethod
    def verify(decision_id: str) -> str:
        try:
            resp = requests.get(f"{BASE_URL}/v1/verify/{decision_id}", timeout=2)
            if resp.status_code == 200 and resp.json().get("status") == "verified":
                return "valid"
            elif resp.status_code == 404:
                return "not_found"
            return "invalid"
        except:
            return "unavailable"

class ExportObserver:
    @staticmethod
    def check_availability(decision_id: str) -> str:
        try:
            resp = requests.head(f"{BASE_URL}/v1/export/{decision_id}", timeout=2)
            if resp.status_code == 200:
                return "found"
            return "not_found"
        except:
            return "unavailable"

class UIObserver:
    @staticmethod
    def check_visibility(decision_id: str) -> str:
        try:
            # UI uses /v1/decisions/{id} (Read-Only)
            resp = requests.get(f"{BASE_URL}/v1/decisions/{decision_id}", timeout=2)
            if resp.status_code == 200:
                return "found"
            return "not_found"
        except:
            return "unavailable"
