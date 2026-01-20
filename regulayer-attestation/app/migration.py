from typing import Dict, Any, Union
from .models import AttestationEnvelope

def is_attested_event(payload: Dict[str, Any]) -> bool:
    """
    Check if the payload is a Phase 2 Attestation Envelope.
    
    Criteria: Must have 'event' and 'attestation' keys.
    """
    return "event" in payload and "attestation" in payload

def parse_incoming_payload(payload: Dict[str, Any]) -> Union[AttestationEnvelope, Dict[str, Any]]:
    """
    Parse payload as either Envelope or legacy event.
    
    Returns:
        AttestationEnvelope: If it's a Phase 2 event
        Dict: If it's a legacy Phase 1 event (raw DecisionEvent)
    """
    if is_attested_event(payload):
         return AttestationEnvelope(**payload)
    else:
         # It's a legacy raw event
         return payload
