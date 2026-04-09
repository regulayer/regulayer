'use client';

import { useState } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, X } from 'lucide-react';

// ============================================================
// Types
// ============================================================

type TrustState = 'healthy' | 'degraded' | 'outage';

interface TrustBannerProps {
    state?: TrustState;
    message?: string;
    dismissible?: boolean;
}

// ============================================================
// State Configuration
// ============================================================

const stateConfig: Record<TrustState, {
    icon: React.ReactNode;
    bg: string;
    border: string;
    text: string;
    defaultMessage: string;
}> = {
    healthy: {
        icon: <CheckCircle className="w-4 h-4" />,
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        defaultMessage: 'All cryptographic systems operational',
    },
    degraded: {
        icon: <AlertTriangle className="w-4 h-4" />,
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        defaultMessage: 'Ingestion delayed — existing proofs unaffected',
    },
    outage: {
        icon: <AlertCircle className="w-4 h-4" />,
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        defaultMessage: 'Ingestion unavailable — verification & export remain available',
    },
};

// ============================================================
// Trust Status Banner Component
// ============================================================

export function TrustStatusBanner({
    state = 'healthy',
    message,
    dismissible = false,
}: TrustBannerProps) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    const config = stateConfig[state];
    const displayMessage = message || config.defaultMessage;

    return (
        <div className={`${config.bg} ${config.border} border-b px-4 py-2`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={config.text}>{config.icon}</span>
                    <span className={`text-sm ${config.text}`}>{displayMessage}</span>
                    {state !== 'healthy' && (
                        <span className={`text-xs ${config.text} opacity-70`}>
                            • Cryptographic records are unaffected
                        </span>
                    )}
                </div>
                {dismissible && state === 'healthy' && (
                    <button
                        onClick={() => setDismissed(true)}
                        className={`${config.text} hover:opacity-70`}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

// ============================================================
// Compact Trust Indicator (For Headers)
// ============================================================

export function TrustIndicator({ state = 'healthy' }: { state?: TrustState }) {
    const colors: Record<TrustState, string> = {
        healthy: 'bg-green-500',
        degraded: 'bg-brand-600',
        outage: 'bg-red-500',
    };

    const labels: Record<TrustState, string> = {
        healthy: 'Operational',
        degraded: 'Degraded',
        outage: 'Outage',
    };

    return (
        <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className={`w-2 h-2 rounded-full ${colors[state]}`} />
            <span>{labels[state]}</span>
        </div>
    );
}

// ============================================================
// Status Legend
// ============================================================

export function StatusLegend() {
    return (
        <div className="bg-slate-50 rounded-lg p-4 text-sm">
            <p className="font-medium text-slate-900 mb-3">Status Legend</p>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-slate-600">Healthy — All systems operational</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-600" />
                    <span className="text-slate-600">Degraded — Delays, but no data loss</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-slate-600">Outage — Ingestion paused, export available</span>
                </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200">
                Operational availability ≠ cryptographic validity
            </p>
        </div>
    );
}

export default TrustStatusBanner;
