'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAuditLogs, AuditLogEntry, getMe } from '@/lib/api';
import {
    IconActivity,
    IconClock,
    IconUser,
    IconShield,
    IconFileDescription,
    IconLoader2,
    IconSearch,
    IconFilter,
    IconDownload
} from '@tabler/icons-react';
import { GlazedCard } from '@/components/ui/glazed-card';
import { cn } from '@/lib/utils';

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAction, setFilterAction] = useState<string | null>(null);
    const [showFilter, setShowFilter] = useState(false);

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

    // Unique action types for the filter dropdown
    const actionTypes = useMemo(() => {
        const types = new Set(logs.map(l => l.action));
        return Array.from(types).sort();
    }, [logs]);

    // Filtered logs based on search and filter
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = !searchQuery ||
                log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (log.actor_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.resource_type.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = !filterAction || log.action === filterAction;
            return matchesSearch && matchesFilter;
        });
    }, [logs, searchQuery, filterAction]);

    const exportCSV = () => {
        if (filteredLogs.length === 0) return;
        const headers = ['Action', 'Actor', 'Resource Type', 'Resource ID', 'Details', 'Date'];
        const rows = filteredLogs.map(log => [
            log.action,
            log.actor_email || 'System',
            log.resource_type,
            log.resource_id || '',
            log.details ? JSON.stringify(log.details) : '',
            new Date(log.created_at).toISOString()
        ]);
        const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const getIcon = (action: string) => {
        if (action.includes('login') || action.includes('logout')) return IconUser;
        if (action.includes('project')) return IconFileDescription;
        if (action.includes('key')) return IconShield;
        return IconActivity;
    };

    const getActionColor = (action: string) => {
        if (action.includes('delete') || action.includes('revoke')) return 'bg-red-100 text-red-600';
        if (action.includes('create') || action.includes('login')) return 'bg-emerald-100 text-emerald-600';
        return 'bg-secondary text-foreground';
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
                    <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
                    <p className="text-muted-foreground text-sm">
                        Security audit trail — detect misuse, role escalation, and suspicious activity.
                    </p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-card backdrop-blur-md border border-border p-4 rounded-xl shadow-sm">
                <div className="md:col-span-6 relative">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by action, actor, or resource..."
                        className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:bg-slate-700/50 transition-all text-foreground placeholder:text-muted-foreground"
                    />
                </div>
                <div className="md:col-span-6 flex gap-3 justify-end">
                    <div className="relative">
                        <button
                            onClick={() => setShowFilter(!showFilter)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg transition-colors",
                                filterAction
                                    ? "bg-slate-800 text-zinc-50 text-zinc-200"
                                    : "text-foreground bg-secondary border-border hover:border-border"
                            )}
                        >
                            <IconFilter size={16} />
                            {filterAction ? filterAction.replace('.', ' ') : 'Filter'}
                        </button>
                        {showFilter && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-20 py-1 max-h-60 overflow-y-auto">
                                <button
                                    onClick={() => { setFilterAction(null); setShowFilter(false); }}
                                    className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-secondary"
                                >
                                    All Actions
                                </button>
                                {actionTypes.map(action => (
                                    <button
                                        key={action}
                                        onClick={() => { setFilterAction(action); setShowFilter(false); }}
                                        className={cn(
                                            "w-full px-4 py-2 text-left text-sm hover:bg-secondary capitalize",
                                            filterAction === action ? "bg-slate-800 font-medium" : "text-foreground"
                                        )}
                                    >
                                        {action.replace('.', ' ')}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={exportCSV}
                        disabled={filteredLogs.length === 0}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-secondary border border-border rounded-lg hover:border-border transition-colors disabled:opacity-50"
                    >
                        <IconDownload size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Results count */}
            {(searchQuery || filterAction) && (
                <div className="text-sm text-muted-foreground">
                    Showing {filteredLogs.length} of {logs.length} entries
                    {filterAction && (
                        <button onClick={() => setFilterAction(null)} className="ml-2 bg-slate-700 hover:underline">
                            Clear filter
                        </button>
                    )}
                </div>
            )}

            <GlazedCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-background">
                                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3 tracking-wider">Action</th>
                                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3 tracking-wider">Actor</th>
                                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3 tracking-wider">Role</th>
                                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3 tracking-wider">Resource</th>
                                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3 tracking-wider">Timestamp</th>
                                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3 tracking-wider">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        <IconActivity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        {searchQuery || filterAction ? 'No matching logs found.' : 'No activity recorded yet.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => {
                                    const Icon = getIcon(log.action);
                                    return (
                                        <tr key={log.id} className="hover:bg-secondary transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("p-2 rounded-lg", getActionColor(log.action))}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground capitalize">
                                                            {log.action.replace('.', ' ')}
                                                        </p>
                                                        {log.details && Object.keys(log.details).length > 0 && (
                                                            <p className="text-xs text-muted-foreground font-mono mt-0.5 max-w-[200px] truncate">
                                                                {JSON.stringify(log.details)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-muted-foreground">
                                                        {(log.actor_email || 'System')[0].toUpperCase()}
                                                    </div>
                                                    {log.actor_email || 'System'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="text-xs text-muted-foreground">member</span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-muted-foreground border border-border">
                                                    {log.resource_type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-muted-foreground font-mono">
                                                {new Date(log.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-5 py-3 text-xs text-muted-foreground font-mono">—</td>
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

