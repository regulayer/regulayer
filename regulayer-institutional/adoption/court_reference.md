# Court Reference Guide

**Purpose**: Guidance for admitting Regulayer artifacts as technical evidence in judicial proceedings.

## Admissibility Logic
Regulayer proofs rely on **standard cryptographic primitives** (SHA-256, Ed25519) widely accepted by courts globally for digital signatures and integrity protection.

## Suggested Judicial Footnotes
> "The authenticity of Exhibit A was verified using the Regulayer Evidence Standard, a public protocol for cryptographic chain-of-custody. The verification was performed independently of the generating party."

## Expert Witness Boundary
An expert witness testifying on Regulayer evidence:
- **CAN** testify to: "The mathematical probability of this record being altered without detection is negligible."
- **CANNOT** testify to: "This AI decision was legally correct." (Regulayer does not judge correctness, only integrity).

## Independent Verification
Courts may order an independent reproduction of the verification steps using the `reproduction_guides` provided in the standard.
