'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    IconCheck,
    IconClock,
    IconSearch,
    IconFilter,
    IconChevronRight,
    IconLoader2,
    IconBuildingBank
} from '@tabler/icons-react';
import { GlazedCard } from '@/components/ui/glazed-card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GovernanceItem {
    decision_id: string;
    review_state: string;
    tags: Array<{ name: string; category: string }>;
    last_updated: string;
}

// Mock function - replace with proper API call
async function getGovernanceQueue() {
    // In production, this would be in lib/api.ts
    // Return empty for now to test UI
    return [];
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        unreviewed: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
        in_review: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        reviewed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        escalated: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    };
    // @ts-ignore
    const s = styles[status] || styles.unreviewed;

    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border border-transparent", s)}>
            {status.replace('_', ' ')}
        </span>
    );
}

export default function GovernancePage() {
    const [items, setItems] = useState<GovernanceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getGovernanceQueue()
            .then(setItems)
            .catch(err => {
                console.error(err);
                setError('Failed to load governance queue');
            })
            .finally(() => setLoading(false));
    }, []);

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
                        Governance Queue
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Review and verify decisions against compliance policies.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium transition-colors">
                        <IconFilter size={18} />
                        Filter
                    </button>
                    <div className="relative">
                        <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search decisions..."
                            className="pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg">
                    {error}
                </div>
            )}

            <GlazedCard className="overflow-hidden">
                {items.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                            <IconCheck size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">All caught up!</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1">No unreviewed decisions pending for your attention.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Decision ID</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tags</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Last Updated</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {items.map((item) => (
                                <tr key={item.decision_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                                    <td className="py-4 px-6 font-mono text-sm text-indigo-600 dark:text-indigo-400">
                                        {item.decision_id.substring(0, 8)}...
                                    </td>
                                    <td className="py-4 px-6">
                                        <StatusBadge status={item.review_state} />
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex gap-1 flex-wrap">
                                            {item.tags.length > 0 ? item.tags.map((t, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs rounded border border-zinc-200 dark:border-zinc-700">
                                                    {t.name}
                                                </span>
                                            )) : <span className="text-zinc-400 text-xs">-</span>}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-zinc-500">
                                        <div className="flex items-center gap-1">
                                            <IconClock size={14} />
                                            {new Date(item.last_updated).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <Link
                                            href={`/governance/${item.decision_id}`}
                                            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline"
                                        >
                                            Review <IconChevronRight size={16} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </GlazedCard>
        </div>
    );
}
