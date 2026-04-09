'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    CheckCircle, Clock, AlertCircle, MoreVertical,
    UserMinus
} from 'lucide-react';
import { getMe, listTeamMembers, inviteTeamMember, changeUserRole, removeTeamMember, listInvitations, revokeInvitation, TeamMember as ApiTeamMember, PendingInvitation } from '@/lib/api';

// ============================================================
// Types
// ============================================================

type Role = 'owner' | 'admin' | 'member' | 'auditor';
type InviteStatus = 'active' | 'pending' | 'deactivated';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: InviteStatus;
    joinedAt: string | null;
}

// ============================================================
// Role Badge & Info
// ============================================================

const roleConfig: Record<Role, { bg: string; text: string; label: string; description: string }> = {
    owner: { bg: 'bg-slate-900', text: 'text-white', label: 'Owner', description: 'Full org control + billing' },
    admin: { bg: 'bg-zinc-100', text: 'text-zinc-900', label: 'Admin', description: 'Manage keys, projects, governance' },
    member: { bg: 'bg-green-100', text: 'text-green-700', label: 'Member', description: 'Annotate & tag only' },
    auditor: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Auditor', description: 'View & export only' },
};

function RoleBadge({ role }: { role: Role }) {
    const config = roleConfig[role];
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    );
}

function StatusBadge({ status }: { status: InviteStatus }) {
    if (status === 'active') return (
        <span className="flex items-center gap-1.5 text-xs text-green-600">
            <CheckCircle className="w-3.5 h-3.5" /> Active
        </span>
    );
    if (status === 'pending') return (
        <span className="flex items-center gap-1.5 text-xs text-amber-600">
            <Clock className="w-3.5 h-3.5" /> Pending
        </span>
    );
    return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <AlertCircle className="w-3.5 h-3.5" /> Deactivated
        </span>
    );
}

// ============================================================
// Invite Modal
// ============================================================

