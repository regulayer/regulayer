"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ChevronRight, FileCode2, TerminalSquare, Search, BookOpen, Layers } from "lucide-react";
import PythonSDKDocComponent from "./components/PythonSDKDoc";
import GoSDKDocComponent from "./components/GoSDKDoc";
import NodeSDKDocComponent from "./components/NodeSDKDoc";
import IntroDocComponent from "./components/IntroDoc";
import QuickstartDocComponent from "./components/QuickstartDoc";
import ArchitectureDocComponent from "./components/ArchitectureDoc";
import AuthDocComponent from "./components/AuthDoc";
import RecordingDocComponent from "./components/RecordingDoc";
import PoliciesDocComponent from "./components/PoliciesDoc";
import WebhooksDocComponent from "./components/WebhooksDoc";
import ReportsDocComponent from "./components/ReportsDoc";
import Soc2DocComponent from "./components/Soc2Doc";
import EuAiDocComponent from "./components/EuAiDoc";

const docsGraph = [
  {
    category: "Getting Started",
    icon: BookOpen,
    items: [
      { id: "intro", title: "Introduction" },
      { id: "quickstart", title: "Quickstart Guide" },
      { id: "architecture", title: "Architecture Overview" },
      { id: "auth", title: "Authentication" }
    ]
  },
  {
    category: "SDK References",
    icon: TerminalSquare,
    items: [
      { id: "sdk-python", title: "Python SDK" },
      { id: "sdk-go", title: "Go SDK" },
      { id: "sdk-node", title: "Node.js SDK" }
    ]
  },
  {
    category: "Core Features",
    icon: Layers,
    items: [
      { id: "recording", title: "Cryptographic Recording" },
      { id: "policies", title: "Policy Enforcements" },
      { id: "governance", title: "Governance Reviews" },
      { id: "webhooks", title: "Webhooks & Events" }
    ]
  },
  {
    category: "Compliance",
    icon: FileCode2,
    items: [
      { id: "reports", title: "Compliance Reports" },
      { id: "soc2", title: "SOC 2 Type II" },
      { id: "euai", title: "EU AI Act Requirements" }
    ]
  }
];

export default function DocsPage() {
  const [activeDoc, setActiveDoc] = useState("quickstart");

  return (
    <div className="min-h-screen bg-background text-slate-900 font-sans selection:bg-brand-100">
      <Navbar />

      <div className="pt-16 max-w-[90rem] mx-auto flex">

        {/* ─── SIDEBAR NAV ─── */}
        <aside className="fixed top-16 bottom-0 w-64 border-r border-slate-200 bg-slate-50 overflow-y-auto hidden md:block">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search documentation..."
                className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm text-slate-600 placeholder-slate-400 focus:border-slate-300 outline-none transition-colors"
              />
            </div>
          </div>

          <nav className="p-4 space-y-8 pb-20">
            {docsGraph.map((section) => (
              <div key={section.category}>
                <div className="flex items-center gap-2 mb-3 px-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <section.icon className="w-3.5 h-3.5" />
                  {section.category}
                </div>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveDoc(item.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${activeDoc === item.id
                          ? 'bg-slate-100 text-slate-900 font-medium'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                          }`}
                      >
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* ─── MAIN CONTENT AREA ─── */}
        <main className="flex-1 md:ml-64 bg-background">
          <div className="max-w-4xl mx-auto py-12 px-6 lg:px-12">

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 font-medium">
              <span>Docs</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-600">
                {docsGraph.flatMap(g => g.items).find(i => i.id === activeDoc)?.title}
              </span>
            </div>

            {/* dynamic active document content */}
            <article className="prose prose-slate max-w-none">
              {activeDoc === 'intro' && <IntroDocComponent />}
              {activeDoc === 'quickstart' && <QuickstartDocComponent />}
              {activeDoc === 'architecture' && <ArchitectureDocComponent />}
              {activeDoc === 'sdk-python' && <PythonSDKDocComponent />}
              {activeDoc === 'sdk-go' && <GoSDKDocComponent />}
              {activeDoc === 'sdk-node' && <NodeSDKDocComponent />}
              {activeDoc === 'auth' && <AuthDocComponent />}
              {activeDoc === 'recording' && <RecordingDocComponent />}
              {activeDoc === 'policies' && <PoliciesDocComponent />}
              {activeDoc === 'governance' && <GovernanceDoc />}
              {activeDoc === 'webhooks' && <WebhooksDocComponent />}
              {activeDoc === 'reports' && <ReportsDocComponent />}
              {activeDoc === 'soc2' && <Soc2DocComponent />}
              {activeDoc === 'euai' && <EuAiDocComponent />}
            </article>

          </div>
          <div className="border-t border-slate-200">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}

function GovernanceDoc() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Governance Reviews</h1>
      <p className="text-lg text-slate-500 mb-6 leading-relaxed">Not all flagged AI decisions are inherently bad. The Governance Engine provides a structured workflow for compliance teams to review flagged decisions.</p>
      <h3 className="text-2xl font-semibold mb-4 text-slate-700">The Review Flow</h3>
      <ol className="list-decimal list-inside space-y-3 text-slate-500 mb-6 bg-white/40 p-6 rounded-xl border border-slate-200">
        <li><strong className="text-slate-700">Flagged:</strong> An AI Output trips a rule in the Policy Engine.</li>
        <li><strong className="text-slate-700">Queued:</strong> The decision enters the &quot;Pending Review&quot; queue on the dashboard.</li>
        <li><strong className="text-slate-700">Audited:</strong> A human compliance officer examines the context and marks it as <strong>Approved</strong> or <strong>Rejected</strong> with a mandatory text justification.</li>
      </ol>
      <p className="text-slate-500 text-sm mb-6 bg-slate-50 border border-slate-200 p-4 rounded-lg">
        This &quot;Human-in-the-Loop&quot; workflow satisfies EU AI Act requirements for high-risk AI deployments and SOC 2 incident remediation criteria.
      </p>
      <h3 className="text-xl font-semibold mb-3 pt-6 border-t border-slate-200">Governance Policy Engine Syntax</h3>
      <p className="text-slate-500 mb-6">
        Define declarative JSON rules that automatically evaluate every AI decision. We support semantic analysis via LLaMA 3, numeric thresholds, string matching, and more.
      </p>
      <div className="mt-4">
        <Link href="/docs/governance" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-lg transition font-medium text-sm">
          📖 View Full Governance Policy Docs →
        </Link>
      </div>
    </div>
  );
}
