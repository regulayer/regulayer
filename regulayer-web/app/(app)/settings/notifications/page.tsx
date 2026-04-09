'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Bell, Mail,
    AlertCircle, CheckCircle2, Loader2, Smartphone
} from 'lucide-react';
import { getNotificationPrefs, updateNotificationPrefs, NotificationPreference } from '@/lib/api';

// ============================================================
// Toggle Switch
// ============================================================

function ToggleSwitch({
    enabled,
    onChange,
    disabled = false
}: {
    enabled: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={() => !disabled && onChange(!enabled)}
            disabled={disabled}
            className={`relative w-10 h-6 rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-slate-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-4' : ''
                    }`}
            />
        </button>
    );
}

// ============================================================
// Main Notification Settings Page
// ============================================================

export default function NotificationSettingsPage() {
    const queryClient = useQueryClient();
    
    const { data: prefsRes, isLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: getNotificationPrefs
    });
    
    // Local ephemeral state for instant toggling
    const [prefs, setPrefs] = useState<NotificationPreference | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (prefsRes?.data) {
            setPrefs(prefsRes.data);
        }
    }, [prefsRes]);

    const mutation = useMutation({
        mutationFn: updateNotificationPrefs,
        onSuccess: (res) => {
            queryClient.setQueryData(["notifications"], res);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }
    });

    const updateSetting = (field: keyof NotificationPreference, value: boolean) => {
        if (!prefs) return;
        const newPrefs = { ...prefs, [field]: value };
        setPrefs(newPrefs);
        // We could auto-save or wait for the Save button. Let's auto-save on toggle!
        mutation.mutate({ [field]: value });
    };

    if (isLoading || !prefs) {
        return (
            <div className="min-h-screen bg-secondary flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary">
            <div className="max-w-4xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Bell className="w-6 h-6 text-muted-foreground" />
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Notification Settings</h1>
                            <p className="text-muted-foreground">Configure how and when you receive alerts</p>
                        </div>
                    </div>
                    {showSuccess && (
                        <span className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                            <CheckCircle2 className="w-4 h-4" /> Saved
                        </span>
                    )}
                </div>

                {/* Delivery Channels */}
                <div className="bg-card rounded-xl border border-border p-6 mb-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Delivery Channels</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="border border-border rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium text-foreground">Email</p>
                                    <p className="text-xs text-muted-foreground">Primary communication</p>
                                </div>
                            </div>
                            <ToggleSwitch
                                enabled={prefs.email_enabled}
                                onChange={(v) => updateSetting("email_enabled", v)}
                            />
                        </div>
                        <div className="border border-border rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium text-foreground">In-App Dashboard</p>
                                    <p className="text-xs text-muted-foreground">Directly in Regulayer</p>
                                </div>
                            </div>
                            <ToggleSwitch
                                enabled={prefs.in_app_enabled}
                                onChange={(v) => updateSetting("in_app_enabled", v)}
                            />
                        </div>
                    </div>
                </div>

                {/* Events */}
                <div className="bg-card rounded-xl border border-border p-6 mb-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Event Types</h2>

                    <div className="space-y-4">
                        
                        <div className="flex items-center justify-between py-3 border-b border-border">
                            <div>
                                <p className="font-medium text-foreground">Incident Alerts</p>
                                <p className="text-xs text-muted-foreground">Security, integrity, or system degradation alerts.</p>
                            </div>
                            <ToggleSwitch
                                enabled={prefs.incident_alerts}
                                onChange={(v) => updateSetting("incident_alerts", v)}
                            />
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-border">
                            <div>
                                <p className="font-medium text-foreground">Governance Reviews</p>
                                <p className="text-xs text-muted-foreground">Notifications when decisions require manual approval or are flagged.</p>
                            </div>
                            <ToggleSwitch
                                enabled={prefs.governance_reviews}
                                onChange={(v) => updateSetting("governance_reviews", v)}
                            />
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="font-medium text-foreground">Billing Updates</p>
                                <p className="text-xs text-muted-foreground">Changes to plans, missing payments, or nearing quota limits.</p>
                            </div>
                            <ToggleSwitch
                                enabled={prefs.billing_updates}
                                onChange={(v) => updateSetting("billing_updates", v)}
                            />
                        </div>

                    </div>
                </div>

                {/* Auditor Notice */}
                <div className="-zinc-50 border text-zinc-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                        <p className="-zinc-800 text-sm font-medium">Auditor Role</p>
                        <p className="text-muted-foreground text-sm">
                            Users with the Auditor role force-receive email notifications for Critical incident alerts irrespective of these settings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

