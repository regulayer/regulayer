'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    CheckCircle,
    Clock,
    Search,
    Filter,
    ChevronRight
} from 'lucide-react';

interface GovernanceItem {
    decision_id: string;
    review_state: string;
    tags: Array<{ name: string; category: string }>;
    last_updated: string;
}

async function getGovernanceQueue() {
    // In production, this would be in lib/api.ts
    const token = localStorage.getItem('regulayer_token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/v1/governance/queue`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error('Failed to fetch queue');
    return res.json();
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        unreviewed: 'bg-slate-100 text-slate-700',
        in_review: 'bg-blue-100 text-blue-700',
        reviewed: 'bg-green-100 text-green-700',
        escalated: 'bg-red-100 text-red-700',
    };
    const s = styles[status as keyof typeof styles] || styles.unreviewed;

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${s}`}>
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

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Governance Queue</h1>
                        <p className="text-slate-600">Review and annotate decisions for compliance.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition">
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search decisions..."
                                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">Loading queue...</div>
                    ) : items.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
                            <p className="text-slate-500">No unreviewed decisions pending.</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Decision ID</th>
                                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Tags</th>
                                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Last Updated</th>
                                    <th className="text-right py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item) => (
                                    <tr key={item.decision_id} className="hover:bg-slate-50 transition">
                                        <td className="py-4 px-6 font-mono text-sm text-primary-600">
                                            {item.decision_id.substring(0, 8)}...
                                        </td>
                                        <td className="py-4 px-6">
                                            <StatusBadge status={item.review_state} />
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex gap-1 flex-wrap">
                                                {item.tags.length > 0 ? item.tags.map((t, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200">
                                                        {t.name}
                                                    </span>
                                                )) : <span className="text-slate-400 text-xs">-</span>}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(item.last_updated).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Link
                                                href={`/governance/${item.decision_id}`}
                                                className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                                            >
                                                Review <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
