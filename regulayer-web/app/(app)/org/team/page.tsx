'use client';

import { useState } from 'react';
import {
    Users, Plus, Mail, Shield, Eye, Edit3,
    CheckCircle, Clock, AlertCircle, MoreVertical,
    UserMinus, ChevronDown
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

type Role = 'owner' | 'admin' | 'member' | 'auditor';
type InviteStatus = 'active' | 'pending' | 'expired';

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
    owner: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Owner', description: 'Full org control + billing' },
    admin: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Admin', description: 'Governance + approvals' },
    member: { bg: 'bg-green-100', text: 'text-green-700', label: 'Member', description: 'Annotate & tag only' },
    auditor: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Auditor', description: 'View & export only' },
};

function RoleBadge({ role }: { role: Role }) {
    const config = roleConfig[role];
    return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    );
}

function StatusBadge({ status }: { status: InviteStatus }) {
    const configs: Record<InviteStatus, { bg: string; text: string; icon: React.ReactNode }> = {
        active: { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
        pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Clock className="w-3 h-3" /> },
        expired: { bg: 'bg-red-100', text: 'text-red-700', icon: <AlertCircle className="w-3 h-3" /> },
    };
    const c = configs[status];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${c.bg} ${c.text}`}>
            {c.icon}
            {status}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Invite Team Member</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="colleague@company.com"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                    <div className="space-y-2">
                        {(['admin', 'member', 'auditor'] as Role[]).map((r) => (
                            <label
                                key={r}
                                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${role === r ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:bg-slate-50'
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
                                    <span className="font-medium text-slate-900">{roleConfig[r].label}</span>
                                    <p className="text-sm text-slate-500">{roleConfig[r].description}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                    <p className="text-blue-800 text-sm">
                        Invited users can never modify cryptographic records.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onInvite(email, role)}
                        disabled={!email.trim()}
                        className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Change Role</h2>
                <p className="text-slate-600 mb-4">
                    Change role for <strong>{member.name}</strong>
                </p>

                <div className="space-y-2 mb-6">
                    {(['admin', 'member', 'auditor'] as Role[]).map((r) => (
                        <label
                            key={r}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${newRole === r ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:bg-slate-50'
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
                                <span className="font-medium text-slate-900">{roleConfig[r].label}</span>
                                <p className="text-sm text-slate-500">{roleConfig[r].description}</p>
                            </div>
                        </label>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onChange(newRole)}
                        disabled={newRole === member.role}
                        className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <UserMinus className="w-6 h-6 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Remove Member?</h2>
                </div>

                <p className="text-slate-600 mb-4">
                    Remove <strong>{member.name}</strong> from the organization?
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                    <p className="text-blue-800 text-sm">
                        This removes access only. Decisions and proofs are unaffected.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50"
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
    onRemove
}: {
    member: TeamMember;
    currentUserRole: Role;
    onChangeRole: () => void;
    onRemove: () => void;
}) {
    const [showMenu, setShowMenu] = useState(false);
    const canManage = currentUserRole === 'owner' || (currentUserRole === 'admin' && member.role !== 'owner');

    return (
        <tr className="border-b border-slate-50 hover:bg-slate-50">
            <td className="px-6 py-4">
                <div>
                    <p className="font-medium text-slate-900">{member.name}</p>
                    <p className="text-sm text-slate-500">{member.email}</p>
                </div>
            </td>
            <td className="px-6 py-4">
                <RoleBadge role={member.role} />
            </td>
            <td className="px-6 py-4">
                <StatusBadge status={member.status} />
            </td>
            <td className="px-6 py-4 text-sm text-slate-500">
                {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '—'}
            </td>
            <td className="px-6 py-4">
                {canManage && member.role !== 'owner' && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1 hover:bg-slate-100 rounded"
                        >
                            <MoreVertical className="w-5 h-5 text-slate-400" />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10">
                                <button
                                    onClick={() => { setShowMenu(false); onChangeRole(); }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
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

    const currentUserRole: Role = 'owner';

    const [members, setMembers] = useState<TeamMember[]>([
        { id: '1', name: 'You', email: 'owner@company.com', role: 'owner', status: 'active', joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '2', name: 'Alice Chen', email: 'alice@company.com', role: 'admin', status: 'active', joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '3', name: 'Bob Smith', email: 'bob@company.com', role: 'member', status: 'active', joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '4', name: 'Pending User', email: 'pending@company.com', role: 'member', status: 'pending', joinedAt: null },
        { id: '5', name: 'External Auditor', email: 'auditor@kpmg.com', role: 'auditor', status: 'active', joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    ]);

    const handleInvite = (email: string, role: Role) => {
        console.log('Inviting:', email, role);
        setShowInviteModal(false);
    };

    const handleChangeRole = (newRole: Role) => {
        if (changeRoleMember) {
            setMembers(members.map(m => m.id === changeRoleMember.id ? { ...m, role: newRole } : m));
            setChangeRoleMember(null);
        }
    };

    const handleRemove = () => {
        if (removeMember) {
            setMembers(members.filter(m => m.id !== removeMember.id));
            setRemoveMember(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Team</h1>
                        <p className="text-slate-600">Manage organization members</p>
                    </div>
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Invite Member
                    </button>
                </div>

                {/* Role Legend */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                    <h3 className="font-medium text-slate-900 mb-4">Role Permissions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(['owner', 'admin', 'member', 'auditor'] as Role[]).map((r) => (
                            <div key={r} className="flex items-start gap-2">
                                <RoleBadge role={r} />
                                <span className="text-sm text-slate-500">{roleConfig[r].description}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Members Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-4">Member</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-4">Role</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-4">Status</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-4">Joined</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <MemberRow
                                    key={member.id}
                                    member={member}
                                    currentUserRole={currentUserRole}
                                    onChangeRole={() => setChangeRoleMember(member)}
                                    onRemove={() => setRemoveMember(member)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Disclaimer */}
                <p className="text-center text-xs text-slate-400 mt-8">
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
