'use client';

import { useState, useEffect } from 'react';
import { getAuditLogs, AuditLogEntry, getMe } from '@/lib/api';
import {
    IconActivity,
    IconClock,
    IconUser,
    IconShield,
    IconFileDescription,
    IconLoader2,
    IconSearch,
    IconFilter
} from '@tabler/icons-react';
import { GlazedCard } from '@/components/ui/glazed-card';
import { cn } from '@/lib/utils';;

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const me = await getMe();
            if (me.data?.org) {
                const res = await getAuditLogs(me.data.org.id);
                if (res.data) {
                    setLogs(res.data);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (action: string) => {
        if (action.includes('login') || action.includes('logout')) return IconUser;
        if (action.includes('project')) return IconFileDescription;
        if (action.includes('key')) return IconShield;
        return IconActivity;
    };

    const getActionColor = (action: string) => {
        if (action.includes('delete') || action.includes('revoke')) return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
        if (action.includes('create') || action.includes('login')) return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
        return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
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
                        Activity Log
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Immutable audit trail of all actions within your organization.
                    </p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm">
                <div className="md:col-span-6 relative">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                    />
                </div>
                <div className="md:col-span-6 flex gap-3 justify-end">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                        <IconFilter size={16} />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                        Export CSV
                    </button>
                </div>
            </div>


            <GlazedCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                <th className="text-left text-xs font-semibold text-zinc-500 uppercase px-6 py-4 tracking-wider">Action</th>
                                <th className="text-left text-xs font-semibold text-zinc-500 uppercase px-6 py-4 tracking-wider">Actor</th>
                                <th className="text-left text-xs font-semibold text-zinc-500 uppercase px-6 py-4 tracking-wider">Resource</th>
                                <th className="text-left text-xs font-semibold text-zinc-500 uppercase px-6 py-4 tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                        <IconActivity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        No activity recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => {
                                    const Icon = getIcon(log.action);
                                    return (
                                        <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("p-2 rounded-lg", getActionColor(log.action))}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                                                            {log.action.replace('.', ' ')}
                                                        </p>
                                                        {log.details && Object.keys(log.details).length > 0 && (
                                                            <p className="text-xs text-zinc-500 font-mono mt-0.5 max-w-[200px] truncate">
                                                                {JSON.stringify(log.details)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-500 dark:text-zinc-300">
                                                        {(log.actor_email || 'System')[0].toUpperCase()}
                                                    </div>
                                                    {log.actor_email || 'System'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                                    {log.resource_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                                                <div className="flex items-center gap-2">
                                                    <IconClock className="w-3 h-3 text-zinc-400" />
                                                    {new Date(log.created_at).toLocaleString()}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </GlazedCard>
        </div>
    );
}
