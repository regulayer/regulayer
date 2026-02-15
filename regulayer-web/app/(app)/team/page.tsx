'use client';

import { useState, useEffect } from 'react';
import {
    IconUserPlus,
    IconMail,
    IconShield,
    IconTrash,
    IconLoader2,
    IconCheck,
    IconUsers
} from '@tabler/icons-react';
import { getMe, listTeamMembers, inviteTeamMember, TeamMember } from '@/lib/api';
import { GlazedCard } from '@/components/ui/glazed-card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('viewer');
    const [inviting, setInviting] = useState(false);

    useEffect(() => {
        loadTeam();
    }, []);

    const loadTeam = async () => {
        try {
            const me = await getMe();
            if (me.data?.org) {
                const res = await listTeamMembers(me.data.org.id);
                if (res.data) setMembers(res.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviting(true);
        try {
            const me = await getMe();
            if (me.data?.org) {
                await inviteTeamMember(me.data.org.id, email, role);
                await loadTeam();
                setEmail('');
                alert('Invitation sent');
            }
        } catch {
            alert('Failed to invite member');
        } finally {
            setInviting(false);
        }
    };

    const roleBadgeClass = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
            case 'editor': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                        Team Management
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Invite colleagues and manage access permissions.
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Invite Form */}
                <div className="md:col-span-1">
                    <GlazedCard className="p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                            <IconUserPlus size={20} className="text-indigo-500" />
                            Invite Member
                        </h2>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Email Address</label>
                                <div className="relative">
                                    <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="colleague@company.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Role</label>
                                <div className="relative">
                                    <IconShield className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm appearance-none outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    >
                                        <option value="viewer">Viewer</option>
                                        <option value="editor">Editor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={inviting || !email}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                            >
                                {inviting ? <IconLoader2 className="animate-spin" size={18} /> : <IconUserPlus size={18} />}
                                Send Invite
                            </button>
                        </form>
                    </GlazedCard>
                </div>

                {/* Team List */}
                <div className="md:col-span-2 space-y-4">
                    <GlazedCard className="overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-zinc-400 flex flex-col items-center">
                                <IconLoader2 className="w-8 h-8 animate-spin mb-2" />
                                Loading team...
                            </div>
                        ) : members.length === 0 ? (
                            <div className="p-12 text-center text-zinc-500">
                                <IconUsers className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No members found.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                {members.map((member) => (
                                    <div key={member.id} className="p-4 flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 font-bold border border-white dark:border-zinc-600 shadow-sm">
                                                {member.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-zinc-900 dark:text-zinc-100">{member.email}</div>
                                                <div className="text-xs text-zinc-500">Joined {new Date(member.joined_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border", roleBadgeClass(member.role))}>
                                                {member.role}
                                            </span>

                                            {member.role !== 'owner' && (
                                                <button
                                                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Remove member"
                                                >
                                                    <IconTrash size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlazedCard>
                </div>
            </div>
        </div>
    );
}
