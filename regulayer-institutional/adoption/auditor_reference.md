# Auditor Reference Guide

**Purpose**: Guidelines for IT and Financial Auditors relying on Regulayer for control testing.

## Audit Objective
To obtain reasonable assurance that AI system outputs have not been manipulated between generation and review.

## Audit Assertions Supported
1. **Integrity**: The recorded output matches the generated output (SHA-256 match).
2. **Timing**: The event occurred at or before the timestamp (Time Anchor verification).
3. **Non-Repudiation**: The specific system identity signed the record (Key Attestation).

## Limitations
- Regulayer does **not** verify the quality of the data *before* it was recorded (Garbage In, Garbage Out).
- Regulayer does **not** verify that the AI model logic is sound.

## Documentation
Auditors should cite specific **Snapshot IDs** and **Verification Timestamps** in their working papers.
