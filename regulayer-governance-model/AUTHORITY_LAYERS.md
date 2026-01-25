# Authority Layers

**Separation of Concerns and Power**

| Layer | Responsible Party | Can Do | NEVER Can Do |
| :--- | :--- | :--- | :--- |
| **Mathematical** | The Protocol | Verify hashes, signatures, chains | Interpret intent, lie |
| **Specification** | The Standard (Frozen) | Define formats, freeze semantics | Change meanings retroactively |
| **Governance** | The Body (DAO/Board) | Approve new Spec versions (v2) | Override verification results |
| **Company** | Regulayer Inc. | Implement software, sell services | Change trust semantics silently |
| **Users** | Customers | Submit data, manage their keys | Alter history once committed |
| **Courts** | Legal System | Interpret evidence for law | Change the cryptography |

## The Non-Interference Rule
Lower layers cannot be overridden by higher layers regarding facts.
- The Company cannot force the Math to validate a forgery.
- The Courts cannot order the Specification to change 2+2 to 5.
