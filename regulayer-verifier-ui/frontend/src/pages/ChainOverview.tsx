/**
 * Regulayer Verification UI - Chain Overview Page
 */

import React, { useEffect, useState } from 'react';
import { verifierAPI, ChainStatus } from '../api/verifier';
import { StatusBadge } from '../components/StatusBadge';

export const ChainOverview: React.FC = () => {
    const [status, setStatus] = useState<ChainStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadChainStatus();
    }, []);

    const loadChainStatus = async () => {
        try {
            setLoading(true);
            const data = await verifierAPI.getChainStatus();
            setStatus(data);
        } catch (err) {
            setError('Failed to load chain status');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading chain status...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;
    if (!status) return null;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Chain Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="text-sm text-gray-600 mb-2">Chain ID</div>
                    <div className="text-2xl font-bold">{status.chain_id}</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="text-sm text-gray-600 mb-2">Total Records</div>
                    <div className="text-2xl font-bold">{status.total_records.toLocaleString()}</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="text-sm text-gray-600 mb-2">Chain Status</div>
                    <div className="mt-2">
                        <StatusBadge status={status.integrity_status} size="lg" />
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="text-sm text-gray-600 mb-2">Last Record</div>
                    <div className="text-sm font-mono">
                        {status.last_record_timestamp
                            ? new Date(status.last_record_timestamp).toLocaleString()
                            : 'N/A'}
                    </div>
                </div>
            </div>

            {status.failure_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="font-semibold text-red-800">Failure Reason:</div>
                    <div className="text-red-700">{status.failure_reason}</div>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Actions</h2>
                <button
                    onClick={() => window.location.hash = '/verify'}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Run Full Verification
                </button>
            </div>
        </div>
    );
};
