"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArrowRight, Building2, HeartPulse, Shield, Landmark, CreditCard, Scale } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const useCases = [
  {
    icon: Building2,
    industry: "Banking & Financial Services",
    headline: "Eliminate Algorithmic Lending Bias Before It Reaches Borrowers",
    challenge: "Banks deploying AI for credit scoring, loan underwriting, and fraud detection face extreme regulatory exposure. A single discriminatory lending decision can trigger ECOA violations, CFPB enforcement actions, and now EU AI Act Article 71 penalties of up to €35 million. Traditional model monitoring only logs bias after the borrower has already been impacted.",
    solution: "Regulayer intercepts every credit decision at the network layer before it reaches the applicant. Our policy engine evaluates outputs against fair lending rules in real-time. If demographic bias patterns are detected, the decision is automatically sequestered to the compliance team's HITL governance queue for human review — with full cryptographic evidence for regulatory examination.",
    compliance: ["EU AI Act Article 6 (High-Risk Classification)", "ECOA / Regulation B", "GDPR Article 22 (Automated Decision-Making)", "Basel III Operational Risk"],
    metric: "€35M",
    metricLabel: "Maximum EU AI Act penalty for unmanaged algorithmic bias in financial services",
    color: "hsl(15,85%,58%)",
  },
  {
    icon: HeartPulse,
    industry: "Healthcare & Life Sciences",
    headline: "Secure AI-Assisted Clinical Decisions with Court-Admissible Audit Trails",
    challenge: "Healthcare organizations using AI for diagnostic triage, treatment recommendations, and drug interaction analysis need absolute certainty that every AI-assisted clinical decision is recorded with forensic-grade evidence. HIPAA mandates strict data handling, while the EU AI Act classifies medical AI as unambiguously high-risk requiring mandatory human oversight.",
    solution: "Regulayer deploys as an air-gapped proxy within hospital VPC infrastructure, ensuring no patient data leaves the secure perimeter. Every AI inference is cryptographically sealed with SHA-256 hash chains and Ed25519 signatures, creating tamper-proof medical decision audit trails. HITL governance queues ensure clinician review of high-risk diagnostic recommendations.",
    compliance: ["HIPAA / HITECH Act", "EU AI Act Annex III (Medical Devices)", "FDA AI/ML Software as Medical Device (SaMD)", "ISO 13485 Medical Device QMS"],
    metric: "100%",
    metricLabel: "Air-gapped VPC deployment — zero patient data leaves the hospital network",
    color: "hsl(200,80%,50%)",
  },
  {
    icon: Shield,
    industry: "Insurance & Underwriting",
    headline: "Prevent Discriminatory Underwriting Decisions in Real-Time",
    challenge: "Insurers using AI models for risk assessment, claims processing, and premium calculation face growing scrutiny from regulators concerned about algorithmic discrimination. AI systems may inadvertently use protected characteristics (age, disability, ethnicity) as proxy variables when computing risk scores, exposing insurers to anti-discrimination litigation and regulatory sanctions.",
    solution: "Regulayer's policy engine monitors insurance AI outputs for proxy discrimination patterns and protected characteristic inference. When potentially discriminatory underwriting decisions are detected, they are automatically held in the governance queue for actuarial review. All decisions, approvals, and overrides are sealed into WORM-compliant storage for audit examination.",
    compliance: ["EU AI Act Article 6 (Insurance as High-Risk)", "Solvency II Operational Risk", "Insurance Distribution Directive (IDD)", "National Anti-Discrimination Laws"],
    metric: "99%",
    metricLabel: "Compliant decisions auto-approved instantly — only anomalies require human review",
    color: "hsl(280,70%,55%)",
  },
  {
    icon: Landmark,
    industry: "Government & Public Sector",
    headline: "Mandatory FRIA Generation for Public Sector AI Deployment",
    challenge: "Government agencies deploying AI for citizen services, law enforcement, or social welfare must complete Fundamental Rights Impact Assessments (FRIA) under EU AI Act Article 27 before deployment. These assessments traditionally require hundreds of hours of manual analysis, creating massive bottlenecks for digital transformation initiatives.",
    solution: "Regulayer automatically generates Fundamental Rights Impact Assessments from operational governance data. Every AI decision interacting with citizens is logged with full context, reviewed through HITL queues when necessary, and compiled into regulatory-ready FRIA documentation. Elected officials and oversight committees can audit AI behavior with complete transparency.",
    compliance: ["EU AI Act Article 27 (FRIA)", "EU AI Act Article 26 (Deployer Obligations)", "Public Sector Equality Duty", "Administrative Procedure Act"],
    metric: "400hrs",
    metricLabel: "Manual FRIA preparation time eliminated through automated telemetry compilation",
    color: "hsl(150,60%,40%)",
  },
  {
    icon: CreditCard,
    industry: "Fintech & Payment Processing",
    headline: "Scale AI-Powered Fraud Detection Without Compliance Liability",
    challenge: "Fintech companies processing millions of transactions per day rely on AI for real-time fraud detection, KYC verification, and transaction scoring. These systems must operate at sub-second latency while maintaining complete regulatory compliance. PSD2 Strong Customer Authentication and EU AI Act requirements create overlapping compliance obligations that most observability tools cannot satisfy.",
    solution: "Regulayer's sub-20ms proxy operates at payment processing speed, evaluating every fraud detection decision against compliance policies without introducing latency. False positives that could unfairly block legitimate customers are automatically routed to human review. Transaction decision audit trails satisfy both PSD2 and EU AI Act record-keeping requirements simultaneously.",
    compliance: ["PSD2 / Strong Customer Authentication", "EU AI Act Article 12 (Record-Keeping)", "AML / KYC Directive", "PCI DSS Requirement 10"],
    metric: "18ms",
    metricLabel: "Average proxy latency — invisible to payment processing pipelines",
    color: "hsl(35,85%,50%)",
  },
  {
    icon: Scale,
    industry: "Legal & Professional Services",
    headline: "Ensure AI-Generated Legal Research Meets Professional Standards",
    challenge: "Law firms and legal technology platforms increasingly use AI for contract analysis, case research, and document review. AI hallucinations in legal contexts can result in filing fabricated case citations, malpractice liability, and bar disciplinary proceedings. Legal professionals need certainty that AI-generated work product has been verified before being submitted to courts.",
    solution: "Regulayer's policy engine evaluates AI-generated legal content against configurable accuracy thresholds. Outputs flagged for potential hallucination or factual inconsistency are automatically held for attorney review through the governance queue. Every AI-assisted legal opinion is sealed with Ed25519 signatures, creating professional accountability records.",
    compliance: ["EU AI Act Article 14 (Human Oversight)", "ABA Model Rules of Professional Conduct", "SRA Code of Conduct", "ISO/IEC 42001:2023"],
    metric: "0",
    metricLabel: "Hallucinated case citations reaching court filings with Regulayer active",
    color: "hsl(0,70%,50%)",
  },
];

