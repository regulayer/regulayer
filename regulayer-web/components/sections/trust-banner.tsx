"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, FileText, ArrowRight } from "lucide-react";

export function TrustBanner() {
    return (
        <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full bg-white border-b border-[hsl(15,30%,85%)] py-8 md:py-12 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[hsl(15,30%,85%)]"
        >
            
            {/* Left: The Architectural Flow (Killer Demo Visual) */}
            <div className="flex-1 px-8 md:px-16 lg:px-24 py-8 md:py-0 flex items-center justify-center lg:justify-start">
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 font-mono text-[11px] md:text-[13px] text-[hsl(15,45%,15%)] font-bold tracking-tight w-full max-w-lg">
                    <span className="px-4 py-2 border border-[hsl(15,30%,85%)] rounded bg-[hsl(30,60%,99%)] flex items-center justify-center whitespace-nowrap">Your App</span>
                    
                    <div className="hidden md:flex flex-col items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-[hsl(15,85%,58%)]" />
                    </div>
                    {/* Mobile arrow */}
                    <div className="md:hidden flex justify-center py-1">
                        <ArrowRight className="w-5 h-5 text-[hsl(15,85%,58%)] rotate-90" />
                    </div>

                    <div className="flex flex-col gap-1 items-center">
                        <span className="px-5 py-2.5 border-[1.5px] border-[hsl(15,85%,58%)] rounded bg-[hsl(15,85%,58%,0.05)] text-[hsl(15,85%,58%)] shadow-[0_0_20px_hsl(15,85%,58%,0.15)] whitespace-nowrap">Regulayer Core</span>
                        <span className="text-[9px] uppercase tracking-widest text-[hsl(15,30%,50%)]">Verify & Hash</span>
                    </div>

                    <div className="hidden md:flex flex-col items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-[hsl(15,30%,60%)]" />
                    </div>
                    {/* Mobile arrow */}
                    <div className="md:hidden flex justify-center py-1">
                        <ArrowRight className="w-5 h-5 text-[hsl(15,30%,60%)] rotate-90" />
                    </div>

                    <span className="px-4 py-2 border border-[hsl(15,30%,85%)] rounded bg-[hsl(30,60%,99%)] text-[hsl(15,30%,40%)] flex items-center justify-center gap-2 whitespace-nowrap">
                        <Lock className="w-3.5 h-3.5 text-[hsl(15,30%,60%)]" />
                        AI Model
                    </span>
                </div>
            </div>

            {/* Right: The Compliance Proof (Trust Signals) */}
            <div className="flex-1 px-8 md:px-16 lg:px-24 py-8 md:py-0 flex items-center justify-center lg:justify-end gap-12 md:gap-16">
                <div className="flex flex-col items-center gap-3 group">
                    <ShieldCheck className="w-7 h-7 md:w-8 md:h-8 text-[hsl(15,30%,75%)] group-hover:text-[hsl(15,45%,15%)] transition-colors duration-500" />
                    <span className="text-[10px] md:text-[11px] font-mono font-bold tracking-[0.2em] text-[hsl(15,30%,45%)] text-center">EU AI ACT<br/><span className="text-[9px] text-[hsl(15,30%,65%)] font-normal tracking-wider">COMPLIANT</span></span>
                </div>
                <div className="flex flex-col items-center gap-3 group">
                    <Lock className="w-7 h-7 md:w-8 md:h-8 text-[hsl(15,30%,75%)] group-hover:text-[hsl(15,45%,15%)] transition-colors duration-500" />
                    <span className="text-[10px] md:text-[11px] font-mono font-bold tracking-[0.2em] text-[hsl(15,30%,45%)] text-center">SOC2 TYPE II<br/><span className="text-[9px] text-[hsl(15,30%,65%)] font-normal tracking-wider">ENGINEERED</span></span>
                </div>
                <div className="flex flex-col items-center gap-3 group">
                    <FileText className="w-7 h-7 md:w-8 md:h-8 text-[hsl(15,30%,75%)] group-hover:text-[hsl(15,45%,15%)] transition-colors duration-500" />
                    <span className="text-[10px] md:text-[11px] font-mono font-bold tracking-[0.2em] text-[hsl(15,30%,45%)] text-center">SEC 17A-4<br/><span className="text-[9px] text-[hsl(15,30%,65%)] font-normal tracking-wider">READY</span></span>
                </div>
            </div>

        </motion.section>
    );
}
