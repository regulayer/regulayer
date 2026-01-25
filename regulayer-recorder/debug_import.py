import sys
import os
from unittest.mock import MagicMock

# Fix path to include current dir so 'app' is found
sys.path.append(os.getcwd())

from pydantic import BaseModel
from pydantic import BaseModel
from datetime import datetime

# MOCK pydantic_settings
mock_settings = MagicMock()
class BaseSettings(BaseModel):
    pass
mock_settings.BaseSettings = BaseSettings
sys.modules["pydantic_settings"] = mock_settings

# MOCK
mock_attestation = MagicMock()
mock_models = MagicMock()

class AttestationMetadata(BaseModel):
    algorithm: str
    identity_id: str
    signed_at: datetime

class AttestationEnvelope(BaseModel):
    pass

class AttestationIdentity(BaseModel):
    pass

mock_models.AttestationMetadata = AttestationMetadata
mock_models.AttestationEnvelope = AttestationEnvelope
mock_models.AttestationIdentity = AttestationIdentity

mock_attestation.app = MagicMock()
mock_attestation.app.models = mock_models

sys.modules["regulayer_attestation"] = mock_attestation
sys.modules["regulayer_attestation.app"] = mock_attestation.app
sys.modules["regulayer_attestation.app.models"] = mock_models

try:
    from app.recorder import record_decision
    print("Import SUCCESS")
except Exception as e:
    print(f"Import FAILED: {e}")
    import traceback
    traceback.print_exc()
