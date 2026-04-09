"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   THE MONOLITHIC STATEMENT (ULTIMATE MINIMALISM)
   - Layout: Perfectly flat, zero shadows, maximum contrast.
   - Micro-Simulations: Pure typographic reveal.
   - Aesthetic: Stripe Press / Academic Whitepaper conclusion.
   ───────────────────────────────────────────────────────────── */

export function FinalCTA() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="relative bg-[hsl(30,60%,99%)] pt-32 pb-40 border-b border-[hsl(15,30%,85%)]">
            
            {/* Minimalist Grid Background */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(hsl(15,45%,15%) 1px, transparent 1px), linear-gradient(90deg, hsl(15,45%,15%) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

            <div className="max-w-5xl mx-auto px-6 lg:px-10 relative z-10 flex flex-col items-center text-center">
                
                {/* ─────────────────────────────────────────────────────────────
                    THE STATEMENT
                    ───────────────────────────────────────────────────────────── */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={inView ? { opacity: 1, y: 0 } : {}} 
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full flex flex-col items-center"
                >
                    <div className="w-px h-16 bg-[hsl(15,85%,58%)] mb-12" />

                    <h2 className="text-[clamp(3.5rem,7vw,6.5rem)] font-bold tracking-tighter leading-[1] text-[hsl(15,45%,15%)] mb-8" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                        Deploy absolute <br />
                        <span className="font-light text-[hsl(15,25%,45%)]">determinism.</span>
                    </h2>
                    
                    <p className="text-[18px] md:text-[20px] text-[hsl(15,25%,45%)] mb-16 max-w-2xl font-light leading-relaxed">
                        The age of opaque AI infrastructure is over. Begin anchoring your foundational models to the WORM ledger in under 3 lines of code.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <Link href="/signup" className="w-full sm:w-auto">
                            <motion.button 
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
                                className="w-full sm:w-auto h-14 px-10 bg-[hsl(15,45%,15%)] text-white font-bold text-[14px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[hsl(15,85%,58%)] transition-colors"
                            >
                                Initialize SDK <ArrowRight className="w-4 h-4 mt-0.5" />
                            </motion.button>
                        </Link>
                        <Link href="/contact" className="w-full sm:w-auto">
                            <motion.button 
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
                                className="w-full sm:w-auto h-14 px-10 bg-transparent text-[hsl(15,45%,15%)] font-bold text-[14px] uppercase tracking-widest flex items-center justify-center gap-3 border border-[hsl(15,45%,15%)] hover:bg-[hsl(15,45%,15%)] hover:text-white transition-colors"
                            >
                                Read Whitepaper
                            </motion.button>
                        </Link>
                    </div>

                    <p className="text-[11px] font-mono text-[hsl(15,30%,50%)] mt-12 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> 
                        Mainnet Active // Regulayer Engine v1.4.2
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
