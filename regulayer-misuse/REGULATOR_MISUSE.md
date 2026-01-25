# Regulator Misuse Constraints

**Protecting the System from Overreach**

## 1. The "Backdoor" Demand
**Scenario**: Regulator demands a "Master Key" to decrypt all user payloads.
**Regulation**: We cannot. We do not hold customer keys. Payloads are encrypted by customers before recording (if they choose). We verify the *container*, not the *content*.

## 2. The "Retroactive Change" Demand
**Scenario**: Regulator demands we mark a specific past record as "INVALID" because it was illegal.
**Regulation**: We cannot. The math is immutable. We can append a new record saying "The previous record is legally void," but we cannot delete the math.

## 3. The "Censorship" Demand
**Scenario**: Regulator demands we block a specific entity from using the open-source recorder.
**Regulation**: We cannot. The code is open source. We can remove them from our *Trust Registry*, but we cannot stop them from computing hashes.
