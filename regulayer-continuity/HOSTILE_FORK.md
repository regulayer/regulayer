# Hostile Fork Scenario

**Event**: A group forks Regulayer to implement backdoor access or weaken standards.

**Response**:
1.  **Trust Model ID**: The official standard uses strict Trust Model IDs. A fork must use a new ID.
2.  **Reputation Defense**: We publish cryptographic proofs showing the fork fails the `regulayer-reproduction` suite or weakens security.
3.  **Root Key Isolation**: The hostile fork cannot sign with the original Regulayer Root CA keys. They must establish their own root of trust.

**Trust Verdict**: Diversity is allowed. Impersonation is prevented by Root CA uniqueness.
