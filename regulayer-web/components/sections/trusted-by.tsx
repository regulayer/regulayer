"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const logos = [
    { name: "Acme Corp", icon: "A" },
    { name: "GlobalTech", icon: "G" },
    { name: "Nexus Innovations", icon: "N" },
    { name: "Horizon Fin", icon: "H" },
    { name: "Vanguard Systems", icon: "V" },
    { name: "Quantum Data", icon: "Q" },
];

export function TrustedBy() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <section ref={ref} className="py-12 bg-background border-t border-border/50 overflow-hidden">
            <div className="container relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8"
                >
                    <p className="text-[13px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Trusted by industry-leading compliance teams
                    </p>
                </motion.div>

                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    {logos.map((logo, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex items-center gap-2 text-foreground font-bold tracking-tight text-xl"
                        >
                            <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center text-sm">
                                {logo.icon}
                            </div>
                            {logo.name}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
