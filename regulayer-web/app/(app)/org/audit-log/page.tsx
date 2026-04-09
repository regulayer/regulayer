'use client';

import { useState, useEffect } from 'react';
import {
    FileText, UserPlus, Key, Shield, RefreshCw,
    Snowflake, AlertCircle, Clock
} from 'lucide-react';
import { getMe, getAuditLogs, AuditLogEntry } from '@/lib/api';

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
        role_change: { icon: <Shield className="w-4 h-4" />, bg: '-zinc-100 bg-slate-800' },
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
        <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">
            {labels[type] || type}
        </span>
    );
}

// ============================================================
// Main Audit Log Page
// ============================================================

const mapAction = (action: string): AuditEventType => {
    if (action.includes('invite') || action.includes('create_user')) return 'invite';
    if (action.includes('role')) return 'role_change';
    if (action.includes('revoke') || action.includes('key')) return 'key_revoke';
    if (action.includes('freeze') || action.includes('frozen')) return 'org_freeze';
    if (action.includes('unfreeze')) return 'org_unfreeze';
    if (action.includes('remove')) return 'member_removed';
    return 'invite';
};

export default function AuditLogPage() {
    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAuditLogs();
    }, []);

    const loadAuditLogs = async () => {
        try {
            const meRes = await getMe();
            if (meRes.data?.org?.id) {
                const res = await getAuditLogs(meRes.data.org.id);
                if (res.data) {
                    setEvents(res.data.map((entry: AuditLogEntry) => ({
                        id: entry.id,
                        type: mapAction(entry.action),
                        actor: entry.actor_email || 'system',
                        target: entry.resource_type ? `${entry.resource_type}` : undefined,
                        details: entry.action + (entry.details ? `: ${JSON.stringify(entry.details)}` : ''),
                        timestamp: entry.created_at,
                    })));
                }
            }
        } catch {
            // Fallback: no events
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary">
            <div className="px-6 md:px-10 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
                    <p className="text-muted-foreground">View all access and administrative events</p>
                </div>

                {/* Important Notice */}
                <div className="-zinc-50 border text-zinc-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                        <p className="-zinc-800 text-sm font-medium">Access Events Only</p>
                        <p className="text-muted-foreground text-sm">
                            This log tracks access events &mdash; not decisions. Decision records are stored in the cryptographic chain.
                        </p>
                    </div>
                </div>

                {/* Events List */}
                <div className="bg-card rounded-xl border border-border">
                    <div className="p-6 border-b border-border">
                        <h3 className="font-semibold text-foreground">Recent Events</h3>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {loading ? (
                            <div className="px-6 py-12 text-center text-sm text-muted-foreground">Loading audit log...</div>
                        ) : events.length === 0 ? (
                            <div className="px-6 py-12 text-center text-sm text-muted-foreground">No audit events recorded yet.</div>
                        ) : events.map((event) => (
                            <div key={event.id} className="px-6 py-4 flex items-start gap-4">
                                <EventIcon type={event.type} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <EventTypeBadge type={event.type} />
                                        {event.target && (
                                            <span className="text-sm font-medium text-foreground truncate">
                                                {event.target}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{event.details}</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <span>by {event.actor}</span>
                                        <span>&bull;</span>
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
                <p className="text-center text-xs text-muted-foreground mt-8">
                    User actions affect access, never cryptographic truth.
                </p>
            </div>
        </div>
    );
}

