# Fork Policy

**Encouraging Resilience through Redundancy**

## Right to Fork
The community allows and ENCOURAGES independent implementations of the Recorder and Verifier.
- You do NOT need permission to build a Regulayer-compatible system.
- You DO need to adhere to the spec to claim compatibility.

## Official vs. Compatible
- **Official**: Maintained by Regulayer Inc.
- **Compatible**: Passes the `regulayer-reproduction` test suite.

## Anti-Lock-in
We actively document how to migrate away from Regulayer Cloud to a self-hosted or forked instance.

## Trust Model Identity
Any fork that changes the verification logic MUST change the `trust_model_id` in the proof bundle.
- **regulayer-std-v1**: The official strict standard.
- **[fork-name]-v1**: Divergent standards.
Attempting to use `regulayer-std` ID with modified semantics is considered **Fraud**.
