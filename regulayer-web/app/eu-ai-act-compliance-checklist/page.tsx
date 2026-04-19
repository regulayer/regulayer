"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CheckCircle2, AlertTriangle, Clock, ArrowRight, FileText, Scale, Users, Database, Shield, Eye } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const checklistSections = [
  {
    phase: "Phase 1",
    title: "AI System Classification & Risk Assessment",
    deadline: "Immediate",
    icon: Scale,
    color: "hsl(15,85%,58%)",
    description: "Before any compliance work begins, you must classify every AI system in your organization by risk level. The EU AI Act defines four risk tiers: Unacceptable (banned), High-Risk (strict obligations), Limited Risk (transparency obligations), and Minimal Risk (voluntary codes). Most enterprise AI applications — including credit scoring, hiring tools, medical diagnostics, and insurance underwriting — fall into the High-Risk category.",
    items: [
      { task: "Inventory all AI systems deployed across the organization", detail: "Create a comprehensive register of every AI-powered system, including third-party AI APIs (OpenAI, Anthropic, Google), internal ML models, and embedded AI features. Document the purpose, data inputs, decision types, and affected populations for each system." },
      { task: "Classify each system using Annex III risk categories", detail: "Map each AI system against the EU AI Act's Annex III high-risk categories: biometrics, critical infrastructure, education, employment, essential services, law enforcement, migration, and justice. Systems falling into these categories trigger the full compliance obligation set." },
      { task: "Identify prohibited AI practices under Article 5", detail: "Verify that no deployed systems engage in prohibited practices: social scoring, real-time biometric identification in public spaces (with limited exceptions), subliminal manipulation, or exploitation of vulnerabilities. Prohibited systems must be decommissioned before August 2026." },
      { task: "Document the intended purpose for each high-risk system", detail: "The EU AI Act requires that high-risk AI systems operate strictly within their documented intended purpose. Any use outside this scope constitutes a new deployment requiring fresh conformity assessment." },
    ]
  },
  {
    phase: "Phase 2",
    title: "Technical Record-Keeping (Article 12)",
    deadline: "Before Deployment",
    icon: Database,
    color: "hsl(200,80%,50%)",
    description: "Article 12 mandates that high-risk AI systems maintain automatic logging capabilities sufficient to ensure traceability of the system's functioning throughout its lifecycle. This is not optional post-hoc logging — it must be architecturally embedded into the system design. Logs must be tamper-proof, chronologically ordered, and retained for the duration specified by applicable sector legislation.",
    items: [
      { task: "Implement automated logging for every AI inference", detail: "Every input prompt, model output, confidence score, and metadata parameter must be captured automatically. Manual logging is insufficient — the system must generate records without human intervention." },
      { task: "Ensure log immutability with cryptographic guarantees", detail: "Standard database logs are legally insufficient because they can be retroactively modified. Implement Write-Once-Read-Many (WORM) storage with SHA-256 hash chaining to create mathematically tamper-proof records. Regulayer implements this natively." },
      { task: "Establish retention periods based on sector requirements", detail: "Financial services typically require 5-7 year retention. Healthcare may require 10+ years. Configure your logging infrastructure to retain records for the applicable period without possibility of premature deletion." },
      { task: "Implement digital signatures on audit records", detail: "Use Ed25519 or equivalent elliptic curve signatures to create non-repudiation guarantees. Every record should be signed with a verifiable key, traceable to the signing entity. This transforms logs into court-admissible forensic evidence." },
    ]
  },
  {
    phase: "Phase 3",
    title: "Human Oversight Mechanisms (Article 14)",
    deadline: "Before Deployment",
    icon: Users,
    color: "hsl(150,60%,40%)",
    description: "Article 14 requires that high-risk AI systems are designed and developed to allow effective human oversight during the period in which they are used. Human oversight must enable the natural person to: fully understand the AI system's capabilities and limitations; correctly interpret outputs; decide not to use the system or override its output; and intervene or interrupt the system's operation.",
    items: [
      { task: "Design Human-in-the-Loop (HITL) governance workflows", detail: "Create structured review queues where compliance officers can examine flagged AI decisions. Each queue entry must present the full context: input prompt, AI output, triggering policy rule, risk assessment, and metadata. Officers must be able to approve, reject, annotate, or escalate." },
      { task: "Define clear escalation procedures for high-risk decisions", detail: "Not all decisions carry equal risk. Define tiered escalation: junior reviewers handle routine flags, senior compliance officers handle high-severity cases, and C-suite or legal counsel handles critical incidents. Document decision authority at each tier." },
      { task: "Ensure override capability — humans must be able to stop the AI", detail: "The system must provide a mechanism for authorized personnel to immediately halt AI operations, override automated decisions, and revert to manual processes. This is not a theoretical capability — it must be tested and documented." },
      { task: "Train designated human overseers on AI system capabilities and limitations", detail: "Article 14(4) requires that human overseers understand the AI system well enough to correctly interpret its outputs. Implement mandatory training programs documenting AI system behavior, known failure modes, and appropriate intervention protocols." },
    ]
  },
  {
    phase: "Phase 4",
    title: "Conformity Assessment & Documentation (Articles 43-49)",
    deadline: "Before Market Placement",
    icon: FileText,
    color: "hsl(280,70%,55%)",
    description: "Before a high-risk AI system is placed on the market or put into service, it must undergo a conformity assessment procedure. For most high-risk AI systems, providers can perform internal conformity assessments following Annex VI procedures. Systems involving biometrics or critical infrastructure may require third-party conformity assessment by notified bodies.",
    items: [
      { task: "Prepare comprehensive technical documentation (Annex IV)", detail: "Compile complete technical documentation covering: system description, intended purpose, design specifications, development methodology, data governance practices, monitoring provisions, accuracy metrics, cybersecurity measures, and known limitations." },
      { task: "Conduct or commission a Fundamental Rights Impact Assessment (Article 27)", detail: "Deployers of high-risk AI systems must assess the system's potential impact on fundamental rights including non-discrimination, privacy, freedom of expression, human dignity, and access to effective remedies. This assessment must be completed before deployment and updated when significant changes occur." },
      { task: "Generate EU Declaration of Conformity (Article 47)", detail: "The provider must draw up a written EU declaration of conformity for each AI system, stating that the system meets all applicable requirements. This declaration must be kept up to date and made available to national competent authorities for 10 years." },
      { task: "Register in the EU database for high-risk AI systems (Article 71)", detail: "Before placing a high-risk AI system on the market, providers must register the system and its conformity information in the EU database established under Article 71. This registration is publicly accessible." },
    ]
  },
  {
    phase: "Phase 5",
    title: "Ongoing Monitoring & Post-Market Surveillance",
    deadline: "Continuous",
    icon: Eye,
    color: "hsl(35,85%,50%)",
    description: "Compliance is not a one-time event. The EU AI Act requires continuous post-market monitoring throughout the AI system's lifecycle. Providers must establish proportionate post-market monitoring systems to actively collect, document, and analyze data on system performance. Any serious incidents or malfunctions must be reported to national authorities.",
    items: [
      { task: "Implement continuous accuracy and performance monitoring", detail: "Track model drift, accuracy degradation, and behavioral changes over time. Establish statistical baselines and alert thresholds. When performance degrades below documented specifications, trigger remediation procedures." },
      { task: "Establish serious incident reporting procedures (Article 62)", detail: "Providers must report serious incidents to market surveillance authorities within 15 days of becoming aware. Define incident classification criteria, reporting workflows, and designated responsible personnel." },
      { task: "Maintain and update technical documentation continuously", detail: "Technical documentation must reflect the current state of the AI system. Any significant modification triggers an obligation to update documentation and potentially repeat the conformity assessment." },
      { task: "Implement automated compliance reporting cadence", detail: "Generate periodic conformity assessment updates, performance reports, and governance summaries. Regulayer automates this entirely — generating ISO 42001-aligned reports from operational telemetry without manual preparation." },
    ]
  },
];

