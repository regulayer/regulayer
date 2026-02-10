'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Mail, Shield, Trash2 } from 'lucide-react';
import { getMe, listTeamMembers, inviteTeamMember, TeamMember } from '@/lib/api';

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'auditor'>('member');
    const [invitePassword, setInvitePassword] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [error, setError] = useState('');
    const [orgId, setOrgId] = useState<string | null>(null);

    useEffect(() => {
        loadTeam();
    }, []);

    const loadTeam = async () => {
        try {
            const meRes = await getMe();
            if (meRes.data?.org?.id) {
                const oid = meRes.data.org.id;
                setOrgId(oid);
                const teamRes = await listTeamMembers(oid);
                if (teamRes.data) {
                    setMembers(teamRes.data);
                }
            }
        } catch {
            setError('Failed to load team members');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orgId) return;
        setIsInviting(true);
        setError('');

        try {
            const res = await inviteTeamMember(orgId, {
                email: inviteEmail,
                password: invitePassword || 'TempPass123!',
                role: inviteRole
            });

            if (res.data) {
                setMembers([...members, res.data]);
                setInviteEmail('');
                setInvitePassword('');
                setInviteRole('member');
            } else {
                setError(res.error || 'Failed to invite member');
            }
        } catch {
            setError('Failed to invite member');
        } finally {
            setIsInviting(false);
        }
    };

    const roleBadgeClass = (role: string) => {
        switch (role) {
            case 'owner': return 'bg-purple-100 text-purple-700';
            case 'admin': return 'bg-blue-100 text-blue-700';
            case 'auditor': return 'bg-amber-100 text-amber-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const roleLabel = (role: string) => {
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Team Members</h1>
                        <p className="text-slate-600">Manage access to your organization</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            {members.length} member{members.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Member List */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">User</th>
                                        <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Role</th>
                                        <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Joined</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                                                Loading team members...
                                            </td>
                                        </tr>
                                    ) : members.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                                                No team members found. Invite your first member.
                                            </td>
                                        </tr>
                                    ) : members.map((member) => (
                                        <tr key={member.id} className="hover:bg-slate-50 group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 text-xs font-bold">
                                                        {member.email[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{member.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleBadgeClass(member.role)}`}>
                                                    {roleLabel(member.role)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs text-slate-500">
                                                    {new Date(member.created_at).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {member.role !== 'owner' && (
                                                    <button
                                                        className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                                                        title="Remove member"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Invite Card */}
                    <div>
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-primary-500" />
                                Add Team Member
                            </h3>
                            <form onSubmit={handleInvite} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            required
                                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 outline-none"
                                            placeholder="colleague@company.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
                                    <input
                                        type="password"
                                        value={invitePassword}
                                        onChange={(e) => setInvitePassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 outline-none"
                                        placeholder="Min 8 characters"
                                        minLength={8}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">The member will use this to log in initially.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                    <select
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member' | 'auditor')}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 outline-none bg-white"
                                    >
                                        <option value="member">Member</option>
                                        <option value="admin">Admin</option>
                                        <option value="auditor">Auditor (Read-only)</option>
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">Auditors can view and export but cannot modify.</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isInviting || !inviteEmail}
                                    className="w-full bg-primary-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-500 transition disabled:opacity-50"
                                >
                                    {isInviting ? 'Adding Member...' : 'Add Member'}
                                </button>
                            </form>
                        </div>

                        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                                <Shield className="w-4 h-4 text-slate-500" />
                                Role Permissions
                            </h4>
                            <ul className="text-xs text-slate-500 leading-relaxed space-y-1">
                                <li><strong>Owner:</strong> Full org control, billing, user management</li>
                                <li><strong>Admin:</strong> Projects, keys, governance approval</li>
                                <li><strong>Member:</strong> View decisions, annotate, export reports</li>
                                <li><strong>Auditor:</strong> Read-only view of all data, full export</li>
                            </ul>
                            <p className="text-xs text-slate-400 mt-2 italic">
                                No role can modify cryptographic records.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
