'use client';

import { useState } from 'react';
import {
    Key, Plus, Copy, CheckCircle, AlertTriangle,
    Shield, Eye, Download, Clock
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    scopes: ('ingest' | 'verify' | 'export')[];
    createdAt: string;
    status: 'active' | 'revoked';
}

// ============================================================
// Scope Badge
// ============================================================

function ScopeBadge({ scope }: { scope: string }) {
    const colors: Record<string, string> = {
        ingest: 'bg-green-100 text-green-700',
        verify: 'bg-blue-100 text-blue-700',
        export: 'bg-purple-100 text-purple-700',
    };

    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[scope] || 'bg-slate-100 text-slate-700'}`}>
            {scope}
        </span>
    );
}

// ============================================================
// Create Key Modal
// ============================================================

function CreateKeyModal({
    onClose,
    onCreate
}: {
    onClose: () => void;
    onCreate: (name: string, scopes: string[]) => void;
}) {
    const [name, setName] = useState('');
    const [scopes, setScopes] = useState<string[]>(['ingest']);

    const toggleScope = (scope: string) => {
        setScopes(s => s.includes(scope) ? s.filter(x => x !== scope) : [...s, scope]);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Create API Key</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Key Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., Production Backend"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Scopes</label>
                    <div className="flex gap-2">
                        {['ingest', 'verify', 'export'].map(scope => (
                            <button
                                key={scope}
                                onClick={() => toggleScope(scope)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${scopes.includes(scope)
                                    ? 'bg-primary-100 border-primary-300 text-primary-700'
                                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {scope}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onCreate(name, scopes)}
                        disabled={!name.trim() || scopes.length === 0}
                        className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                        Create Key
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Revoke Confirmation Modal
// ============================================================

function RevokeModal({ keyName, onClose, onConfirm }: { keyName: string; onClose: () => void; onConfirm: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Revoke Key?</h2>
                </div>

                <p className="text-slate-600 mb-4">
                    Are you sure you want to revoke <strong>{keyName}</strong>?
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                    <p className="text-blue-800 text-sm">
                        Revoking a key does not affect existing records.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                        Revoke Key
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Main API Keys Page
// ============================================================

export default function ApiKeysPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [revokeKey, setRevokeKey] = useState<ApiKey | null>(null);

    const [keys, setKeys] = useState<ApiKey[]>([
        {
            id: 'key_abc123',
            name: 'Production Backend',
            prefix: 'rl_live_abc...',
            scopes: ['ingest', 'verify'],
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active'
        },
        {
            id: 'key_def456',
            name: 'Export Service',
            prefix: 'rl_live_def...',
            scopes: ['export'],
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active'
        },
        {
            id: 'key_ghi789',
            name: 'Old Development',
            prefix: 'rl_test_ghi...',
            scopes: ['ingest', 'verify', 'export'],
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'revoked'
        },
    ]);

    const handleCreate = (name: string, scopes: string[]) => {
        console.log('Creating key:', name, scopes);
        setShowCreateModal(false);
    };

    const handleRevoke = () => {
        if (revokeKey) {
            setKeys(keys.map(k => k.id === revokeKey.id ? { ...k, status: 'revoked' as const } : k));
            setRevokeKey(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
                        <p className="text-slate-600">Manage access to your projects</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Key
                    </button>
                </div>

                {/* Keys Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-4">Name</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-4">Key</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-4">Scopes</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-4">Created</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-4">Status</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys.map((key) => (
                                <tr key={key.id} className="border-b border-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{key.name}</td>
                                    <td className="px-6 py-4 font-mono text-sm text-slate-600">{key.prefix}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1">
                                            {key.scopes.map(scope => (
                                                <ScopeBadge key={scope} scope={scope} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(key.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${key.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {key.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {key.status === 'active' && (
                                            <button
                                                onClick={() => setRevokeKey(key)}
                                                className="text-red-600 hover:underline text-sm"
                                            >
                                                Revoke
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Disclaimer */}
                <p className="text-center text-xs text-slate-400 mt-8">
                    Regulayer interfaces do not modify cryptographic records.
                </p>
            </div>

            {showCreateModal && (
                <CreateKeyModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreate}
                />
            )}

            {revokeKey && (
                <RevokeModal
                    keyName={revokeKey.name}
                    onClose={() => setRevokeKey(null)}
                    onConfirm={handleRevoke}
                />
            )}
        </div>
    );
}
