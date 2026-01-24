'use client';

import { useState } from 'react';
import { Key, Plus, Eye, EyeOff, Copy, Trash2, AlertTriangle } from 'lucide-react';

export default function ApiKeysPage() {
    const [keys] = useState([
        { id: 'key_1', name: 'Production SDK', prefix: 'rl_live_abc', scopes: ['ingest', 'verify'], created: '2024-01-15', lastUsed: '2 min ago' },
        { id: 'key_2', name: 'Staging SDK', prefix: 'rl_test_xyz', scopes: ['ingest'], created: '2024-01-20', lastUsed: '1 hour ago' },
        { id: 'key_3', name: 'Export Only', prefix: 'rl_live_exp', scopes: ['export'], created: '2024-02-01', lastUsed: 'Never' },
    ]);

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
                    <p className="text-slate-600">Manage keys for SDK authentication</p>
                </div>
                <button className="bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-500 transition flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create Key
                </button>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                        <p className="font-medium text-amber-800">Security Notice</p>
                        <p className="text-sm text-amber-700 mt-1">
                            API keys are shown only once when created. Store them securely.
                            Revoked keys cannot be recovered.
                        </p>
                    </div>
                </div>
            </div>

            {/* Keys Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">Name</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">Key</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">Scopes</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">Last Used</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {keys.map((key) => (
                            <tr key={key.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                            <Key className="w-4 h-4 text-primary-600" />
                                        </div>
                                        <span className="font-medium text-slate-900">{key.name}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                        <code className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                            {key.prefix}...
                                        </code>
                                        <button className="p-1 hover:bg-slate-200 rounded" title="Copy">
                                            <Copy className="w-4 h-4 text-slate-400" />
                                        </button>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex gap-1">
                                        {key.scopes.map((scope) => (
                                            <span key={scope} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                                {scope}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-sm text-slate-500">{key.lastUsed}</td>
                                <td className="py-4 px-6">
                                    <button className="p-2 hover:bg-red-50 rounded text-red-500" title="Revoke">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
