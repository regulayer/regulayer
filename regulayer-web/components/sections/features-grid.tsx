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
        title: "Ed25519 Cryptographic Sealing",
        specs: "Latency: < 0.4ms | Protocol: curve25519",
        desc: "A natively compiled Rust engine sits transparently in your API path, cryptographically signing every generated AI inference instantaneously. This guarantees absolute non-repudiation of all model outputs."
    },
    {
        id: "02",
        title: "Immutable SHA-256 Hash Chains",
        specs: "Structure: Linked List | Hash: SHA-256",
        desc: "Each inference hash is cryptographically bound to the previous entry. This forms an unbreakable temporal chain, mathematically proving that your AI's historical data has not been altered, deleted, or fabricated."
    },
    {
        id: "03",
        title: "WORM Compliant Ledger",
        specs: "Data Store: Append-Only | Compliance: SEC 17a-4",
        desc: "Attestations are anchored to a strictly Write-Once, Read-Many datastore. Purpose-built for highly regulated industries requiring immutable evidence of algorithmic decision-making."
    },
    {
        id: "04",
        title: "Zero-Trust Multi-Tenancy",
        specs: "Isolation: Process-Level | Encryption: AES-256-GCM",
        desc: "Strict cryptographic separation between organizations and active foundational models. Keys are never shared, ensuring compliance with the most rigorous enterprise data residency frameworks."
    },
    {
        id: "05",
        title: "Asynchronous Zero-Block Routing",
        specs: "Network Overhead: < 2ms | Language: Rust",
        desc: "Regulayer operates completely out-of-band. Your critical AI paths remain lightning fast. Telemetry is flushed asynchronously without ever blocking the primary inference request."
    },
    {
        id: "06",
        title: "Zero-Knowledge Commitments",
        specs: "Privacy: Absolute | Hash: Salted SHA-256",
        desc: "Obscure Personally Identifiable Information (PII) instantaneously within the edge SDK. Verify that AI systems followed strict enterprise policies without ever exposing the underlying patient or financial data."
    },
    {
        id: "07",
        title: "Statistical ML Anomaly Freeze",
        specs: "Response: < 5ms | Detection: Z-Score",
        desc: "Advanced statistical ML tracks the baseline standard deviation of autonomous AI decisions. If an agent hallucinates or enters an erratic failure loop, Regulayer instantly severs the connection."
    },
    {
        id: "08",
        title: "Blockchain Merkle Anchoring",
        specs: "Proof: Absolute | Ledgers: ETH, BTC",
        desc: "Millions of asynchronous local decision hashes are mathematical compressed into a singular Merkle Root. This root is anchored to public Web3 ledgers, mathematically eliminating any possibility of internal database tampering."
    },
    {
        id: "09",
        title: "Slack Block-Kit Interventions",
        specs: "Workflow: Real-time | UI: Interactive",
        desc: "When the Policy Engine intercepts a high-risk autonomous AI action, rich interactive Governance cards are immediately routed to enterprise Slack channels. Approvers can review and intervene instantly."
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
                            The Universal Proof Layer.<br />
                            <span className="font-light text-[hsl(15,25%,45%)]">Built for the autonomous age.</span>
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
