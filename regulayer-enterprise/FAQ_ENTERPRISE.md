# Enterprise FAQ

## Frequently Asked Questions

### Data & Privacy

**Q: Can you see our data?**
A: We process your decision payloads to hash them, but we do not inspect, analyze, or store the semantic content. Think of it like a post office - we handle the envelope, not the letter.

**Q: Where is our data stored?**
A: You choose your region (US, EU, APAC). Data residency is enforced at ingestion and storage layers.

**Q: Can we delete data?**
A: Regulayer is append-only by design. For compliance needs, we offer cryptographic tombstoning - the fact that a decision existed remains, but content is removed.

---

### Reliability

**Q: What if Regulayer goes down?**
A: Your existing proofs remain valid. They're self-contained and verify offline. New ingestion queues until recovery.

**Q: Do you have an SLA?**
A: Yes. Enterprise plans include 99.9% availability SLA with credits for downtime.

**Q: What about disaster recovery?**
A: Multi-region replication, daily backups, and deterministic replay capability.

---

### Security

**Q: What if keys are compromised?**
A: Revoke immediately via Control Plane. Revocation is logged and affects future requests only. Past proofs remain valid.

**Q: Is SOC2 certified?**
A: SOC2 Type II audit in progress. Contact us for current security review materials.

**Q: Penetration testing?**
A: Annual third-party pentests. Reports available under NDA.

---

### Integration

**Q: How long to integrate?**
A: Most customers have first decision recorded in under 1 hour. Full production rollout typically 1-2 weeks.

**Q: Do you support our language/framework?**
A: Python and Node.js SDKs available. REST API works with any language.

**Q: Can we self-host?**
A: Dedicated VPC and hybrid options available for Enterprise plans.

---

### Trust

**Q: What survives forever?**
A: Exported proof bundles are eternal. They contain everything needed for verification - no Regulayer dependency.

**Q: Can you tamper with our records?**
A: Tampering is mathematically detectable. Any modification breaks the hash chain - visible to anyone with the proof.

**Q: Who do courts trust - you or the proof?**
A: The proof. It's cryptographically self-verifying. Our testimony isn't required.
