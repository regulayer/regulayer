"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
    IconSearch, IconFilter, IconDownload, IconRefresh, IconCheck,
    IconAlertTriangle, IconClock, IconHash, IconX, IconShieldCheck,
    IconScale, IconChevronDown
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { getMe, getProjects, getDecisions, UserWithOrg, Project, Decision } from "@/lib/api";

export default function DecisionsPage() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserWithOrg | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Filter state
    const [showFilters, setShowFilters] = useState(false);
    const [filterRisk, setFilterRisk] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterGovernance, setFilterGovernance] = useState<string>("all");

    useEffect(() => {
        async function fetchData() {
            try {
                const userRes = await getMe();
                setUser(userRes.data);
                if (!userRes.data.organization_id) throw new Error("User has no organization");
                const projectsRes = await getProjects(userRes.data.organization_id);
                setProjects(projectsRes.data);
                if (projectsRes.data.length > 0) {
                    setSelectedProjectId("all");
                    await fetchDecisions("all");
                } else {
                    setLoading(false);
                }
            } catch (err: any) {
                const msg = err.response?.data?.detail || err.response?.data?.message || err.message || "An unexpected error occurred";
                setError(msg);
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const fetchDecisions = async (projectId: string, isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            const res = await getDecisions(projectId);
            setDecisions(res.data || []);
            setError("");
        } catch (err: any) {
            const msg = err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to load decisions";
            if (!isBackground) setError(msg);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedProjectId) return;
        const intervalId = setInterval(() => {
            fetchDecisions(selectedProjectId, true); // background fetch
        }, 3000);
        return () => clearInterval(intervalId);
    }, [selectedProjectId]);

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const projectId = e.target.value;
        setSelectedProjectId(projectId);
        fetchDecisions(projectId);
    };

    const filteredDecisions = useMemo(() => {
        let result = decisions;
        // Text search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter((d: Decision) =>
                d.decision_id.toLowerCase().includes(q) ||
                (d.canonical_payload?.model_name || '').toLowerCase().includes(q) ||
                (d.system_name || '').toLowerCase().includes(q) ||
                (d.record_hash || '').toLowerCase().includes(q)
            );
        }
        // Risk filter
        if (filterRisk !== "all") {
            result = result.filter((d: Decision) => d.risk_level === filterRisk);
        }
        // Status filter
        if (filterStatus !== "all") {
            result = result.filter((d: Decision) => d.event_state === filterStatus);
        }
        return result;
    }, [decisions, searchQuery, filterRisk, filterStatus, filterGovernance]);

    // Stat counts
    const totalCount = decisions.length;
    const sealedCount = decisions.filter(d => d.event_state === 'completed').length;
    const pendingCount = decisions.filter(d => d.event_state === 'pending' || d.event_state === 'started').length;

    const currentProject = projects.find(p => p.id === selectedProjectId);

    return (
        <div className="p-6 md:p-10 flex flex-col gap-6 w-full min-h-screen pb-20 text-foreground">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Decisions</h1>
                    <p className="text-muted-foreground text-sm">
                        Forensic record of all AI decisions and their cryptographic verification.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {projects.length > 0 && (
                        <div className="relative">
                            <select
                                value={selectedProjectId || ""}
                                onChange={handleProjectChange}
                                className="appearance-none bg-slate-900 border border-border text-foreground rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-slate-700/50 min-w-[180px] text-sm"
                            >
                                <option value="all">All Projects</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <IconChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                        </div>
                    )}
                    <button
                        onClick={() => selectedProjectId && fetchDecisions(selectedProjectId)}
                        className="p-2 rounded-lg bg-secondary text-foreground hover:bg-slate-200 transition-colors"
                        title="Refresh"
                    >
                        <IconRefresh size={18} />
                    </button>
                    <button
                        onClick={() => {
                            if (filteredDecisions.length === 0) return;
                            const rows = filteredDecisions.map((d: Decision) => [
                                d.decision_id, d.event_state || 'unknown', new Date(d.server_timestamp).toISOString(),
                                d.system_name || 'Unknown', d.canonical_payload?.model_name || 'Unknown',
                                d.risk_level || 'N/A', d.record_hash || ''
                            ]);
                            const csv = [['Decision ID', 'Status', 'Timestamp', 'System', 'Model', 'Risk', 'Hash'], ...rows].map((r: string[]) => r.map((c: string) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url; a.download = `decisions_${new Date().toISOString().split('T')[0]}.csv`;
                            document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); document.body.removeChild(a);
                        }}
                        disabled={decisions.length === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-foreground hover:opacity-90 transition-all text-sm font-medium disabled:opacity-50"
                    >
                        <IconDownload size={16} />
                        <span className="hidden sm:inline">Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-2xl shadow-card p-5">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Records</p>
                    <p className="text-2xl font-bold mt-1">{totalCount}</p>
                </div>
                <div className="bg-card border border-border rounded-2xl shadow-card p-5">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Sealed</p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-2xl font-bold text-emerald-600">{sealedCount}</p>
                        <IconShieldCheck size={18} className="text-emerald-500" />
                    </div>
                </div>
                <div className="bg-card border border-border rounded-2xl shadow-card p-5">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Pending</p>
                    <p className="text-2xl font-bold text-amber-500 mt-1">{pendingCount}</p>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-card border border-border rounded-2xl shadow-card p-5 space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by Decision ID, model, system, or hash..."
                            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-700/50 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors",
                            showFilters
                                ? "bg-zinc-50 text-slate-800 border-zinc-200"
                                : "bg-secondary text-foreground border-border hover:border-border"
                        )}
                    >
                        <IconFilter size={16} />
                        Filters
                        {(filterRisk !== 'all' || filterStatus !== 'all' || filterGovernance !== 'all') && (
                            <span className="h-2 w-2 rounded-full bg-slate-700" />
                        )}
                    </button>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-border">
                        <div>
                            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Risk Level</label>
                            <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm">
                                <option value="all">All Levels</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Status</label>
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm">
                                <option value="all">All Statuses</option>
                                <option value="completed">Sealed</option>
                                <option value="pending">Pending</option>
                                <option value="started">In Progress</option>
                                <option value="failed">Failed</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Governance State</label>
                            <select value={filterGovernance} onChange={e => setFilterGovernance(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm">
                                <option value="all">All States</option>
                                <option value="approved">Approved</option>
                                <option value="under_review">Under Review</option>
                                <option value="flagged">Flagged</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => { setFilterRisk('all'); setFilterStatus('all'); setFilterGovernance('all'); setSearchQuery(''); }}
                                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Data Table */}
            <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-8 h-8 border-4 border-slate-700 border-t-transparent rounded-full animate-spin" />
                        <p className="text-muted-foreground animate-pulse">Loading records...</p>
                    </div>
                ) : error ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600"><IconAlertTriangle size={24} /></div>
                        <h3 className="text-lg font-semibold">Failed to load decisions</h3>
                        <p className="text-muted-foreground max-w-md">{error}</p>
                        <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-secondary rounded-lg hover:opacity-80 transition">Retry</button>
                    </div>
                ) : filteredDecisions.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                            <IconScale size={32} />
                        </div>
                        <h3 className="text-lg font-medium">No decisions found</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            {decisions.length > 0 ? "No decisions match your current filters." : "Connect your AI system using the SDK to start logging immutable decisions."}
                        </p>
                        {decisions.length === 0 && (
                            <Link href="/docs" className="mt-2 px-5 py-2.5 bg-primary hover:bg-brand-700 text-white rounded-lg font-medium transition-colors">
                                View Documentation
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-background">
                                    <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Decision ID</th>
                                    <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">System</th>
                                    <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project</th>
                                    <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timestamp</th>
                                    <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                                    <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Risk</th>
                                    <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hash</th>
                                    <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filteredDecisions.map((decision) => {
                                    const state = decision.event_state || 'unknown';
                                    const statusStyles: Record<string, string> = {
                                        completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
                                        verified: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
                                        pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
                                        started: 'bg-zinc-50 text-slate-900 border-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-300 dark:border-zinc-500/20',
                                        failed: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
                                        rejected: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
                                    };
                                    const StatusIcon = state === 'completed' || state === 'verified' ? IconCheck : state === 'failed' || state === 'rejected' ? IconX : IconClock;
                                    const statusLabel = state === 'completed' ? 'Sealed' : state === 'started' ? 'In Progress' : state;
                                    const riskStyles: Record<string, string> = {
                                        high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
                                        medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
                                        low: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
                                    };
                                    const hasHash = !!decision.record_hash && decision.record_hash !== 'PENDING';

                                    return (
                                        <tr key={decision.decision_id} className="group hover:bg-secondary transition-colors">
                                            <td className="py-3 px-5">
                                                <Link href={`/decisions/${decision.decision_id}`} className="flex items-center gap-2 hover:text-slate-800 transition">
                                                    <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground flex-shrink-0">
                                                        <IconHash size={13} />
                                                    </div>
                                                    <span className="font-mono text-xs truncate max-w-[120px]" title={decision.decision_id}>
                                                        {decision.decision_id.substring(0, 12)}...
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="py-3 px-5">
                                                <p className="text-sm font-medium">{decision.system_name || "Unknown"}</p>
                                                <p className="text-xs text-muted-foreground">{decision.canonical_payload?.model_name || ''}</p>
                                            </td>
                                            <td className="py-3 px-5">
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    {(projects.find(p => p.id === decision.chain_id) || currentProject)?.name || '—'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5">
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    {new Date(decision.server_timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5">
                                                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border capitalize", statusStyles[state] || statusStyles.completed)}>
                                                    <StatusIcon size={11} /> {statusLabel}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5">
                                                <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium border capitalize", riskStyles[decision.risk_level] || 'bg-secondary text-muted-foreground border-border')}>
                                                    {decision.risk_level || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5">
                                                {hasHash ? (
                                                    <span className="text-emerald-500" title="Hash verified"><IconShieldCheck size={16} /></span>
                                                ) : (
                                                    <span className="text-foreground"><IconClock size={16} /></span>
                                                )}
                                            </td>
                                            <td className="py-3 px-5 text-right">
                                                <Link href={`/decisions/${decision.decision_id}`} className="text-xs font-medium text-primary hover:text-primary/80 hover:underline">
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer */}
            {!loading && filteredDecisions.length > 0 && (
                <div className="flex justify-between items-center text-sm text-muted-foreground px-1">
                    <p>Showing {filteredDecisions.length} of {totalCount} records</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded border border-border hover:bg-secondary disabled:opacity-50 text-xs" disabled>Previous</button>
                        <button className="px-3 py-1 rounded border border-border hover:bg-secondary text-xs">Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}

