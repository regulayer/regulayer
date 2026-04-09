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
import { getMe, listTeamMembers, inviteTeamMember, removeTeamMember, TeamMember } from '@/lib/api';
import { GlazedCard } from '@/components/ui/glazed-card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useRef } from 'react';

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('viewer');
    const [inviting, setInviting] = useState(false);
    const inviteFormRef = useRef<HTMLDivElement>(null);

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
        } catch (err) {
            console.error("Failed to load team:", err);
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

    const scrollToInvite = () => {
        inviteFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = inviteFormRef.current?.querySelector('input');
        if (input) (input as HTMLInputElement).focus();
    };

    const roleBadgeClass = (role: string) => {
        switch (role) {
            case 'owner': return 'bg-slate-900 text-white border-zinc-800';
            case 'admin': return 'bg-zinc-100 text-zinc-900 border-zinc-200';
            case 'editor': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-zinc-50 text-slate-800 border-zinc-200';
        }
    };

    return (
        <div className="p-6 md:p-10 pb-20 space-y-8 text-foreground">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Team Management
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Invite colleagues and manage access permissions for your organization.
                    </p>
                </div>
                <button
                    onClick={scrollToInvite}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-all shadow-lg active:scale-95"
                >
                    <IconUserPlus size={18} />
                    Add Member
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Invite Form */}
                <div className="md:col-span-1" ref={inviteFormRef}>
                    <GlazedCard className="p-6 sticky top-24 border-zinc-200/60 shadow-xl">
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <IconUserPlus size={20} className="text-slate-700" />
                            Invite Member
                        </h2>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-0.5">Email Address</label>
                                <div className="relative">
                                    <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all placeholder:text-slate-500"
                                        placeholder="colleague@company.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-0.5">Role</label>
                                <div className="relative">
                                    <IconShield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm appearance-none outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all cursor-pointer"
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
                                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-lg shadow-zinc-900/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2"
                            >
                                {inviting ? <IconLoader2 className="animate-spin" size={18} /> : <IconUserPlus size={18} />}
                                Send Invite
                            </button>
                        </form>
                    </GlazedCard>
                </div>

                {/* Team List */}
                <div className="md:col-span-2 space-y-4">
                    <GlazedCard className="overflow-hidden border-zinc-200/60 shadow-md">
                        {loading ? (
                            <div className="p-20 text-center text-muted-foreground flex flex-col items-center">
                                <IconLoader2 className="w-8 h-8 animate-spin mb-3 text-slate-500" />
                                <span className="text-sm font-medium">Fetching organization team...</span>
                            </div>
                        ) : members.length === 0 ? (
                            <div className="p-20 text-center text-muted-foreground">
                                <IconUsers className="w-16 h-16 mx-auto mb-4 opacity-10 text-zinc-900" />
                                <p className="text-sm font-medium">No team members joined yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100">
                                {members.map((member) => (
                                    <div key={member.id} className="p-5 flex items-center justify-between group hover:bg-zinc-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold border border-white shadow-sm ring-1 ring-zinc-200/50">
                                                {member.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-zinc-900 text-sm">{member.email}</div>
                                                <div className="text-[11px] text-slate-500 font-medium">Joined {new Date(member.joined_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all", roleBadgeClass(member.role))}>
                                                {member.role}
                                            </span>

                                            {member.role !== 'owner' && (
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm(`Remove ${member.email} from the team?`)) return;
                                                        try {
                                                            const me = await getMe();
                                                            if (me.data?.org) {
                                                                await removeTeamMember(me.data.org.id, member.id);
                                                                await loadTeam();
                                                            }
                                                        } catch {
                                                            alert('Failed to remove member');
                                                        }
                                                    }}
                                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
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

