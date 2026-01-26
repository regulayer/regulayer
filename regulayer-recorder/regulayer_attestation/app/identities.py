import json
import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict
from .models import AttestationIdentity
from .errors import IdentityNotFoundError, RevokedIdentityError
from .config import settings

class IdentityRegistry:
    """
    Manages trusted signing identities backed by a JSON file.
    """
    def __init__(self, storage_path: str = None):
        self.storage_path = storage_path or settings.IDENTITIES_FILE
        self._identities: Dict[str, AttestationIdentity] = {}
        self._load()

    def _load(self):
        """Load identities from disk."""
        if not os.path.exists(self.storage_path):
            self._identities = {}
            return

        try:
            with open(self.storage_path, 'r') as f:
                data = json.load(f)
                for item in data:
                    # Parse ISO strings back to datetime if needed, 
                    # but Pydantic handles this automatically from ISO strings
                    identity = AttestationIdentity(**item)
                    self._identities[identity.id] = identity
        except json.JSONDecodeError:
            self._identities = {} 

    def _save(self):
        """Persist identities to disk."""
        data = [identity.model_dump(mode='json') for identity in self._identities.values()]
        with open(self.storage_path, 'w') as f:
            json.dump(data, f, indent=2)

    def register_identity(self, public_key: str, identity_id: Optional[str] = None) -> AttestationIdentity:
        """
        Register a new active signing identity.
        """
        if not identity_id:
            identity_id = str(uuid.uuid4())

        identity = AttestationIdentity(
            id=identity_id,
            public_key=public_key,
            algorithm="Ed25519",
            status="active",
            created_at=datetime.now(timezone.utc)
        )
        self._identities[identity_id] = identity
        self._save()
        return identity

    def get_identity(self, identity_id: str) -> AttestationIdentity:
        """
        Retrieve an identity by ID.
        """
        if identity_id not in self._identities:
            raise IdentityNotFoundError(f"Identity {identity_id} not found")
        return self._identities[identity_id]

    def revoke_identity(self, identity_id: str) -> AttestationIdentity:
        """
        Revoke an identity immediately.
        """
        identity = self.get_identity(identity_id)
        if identity.status == "revoked":
            return identity # Already revoked

        identity.status = "revoked"
        identity.revoked_at = datetime.now(timezone.utc)
        self._identities[identity_id] = identity
        self._save()
        return identity

    def list_identities(self) -> List[AttestationIdentity]:
        return list(self._identities.values())
