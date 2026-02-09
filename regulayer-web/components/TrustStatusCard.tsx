
'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { getPublicStatus, SystemStatus } from '@/lib/api';

export function TrustStatusCard() {
    const [status, setStatus] = useState<string>('loading');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStatus() {
            try {
                const res = await getPublicStatus();
                if (res.data) {
                    setStatus(res.data.status);
                } else {
                    setStatus('unknown');
                }
            } catch (e) {
                setStatus('unknown');
            } finally {
                setLoading(false);
            }
        }
        loadStatus();
    }, []);

    const getConfig = (s: string) => {
        switch (s) {
            case 'operational':
                return { icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50', text: 'All Systems Operational' };
            case 'degraded':
                return { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', text: 'Degraded Performance' };
            case 'critical':
                return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', text: 'Critical Outage' };
            default:
                return { icon: RefreshCw, color: 'text-slate-400', bg: 'bg-slate-50', text: 'Checking Status...' };
        }
    }

    const config = getConfig(loading ? 'loading' : status);
    const Icon = config.icon;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between">
            <div>
                <h3 className="font-semibold text-slate-900 mb-2">System Trust Status</h3>
                <p className="text-sm text-slate-500 mb-4">
                    Real-time integrity verification of the Regulayer network.
                </p>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg ${config.bg}`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
                <span className={`font-medium ${config.color}`}>
                    {config.text}
                </span>
            </div>
        </div>
    );
}
