import Link from 'next/link';
import { Shield, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

// Mock data - in production this would fetch from /v1/status
const statusData = {
    status: 'OPERATIONAL',
    lastUpdated: '2026-01-24T18:30:00Z',
    activeIncidents: 0,
    components: [
        { name: 'Ingestion Gateway', status: 'operational' },
        { name: 'Decision Recorder', status: 'operational' },
        { name: 'Verification Service', status: 'operational' },
        { name: 'Control Plane', status: 'operational' },
        { name: 'Billing Service', status: 'operational' },
        { name: 'Queue System', status: 'operational' },
    ]
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'operational':
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'degraded':
            return <AlertTriangle className="w-5 h-5 text-amber-500" />;
        case 'partial_outage':
            return <AlertTriangle className="w-5 h-5 text-orange-500" />;
        case 'major_outage':
            return <XCircle className="w-5 h-5 text-red-500" />;
        default:
            return <Clock className="w-5 h-5 text-slate-400" />;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'OPERATIONAL':
            return 'bg-green-500';
        case 'DEGRADED':
            return 'bg-amber-500';
        case 'PARTIAL_OUTAGE':
            return 'bg-orange-500';
        case 'MAJOR_OUTAGE':
            return 'bg-red-500';
        default:
            return 'bg-slate-400';
    }
};

export default function StatusPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 py-6 px-8">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-primary-600" />
                        <span className="text-xl font-bold text-slate-900">Regulayer Status</span>
                    </Link>
                    <a
                        href="/docs"
                        className="text-slate-500 hover:text-slate-700 text-sm"
                    >
                        Return to Regulayer
                    </a>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-8 py-12">
                {/* Overall Status */}
                <div className={`rounded-2xl p-8 mb-8 ${statusData.status === 'OPERATIONAL' ? 'bg-green-50 border border-green-200' :
                        statusData.status === 'DEGRADED' ? 'bg-amber-50 border border-amber-200' :
                            'bg-red-50 border border-red-200'
                    }`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${getStatusColor(statusData.status)}`} />
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {statusData.status === 'OPERATIONAL' ? 'All Systems Operational' :
                                    statusData.status === 'DEGRADED' ? 'Degraded Performance' :
                                        'System Issues Detected'}
                            </h1>
                            <p className="text-slate-600">
                                Last updated: {new Date(statusData.lastUpdated).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Components */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-900">System Components</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {statusData.components.map((component) => (
                            <div key={component.name} className="px-6 py-4 flex items-center justify-between">
                                <span className="text-slate-900">{component.name}</span>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(component.status)}
                                    <span className="text-sm text-slate-500 capitalize">{component.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trust Notice */}
                <div className="bg-slate-100 rounded-xl p-6">
                    <h3 className="font-semibold text-slate-900 mb-2">Operational Status ≠ Cryptographic Validity</h3>
                    <p className="text-sm text-slate-600">
                        This page shows operational health of Regulayer services.
                        Service outages do not affect the validity of previously recorded decisions.
                        Proof verification works offline without Regulayer infrastructure.
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 py-8 px-8">
                <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
                    <p>© 2026 Regulayer. Status updates every 60 seconds.</p>
                </div>
            </footer>
        </div>
    );
}
