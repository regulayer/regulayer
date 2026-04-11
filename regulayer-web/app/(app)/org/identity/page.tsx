'use client';

import { useState } from 'react';
import {
    Shield, Plus,
    TestTube,
    Globe, Lock
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

type ProviderType = 'SAML' | 'OIDC';
type ProviderStatus = 'active' | 'disabled' | 'pending' | 'failed';

interface IdentityProvider {
    id: string;
    name: string;
    type: ProviderType;
    issuer: string;
    enabled: boolean;
    status: ProviderStatus;
    emailDomains: string[];
    lastLoginAt: string | null;
}

interface IdentityProviderConfig {
    name: string;
    type: ProviderType;
    issuer: string;
    metadataUrl: string;
    clientId: string;
    domains: string;
}

// ============================================================
// Status Badge
// ============================================================

function StatusBadge({ status }: { status: ProviderStatus }) {
    const configs: Record<ProviderStatus, { bg: string; text: string }> = {
        active: { bg: 'bg-green-100', text: 'text-green-700' },
        disabled: { bg: 'bg-secondary', text: 'text-muted-foreground' },
        pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
        failed: { bg: 'bg-red-100', text: 'text-red-700' },
    };
    const c = configs[status];
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>
            {status}
        </span>
    );
}

// ============================================================
// Configure Provider Modal
// ============================================================

function ConfigureProviderModal({
    onClose,
    onCreate
}: {
    onClose: () => void;
    onCreate: (config: IdentityProviderConfig) => void;
}) {
    const [name, setName] = useState('');
    const [type, setType] = useState<ProviderType>('SAML');
    const [issuer, setIssuer] = useState('');
    const [metadataUrl, setMetadataUrl] = useState('');
    const [clientId, setClientId] = useState('');
    const [domains, setDomains] = useState('');

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-foreground mb-4">Configure Identity Provider</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">Provider Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., Okta Production"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">Protocol</label>
                    <div className="flex gap-4">
                        <label className={`flex-1 p-4 rounded-lg border cursor-pointer ${type === 'SAML' ? 'border-primary-500 bg-primary-50' : 'border-border'}`}>
                            <input
                                type="radio"
                                name="type"
                                value="SAML"
                                checked={type === 'SAML'}
                                onChange={() => setType('SAML')}
                                className="mr-2"
                            />
                            <span className="font-medium">SAML 2.0</span>
                        </label>
                        <label className={`flex-1 p-4 rounded-lg border cursor-pointer ${type === 'OIDC' ? 'border-primary-500 bg-primary-50' : 'border-border'}`}>
                            <input
                                type="radio"
                                name="type"
                                value="OIDC"
                                checked={type === 'OIDC'}
                                onChange={() => setType('OIDC')}
                                className="mr-2"
                            />
                            <span className="font-medium">OIDC</span>
                        </label>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">Issuer URL</label>
                    <input
                        type="url"
                        value={issuer}
                        onChange={(e) => setIssuer(e.target.value)}
                        className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://company.okta.com"
                    />
                </div>

                {type === 'SAML' && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-foreground mb-2">Metadata URL</label>
                        <input
                            type="url"
                            value={metadataUrl}
                            onChange={(e) => setMetadataUrl(e.target.value)}
                            className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="https://company.okta.com/app/xxx/sso/saml/metadata"
                        />
                    </div>
                )}

                {type === 'OIDC' && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-foreground mb-2">Client ID</label>
                        <input
                            type="text"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="0oa1b2c3d4e5f6g7h8i9"
                        />
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">Email Domains</label>
                    <input
                        type="text"
                        value={domains}
                        onChange={(e) => setDomains(e.target.value)}
                        className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="company.com, corp.company.com"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Comma-separated list of email domains</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                    <p className="text-zinc-800 text-sm">
                        <strong>Note:</strong> SSO controls access only. Cryptographic records remain independent.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-border text-foreground px-4 py-2 rounded-lg hover:bg-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onCreate({ name, type, issuer, metadataUrl, clientId, domains })}
                        disabled={!name.trim() || !issuer.trim()}
                        className="flex-1 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 disabled:opacity-50"
                    >
                        Create Provider
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Provider Card
// ============================================================

