'use client';

import { useState } from 'react';
import {
    GitBranch, Building2, ArrowRight, Shield,
    Calendar, CheckCircle, AlertCircle
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

type TransferReason = 'acquisition' | 'spin_off' | 'court_order' | 'regulatory_transfer' | 'asset_sale' | 'insolvency';
type TransferStatus = 'pending' | 'approved' | 'executed' | 'rejected';

interface EvidenceOrigin {
    originalOrgId: string;
    originalOrgName: string;
    originalProjectName: string;
    recordedAt: string;
    originalRecordHash: string;
}

interface CustodyTransfer {
    id: string;
    fromOrgName: string;
    toOrgName: string;
    reason: TransferReason;
    status: TransferStatus;
    executedAt: string | null;
}

interface EvidenceLineage {
    decisionId: string;
    decisionHash: string;
    origin: EvidenceOrigin;
    transferHistory: CustodyTransfer[];
    currentOrgName: string;
}

// ============================================================
// Reason Labels
// ============================================================

const REASON_LABELS: Record<TransferReason, string> = {
    acquisition: 'Acquisition',
    spin_off: 'Spin-Off',
    court_order: 'Court Order',
    regulatory_transfer: 'Regulatory Transfer',
    asset_sale: 'Asset Sale',
    insolvency: 'Insolvency',
};

// ============================================================
// Transfer Timeline Item
// ============================================================

function TimelineItem({
    transfer,
    isLast
}: {
    transfer: CustodyTransfer;
    isLast: boolean;
}) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-primary-600" />
                </div>
                {!isLast && <div className="w-0.5 h-full bg-slate-200 mt-2" />}
            </div>
            <div className="flex-1 pb-6">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900">{transfer.fromOrgName}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{transfer.toOrgName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="bg-slate-100 px-2 py-0.5 rounded">{REASON_LABELS[transfer.reason]}</span>
                    {transfer.executedAt && (
                        <>
                            <span>•</span>
                            <span>{new Date(transfer.executedAt).toLocaleDateString()}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Evidence Lineage Panel
// ============================================================

interface EvidenceLineagePanelProps {
    lineage: EvidenceLineage;
}

export function EvidenceLineagePanel({ lineage }: EvidenceLineagePanelProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-slate-600" />
                    <h3 className="font-semibold text-slate-900">Evidence Lineage</h3>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-sm text-primary-600 hover:underline"
                >
                    {expanded ? 'Collapse' : 'Expand'}
                </button>
            </div>

            {/* Origin Section */}
            <div className="p-4 bg-green-50 border-b border-green-200">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">Evidence Origin</p>
                        <p className="text-green-700 font-semibold">{lineage.origin.originalOrgName}</p>
                        <p className="text-sm text-green-600">{lineage.origin.originalProjectName}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
                            <Calendar className="w-3 h-3" />
                            <span>First recorded: {new Date(lineage.origin.recordedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                        <Shield className="w-3 h-3" />
                        <span>Immutable</span>
                    </div>
                </div>
            </div>

            {/* Current Custody */}
            <div className="p-4 border-b border-slate-200">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">Current Custody:</span>
                    <span className="font-medium text-slate-900">{lineage.currentOrgName}</span>
                    {lineage.transferHistory.length > 0 && (
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                            {lineage.transferHistory.length} transfer(s)
                        </span>
                    )}
                </div>
            </div>

            {/* Transfer History */}
            {expanded && lineage.transferHistory.length > 0 && (
                <div className="p-4 border-b border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-4">Custody Transfers</p>
                    <div>
                        {lineage.transferHistory.map((transfer, i) => (
                            <TimelineItem
                                key={transfer.id}
                                transfer={transfer}
                                isLast={i === lineage.transferHistory.length - 1}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Trust Banner */}
            <div className="p-4 -zinc-50">
                <p className="text-zinc-700 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Custody transfer does not affect cryptographic validity.
                </p>
            </div>
        </div>
    );
}

// ============================================================
// Demo/Example Component
// ============================================================

export default function LineageDemoPage() {
    const demoLineage: EvidenceLineage = {
        decisionId: 'dec_abc123',
        decisionHash: 'sha256:a1b2c3d4e5f6...',
        origin: {
            originalOrgId: 'org_original',
            originalOrgName: 'Original Corp',
            originalProjectName: 'AI Risk Assessment',
            recordedAt: '2025-03-12T10:30:00Z',
            originalRecordHash: 'sha256:a1b2c3d4e5f6...',
        },
        transferHistory: [
            {
                id: 'tr_001',
                fromOrgName: 'Original Corp',
                toOrgName: 'Acquiring Inc',
                reason: 'acquisition',
                status: 'executed',
                executedAt: '2026-01-10T14:00:00Z',
            },
        ],
        currentOrgName: 'Acquiring Inc',
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-3xl mx-auto px-8 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <GitBranch className="w-6 h-6 text-slate-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Evidence Lineage</h1>
                        <p className="text-slate-600">Cross-organization custody tracking</p>
                    </div>
                </div>

                <EvidenceLineagePanel lineage={demoLineage} />

                {/* What Transfer Does */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
                    <h3 className="font-semibold text-slate-900 mb-4">What Custody Transfer Does</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                DOES
                            </p>
                            <ul className="space-y-1 text-sm text-slate-600">
                                <li>• Moves UI visibility to new org</li>
                                <li>• Transfers billing responsibility</li>
                                <li>• Updates access permissions</li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                NEVER DOES
                            </p>
                            <ul className="space-y-1 text-sm text-slate-600">
                                <li>❌ Rehash or re-sign</li>
                                <li>❌ Modify chain</li>
                                <li>❌ Change decision_id</li>
                                <li>❌ Change record_hash</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-400 mt-8">
                    Evidence may change custody. Facts never change authorship.
                </p>
            </div>
        </div>
    );
}
