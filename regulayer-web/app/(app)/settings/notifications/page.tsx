'use client';

import { useState } from 'react';
import {
    Bell, Mail, Webhook, Toggle, Check,
    AlertCircle, Key, Snowflake, Clock
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface NotificationSetting {
    id: string;
    event: string;
    description: string;
    email: boolean;
    inApp: boolean;
}

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
            className={`relative w-10 h-6 rounded-full transition-colors ${enabled ? 'bg-primary-600' : 'bg-slate-300'
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
    const [settings, setSettings] = useState<NotificationSetting[]>([
        { id: '1', event: 'org.frozen', description: 'Organization frozen due to billing', email: true, inApp: true },
        { id: '2', event: 'trial.ending', description: 'Trial ending in 7 days', email: true, inApp: true },
        { id: '3', event: 'key.revoked', description: 'API key revoked', email: true, inApp: true },
        { id: '4', event: 'ingestion.paused', description: 'Ingestion paused', email: true, inApp: true },
        { id: '5', event: 'incident.declared', description: 'Incident declared', email: true, inApp: true },
        { id: '6', event: 'quota.warning', description: 'Approaching quota limit (80%)', email: false, inApp: true },
        { id: '7', event: 'invite.accepted', description: 'Team member joined', email: false, inApp: true },
    ]);

    const updateSetting = (id: string, field: 'email' | 'inApp', value: boolean) => {
        setSettings(settings.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Bell className="w-6 h-6 text-slate-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Notification Settings</h1>
                        <p className="text-slate-600">Configure how you receive alerts</p>
                    </div>
                </div>

                {/* Email Notifications */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Email Notifications</h2>
                            <p className="text-sm text-slate-500">Receive alerts via email</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {settings.map((setting) => (
                            <div key={setting.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                <div>
                                    <p className="font-medium text-slate-900">{setting.description}</p>
                                    <code className="text-xs text-slate-500">{setting.event}</code>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">Email</span>
                                        <ToggleSwitch
                                            enabled={setting.email}
                                            onChange={(v) => updateSetting(setting.id, 'email', v)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">In-App</span>
                                        <ToggleSwitch
                                            enabled={setting.inApp}
                                            onChange={(v) => updateSetting(setting.id, 'inApp', v)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Auditor Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <p className="text-blue-800 text-sm font-medium">Auditor Role</p>
                        <p className="text-blue-700 text-sm">
                            Users with the Auditor role receive email-only notifications and cannot take actions.
                        </p>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700">
                        Save Preferences
                    </button>
                </div>
            </div>
        </div>
    );
}
