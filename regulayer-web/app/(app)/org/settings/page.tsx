'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Building2, Copy, CheckCircle, Shield, Key,
    FileText, AlertTriangle, ExternalLink, Lock
} from 'lucide-react';

// ============================================================
// Main Org Settings Page
// ============================================================

export default function OrgSettingsPage() {
    const [copied, setCopied] = useState(false);

    const orgId = 'org_abc123xyz';
    const orgName = 'Acme Corporation';
    const createdAt = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();

    const copyOrgId = () => {
        navigator.clipboard.writeText(orgId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Organization Settings</h1>
                    <p className="text-slate-600">Manage your organization</p>
                </div>

                {/* Organization Info */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary-100 rounded-lg">
                            <Building2 className="w-6 h-6 text-primary-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">Organization Info</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-slate-100">
                            <span className="text-slate-600">Organization Name</span>
                            <span className="font-medium text-slate-900">{orgName}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-slate-100">
                            <span className="text-slate-600">Organization ID</span>
                            <div className="flex items-center gap-2">
                                <code className="font-mono text-sm text-slate-700">{orgId}</code>
                                <button onClick={copyOrgId} className="text-slate-400 hover:text-slate-600">
                                    {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-slate-600">Created</span>
                            <span className="text-slate-900">{new Date(createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">Security</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-slate-100">
                            <div>
                                <span className="text-slate-900 font-medium">SSO Integration</span>
                                <p className="text-sm text-slate-500">Single sign-on for enterprise</p>
                            </div>
                            <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">Coming Soon</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-slate-100">
                            <div>
                                <span className="text-slate-900 font-medium">Audit Log</span>
                                <p className="text-sm text-slate-500">View all access events</p>
                            </div>
                            <Link href="/org/audit-log" className="text-primary-600 hover:underline text-sm flex items-center gap-1">
                                View <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <div>
                                <span className="text-slate-900 font-medium">Role Matrix</span>
                                <p className="text-sm text-slate-500">View role permissions</p>
                            </div>
                            <Link href="/org/team" className="text-primary-600 hover:underline text-sm flex items-center gap-1">
                                View <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Links</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/org/team" className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                            <Shield className="w-5 h-5 text-slate-600" />
                            <span className="font-medium text-slate-900">Team</span>
                        </Link>
                        <Link href="/keys" className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                            <Key className="w-5 h-5 text-slate-600" />
                            <span className="font-medium text-slate-900">API Keys</span>
                        </Link>
                        <Link href="/org/audit-log" className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                            <FileText className="w-5 h-5 text-slate-600" />
                            <span className="font-medium text-slate-900">Audit Log</span>
                        </Link>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-xl border border-red-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">Danger Zone</h2>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Lock className="w-5 h-5 text-slate-500 mt-0.5" />
                            <div>
                                <p className="font-medium text-slate-900">Delete Organization</p>
                                <p className="text-sm text-slate-600 mt-1">
                                    Regulayer does not support deleting historical records.
                                </p>
                                <p className="text-sm text-slate-500 mt-2">
                                    This is by design — proofs must remain verifiable indefinitely.
                                    Contact support if you need to archive an organization.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <p className="text-center text-xs text-slate-400 mt-8">
                    User actions affect access, never cryptographic truth.
                </p>
            </div>
        </div>
    );
}
