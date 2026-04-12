"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   THE ARCHITECTURAL FLOWCHART v2 (ULTIMATE MINIMALISM)
   - Layout: Continuous vertical timeline. ZERO scroll-jacking.
   - Interaction: A central 1px line draws downward as the user scrolls,
     triggering node illuminations sequentially.
   - Aesthetic: Perfect technical whitepaper execution. Fluid native UX.
   ───────────────────────────────────────────────────────────── */

const steps = [
    {
        id: "sys_capture",
        title: "Proxy Interception",
        desc: "The Regulayer edge proxy binds to your inference path. It captures the complete request-response binary pair seamlessly. The primary ML execution thread is routed through policy without adding perceptible latency.",
        spec: "NODE_01 :: CAPTURE",
        code: `POST /v1/chat/completions\n{ "model": "gpt-4", "messages": [...] }`,
        color: "hsl(15,85%,58%)",
        align: "left"
    },
    {
        id: "sys_policy",
        title: "Policy & Governance",
        desc: "The payload is instantaneously evaluated against EU AI Act and corporate standards. Suspicious or high-risk inferences are routed to a Human-in-the-Loop (HITL) queue for manual compliance officer review.",
        spec: "NODE_02 :: POLICY_ENGINE",
        code: `EVALUATE(payload, enterprise_policies)\nIF risk > threshold: ROUTE_TO_HITL()`,
        color: "hsl(15,45%,15%)",
        align: "right"
    },
    {
        id: "sys_doc",
        title: "Compliance Documentation",
        desc: "The inference, human override decisions, and metadata are cryptographically sealed. Regulayer automatically generates board-ready Technical Conformity Assessments, FRIA reports, and print-ready PDF Compliance Reports carrying the Regulayer Verified seal.",
        spec: "NODE_03 :: AUDIT_TRAIL",
        code: `STATE: IMMUTABLE\nGENERATE_PDF(Conformity_Assessment)`,
        color: "hsl(15,25%,45%)",
        align: "left"
    }
];

// Individual Node Component for pure IntersectionObserver tracking
function FlowchartNode({ step, index }: { step: any, index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: false, margin: "-40% 0px -40% 0px" });

    const isLeft = step.align === "left";

    return (
        <div ref={ref} className={`relative w-full flex ${isLeft ? 'justify-start md:justify-end' : 'justify-start'} md:w-1/2 mb-24 md:mb-32 ${isLeft ? 'md:pr-16 md:ml-0 ml-12' : 'md:pl-16 md:ml-auto ml-12'}`}>
            
            {/* Connection Dot to central line (Desktop) */}
            <div className={`hidden md:block absolute top-[40px] w-4 h-[1px] ${inView ? 'bg-[hsl(15,85%,58%)]' : 'bg-[hsl(15,30%,85%)]'} transition-colors duration-700 ${isLeft ? 'right-0' : 'left-0'}`} />
            
            {/* Connection Dot to central line (Mobile) */}
            <div className={`md:hidden absolute top-[40px] w-8 h-[1px] -left-[2rem] ${inView ? 'bg-[hsl(15,85%,58%)]' : 'bg-[hsl(15,30%,85%)]'} transition-colors duration-700`} />

            {/* The Content Card */}
            <motion.div 
                animate={{ 
                    opacity: inView ? 1 : 0.3, 
                    scale: inView ? 1 : 0.98,
                    x: inView ? 0 : (isLeft ? -10 : 10) 
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full max-w-lg bg-white border p-8 md:p-10 transition-colors duration-500 ${inView ? 'border-[hsl(15,45%,15%)] shadow-[4px_4px_0_hsl(15,45%,15%)]' : 'border-[hsl(15,30%,85%)] shadow-none'}`}
            >
                <div className={`text-[10px] font-mono mb-4 uppercase tracking-[0.2em] border-b pb-3 flex justify-between ${inView ? 'text-[hsl(15,85%,58%)] border-[hsl(15,85%,58%,0.3)]' : 'text-[hsl(15,30%,60%)] border-[hsl(15,30%,85%)]'}`}>
                    <span>{step.spec}</span>
                    <span className="opacity-50">0{index + 1}</span>
                </div>
                
                <h3 className="text-2xl font-bold text-[hsl(15,45%,15%)] mb-4 tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    {step.title}
                </h3>
                
                <p className="text-[15px] leading-relaxed text-[hsl(15,25%,45%)] font-light mb-6">
                    {step.desc}
                </p>

                <div className={`p-4 bg-[hsl(30,60%,98%)] border font-mono text-[11px] leading-relaxed whitespace-pre-wrap transition-colors duration-500 ${inView ? 'border-[hsl(15,30%,85%)] text-[hsl(15,45%,15%)]' : 'border-transparent text-[hsl(15,30%,60%)]'}`}>
                    {step.code}
                </div>
            </motion.div>
        </div>
    );
}

export function HowItWorks() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ 
        target: containerRef, 
        offset: ["start center", "end center"] 
    });

    // The central SVG line height maps to the scroll progress of the entire section
    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <section className="bg-[hsl(30,60%,99%)] relative border-b border-[hsl(15,30%,85%)] pb-10 overflow-hidden">
            
            {/* Minimalist blueprint background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.2]" style={{ backgroundImage: "linear-gradient(hsl(15,45%,15%) 1px, transparent 1px), linear-gradient(90deg, hsl(15,45%,15%) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

            <div className="w-full max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">
                
                {/* Header */}
                <div className="mb-20 md:mb-32 pb-8 border-b border-[hsl(15,30%,85%)] text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <span className="text-[11px] font-mono tracking-[0.2em] text-[hsl(15,30%,45%)] uppercase mb-6 block">The Trust Layer Flow</span>
                        <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-bold tracking-tight leading-[1.1] text-[hsl(15,45%,15%)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                            You build the AI app.<br />
                            <span className="font-light text-[hsl(15,25%,45%)]">We inject the compliance.</span>
                        </h2>
                    </div>
                </div>

                {/* The Vertical Fluid Flowchart */}
                <div className="relative w-full max-w-5xl mx-auto" ref={containerRef}>
                    
                    {/* The Central Axis Line (Bg) */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] bg-[hsl(15,30%,85%)] -translate-x-1/2" />
                    
                    {/* The Central Axis Line (Active Drawing) */}
                    <motion.div 
                        className="absolute left-4 md:left-1/2 top-0 w-[2px] bg-[hsl(15,85%,58%)] -translate-x-1/2 shadow-[0_0_10px_hsl(15,85%,58%,0.5)]"
                        style={{ height: lineHeight }}
                    />

                    {/* Nodes Array */}
                    <div className="relative pt-10">
                        {steps.map((step, index) => (
                            <FlowchartNode key={step.id} step={step} index={index} />
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
