# Press Q&A

## Purpose

Prepared answers for hostile press and public questions.
All answers are calm, technically accurate, non-defensive, and trust-preserving.

---

## Core Questions

### "What is Regulayer?"

> "Regulayer creates cryptographic records of AI decisions.
> Organizations use it to document what their AI systems did, when, and verify that
> the records haven't been tampered with. The evidence can be verified
> independently, offline, without trusting us."

### "Are you regulating AI?"

> "No. We don't regulate anything.
> We provide tools that help organizations document AI decisions.
> Regulation is what governments and regulators do.
> We help provide evidence they might need."

### "Is this surveillance?"

> "Regulayer records decisions that organizations choose to record.
> It's their own AI systems, documenting their own actions.
> Think of it like a secure audit log, not surveillance.
> Organizations control what gets recorded."

### "Are you replacing auditors?"

> "No. Auditors examine evidence and make professional judgments.
> We provide evidence for auditors to examine.
> We're tools for auditors, not replacements."

### "Is this blockchain?"

> "No. It uses similar cryptographic techniques—hashing, digital signatures.
> But there's no cryptocurrency, no mining, no token.
> It's a straightforward append-only chain with attestations."

---

## Skeptical Questions

### "What if Regulayer is hacked?"

> "We take security seriously and implement industry-standard protections.
> But even in a worst-case scenario, proofs that customers have exported
> remain valid. Verification is offline and doesn't depend on our systems.
> The cryptographic guarantees survive even if we don't."

### "Can you fake the evidence?"

> "The evidence is cryptographically signed with keys that customers can verify.
> Creating fake evidence would require either:
> 1. Stealing our signing keys (we have controls for that), or
> 2. Breaking the cryptography (SHA-256, Ed25519—industry standard)
> 
> Any tampering is mathematically detectable."

### "What if a customer lies about what they recorded?"

> "We record exactly what customers send us.
> If they send false data, we record false data.
> We prove what was recorded, not whether it's true.
> That's the same as any audit trail—garbage in, garbage out."

### "Can companies hide behind this?"

> "Regulayer makes decisions more visible, not less.
> It creates evidence that can be examined by regulators and courts.
> Hiding becomes harder when there's a cryptographic trail."

### "Isn't this just CYA for companies?"

> "Documentation is a normal part of business.
> What's different here is that the documentation is verifiable by third parties.
> Regulators can check it themselves. Courts can examine it.
> It's harder to lie when the evidence is independently checkable."

---

## Technical Questions

### "What cryptography do you use?"

> "SHA-256 for hashing, Ed25519 for signatures.
> These are industry-standard algorithms used in TLS, SSH, and secure messaging.
> We follow RFC 8785 for JSON canonicalization."

### "Can I verify this myself?"

> "Yes. We publish an offline verifier and the source code.
> You can also implement your own verifier—we document the format.
> No trust in Regulayer required for verification."

### "What happens when the cryptography becomes obsolete?"

> "We're prepared for cryptographic aging.
> We use long-term timestamping and plan for algorithm migration.
> Evidence recorded today will remain verifiable with historical algorithms."

---

## Business Questions

### "Who are your customers?"

> "Organizations in regulated industries—financial services, healthcare, insurance.
> Also technology companies deploying AI in high-stakes environments.
> Anyone who might face questions about their AI decisions."

### "How do you make money?"

> "Subscription pricing based on volume and features.
> We're a SaaS business. No hidden fees, no surprises."

### "Are you profitable?"

> "[Answer based on actual status—be honest, brief]"

---

## Hostile Questions

### "Aren't you just enabling bad actors?"

> "Regulayer creates evidence that can be examined by regulators and courts.
> That actually makes it harder to hide bad behavior.
> We're building transparency infrastructure, not a hiding mechanism."

### "What happens when a Regulayer customer does something terrible?"

> "The evidence they recorded is still evidence.
> If they recorded the decision, investigators can examine it.
> If they didn't record it, that's on them, not us.
> We don't make moral judgments about customers—we provide tools."

### "Isn't AI governance just theater?"

> "There's genuine regulatory interest in AI accountability.
> The EU AI Act, US executive orders, industry self-regulation—all require documentation.
> Whether that's 'theater' is a policy debate. We provide the tools."

### "Why should I trust you?"

> "You don't have to.
> The verification is offline and independent.
> You can check the evidence yourself.
> We've explicitly designed this so you don't need to trust us."

---

## Guiding Principles

When answering press questions:

1. **Be calm** — Never defensive
2. **Be precise** — Technical accuracy matters
3. **Be modest** — Don't overclaim
4. **Redirect to verification** — "You can check it yourself"
5. **Acknowledge limitations** — We don't prevent, we record

---

## Version

| Field | Value |
|-------|-------|
| Document Version | 1.0.0 |
| Last Updated | 2026-01-25 |
</Parameter>
<parameter name="Complexity">7
