"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { FeaturesGrid } from "@/components/sections/features-grid";
import { HowItWorks } from "@/components/sections/how-it-works";
import { IntegrationsSection } from "@/components/sections/integrations-section";
import { CodeShowcase } from "@/components/sections/code-showcase";
import { PricingSection } from "@/components/sections/pricing-section";
import { FinalCTA } from "@/components/sections/final-cta";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { motion } from "framer-motion";

/* ═══════════ PAGE ═══════════ */
export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-[hsl(15,85%,58%,0.2)] selection:text-[hsl(15,45%,15%)] cursor-none">
            {/* The God-Level Magnetic Cursor */}
            <CustomCursor />

            {/* The Cinematic DOM Reveal Matrix */}
            <motion.div 
                initial={{ y: 0 }} 
                animate={{ y: "-100vh" }} 
                transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
                className="fixed inset-0 z-[100000] bg-[hsl(30,60%,99%)] flex items-center justify-center pointer-events-none"
            >
                {/* Embedded pre-loader spinning dial */}
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 rounded-full border-[2px] border-[hsl(15,30%,85%)] border-t-[hsl(15,85%,58%)]" />
            </motion.div>

            {/* The Main Application Scale-In */}
            <motion.div 
                initial={{ scale: 1.08, opacity: 0, filter: "blur(10px)" }} 
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }} 
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="will-change-[transform,opacity,filter]"
            >
                <Navbar />
                <HeroSection />
                <FeaturesGrid />
                <HowItWorks />
                <IntegrationsSection />
                <CodeShowcase />
                <PricingSection />
                <FinalCTA />
                <Footer />
            </motion.div>
        </div>
    );
}
