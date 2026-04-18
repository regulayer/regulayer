"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, DownloadCloud } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   THE SWISS GRID MASTERPIECE v5 (FULL-WIDTH DOMINANCE)
   ─────────────────────────────────────────────────────────────
   
   4 iterations of the right column were rejected. The problem 
   was never the content — it was the column itself. A narrow 
   side panel will always look secondary next to colossal 
   typography. Every attempt to fill it created decoration.
   
   The greatest agency eliminates what doesn't work.
   
   The typography now spans the FULL viewport width.
   Below it: a horizontal strip of 3 purpose-driven boxes.
   
   Layout:
   ┌──────────────────────────────────────────────┐
   │                                              │
   │  The protocol                                │
   │  for generative                              │
   │  truth.                                      │
   │                                              │
   ├────────────┬──────────────────┬──────────────┤
   │  Deploy    │  Regulayer       │  View        │
   │  determ.   │  intercepts...   │  Registry    │
   └────────────┴──────────────────┴──────────────┘
   
   That's it. Nothing else. Pure conviction.
   ───────────────────────────────────────────────────────────── */

const boxVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
        opacity: 1,
        transition: { delay: i * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }
    })
};

const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: 0.3 + (i * 0.12), duration: 1.2, ease: [0.16, 1, 0.3, 1] }
    })
};

export function HeroSection() {
    return (
        <section className="w-full h-auto md:h-[100vh] md:min-h-[850px] bg-[hsl(15,30%,85%)] flex flex-col md:grid md:grid-cols-12 md:grid-rows-6 gap-[1px] md:pt-[1px] md:border-b border-[hsl(15,30%,85%)]">
            
            {/* ─────────────────────────────────────────────────────────────
                FULL-WIDTH TYPOGRAPHY (12 cols × 4 rows)
                ─────────────────────────────────────────────────────────────
                No competing elements. No side panels. No filler.
                The message owns every pixel of the viewport.
                ───────────────────────────────────────────────────────────── */}
            <motion.div 
                custom={0} variants={boxVariants} initial="hidden" animate="visible"
                className="w-full h-[60vh] md:h-auto md:col-span-12 md:row-span-4 bg-[hsl(30,60%,99%)] flex flex-col justify-end p-8 md:p-16 lg:px-24 lg:pb-20 relative overflow-hidden"
            >
                {/* Architectural grid */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{ backgroundImage: "linear-gradient(hsl(15,45%,15%) 1px, transparent 1px), linear-gradient(90deg, hsl(15,45%,15%) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
                
                <motion.h1 
                    custom={0} variants={textVariants} initial="hidden" animate="visible"
                    className="relative z-10 text-[clamp(4rem,7.5vw,11rem)] leading-[0.84] tracking-[-0.045em] font-bold text-[hsl(15,45%,15%)] max-w-[1400px]" 
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                    Prevent AI<br/>mistakes before<br/>
                    <span className="premium-serif-italic font-light text-[hsl(15,85%,58%)] tracking-[-0.01em]">they cost millions.</span>
                </motion.h1>
            </motion.div>

            {/* ─────────────────────────────────────────────────────────────
                BOTTOM STRIP: 3 purpose-driven boxes (12 cols × 2 rows)
                ───────────────────────────────────────────────────────────── */}

            {/* BOX 1: PRIMARY CTA (4 cols) */}
            <Link href="/docs" passHref legacyBehavior>
                <motion.a 
                    custom={1} variants={boxVariants} initial="hidden" animate="visible"
                    className="block w-full h-[30vh] md:h-auto md:col-span-4 md:row-span-2 bg-[hsl(15,45%,15%)] text-white flex flex-col justify-between p-8 md:p-12 group transition-colors hover:bg-[hsl(15,85%,58%)] cursor-pointer"
                >
                    <div className="flex justify-between items-center w-full pb-6 border-b border-white/20">
                        <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/70">Gateway Proxy</span>
                        <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                    </div>
                    <motion.div custom={2} variants={textVariants} initial="hidden" animate="visible" className="mt-8 md:mt-0 text-[clamp(2.5rem,3.5vw,3.5rem)] font-bold tracking-tight leading-[1.1] text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                        Integrate<br/>Gateway.
                    </motion.div>
                </motion.a>
            </Link>

            {/* BOX 2: EDITORIAL SUBTEXT (5 cols) */}
            <motion.div 
                custom={2} variants={boxVariants} initial="hidden" animate="visible"
                className="w-full h-[30vh] md:h-auto md:col-span-5 md:row-span-2 bg-[hsl(30,60%,99%)] flex items-end p-8 md:p-12 lg:p-14"
            >
                <motion.p custom={3} variants={textVariants} initial="hidden" animate="visible" className="text-[16px] md:text-[20px] text-[hsl(15,30%,40%)] leading-[1.6] font-light max-w-[500px]">
                    We protect your enterprise by placing an intelligent safety net between your users and your generative AI. Regulayer instantly enforces safe policies, pauses risky actions for human review, and translates your operational telemetry into mathematically verified EU AI Act compliance reports.
                </motion.p>
            </motion.div>

            {/* BOX 3: SECONDARY CTA (3 cols) */}
            <Link href="/architecture" passHref legacyBehavior>
                <motion.a 
                    custom={3} variants={boxVariants} initial="hidden" animate="visible"
                    className="block w-full h-[30vh] md:h-auto md:col-span-3 md:row-span-2 bg-white flex flex-col justify-between p-8 md:p-12 group transition-colors hover:bg-[#F8F9FA] cursor-pointer"
                >
                    <div className="flex justify-between items-center w-full pb-6 border-b border-[hsl(15,30%,85%)]">
                        <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[hsl(15,30%,50%)]">Conformity Reports</span>
                        <DownloadCloud className="w-4 h-4 text-[hsl(15,30%,50%)] group-hover:text-[hsl(15,85%,58%)] transition-colors duration-500" />
                    </div>
                    <motion.div custom={4} variants={textVariants} initial="hidden" animate="visible" className="mt-8 md:mt-0 text-[clamp(2rem,2.5vw,3rem)] font-bold tracking-tight leading-[1] text-[hsl(15,45%,15%)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                        Explore<br/>Compliance
                    </motion.div>
                </motion.a>
            </Link>

        </section>
    );
}
