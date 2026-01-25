# Anti-Patterns

**Technical Misuses of the Standard**

## 1. Using Proofs as API Keys
**Anti-Pattern**: Using the existence of a valid proof to grant access to a system.
**Risk**: Proofs are public artifacts. Possession does not prove ownership or authorization, only existence.

## 2. Storing Secrets in Payload
**Anti-Pattern**: Recording PII or Secrets in the `canonical_payload` to prove they were used.
**Risk**: Proofs may be shared with courts/auditors. Payloads should be hashed or redacted *before* recording if they contain secrets. Use `salted_hash` of secrets, not secrets themselves.

## 3. Ephemeral Keys
**Anti-Pattern**: Generating a new key for every single record to "enhance privacy".
**Risk**: Makes identity verification impossible. Auditors need to map a Key ID to a known entity. (One key per session/day is fine; one per record is noise).

## 4. Ignoring Revocation
**Anti-Pattern**: Checking signature validity but ignoring the CRL (Certificate Revocation List).
**Risk**: Accepting a proof signed by a stolen key.
