/**
 * Regulayer Verification UI - Decision List Page
 */

import React, { useEffect, useState } from 'react';
import { verifierAPI, DecisionSummary } from '../api/verifier';
import { StatusBadge } from '../components/StatusBadge';
import { format } from 'date-fns';

export const DecisionList: React.FC = () => {
    const [decisions, setDecisions] = useState<DecisionSummary[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [page, setPage] = useState(0);
    const limit = 100;

    useEffect(() => {
        loadDecisions();
    }, [page]);

    const loadDecisions = async () => {
        try {
            setLoading(true);
            const data = await verifierAPI.getDecisions(limit, page * limit);
            setDecisions(data.decisions);
            setTotal(data.total);
        } catch (err) {
            setError('Failed to load decisions');
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(total / limit);

    if (loading) return <div className="p-8">Loading decisions...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Decision Records</h1>
                <div className="text-sm text-gray-600">
                    Total: {total.toLocaleString()} records
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Record ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Decision ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">System</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {decisions.map((decision) => (
                            <tr key={decision.decision_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                    {decision.record_id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                                    {decision.decision_id.slice(0, 8)}...
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {format(new Date(decision.server_timestamp), 'yyyy-MM-dd HH:mm:ss')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {decision.system_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={decision.event_state as any} size="sm" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <a
                                        href={`#/decisions/${decision.decision_id}`}
                                        className="text-blue-600 hover:text-blue-800 mr-3"
                                    >
                                        Inspect
                                    </a>
                                    <a
                                        href={`#/verify/${decision.decision_id}`}
                                        className="text-green-600 hover:text-green-800"
                                    >
                                        Verify
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    Showing {page * limit + 1} - {Math.min((page + 1) * limit, total)} of {total.toLocaleString()}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};
