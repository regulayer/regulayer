"use client";
import React from "react";

const CodeBlock = ({ children, title }: { children: string; title?: string }) => (
  <div className="bg-slate-900 rounded-lg overflow-hidden mb-4 border border-slate-700">
    {title && <div className="bg-slate-800 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-700">{title}</div>}
    <pre className="p-4 overflow-x-auto"><code className="text-sm font-mono text-emerald-400">{children}</code></pre>
  </div>
);

export default function WebhooksDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Webhooks &amp; Events</h1>
      <p className="text-lg text-slate-500 mb-10 leading-relaxed">
        Regulayer can dispatch real-time webhook notifications when key governance events occur. Use webhooks to integrate Regulayer with your existing incident management, alerting, or workflow automation systems.
      </p>

      <h2 className="text-2xl font-semibold mb-6">Supported Events</h2>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-10">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">Event</th>
              <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              ["decision.recorded", "A new AI decision was recorded in the vault"],
              ["decision.flagged", "A decision was flagged by a policy (action: flag)"],
              ["decision.blocked", "A decision was blocked by a policy (action: block)"],
              ["governance.review_required", "A decision requires human review (action: require_approval)"],
              ["governance.approved", "A compliance officer approved a flagged decision"],
              ["governance.rejected", "A compliance officer rejected a flagged decision"],
              ["incident.created", "A new compliance incident was reported"],
              ["incident.resolved", "A compliance incident was resolved"],
            ].map(([event, desc], i) => (
              <tr key={i}>
                <td className="px-4 py-3 font-mono text-xs text-orange-500">{event}</td>
                <td className="px-4 py-3 text-slate-500">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-semibold mb-6 border-t border-slate-200 pt-8">Payload Format</h2>
      <p className="text-slate-500 mb-4 text-sm leading-relaxed">
        All webhook payloads follow a consistent JSON structure:
      </p>
      <CodeBlock title="Example: governance.review_required">{`{
  "event": "governance.review_required",
  "timestamp": "2026-04-10T05:30:00.000Z",
  "webhook_id": "wh_a1b2c3d4e5f6",
  "data": {
    "decision_id": "uuid-of-decision",
    "project_id": "uuid-of-project",
    "organization_id": "uuid-of-org",
    "model": "gpt-4",
    "system_name": "loan-approval-agent",
    "policy_triggered": "High-Value Approval Gate",
    "action": "require_approval",
    "risk_score": 0.87
  }
}`}</CodeBlock>

      <h2 className="text-2xl font-semibold mb-6 border-t border-slate-200 pt-8">Security</h2>
      <p className="text-slate-500 mb-4 text-sm leading-relaxed">
        All webhook deliveries include a signature header for verification:
      </p>
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-500 mb-6">
        <li>Header: <code className="bg-slate-100 px-1 rounded">X-Regulayer-Signature</code></li>
        <li>Algorithm: HMAC-SHA256 with your webhook secret</li>
        <li>Always verify the signature before processing the payload</li>
        <li>Endpoints must respond with HTTP 200 within 30 seconds</li>
        <li>Failed deliveries are retried up to 3 times with exponential backoff</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-6 border-t border-slate-200 pt-8">Use Cases</h2>
      <div className="space-y-4 mb-10">
        {[
          { title: "Slack / Teams Alerting", desc: "Route governance.review_required events to a Slack channel so compliance officers get instant notifications when a decision needs human review." },
          { title: "SIEM Integration", desc: "Forward decision.blocked events to your SIEM (Splunk, Datadog, etc.) for centralized security monitoring and incident correlation." },
          { title: "Ticketing Systems", desc: "Create Jira or ServiceNow tickets automatically when incidents occur, with full context from the Regulayer event payload." },
          { title: "Custom Dashboards", desc: "Stream decision.recorded events to your internal analytics pipeline for custom visualizations and business intelligence." },
        ].map((item, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-1">{item.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
