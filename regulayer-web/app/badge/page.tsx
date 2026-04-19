"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Copy, Check, Code2 } from "lucide-react";
import Link from "next/link";

const badges = [
  { variant: "compliant", label: "EU AI Act Compliant", desc: "Show that your AI systems meet EU AI Act requirements" },
  { variant: "governed", label: "AI Governance Active", desc: "Display active AI governance with human oversight" },
  { variant: "audited", label: "Cryptographic Audit Trail", desc: "Prove tamper-proof audit logging is in place" },
  { variant: "hitl", label: "Human-in-the-Loop Verified", desc: "Show HITL governance is operational" },
  { variant: "iso", label: "ISO 42001 Conformant", desc: "Display ISO/IEC 42001:2023 alignment" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold tracking-wide border border-[hsl(15,30%,85%)] hover:bg-[hsl(30,60%,97%)] transition-colors"
    >
      {copied ? <><Check className="w-3 h-3 text-emerald-500" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
    </button>
  );
}

export default function BadgePage() {
  const [style, setStyle] = useState<"light" | "dark">("light");

  return (
    <div className="min-h-screen bg-[hsl(30,60%,99%)] text-[hsl(15,45%,15%)] antialiased">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-12 lg:pt-44 lg:pb-16 border-b border-[hsl(15,30%,85%)] relative">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <span className="text-[11px] font-mono tracking-[0.2em] text-[hsl(15,30%,45%)] uppercase mb-6 block">Free Trust Badge</span>
          <h1 className="text-[clamp(2.2rem,4.5vw,3.5rem)] font-bold tracking-tight leading-[1.05] mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Show the world your AI<br/>
            <span className="premium-serif-italic font-light text-[hsl(15,85%,58%)]">is compliant.</span>
          </h1>
          <p className="text-[18px] text-[hsl(15,25%,45%)] leading-relaxed max-w-2xl font-light">
            Add the Regulayer compliance badge to your website, documentation, or app. One line of HTML. Five badge variants. Dark and light themes. Free forever.
          </p>
        </div>
      </section>

      {/* Style Toggle */}
      <section className="py-6 border-b border-[hsl(15,30%,85%)]">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 flex items-center gap-4">
          <span className="text-[11px] font-mono text-[hsl(15,30%,50%)] uppercase tracking-wider font-bold">Theme:</span>
          <button onClick={() => setStyle("light")} className={`px-4 py-2 text-[12px] font-bold ${style === "light" ? "bg-[hsl(15,45%,15%)] text-white" : "bg-white border border-[hsl(15,30%,85%)]"}`}>Light</button>
          <button onClick={() => setStyle("dark")} className={`px-4 py-2 text-[12px] font-bold ${style === "dark" ? "bg-[hsl(15,45%,15%)] text-white" : "bg-white border border-[hsl(15,30%,85%)]"}`}>Dark</button>
        </div>
      </section>

      {/* Badge Gallery */}
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 space-y-8">
          {badges.map(b => {
            const imgUrl = `https://regulayer.tech/api/badge?variant=${b.variant}&style=${style}`;
            const embedHtml = `<a href="https://regulayer.tech" title="${b.label} — Powered by Regulayer"><img src="${imgUrl}" alt="${b.label}" width="240" height="44" /></a>`;
            const embedMarkdown = `[![${b.label}](${imgUrl})](https://regulayer.tech)`;

            return (
              <div key={b.variant} className="border border-[hsl(15,30%,85%)] bg-white p-6 lg:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-[18px] font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>{b.label}</h2>
                    <p className="text-[13px] text-[hsl(15,30%,50%)]">{b.desc}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${style === "dark" ? "bg-[hsl(15,45%,10%)]" : "bg-[hsl(30,60%,97%)]"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/api/badge?variant=${b.variant}&style=${style}`} alt={b.label} width={240} height={44} />
                  </div>
                </div>

                {/* HTML Embed */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-[hsl(15,30%,50%)]" />
                      <span className="text-[11px] font-mono text-[hsl(15,30%,50%)] uppercase tracking-wider font-bold">HTML</span>
                    </div>
                    <CopyButton text={embedHtml} />
                  </div>
                  <pre className="bg-[hsl(15,45%,15%)] text-[hsl(15,85%,70%)] p-4 text-[12px] font-mono overflow-x-auto whitespace-pre-wrap break-all">{embedHtml}</pre>
                </div>

                {/* Markdown Embed */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-[hsl(15,30%,50%)]" />
                      <span className="text-[11px] font-mono text-[hsl(15,30%,50%)] uppercase tracking-wider font-bold">Markdown (GitHub README)</span>
                    </div>
                    <CopyButton text={embedMarkdown} />
                  </div>
                  <pre className="bg-[hsl(15,45%,15%)] text-[hsl(15,85%,70%)] p-4 text-[12px] font-mono overflow-x-auto whitespace-pre-wrap break-all">{embedMarkdown}</pre>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Add Badge */}
      <section className="py-12 border-t border-[hsl(15,30%,85%)]">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <h2 className="text-[24px] font-bold tracking-tight mb-6" style={{ fontFamily: "var(--font-space-grotesk)" }}>Why display the compliance badge?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Build customer trust", desc: "Show your customers you take AI safety seriously with visible compliance certification." },
              { title: "Demonstrate regulatory readiness", desc: "Signal to enterprise buyers and regulators that your AI systems meet EU AI Act requirements." },
              { title: "Competitive differentiation", desc: "Stand out from competitors who can't demonstrate equivalent compliance infrastructure." },
              { title: "Audit-ready documentation", desc: "The badge links directly to your Regulayer compliance dashboard for instant verification." },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-[hsl(15,30%,85%)] p-5">
                <h3 className="text-[14px] font-bold mb-2">{item.title}</h3>
                <p className="text-[13px] text-[hsl(15,25%,45%)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