function InviteModal({ onClose, onInvite }: { onClose: () => void; onInvite: (email: string, role: Role) => void }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Role>('member');

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-zinc-200">
                <h2 className="text-xl font-bold text-foreground mb-4">Invite Team Member</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="colleague@company.com"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                    <div className="space-y-2">
                        {(['admin', 'member', 'auditor'] as Role[]).map((r) => (
                            <label
                                key={r}
                                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${role === r ? 'border-primary-500 bg-primary-50' : 'border-border hover:bg-zinc-100'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value={r}
                                    checked={role === r}
                                    onChange={() => setRole(r)}
                                    className="mt-1"
                                />
                                <div>
                                    <span className="font-medium text-foreground">{roleConfig[r].label}</span>
                                    <p className="text-sm text-muted-foreground">{roleConfig[r].description}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 mb-6">
                    <p className="text-zinc-800 text-sm">
                        Invited users can never modify cryptographic records.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-border text-foreground px-4 py-2 rounded-lg hover:bg-zinc-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onInvite(email, role)}
                        disabled={!email.trim()}
                        className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50"
                    >
                        Send Invite
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Change Role Modal
// ============================================================

function ChangeRoleModal({
    member,
    onClose,
    onChange
}: {
    member: TeamMember;
    onClose: () => void;
    onChange: (role: Role) => void;
}) {
    const [newRole, setNewRole] = useState<Role>(member.role);

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-zinc-200">
                <h2 className="text-xl font-bold text-foreground mb-4">Change Role</h2>
                <p className="text-muted-foreground mb-4">
                    Change role for <strong>{member.name}</strong>
                </p>

                <div className="space-y-2 mb-6">
                    {(['admin', 'member', 'auditor'] as Role[]).map((r) => (
                        <label
                            key={r}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${newRole === r ? 'border-primary-500 bg-primary-50' : 'border-border hover:bg-zinc-100'
                                }`}
                        >
                            <input
                                type="radio"
                                name="role"
                                value={r}
                                checked={newRole === r}
                                onChange={() => setNewRole(r)}
                                className="mt-1"
                            />
                            <div>
                                <span className="font-medium text-foreground">{roleConfig[r].label}</span>
                                <p className="text-sm text-muted-foreground">{roleConfig[r].description}</p>
                            </div>
                        </label>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-border text-foreground px-4 py-2 rounded-lg hover:bg-zinc-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onChange(newRole)}
                        disabled={newRole === member.role}
                        className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Remove Member Modal
// ============================================================

function RemoveMemberModal({
    member,
    onClose,
    onConfirm
}: {
    member: TeamMember;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-zinc-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <UserMinus className="w-6 h-6 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Remove Member?</h2>
                </div>

                <p className="text-muted-foreground mb-4">
                    Remove <strong>{member.name}</strong> from the organization?
                </p>

                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 mb-6">
                    <p className="text-zinc-800 text-sm">
                        This removes access only. Decisions and proofs are unaffected.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-border text-foreground px-4 py-2 rounded-lg hover:bg-zinc-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Member Row
// ============================================================

function MemberRow({
    member,
    currentUserRole,
    onChangeRole,
    onRemove,
    onCancelInvite
}: {
    member: TeamMember;
    currentUserRole: Role;
    onChangeRole: () => void;
    onRemove: () => void;
    onCancelInvite: () => void;
}) {
    const [showMenu, setShowMenu] = useState(false);
    const canManage = currentUserRole === 'owner' || (currentUserRole === 'admin' && member.role !== 'owner');
    const isPending = member.status === 'pending';

    return (
        <tr className="border-b border-zinc-100 hover:bg-zinc-50/50">
            <td className="px-6 py-4">
                <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
            </td>
            <td className="px-6 py-4">
                <RoleBadge role={member.role} />
            </td>
            <td className="px-6 py-4">
                <StatusBadge status={member.status} />
            </td>
            <td className="px-6 py-4 text-sm text-muted-foreground">
                {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '—'}
            </td>
            <td className="px-6 py-4">
                {canManage && isPending && (
                    <button
                        onClick={onCancelInvite}
                        className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                    >
                        Cancel Invite
                    </button>
                )}
                {canManage && !isPending && member.role !== 'owner' && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1 hover:bg-secondary rounded"
                        >
                            <MoreVertical className="w-5 h-5 text-muted-foreground" />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-8 bg-white border border-border rounded-lg shadow-lg py-1 z-10 w-32">
                                <button
                                    onClick={() => { setShowMenu(false); onChangeRole(); }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-50"
                                >
                                    Change role
                                </button>
                                <button
                                    onClick={() => { setShowMenu(false); onRemove(); }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </td>
        </tr>
    );
}


// ============================================================
// Main Team Page
// ============================================================

export default function TeamPage() {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [changeRoleMember, setChangeRoleMember] = useState<TeamMember | null>(null);
    const [removeMember, setRemoveMember] = useState<TeamMember | null>(null);
    const [loading, setLoading] = useState(true);
    const [orgId, setOrgId] = useState<string | null>(null);

    const [currentUserRole, setCurrentUserRole] = useState<Role>('member');

    const [members, setMembers] = useState<TeamMember[]>([]);

    useEffect(() => {
        loadTeam();
    }, []);

    const loadTeam = async () => {
        try {
            const meRes = await getMe();
            if (meRes.data) {
                setCurrentUserRole((meRes.data?.role as Role) || 'member');
                if (meRes.data.org?.id) {
                    const oid = meRes.data.org.id;
                    setOrgId(oid);

                    // Fetch active members
                    const teamRes = await listTeamMembers(oid);
                    const activeMembers: TeamMember[] = teamRes.data ? teamRes.data.map((u: ApiTeamMember) => ({
                        id: u.id,
                        name: u.email.split('@')[0],
                        email: u.email,
                        role: u.role as Role,
                        status: 'active' as InviteStatus,
                        joinedAt: u.joined_at,
                    })) : [];

                    // Fetch pending invitations
                    const invitesRes = await listInvitations(oid);
                    const pendingMembers: TeamMember[] = invitesRes.data ? invitesRes.data.map((inv: PendingInvitation) => ({
                        id: inv.id,
                        name: inv.email.split('@')[0],
                        email: inv.email,
                        role: inv.role as Role,
                        status: 'pending' as InviteStatus,
                        joinedAt: null,
                    })) : [];

                    setMembers([...activeMembers, ...pendingMembers]);
                }
            }
        } catch {
            // Fallback to empty
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (email: string, role: Role) => {
        if (!orgId) return;
        try {
            const res = await inviteTeamMember(orgId, email, role);
            if (res.data) {
                loadTeam();
            }
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            const status = err.response?.status;
            if (typeof detail === 'string') {
                alert(detail);
            } else if (Array.isArray(detail)) {
                // Pydantic validation error array
                alert(`Validation error: ${detail.map((d: any) => d.msg).join(', ')}`);
            } else {
                alert(`Failed to send invitation (${status || 'unknown'}). Please try again.`);
            }
        }
        setShowInviteModal(false);
    };

    const handleChangeRole = async (newRole: Role) => {
        if (changeRoleMember && orgId) {
            try {
                await changeUserRole(orgId, changeRoleMember.id, newRole);
                setMembers(members.map(m => m.id === changeRoleMember.id ? { ...m, role: newRole } : m));
            } catch {
                // Error handled silently
            }
            setChangeRoleMember(null);
        }
    };

    const handleRemove = async () => {
        if (removeMember && orgId) {
            try {
                await removeTeamMember(orgId, removeMember.id);
                loadTeam();
                setRemoveMember(null);
            } catch (err: any) {
                alert(err.response?.data?.detail || 'Failed to remove member. You may not have permission.');
            }
        }
    };

    const handleCancelInvite = async (member: TeamMember) => {
        if (!orgId) return;
        if (!confirm(`Cancel the pending invitation for ${member.email}?`)) return;
        try {
            await revokeInvitation(orgId, member.id);
            loadTeam();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to cancel invitation');
        }
    };


    return (
        <div className="min-h-screen bg-transparent">
            <div className="px-6 md:px-10 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Team</h1>
                        <p className="text-muted-foreground">Manage organization members</p>
                    </div>
                    {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-800 flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"
                        >
                            <Plus className="w-4 h-4" />
                            Invite Member
                        </button>
                    )}
                </div>

                {/* Role Legend */}
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 mb-6">
                    <h3 className="font-medium text-foreground mb-4">Role Permissions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(['owner', 'admin', 'member', 'auditor'] as Role[]).map((r) => (
                            <div key={r} className="flex items-start gap-2">
                                <RoleBadge role={r} />
                                <span className="text-sm text-muted-foreground">{roleConfig[r].description}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Members Table */}
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-200 bg-zinc-50">
                                <th className="text-left text-xs font-medium text-muted-foreground uppercase px-6 py-4">Member</th>
                                <th className="text-left text-xs font-medium text-muted-foreground uppercase px-6 py-4">Role</th>
                                <th className="text-left text-xs font-medium text-muted-foreground uppercase px-6 py-4">Status</th>
                                <th className="text-left text-xs font-medium text-muted-foreground uppercase px-6 py-4">Joined</th>
                                <th className="text-left text-xs font-medium text-muted-foreground uppercase px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">Loading team...</td></tr>
                            ) : members.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">No team members yet. Invite your first member.</td></tr>
                            ) : members.map((member) => (
                                <MemberRow
                                    key={member.id}
                                    member={member}
                                    currentUserRole={currentUserRole}
                                    onChangeRole={() => setChangeRoleMember(member)}
                                    onRemove={() => setRemoveMember(member)}
                                    onCancelInvite={() => handleCancelInvite(member)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Disclaimer */}
                <p className="text-center text-xs text-muted-foreground mt-8">
                    User actions affect access, never cryptographic truth.
                </p>
            </div>

            {showInviteModal && (
                <InviteModal
                    onClose={() => setShowInviteModal(false)}
                    onInvite={handleInvite}
                />
            )}

            {changeRoleMember && (
                <ChangeRoleModal
                    member={changeRoleMember}
                    onClose={() => setChangeRoleMember(null)}
                    onChange={handleChangeRole}
                />
            )}

            {removeMember && (
                <RemoveMemberModal
                    member={removeMember}
                    onClose={() => setRemoveMember(null)}
                    onConfirm={handleRemove}
                />
            )}
        </div>
    );
}

