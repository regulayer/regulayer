'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Webhook, Plus, Copy, CheckCircle,
    AlertCircle, Trash2, TestTube, Loader2
} from 'lucide-react';
import { getWebhooks, createWebhook, deleteWebhook, getMe, WebhookDestination } from '@/lib/api';

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
        disabled: { bg: 'bg-secondary', text: 'text-muted-foreground' },
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

function CreateWebhookModal({ onClose, onCreate, isPending }: { onClose: () => void; onCreate: (name: string, url: string, events: string[]) => void; isPending: boolean }) {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [events, setEvents] = useState<string[]>([]);

    const toggleEvent = (id: string) => {
        setEvents(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id]);
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-foreground mb-4">Create Webhook</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-background"
                        placeholder="e.g., Slack Integration"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">Endpoint URL</label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-background"
                        placeholder="https://your-server.com/webhook"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">Events</label>
                    <div className="space-y-2">
                        {availableEvents.map((event) => (
                            <label
                                key={event.id}
                                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${events.includes(event.id) ? 'border-indigo-500 bg-indigo-50/50' : 'border-border hover:bg-secondary'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={events.includes(event.id)}
                                    onChange={() => toggleEvent(event.id)}
                                    className="mt-1"
                                />
                                <div>
                                    <span className="font-medium text-foreground">{event.label}</span>
                                    <p className="text-sm text-muted-foreground">{event.description}</p>
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
                        disabled={isPending}
                        className="flex-1 border border-border text-foreground px-4 py-2 rounded-lg hover:bg-secondary disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onCreate(name, url, events)}
                        disabled={!name.trim() || !url.trim() || events.length === 0 || isPending}
                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Webhook"}
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
    const queryClient = useQueryClient();

    const { data: me } = useQuery({ queryKey: ["me"], queryFn: getMe });
    const orgId = me?.data?.org?.id;

    const { data: webhooksRes, isLoading } = useQuery({
        queryKey: ["webhooks", orgId],
        queryFn: () => getWebhooks(orgId!),
        enabled: !!orgId
    });
    const webhooks = webhooksRes?.data || [];

    const createMutation = useMutation({
        mutationFn: (data: { name: string; url: string; events: string[] }) => createWebhook(orgId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["webhooks", orgId] });
            setShowCreateModal(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (webhookId: string) => deleteWebhook(orgId!, webhookId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["webhooks", orgId] });
        }
    });

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-secondary flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary">
            <div className="max-w-5xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Webhook className="w-6 h-6 text-muted-foreground" />
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Webhooks</h1>
                            <p className="text-muted-foreground">Manage external event destinations</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Webhook
                    </button>
                </div>

                {/* Webhooks List */}
                <div className="space-y-4">
                    {webhooks.length === 0 ? (
                        <div className="bg-card border border-border rounded-xl p-12 text-center">
                            <Webhook className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold text-foreground mb-1">No Webhooks Installed</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                Connect external services to Regulayer to receive real-time payload events and trigger automated workflows.
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="mt-6 flex items-center gap-2 bg-white border border-border shadow-sm text-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary transition-colors mx-auto"
                            >
                                <Plus className="w-4 h-4" /> Add Webhook
                            </button>
                        </div>
                    ) : (
                        webhooks.map((webhook) => (
                            <div key={webhook.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-sm transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-foreground">{webhook.name}</h3>
                                            <StatusBadge status={webhook.status} />
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono bg-secondary px-2 py-1 rounded inline-flex">
                                            <span className="truncate max-w-sm">{webhook.url}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100" title="Test Webhook">
                                            <TestTube className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if(confirm("Are you sure you want to delete this webhook?")) {
                                                    deleteMutation.mutate(webhook.id);
                                                }
                                            }}
                                            className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" 
                                            title="Delete Webhook"
                                            disabled={deleteMutation.isPending}
                                        >
                                            {deleteMutation.isPending && deleteMutation.variables === webhook.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Subscribed Events</p>
                                        <div className="flex flex-wrap gap-2">
                                            {webhook.events.map(ev => (
                                                <span key={ev} className="px-2 py-1 bg-secondary text-foreground rounded text-xs font-medium border border-border">
                                                    {availableEvents.find(e => e.id === ev)?.label || ev}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Signing Secret</p>
                                        <div className="flex items-center gap-2 group">
                                            <code className="text-xs bg-secondary text-foreground px-2 py-1.5 rounded border border-border font-mono tracking-wider flex-1">
                                                {webhook.secret.substring(0, 10)}...{webhook.secret.substring(webhook.secret.length - 4)}
                                            </code>
                                            <button
                                                onClick={() => handleCopy(webhook.secret, webhook.id)}
                                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded border border-transparent transition-colors"
                                                title="Copy Secret"
                                            >
                                                {copied === webhook.id ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-1.5">Used to verify webhook payload signatures (HMAC SHA-256).</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {showCreateModal && (
                    <CreateWebhookModal
                        onClose={() => setShowCreateModal(false)}
                        onCreate={(name, url, events) => createMutation.mutate({ name, url, events })}
                        isPending={createMutation.isPending}
                    />
                )}
            </div>
        </div>
    );
}

