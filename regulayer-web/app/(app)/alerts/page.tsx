
"use client";

import { useEffect, useState } from 'react';
import { getIncidents, Incident } from '@/lib/api';
import { ShieldCheck, AlertTriangle, AlertOctagon, Info, CheckCircle } from 'lucide-react';

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
            } catch (e) {
                setError("Failed to load incidents");
            } finally {
                setLoading(false);
            }
        };

        fetchIncidents();
    }, []);

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return <AlertOctagon className="h-5 w-5 text-red-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'info': return <Info className="h-5 w-5 text-blue-500" />;
            default: return <Info className="h-5 w-5 text-gray-500" />;
        }
    };

    const getSeverityBadge = (severity: string) => {
        const base = "px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide";
        switch (severity) {
            case 'critical': return <span className={`${base} bg-red-100 text-red-800 border border-red-200`}>Critical</span>;
            case 'warning': return <span className={`${base} bg-yellow-100 text-yellow-800 border border-yellow-200`}>Warning</span>;
            case 'info': return <span className={`${base} bg-blue-100 text-blue-800 border border-blue-200`}>Info</span>;
            default: return <span className={`${base} bg-gray-100 text-gray-800`}>{severity}</span>;
        }
    };

    if (loading) return <div className="p-8">Loading alerts...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ShieldCheck className="h-8 w-8 text-indigo-600" />
                    System Trust Alerts
                </h1>
                <p className="text-gray-500 mt-2">
                    Operational incidents impacting system trust or availability.
                    This log is immutable and generated directly from the underlying infrastructure.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
                    Error loading alerts: {error}
                </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {incidents.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                                    <p className="font-medium text-lg">All Systems Operational</p>
                                    <p className="text-sm">No active incidents reported.</p>
                                </td>
                            </tr>
                        ) : (
                            incidents.map((inc) => (
                                <tr key={inc.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {getSeverityIcon(inc.severity)}
                                            {getSeverityBadge(inc.severity)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(inc.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                                        {inc.source}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {inc.incident_type}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="max-w-xl truncate" title={inc.message}>
                                            {inc.message}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
