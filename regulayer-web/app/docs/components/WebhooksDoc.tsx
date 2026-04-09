"use client";
import React from "react";
import { Webhook, Activity, FileJson, AlertCircle, CheckCircle } from "lucide-react";

export default function WebhooksDocComponent() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 border-b border-slate-200 pb-6">Webhooks & Events</h1>
      <p className="text-lg text-slate-500 mb-10 leading-relaxed">
        Webhooks allow your services to receive real-time HTTP notifications when significant compliance events occur within the Regulayer platform. Build automated downstream responses to AI safety issues instantly.
      </p>

      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
        <Webhook className="text-slate-500" />
        Configuring Webhooks
      </h2>
      <p className="text-slate-600 mb-6 leading-relaxed">
        You can register webhook destination URLs and select which event types to subscribe to within the dashboard under <strong>Settings &gt; Developers &gt; Webhooks</strong>. Regulayer expects your endpoint to return a <code className="bg-slate-100 px-1 rounded text-cyan-400">2xx</code> status code within 5 seconds; otherwise, the request will be retried with exponential backoff.
      </p>

      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 pt-6 border-t border-slate-200">
        <Activity className="text-emerald-400" />
        Supported Events
      </h2>

      <div className="space-y-8 mb-12">
        {/* Event 1 */}
        <div className="bg-white/50 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-rose-950/20 px-6 py-4 flex items-center justify-between border-b border-rose-900/40">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <code className="text-rose-400 font-bold">decision.flagged</code>
            </div>
            <span className="bg-rose-500/10 text-rose-300 text-xs px-2.5 py-1 rounded-full border border-rose-500/20 font-medium">Critical Event</span>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Dispatched immediately when the Governance Engine evaluates an AI decision and determines it violates one or more active governance rules.
            </p>
            <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">Common Use Cases</h4>
            <ul className="list-disc list-inside text-sm text-slate-500 mb-6 space-y-1">
              <li>Automatically locking a user's account if they aggressively trigger jailbreak policies.</li>
              <li>Paging on-call compliance officers via PagerDuty for critical PII leaks.</li>
              <li>Sending an alert to a dedicated Slack or Microsoft Teams channel.</li>
            </ul>
            <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 flex items-center gap-2">
              <FileJson className="w-4 h-4" /> Payload Example
            </h4>
            <div className="bg-white border border-slate-200 p-4 rounded-lg overflow-x-auto">
              <code className="text-xs font-mono text-emerald-400 whitespace-pre">{`{
 "id": "evt_123456789",
 "type": "decision.flagged",
 "created_at": "2026-02-23T12:00:00Z",
 "data": {
  "decision_id": "aa11bb22-cc33-44dd-55ee-ff6677889900",
  "project_id": "project_abc123",
  "system_name": "customer-support-bot",
  "policy_violations": [
   {
    "rule_id": "rule_pii_01",
    "rule_name": "Block Sensitive Customer Data"
   }
  ]
 }
}`}</code>
            </div>
          </div>
        </div>

        {/* Event 2 */}
        <div className="bg-white/50 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-zinc-950/20 px-6 py-4 flex items-center justify-between border-b border-zinc-900/40">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-slate-500" />
              <code className="text-slate-500 font-bold">governance.status_changed</code>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Dispatched when a human compliance officer manually reviews a flagged decision in the dashboard and marks it as <strong>Approved</strong> or <strong>Rejected</strong>.
            </p>
            <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">Common Use Cases</h4>
            <ul className="list-disc list-inside text-sm text-slate-500 mb-6 space-y-1">
              <li>Releasing funds for a transaction after a human overrides the initial AI risk assessment.</li>
              <li>Updating internal BI dashboards with final compliance audit states.</li>
            </ul>
            <div className="bg-white border border-slate-200 p-4 rounded-lg overflow-x-auto">
              <code className="text-xs font-mono text-emerald-400 whitespace-pre">{`{
 "id": "evt_987654321",
 "type": "governance.status_changed",
 "created_at": "2026-02-23T14:30:15Z",
 "data": {
  "decision_id": "aa11bb22-cc33-44dd-55ee-ff6677889900",
  "previous_status": "flagged",
  "new_status": "approved",
  "reviewed_by": "auditor_jane@enterprise.com",
  "justification": "False positive. Data was public synthetic test data."
 }
}`}</code>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 pt-6 border-t border-slate-200">
        Security & Authentication
      </h2>
      <p className="text-slate-600 mb-4 leading-relaxed">
        Webhook payloads sent by Regulayer are cryptographically signed using an HMAC-SHA256 signature, ensuring they originated from us and were not altered in transit.
        You should verify the <code className="bg-slate-100 px-1 rounded text-cyan-400">Regulayer-Signature</code> header in your endpoint using your Endpoint Secret.
      </p>
    </div>
  );
}
