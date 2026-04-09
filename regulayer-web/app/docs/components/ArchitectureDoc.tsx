"use client";
import React from "react";
import { Server, Database, Brain, Activity, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function ArchitectureDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Architecture Overview</h1>
      <p className="text-lg text-slate-500 mb-10 leading-relaxed">
        Regulayer is designed for extreme scale. It operates as a highly optimized, decoupled microservices architecture designed to handle massive enterprise LLM inference loads without adding latency to your application's critical path.
      </p>

      <h2 className="text-2xl font-semibold mb-6">System Components</h2>

      <div className="space-y-8 mb-12">
        {/* Control Plane */}
        <div className="bg-white/50 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-100/40 px-6 py-4 flex items-center gap-3 border-b border-slate-200">
            <Server className="w-6 h-6 text-slate-500" />
            <h3 className="text-lg font-bold text-slate-900 m-0">The Control Plane</h3>
          </div>
          <div className="p-6">
            <p className="text-slate-500 mb-4 leading-relaxed">
              The centralized "brain" of Regulayer. It handles all administrative tasks, including organization settings, project management, RBAC (Role-Based Access Control), API key provisioning, and serving the frontend dashboard.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-700" /> PostgreSQL for relational data</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-700" /> Next.js/React frontend</li>
              </ul>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-700" /> Python (FastAPI) backend</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-700" /> Strict logical tenant isolation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recorder */}
        <div className="bg-white/50 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-100/40 px-6 py-4 flex items-center gap-3 border-b border-slate-200">
            <Zap className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-bold text-slate-900 m-0">The Recorder (Data Plane)</h3>
          </div>
          <div className="p-6">
            <p className="text-slate-500 mb-4 leading-relaxed">
              A hyper-optimized service designed to receive trace payloads continuously. It computes a SHA-256 hash of the payload, cryptographically signs it using the Organization's private key, concatenates it with the <em>previous</em> hash, and commits it. This forms a blockchain-style immutable ledger.
            </p>
            <div className="bg-white rounded-lg p-4 font-mono text-sm text-slate-500 border border-slate-200">
              Latency SLA: &lt; 50ms at P99 (Asynchronous from user request)
            </div>
          </div>
        </div>

        {/* Governance Engine */}
        <div className="bg-white/50 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-100/40 px-6 py-4 flex items-center gap-3 border-b border-slate-200">
            <Brain className="w-6 h-6 text-amber-400" />
            <h3 className="text-lg font-bold text-slate-900 m-0">The Governance Engine</h3>
          </div>
          <div className="p-6">
            <p className="text-slate-500 mb-4 leading-relaxed">
              An asynchronous evaluation pipeline that pulls raw decisions from the internal stream, evaluates them against active risk policies (e.g. data loss prevention, toxicity, prompt injection), and updates the decision's compliance status in the database.
            </p>
            <p className="text-slate-500 text-sm leading-relaxed">
              This microservice utilizes local lightweight models (like LLaMA 3) or third-party APIs to run zero-shot semantic checks on the recorded inputs and outputs.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6">Data Flow</h2>
      <div className="bg-white/30 border border-slate-200 rounded-xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center">
        <div className="flex-1">
          <div className="w-16 h-16 mx-auto bg-slate-700/10 border border-slate-700/30 rounded-full flex items-center justify-center mb-3">
            <code className="text-slate-500 font-bold">SDK</code>
          </div>
          <p className="text-sm text-slate-600 font-medium">Your Application</p>
          <p className="text-xs text-slate-500 mt-1">Sends async HTTP POST</p>
        </div>

        <ArrowRight className="w-8 h-8 text-slate-700 hidden md:block" />

        <div className="flex-1">
          <div className="w-16 h-16 mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mb-3">
            <Zap className="text-emerald-400" />
          </div>
          <p className="text-sm text-slate-600 font-medium">Recorder API</p>
          <p className="text-xs text-slate-500 mt-1">Hashes & Validates</p>
        </div>

        <ArrowRight className="w-8 h-8 text-slate-700 hidden md:block" />

        <div className="flex-1">
          <div className="w-16 h-16 mx-auto bg-slate-100 border border-slate-300 rounded-full flex items-center justify-center mb-3">
            <Database className="text-slate-500" />
          </div>
          <p className="text-sm text-slate-600 font-medium">Message Queue</p>
          <p className="text-xs text-slate-500 mt-1">Async buffering</p>
        </div>

        <ArrowRight className="w-8 h-8 text-slate-700 hidden md:block" />

        <div className="flex-1">
          <div className="w-16 h-16 mx-auto bg-brand-600/10 border border-amber-500/30 rounded-full flex items-center justify-center mb-3">
            <Brain className="text-amber-400" />
          </div>
          <p className="text-sm text-slate-600 font-medium">Policy Engine</p>
          <p className="text-xs text-slate-500 mt-1">Semantic Evaluation</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6">Security & Isolation</h2>
      <p className="text-slate-500 mb-6 leading-relaxed">
        Security is foundational to Regulayer. We employ defense-in-depth strategies across all layers of the stack:
      </p>
      <ul className="space-y-4 text-slate-600">
        <li className="flex gap-3">
          <ShieldCheck className="w-5 h-5 text-slate-500 flex-shrink-0" />
          <div><strong>Data Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256).</div>
        </li>
        <li className="flex gap-3">
          <ShieldCheck className="w-5 h-5 text-slate-500 flex-shrink-0" />
          <div><strong>Tenant Isolation:</strong> Organizations are logically separated at the database level with Row-Level Security (RLS) policies enforcing boundary limits.</div>
        </li>
        <li className="flex gap-3">
          <ShieldCheck className="w-5 h-5 text-slate-500 flex-shrink-0" />
          <div><strong>Key Management:</strong> The Control Plane never stores raw secrets; only heavily salted password hashes and rotated OAuth tokens are persisted.</div>
        </li>
      </ul>
    </div>
  );
}