export default function UseCasesPage() {
  return (
    <div className="min-h-screen bg-[hsl(30,60%,99%)] text-[hsl(15,45%,15%)] antialiased">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-16 lg:pt-44 lg:pb-20 border-b border-[hsl(15,30%,85%)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(hsl(15,45%,15%) 1px, transparent 1px), linear-gradient(90deg, hsl(15,45%,15%) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-5xl mx-auto px-6 lg:px-10 relative z-10">
          <span className="text-[11px] font-mono tracking-[0.2em] text-[hsl(15,30%,45%)] uppercase mb-6 block">Industry Use Cases</span>
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-tight leading-[1.05] mb-6" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            AI compliance for<br/>every <span className="premium-serif-italic font-light text-[hsl(15,85%,58%)]">regulated industry.</span>
          </h1>
          <p className="text-[18px] text-[hsl(15,25%,45%)] leading-relaxed max-w-2xl font-light">
            From banking to healthcare, every industry deploying AI faces unique regulatory obligations. Regulayer adapts to your specific compliance requirements with configurable policy engines and industry-specific governance workflows.
          </p>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 space-y-12">
          {useCases.map((uc, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.6 }}
              className="border border-[hsl(15,30%,85%)] bg-white group hover:border-[hsl(15,85%,58%,0.3)] transition-colors"
            >
              <div className="grid lg:grid-cols-3">
                {/* Left: Content */}
                <div className="lg:col-span-2 p-8 lg:p-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${uc.color}15`, border: `1px solid ${uc.color}30` }}>
                      <uc.icon className="w-5 h-5" style={{ color: uc.color }} />
                    </div>
                    <span className="text-[12px] font-mono text-[hsl(15,30%,50%)] tracking-wide uppercase">{uc.industry}</span>
                  </div>

                  <h2 className="text-[22px] lg:text-[26px] font-bold tracking-tight leading-[1.2] mb-4 group-hover:text-[hsl(15,85%,58%)] transition-colors" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    {uc.headline}
                  </h2>

                  <div className="mb-6">
                    <h3 className="text-[11px] font-mono text-[hsl(15,30%,50%)] uppercase tracking-wider mb-2">The Challenge</h3>
                    <p className="text-[14px] text-[hsl(15,25%,40%)] leading-[1.75] font-light">{uc.challenge}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-[11px] font-mono text-[hsl(15,85%,58%)] uppercase tracking-wider mb-2">The Solution</h3>
                    <p className="text-[14px] text-[hsl(15,25%,35%)] leading-[1.75]">{uc.solution}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {uc.compliance.map((c, j) => (
                      <span key={j} className="text-[11px] font-mono text-[hsl(15,30%,45%)] bg-[hsl(30,60%,97%)] border border-[hsl(15,30%,90%)] px-3 py-1">{c}</span>
                    ))}
                  </div>
                </div>

                {/* Right: Metric */}
                <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-[hsl(15,30%,85%)] bg-[hsl(30,60%,98%)] p-8 lg:p-12 flex flex-col justify-center items-center text-center">
                  <div className="text-[56px] lg:text-[72px] font-bold tracking-tight leading-none mb-3" style={{ color: uc.color, fontFamily: "var(--font-space-grotesk)" }}>
                    {uc.metric}
                  </div>
                  <div className="text-[12px] text-[hsl(15,25%,45%)] font-light leading-relaxed max-w-[200px]">{uc.metricLabel}</div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-[hsl(15,30%,85%)]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-bold tracking-tight mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Your industry.<br/><span className="font-light text-[hsl(15,25%,45%)]">Your compliance requirements.</span>
          </h2>
          <p className="text-[16px] text-[hsl(15,25%,45%)] mb-8 font-light">Talk to our team about deploying Regulayer for your specific regulatory framework.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[hsl(15,45%,15%)] text-white text-sm font-bold tracking-wide hover:bg-[hsl(15,85%,58%)] transition-colors">
              Contact Sales <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/glossary" className="inline-flex items-center gap-2 px-8 py-3.5 border border-[hsl(15,30%,85%)] text-sm font-bold tracking-wide hover:bg-white transition-colors">
              AI Compliance Glossary
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
