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
    IconLoader2
} from '@tabler/icons-react';
import { getMe, User as UserType, Organization, logout, updateOrg } from '@/lib/api';
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
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 block">
                {label}
            </label>
            <div className="flex items-center gap-2 group p-2.5 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                <code className="flex-1 font-mono text-sm text-zinc-700 dark:text-zinc-300 truncate">
                    {value}
                </code>
                <button
                    onClick={handleCopy}
                    className="p-1.5 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded transition-all"
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
            danger && "border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10"
        )}>
            <div className="flex items-center gap-3 mb-6">
                <div className={cn(
                    "p-2.5 rounded-lg",
                    danger ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                )}>
                    <Icon size={20} />
                </div>
                <h2 className={cn(
                    "text-lg font-bold",
                    danger ? "text-red-900 dark:text-red-200" : "text-zinc-900 dark:text-zinc-100"
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

    if (loading) {
        return (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-indigo-500 animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                    Settings
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                    Manage your account and organization preferences.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* User Profile */}
                <Section title="Personal Profile" icon={IconUser}>
                    <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-black/20 rounded-xl mb-6">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                            {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">
                                {user.full_name || 'User'}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                                <span className="px-2 py-0.5 bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-semibold capitalize">
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
                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 block">
                                Organization Name
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    className="flex-1 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                />
                                <button
                                    onClick={handleSaveOrg}
                                    disabled={saving || orgName === org?.name}
                                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:grayscale transition-all"
                                >
                                    {saving ? <IconLoader2 className="animate-spin" size={20} /> : <IconCheck size={20} />}
                                </button>
                            </div>
                        </div>

                        <CopyField label="Organization ID" value={org?.id || ''} />

                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                                <IconCalendar size={16} />
                                <span>Member since {new Date(org?.created_at || new Date()).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </Section>
            </div>

            {/* Security / Danger Zone */}
            <Section title="Session & Security" icon={IconShield} danger>
                <div className="flex items-center justify-between p-4 bg-white dark:bg-red-950/5 rounded-xl border border-red-100 dark:border-red-900/20">
                    <div>
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Sign out of all devices</h4>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">End your current session safely.</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors font-medium"
                    >
                        <IconLogout size={18} />
                        Sign Out
                    </button>
                </div>
            </Section>
        </div>
    );
}
