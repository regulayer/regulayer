"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ChevronRight, FileCode2, TerminalSquare, Search, BookOpen, Layers, Download } from "lucide-react";
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
      { id: "auth", title: "Authentication & RBAC" }
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
      { id: "recording", title: "Cryptographic Vault" },
      { id: "policies", title: "Policy Engine" },
      { id: "governance", title: "HITL Governance" },
      { id: "webhooks", title: "Webhooks & Events" }
    ]
  },
  {
    category: "Compliance",
    icon: FileCode2,
    items: [
      { id: "reports", title: "Compliance Reports" },
      { id: "soc2", title: "SOC 2 Type II" },
      { id: "euai", title: "EU AI Act Compliance" }
    ]
  }
];

export default function DocsPage() {
  const [activeDoc, setActiveDoc] = useState("quickstart");

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[hsl(15,85%,58%,0.2)] selection:text-[hsl(15,45%,15%)] flex flex-col">
      <Navbar />

      <div className="pt-16 max-w-[90rem] mx-auto flex">

        {/* ─── SIDEBAR NAV ─── */}
        <aside className="fixed top-16 bottom-0 w-64 border-r border-[hsl(15,30%,85%)] bg-[hsl(30,60%,99%)] overflow-y-auto hidden md:block z-10">
          <div className="p-5 border-b border-[hsl(15,30%,85%)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search documentation..."
                className="w-full bg-white border border-[hsl(15,30%,85%)] rounded-[4px] py-2.5 pl-9 pr-3 text-[13px] text-[hsl(15,45%,15%)] placeholder-[hsl(15,30%,60%)] focus:border-[hsl(15,85%,58%)] focus:ring-1 focus:ring-[hsl(15,85%,58%,0.2)] outline-none transition-all shadow-sm font-mono"
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
                        className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-[4px] text-[13px] transition-all duration-200 ${activeDoc === item.id
                          ? 'bg-[hsl(15,45%,15%)] text-white shadow-[0_2px_10px_rgb(0,0,0,0.1)] font-medium'
                          : 'text-[hsl(15,30%,45%)] hover:text-[hsl(15,45%,15%)] hover:bg-[hsl(15,30%,85%,0.3)]'
                          }`}
                      >
                        {item.title}
                        {activeDoc === item.id && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Knowledge Base Download */}
          <div className="px-5 pb-8 mt-4 border-t border-[hsl(15,30%,85%)] pt-5">
            <span className="text-[10px] font-mono tracking-widest text-[hsl(15,85%,58%)] uppercase mb-3 block font-bold">LLM Injection</span>
            <a
              href="/regulayer-complete-knowledge-base.txt"
              download="regulayer-complete-knowledge-base.txt"
              className="flex items-center justify-between px-4 py-3 bg-[hsl(15,45%,15%)] text-white rounded-[4px] text-[12px] font-bold tracking-wide hover:bg-[hsl(15,85%,58%)] transition-colors w-full shadow-md group"
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>AI Fine-Tuning Doc</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </a>
            <p className="text-[11px] text-[hsl(15,30%,50%)] mt-2.5 px-0.5 leading-relaxed">
              Feed this .txt to ChatGPT or Claude to instantly train it on Regulayer's core proxy architecture.
            </p>

            <a
              href="/regulayer-agentic-master-prompt.txt"
              download="regulayer-agentic-master-prompt.txt"
              className="mt-5 flex items-center justify-between px-4 py-3 bg-white text-[hsl(15,45%,15%)] border border-[hsl(15,45%,15%)] rounded-[4px] text-[12px] font-bold tracking-wide hover:bg-[hsl(15,45%,15%)] hover:text-white transition-colors w-full shadow-sm group"
            >
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4" />
                <span>Agent Integration Manual</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </a>
            <p className="text-[11px] text-[hsl(15,30%,50%)] mt-2.5 px-0.5 leading-relaxed">
              Supreme codebase integration snippets for your AI IDE (Cursor, Copilot).
            </p>
          </div>
        </aside>

        {/* ─── MAIN CONTENT AREA ─── */}
        <main className="flex-1 md:ml-64 bg-white min-h-screen border-l border-[hsl(15,30%,85%)]">
          <div className="max-w-[50rem] mx-auto py-16 px-6 lg:px-16 xl:px-20 relative">
            
            {/* Subtle Gradient Glow Background */}
            <div className="absolute top-0 left-0 right-0 h-[500px] pointer-events-none opacity-40" style={{ background: "radial-gradient(ellipse at 50% 0%, hsla(15, 85%, 58%, 0.1), transparent 70%)" }} />
            <div className="absolute top-0 right-[20%] w-[600px] h-[600px] pointer-events-none opacity-[0.15] blur-[100px]" style={{ background: "radial-gradient(circle, hsl(15,85%,58%) 0%, transparent 70%)" }} />

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[12px] font-mono tracking-wider text-[hsl(15,30%,45%)] mb-12 uppercase relative z-10 border-b border-[hsl(15,30%,85%)] pb-4">
              <span className="text-[hsl(15,30%,60%)]">Docs</span>
              <ChevronRight className="w-3.5 h-3.5 text-[hsl(15,30%,85%)]" />
              <span className="font-bold text-[hsl(15,45%,15%)]">
                {docsGraph.flatMap(g => g.items).find(i => i.id === activeDoc)?.title}
              </span>
            </div>

            {/* dynamic active document content */}
            <article className="prose prose-slate max-w-none relative z-10 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[hsl(15,85%,58%)] prose-a:no-underline hover:prose-a:underline prose-code:text-[hsl(15,45%,15%)] prose-code:bg-[hsl(30,60%,97%)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-[3px] prose-code:border prose-code:border-[hsl(15,30%,85%)] prose-code:font-mono prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[hsl(15,45%,15%)] prose-pre:text-white prose-pre:border prose-pre:border-[hsl(15,45%,15%)] prose-pre:rounded-[4px] prose-pre:shadow-lg prose-strong:text-[hsl(15,45%,15%)] prose-strong:font-bold text-[16px] leading-[1.75] text-[hsl(15,45%,25%)] tracking-[0.01em]">
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
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Human-in-the-Loop Governance</h1>
      <p className="text-lg text-slate-500 mb-6 leading-relaxed">The HITL Governance Queue ensures that high-risk AI decisions receive structured human oversight before impacting end users. This directly satisfies EU AI Act Article 14 requirements for human supervision of high-risk AI systems.</p>

      <h2 className="text-2xl font-semibold mb-4 text-slate-700">The Review Workflow</h2>
      <ol className="list-decimal list-inside space-y-4 text-slate-600 mb-8 bg-white/40 p-6 rounded-xl border border-slate-200">
        <li><strong className="text-slate-700">Policy Trigger:</strong> An AI decision trips a policy rule configured with <code className="bg-slate-100 px-1 rounded text-xs">require_approval</code> or <code className="bg-slate-100 px-1 rounded text-xs">flag</code> action.</li>
        <li><strong className="text-slate-700">Queue Entry:</strong> The decision enters the &quot;Pending Review&quot; queue visible on the Governance page of the dashboard. If Slack is configured, a rich notification is dispatched.</li>
        <li><strong className="text-slate-700">Human Review:</strong> A compliance officer opens the decision and examines the full context: AI input (prompt), AI output (response), triggering policy, risk scores, and metadata.</li>
        <li><strong className="text-slate-700">Action:</strong> The reviewer takes one of these actions:
          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
            <li><strong>Approve</strong> — Decision is released. Mandatory justification text is recorded.</li>
            <li><strong>Reject</strong> — Decision is blocked. A decline message is sent (custom or default). Justification recorded.</li>
            <li><strong>Annotate</strong> — Add notes for other reviewers or auditors without changing status.</li>
            <li><strong>Tag</strong> — Categorize the decision for filtering and reporting.</li>
            <li><strong>Escalate</strong> — Flag for senior review or forward to a different team.</li>
          </ul>
        </li>
        <li><strong className="text-slate-700">Audit Trail:</strong> Every action (approve, reject, annotate, tag) is cryptographically recorded with the reviewer&apos;s identity, timestamp, and justification in the immutable audit vault.</li>
      </ol>

      <h3 className="text-xl font-semibold mb-3 pt-6 border-t border-slate-200">API Reference</h3>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">Endpoint</th>
              <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr><td className="px-4 py-2 font-mono text-xs text-orange-500">GET /v1/governance/queue</td><td className="px-4 py-2 text-slate-500">Get pending review queue</td></tr>
            <tr><td className="px-4 py-2 font-mono text-xs text-orange-500">GET /v1/governance/&#123;id&#125;</td><td className="px-4 py-2 text-slate-500">Get decision governance details</td></tr>
            <tr><td className="px-4 py-2 font-mono text-xs text-orange-500">POST /v1/governance/&#123;id&#125;/reviews</td><td className="px-4 py-2 text-slate-500">Submit approve/reject review</td></tr>
            <tr><td className="px-4 py-2 font-mono text-xs text-orange-500">POST /v1/governance/&#123;id&#125;/annotations</td><td className="px-4 py-2 text-slate-500">Add annotation</td></tr>
            <tr><td className="px-4 py-2 font-mono text-xs text-orange-500">POST /v1/governance/&#123;id&#125;/tags</td><td className="px-4 py-2 text-slate-500">Add tag</td></tr>
            <tr><td className="px-4 py-2 font-mono text-xs text-orange-500">GET /v1/governance/&#123;id&#125;/evidence</td><td className="px-4 py-2 text-slate-500">Get evidence bundle</td></tr>
            <tr><td className="px-4 py-2 font-mono text-xs text-orange-500">GET /v1/governance/&#123;id&#125;/timeline</td><td className="px-4 py-2 text-slate-500">Get event timeline</td></tr>
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> For comprehensive governance policy syntax including semantic analysis, numeric thresholds, and regex rules, see the Policy Engine documentation.
        </p>
      </div>
    </div>
  );
}
