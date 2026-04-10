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
        title: "Proxy Interception Gateway",
        specs: "Latency: < 0.4ms | Deployment: Edge/On-Prem",
        desc: "A strictly defined edge node sits transparently in your API path, intercepting and evaluating every generated AI inference instantaneously against corporate policy."
    },
    {
        id: "02",
        title: "Human-In-The-Loop Governance",
        specs: "Routing: Rule-based | Action: Override/Approve",
        desc: "Dynamically route ambiguous or high-risk model inferences to designated human compliance officers for manual review before the response is ever transmitted to the end user."
    },
    {
        id: "03",
        title: "Downloadable Compliance Reports",
        specs: "Framework: EU AI Act | Format: Print-ready PDF",
        desc: "Generate professional, article-by-article EU AI Act compliance reports for any registered AI system. Systems achieving ≥80% compliance receive the Regulayer Verified seal — ready for board presentations and regulatory submissions."
    },
    {
        id: "04",
        title: "Immutable Vault & Cryptographic Sealing",
        specs: "Algorithm: Ed25519 | Storage: SEC 17a-4 WORM",
        desc: "Every AI inference payload, user input, and human override action is cryptographically signed and archived into a tamper-proof write-once vault, guaranteeing absolute record non-repudiation."
    },
    {
        id: "05",
        title: "Runtime FRIA Enforcement",
        specs: "Scope: Algorithmic bias | Reporting: Real-time",
        desc: "Deploy automated Fundamental Rights Impact Assessments (FRIA) checks during runtime to detect and halt systematic discrimination or bias in generative payloads."
    },
    {
        id: "06",
        title: "Enterprise Data Residency",
        specs: "Isolation: Zero-Trust | Encryption: AES-256-GCM",
        desc: "Strict logical separation between organizations, projects, and active data streams. Cryptographic separation ensures compliance with rigorous corporate data sovereignty policies."
    },
    {
        id: "07",
        title: "Interactive Queue Workflows",
        specs: "Integration: Native Dashboard & Slack",
        desc: "When the policy engine blocks an autonomous action, rich interactive cards are immediately routed to enterprise governance queues, allowing instantaneous approvals directly from Slack."
    },
    {
        id: "08",
        title: "Statistical Model Anomaly Freeze",
        specs: "Detection: Z-Score Thresholds | Response: < 5ms",
        desc: "Advanced ML tracks the baseline operating deviation of autonomous AI decisions. If an agent loops or hallucinates outside defined risk vectors, Regulayer instantly severs the connection."
    },
    {
        id: "09",
        title: "Granular RBAC & Policy Inheritance",
        specs: "Directory: SSO/SAML | Granularity: Project-level",
        desc: "Enforce the principle of least privilege. Define intricate governance rules, data visibility matrices, and review authorities scoped precisely to independent organizational units."
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
                    <div className="max-w-3xl">
                        <span className="text-[11px] font-mono tracking-[0.2em] text-[hsl(15,30%,45%)] uppercase mb-6 block">Target Specification</span>
                        <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-bold tracking-tight leading-[1.1] text-[hsl(15,45%,15%)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                            The Enterprise Governance Layer.<br />
                            <span className="font-light text-[hsl(15,25%,45%)]">Built for absolute compliance.</span>
                        </h2>
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
