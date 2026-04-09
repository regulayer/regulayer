"use client";

import { useEffect, useState } from 'react';
import { getIncidents, resolveIncident, getMe, Incident } from '@/lib/api';
import {
    IconShieldCheck,
    IconAlertTriangle,
    IconAlertOctagon,
    IconInfoCircle,
    IconCheck,
    IconLoader2
} from '@tabler/icons-react';
import { GlazedCard } from '@/components/ui/glazed-card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function AlertsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const me = await getMe();
                if (me.data?.org?.id) {
                    const res = await getIncidents(me.data.org.id);
                    if (res.data) {
                        setIncidents(res.data);
                    }
                }
            } catch {
                setError("Failed to load incidents");
            } finally {
                setLoading(false);
            }
        };

        fetchIncidents();
    }, []);

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return <IconAlertOctagon className="h-5 w-5 text-red-500" />;
            case 'warning': return <IconAlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'info': return <IconInfoCircle className="h-5 w-5 bg-slate-700" />;
            default: return <IconInfoCircle className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const getSeverityBadge = (severity: string) => {
        const base = "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border";
        switch (severity) {
            case 'critical': return <span className={cn(base, "bg-red-100 text-red-800 border-red-200")}>Critical</span>;
            case 'warning': return <span className={cn(base, "bg-amber-100 text-amber-800 border-amber-200")}>Warning</span>;
            case 'info': return <span className={cn(base, "-zinc-100 text-zinc-800 text-zinc-200")}>Info</span>;
            default: return <span className={cn(base, "bg-secondary text-foreground border-border")}>{severity}</span>;
        }
    };

    if (loading) {
        return (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-border border-t-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 pb-20 space-y-8 text-foreground">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
                    <p className="text-muted-foreground text-sm">
                        Operational trust monitoring &mdash; integrity, governance, and security alerts.
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    Error loading alerts: {error}
                </div>
            )}

            <GlazedCard className="overflow-hidden">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-background border-b border-border">
                            <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Severity</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timestamp</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {incidents.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <IconCheck size={32} />
                                    </div>
                                    <p className="font-medium text-lg text-foreground">All Systems Operational</p>
                                    <p className="text-sm mt-1">No active incidents reported.</p>
                                </td>
                            </tr>
                        ) : (
                            incidents.map((inc) => (
                                <tr key={inc.id} className="hover:bg-secondary transition-colors">
                                    <td className="px-5 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {getSeverityIcon(inc.severity)}
                                            {getSeverityBadge(inc.severity)}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap text-xs text-muted-foreground uppercase">
                                        {inc.source}
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap text-sm font-medium">
                                        {inc.incident_type}
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap text-xs text-muted-foreground font-mono">
                                        {new Date(inc.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-5 py-3">
                                        {inc.status === "open" ? (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Active</span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">Resolved</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-sm text-foreground">
                                        <div className="max-w-xl truncate" title={inc.message}>
                                            {inc.message}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        {inc.status === "open" && (
                                            <button 
                                                onClick={async () => {
                                                    try {
                                                        const me = await getMe();
                                                        if (me.data?.org?.id) {
                                                            await resolveIncident(me.data.org.id, inc.id);
                                                            // Optimistic update
                                                            setIncidents(prev => prev.map(i => i.id === inc.id ? { ...i, status: 'resolved' } : i));
                                                        }
                                                    } catch (err) {
                                                        console.error("Failed to resolve incident", err);
                                                    }
                                                }}
                                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 border border-indigo-200 hover:bg-indigo-50 rounded bg-white transition-colors"
                                            >
                                                Resolve
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </GlazedCard>
        </div>
    );
}

