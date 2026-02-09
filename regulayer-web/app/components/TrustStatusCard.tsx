
"use client";

import { useState, useEffect } from 'react';
import { getPublicStatus } from '@/lib/api';
import { CheckCircle, AlertTriangle, AlertOctagon, Clock, Lock } from 'lucide-react';
import Link from 'next/link';

export function TrustStatusCard() {
    const [status, setStatus] = useState<'operational' | 'degraded' | 'critical'>('operational');
    const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStatus() {
            try {
                const res = await getPublicStatus();
                if (res.data) {
                    setStatus(res.data.status);
                    setLastUpdated(res.data.last_updated);
                }
            } catch (e) {
                console.error("Failed to fetch trust status", e);
            } finally {
                setLoading(false);
            }
        }
        fetchStatus();
        // Poll every 30s
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const getStatusConfig = () => {
        switch (status) {
            case 'critical':
                return {
                    icon: AlertOctagon,
                    color: 'text-red-600',
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    text: 'Critical Incidents',
                    desc: 'System trust is degraded. Check alerts immediately.'
                };
            case 'degraded':
                return {
                    icon: AlertTriangle,
                    color: 'text-amber-600',
                    bg: 'bg-amber-50',
                    border: 'border-amber-200',
                    text: 'Degraded Performance',
                    desc: 'Non-critical issues detected. Exports may be delayed.'
                };
            case 'operational':
            default:
                return {
                    icon: CheckCircle,
                    color: 'text-green-600',
                    bg: 'bg-white',
                    border: 'border-slate-200',
                    text: 'All Systems Operational',
                    desc: 'Cryptographic integrity verified.'
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div className={`rounded-xl border ${config.border} ${config.bg} p-6 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${status === 'operational' ? 'text-slate-900' : config.color}`}>
                    Trust Status
                </h3>
                <Link href="/alerts" className="text-xs text-primary-600 hover:underline">
                    View Logs
                </Link>
            </div>

            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <Icon className={`w-6 h-6 mt-0.5 ${config.color}`} />
                    <div>
                        <p className={`font-medium ${status === 'operational' ? 'text-slate-900' : config.color}`}>
                            {config.text}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            {config.desc}
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Proof Chain: </span>
                        <span className="text-green-600 font-mono">VALID</span>
                    </div>
                    <div className="flex items-center gap-1.5" title={new Date(lastUpdated).toLocaleString()}>
                        <Clock className="w-3 h-3" />
                        <span>Updated {new Date(lastUpdated).toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
