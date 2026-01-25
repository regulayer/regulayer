# Burden of Proof

**Allocation of Responsibility in Disputes**

## Presumption of Regularity
A record that verifies as **VALID** is presumed to be authentic and unaltered. The burden to prove otherwise rests on the challenger.

## Claims & Burdens

### Claim: "This record was forged."
**Burden**: The Claimant must produce a mathematical proof of forgery (e.g., a hash collision or a private key leak demonstration) OR prove that the Authoritative Key list was compromised *before* the record timestamp.

### Claim: "This verification tool is broken."
**Burden**: The Claimant must demonstrate the failure using the `regulayer-reproduction` independent scripts. If the open-source script verifies it, the tool is presumed correct.

### Claim: "This decision never happened."
**Burden**: If a valid Chain Record exists, the Claimant must explain how a signed, chained, timestamped record exists for a non-event. The existence of the record allows the assumption that the event was logged.
