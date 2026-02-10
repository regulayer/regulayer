
'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

type SystemStatus = 'operational' | 'degraded' | 'critical';

interface StatusResponse {
    status: SystemStatus;
    last_updated: string;
}

export default function StatusPage() {
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/v1/public/status`);
            if (res.ok) {
                const data: StatusResponse = await res.json();
                setStatus(data.status);
                setLastUpdated(data.last_updated);
            } else {
                setStatus('degraded'); // Assume issues if status page fails
            }
        } catch {
            setStatus('degraded');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const getStatusConfig = (s: SystemStatus) => {
        switch (s) {
            case 'operational':
                return {
                    icon: ShieldCheck,
                    color: 'text-green-600',
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    label: 'All Systems Operational',
                    desc: 'Regulayer core services are running normally.'
                };
            case 'degraded':
                return {
                    icon: AlertTriangle,
                    color: 'text-yellow-600',
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    label: 'Partial Degradation',
                    desc: 'Some non-critical services are experiencing issues.'
                };
            case 'critical':
                return {
                    icon: XCircle,
                    color: 'text-red-600',
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    label: 'Critical System Outage',
                    desc: 'Core services (Ingestion/Recorder) are currently unavailable.'
                };
            default:
                return {
                    icon: RefreshCw,
                    color: 'text-gray-600',
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    label: 'Checking Status...',
                    desc: 'Contacting Regulayer Operations...'
                };
        }
    };

    const config = getStatusConfig(status || 'operational');
    const Icon = config.icon;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">

                {/* Header */}
                <div className="bg-slate-900 px-8 py-6 text-center">
                    <h1 className="text-2xl font-bold text-white tracking-tight">Regulayer System Status</h1>
                </div>

                {/* Status Card */}
                <div className="p-8">
                    <div className={`p-6 rounded-xl border-2 ${config.bg} ${config.border} flex items-start gap-4 transition-all duration-500`}>
                        <div className={`p-3 rounded-full bg-white shadow-sm ${config.color}`}>
                            <Icon className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className={`text-xl font-bold ${config.color} mb-1`}>
                                {loading && !status ? "Checking..." : config.label}
                            </h2>
                            <p className="text-slate-600">
                                {config.desc}
                            </p>
                        </div>
                    </div>

                    {/* Service Grid (Static for now, could be dynamic) */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ServiceItem name="Ingestion API" status={status === 'critical' ? 'down' : 'up'} />
                        <ServiceItem name="Cryptographic Recorder" status={status === 'critical' ? 'down' : 'up'} />
                        <ServiceItem name="Governance Control Plane" status={status === 'critical' ? 'down' : 'up'} />
                        <ServiceItem name="Verification Network" status="up" />
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
                        Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Just now'}
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center text-slate-400 text-sm">
                <a href="/" className="hover:text-slate-600 transition-colors">← Back to Home</a>
            </div>
        </div>
    );
}

function ServiceItem({ name, status }: { name: string, status: 'up' | 'down' | 'degraded' }) {
    const isUp = status === 'up';
    return (
        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
            <span className="font-medium text-slate-700">{name}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isUp ? 'OPERATIONAL' : 'OUTAGE'}
            </span>
        </div>
    )
}
