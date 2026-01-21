"""
Regulayer Submission - Manifest Generator

Generates deterministic SHA-256 hash manifests for submission packages.

Rules:
- Every file must be hashed
- Hashes must be reproducible
- Manifest itself is the integrity anchor
"""

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict
from uuid import UUID, uuid4

from .models import SubmissionManifest


def hash_file(file_path: Path) -> str:
    """Compute SHA-256 hash of a file."""
    sha256 = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            sha256.update(chunk)
    return sha256.hexdigest()


def hash_content(content: bytes) -> str:
    """Compute SHA-256 hash of bytes."""
    return hashlib.sha256(content).hexdigest()


def hash_string(text: str) -> str:
    """Compute SHA-256 hash of a string."""
    return hashlib.sha256(text.encode()).hexdigest()


class ManifestGenerator:
    """
    Generates SHA-256 hash manifests for submission packages.
    
    The manifest is the single source of truth for package integrity.
    """
    
    def __init__(self):
        self.disclaimer_text = (
            "This submission package proves record integrity and authorship only. "
            "It does not attest to AI correctness, fairness, legality, or compliance."
        )
    
    def generate_manifest(
        self,
        package_dir: Path,
        submission_id: UUID,
        includes_governance: bool = False,
        includes_legacy: bool = False
    ) -> SubmissionManifest:
        """
        Generate a manifest for a package directory.
        
        Walks the directory, hashes all files, and creates the manifest.
        """
        contents: Dict[str, str] = {}
        total_size = 0
        
        # Walk all files except manifest.json itself
        for file_path in package_dir.rglob('*'):
            if file_path.is_file() and file_path.name != 'manifest.json':
                relative_path = file_path.relative_to(package_dir).as_posix()
                contents[relative_path] = hash_file(file_path)
                total_size += file_path.stat().st_size
        
        return SubmissionManifest(
            submission_version="1.0.0",
            submission_id=submission_id,
            generated_at=datetime.now(timezone.utc),
            contents=contents,
            file_count=len(contents),
            total_size_bytes=total_size,
            disclaimer_hash=hash_string(self.disclaimer_text),
            includes_governance=includes_governance,
            includes_legacy_records=includes_legacy
        )
    
    def generate_manifest_from_memory(
        self,
        files: Dict[str, bytes],
        submission_id: UUID,
        includes_governance: bool = False,
        includes_legacy: bool = False
    ) -> SubmissionManifest:
        """
        Generate a manifest from in-memory file contents.
        
        Useful when building packages without writing to disk.
        """
        contents: Dict[str, str] = {}
        total_size = 0
        
        for path, content in files.items():
            if path != 'manifest.json':
                contents[path] = hash_content(content)
                total_size += len(content)
        
        return SubmissionManifest(
            submission_version="1.0.0",
            submission_id=submission_id,
            generated_at=datetime.now(timezone.utc),
            contents=contents,
            file_count=len(contents),
            total_size_bytes=total_size,
            disclaimer_hash=hash_string(self.disclaimer_text),
            includes_governance=includes_governance,
            includes_legacy_records=includes_legacy
        )
    
    def verify_manifest(self, package_dir: Path) -> tuple[bool, list[str]]:
        """
        Verify a package against its manifest.
        
        Returns:
            (is_valid, list of errors)
        """
        manifest_path = package_dir / 'manifest.json'
        if not manifest_path.exists():
            return False, ["manifest.json not found"]
        
        with open(manifest_path, 'r') as f:
            manifest_data = json.load(f)
        
        manifest = SubmissionManifest(**manifest_data)
        errors = []
        
        # Check each file in manifest
        for path, expected_hash in manifest.contents.items():
            file_path = package_dir / path
            if not file_path.exists():
                errors.append(f"Missing file: {path}")
                continue
            
            actual_hash = hash_file(file_path)
            if actual_hash != expected_hash:
                errors.append(f"Hash mismatch: {path}")
        
        # Check for extra files
        for file_path in package_dir.rglob('*'):
            if file_path.is_file() and file_path.name != 'manifest.json':
                relative_path = file_path.relative_to(package_dir).as_posix()
                if relative_path not in manifest.contents:
                    errors.append(f"Extra file not in manifest: {relative_path}")
        
        return len(errors) == 0, errors


# Global manifest generator instance
manifest_generator = ManifestGenerator()
