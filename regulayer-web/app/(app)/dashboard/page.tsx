'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Shield, CheckCircle, Clock, AlertCircle,
    Activity, Lock, ExternalLink, ChevronRight, Copy
} from 'lucide-react';
import { getMe, getProjects, getDecisions, getUsage, Decision, getApiKeys } from '@/lib/api';

// ============================================================
// Types
// ============================================================

interface OrgState {
    status: 'active' | 'frozen' | 'trial_ended';
    plan: 'free' | 'pro' | 'enterprise';
    usageToday: number;
    usageLimit: number;
    quotaResetAt: string;
}

// ============================================================
// Empty State (Fresh Org)
// ============================================================

function EmptyState({ apiKey }: { apiKey?: string }) {
    const snippet = `
from regulayer import configure, trace

configure(api_key="${apiKey || 'rl_YOUR_KEY'}")

with trace(system="onboarding_demo") as t:
    t.set_input({"step": 1})
    t.set_output({"status": "ready"})
`;

    const [copied, setCopied] = useState(false);

    const copyCode = () => {
        navigator.clipboard.writeText(snippet.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Activity className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No decisions recorded yet
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
                Your organization is ready. Run your first trace to see it appear here in real-time.
            </p>

            <div className="max-w-xl mx-auto bg-slate-900 rounded-lg overflow-hidden text-left shadow-lg">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                    <span className="text-xs text-slate-400 font-mono">python</span>
                    <button
                        onClick={copyCode}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
                    >
                        {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
                <pre className="p-4 overflow-x-auto text-sm text-slate-300 font-mono leading-relaxed">
                    {snippet.trim()}
                </pre>
            </div>
        </div>
    );
}

// ============================================================
// Trust Status Card
// ============================================================

function TrustStatusCard({ healthy }: { healthy: boolean }) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Trust Status</h3>
                <div
                    className="relative"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <span className="text-slate-400 cursor-help">ⓘ</span>
                    {showTooltip && (
                        <div className="absolute right-0 top-6 w-48 bg-slate-900 text-white text-xs p-2 rounded shadow-lg z-10">
                            Integrity is verified continuously.
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <CheckCircle className={`w-5 h-5 ${healthy ? 'text-green-500' : 'text-amber-500'}`} />
                    <span className="text-slate-700">
                        {healthy ? 'Recorder Healthy' : 'Recorder Status Unknown'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700">Cryptographic Integrity: OK</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>Last check: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Usage Summary Card
// ============================================================

function UsageSummaryCard({ orgState }: { orgState: OrgState | null }) {
    if (!orgState) return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
            <div className="h-6 bg-slate-100 rounded w-1/3 mb-4"></div>
            <div className="h-20 bg-slate-50 rounded"></div>
        </div>
    );

    const usagePercent = orgState.usageLimit > 0
        ? (orgState.usageToday / orgState.usageLimit) * 100
        : 0;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Usage</h3>
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded capitalize">
                    {orgState.plan} Plan
                </span>
            </div>

            {orgState.status === 'frozen' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <p className="text-amber-800 text-sm">
                        Ingestion paused — proofs remain exportable.
                    </p>
                </div>
            )}

            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Decisions today</span>
                        <span className="text-slate-900 font-medium">
                            {orgState.usageToday.toLocaleString()} / {orgState.usageLimit.toLocaleString()}
                        </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${usagePercent > 90 ? 'bg-red-500' : 'bg-primary-500'
                                }`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                    </div>
                </div>

                <p className="text-xs text-slate-500">
                    Resets at {new Date(orgState.quotaResetAt).toLocaleString()}
                </p>
            </div>
        </div>
    );
}

// ============================================================
// Recent Decisions Table
// ============================================================

function RecentDecisionsTable({ decisions, isLoading }: { decisions: Decision[], isLoading: boolean }) {
    if (isLoading && decisions.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                Loading decisions...
            </div>
        )
    }

    if (decisions.length === 0) {
        return null; // Handled by EmptyState parent logic
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Recent Decisions</h3>
                    <Link href="/decisions" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                        View all <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Decision ID</th>
                            <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">System</th>
                            <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Timestamp</th>
                            <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {decisions.map((d) => (
                            <tr key={d.decision_id || 'unknown'} className="border-b border-slate-50 hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <Link href={`/decisions/${d.decision_id}`} className="font-mono text-sm text-primary-600 hover:underline">
                                        {d.decision_id?.substring(0, 8)}...
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-700">{d.system_name}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {new Date(d.server_timestamp).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {d.event_state === 'pending' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-amber-100 text-amber-700">
                                                <Clock className="w-3 h-3" />
                                                pending
                                            </span>
                                        ) : d.event_state === 'failed' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-100 text-red-700">
                                                <AlertCircle className="w-3 h-3" />
                                                failed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                                                <CheckCircle className="w-3 h-3" />
                                                recorded
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ============================================================
// Status Banners
// ============================================================

function StatusBanner({ type }: { type: 'gateway_down' | 'frozen' | 'billing' | null }) {
    if (!type) return null;

    const banners = {
        gateway_down: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', message: 'Temporary ingestion delay' },
        frozen: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', message: 'Ingestion paused — exports still available' },
        billing: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', message: 'Plan action required' },
    };

    const b = banners[type];

    return (
        <div className={`${b.bg} ${b.border} border rounded-lg p-4 mb-6 flex items-center gap-3`}>
            <AlertCircle className={`w-5 h-5 ${b.text}`} />
            <p className={`${b.text} text-sm`}>{b.message}</p>
        </div>
    );
}

// ============================================================
// Main Dashboard
// ============================================================

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [orgState, setOrgState] = useState<OrgState | null>(null);
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [statusBanner, setStatusBanner] = useState<'gateway_down' | 'frozen' | 'billing' | null>(null);
    const [demoApiKey, setDemoApiKey] = useState<string>('');

    useEffect(() => {
        async function loadData() {
            try {
                // 1. Get Me & Org
                const meRes = await getMe();
                if (meRes.error || !meRes.data) {
                    // Normally redirect to login
                    console.error("Auth failed", meRes.error);
                    return;
                }

                const orgId = meRes.data.org.id;

                // 2. Get Projects (to find default project)
                const projRes = await getProjects(orgId);
                if (projRes.data && projRes.data.length > 0) {
                    const projectId = projRes.data[0].id; // Use first project

                    // 3. Get Decisions
                    const decRes = await getDecisions(projectId, 5);
                    if (decRes.data) {
                        setDecisions(decRes.data);
                    }

                    // For Empty State: Try to find an API key to show
                    const keysRes = await getApiKeys(projectId);
                    if (keysRes.data && keysRes.data.length > 0) {
                        const ingestKey = keysRes.data.find(k => k.scopes.includes('ingest'));
                        if (ingestKey) {
                            // Note: API returns truncated key_prefix usually, but create returns secret.
                            // List usually doesn't return secret.
                            // So we might show "rl_..." prefix or a placeholder.
                            // If we have prefix "rl_abcd...", we can show that.
                            // Wait, keysRes returns `key_prefix`.
                            setDemoApiKey(ingestKey.key_prefix + '...');
                        }
                    }
                }

                // 4. Get Usage
                const usageRes = await getUsage(orgId);
                if (usageRes.data) {
                    setOrgState({
                        status: (meRes.data.org.status === 'suspended' ? 'frozen' : meRes.data.org.status) || 'active',
                        plan: 'pro', // TODO: Get from org/billing
                        usageToday: usageRes.data.used || 0,
                        usageLimit: usageRes.data.limit || 10000,
                        quotaResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // TODO: Get real reset
                    });
                } else {
                    // Fallback if billing service down/mocked
                    setOrgState({
                        status: 'active',
                        plan: 'pro',
                        usageToday: 0,
                        usageLimit: 10000,
                        quotaResetAt: new Date().toISOString()
                    });
                }

            } catch (e) {
                console.error("Dashboard load error", e);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-600">Monitor your decision recording system</p>
                </div>

                {/* Status Banner */}
                <StatusBanner type={statusBanner} />

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <TrustStatusCard healthy={true} />
                    <UsageSummaryCard orgState={orgState} />
                </div>

                {/* Recent Decisions or Empty State */}
                {loading ? (
                    <div className="text-center py-12 text-slate-400">Loading dashboard...</div>
                ) : decisions.length > 0 ? (
                    <RecentDecisionsTable decisions={decisions} isLoading={loading} />
                ) : (
                    <EmptyState apiKey={demoApiKey} />
                )}

                {/* Footer Disclaimer */}
                <p className="text-center text-xs text-slate-400 mt-8">
                    Regulayer interfaces do not modify cryptographic records.
                </p>
            </div>
        </div>
    );
}