function ProviderCard({
    provider,
    onTest,
    onToggle
}: {
    provider: IdentityProvider;
    onTest: () => void;
    onToggle: () => void;
}) {
    return (
        <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                        <Shield className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{provider.name}</h3>
                            <StatusBadge status={provider.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">{provider.type} • {provider.issuer}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onTest}
                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                        <TestTube className="w-4 h-4" />
                        Test
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {provider.emailDomains.map((domain) => (
                    <span key={domain} className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {domain}
                    </span>
                ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                    {provider.lastLoginAt
                        ? `Last login: ${new Date(provider.lastLoginAt).toLocaleDateString()}`
                        : 'No logins yet'}
                </div>
                <button
                    onClick={onToggle}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium ${provider.enabled
                        ? 'bg-secondary text-foreground hover:bg-slate-200'
                        : 'bg-slate-800 text-white hover:bg-slate-900'
                        }`}
                >
                    {provider.enabled ? 'Disable' : 'Enable'}
                </button>
            </div>
        </div>
    );
}

// ============================================================
// Main Identity Settings Page
// ============================================================

export default function IdentitySettingsPage() {
    const [showConfigModal, setShowConfigModal] = useState(false);

    const [providers, setProviders] = useState<IdentityProvider[]>([
        {
            id: 'prov_001',
            name: 'Okta Production',
            type: 'SAML',
            issuer: 'https://company.okta.com',
            enabled: true,
            status: 'active',
            emailDomains: ['company.com', 'corp.company.com'],
            lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: 'prov_002',
            name: 'Azure AD',
            type: 'OIDC',
            issuer: 'https://login.microsoftonline.com/tenant',
            enabled: false,
            status: 'pending',
            emailDomains: ['company.onmicrosoft.com'],
            lastLoginAt: null,
        },
    ]);

    const handleCreate = (config: IdentityProviderConfig) => {
        console.log('Creating provider:', config);
        setShowConfigModal(false);
    };

    const handleTest = (id: string) => {
        console.log('Testing provider:', id);
    };

    const handleToggle = (id: string) => {
        setProviders(providers.map(p =>
            p.id === id ? { ...p, enabled: !p.enabled, status: p.enabled ? 'disabled' : 'active' as ProviderStatus } : p
        ));
    };

    return (
        <div className="min-h-screen bg-secondary">
            <div className="px-6 md:px-10 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Lock className="w-6 h-6 text-muted-foreground" />
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Identity & SSO</h1>
                            <p className="text-muted-foreground">Enterprise single sign-on configuration</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowConfigModal(true)}
                        className="bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-900 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Provider
                    </button>
                </div>

                {/* Trust Warning */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                        <p className="text-zinc-800 text-sm font-medium">SSO Controls Access Only</p>
                        <p className="text-muted-foreground text-sm">
                            Cryptographic records remain independent. SSO failure never blocks proof export or offline verification.
                        </p>
                    </div>
                </div>

                {/* Providers List */}
                <div className="space-y-4 mb-8">
                    {providers.length === 0 ? (
                        <div className="bg-card rounded-xl border border-border p-8 text-center">
                            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No identity providers configured</p>
                            <button
                                onClick={() => setShowConfigModal(true)}
                                className="mt-4 text-primary hover:underline"
                            >
                                Add your first provider →
                            </button>
                        </div>
                    ) : (
                        providers.map((provider) => (
                            <ProviderCard
                                key={provider.id}
                                provider={provider}
                                onTest={() => handleTest(provider.id)}
                                onToggle={() => handleToggle(provider.id)}
                            />
                        ))
                    )}
                </div>

                {/* Role Enforcement Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <p className="text-amber-800 text-sm font-medium mb-2">Role Safety</p>
                    <p className="text-amber-700 text-sm">
                        SSO can only assign <strong>Member</strong> or <strong>Auditor</strong> roles.
                        Admin and Owner roles require manual assignment.
                    </p>
                </div>

                {/* Failure Semantics */}
                <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-semibold text-foreground mb-4">Failure Handling</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                            <span className="text-muted-foreground">IdP down:</span>
                            <span className="text-foreground">Password login fallback (if enabled)</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-muted-foreground">IdP compromise:</span>
                            <span className="text-foreground">Disable provider → access blocked</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-muted-foreground">Regulayer down:</span>
                            <span className="text-foreground">Offline proof verification still works</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground mt-8">
                    Identity controls who can see or act — it never affects what is true.
                </p>
            </div>

            {showConfigModal && (
                <ConfigureProviderModal
                    onClose={() => setShowConfigModal(false)}
                    onCreate={handleCreate}
                />
            )}
        </div>
    );
}

