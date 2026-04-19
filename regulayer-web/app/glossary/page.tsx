"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Search, BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";

const glossaryTerms = [
  {
    term: "EU AI Act",
    slug: "eu-ai-act",
    category: "Regulation",
    definition: "The European Union Artificial Intelligence Act (Regulation (EU) 2024/1689) is the world's first comprehensive legal framework governing the development, deployment, and use of artificial intelligence systems. It classifies AI systems by risk level — from minimal to unacceptable — and imposes strict obligations on providers and deployers of high-risk AI systems, including mandatory conformity assessments, human oversight requirements, and transparency obligations.",
    keyArticles: "Articles 6, 9, 12, 14, 71",
    penalty: "Up to €35 million or 7% of global annual turnover",
    relevance: "Regulayer provides automated Article 12 record-keeping and Article 14 Human-in-the-Loop governance to satisfy EU AI Act obligations before the August 2026 enforcement deadline."
  },
  {
    term: "AI Risk Management",
    slug: "ai-risk-management",
    category: "Framework",
    definition: "AI Risk Management is the systematic process of identifying, assessing, mitigating, and monitoring risks associated with artificial intelligence systems throughout their lifecycle. This includes algorithmic bias detection, hallucination prevention, data leakage protection, and ensuring that automated decisions do not cause harm to individuals or organizations. Effective AI risk management requires both technical controls (such as real-time inference monitoring) and organizational measures (such as governance committees and compliance officers).",
    keyArticles: "NIST AI RMF, ISO/IEC 42001:2023",
    penalty: "Varies by jurisdiction; EU AI Act imposes up to €35M",
    relevance: "Regulayer acts as the technical enforcement layer for AI risk management, intercepting violating inferences at the network level before they reach end users."
  },
  {
    term: "ISO/IEC 42001:2023",
    slug: "iso-42001",
    category: "Certification",
    definition: "ISO/IEC 42001:2023 is the international standard for Artificial Intelligence Management Systems (AIMS). Published by the International Organization for Standardization, it provides a framework for organizations to establish, implement, maintain, and continually improve their AI management systems. It addresses AI-specific risks including bias, transparency, accountability, and data governance. Certification to ISO 42001 demonstrates that an organization has implemented systematic controls over its AI operations.",
    keyArticles: "Clauses 4-10, Annex A, Annex B",
    penalty: "No direct penalty; required for enterprise vendor procurement",
    relevance: "Regulayer automatically generates ISO 42001-aligned conformity documentation from real-time operational telemetry, eliminating the need for manual audit preparation."
  },
  {
    term: "NIST AI Risk Management Framework",
    slug: "nist-ai-rmf",
    category: "Framework",
    definition: "The NIST AI Risk Management Framework (AI RMF 1.0), published by the U.S. National Institute of Standards and Technology in January 2023, provides voluntary guidance for managing risks associated with AI systems. It is structured around four core functions: Govern, Map, Measure, and Manage. The framework emphasizes trustworthy AI characteristics including validity, reliability, safety, security, accountability, transparency, explainability, privacy, and fairness.",
    keyArticles: "Core Functions: Govern, Map, Measure, Manage",
    penalty: "Voluntary framework; increasingly referenced in procurement requirements",
    relevance: "Regulayer's policy engine and governance workflows map directly to NIST AI RMF's Govern and Manage functions, providing systematic AI risk controls."
  },
  {
    term: "Human-in-the-Loop (HITL)",
    slug: "human-in-the-loop",
    category: "Governance",
    definition: "Human-in-the-Loop (HITL) is a governance pattern where AI system decisions are subject to human oversight before, during, or after execution. Under the EU AI Act Article 14, high-risk AI systems must be designed to allow effective human oversight, including the ability to fully understand the AI's capabilities and limitations, correctly interpret outputs, and override or reverse automated decisions. HITL implementation must balance regulatory compliance with operational efficiency.",
    keyArticles: "EU AI Act Article 14",
    penalty: "Non-compliance with Article 14 can result in fines up to €15M or 3% of turnover",
    relevance: "Regulayer's asynchronous governance queue automatically sequesters high-risk AI decisions for human review while allowing 99% of compliant inferences to pass instantly, solving the HITL scalability challenge."
  },
  {
    term: "WORM Storage",
    slug: "worm-storage",
    category: "Infrastructure",
    definition: "Write-Once-Read-Many (WORM) storage is a data storage technology that prevents modification or deletion of data after it has been written. Originally mandated by financial regulations such as SEC Rule 17a-4(f) for broker-dealer record retention, WORM storage is increasingly critical for AI compliance. It ensures that audit trails, inference logs, and governance decisions cannot be tampered with retroactively, providing legally defensible evidence in regulatory proceedings.",
    keyArticles: "SEC 17a-4(f), EU AI Act Article 12",
    penalty: "Failure to maintain immutable records can invalidate compliance claims entirely",
    relevance: "Regulayer writes all inference records and human governance actions to WORM-compliant storage with SHA-256 hash chaining and Ed25519 digital signatures, creating mathematically tamper-proof audit evidence."
  },
  {
    term: "Algorithmic Bias",
    slug: "algorithmic-bias",
    category: "Risk",
    definition: "Algorithmic bias occurs when an AI system produces systematically unfair outcomes that disproportionately affect particular demographic groups. This can arise from biased training data, flawed model architecture, or inappropriate deployment contexts. Under the EU AI Act and anti-discrimination laws, deployers of AI systems are legally liable for discriminatory outcomes regardless of whether the bias was intentional. Common examples include biased hiring algorithms, discriminatory credit scoring, and unfair facial recognition systems.",
    keyArticles: "EU AI Act Article 10, ECHR Article 14, US EEOC Guidelines",
    penalty: "Up to €35M under EU AI Act; additional discrimination lawsuit liability",
    relevance: "Regulayer's real-time policy engine detects potential bias patterns in AI outputs and can automatically block discriminatory inferences before they reach end users."
  },
  {
    term: "Conformity Assessment",
    slug: "conformity-assessment",
    category: "Regulation",
    definition: "A Conformity Assessment is a formal evaluation process required under the EU AI Act (Article 43) to verify that a high-risk AI system complies with the regulation's requirements before it is placed on the market or put into service. This includes evaluation of data governance, technical documentation, record-keeping, transparency, human oversight, accuracy, robustness, and cybersecurity. Assessments must be repeated whenever significant modifications are made to the system.",
    keyArticles: "EU AI Act Articles 43, 44, Annex VI, Annex VII",
    penalty: "Systems without conformity assessments cannot be legally deployed in the EU",
    relevance: "Regulayer automatically generates conformity assessment documentation from operational telemetry, ensuring continuous compliance without manual audit preparation."
  },
  {
    term: "Fundamental Rights Impact Assessment (FRIA)",
    slug: "fria",
    category: "Regulation",
    definition: "A Fundamental Rights Impact Assessment (FRIA) is a mandatory evaluation required under the EU AI Act (Article 27) for deployers of high-risk AI systems in public sector contexts and certain private sector applications. The FRIA must identify and evaluate the potential impact of the AI system on fundamental rights including non-discrimination, privacy, freedom of expression, human dignity, and access to justice. It must be completed before the AI system is deployed and updated when significant changes occur.",
    keyArticles: "EU AI Act Article 27",
    penalty: "Deployment without FRIA is a regulatory violation subject to Article 71 penalties",
    relevance: "Regulayer's reporting engine automates FRIA generation by mapping operational governance data to fundamental rights impact categories."
  },
  {
    term: "AI Observability vs AI Compliance",
    slug: "ai-observability-vs-compliance",
    category: "Architecture",
    definition: "AI Observability refers to the ability to monitor and understand AI system behavior through logging, tracing, and metrics collection. However, observability tools operate as passive sidecars — they receive copies of AI outputs after delivery to end users. AI Compliance requires active enforcement: the ability to intercept, evaluate, and block non-compliant AI outputs before they cause harm. The critical legal distinction is that merely logging violations without stopping them constitutes documented negligence in regulatory proceedings.",
    keyArticles: "EU AI Act Articles 9, 12, 14",
    penalty: "Passive monitoring without active controls may constitute negligence",
    relevance: "Regulayer replaces passive AI observability with active network interception — sitting directly in the inference path to block violating outputs before they reach users."
  },
];

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(glossaryTerms.map(t => t.category)))];
  
  const filtered = glossaryTerms.filter(t => {
    const matchesSearch = t.term.toLowerCase().includes(search.toLowerCase()) || t.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "All" || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[hsl(30,60%,99%)] text-[hsl(15,45%,15%)] antialiased">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-16 lg:pt-44 lg:pb-20 border-b border-[hsl(15,30%,85%)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(hsl(15,45%,15%) 1px, transparent 1px), linear-gradient(90deg, hsl(15,45%,15%) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-5xl mx-auto px-6 lg:px-10 relative z-10">
          <span className="text-[11px] font-mono tracking-[0.2em] text-[hsl(15,30%,45%)] uppercase mb-6 block">AI Compliance Glossary</span>
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-tight leading-[1.05] mb-6" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Every AI compliance<br/>term, <span className="premium-serif-italic font-light text-[hsl(15,85%,58%)]">explained.</span>
          </h1>
          <p className="text-[18px] text-[hsl(15,25%,45%)] leading-relaxed max-w-2xl font-light">
            The definitive reference for enterprise AI governance terminology. From EU AI Act articles to cryptographic audit primitives — every concept your compliance team needs to understand.
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 border-b border-[hsl(15,30%,85%)] sticky top-16 bg-[hsl(30,60%,99%)]/95 backdrop-blur-sm z-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(15,30%,50%)]" />
            <input
              type="text"
              placeholder="Search AI compliance terms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-[hsl(15,30%,85%)] bg-white py-3 pl-10 pr-4 text-[14px] text-[hsl(15,45%,15%)] placeholder-[hsl(15,30%,60%)] focus:border-[hsl(15,85%,58%)] focus:ring-1 focus:ring-[hsl(15,85%,58%,0.2)] outline-none transition-all font-mono"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-[12px] font-bold tracking-wide uppercase transition-all ${
                  selectedCategory === cat
                    ? "bg-[hsl(15,45%,15%)] text-white"
                    : "bg-white border border-[hsl(15,30%,85%)] text-[hsl(15,30%,45%)] hover:bg-[hsl(15,30%,85%,0.3)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Terms */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 space-y-8">
          {filtered.map((t, i) => (
            <article key={i} id={t.slug} className="border border-[hsl(15,30%,85%)] bg-white p-8 lg:p-10 hover:border-[hsl(15,85%,58%,0.3)] transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-[24px] font-bold tracking-tight group-hover:text-[hsl(15,85%,58%)] transition-colors" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    {t.term}
                  </h2>
                  <span className="text-[10px] font-mono text-[hsl(15,30%,50%)] border border-[hsl(15,30%,85%)] px-2 py-0.5 mt-2 inline-block">{t.category}</span>
                </div>
                <BookOpen className="w-5 h-5 text-[hsl(15,30%,70%)] flex-shrink-0 mt-1" />
              </div>

              <p className="text-[15px] text-[hsl(15,25%,35%)] leading-[1.8] mb-6">{t.definition}</p>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[hsl(30,60%,97%)] p-4 border border-[hsl(15,30%,90%)]">
                  <div className="text-[10px] font-mono text-[hsl(15,30%,50%)] uppercase tracking-wider mb-1">Key References</div>
                  <div className="text-[13px] font-medium text-[hsl(15,45%,15%)]">{t.keyArticles}</div>
                </div>
                <div className="bg-[hsl(0,80%,97%)] p-4 border border-[hsl(0,40%,90%)]">
                  <div className="text-[10px] font-mono text-[hsl(0,50%,50%)] uppercase tracking-wider mb-1">Penalty Exposure</div>
                  <div className="text-[13px] font-medium text-[hsl(0,60%,40%)]">{t.penalty}</div>
                </div>
                <div className="bg-[hsl(15,80%,97%)] p-4 border border-[hsl(15,40%,90%)]">
                  <div className="text-[10px] font-mono text-[hsl(15,60%,50%)] uppercase tracking-wider mb-1">Regulayer Coverage</div>
                  <div className="text-[13px] font-medium text-[hsl(15,45%,15%)]">{t.relevance}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-[hsl(15,30%,85%)]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-bold tracking-tight mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Ready to implement<br/><span className="font-light text-[hsl(15,25%,45%)]">compliant AI governance?</span>
          </h2>
          <p className="text-[16px] text-[hsl(15,25%,45%)] mb-8 font-light">Deploy Regulayer in minutes. Every term on this page becomes automated compliance infrastructure.</p>
          <Link href="/docs" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[hsl(15,45%,15%)] text-white text-sm font-bold tracking-wide hover:bg-[hsl(15,85%,58%)] transition-colors">
            Read the Documentation <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
