'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    IconFolder, IconPlus, IconCopy, IconCheck, IconKey, IconLoader2,
    IconCalendar, IconSearch, IconFilter, IconShieldCheck, IconBuildingBank,
    IconDotsVertical, IconChevronDown, IconLock, IconEye
} from '@tabler/icons-react';
import { getMe, getProjects, createProject, Project } from '@/lib/api';
import { GlazedCard } from '@/components/ui/glazed-card';
import { cn } from '@/lib/utils';

function CreateProjectModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onCreate(name);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <GlazedCard className="w-full max-w-md p-6 bg-background border-border">
                <h2 className="text-xl font-bold text-foreground mb-4">Create New Project</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Project Name</label>
                        <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:bg-slate-700 transition-colors"
                            placeholder="e.g. Production Environment" autoFocus />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                        <button type="submit" disabled={loading || !name.trim()}
                            className="px-4 py-2 text-sm bg-primary hover:bg-brand-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
                            {loading && <IconLoader2 className="animate-spin" size={16} />}
                            Create Project
                        </button>
                    </div>
                </form>
            </GlazedCard>
        </div>
    );
}

function GovernanceToggle({ project, onUpdate }: { project: Project; onUpdate: (id: string, newMode: string, newMsg: string) => void }) {
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState(project.gate_decline_message || 'Decision declined by governance.');
    const [isEditingMsg, setIsEditingMsg] = useState(false);

    const handleToggle = async (mode: 'observe' | 'gate') => {
        const currentMode = project.governance_mode === 'gate' ? 'gate' : 'observe';
        if (currentMode === mode || updating) return;
        
        setUpdating(true);
        try {
            const { updateProject } = await import('@/lib/api');
            await updateProject(project.id, { governance_mode: mode } as any);
            onUpdate(project.id, mode, message);
        } catch {
            alert('Failed to update governance mode');
        } finally {
            setUpdating(false);
        }
    };

    const handleSaveMessage = async () => {
        setUpdating(true);
        try {
            const { updateProject } = await import('@/lib/api');
            await updateProject(project.id, { gate_decline_message: message } as any);
            onUpdate(project.id, project.governance_mode || 'observe', message);
            setIsEditingMsg(false);
        } catch {
            alert('Failed to update decline message');
        } finally {
            setUpdating(false);
        }
    };

    const isGate = project.governance_mode === 'gate';

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex bg-secondary border border-border rounded-lg p-0.5 w-max relative">
                {updating && (
                    <div className="absolute inset-0 bg-background/50 z-10 rounded-lg flex items-center justify-center backdrop-blur-[1px]">
                        <IconLoader2 size={14} className="animate-spin text-primary" />
                    </div>
                )}
                <button 
                    onClick={() => handleToggle('observe')}
                    disabled={updating}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        !isGate
                            ? "bg-emerald-500/10 text-emerald-500 shadow-sm" 
                            : "text-muted-foreground hover:text-foreground hover:bg-slate-800"
                    )}
                >
                    <IconEye size={14} /> Observe
                </button>
                <button 
                    onClick={() => handleToggle('gate')}
                    disabled={updating}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        isGate 
                            ? "bg-amber-500/10 text-amber-500 shadow-sm" 
                            : "text-muted-foreground hover:text-foreground hover:bg-slate-800"
                    )}
                >
                    <IconLock size={14} /> Gate
                </button>
            </div>
            
            {!isGate ? (
                <p className="text-[10px] text-muted-foreground w-[160px] leading-tight">
                    AI decisions proceed instantly, reviewed later.
                </p>
            ) : (
                <div className="mt-1 text-xs border border-border bg-background rounded p-1.5 w-[180px]">
                    <p className="text-[10px] text-muted-foreground mb-1 leading-tight border-b border-border pb-1">
                        AI decisions held until approval.
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground mt-1 mb-0.5">Decline Msg:</p>
                    {isEditingMsg ? (
                        <div className="flex items-center gap-1">
                            <input 
                                value={message} 
                                onChange={e => setMessage(e.target.value)} 
                                className="bg-secondary border border-border rounded px-1.5 py-1 w-full text-[10px] focus:outline-none focus:ring-1 focus:ring-primary"
                                onKeyDown={e => e.key === 'Enter' && handleSaveMessage()}
                            />
                            <button onClick={handleSaveMessage} disabled={updating} className="text-primary hover:text-brand-400 p-0.5">
                                <IconCheck size={14}/>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-start justify-between group cursor-pointer hover:bg-secondary/50 p-0.5 -mx-0.5 rounded" onClick={() => setIsEditingMsg(true)}>
                            <p className="truncate text-foreground italic pr-2" title={project.gate_decline_message || 'Decision declined by governance.'}>
                                "{project.gate_decline_message || 'Decision declined by governance.'}"
                            </p>
                            <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 flex-shrink-0">edit</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => { loadProjects(); }, []);

    const loadProjects = async () => {
        try {
            const me = await getMe();
            if (me.data?.org) {
                const res = await getProjects(me.data.org.id);
                if (res.data) setProjects(res.data);
            }
        } finally { setLoading(false); }
    };

    const handleCreate = async (name: string) => {
        try {
            const me = await getMe();
            if (me.data?.org) {
                await createProject(me.data.org.id, { name });
                await loadProjects();
                setShowCreate(false);
            }
        } catch (e) { alert('Failed to create project'); }
    };

    const copyId = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filtered = projects.filter(p =>
        !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search)
    );

    return (
        <div className="p-6 md:p-10 space-y-8 pb-20 text-foreground">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground text-sm">Logical separation of AI systems, API keys, and governance scope.</p>
                </div>
                <button onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-brand-700 text-white rounded-lg font-medium shadow-lg shadow-brand-600/20 transition-all text-sm">
                    <IconPlus size={16} /> New Project
                </button>
            </div>

            {/* Search */}
            <div className="bg-card border border-border rounded-xl p-4">
                <div className="relative">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by project name or ID..."
                        className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:bg-slate-700/50" />
                </div>
            </div>

            {/* Project Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-20 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                            <IconFolder size={32} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">Create your first project to start generating keys and recording decisions.</p>
                        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-primary hover:bg-brand-700 text-white rounded-lg inline-flex items-center gap-2 text-sm">
                            <IconPlus size={16} /> Create Project
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-background border-b border-border">
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project</th>
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Environment</th>
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Integrity</th>
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Governance</th>
                                    <th className="text-right py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filtered.map(project => (
                                    <tr key={project.id} className="hover:bg-secondary transition-colors group">
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 flex-shrink-0">
                                                    <IconFolder size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{project.name}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <code className="text-xs font-mono text-muted-foreground truncate max-w-[140px]">{project.id.substring(0, 12)}...</code>
                                                        <button onClick={() => copyId(project.id)} className="p-0.5 hover:bg-secondary rounded transition" title="Copy ID">
                                                            {copiedId === project.id ? <IconCheck size={12} className="text-emerald-500" /> : <IconCopy size={12} className="text-foreground" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className="px-2 py-0.5 bg-secondary text-foreground text-xs rounded-full font-medium border border-border">
                                                Production
                                            </span>
                                        </td>
                                        <td className="py-4 px-5 text-xs text-muted-foreground font-mono">
                                            {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                                                <IconShieldCheck size={14} /> Verified
                                            </span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <GovernanceToggle 
                                                project={project} 
                                                onUpdate={(id, newMode, newMsg) => {
                                                    setProjects(prev => prev.map(p => p.id === id ? { ...p, governance_mode: newMode, gate_decline_message: newMsg } : p));
                                                }} 
                                            />
                                        </td>
                                        <td className="py-4 px-5 text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <Link href={`/api-keys?project=${project.id}`} className="text-xs text-muted-foreground hover:text-foreground transition">
                                                    <IconKey size={15} />
                                                </Link>
                                                <Link href={`/decisions?project=${project.id}`} className="text-xs bg-slate-800 hover:underline font-medium">
                                                    View Decisions
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer */}
            {!loading && filtered.length > 0 && (
                <p className="text-xs text-muted-foreground">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</p>
            )}

            {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
        </div>
    );
}

