"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArrowLeft, Download } from "lucide-react";

const endpoints = [
  { method: "POST", path: "/v1/auth/register", desc: "Register a new user account" },
  { method: "POST", path: "/v1/auth/login", desc: "Authenticate and obtain JWT" },
  { method: "GET", path: "/v1/auth/me", desc: "Get current user profile" },
  { method: "POST", path: "/v1/orgs", desc: "Create a new organization" },
  { method: "GET", path: "/v1/orgs", desc: "List user's organizations" },
  { method: "GET", path: "/v1/orgs/{org_id}", desc: "Get organization by ID" },
  { method: "PATCH", path: "/v1/orgs/{org_id}", desc: "Update organization details" },
  { method: "PATCH", path: "/v1/orgs/{org_id}/status", desc: "Update org status (active/suspended)" },
  { method: "GET", path: "/v1/orgs/{org_id}/members", desc: "List organization members" },
  { method: "POST", path: "/v1/orgs/{org_id}/members/invite", desc: "Invite member by email" },
  { method: "PUT", path: "/v1/orgs/{org_id}/members/{user_id}", desc: "Update member role" },
  { method: "DELETE", path: "/v1/orgs/{org_id}/members/{user_id}", desc: "Remove member" },
  { method: "POST", path: "/v1/orgs/{org_id}/projects", desc: "Create a new project" },
  { method: "GET", path: "/v1/orgs/{org_id}/projects", desc: "List projects for organization" },
  { method: "GET", path: "/v1/projects/{project_id}", desc: "Get project by ID" },
  { method: "PATCH", path: "/v1/projects/{project_id}", desc: "Update project details" },
  { method: "POST", path: "/v1/projects/{project_id}/keys", desc: "Create API key for project" },
  { method: "GET", path: "/v1/projects/{project_id}/keys", desc: "List API keys for project" },
  { method: "DELETE", path: "/v1/keys/{key_id}", desc: "Revoke an API key" },
  { method: "POST", path: "/v1/decisions", desc: "Record a new AI decision" },
  { method: "GET", path: "/v1/decisions", desc: "List decisions with filters" },
  { method: "GET", path: "/v1/decisions/{id}", desc: "Get decision details" },
  { method: "GET", path: "/v1/governance/queue", desc: "Get HITL pending review queue" },
  { method: "GET", path: "/v1/governance/{id}", desc: "Get governance details for decision" },
  { method: "POST", path: "/v1/governance/{id}/reviews", desc: "Submit approve/reject review" },
  { method: "POST", path: "/v1/governance/{id}/annotations", desc: "Add annotation to decision" },
  { method: "POST", path: "/v1/governance/{id}/tags", desc: "Add tag to decision" },
  { method: "GET", path: "/v1/governance/{id}/evidence", desc: "Get evidence bundle" },
  { method: "GET", path: "/v1/governance/{id}/timeline", desc: "Get event timeline" },
  { method: "GET", path: "/v1/policies", desc: "List all policies" },
  { method: "POST", path: "/v1/policies", desc: "Create a new policy" },
  { method: "GET", path: "/v1/policies/{id}", desc: "Get policy details" },
  { method: "PATCH", path: "/v1/policies/{id}/enable", desc: "Enable or disable a policy" },
  { method: "POST", path: "/v1/orgs/{org_id}/compliance/ai-systems", desc: "Register an AI system" },
  { method: "GET", path: "/v1/orgs/{org_id}/compliance/ai-systems", desc: "List AI systems" },
  { method: "POST", path: "/v1/orgs/{org_id}/compliance/conformity", desc: "Create conformity assessment" },
  { method: "GET", path: "/v1/orgs/{org_id}/compliance/conformity", desc: "List conformity assessments" },
  { method: "POST", path: "/v1/orgs/{org_id}/compliance/fria", desc: "Create FRIA" },
  { method: "GET", path: "/v1/orgs/{org_id}/compliance/fria", desc: "List FRIAs" },
  { method: "POST", path: "/v1/orgs/{org_id}/compliance/tech-docs", desc: "Create technical documentation" },
  { method: "GET", path: "/v1/orgs/{org_id}/compliance/tech-docs", desc: "List technical documentation" },
  { method: "POST", path: "/v1/orgs/{org_id}/compliance/monitoring", desc: "Create monitoring plan" },
  { method: "GET", path: "/v1/orgs/{org_id}/compliance/monitoring", desc: "List monitoring plans" },
  { method: "POST", path: "/v1/orgs/{org_id}/compliance/incidents", desc: "Report compliance incident" },
  { method: "GET", path: "/v1/orgs/{org_id}/compliance/incidents", desc: "List compliance incidents" },
  { method: "GET", path: "/v1/reports/chain/default", desc: "Hash chain integrity report" },
  { method: "GET", path: "/v1/reports/governance", desc: "Governance review summary" },
  { method: "GET", path: "/v1/reports/incidents", desc: "Compliance incident report" },
  { method: "GET", path: "/v1/reports/usage", desc: "Usage analytics (JSON/PDF)" },
  { method: "GET", path: "/v1/reports/sla", desc: "SLA compliance metrics" },
  { method: "GET", path: "/v1/billing/status", desc: "Get billing status" },
  { method: "POST", path: "/v1/billing/checkout", desc: "Create Stripe checkout session" },
  { method: "POST", path: "/v1/billing/portal", desc: "Create Stripe portal session" },
  { method: "GET", path: "/v1/usage/{org_id}", desc: "Get usage summary" },
  { method: "GET", path: "/v1/usage/orgs/{org_id}/daily", desc: "Get daily usage breakdown" },
  { method: "GET", path: "/v1/orgs/{org_id}/audit-logs", desc: "Get organization audit trail" },
  { method: "GET", path: "/v1/public/status", desc: "Platform health check (no auth)" },
];

const methodColor: Record<string, string> = {
  GET: "bg-blue-100 text-blue-700",
  POST: "bg-green-100 text-green-700",
  PATCH: "bg-yellow-100 text-yellow-700",
  PUT: "bg-orange-100 text-orange-700",
  DELETE: "bg-red-100 text-red-700",
};

export default function ApiReferencePage() {
  return (
    <div className="min-h-screen bg-background text-slate-900 font-sans">
      <Navbar />
      <div className="pt-24 pb-20 max-w-5xl mx-auto px-6">
        <Link href="/docs" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition mb-8">
          <ArrowLeft size={14} /> Back to Documentation
        </Link>

        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">API Reference</h1>
        <p className="text-lg text-slate-500 mb-4 leading-relaxed max-w-2xl">
          Complete REST API documentation for the Regulayer platform. All endpoints require authentication via Bearer JWT or API key unless otherwise noted.
        </p>
        <p className="text-sm text-slate-400 mb-8">
          Base URL: <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">https://api.regulayer.tech</code>
        </p>

        {/* Download CTA */}
        <a
          href="/regulayer-complete-knowledge-base.txt"
          download="regulayer-complete-knowledge-base.txt"
          className="inline-flex items-center gap-2 px-4 py-2 mb-10 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Download complete knowledge base (.txt)
        </a>

        {/* Endpoints Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-semibold w-20">Method</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">Endpoint</th>
                <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {endpoints.map((ep, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${methodColor[ep.method] || "bg-slate-100 text-slate-700"}`}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-700">{ep.path}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8">
          <Link href="/docs" className="text-sm text-slate-500 hover:text-slate-700 transition flex items-center gap-1.5">
            <ArrowLeft size={14} /> Back to Docs
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
