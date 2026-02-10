'use client';

import { useState, useEffect } from 'react';
import {
    Download, FileText, Shield,
    ChevronDown, ChevronRight, Copy, CheckCircle, Lock, AlertTriangle
} from 'lucide-react';
import { getMe } from '@/lib/api';

// ============================================================
// Types
// ============================================================

interface Export {
    id: string;
    type: 'proof_bundle' | 'governance_report' | 'trust_report' | 'submission_package';
    name: string;
    createdAt: string;
    size: string;
    hash?: string;
}

// ============================================================
// Export Type Badge
// ============================================================

function ExportTypeBadge({ type }: { type: string }) {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        proof_bundle: { bg: 'bg-green-100', text: 'text-green-700', label: 'Proof Bundle' },
        governance_report: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Governance Report' },
        trust_report: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Trust Report' },
        submission_package: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Submission Package' },
    };

    const c = config[type] || { bg: 'bg-slate-100', text: 'text-slate-700', label: type };

    return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${c.bg} ${c.text}`}>
            {c.label}
        </span>
    );
}

// ============================================================
// Export Row
// ============================================================

function ExportRow({ exp }: { exp: Export }) {
    const [showHash, setShowHash] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyHash = () => {
        if (exp.hash) {
            navigator.clipboard.writeText(exp.hash);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="border-b border-slate-100 last:border-0">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 rounded-lg">
                        <FileText className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">{exp.name}</p>
                        <p className="text-sm text-slate-500">{new Date(exp.createdAt).toLocaleString()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <ExportTypeBadge type={exp.type} />
                    <span className="text-sm text-slate-500">{exp.size}</span>

                    {exp.hash && (
                        <button
                            onClick={() => setShowHash(!showHash)}
                            className="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1"
                        >
                            {showHash ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            Hash
                        </button>
                    )}

                    <button className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        Download
                    </button>
                </div>
            </div>

            {showHash && exp.hash && (
                <div className="px-6 pb-4">
                    <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
                        <code className="text-xs text-slate-600 font-mono">{exp.hash}</code>
                        <button onClick={copyHash} className="text-slate-400 hover:text-slate-600">
                            {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================================
// Main Exports Page
// ============================================================

export default function ExportsPage() {
    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        async function checkOrg() {
            try {
                const res = await getMe();
                if (res.data?.org?.is_demo) {
                    setIsDemo(true);
                }
            } catch {
                // Ignore
            }
        }
        checkOrg();
    }, []);

    const [exports] = useState<Export[]>([
        {
            id: 'exp_001',
            type: 'proof_bundle',
            name: 'January 2026 Proof Bundle',
            createdAt: new Date().toISOString(),
            size: '2.4 MB',
            hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        },
        {
            id: 'exp_002',
            type: 'governance_report',
            name: 'Q4 2025 Governance Evidence',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            size: '1.1 MB',
            hash: 'sha256:d7a8fbb307d7809469ca3e4f29e0c58a2e3f7f3a5a2ee5c3e3d7889d0917f2b4'
        },
        {
            id: 'exp_003',
            type: 'trust_report',
            name: 'Loan Approval Trust Report',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            size: '456 KB',
            hash: 'sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
        },
        {
            id: 'exp_004',
            type: 'submission_package',
            name: 'Audit Submission - External',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            size: '5.8 MB',
            hash: 'sha256:6dcd4ce23d88e2ee9568ba546c007c63d9131c1b2b0e9c6e4d8e1f4a5b6c7d8e'
        },
    ]);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Demo Watermark Banner */}
                {isDemo && (
                    <div className="bg-amber-100 border-2 border-amber-400 rounded-lg p-4 mb-6 flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                        <div>
                            <p className="font-bold text-amber-800">DEMO ACCOUNT — NOT FOR PRODUCTION USE</p>
                            <p className="text-sm text-amber-700">
                                Exports from demo accounts are watermarked and should not be used for legal or regulatory purposes.
                            </p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Exports</h1>
                    <p className="text-slate-600">Download proof bundles and governance evidence</p>
                </div>

                {/* Trust Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                        <p className="text-green-800 text-sm font-medium">Offline Verification Available</p>
                        <p className="text-green-700 text-sm">
                            These exports can be verified without Regulayer.{' '}
                            <a href="/docs/verify-offline" className="underline hover:no-underline">
                                Learn how →
                            </a>
                        </p>
                    </div>
                </div>

                {/* Exports List */}
                <div className="bg-white rounded-xl border border-slate-200">
                    <div className="p-6 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-900">Available Exports</h3>
                    </div>

                    {exports.map((exp) => (
                        <ExportRow key={exp.id} exp={exp} />
                    ))}
                </div>

                {/* Always Available Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <p className="text-blue-800 text-sm">
                        <strong>Exports are always available</strong> — even if ingestion is paused due to billing.
                    </p>
                </div>

                {/* Footer Disclaimer */}
                <p className="text-center text-xs text-slate-400 mt-8">
                    Regulayer interfaces do not modify cryptographic records.
                </p>
            </div>
        </div>
    );
}
