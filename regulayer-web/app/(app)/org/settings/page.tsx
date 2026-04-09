'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Building2, Copy, CheckCircle, Shield, Key,
    FileText, AlertTriangle, ExternalLink, Lock, Loader2
} from 'lucide-react';
import { getMe, requestDeleteOtp, confirmDeleteOrg } from '@/lib/api';
import { removeToken } from '@/lib/auth';

// ============================================================
// Main Org Settings Page
// ============================================================

export default function OrgSettingsPage() {
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [orgId, setOrgId] = useState('');
    const [orgName, setOrgName] = useState('');
    const [createdAt, setCreatedAt] = useState('');
    const [userRole, setUserRole] = useState('');

    // Deletion states
    const [deleteStep, setDeleteStep] = useState<'otp' | ''>('');
    const [deleteOtp, setDeleteOtp] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const me = await getMe();
                if (me.data) {
                    setUserRole(me.data.role);
                    if (me.data.org) {
                        setOrgId(me.data.org.id);
                        setOrgName(me.data.org.name);
                        setCreatedAt(me.data.org.created_at);
                    }
                }
            } catch (err) {
                console.error('Failed to load org settings:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const copyOrgId = () => {
        navigator.clipboard.writeText(orgId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRequestDeleteOtp = async () => {
        if (!orgId) return;
        setIsDeleting(true);
        setDeleteError('');
        try {
            await requestDeleteOtp(orgId);
            setDeleteStep('otp');
        } catch (err: any) {
            setDeleteError(err.response?.data?.detail || 'Failed to request code.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!orgId || deleteOtp.length !== 6) return;
        setIsDeleting(true);
        setDeleteError('');
        try {
            await confirmDeleteOrg(orgId, deleteOtp);
            removeToken();
            router.push('/login');
        } catch (err: any) {
            setDeleteError(err.response?.data?.detail || 'Invalid or expired code.');
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-secondary flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            </div>
        );
    }

    if (!orgId) {
        return (
            <div className="min-h-screen bg-secondary flex flex-col items-center justify-center gap-4">
                <AlertTriangle className="w-12 h-12 text-red-500" />
                <h2 className="text-xl font-bold text-foreground">Unable to load organization</h2>
                <p className="text-muted-foreground">Please check your connection or try logging in again.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary">
            <div className="max-w-4xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground">Organization Settings</h1>
                    <p className="text-muted-foreground">Manage your organization</p>
                </div>

                {/* Organization Info */}
                <div className="bg-card rounded-xl border border-border p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary-100 rounded-lg">
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h2 className="text-lg font-semibold text-foreground">Organization Info</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-border">
                            <span className="text-muted-foreground">Organization Name</span>
                            <span className="font-medium text-foreground">{orgName || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-border">
                            <span className="text-muted-foreground">Organization ID</span>
                            <div className="flex items-center gap-2">
                                <code className="font-mono text-sm text-foreground">{orgId || '—'}</code>
                                {orgId && (
                                    <button onClick={copyOrgId} className="text-muted-foreground hover:text-muted-foreground">
                                        {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-muted-foreground">Created</span>
                            <span className="text-foreground">
                                {createdAt ? new Date(createdAt).toLocaleDateString() : '—'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-card rounded-xl border border-border p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-foreground">Security</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-border">
                            <div>
                                <span className="text-foreground font-medium">SSO Integration</span>
                                <p className="text-sm text-muted-foreground">Single sign-on for enterprise</p>
                            </div>
                            <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">Coming Soon</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-border">
                            <div>
                                <span className="text-foreground font-medium">Audit Log</span>
                                <p className="text-sm text-muted-foreground">View all access events</p>
                            </div>
                            <Link href="/org/audit-log" className="bg-slate-800 hover:underline text-sm flex items-center gap-1">
                                View <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <div>
                                <span className="text-foreground font-medium">Role Matrix</span>
                                <p className="text-sm text-muted-foreground">View role permissions</p>
                            </div>
                            <Link href="/org/team" className="bg-slate-800 hover:underline text-sm flex items-center gap-1">
                                View <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-card rounded-xl border border-border p-6 mb-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Quick Links</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/org/team" className="flex items-center gap-3 p-4 bg-secondary rounded-lg hover:bg-secondary transition-colors">
                            <Shield className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium text-foreground">Team</span>
                        </Link>
                        <Link href="/api-keys" className="flex items-center gap-3 p-4 bg-secondary rounded-lg hover:bg-secondary transition-colors">
                            <Key className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium text-foreground">API Keys</span>
                        </Link>
                        <Link href="/org/audit-log" className="flex items-center gap-3 p-4 bg-secondary rounded-lg hover:bg-secondary transition-colors">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium text-foreground">Audit Log</span>
                        </Link>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-card rounded-xl border border-red-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-foreground">Danger Zone</h2>
                    </div>

                    <div className="bg-secondary rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="font-medium text-foreground">Delete Organization</p>

                                {userRole === 'owner' ? (
                                    <>
                                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                                            Permanently delete this organization, all projects, audit logs, and team member accounts.
                                            This action cannot be undone.
                                        </p>

                                        {!deleteStep && (
                                            <button
                                                onClick={handleRequestDeleteOtp}
                                                disabled={isDeleting}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-foreground text-sm font-medium rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                                Delete Organization
                                            </button>
                                        )}

                                        {deleteStep === 'otp' && (
                                            <div className="mt-4 p-4 border border-red-200 bg-red-50/50 rounded-lg space-y-4">
                                                <p className="text-sm font-medium text-red-800">
                                                    Check your email for a 6-digit verification code.
                                                </p>
                                                <div className="flex gap-2 max-w-xs">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter 6-digit code"
                                                        value={deleteOtp}
                                                        onChange={(e) => setDeleteOtp(e.target.value)}
                                                        className="flex h-10 w-full rounded-md border border-red-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                                        maxLength={6}
                                                    />
                                                    <button
                                                        onClick={handleConfirmDelete}
                                                        disabled={isDeleting || deleteOtp.length !== 6}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-foreground text-sm font-medium rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                                        Confirm
                                                    </button>
                                                </div>
                                                {deleteError && (
                                                    <p className="text-xs text-red-600">{deleteError}</p>
                                                )}
                                                <button
                                                    onClick={() => { setDeleteStep(''); setDeleteOtp(''); setDeleteError(''); }}
                                                    className="text-xs text-muted-foreground hover:text-foreground underline"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Only the organization owner can permanently delete the organization.
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Regulayer otherwise does not support deleting historical records by design —
                                            proofs must remain verifiable indefinitely.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <p className="text-center text-xs text-muted-foreground mt-8">
                    User actions affect access, never cryptographic truth.
                </p>
            </div>
        </div>
    );
}

