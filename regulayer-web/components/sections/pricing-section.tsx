"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────
   THE DATA SHEET (ULTIMATE MINIMALISM)
   - Layout: Flat, rigorous CSS Grid matrix.
   - Micro-Simulations: 1px border interaction only. No drop shadows.
   - Aesthetic: Technical manifest / spec sheet.
   ───────────────────────────────────────────────────────────── */

const tiers = [
    {
        name: "Free",
        specs: "INF_1K",
        price: "$0",
        period: "Forever",
        desc: "For prototyping and small teams.",
        cta: "Get Started",
        highlight: false,
        features: [
            "1,000 decisions / mo",
            "Up to 2 team members",
            "7-day retention",
            "1 project",
            "Community support"
        ]
    },
    {
        name: "Pro",
        specs: "INF_50K",
        price: "$99",
        period: "per month",
        desc: "For compliance teams shipping to production.",
        cta: "Get Pro",
        highlight: true,
        features: [
            "50,000 decisions / mo",
            "Up to 20 team members",
            "1-year retention",
            "Unlimited projects",
            "RBAC & SSO",
            "HITL Governance Queue",
            "Conformity Assessments"
        ]
    },
    {
        name: "Enterprise",
        specs: "INF_UNLIMITED",
        price: "Custom",
        period: "annual contract",
        desc: "For regulated enterprises at scale.",
        cta: "Contact Sales",
        highlight: false,
        features: [
            "Unlimited decisions",
            "Unlimited team members",
            "Unlimited retention",
            "Dedicated infrastructure",
            "Zero-Knowledge Privacy (ZKP)",
            "Automated FRIA Generation",
            "Interactive Slack Governance",
            "On-premise deployment",
            "SOC 2 Type II BAA"
        ]
    }
];

export function PricingSection() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section id="pricing" ref={ref} className="py-24 md:py-32 relative bg-white border-b border-[hsl(15,30%,85%)]">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
                
                {/* ─────────────────────────────────────────────────────────────
                    EDITORIAL HEADER
                    ───────────────────────────────────────────────────────────── */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
                    className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 pb-8 border-b border-[hsl(15,30%,85%)]"
                >
                    <div className="max-w-3xl">
                        <span className="text-[11px] font-mono tracking-[0.2em] text-[hsl(15,30%,45%)] uppercase mb-6 block">Licensing Structure</span>
                        <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-bold tracking-tight leading-[1.1] text-[hsl(15,45%,15%)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                            Deterministic pricing.<br />
                            <span className="font-light text-[hsl(15,25%,45%)]">No volumetric surprises.</span>
                        </h2>
                    </div>
                </motion.div>

                {/* ─────────────────────────────────────────────────────────────
                    THE DATA SHEET MATRIX
                    ───────────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[hsl(15,30%,85%)] bg-[hsl(15,30%,85%)]">
                    
                    {tiers.map((tier, i) => (
                        <motion.div 
                            key={tier.name}
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.5, delay: 0.2 + (i * 0.1) }}
                            className={`flex flex-col bg-white hover:bg-[hsl(30,60%,99%)] transition-colors ${i !== 0 ? 'border-t md:border-t-0 md:border-l border-[hsl(15,30%,85%)]' : ''}`}
                        >
                            {/* Head */}
                            <div className={`p-8 border-b border-[hsl(15,30%,85%)] ${tier.highlight ? 'bg-[hsl(15,45%,15%)] text-white' : ''}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className={`text-[16px] font-bold tracking-wide uppercase ${tier.highlight ? 'text-white' : 'text-[hsl(15,45%,15%)]'}`}>{tier.name}</h3>
                                    <div className={`text-[10px] font-mono border px-2 py-1 ${tier.highlight ? 'border-white/20 text-[hsl(15,85%,58%)]' : 'border-[hsl(15,30%,85%)] text-[hsl(15,30%,45%)]'}`}>
                                        {tier.specs}
                                    </div>
                                </div>
                                
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className={`text-[3.5rem] font-bold leading-none tracking-tighter ${tier.highlight ? 'text-white' : 'text-[hsl(15,45%,15%)]'}`} style={{ fontFamily: "var(--font-space-grotesk)" }}>
                                        {tier.price}
                                    </span>
                                </div>
                                <div className={`text-[12px] font-mono ${tier.highlight ? 'text-[hsl(15,25%,70%)]' : 'text-[hsl(15,25%,45%)]'}`}>
                                    {tier.period}
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-8 flex-1 flex flex-col">
                                <p className="text-[14px] leading-relaxed text-[hsl(15,25%,45%)] mb-10 h-[45px] font-light">
                                    {tier.desc}
                                </p>

                                <div className="mb-10 flex-1">
                                    <ul className="flex flex-col gap-4">
                                        {tier.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-4">
                                                <Check className={`w-4 h-4 mt-0.5 ${tier.highlight ? 'text-[hsl(15,85%,58%)]' : 'text-[hsl(15,30%,60%)]'}`} strokeWidth={2} />
                                                <span className="text-[13px] text-[hsl(15,45%,15%)] font-medium leading-snug">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Link href="/signup" className="w-full mt-auto">
                                    <button className={`w-full h-12 text-[13px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 border ${
                                        tier.highlight 
                                        ? 'bg-[hsl(15,85%,58%)] text-white border-[hsl(15,85%,58%)] hover:bg-[hsl(15,75%,53%)]' 
                                        : 'bg-white text-[hsl(15,45%,15%)] border-[hsl(15,45%,15%)] hover:bg-[hsl(15,45%,15%)] hover:text-white'
                                    }`}>
                                        {tier.cta}
                                    </button>
                                </Link>
                            </div>
                            
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
