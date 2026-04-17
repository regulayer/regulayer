'use client';

import { useState, useEffect } from 'react';
import {
    FileText, UserPlus, Key, Shield, RefreshCw,
    Snowflake, AlertCircle, Clock, Globe, ChevronDown, ChevronUp,
    Monitor, Info
} from 'lucide-react';
import { getMe, getAuditLogs, AuditLogEntry } from '@/lib/api';

// ============================================================
// Types
// ============================================================

type AuditEventType = 'invite' | 'role_change' | 'key_revoke' | 'org_freeze' | 'org_unfreeze' | 'member_removed' | 'policy_created' | 'policy_enabled' | 'policy_disabled' | 'policy_deleted' | 'unknown';

interface AuditEvent {
    id: string;
    type: AuditEventType;
    actor: string;
    target?: string;
    details: string;
    timestamp: string;
    ip_address?: string;
    resource_id?: string;
    metadata?: Record<string, unknown>;
}

// ============================================================
// Event Icon & Badge
// ============================================================

function EventIcon({ type }: { type: AuditEventType }) {
    const icons: Record<AuditEventType, { icon: React.ReactNode; bg: string }> = {
        invite: { icon: <UserPlus className="w-4 h-4" />, bg: 'bg-green-100 text-green-600' },
        role_change: { icon: <Shield className="w-4 h-4" />, bg: 'bg-violet-100 text-violet-600' },
        key_revoke: { icon: <Key className="w-4 h-4" />, bg: 'bg-amber-100 text-amber-600' },
        org_freeze: { icon: <Snowflake className="w-4 h-4" />, bg: 'bg-red-100 text-red-600' },
        org_unfreeze: { icon: <RefreshCw className="w-4 h-4" />, bg: 'bg-green-100 text-green-600' },
        member_removed: { icon: <AlertCircle className="w-4 h-4" />, bg: 'bg-red-100 text-red-600' },
        policy_created: { icon: <Shield className="w-4 h-4" />, bg: 'bg-indigo-100 text-indigo-600' },
        policy_enabled: { icon: <Shield className="w-4 h-4" />, bg: 'bg-emerald-100 text-emerald-600' },
        policy_disabled: { icon: <Shield className="w-4 h-4" />, bg: 'bg-slate-200 text-slate-600' },
        policy_deleted: { icon: <AlertCircle className="w-4 h-4" />, bg: 'bg-red-100 text-red-600' },
        unknown: { icon: <FileText className="w-4 h-4" />, bg: 'bg-secondary text-muted-foreground' },
    };

    const config = icons[type] || icons.unknown;

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
        policy_created: 'Policy Created',
        policy_enabled: 'Policy Enabled',
        policy_disabled: 'Policy Disabled',
        policy_deleted: 'Policy Deleted',
        unknown: 'System Event',
    };

    return (
        <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded font-medium border border-border">
            {labels[type] || 'Unknown'}
        </span>
    );
}

// ============================================================
// Metadata Panel Component
// ============================================================

