"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TerminalSquare, ShieldCheck } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   THE PURE TERMINAL (ULTIMATE MINIMALISM)
   - Layout: Razor-flat, pitch-black Monaco/JetBrains environment.
   - Micro-Simulations: Pure typing animation, no 3D glare or perspective.
   - Aesthetic: Engineering Command Line. Pure function.
   ───────────────────────────────────────────────────────────── */

const syntaxCode = [
    { text: "import", color: "#FF5F56", italic: true },
    { text: " { core } ", color: "hsl(210, 20%, 80%)" },
    { text: "from", color: "#FF5F56", italic: true },
    { text: ' "@regulayer/engine"', color: "hsl(110, 50%, 65%)" },
    { text: ";\n\n", color: "hsl(210, 20%, 80%)" },
    
    { text: "// 1. Initialize the AI Governance Gateway\n", color: "hsl(210, 20%, 45%)" },
    { text: "const", color: "#FF5F56", italic: true },
    { text: " regulayer ", color: "hsl(210, 20%, 80%)" },
    { text: "= ", color: "#FF5F56" },
    { text: "new", color: "#FF5F56", italic: true },
    { text: " core.Client({\n", color: "hsl(210, 20%, 80%)" },
    { text: "  telemetry: ", color: "hsl(30, 40%, 65%)" },
    { text: "true", color: "#FF5F56" },
    { text: ",\n  compliance: {\n", color: "hsl(210, 20%, 80%)" },
    { text: "    eu_ai_act_fria: ", color: "hsl(30, 40%, 65%)" },
    { text: "true", color: "#FF5F56" },
    { text: ",\n    soc2_audit_log: ", color: "hsl(30, 40%, 65%)" },
    { text: "true\n", color: "#FF5F56" },
    { text: "  },\n  governance: {\n", color: "hsl(210, 20%, 80%)" },
    { text: "    hitl_threshold: ", color: "hsl(30, 40%, 65%)" },
    { text: "0.85\n", color: "hsl(110, 50%, 65%)" },
    { text: "  }\n});\n\n", color: "hsl(210, 20%, 80%)" },

    { text: "// 2. Transparent SDK wrapping (zero friction integration)\n", color: "hsl(210, 20%, 45%)" },
    { text: "const", color: "#FF5F56", italic: true },
    { text: " ai_client ", color: "hsl(210, 20%, 80%)" },
    { text: "= ", color: "#FF5F56" },
    { text: "regulayer.intercept(openai);\n\n", color: "hsl(210, 20%, 80%)" },

    { text: "// 3. Risk is evaluated in real-time. Overrides are mandated.\n", color: "hsl(210, 20%, 45%)" },
    { text: "const", color: "#FF5F56", italic: true },
    { text: " proof ", color: "hsl(210, 20%, 80%)" },
    { text: "= ", color: "#FF5F56" },
    { text: "await", color: "#FF5F56", italic: true },
    { text: " ai_client.chat.completions.create({\n", color: "hsl(210, 20%, 80%)" },
    { text: "  model: ", color: "hsl(30, 40%, 65%)" },
    { text: "'gpt-4-turbo'", color: "hsl(110, 50%, 65%)" },
    { text: ",\n  messages: [{ role: ", color: "hsl(30, 40%, 65%)" },
    { text: "'user'", color: "hsl(110, 50%, 65%)" },
    { text: ", content: ", color: "hsl(30, 40%, 65%)" },
    { text: "'Execute trade...'", color: "hsl(110, 50%, 65%)" },
    { text: " }]\n});\n", color: "hsl(210, 20%, 80%)" },
];

export function CodeShowcase() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="py-24 md:py-32 relative bg-white border-b border-[hsl(15,30%,85%)]">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
                    
                    {/* ─────────────────────────────────────────────────────────────
                        EDITORIAL TEXT COLUMN
                        ───────────────────────────────────────────────────────────── */}
                    <div className="flex-1 max-w-lg z-20 w-full shrink-0">
                        <div className="mb-8">
                            <span className="text-[11px] font-mono tracking-[0.2em] text-[hsl(15,30%,45%)] uppercase mb-6 block">Developer API</span>
                            <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] font-bold tracking-tight mb-6 leading-[1.1] text-[hsl(15,45%,15%)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                                Zero friction.<br />
                                <span className="font-light text-[hsl(15,25%,45%)]">Absolute accountability.</span>
                            </h2>
                        </div>
                        
                        <p className="text-[16px] text-[hsl(15,25%,45%)] leading-relaxed mb-10 font-light border-l border-[hsl(15,85%,58%)] pl-5">
                            The Regulayer core engine binds directly to your primary execution vectors. No new infrastructure. Simply intercept your existing AI execution stream and inherit SOC-2 logging, EU AI Act reporting, and HITL governance queues natively.
                        </p>
                        
                        <div className="flex items-center gap-4 text-[12px] font-mono uppercase tracking-widest text-[hsl(15,45%,15%)] font-bold">
                            <TerminalSquare className="w-4 h-4 text-[hsl(15,85%,58%)]" />
                            <span>npm install @regulayer/engine</span>
                        </div>
                    </div>

                    {/* ─────────────────────────────────────────────────────────────
                        THE PURE TERMINAL
                        ───────────────────────────────────────────────────────────── */}
                    <div className="flex-[1.5] w-full relative">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} 
                            className="w-full rounded border border-[hsl(15,30%,85%)] bg-[hsl(220,15%,10%)] relative overflow-hidden"
                            style={{ boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)" }}
                        >
                            {/* Technical Header */}
                            <div className="w-full h-10 border-b border-[hsl(220,15%,20%)] flex items-center px-4 justify-between bg-[hsl(220,15%,12%)]">
                                <div className="text-[10px] font-mono text-[hsl(210,20%,50%)] uppercase tracking-widest">
                                    [ regulayer-engine-v1.4.2 ] :: src/main.ts
                                </div>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            </div>

                            <div className="relative">
                                {/* Code Content */}
                                <div className="p-6 md:p-8 font-mono text-[13px] md:text-[14px] leading-[1.8] whitespace-pre-wrap select-text overflow-x-auto min-h-[400px]">
                                    {inView && syntaxCode.map((chunk, i) => (
                                        <motion.span 
                                            key={i} 
                                            initial={{ opacity: 0 }} 
                                            animate={{ opacity: 1 }} 
                                            transition={{ delay: 0.3 + i * 0.05 }}
                                            style={{ color: chunk.color, fontStyle: chunk.italic ? "italic" : "normal" }}
                                        >
                                            {chunk.text}
                                        </motion.span>
                                    ))}
                                    <motion.span 
                                        animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity }}
                                        className="inline-block w-2.5 h-3.5 bg-[hsl(210,20%,80%)] ml-1 align-baseline translate-y-[2px]"
                                    />
                                </div>

                                {/* Deep Technical Overlay */}
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 2.2, type: "spring", stiffness: 100 }}
                                    className="absolute bottom-6 right-6 bg-[hsl(220,15%,15%)] border border-[hsl(220,15%,30%)] p-4 flex items-start gap-4 max-w-xs"
                                >
                                    <div className="mt-0.5">
                                        <ShieldCheck className="w-4 h-4 text-[hsl(110,50%,65%)]" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] tracking-widest uppercase text-[hsl(110,50%,65%)] font-mono font-bold mb-1">Queue Active</div>
                                        <div className="text-[11px] text-[hsl(210,20%,60%)] font-mono leading-relaxed">
                                            HITL Gateway active. All `client.chat` vectors are automatically screened against organizational policy.
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                            
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