export default function ChecklistPage() {
  return (
    <div className="min-h-screen bg-[hsl(30,60%,99%)] text-[hsl(15,45%,15%)] antialiased">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-16 lg:pt-44 lg:pb-20 border-b border-[hsl(15,30%,85%)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(hsl(15,45%,15%) 1px, transparent 1px), linear-gradient(90deg, hsl(15,45%,15%) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-5xl mx-auto px-6 lg:px-10 relative z-10">
          <span className="text-[11px] font-mono tracking-[0.2em] text-[hsl(15,30%,45%)] uppercase mb-6 block">Enterprise Compliance Guide</span>
          <h1 className="text-[clamp(2.2rem,4.5vw,4rem)] font-bold tracking-tight leading-[1.05] mb-6" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            EU AI Act compliance<br/>
            <span className="premium-serif-italic font-light text-[hsl(15,85%,58%)]">checklist for 2026.</span>
          </h1>
          <p className="text-[18px] text-[hsl(15,25%,45%)] leading-relaxed max-w-2xl font-light mb-8">
            The complete, step-by-step implementation checklist for EU AI Act compliance. Covering Articles 5, 9, 12, 14, 27, 43, 47, 62, and 71 — every requirement your CISO, CTO, and Chief Compliance Officer needs to satisfy before August 2026 enforcement.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[13px] font-bold text-red-600 bg-red-50 border border-red-200 px-4 py-2">
              <AlertTriangle className="w-4 h-4" />
              Enforcement deadline: August 2026
            </div>
            <div className="flex items-center gap-2 text-[13px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2">
              <Clock className="w-4 h-4" />
              {Math.ceil((new Date('2026-08-02').getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
            </div>
          </div>
        </div>
      </section>

      {/* Checklist */}
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 space-y-16">
          {checklistSections.map((section, si) => (
            <motion.div
              key={si}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${section.color}15`, border: `1px solid ${section.color}30` }}>
                  <section.icon className="w-6 h-6" style={{ color: section.color }} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[11px] font-mono text-[hsl(15,30%,50%)] uppercase tracking-wider">{section.phase}</span>
                    <span className="text-[10px] font-mono text-white px-2 py-0.5" style={{ background: section.color }}>{section.deadline}</span>
                  </div>
                  <h2 className="text-[24px] font-bold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>{section.title}</h2>
                </div>
              </div>

              <p className="text-[15px] text-[hsl(15,25%,40%)] leading-[1.8] mb-8 ml-16">{section.description}</p>

              <div className="space-y-4 ml-16">
                {section.items.map((item, ii) => (
                  <div key={ii} className="border border-[hsl(15,30%,85%)] bg-white p-6 hover:border-[hsl(15,85%,58%,0.3)] transition-colors group">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[hsl(15,30%,70%)] group-hover:text-emerald-500 transition-colors flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-[15px] font-bold text-[hsl(15,45%,15%)] mb-2">{item.task}</h3>
                        <p className="text-[13px] text-[hsl(15,25%,45%)] leading-[1.75]">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Automate Banner */}
      <section className="py-16 bg-[hsl(15,45%,15%)] text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-bold tracking-tight mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Automate this entire checklist.
          </h2>
          <p className="text-[16px] text-white/70 mb-8 max-w-2xl mx-auto">
            Regulayer implements every requirement on this checklist as automated infrastructure. Article 12 record-keeping, Article 14 human oversight, conformity assessments, and FRIA generation — all running continuously without manual effort.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[hsl(15,85%,58%)] text-white text-sm font-bold tracking-wide hover:bg-[hsl(15,85%,50%)] transition-colors">
              Start Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/architecture" className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/20 text-sm font-bold tracking-wide hover:bg-white/10 transition-colors">
              View Architecture
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
