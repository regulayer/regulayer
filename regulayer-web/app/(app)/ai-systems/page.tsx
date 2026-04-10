'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    IconCpu, IconPlus, IconSearch, IconFilter, IconChevronRight,
    IconAlertOctagon, IconShieldCheck, IconAlertTriangle, IconCircleCheck,
    IconCircleDashed, IconX, IconTrash, IconRocket, IconFlask, IconEye, IconArchive,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import {
    AISystem, RiskTier, LifecycleStatus, AnnexCategory,
    getAISystems, saveAISystem, deleteAISystemRecord, getProjects, getMe, Project,
} from '@/lib/api';

const RISK_STYLES: Record<RiskTier, { bg: string; label: string }> = {
    unacceptable: { bg: 'bg-red-600 text-white border-red-700 animate-pulse', label: 'Prohibited' },
    high: { bg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20', label: 'High' },
    limited: { bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20', label: 'Limited' },
    minimal: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20', label: 'Minimal' },
    unclassified: { bg: 'bg-secondary text-muted-foreground border-border', label: 'Unclassified' },
};

const LIFECYCLE_CONFIG: Record<LifecycleStatus, { icon: React.ReactNode; label: string; color: string }> = {
    development: { icon: <IconFlask size={13} />, label: 'Development', color: 'text-indigo-500' },
    testing: { icon: <IconEye size={13} />, label: 'Testing', color: 'text-amber-500' },
    deployed: { icon: <IconRocket size={13} />, label: 'Deployed', color: 'text-emerald-500' },
    monitoring: { icon: <IconShieldCheck size={13} />, label: 'Monitoring', color: 'text-cyan-500' },
    retired: { icon: <IconArchive size={13} />, label: 'Retired', color: 'text-muted-foreground' },
};

const ANNEX_LABELS: Record<AnnexCategory, string> = {
    biometric: 'Biometric ID', critical_infrastructure: 'Critical Infra',
    education: 'Education', employment: 'Employment',
    essential_services: 'Essential Services', law_enforcement: 'Law Enforcement',
    migration: 'Migration', justice: 'Justice', none: '—',
};

export default function AISystemsPage() {
    const [systems, setSystems] = useState<AISystem[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [search, setSearch] = useState('');
    const [filterRisk, setFilterRisk] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', version: '1.0', description: '', intended_purpose: '', provider_name: '', project_id: '' });

    useEffect(() => {
        getAISystems().then(setSystems).catch(console.error);
        getMe().then(res => {
            if (res.data?.organization_id) {
                getProjects(res.data.organization_id).then(p => setProjects(p.data || [])).catch(() => {});
            }
        }).catch(() => {});
    }, []);

    const handleCreate = () => {
        const newSystem: AISystem = {
            id: crypto.randomUUID(),
            name: formData.name,
            version: formData.version,
            description: formData.description,
            intended_purpose: formData.intended_purpose,
            provider_name: formData.provider_name,
            risk_tier: 'unclassified',
            annex_category: 'none',
            lifecycle_status: 'development',
            project_id: formData.project_id || undefined,
            classification_rationale: '',
            member_states: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        saveAISystem(newSystem).then(() => getAISystems().then(setSystems));
        setShowModal(false);
        setFormData({ name: '', version: '1.0', description: '', intended_purpose: '', provider_name: '', project_id: '' });
    };

    const handleDelete = (id: string) => {
        if (!confirm('Delete this AI system? This cannot be undone.')) return;
        deleteAISystemRecord(id).then(() => getAISystems().then(setSystems));
    };

    const filtered = useMemo(() => {
        let result = systems;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.intended_purpose.toLowerCase().includes(q));
        }
        if (filterRisk !== 'all') result = result.filter(s => s.risk_tier === filterRisk);
        if (filterStatus !== 'all') result = result.filter(s => s.lifecycle_status === filterStatus);
        return result;
    }, [systems, search, filterRisk, filterStatus]);

    const highCount = systems.filter(s => s.risk_tier === 'high').length;
    const limitedCount = systems.filter(s => s.risk_tier === 'limited').length;
    const minimalCount = systems.filter(s => s.risk_tier === 'minimal').length;
    const unclassifiedCount = systems.filter(s => s.risk_tier === 'unclassified').length;

    return (
        <div className="p-6 md:p-10 pb-20 space-y-6 text-foreground">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">AI System Registry</h1>
                    <p className="text-muted-foreground text-sm">Inventory and risk classification of all AI systems per EU AI Act Articles 6 &amp; Annex III.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
                    <IconPlus size={16} /> Register System
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'Total Systems', value: systems.length, icon: <IconCpu size={18} />, color: 'text-foreground bg-secondary' },
                    { label: 'High Risk', value: highCount, icon: <IconAlertOctagon size={18} />, color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10' },
                    { label: 'Limited Risk', value: limitedCount, icon: <IconAlertTriangle size={18} />, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10' },
                    { label: 'Minimal Risk', value: minimalCount, icon: <IconCircleCheck size={18} />, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' },
                    { label: 'Unclassified', value: unclassifiedCount, icon: <IconCircleDashed size={18} />, color: 'text-muted-foreground bg-secondary' },
                ].map(s => (
                    <div key={s.label} className="bg-card border border-border rounded-2xl shadow-card p-5 hover:shadow-glow-sm hover:-translate-y-1 transition-all duration-300">
                        <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center mb-2', s.color)}>{s.icon}</div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{s.label}</p>
                        <p className="text-2xl font-bold mt-1">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="bg-card border border-border rounded-2xl shadow-card p-5 space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, description, or purpose..."
                            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)}
                        className={cn("flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors",
                            showFilters ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary text-foreground border-border")}>
                        <IconFilter size={16} /> Filters
                    </button>
                </div>
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-border">
                        <div>
                            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Risk Tier</label>
                            <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm">
                                <option value="all">All</option>
                                <option value="high">High</option>
                                <option value="limited">Limited</option>
                                <option value="minimal">Minimal</option>
                                <option value="unclassified">Unclassified</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Lifecycle</label>
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm">
                                <option value="all">All</option>
                                <option value="development">Development</option>
                                <option value="testing">Testing</option>
                                <option value="deployed">Deployed</option>
                                <option value="monitoring">Monitoring</option>
                                <option value="retired">Retired</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={() => { setFilterRisk('all'); setFilterStatus('all'); setSearch(''); }} className="text-sm text-muted-foreground hover:text-foreground px-3 py-2">Clear All</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4"><IconCpu size={32} /></div>
                        <h3 className="text-lg font-medium">{systems.length > 0 ? 'No systems match your filters' : 'No AI systems registered'}</h3>
                        <p className="text-muted-foreground mt-1 max-w-sm">{systems.length > 0 ? 'Try adjusting your search or filters.' : 'Register your first AI system to begin EU AI Act compliance.'}</p>
                        {systems.length === 0 && (
                            <button onClick={() => setShowModal(true)} className="mt-4 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors">
                                <IconPlus size={16} className="inline mr-1" /> Register System
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-background border-b border-border">
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">System</th>
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Version</th>
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk Tier</th>
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Annex III</th>
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lifecycle</th>
                                    <th className="text-left py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registered</th>
                                    <th className="text-right py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.map(system => {
                                    const risk = RISK_STYLES[system.risk_tier];
                                    const lifecycle = LIFECYCLE_CONFIG[system.lifecycle_status];
                                    return (
                                        <tr key={system.id} className="group hover:bg-secondary/50 transition-colors">
                                            <td className="py-3 px-5">
                                                <div>
                                                    <p className="font-medium text-foreground">{system.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{system.intended_purpose || system.description || '—'}</p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-5 font-mono text-xs text-muted-foreground">v{system.version}</td>
                                            <td className="py-3 px-5">
                                                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", risk.bg)}>{risk.label}</span>
                                            </td>
                                            <td className="py-3 px-5 text-xs text-muted-foreground">{ANNEX_LABELS[system.annex_category]}</td>
                                            <td className="py-3 px-5">
                                                <span className={cn("inline-flex items-center gap-1 text-xs font-medium", lifecycle.color)}>
                                                    {lifecycle.icon} {lifecycle.label}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5 text-xs text-muted-foreground font-mono">
                                                {new Date(system.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="py-3 px-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/ai-systems/${system.id}`} className="text-xs font-medium text-primary hover:text-primary/80 hover:underline inline-flex items-center gap-1">
                                                        Classify <IconChevronRight size={14} />
                                                    </Link>
                                                    <button onClick={() => handleDelete(system.id)} className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                        <IconTrash size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                <p>Showing {filtered.length} of {systems.length} systems</p>
            </div>

            {/* Registration Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Register AI System</h2>
                            <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><IconX size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'System Name', key: 'name', placeholder: 'e.g., GPT-4 Recruitment Screener' },
                                { label: 'Version', key: 'version', placeholder: 'e.g., 2.1' },
                                { label: 'Intended Purpose', key: 'intended_purpose', placeholder: 'Describe what this AI system does...' },
                                { label: 'Provider / Developer', key: 'provider_name', placeholder: 'Organization that built this system' },
                            ].map(field => (
                                <div key={field.key}>
                                    <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">{field.label}</label>
                                    <input type="text" value={(formData as Record<string, string>)[field.key]} onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                        placeholder={field.placeholder} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                            ))}
                            <div>
                                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Brief system description..." rows={3} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                            </div>
                            {projects.length > 0 && (
                                <div>
                                    <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Link to Project (optional)</label>
                                    <select value={formData.project_id} onChange={e => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm">
                                        <option value="">No project linked</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                            <button onClick={handleCreate} disabled={!formData.name.trim()}
                                className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50">
                                Register System
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

