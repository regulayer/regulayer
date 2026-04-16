'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    IconBuilding, IconCopy, IconCheck, IconShieldCheck, IconKey,
    IconFileText, IconAlertTriangle, IconExternalLink, IconLock,
    IconLoader2, IconPhoto, IconUsers, IconTrash
} from '@tabler/icons-react';
import { getMe, requestDeleteOtp, confirmDeleteOrg, updateOrgLogo } from '@/lib/api';
import { removeToken } from '@/lib/auth';
import { cn } from '@/lib/utils';

// ============================================================
// Main Org Settings Page
// ============================================================

export default function OrgSettingsPage() {
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [orgId, setOrgId] = useState('');
    const [orgName, setOrgName] = useState('');
    const [orgLogoUrl, setOrgLogoUrl] = useState('');
    const [createdAt, setCreatedAt] = useState('');
    const [userRole, setUserRole] = useState('');

    // Logo Upload State
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

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
                        setOrgLogoUrl((me.data.org as any).logo_url || '');
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

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        if (file.size > 2000000) { alert("File too large (max 2MB)"); return; }

        setIsUploadingLogo(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            try {
                await updateOrgLogo(orgId, base64String);
                setOrgLogoUrl(base64String);
            } catch (err: any) {
                alert(err.response?.data?.detail || "Failed to upload logo.");
            } finally {
                setIsUploadingLogo(false);
            }
        };
        reader.readAsDataURL(file);
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
            <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!orgId) {
        return (
            <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <IconAlertTriangle size={40} className="text-red-500" />
                <h2 className="text-lg font-bold text-foreground">Unable to load organization</h2>
                <p className="text-sm text-muted-foreground">Please check your connection or try logging in again.</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 pb-20 space-y-6 text-foreground">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Organization Settings</h1>
                    <p className="text-muted-foreground text-sm">Manage identity, branding, and security for your organization.</p>
                </div>
                <IconBuilding size={28} className="text-muted-foreground" />
            </div>

            {/* Organization Identity */}
            <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-background">
                    <h3 className="text-sm font-semibold">Organization Identity</h3>
                </div>

                <div className="divide-y divide-border">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Name</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Primary organization display name</p>
                        </div>
                        <span className="text-sm font-semibold">{orgName || '—'}</span>
                    </div>

                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Organization ID</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Unique tenant identifier</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">{orgId}</code>
                            <button onClick={copyOrgId} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                                {copied ? <IconCheck size={14} className="text-emerald-500" /> : <IconCopy size={14} />}
                            </button>
                        </div>
                    </div>

                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Created</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Tenant provisioning date</p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {createdAt ? new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Organization Branding */}
            <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-background">
                    <h3 className="text-sm font-semibold">Branding</h3>
                </div>

                <div className="p-6">
                    <div className="flex items-center gap-6">
                        {/* Logo Preview */}
                        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                            {orgLogoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={orgLogoUrl} alt="Organization Logo" className="w-full h-full object-contain p-1" />
                            ) : (
                                <IconPhoto size={24} className="text-muted-foreground/40" />
                            )}
                        </div>

                        <div className="flex-1">
                            <p className="text-sm font-medium mb-1">Organization Logo</p>
                            <p className="text-xs text-muted-foreground mb-3">
                                Appears on compliance reports and sealed legal documents. PNG, JPG, or SVG up to 2MB.
                            </p>
                            <label className={cn(
                                "inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors",
                                isUploadingLogo
                                    ? "bg-secondary text-muted-foreground cursor-wait"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                            )}>
                                {isUploadingLogo ? (
                                    <><div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> Uploading...</>
                                ) : (
                                    <><IconPhoto size={14} /> {orgLogoUrl ? 'Change Logo' : 'Upload Logo'}</>
                                )}
                                <input type="file" accept="image/png, image/jpeg, image/svg+xml" className="hidden" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security & Access */}
            <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-background">
                    <h3 className="text-sm font-semibold">Security & Access</h3>
                </div>

                <div className="divide-y divide-border">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                                <IconShieldCheck size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-medium">SSO Integration</p>
                                <p className="text-xs text-muted-foreground">SAML / OIDC single sign-on for enterprise</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded uppercase tracking-wider">Coming Soon</span>
                    </div>

                    <Link href="/org/audit-log" className="px-6 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                                <IconFileText size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Audit Log</p>
                                <p className="text-xs text-muted-foreground">View all access events and administrative actions</p>
                            </div>
                        </div>
                        <IconExternalLink size={14} className="text-muted-foreground" />
                    </Link>

                    <Link href="/org/team" className="px-6 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                                <IconUsers size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Team & RBAC</p>
                                <p className="text-xs text-muted-foreground">Manage members and role-based permissions</p>
                            </div>
                        </div>
                        <IconExternalLink size={14} className="text-muted-foreground" />
                    </Link>

                    <Link href="/api-keys" className="px-6 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                                <IconKey size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-medium">API Keys</p>
                                <p className="text-xs text-muted-foreground">Manage SDK credentials and access scopes</p>
                            </div>
                        </div>
                        <IconExternalLink size={14} className="text-muted-foreground" />
                    </Link>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-card border border-red-200 dark:border-red-500/20 rounded-2xl shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5">
                    <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                        <IconAlertTriangle size={16} /> Danger Zone
                    </h3>
                </div>

                <div className="p-6">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
                            <IconTrash size={16} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">Delete Organization</p>

                            {userRole === 'owner' ? (
                                <>
                                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                                        Permanently delete this organization, all projects, audit logs, and team member accounts. This action cannot be undone.
                                    </p>

                                    {!deleteStep && (
                                        <button
                                            onClick={handleRequestDeleteOtp}
                                            disabled={isDeleting}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isDeleting && <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                                            Delete Organization
                                        </button>
                                    )}

                                    {deleteStep === 'otp' && (
                                        <div className="mt-4 p-4 border border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5 rounded-xl space-y-3">
                                            <p className="text-xs font-medium text-red-700 dark:text-red-400">
                                                Check your email for a 6-digit verification code.
                                            </p>
                                            <div className="flex gap-2 max-w-xs">
                                                <input
                                                    type="text"
                                                    placeholder="Enter 6-digit code"
                                                    value={deleteOtp}
                                                    onChange={(e) => setDeleteOtp(e.target.value)}
                                                    className="h-10 w-full rounded-lg border border-red-300 dark:border-red-500/30 bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                                    maxLength={6}
                                                />
                                                <button
                                                    onClick={handleConfirmDelete}
                                                    disabled={isDeleting || deleteOtp.length !== 6}
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
                                                >
                                                    {isDeleting && <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
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
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Only the organization owner can permanently delete the organization.
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Regulayer does not support deleting historical records by design — proofs must remain verifiable indefinitely.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Disclaimer */}
            <p className="text-center text-xs text-muted-foreground">
                User actions affect access, never cryptographic truth.
            </p>
        </div>
    );
}
