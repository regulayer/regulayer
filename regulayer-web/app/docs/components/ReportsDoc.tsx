"use client";
import React from "react";

const CodeBlock = ({ children, title }: { children: string; title?: string }) => (
  <div className="bg-slate-900 rounded-lg overflow-hidden mb-4 border border-slate-700">
    {title && <div className="bg-slate-800 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-700">{title}</div>}
    <pre className="p-4 overflow-x-auto"><code className="text-sm font-mono text-emerald-400">{children}</code></pre>
  </div>
);

export default function ReportsDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Compliance Reports</h1>
      <p className="text-lg text-slate-500 mb-10 leading-relaxed">
        Regulayer generates board-ready compliance reports automatically from your AI governance data. Reports can be accessed via the API or exported from the dashboard. Available on Pro and Enterprise plans.
      </p>

      <h2 className="text-2xl font-semibold mb-6">Available Report Types</h2>

      <div className="space-y-6 mb-10">
        <div className="border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-700">Chain Integrity Report</h3>
            <code className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">GET /v1/reports/chain/default</code>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            Verifies the mathematical integrity of your entire hash chain. Walks through every record and confirms that each SHA-256 hash correctly links to its predecessor. Detects any unauthorized modifications to historical records.
          </p>
          <p className="text-xs text-slate-400">Returns: Chain length, verification status (pass/fail), first broken link (if any), total records verified.</p>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-700">Governance Review Report</h3>
            <code className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">GET /v1/reports/governance</code>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            Comprehensive summary of all HITL governance reviews for the reporting period. Includes: total decisions reviewed, approval/rejection ratios, average review time, reviewer activity, and justification logs.
          </p>
          <p className="text-xs text-slate-400">Ideal for: Board presentations, regulatory submissions, EU AI Act Article 14 compliance evidence.</p>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-700">Incident Report</h3>
            <code className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">GET /v1/reports/incidents</code>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            Lists all compliance incidents with severity classification, source, resolution status, remediation timelines, and root cause notes. Supports date range filtering.
          </p>
          <p className="text-xs text-slate-400">Ideal for: SOC 2 audits, incident postmortems, regulatory inquiries.</p>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-700">Usage Analytics Report</h3>
            <code className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">GET /v1/reports/usage</code>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            Detailed usage analytics including decision counts by project, model, and time period. Available in JSON and PDF formats.
          </p>
          <CodeBlock title="Query Parameters">format=json | pdf
start_date=2026-01-01
end_date=2026-03-31</CodeBlock>
        </div>

        <div className="border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-700">SLA Compliance Report</h3>
            <code className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">GET /v1/reports/sla</code>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            Service level agreement compliance metrics including platform uptime, API response times, incident resolution times, and data availability guarantees.
          </p>
          <p className="text-xs text-slate-400">Available on Enterprise plan. Custom SLA thresholds can be configured.</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6 border-t border-slate-200 pt-8">Dashboard Analytics</h2>
      <p className="text-slate-500 mb-6 text-sm leading-relaxed">
        The dashboard provides real-time visual analytics accessible to all team members:
      </p>
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-500 mb-6">
        <li><strong>Bar chart:</strong> Daily decision volume over the selected time period</li>
        <li><strong>Timeline filter:</strong> 24 hours, 7 days, 30 days, or 90 days</li>
        <li><strong>Project filter:</strong> Filter by specific project or view all</li>
        <li><strong>Metrics cards:</strong> Total decisions, usage percentage, active projects, team members</li>
        <li><strong>Auto-refresh:</strong> Data updates automatically when filters change</li>
      </ul>
    </div>
  );
}
