# Decision Process

**How the Standard Evolves**

## The RFC Cycle
1.  **Draft**: Proposal submitted to repository. Must include "Impact Analysis" and "Class Classification".
2.  **Review**: 30-day public comment period.
    - Security Audit Required for Class 1.
    - Backward Compatibility Check Required.
3.  **Ratification**: Governance Body votes.
    - Pass requires Supermajority (66%).
4.  **Implementation**: Validated against `regulayer-reproduction` suite.

## The "No Panic" Rule
There is no "Emergency Process" that allows bypassing Classification.
Even in a security crisis, changes must be classified. If a fix breaks V1 semantics (Class X), it must be released as V2, not a patch to V1.