function MetadataPanel({ event }: { event: AuditEvent }) {
    const metaEntries = event.metadata ? Object.entries(event.metadata) : [];

    return (
        <div className="mt-3 bg-secondary/60 border border-border rounded-lg p-4 space-y-3 text-xs">
            {/* IP Address */}
            <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground font-medium">IP Address:</span>
                <span className="font-mono text-foreground">
                    {event.ip_address || 'Not recorded'}
                </span>
            </div>

            {/* Resource ID */}
            {event.resource_id && (
                <div className="flex items-center gap-2">
                    <Monitor className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground font-medium">Resource ID:</span>
                    <span className="font-mono text-foreground break-all">
                        {event.resource_id}
                    </span>
                </div>
            )}

            {/* Details / Metadata */}
            {metaEntries.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground font-medium">Metadata:</span>
                    </div>
                    <div className="bg-card border border-border rounded-md overflow-hidden">
                        <table className="w-full text-xs">
                            <tbody>
                                {metaEntries.map(([key, value]) => (
                                    <tr key={key} className="border-b border-border last:border-b-0">
                                        <td className="px-3 py-2 font-medium text-muted-foreground whitespace-nowrap bg-secondary/40 w-1/3">
                                            {key}
                                        </td>
                                        <td className="px-3 py-2 font-mono text-foreground break-all">
                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Timestamp (precise) */}
            <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground font-medium">Timestamp:</span>
                <span className="font-mono text-foreground">
                    {new Date(event.timestamp).toISOString()}
                </span>
            </div>
        </div>
    );
}

// ============================================================
// Main Audit Log Page
// ============================================================

const mapAction = (action: string): AuditEventType => {
    if (action.includes('policy.created')) return 'policy_created';
    if (action.includes('policy.enabled')) return 'policy_enabled';
    if (action.includes('policy.disabled')) return 'policy_disabled';
    if (action.includes('policy.deleted')) return 'policy_deleted';
    if (action.includes('invite') || action.includes('create_user')) return 'invite';
    if (action.includes('role')) return 'role_change';
    if (action.includes('revoke') || action.includes('key')) return 'key_revoke';
    if (action.includes('freeze') || action.includes('frozen')) return 'org_freeze';
    if (action.includes('unfreeze')) return 'org_unfreeze';
    if (action.includes('remove')) return 'member_removed';
    return 'unknown';
};

const humanReadableAction = (action: string): string => {
    const map: Record<string, string> = {
        'policy.created': 'Governance policy was created',
        'policy.enabled': 'Governance policy was enabled',
        'policy.disabled': 'Governance policy was disabled',
        'policy.deleted': 'Governance policy was deleted',
    };
    for (const [key, label] of Object.entries(map)) {
        if (action.includes(key)) return label;
    }
    return action.replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export default function AuditLogPage() {
    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

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
                        details: humanReadableAction(entry.action),
                        timestamp: entry.created_at,
                        ip_address: entry.ip_address,
                        resource_id: entry.resource_id,
                        metadata: entry.details as Record<string, unknown> | undefined,
                    })));
                }
            }
        } catch {
            // Fallback: no events
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedId(prev => prev === id ? null : id);
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                        <p className="text-zinc-800 text-sm font-medium">Access Events Only</p>
                        <p className="text-muted-foreground text-sm">
                            This log tracks access events &mdash; not decisions. Decision records are stored in the cryptographic chain.
                        </p>
                    </div>
                </div>

                {/* Events List */}
                <div className="bg-card rounded-xl border border-border">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">Recent Events</h3>
                        <span className="text-xs text-muted-foreground">{events.length} event{events.length !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="divide-y divide-border">
                        {loading ? (
                            <div className="px-6 py-12 text-center text-sm text-muted-foreground">Loading audit log...</div>
                        ) : events.length === 0 ? (
                            <div className="px-6 py-12 text-center text-sm text-muted-foreground">No audit events recorded yet.</div>
                        ) : events.map((event) => (
                            <div key={event.id} className="px-6 py-4">
                                <div className="flex items-start gap-4">
                                    <EventIcon type={event.type} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <EventTypeBadge type={event.type} />
                                            {event.target && (
                                                <span className="text-sm font-medium text-foreground truncate">
                                                    {event.target}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-foreground">{event.details}</p>
                                        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
                                            <span>by <span className="font-medium text-foreground">{event.actor}</span></span>
                                            {event.ip_address && (
                                                <>
                                                    <span>&bull;</span>
                                                    <span className="flex items-center gap-1">
                                                        <Globe className="w-3 h-3" />
                                                        {event.ip_address}
                                                    </span>
                                                </>
                                            )}
                                            <span>&bull;</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(event.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Expand / Collapse Button */}
                                    <button
                                        onClick={() => toggleExpand(event.id)}
                                        className="p-1.5 rounded-md hover:bg-secondary transition-colors shrink-0"
                                        title="View metadata"
                                    >
                                        {expandedId === event.id ? (
                                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>

                                {/* Expandable Metadata Panel */}
                                {expandedId === event.id && (
                                    <div className="ml-12">
                                        <MetadataPanel event={event} />
                                    </div>
                                )}
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
