"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ApiReferencePage() {
  return (
    <main className="relative min-h-screen pt-32 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mb-16">
          <span className="premium-pill mb-6">Developers</span>
          <h1 className="text-5xl md:text-7xl font-bold mb-8">API <span className="premium-serif-italic">Reference</span></h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Complete REST API documentation for Regulayer. Build your own cryptographic attestations pipeline.
          </p>
        </motion.div>
        <div className="warm-card-featured p-10 mt-10 text-center">
          <h2 className="font-bold text-2xl mb-4">Coming soon</h2>
          <p className="text-muted-foreground">The public API reference is currently being written.</p>
        </div>
      </div>
      <div className="new-age-bg">
        <div className="new-age-orb-1" />
        <div className="new-age-orb-3" />
      </div>
    </main>
  );
}
