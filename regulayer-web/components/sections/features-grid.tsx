"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   THE TECHNICAL GLOSSARY (ULTIMATE MINIMALISM)
   - Layout: Architectural, flat 1px border grid. No blurs, no cards.
   - Micro-Simulations: Pure structural hover interactions (1px border highlights).
   - Aesthetic: Stripe Press / Teenage Engineering. Maximum data density.
   ───────────────────────────────────────────────────────────── */

const features = [
    {
        id: "01",
        title: "Zero-Latency Quality Gate",
        specs: "Latency: < 0.4ms | Impact: Immediate Protection",
        desc: "Stop hallucinations and policy violations before they reach your customers. Our edge node sits invisibly in your API path, evaluating every AI response in real-time."
    },
    {
        id: "02",
        title: "Human-In-The-Loop Governance",
        specs: "Routing: Smart Queues | Action: Manual Override",
        desc: "When AI gets confused, humans take the wheel. Suspicious or high-risk AI decisions are automatically paused and routed to your compliance team for review and approval."
    },
    {
        id: "03",
        title: "One-Click EU AI Act Audits",
        specs: "Standard: ISO 42001 | Framework: EU AI Act",
        desc: "Turn months of manual auditing into a single click. Regulayer generates complete, court-ready ISO 42001 technical documentation backed by your live operational telemetry."
    },
    {
        id: "04",
        title: "Algorithmic Risk Grading",
        specs: "Metrics: Incident Data | Output: Executive Dashboard",
        desc: "Stop guessing if your AI is safe. We continuously calculate your incident ratios and intervention rates to assign your systems a living, quantitative Risk Score and Compliance Grade."
    },
    {
        id: "05",
        title: "Tamper-Proof Audit Trails",
        specs: "Algorithm: SHA-256 | Storage: Immutable Ledger",
        desc: "Every AI decision and human override is cryptographically chained into a Write-Once-Read-Many (WORM) vault, ensuring your audit records are legally irrefutable."
    },
    {
        id: "06",
        title: "Enterprise Data Sovereignty",
        specs: "Isolation: Zero-Trust | Privacy: Deep Masking",
        desc: "Protect your intellectual property. We enforce strict data, project, and tenant isolation so absolutely no sensitive data leaks between enterprise departments or compliance scopes."
    },
    {
        id: "07",
        title: "Interactive Slack Governance",
        specs: "Integration: Native Dashboard & Slack",
        desc: "Compliance doesn't have to slow you down. When an AI action is blocked, rich interactive approval cards are sent directly to your Slack channels so your team can unblock the workflow instantly."
    },
    {
        id: "08",
        title: "Autonomous Crisis Freezing",
        specs: "Detection: Z-Score Thresholds | Response: Instant",
        desc: "If a specific model starts hallucinating or drifting systematically, Regulayer automatically severs the connection to contain the blast radius, preventing cascading enterprise damage."
    },
    {
        id: "09",
        title: "Granular Role-Based Access",
        specs: "Directory: SSO/SAML | Granularity: Project-level",
        desc: "Enforce the principle of least privilege. Easily define exactly who is allowed to audit systems, who can review Governance Queues, and who can generate EU AI Act reports."
    }
];

export function FeaturesGrid() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section id="features" ref={ref} className="py-24 md:py-32 relative bg-white border-b border-[hsl(15,30%,85%)]">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                
                {/* ─────────────────────────────────────────────────────────────
                    EDITORIAL HEADER
                    ───────────────────────────────────────────────────────────── */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 pb-8 border-b border-[hsl(15,30%,85%)]"
                >
                    <div className="max-w-4xl">
                        <span className="text-[11px] font-mono tracking-[0.2em] text-[hsl(15,85%,58%)] uppercase mb-6 block font-bold">The Cryptographic Moat</span>
                        <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-bold tracking-tight leading-[1.1] text-[hsl(15,45%,15%)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                            Passive logging is not proof.<br />
                            <span className="font-light text-[hsl(15,25%,45%)]">We make AI compliance mathematically verifiable.</span>
                        </h2>
                        <p className="mt-6 text-[16px] md:text-[18px] text-[hsl(15,30%,40%)] leading-[1.6] font-light max-w-2xl">
                            Generic observability tools can only tell you what an AI generated. Regulayer cryptographically hashes and chains every inference to prove what happened, when, and who governed it.
                        </p>
                    </div>
                </motion.div>

                {/* ─────────────────────────────────────────────────────────────
                    ARCHITECTURAL GRID
                    ───────────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-12">
                    {features.map((f, i) => (
                        <motion.div 
                            key={f.id} custom={i} 
                            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
                            className="flex flex-col group"
                        >
                            {/* Technical Index Ribbon */}
                            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[hsl(15,30%,85%)] group-hover:border-[hsl(15,45%,15%)] transition-colors duration-300">
                                <span className="text-[12px] font-mono font-bold text-[hsl(15,85%,58%)] tracking-widest">
                                    {f.id}
                                </span>
                                <span className="text-[10px] font-mono text-[hsl(15,30%,60%)] uppercase tracking-wider">
                                    SYS_MODULE
                                </span>
                            </div>

                            {/* Core Title */}
                            <h3 className="text-[18px] font-bold text-[hsl(15,45%,15%)] mb-2 tracking-tight group-hover:text-[hsl(15,85%,58%)] transition-colors duration-300" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                                {f.title}
                            </h3>

                            {/* Technical Specs */}
                            <div className="text-[11px] font-mono text-[hsl(15,30%,45%)] bg-[hsl(30,60%,97%)] px-2 py-1 inline-block self-start border border-[hsl(15,30%,85%)] mb-4">
                                {f.specs}
                            </div>

                            {/* Desc */}
                            <p className="text-[14px] leading-relaxed text-[hsl(15,25%,45%)] font-light">
                                {f.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
