'use client';

import { useState } from 'react';
import {
    Trash2, Clock, Shield, AlertCircle,
    CheckCircle, FileText, Lock, Eye, EyeOff,
    Plus, X
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

type DeletionRequestType = 'gdpr' | 'dpdp' | 'contractual' | 'internal';
type DeletionScope = 'visibility' | 'metadata_only';
type DeletionStatus = 'pending' | 'approved' | 'executed' | 'rejected';

interface DeletionRequest {
    id: string;
    decisionId: string;
    requestType: DeletionRequestType;
    scope: DeletionScope;
    requestedBy: string;
    status: DeletionStatus;
    createdAt: string;
}

interface RetentionPolicy {
    id: string;
    scope: 'metadata' | 'governance' | 'ui';
    retentionDays: number;
    enabled: boolean;
}

// ============================================================
// Status Badge
// ============================================================

function StatusBadge({ status }: { status: DeletionStatus }) {
    const configs: Record<DeletionStatus, { bg: string; text: string }> = {
        pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
        approved: { bg: 'bg-blue-100', text: 'text-blue-700' },
        executed: { bg: 'bg-green-100', text: 'text-green-700' },
        rejected: { bg: 'bg-red-100', text: 'text-red-700' },
    };
    const c = configs[status];
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>
            {status}
        </span>
    );
}

// ============================================================
// Request Deletion Modal
// ============================================================

function RequestDeletionModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
    const [decisionId, setDecisionId] = useState('');
    const [requestType, setRequestType] = useState<DeletionRequestType>('gdpr');
    const [scope, setScope] = useState<DeletionScope>('visibility');
    const [reason, setReason] = useState('');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Request Deletion</h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                    <p className="text-blue-800 text-sm">
                        <strong>Important:</strong> This hides the decision from UI and redacts metadata.
                        Cryptographic records are never deleted.
                    </p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Decision ID</label>
                    <input
                        type="text"
                        value={decisionId}
                        onChange={(e) => setDecisionId(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="dec_abc123..."
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Request Type</label>
                    <select
                        value={requestType}
                        onChange={(e) => setRequestType(e.target.value as DeletionRequestType)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2"
                    >
                        <option value="gdpr">GDPR Article 17</option>
                        <option value="dpdp">DPDP Act (India)</option>
                        <option value="contractual">Contractual</option>
                        <option value="internal">Internal Policy</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Scope</label>
                    <div className="space-y-2">
                        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${scope === 'visibility' ? 'border-primary-500 bg-primary-50' : 'border-slate-200'}`}>
                            <input type="radio" checked={scope === 'visibility'} onChange={() => setScope('visibility')} className="mt-1" />
                            <div>
                                <span className="font-medium text-slate-900">Visibility</span>
                                <p className="text-sm text-slate-500">Hide from UI, search, dashboards</p>
                            </div>
                        </label>
                        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${scope === 'metadata_only' ? 'border-primary-500 bg-primary-50' : 'border-slate-200'}`}>
                            <input type="radio" checked={scope === 'metadata_only'} onChange={() => setScope('metadata_only')} className="mt-1" />
                            <div>
                                <span className="font-medium text-slate-900">Metadata Only</span>
                                <p className="text-sm text-slate-500">Redact annotations & tags</p>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Reason for deletion request..."
                    />
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50">
                        Cancel
                    </button>
                    <button
                        onClick={() => onSubmit({ decisionId, requestType, scope, reason })}
                        disabled={!decisionId.trim()}
                        className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                        Submit Request
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Main Retention Settings Page
// ============================================================

export default function RetentionSettingsPage() {
    const [showRequestModal, setShowRequestModal] = useState(false);

    const [policies] = useState<RetentionPolicy[]>([
        { id: '1', scope: 'metadata', retentionDays: 365, enabled: true },
        { id: '2', scope: 'governance', retentionDays: 730, enabled: true },
        { id: '3', scope: 'ui', retentionDays: 365, enabled: true },
    ]);

    const [requests] = useState<DeletionRequest[]>([
        {
            id: 'del_001',
            decisionId: 'dec_abc123',
            requestType: 'gdpr',
            scope: 'visibility',
            requestedBy: 'legal@company.com',
            status: 'executed',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: 'del_002',
            decisionId: 'dec_def456',
            requestType: 'dpdp',
            scope: 'metadata_only',
            requestedBy: 'compliance@company.com',
            status: 'pending',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ]);

    const handleSubmit = (data: any) => {
        console.log('Deletion request:', data);
        setShowRequestModal(false);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Trash2 className="w-6 h-6 text-slate-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Retention & Deletion</h1>
                            <p className="text-slate-600">Manage data retention and erasure requests</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowRequestModal(true)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Request Deletion
                    </button>
                </div>

                {/* Critical Warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <Lock className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                        <p className="text-amber-800 text-sm font-medium">Cryptographic Records Cannot Be Deleted</p>
                        <p className="text-amber-700 text-sm">
                            Regulayer does not delete cryptographic records. Deletion hides data from UI and redacts governance metadata.
                            Proofs remain valid for audit and legal purposes.
                        </p>
                    </div>
                </div>

                {/* Retention Policies */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-slate-600" />
                        Retention Policies
                    </h3>
                    <div className="space-y-3">
                        {policies.map((policy) => (
                            <div key={policy.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                <div>
                                    <span className="font-medium text-slate-900 capitalize">{policy.scope}</span>
                                    <p className="text-sm text-slate-500">
                                        {policy.scope === 'metadata' && 'UI metadata, custom tags, labels'}
                                        {policy.scope === 'governance' && 'Governance annotations, approvals'}
                                        {policy.scope === 'ui' && 'Dashboard visibility'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-slate-700">{policy.retentionDays} days</span>
                                    <span className={`text-xs px-2 py-1 rounded ${policy.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {policy.enabled ? 'Active' : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Cryptographic records are never affected by retention policies
                        </p>
                    </div>
                </div>

                {/* Deletion Requests */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-600" />
                        Deletion Requests
                    </h3>
                    {requests.length === 0 ? (
                        <p className="text-slate-500 text-center py-4">No deletion requests</p>
                    ) : (
                        <div className="space-y-3">
                            {requests.map((req) => (
                                <div key={req.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <code className="text-sm text-slate-700">{req.decisionId}</code>
                                            <StatusBadge status={req.status} />
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            {req.requestType.toUpperCase()} • {req.scope} • by {req.requestedBy}
                                        </p>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* What Deletion Does */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">What Deletion Does</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                DOES
                            </p>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex items-center gap-2"><EyeOff className="w-4 h-4" /> Hides from UI</li>
                                <li className="flex items-center gap-2"><X className="w-4 h-4" /> Redacts metadata</li>
                                <li className="flex items-center gap-2"><X className="w-4 h-4" /> Removes from search</li>
                                <li className="flex items-center gap-2"><X className="w-4 h-4" /> Removes from dashboards</li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                NEVER DOES
                            </p>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li>❌ Delete hash</li>
                                <li>❌ Modify record</li>
                                <li>❌ Break chain</li>
                                <li>❌ Invalidate proof</li>
                                <li>❌ Block offline verification</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-400 mt-8">
                    Facts cannot be deleted. Access, visibility, and linkage can.
                </p>
            </div>

            {showRequestModal && (
                <RequestDeletionModal
                    onClose={() => setShowRequestModal(false)}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
}
