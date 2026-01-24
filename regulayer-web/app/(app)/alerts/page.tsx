'use client';

import { useState } from 'react';
import {
    Bell, AlertTriangle, AlertCircle, Info,
    CheckCircle, Clock, Filter, X
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

type AlertType = 'ingestion' | 'billing' | 'system' | 'governance' | 'security';
type AlertSeverity = 'info' | 'warning' | 'critical';
type AlertScope = 'org' | 'project' | 'global';

interface Alert {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    scope: AlertScope;
    title: string;
    message: string;
    timestamp: string;
    resolved: boolean;
}

// ============================================================
// Severity Config
// ============================================================

const severityConfig: Record<AlertSeverity, { icon: React.ReactNode; bg: string; border: string; text: string }> = {
    info: { icon: <Info className="w-5 h-5" />, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    warning: { icon: <AlertTriangle className="w-5 h-5" />, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    critical: { icon: <AlertCircle className="w-5 h-5" />, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
};

const typeLabels: Record<AlertType, string> = {
    ingestion: 'Ingestion',
    billing: 'Billing',
    system: 'System',
    governance: 'Governance',
    security: 'Security',
};

// ============================================================
// Alert Card
// ============================================================

function AlertCard({ alert }: { alert: Alert }) {
    const config = severityConfig[alert.severity];

    return (
        <div className={`${config.bg} ${config.border} border rounded-xl p-4`}>
            <div className="flex items-start gap-3">
                <div className={config.text}>
                    {config.icon}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${config.text}`}>{alert.title}</span>
                        <span className="text-xs bg-white/50 px-2 py-0.5 rounded">{typeLabels[alert.type]}</span>
                        {alert.resolved && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Resolved
                            </span>
                        )}
                    </div>
                    <p className={`text-sm ${config.text} opacity-80`}>{alert.message}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-60">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span className="capitalize">{alert.scope}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Filter Bar
// ============================================================

function FilterBar({
    filter,
    setFilter
}: {
    filter: { severity: AlertSeverity | 'all'; type: AlertType | 'all'; showResolved: boolean };
    setFilter: (f: typeof filter) => void;
}) {
    return (
        <div className="flex flex-wrap gap-4 mb-6">
            <div>
                <label className="text-xs text-slate-500 block mb-1">Severity</label>
                <select
                    value={filter.severity}
                    onChange={(e) => setFilter({ ...filter, severity: e.target.value as AlertSeverity | 'all' })}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                >
                    <option value="all">All</option>
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                </select>
            </div>
            <div>
                <label className="text-xs text-slate-500 block mb-1">Type</label>
                <select
                    value={filter.type}
                    onChange={(e) => setFilter({ ...filter, type: e.target.value as AlertType | 'all' })}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                >
                    <option value="all">All</option>
                    <option value="ingestion">Ingestion</option>
                    <option value="billing">Billing</option>
                    <option value="system">System</option>
                    <option value="governance">Governance</option>
                    <option value="security">Security</option>
                </select>
            </div>
            <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                        type="checkbox"
                        checked={filter.showResolved}
                        onChange={(e) => setFilter({ ...filter, showResolved: e.target.checked })}
                        className="rounded"
                    />
                    Show resolved
                </label>
            </div>
        </div>
    );
}

// ============================================================
// Main Alerts Page
// ============================================================

export default function AlertsPage() {
    const [filter, setFilter] = useState({
        severity: 'all' as AlertSeverity | 'all',
        type: 'all' as AlertType | 'all',
        showResolved: false,
    });

    const [alerts] = useState<Alert[]>([
        {
            id: '1',
            type: 'billing',
            severity: 'warning',
            scope: 'org',
            title: 'Trial Ending Soon',
            message: 'Your trial ends in 7 days. Upgrade to continue ingesting decisions.',
            timestamp: new Date().toISOString(),
            resolved: false,
        },
        {
            id: '2',
            type: 'ingestion',
            severity: 'info',
            scope: 'project',
            title: 'Rate Limit Applied',
            message: 'Project proj_abc123 reached rate limit. Requests queued.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            resolved: true,
        },
        {
            id: '3',
            type: 'security',
            severity: 'warning',
            scope: 'org',
            title: 'API Key Revoked',
            message: 'Key "Old Development" was revoked by alice@company.com',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            resolved: false,
        },
        {
            id: '4',
            type: 'system',
            severity: 'critical',
            scope: 'global',
            title: 'Gateway Degraded',
            message: 'Ingestion delayed — existing proofs unaffected.',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            resolved: true,
        },
        {
            id: '5',
            type: 'governance',
            severity: 'info',
            scope: 'project',
            title: 'Approval Required',
            message: 'Decision dec_xyz requires approval for high-risk classification.',
            timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            resolved: false,
        },
    ]);

    const filteredAlerts = alerts.filter((a) => {
        if (filter.severity !== 'all' && a.severity !== filter.severity) return false;
        if (filter.type !== 'all' && a.type !== filter.type) return false;
        if (!filter.showResolved && a.resolved) return false;
        return true;
    });

    const activeCount = alerts.filter(a => !a.resolved).length;
    const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.resolved).length;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Bell className="w-6 h-6 text-slate-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Alerts</h1>
                            <p className="text-slate-600">System and operational notifications</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {criticalCount > 0 && (
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                                {criticalCount} Critical
                            </span>
                        )}
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm">
                            {activeCount} Active
                        </span>
                    </div>
                </div>

                {/* Trust Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                        <p className="text-green-800 text-sm font-medium">Cryptographic Records Unaffected</p>
                        <p className="text-green-700 text-sm">
                            Alerts reflect operational status. Decision proofs remain valid regardless of system state.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <FilterBar filter={filter} setFilter={setFilter} />

                {/* Alerts List */}
                <div className="space-y-4">
                    {filteredAlerts.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <p className="text-slate-600">No alerts match your filters</p>
                        </div>
                    ) : (
                        filteredAlerts.map((alert) => (
                            <AlertCard key={alert.id} alert={alert} />
                        ))
                    )}
                </div>

                {/* Footer Disclaimer */}
                <p className="text-center text-xs text-slate-400 mt-8">
                    Operational availability ≠ cryptographic validity
                </p>
            </div>
        </div>
    );
}
