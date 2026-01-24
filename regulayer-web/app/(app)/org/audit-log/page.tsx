'use client';

import { useState } from 'react';
import {
    FileText, UserPlus, Key, Shield, RefreshCw,
    Snowflake, AlertCircle, Clock
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

type AuditEventType = 'invite' | 'role_change' | 'key_revoke' | 'org_freeze' | 'org_unfreeze' | 'member_removed';

interface AuditEvent {
    id: string;
    type: AuditEventType;
    actor: string;
    target?: string;
    details: string;
    timestamp: string;
}

// ============================================================
// Event Icon & Badge
// ============================================================

function EventIcon({ type }: { type: AuditEventType }) {
    const icons: Record<AuditEventType, { icon: React.ReactNode; bg: string }> = {
        invite: { icon: <UserPlus className="w-4 h-4" />, bg: 'bg-green-100 text-green-600' },
        role_change: { icon: <Shield className="w-4 h-4" />, bg: 'bg-blue-100 text-blue-600' },
        key_revoke: { icon: <Key className="w-4 h-4" />, bg: 'bg-amber-100 text-amber-600' },
        org_freeze: { icon: <Snowflake className="w-4 h-4" />, bg: 'bg-red-100 text-red-600' },
        org_unfreeze: { icon: <RefreshCw className="w-4 h-4" />, bg: 'bg-green-100 text-green-600' },
        member_removed: { icon: <AlertCircle className="w-4 h-4" />, bg: 'bg-red-100 text-red-600' },
    };

    const config = icons[type];

    return (
        <div className={`p-2 rounded-lg ${config.bg}`}>
            {config.icon}
        </div>
    );
}

function EventTypeBadge({ type }: { type: AuditEventType }) {
    const labels: Record<AuditEventType, string> = {
        invite: 'Invite',
        role_change: 'Role Change',
        key_revoke: 'Key Revoked',
        org_freeze: 'Org Frozen',
        org_unfreeze: 'Org Unfrozen',
        member_removed: 'Member Removed',
    };

    return (
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            {labels[type]}
        </span>
    );
}

// ============================================================
// Main Audit Log Page
// ============================================================

export default function AuditLogPage() {
    const [events] = useState<AuditEvent[]>([
        {
            id: '1',
            type: 'invite',
            actor: 'owner@company.com',
            target: 'auditor@kpmg.com',
            details: 'Invited as Auditor',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: '2',
            type: 'role_change',
            actor: 'owner@company.com',
            target: 'alice@company.com',
            details: 'Changed role from Member to Admin',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: '3',
            type: 'key_revoke',
            actor: 'alice@company.com',
            target: 'Old Development Key',
            details: 'Revoked API key',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: '4',
            type: 'invite',
            actor: 'owner@company.com',
            target: 'bob@company.com',
            details: 'Invited as Member',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: '5',
            type: 'org_freeze',
            actor: 'system',
            details: 'Organization frozen due to billing',
            timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: '6',
            type: 'org_unfreeze',
            actor: 'owner@company.com',
            details: 'Organization unfrozen after payment',
            timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: '7',
            type: 'member_removed',
            actor: 'owner@company.com',
            target: 'former@company.com',
            details: 'Removed from organization',
            timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ]);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
                    <p className="text-slate-600">View all access and administrative events</p>
                </div>

                {/* Important Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <p className="text-blue-800 text-sm font-medium">Access Events Only</p>
                        <p className="text-blue-700 text-sm">
                            This log tracks access events — not decisions. Decision records are stored in the cryptographic chain.
                        </p>
                    </div>
                </div>

                {/* Events List */}
                <div className="bg-white rounded-xl border border-slate-200">
                    <div className="p-6 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-900">Recent Events</h3>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {events.map((event) => (
                            <div key={event.id} className="px-6 py-4 flex items-start gap-4">
                                <EventIcon type={event.type} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <EventTypeBadge type={event.type} />
                                        {event.target && (
                                            <span className="text-sm font-medium text-slate-900 truncate">
                                                {event.target}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600">{event.details}</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                        <span>by {event.actor}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(event.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
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
