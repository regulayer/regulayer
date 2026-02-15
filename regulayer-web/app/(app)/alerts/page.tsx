"use client";

import { useEffect, useState } from 'react';
import { getIncidents, Incident } from '@/lib/api';
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
                const res = await getIncidents();
                if (res.data) {
                    setIncidents(res.data);
                } else if (res.error) {
                    setError(res.error);
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
            case 'info': return <IconInfoCircle className="h-5 w-5 text-blue-500" />;
            default: return <IconInfoCircle className="h-5 w-5 text-zinc-500" />;
        }
    };

    const getSeverityBadge = (severity: string) => {
        const base = "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border";
        switch (severity) {
            case 'critical': return <span className={cn(base, "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50")}>Critical</span>;
            case 'warning': return <span className={cn(base, "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50")}>Warning</span>;
            case 'info': return <span className={cn(base, "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50")}>Info</span>;
            default: return <span className={cn(base, "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700")}>{severity}</span>;
        }
    };

    if (loading) {
        return (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                        System Trust Alerts
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Operational incidents impacting system trust or availability.
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg">
                    Error loading alerts: {error}
                </div>
            )}

            <GlazedCard className="overflow-hidden">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Severity</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Source</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Message</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {incidents.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-zinc-500">
                                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <IconCheck size={32} />
                                    </div>
                                    <p className="font-medium text-lg text-zinc-900 dark:text-zinc-100">All Systems Operational</p>
                                    <p className="text-sm mt-1">No active incidents reported.</p>
                                </td>
                            </tr>
                        ) : (
                            incidents.map((inc) => (
                                <tr key={inc.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            {getSeverityIcon(inc.severity)}
                                            {getSeverityBadge(inc.severity)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                                        {new Date(inc.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 uppercase">
                                        {inc.source}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        {inc.incident_type}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                                        <div className="max-w-xl truncate" title={inc.message}>
                                            {inc.message}
                                        </div>
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
