'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    IconUser,
    IconMail,
    IconBuilding,
    IconCalendar,
    IconShield,
    IconLogout,
    IconCopy,
    IconCheck,
    IconEdit,
    IconLoader2,
    IconAlertTriangle
} from '@tabler/icons-react';
import { getMe, User as UserType, Organization, logout, updateOrg, requestDeleteOtp, confirmDeleteOrg } from '@/lib/api';
import { removeToken } from '@/lib/auth';
import { GlazedCard } from '@/components/ui/glazed-card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// ============================================================
// Components
// ============================================================

function CopyField({ label, value }: { label: string, value: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                {label}
            </label>
            <div className="flex items-center gap-2 group p-2.5 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
                <code className="flex-1 font-mono text-sm text-foreground truncate">
                    {value}
                </code>
                <button
                    onClick={handleCopy}
                    className="p-1.5 text-muted-foreground hover:bg-slate-700 hover:-zinc-50 rounded transition-all"
                    title="Copy to clipboard"
                >
                    {copied ? <IconCheck size={16} className="text-emerald-500" /> : <IconCopy size={16} />}
                </button>
            </div>
        </div>
    );
}

interface SectionProps {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    danger?: boolean;
}

function Section({ title, icon: Icon, children, danger = false }: SectionProps) {
    return (
        <GlazedCard className={cn(
            "p-6 h-full",
            danger && "border-red-200 bg-red-50/50"
        )}>
            <div className="flex items-center gap-3 mb-6">
                <div className={cn(
                    "p-2.5 rounded-lg",
                    danger ? "bg-red-100 text-red-600" : "-zinc-50 bg-slate-800"
                )}>
                    <Icon size={20} />
                </div>
                <h2 className={cn(
                    "text-lg font-bold",
                    danger ? "text-red-900" : "text-foreground"
                )}>
                    {title}
                </h2>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </GlazedCard>
    );
}

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);
    const [org, setOrg] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Org Edit State
    const [orgName, setOrgName] = useState('');

    // Deletion states
    const [deleteStep, setDeleteStep] = useState<'otp' | ''>('');
    const [deleteOtp, setDeleteOtp] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await getMe();
            if (res.data) {
                setUser(res.data);
                if (res.data.org) {
                    setOrg(res.data.org);
                    setOrgName(res.data.org.name);
                }
            }
        } catch (err) {
            console.error('Failed to load profile settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const handleSaveOrg = async () => {
        if (!org) return;
        setSaving(true);
        try {
            await updateOrg(org.id, { name: orgName });
            const res = await getMe();
            if (res.data?.org) {
                setOrg(res.data.org);
            }
            alert('Organization updated');
        } catch {
            alert('Failed to update organization');
        } finally {
            setSaving(false);
        }
    };

    const handleRequestDeleteOtp = async () => {
        if (!org) return;
        setIsDeleting(true);
        setDeleteError('');
        try {
            await requestDeleteOtp(org.id);
            setDeleteStep('otp');
        } catch (err: any) {
            setDeleteError(err.response?.data?.detail || 'Failed to request code.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!org || deleteOtp.length !== 6) return;
        setIsDeleting(true);
        setDeleteError('');
        try {
            await confirmDeleteOrg(org.id, deleteOtp);
            removeToken();
            router.push('/login');
        } catch (err: any) {
            setDeleteError(err.response?.data?.detail || 'Invalid or expired code.');
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-border border-t-indigo-500 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-20 flex flex-col items-center justify-center gap-4 text-foreground">
                <IconAlertTriangle className="text-red-500 w-12 h-12 mb-2" />
                <h2 className="text-xl font-bold">Unable to load profile</h2>
                <p className="text-muted-foreground">Please check your connection and try again.</p>
                <button onClick={loadData} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Retry</button>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 space-y-8 pb-20 text-foreground">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Settings
                </h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account and organization preferences.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* User Profile */}
                <Section title="Personal Profile" icon={IconUser}>
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl mb-6">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br bg-slate-700 bg-slate-800 flex items-center justify-center text-foreground text-xl font-bold">
                            {user.email[0].toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground text-lg">
                                {user.email.split('@')[0]}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="px-2 py-0.5 text-zinc-100/50 bg-slate-900 rounded text-xs font-semibold capitalize">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <CopyField label="Email Address" value={user.email} />
                        <CopyField label="User ID" value={user.id} />
                    </div>
                </Section>

                {/* Organization Settings */}
                <Section title="Organization" icon={IconBuilding}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                                Organization Name
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    className="flex-1 bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                                />
                                <button
                                    onClick={handleSaveOrg}
                                    disabled={saving || orgName === org?.name}
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:grayscale transition-all"
                                >
                                    {saving ? <IconLoader2 className="animate-spin" size={20} /> : <IconCheck size={20} />}
                                </button>
                            </div>
                        </div>

                        <CopyField label="Organization ID" value={org?.id || ''} />

                        <div className="pt-4 border-t border-border">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <IconCalendar size={16} />
                                <span>Member since {new Date(org?.created_at || new Date()).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </Section>
            </div>

            {/* Security / Danger Zone */}
            <Section title="Session & Security" icon={IconShield} danger>
                <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-red-100">
                    <div>
                        <h4 className="font-semibold text-foreground">Sign out of all devices</h4>
                        <p className="text-sm text-muted-foreground">End your current session safely.</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-card border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                    >
                        <IconLogout size={18} />
                        Sign Out
                    </button>
                </div>

                {/* Organization Deletion */}
                <div className="flex flex-col gap-4 p-4 mt-6 bg-card rounded-xl border border-red-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="font-semibold text-foreground">Delete Organization</h4>
                            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                                Permanently delete this organization, all projects, audit logs, and team member accounts.
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    {user?.role === 'owner' ? (
                        <div className="mt-2">
                            {!deleteStep && (
                                <button
                                    onClick={handleRequestDeleteOtp}
                                    disabled={isDeleting}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-foreground text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 w-fit"
                                >
                                    {isDeleting && <IconLoader2 className="animate-spin" size={16} />}
                                    Delete Organization
                                </button>
                            )}

                            {deleteStep === 'otp' && (
                                <div className="p-4 border border-red-200 bg-red-50 rounded-lg space-y-4 max-w-md">
                                    <p className="text-sm font-medium text-red-800">
                                        Check your email for a 6-digit verification code.
                                    </p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="6-digit code"
                                            value={deleteOtp}
                                            onChange={(e) => setDeleteOtp(e.target.value)}
                                            className="flex h-10 w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                            maxLength={6}
                                        />
                                        <button
                                            onClick={handleConfirmDelete}
                                            disabled={isDeleting || deleteOtp.length !== 6}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-foreground text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                                        >
                                            {isDeleting && <IconLoader2 className="animate-spin" size={16} />}
                                            Confirm
                                        </button>
                                    </div>
                                    {deleteError && (
                                        <p className="text-xs text-red-600 font-medium">{deleteError}</p>
                                    )}
                                    <button
                                        onClick={() => { setDeleteStep(''); setDeleteOtp(''); setDeleteError(''); }}
                                        className="text-xs text-muted-foreground hover:text-foreground underline"
                                    >
                                        Cancel Deletion
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mt-2 text-sm text-muted-foreground bg-secondary p-3 rounded-lg border border-border inline-block">
                            Only the organization owner can delete the organization.
                        </div>
                    )}
                </div>
            </Section>
        </div>
    );
}

