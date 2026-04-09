"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   THE INDEX DIRECTORY (ULTIMATE MINIMALISM)
   - Layout: Pure typographic matrix. Massive data density.
   - Micro-Simulations: 1px border highlights on hover.
   - Aesthetic: Stripe Press / Academic Index.
   ───────────────────────────────────────────────────────────── */

const integrations = [
    { provider: "OpenAI", class: "LLM Inference", model: "GPT-4o / o1-preview", protocol: "REST Interceptor [Node/Python]" },
    { provider: "Anthropic", class: "LLM Inference", model: "Claude 3.5 Sonnet", protocol: "REST Interceptor [Node/Python]" },
    { provider: "AWS Bedrock", class: "Cloud Inference", model: "Titan / Llama 3", protocol: "Boto3 Shim Binding" },
    { provider: "Azure OpenAI", class: "Enterprise Cloud", model: "GPT-4 Dedicated", protocol: "Azure SDK Wrapper" },
    { provider: "Google Vertex", class: "Cloud Inference", model: "Gemini 1.5 Pro", protocol: "GCP gRPC Interceptor" },
    { provider: "LangChain", class: "Orchestration", model: "Agent Callbacks", protocol: "Native Handler Registration" },
    { provider: "LlamaIndex", class: "RAG Framework", model: "Vector Retrieval", protocol: "Native Node Callback" },
    { provider: "PostgreSQL", class: "Audit Storage", model: "pgAudit Extension", protocol: "WORM Schema Integration" },
    { provider: "AWS S3", class: "Cold Storage", model: "Object Lock enabled", protocol: "S3 SEC 17a-4 API" },
];

export function IntegrationsSection() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="py-24 md:py-32 relative overflow-hidden bg-[hsl(30,60%,99%)] border-b border-[hsl(15,30%,85%)]">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-20">
                
                {/* ─────────────────────────────────────────────────────────────
                    EDITORIAL HEADER
                    ───────────────────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 pb-8 border-b border-[hsl(15,30%,85%)]"
                >
                    <div className="max-w-3xl">
                        <span className="text-[11px] font-mono tracking-[0.2em] text-[hsl(15,30%,45%)] uppercase mb-6 block">Compatibility Matrix</span>
                        <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-bold tracking-tight leading-[1.1] text-[hsl(15,45%,15%)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                            Protocol bindings.<br />
                            <span className="font-light text-[hsl(15,25%,45%)]">Universal cryptographic coverage.</span>
                        </h2>
                    </div>
                </motion.div>

                {/* ─────────────────────────────────────────────────────────────
                    THE INDEX MATRIX
                    ───────────────────────────────────────────────────────────── */}
                <motion.div 
                    initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="w-full relative"
                >
                    {/* Table Header */}
                    <div className="flex items-center w-full border-b-[2px] border-[hsl(15,45%,15%)] pb-4 mb-4 text-[10px] font-mono text-[hsl(15,30%,45%)] uppercase tracking-[0.2em] font-bold">
                        <div className="w-[30%]">Provider Engine</div>
                        <div className="w-[25%] hidden sm:block">Classification</div>
                        <div className="w-[25%] hidden md:block">Target System</div>
                        <div className="flex-1 text-right md:text-left">Protocol Binding</div>
                    </div>

                    {/* Table Rows */}
                    <div className="flex flex-col w-full">
                        {integrations.map((item, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -10 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.4, delay: 0.3 + (i * 0.05) }}
                                className="group flex items-center w-full border-b border-[hsl(15,30%,85%)] py-4 hover:bg-white hover:border-[hsl(15,45%,15%)] hover:-translate-y-[1px] transition-all cursor-crosshair"
                            >
                                <div className="w-[30%] text-[15px] sm:text-[16px] font-bold text-[hsl(15,45%,15%)] group-hover:text-[hsl(15,85%,58%)] transition-colors pl-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                                    {item.provider}
                                </div>
                                <div className="w-[25%] hidden sm:block text-[13px] text-[hsl(15,25%,45%)] font-light">
                                    {item.class}
                                </div>
                                <div className="w-[25%] hidden md:block text-[13px] text-[hsl(15,25%,45%)] font-light">
                                    {item.model}
                                </div>
                                <div className="flex-1 text-right md:text-left text-[11px] font-mono text-[hsl(15,30%,45%)] bg-[hsl(30,60%,97%)] px-3 py-1.5 border border-[hsl(15,30%,85%)] group-hover:border-[hsl(15,85%,58%)] group-hover:text-[hsl(15,85%,58%)] transition-colors self-center justify-self-end md:justify-self-start lg:mr-4 ml-auto md:ml-0 overflow-hidden text-ellipsis whitespace-nowrap">
                                    {item.protocol}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </motion.div>

                {/* Footer Note */}
                <div className="mt-16 text-[12px] font-mono text-[hsl(15,25%,45%)]">
                    [ SYSTEM NOTE ] // If your specific stack is unlisted, our infrastructure engineering team actively ships bespoke native bindings in under 48 hours for Enterprise partners.
                </div>
            </div>
        </section>
    );
}
