# Jurisdictional Seizure

**Event**: A government orders Regulayer to alter records or breaks encryption keys via subpoena.

**Defense Mechanisms**:
1.  **Crypto-Shredding**: Regulayer cannot decrypt customer data if we don't hold the customer's data encryption keys (standard practice).
2.  **Hash Pre-Image Resistance**: We hold hashes, not data. We cannot "produce" the record content if we don't have it.
3.  **Warrant Canary**: We publish a transparency report. If we are forced to sign a fake root, the community fork policy activates.

**Trust Verdict**: Seizure can stop the service, but it cannot falsify the history without detection.
