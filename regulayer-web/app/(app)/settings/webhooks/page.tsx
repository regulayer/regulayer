'use client';

import { useState } from 'react';
import {
    Webhook, Plus, Copy, CheckCircle,
    AlertCircle, Trash2, TestTube
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface WebhookConfig {
    id: string;
    name: string;
    url: string;
    events: string[];
    status: 'active' | 'disabled' | 'failing';
    createdAt: string;
    secret: string;
}

// ============================================================
// Available Events
// ============================================================

const availableEvents = [
    { id: 'decision.recorded', label: 'Decision Recorded', description: 'When a new decision is recorded' },
    { id: 'ingestion.paused', label: 'Ingestion Paused', description: 'When ingestion is paused' },
    { id: 'org.frozen', label: 'Org Frozen', description: 'When organization is frozen' },
    { id: 'key.revoked', label: 'Key Revoked', description: 'When an API key is revoked' },
    { id: 'incident.declared', label: 'Incident Declared', description: 'When a system incident occurs' },
];

// ============================================================
// Status Badge
// ============================================================

function StatusBadge({ status }: { status: string }) {
    const configs: Record<string, { bg: string; text: string }> = {
        active: { bg: 'bg-green-100', text: 'text-green-700' },
        disabled: { bg: 'bg-slate-100', text: 'text-slate-600' },
        failing: { bg: 'bg-red-100', text: 'text-red-700' },
    };
    const c = configs[status] || configs.disabled;
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>
            {status}
        </span>
    );
}

// ============================================================
// Create Webhook Modal
// ============================================================

function CreateWebhookModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, url: string, events: string[]) => void }) {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [events, setEvents] = useState<string[]>([]);

    const toggleEvent = (id: string) => {
        setEvents(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id]);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Create Webhook</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., Slack Integration"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Endpoint URL</label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://your-server.com/webhook"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Events</label>
                    <div className="space-y-2">
                        {availableEvents.map((event) => (
                            <label
                                key={event.id}
                                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${events.includes(event.id) ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={events.includes(event.id)}
                                    onChange={() => toggleEvent(event.id)}
                                    className="mt-1"
                                />
                                <div>
                                    <span className="font-medium text-slate-900">{event.label}</span>
                                    <p className="text-sm text-slate-500">{event.description}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                    <p className="text-amber-800 text-sm">
                        Webhook payloads include event metadata only. No decision content or hashes are sent.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onCreate(name, url, events)}
                        disabled={!name.trim() || !url.trim() || events.length === 0}
                        className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                        Create Webhook
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Main Webhooks Page
// ============================================================

export default function WebhooksPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const [webhooks] = useState<WebhookConfig[]>([
        {
            id: 'wh_001',
            name: 'Slack Notifications',
            url: 'https://hooks.slack.com/services/xxx',
            events: ['decision.recorded', 'incident.declared'],
            status: 'active',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            secret: 'whsec_abc123xyz...',
        },
        {
            id: 'wh_002',
            name: 'Audit System',
            url: 'https://audit.example.com/webhook',
            events: ['key.revoked', 'org.frozen'],
            status: 'active',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            secret: 'whsec_def456uvw...',
        },
    ]);

    const copySecret = (secret: string) => {
        navigator.clipboard.writeText(secret);
        setCopied(secret);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleCreate = (name: string, url: string, events: string[]) => {
        console.log('Creating webhook:', name, url, events);
        setShowCreateModal(false);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Webhook className="w-6 h-6 text-slate-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Webhooks</h1>
                            <p className="text-slate-600">Receive events via HTTP callbacks</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Webhook
                    </button>
                </div>

                {/* Payload Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <p className="text-blue-800 text-sm font-medium">Payload Security</p>
                        <p className="text-blue-700 text-sm">
                            Webhook payloads contain event metadata (event_id, event_type, timestamp, org_id).
                            No decision content or cryptographic hashes are included.
                        </p>
                    </div>
                </div>

                {/* Webhooks List */}
                <div className="bg-white rounded-xl border border-slate-200">
                    <div className="p-6 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-900">Configured Webhooks</h3>
                    </div>

                    {webhooks.length === 0 ? (
                        <div className="p-8 text-center">
                            <Webhook className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-600">No webhooks configured</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {webhooks.map((webhook) => (
                                <div key={webhook.id} className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-medium text-slate-900">{webhook.name}</h4>
                                                <StatusBadge status={webhook.status} />
                                            </div>
                                            <code className="text-sm text-slate-500">{webhook.url}</code>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                                                <TestTube className="w-4 h-4" />
                                                Test
                                            </button>
                                            <button className="text-sm text-red-500 hover:text-red-700">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {webhook.events.map((ev) => (
                                            <span key={ev} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                                {ev}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-slate-500">Secret:</span>
                                        <code className="text-slate-600">{webhook.secret}</code>
                                        <button onClick={() => copySecret(webhook.secret)} className="text-slate-400 hover:text-slate-600">
                                            {copied === webhook.secret ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-400 mt-8">
                    Webhooks notify external systems. They do not affect cryptographic records.
                </p>
            </div>

            {showCreateModal && (
                <CreateWebhookModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreate}
                />
            )}
        </div>
    );
}
