'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Shield, CheckCircle, Clock, AlertCircle,
    Activity, Lock, ExternalLink, ChevronRight
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface Decision {
    id: string;
    system: string;
    timestamp: string;
    status: 'completed' | 'failed';
    signed: boolean;
}

interface OrgState {
    status: 'active' | 'frozen' | 'trial_ended';
    plan: 'free' | 'pro' | 'enterprise';
    usageToday: number;
    usageLimit: number;
    quotaResetAt: string;
}

// ============================================================
// Trust Status Card
// ============================================================

function TrustStatusCard() {
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
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700">Recorder Healthy</span>
                </div>
                <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700">Cryptographic Integrity: OK</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>Last decision: {new Date().toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Usage Summary Card
// ============================================================

function UsageSummaryCard({ orgState }: { orgState: OrgState }) {
    const usagePercent = (orgState.usageToday / orgState.usageLimit) * 100;

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

function RecentDecisionsTable({ decisions }: { decisions: Decision[] }) {
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
                            <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <Link href={`/decisions/${d.id}`} className="font-mono text-sm text-primary-600 hover:underline">
                                        {d.id}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-700">{d.system}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{d.timestamp}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${d.status === 'completed'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {d.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                            {d.status}
                                        </span>
                                        {d.signed && (
                                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                                                <Lock className="w-3 h-3" />
                                                Signed
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
    // Mock data
    const [orgState] = useState<OrgState>({
        status: 'active',
        plan: 'pro',
        usageToday: 1247,
        usageLimit: 10000,
        quotaResetAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    });

    const [decisions] = useState<Decision[]>([
        { id: 'dec_abc123', system: 'loan_approval', timestamp: new Date().toISOString(), status: 'completed', signed: true },
        { id: 'dec_def456', system: 'fraud_detection', timestamp: new Date(Date.now() - 60000).toISOString(), status: 'completed', signed: true },
        { id: 'dec_ghi789', system: 'credit_scoring', timestamp: new Date(Date.now() - 120000).toISOString(), status: 'completed', signed: true },
        { id: 'dec_jkl012', system: 'loan_approval', timestamp: new Date(Date.now() - 180000).toISOString(), status: 'failed', signed: false },
        { id: 'dec_mno345', system: 'risk_assessment', timestamp: new Date(Date.now() - 240000).toISOString(), status: 'completed', signed: true },
    ]);

    const [statusBanner] = useState<'gateway_down' | 'frozen' | 'billing' | null>(null);

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
                    <TrustStatusCard />
                    <UsageSummaryCard orgState={orgState} />
                </div>

                {/* Recent Decisions */}
                <RecentDecisionsTable decisions={decisions} />

                {/* Footer Disclaimer */}
                <p className="text-center text-xs text-slate-400 mt-8">
                    Regulayer interfaces do not modify cryptographic records.
                </p>
            </div>
        </div>
    );
}
