'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    IconCheck, IconClock, IconSearch, IconFilter, IconChevronRight,
    IconBuildingBank, IconAlertTriangle, IconX, IconEye,
    IconFlagFilled, IconPlayerPause, IconArrowRight, IconChevronDown
} from '@tabler/icons-react';
import { GlazedCard } from '@/components/ui/glazed-card';
import { cn } from '@/lib/utils';
import { getGovernanceQueue, listProposals } from '@/lib/api';

interface GovernanceItem {
    id?: string;
    is_proposal?: boolean;
    decision_id: string;
    review_state: string;
    tags: Array<{ name: string; category: string }>;
    last_updated: string;
    risk_level?: string;
    reviewer?: string;
    assigned_to?: string;
    system_name?: string;
    sla_deadline?: string;
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { style: string; icon: React.ReactNode; label: string }> = {
        unreviewed: { style: 'bg-secondary text-foreground border-border', icon: <IconClock size={12} />, label: 'Unreviewed' },
        in_review: { style: 'bg-zinc-50 text-slate-900 border-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-300 dark:border-zinc-500/20', icon: <IconEye size={12} />, label: 'In Review' },
        reviewed: { style: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20', icon: <IconCheck size={12} />, label: 'Approved' },
        approved: { style: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20', icon: <IconCheck size={12} />, label: 'Approved' },
        rejected: { style: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20', icon: <IconX size={12} />, label: 'Rejected' },
        escalated: { style: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20', icon: <IconAlertTriangle size={12} />, label: 'Escalated' },
        flagged: { style: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20', icon: <IconFlagFilled size={12} />, label: 'Flagged' },
        frozen: { style: 'bg-zinc-50 text-slate-900 border-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-300 dark:border-zinc-500/20', icon: <IconPlayerPause size={12} />, label: 'Frozen' },
        pending: { style: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20', icon: <IconClock size={12} />, label: 'Proposal' },
    };
    const c = config[status] || config.unreviewed;
    return (
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", c.style)}>
            {c.icon} {c.label}
        </span>
    );
}

export default function GovernancePage() {
    const [items, setItems] = useState<GovernanceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterRisk, setFilterRisk] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

    useEffect(() => {
        const fetchData = () => {
            Promise.all([
                getGovernanceQueue().catch(() => ({ data: [] })),
                listProposals().catch(() => ({ data: [] }))
            ])
                .then(([queueRes, proposalsRes]) => {
                    const mappedProposals: GovernanceItem[] = proposalsRes.data.map(p => ({
                        id: p.id,
                        is_proposal: true,
                        decision_id: p.decision_id || `proposal-${p.id.substring(0, 8)}...`,
                        review_state: p.status, // "pending", "approved", "rejected"
                        tags: [{ name: 'Mode 2 (Sync)', category: 'mode' }],
                        last_updated: p.created_at,
                        risk_level: p.risk_level || 'unknown',
                        system_name: p.proposed_payload?.system_name || 'Unknown System'
                    }));
                    const allItems = [...queueRes.data, ...mappedProposals];
                    setItems(allItems.sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()));
                    setError(null);
                })
                .catch(err => {
                    console.error(err);
                    setError('Failed to load governance queue');
                })
                .finally(() => setLoading(false));
        };

        fetchData();
        const intervalId = setInterval(fetchData, 3000); // 3s auto-refresh
        return () => clearInterval(intervalId);
    }, []);

    // Computed stats
    const underReview = items.filter(i => i.review_state === 'in_review' || i.review_state === 'unreviewed').length;
    const approved = items.filter(i => i.review_state === 'reviewed' || i.review_state === 'approved').length;
    const rejected = items.filter(i => i.review_state === 'rejected').length;
    const flagged = items.filter(i => i.review_state === 'flagged' || i.review_state === 'escalated').length;
    const frozen = items.filter(i => i.review_state === 'frozen').length;
    const assigned = items.filter(i => i.assigned_to).length;

    const filteredItems = useMemo(() => {
        // Tab filtering logic
        let result = items;
        if (activeTab === 'pending') {
            result = result.filter(i => !['approved', 'rejected', 'frozen'].includes(i.review_state));
        } else {
            result = result.filter(i => ['approved', 'rejected', 'frozen'].includes(i.review_state));
        }

        if (search) {
            const q = search.toLowerCase();
            result = result.filter(i => i.decision_id.toLowerCase().includes(q) || (i.system_name || '').toLowerCase().includes(q));
        }
        if (filterRisk !== 'all') result = result.filter(i => i.risk_level === filterRisk);
        if (filterStatus !== 'all') result = result.filter(i => i.review_state === filterStatus);
        return result;
    }, [items, search, filterRisk, filterStatus, activeTab]);

    if (loading) {
        return (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-border border-t-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 pb-20 space-y-8 text-foreground">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Governance</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage human oversight of AI decisions for regulatory compliance.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/governance/rules"
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border border-transparent bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow-sm h-9 px-4 py-2"
                    >
                        Configure Rules
                    </Link>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[
                    { label: 'Assigned to You', value: assigned, color: 'text-slate-800 bg-zinc-50 dark:text-zinc-300 dark:bg-zinc-500/10', icon: <IconClock size={18} /> },
                    { label: 'Under Review', value: underReview, color: 'text-slate-800 bg-zinc-50 dark:text-zinc-300 dark:bg-zinc-500/10', icon: <IconEye size={18} /> },
                    { label: 'Approved', value: approved, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10', icon: <IconCheck size={18} /> },
                    { label: 'Rejected', value: rejected, color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10', icon: <IconX size={18} /> },
                    { label: 'Flagged', value: flagged, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10', icon: <IconFlagFilled size={18} /> },
                    { label: 'Frozen', value: frozen, color: 'text-slate-800 bg-zinc-50 dark:text-zinc-300 dark:bg-zinc-500/10', icon: <IconPlayerPause size={18} /> },
                ].map(card => (
                    <div key={card.label} className="bg-card border border-border rounded-2xl shadow-card p-5 hover:shadow-glow-sm hover:-translate-y-1 transition-all duration-300">
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center mb-2", card.color)}>
                            {card.icon}
                        </div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{card.label}</p>
                        <p className="text-2xl font-bold mt-1">{card.value}</p>
                    </div>
                ))}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Tabs & Search & Filter */}
            <div className="bg-card border border-border rounded-2xl shadow-card p-5 space-y-4">
                <div className="flex border-b border-border mb-4">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={cn("px-4 py-2 font-medium text-sm transition-colors", activeTab === 'pending' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground')}
                    >
                        Action Required
                        {underReview + flagged > 0 && <span className="ml-2 bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full">{underReview + flagged}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn("px-4 py-2 font-medium text-sm transition-colors", activeTab === 'history' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground')}
                    >
                        History
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by Decision ID or system..."
                            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-700/50"
                        />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)}
                        className={cn("flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition",
                            showFilters ? "bg-zinc-50 text-slate-800 border-zinc-200" : "bg-secondary text-foreground border-border"
                        )}>
                        <IconFilter size={16} /> Filters
                    </button>
                </div>
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-border">
                        <div>
                            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Risk Level</label>
                            <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm">
                                <option value="all">All</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Review State</label>
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm">
                                <option value="all">All</option>
                                <option value="unreviewed">Unreviewed</option>
                                <option value="in_review">In Review</option>
                                <option value="reviewed">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="escalated">Escalated</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={() => { setFilterRisk('all'); setFilterStatus('all'); setSearch(''); }} className="text-sm text-muted-foreground hover:text-foreground px-3 py-2">Clear All</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Review Queue Table */}
            <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
                {filteredItems.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                            <IconCheck size={32} />
                        </div>
                        <h3 className="text-lg font-medium">All caught up!</h3>
                        <p className="text-muted-foreground mt-1">No decisions pending review.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-background border-b border-border">
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Decision ID</th>
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk Level</th>
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">System</th>
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Review State</th>
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned To</th>
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">SLA Remaining</th>
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</th>
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Updated</th>
                                    <th className="text-right py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filteredItems.map((item) => {
                                    const riskStyles: Record<string, string> = {
                                        high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
                                        medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
                                        low: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
                                    };
                                    return (
                                        <tr key={item.decision_id} className="hover:bg-secondary transition-colors">
                                            <td className="py-3 px-5">
                                                <span className="font-mono text-xs text-slate-800">{item.decision_id.substring(0, 12)}...</span>
                                            </td>
                                            <td className="py-3 px-5">
                                                <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-medium border capitalize", riskStyles[item.risk_level || 'low'] || 'bg-secondary text-muted-foreground border-border')}>
                                                    {item.risk_level || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5 text-foreground text-xs">{item.system_name || '—'}</td>
                                            <td className="py-3 px-5"><StatusBadge status={item.review_state} /></td>
                                            <td className="py-3 px-5 text-foreground text-xs">
                                                {item.assigned_to ? (
                                                    <span className="flex items-center gap-1">
                                                        <div className="w-5 h-5 rounded-full bg-slate-200 border border-border flex items-center justify-center text-[10px] text-muted-foreground uppercase">{item.assigned_to.charAt(0)}</div>
                                                        {item.assigned_to}
                                                    </span>
                                                ) : <span className="text-muted-foreground">Unassigned</span>}
                                            </td>
                                            <td className="py-3 px-5">
                                                {item.sla_deadline ? (
                                                    <span className="text-orange-600 font-mono text-xs flex items-center gap-1">
                                                        <IconClock size={12} /> {item.sla_deadline}
                                                    </span>
                                                ) : (
                                                    <span className="text-foreground font-mono text-xs">24h 00m (SLA target)</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-5">
                                                <div className="flex gap-1 flex-wrap">
                                                    {item.tags?.length > 0 ? item.tags.map((t, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-secondary text-muted-foreground text-xs rounded border border-border">{t.name}</span>
                                                    )) : <span className="text-foreground text-xs">—</span>}
                                                </div>
                                            </td>
                                            <td className="py-3 px-5 text-xs text-muted-foreground font-mono">
                                                {new Date(item.last_updated).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-3 px-5 text-right">
                                                <Link
                                                    href={item.is_proposal ? `/governance/proposals/${item.id}` : `/governance/${item.decision_id}`}
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
                                                >
                                                    {item.is_proposal ? 'Review Proposal' : 'Review Decision'} <IconChevronRight size={14} />
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
            <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                <p>Showing {filteredItems.length} of {items.length} items</p>
            </div>
        </div>
    );
}

