'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    IconArrowLeft, IconPlus, IconSettings, IconShieldCheck,
    IconAlertTriangle, IconToggleLeft, IconToggleRight, IconTrash,
    IconMail, IconBan, IconCheck, IconX
} from '@tabler/icons-react';
import { getPolicies, getMe, createPolicy, togglePolicy, deletePolicy, GovernancePolicy, getProjects, Project } from '@/lib/api';
import { cn } from '@/lib/utils';
import { GlazedCard } from '@/components/ui/glazed-card';

export default function GovernanceRulesPage() {
    const [policies, setPolicies] = useState<GovernancePolicy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isJsonMode, setIsJsonMode] = useState(false);
    const [jsonInput, setJsonInput] = useState('{\n  "name": "Data Exfiltration Prevention",\n  "description": "Uses zero-shot LLM evaluation to detect PII or confidential company data in outputs.",\n  "applies_to": ["all"],\n  "conditions": [\n    { "field": "output", "operator": "llm_evaluate", "value": "text contains personally identifiable information (PII) like SSNs, phone numbers, or confidential financial metrics" }\n  ],\n  "actions": [\n    { "type": "require_approval" }\n  ]\n}');

    // Form state for new policy
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [conditions, setConditions] = useState([{ field: 'risk_level', operator: 'eq', value: 'high' }]);
    const [actions, setActions] = useState([{ type: 'require_approval', email: '', tag_name: '', webhook_url: '' }]);
    const [userRole, setUserRole] = useState<string>('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');

    const loadPolicies = () => {
        setLoading(true);
        getMe().then(res => {
            setUserRole(res.data?.role || 'member');
            // Fetch projects using the user's org_id
            const orgId = res.data?.organization_id;
            if (orgId) {
                getProjects(orgId).then(r => setProjects(r.data || [])).catch(() => { });
            }
        }).catch(() => { });
        getPolicies()
            .then(res => setPolicies(res.data))
            .catch(err => {
                console.error(err);
                setError('Failed to load governance policies.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadPolicies();
    }, []);

    const handleToggle = async (id: string, current: boolean) => {
        try {
            await togglePolicy(id, !current);
            setPolicies(policies.map(p => p.policy_id === id ? { ...p, enabled: !current } : p));
        } catch (err) {
            console.error("Failed to toggle policy", err);
            alert("Failed to update policy status.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this rule? This cannot be undone.")) return;
        try {
            await deletePolicy(id);
            setPolicies(policies.filter(p => p.policy_id !== id));
        } catch (err) {
            console.error("Failed to delete policy", err);
            alert("Failed to delete policy.");
        }
    };

    const addCondition = () => {
        setConditions([...conditions, { field: 'risk_level', operator: 'eq', value: '' }]);
    };

    const removeCondition = (index: number) => {
        if (conditions.length > 1) setConditions(conditions.filter((_, i) => i !== index));
    };

    const updateCondition = (index: number, key: string, val: string) => {
        setConditions(conditions.map((c, i) => i === index ? { ...c, [key]: val } : c));
    };

    const addAction = () => {
        setActions([...actions, { type: 'require_approval', email: '', tag_name: '', webhook_url: '' }]);
    };

    const removeAction = (index: number) => {
        if (actions.length > 1) setActions(actions.filter((_, i) => i !== index));
    };

    const updateAction = (index: number, key: string, val: string) => {
        setActions(actions.map((a, i) => i === index ? { ...a, [key]: val } : a));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let payload: any;
            if (isJsonMode) {
                payload = JSON.parse(jsonInput);
                if (payload.enabled === undefined) payload.enabled = true;
            } else {
                // Clean up actions to only include relevant fields
                const cleanActions = actions.map(a => {
                    const params: any = {};
                    if (a.type === 'notify_email' && a.email) params.email = a.email;
                    if (a.type === 'add_tag' && a.tag_name) params.tag_name = a.tag_name;
                    if (a.type === 'notify_webhook' && a.webhook_url) params.url = a.webhook_url;
                    return { type: a.type, parameters: params };
                });
                payload = {
                    name: newName,
                    description: newDesc,
                    enabled: true,
                    project_id: selectedProjectId || null,
                    applies_to: [],
                    conditions: conditions.map(c => ({ field: c.field, operator: c.operator, value: c.value })),
                    actions: cleanActions
                };
            }
            await createPolicy(payload);
            setIsCreating(false);
            setNewName('');
            setNewDesc('');
            setConditions([{ field: 'risk_level', operator: 'eq', value: 'high' }]);
            setActions([{ type: 'require_approval', email: '', tag_name: '', webhook_url: '' }]);
            loadPolicies();
        } catch (err: any) {
            console.error("Failed to create policy", err);
            if (err instanceof SyntaxError) {
                alert("Invalid JSON format.");
            } else {
                alert("Failed to create policy. Check your inputs.\n" + (err.response?.data?.detail?.[0]?.msg || err.message));
            }
        }
    };

    const actionIcons: Record<string, React.ReactNode> = {
        require_approval: <IconShieldCheck size={14} className="text-indigo-500" />,
        notify_email: <IconMail size={14} className="text-blue-500" />,
        block: <IconBan size={14} className="text-red-500" />,
        auto_approve: <IconCheck size={14} className="text-emerald-500" />,
        add_tag: <IconAlertTriangle size={14} className="text-amber-500" />,
        set_review_state: <IconSettings size={14} className="text-slate-700" />,
        notify_webhook: <IconAlertTriangle size={14} className="text-purple-500" />,
    };

    const actionLabels: Record<string, string> = {
        require_approval: 'Require Explicit Approval',
        notify_email: 'Notify via Email',
        block: 'Block Decision',
        auto_approve: 'Auto-Approve',
        add_tag: 'Add Tag',
        set_review_state: 'Set Review State',
        notify_webhook: 'Notify via Webhook',
    };

    if (loading && policies.length === 0) {
        return (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-border border-t-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 pb-20 space-y-8 text-foreground max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/governance" className="hover:text-foreground flex items-center gap-1 transition-colors">
                            <IconArrowLeft size={14} /> Back to Governance
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Governance Rules</h1>
                    <p className="text-muted-foreground text-sm">
                        Define automated policies to intercept, flag, or approve AI decisions based on risk, content, and context.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {(userRole === 'owner' || userRole === 'admin') && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-slate-800 text-white hover:bg-slate-900 h-9 px-4 py-2 shadow-sm"
                        >
                            <IconPlus size={16} /> New Rule
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Create Policy Form */}
            {isCreating && (
                <GlazedCard className="p-6 border-zinc-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <IconSettings size={20} className="text-slate-700" />
                            Create New Governance Rule
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="flex bg-secondary rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={() => setIsJsonMode(false)}
                                    className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors", !isJsonMode ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                                >
                                    Form builder
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsJsonMode(true)}
                                    className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors", isJsonMode ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                                >
                                    JSON
                                </button>
                            </div>
                            <button onClick={() => setIsCreating(false)} className="text-muted-foreground hover:text-foreground">
                                Cancel
                            </button>
                        </div>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-4">
                        {!isJsonMode ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Rule Name</label>
                                        <input required value={newName} onChange={e => setNewName(e.target.value)} type="text" className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Flag High Risk Financials" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Description</label>
                                        <input value={newDesc} onChange={e => setNewDesc(e.target.value)} type="text" className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm" placeholder="Optional context" />
                                    </div>
                                </div>

                                {/* Project Scope */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Project Scope</label>
                                    <select
                                        value={selectedProjectId}
                                        onChange={e => setSelectedProjectId(e.target.value)}
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="">All Projects (Global)</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-muted-foreground">Choose a project to limit this rule to, or leave as &quot;All Projects&quot; for org-wide.</p>
                                </div>

                                {/* Conditions */}
                                <div className="p-4 bg-secondary rounded-lg border border-border space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Conditions</h4>
                                        <button type="button" onClick={addCondition} className="text-xs text-slate-800 hover:text-zinc-900 font-medium">+ Add Condition</button>
                                    </div>
                                    {conditions.map((cond, i) => (
                                        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                                            <div>
                                                <label className="text-xs text-muted-foreground mb-1 block">Field</label>
                                                <select value={cond.field} onChange={e => updateCondition(i, 'field', e.target.value)} className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm">
                                                    <optgroup label="Decision Metadata">
                                                        <option value="risk_level">Risk Level</option>
                                                        <option value="system_name">System Name</option>
                                                        <option value="review_state">Review State</option>
                                                        <option value="tag">Tag</option>
                                                        <option value="model_name">Model Name</option>
                                                    </optgroup>
                                                    <optgroup label="Response Content">
                                                        <option value="output">Output (full response)</option>
                                                        <option value="output.answer">Output &rarr; Answer field</option>
                                                        <option value="output.text">Output &rarr; Text field</option>
                                                        <option value="output.content">Output &rarr; Content field</option>
                                                    </optgroup>
                                                    <optgroup label="Input Content">
                                                        <option value="input">Input (full request)</option>
                                                        <option value="input.query">Input &rarr; Query field</option>
                                                        <option value="input.prompt">Input &rarr; Prompt field</option>
                                                    </optgroup>
                                                    <optgroup label="Metadata">
                                                        <option value="metadata.confidence">Metadata &rarr; Confidence</option>
                                                        <option value="metadata.category">Metadata &rarr; Category</option>
                                                    </optgroup>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground mb-1 block">Operator</label>
                                                <select value={cond.operator} onChange={e => updateCondition(i, 'operator', e.target.value)} className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm">
                                                    <optgroup label="Comparison">
                                                        <option value="eq">== (Equals)</option>
                                                        <option value="neq">!= (Not Equals)</option>
                                                        <option value="gt">&gt; (Greater Than)</option>
                                                        <option value="lt">&lt; (Less Than)</option>
                                                        <option value="gte">≥ (Greater or Equal)</option>
                                                        <option value="lte">≤ (Less or Equal)</option>
                                                    </optgroup>
                                                    <optgroup label="Text Matching">
                                                        <option value="contains">Contains</option>
                                                        <option value="not_contains">Not Contains</option>
                                                        <option value="starts_with">Starts With</option>
                                                        <option value="regex">Regex Match</option>
                                                    </optgroup>
                                                    <optgroup label="List">
                                                        <option value="in">In (comma-separated)</option>
                                                        <option value="not_in">Not In</option>
                                                    </optgroup>
                                                    <optgroup label="AI Semantic">
                                                        <option value="llm_evaluate">LLM Evaluate (AI check)</option>
                                                    </optgroup>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground mb-1 block">Value</label>
                                                <input required value={cond.value} onChange={e => updateCondition(i, 'value', e.target.value)} type="text" className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm"
                                                    placeholder={cond.operator === 'llm_evaluate' ? 'e.g. contains confidential data' : cond.field.startsWith('output') ? 'e.g. sensitive keyword' : 'e.g. high'} />
                                            </div>
                                            <button type="button" onClick={() => removeCondition(i)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors" title="Remove condition">
                                                <IconX size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="p-4 bg-secondary rounded-lg border border-border space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Actions</h4>
                                        <button type="button" onClick={addAction} className="text-xs text-slate-800 hover:text-zinc-900 font-medium">+ Add Action</button>
                                    </div>
                                    {actions.map((act, i) => (
                                        <div key={i} className="space-y-2 bg-white border border-border rounded-lg p-3">
                                            <div className="flex items-end gap-3">
                                                <div className="flex-1">
                                                    <label className="text-xs text-muted-foreground mb-1 block">Action Type</label>
                                                    <select value={act.type} onChange={e => updateAction(i, 'type', e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm">
                                                        <option value="require_approval">🚨 Require Explicit Approval</option>
                                                        <option value="notify_email">✉ Notify via Email</option>
                                                        <option value="block">⛔ Block Decision</option>
                                                        <option value="auto_approve">✓ Auto-Approve</option>
                                                        <option value="add_tag"> Add Tag</option>
                                                        <option value="set_review_state">⚙ Set Review State</option>
                                                        <option value="notify_webhook">🔗 Notify via Webhook</option>
                                                    </select>
                                                </div>
                                                <button type="button" onClick={() => removeAction(i)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors" title="Remove action">
                                                    <IconX size={16} />
                                                </button>
                                            </div>
                                            {/* Conditional fields based on action type */}
                                            {act.type === 'notify_email' && (
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Email Recipients (comma-separated)</label>
                                                    <input value={act.email} onChange={e => updateAction(i, 'email', e.target.value)} type="text" className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm" placeholder="admin@company.com, compliance@company.com" />
                                                </div>
                                            )}
                                            {act.type === 'add_tag' && (
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Tag Name</label>
                                                    <input value={act.tag_name} onChange={e => updateAction(i, 'tag_name', e.target.value)} type="text" className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm" placeholder="e.g. high-risk, needs-review, pii-detected" />
                                                </div>
                                            )}
                                            {act.type === 'notify_webhook' && (
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Webhook URL</label>
                                                    <input value={act.webhook_url} onChange={e => updateAction(i, 'webhook_url', e.target.value)} type="url" className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm" placeholder="https://hooks.slack.com/services/..." />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <label className="text-sm font-medium text-foreground">Raw JSON Definition</label>
                                <textarea
                                    value={jsonInput}
                                    onChange={e => setJsonInput(e.target.value)}
                                    className="w-full h-64 font-mono text-sm p-4 bg-background text-emerald-400 border border-border rounded-lg focus:ring-1 focus:ring-emerald-500"
                                />
                                <div className="text-xs text-muted-foreground space-y-1 bg-secondary p-3 rounded-lg border border-border">
                                    <p className="font-semibold text-foreground mb-1">Documentation</p>
                                    <p>Ensure the JSON matches the GovernancePolicy schema. <a href="/docs/governance" className="text-slate-700 hover:underline">View syntax docs.</a></p>
                                    <p><strong>Supported Fields:</strong> <code>risk_level</code>, <code>system_name</code>, <code>output</code>, <code>output.answer</code>, <code>input.query</code>, <code>metadata.confidence</code></p>
                                    <p><strong>Supported Operators:</strong> <code>eq</code>, <code>neq</code>, <code>contains</code>, <code>not_contains</code>, <code>in</code>, <code>gt</code>, <code>lt</code>, <code>regex</code>, <code>llm_evaluate</code></p>
                                    <p><strong>Action Types:</strong> <code>require_approval</code>, <code>notify_email</code>, <code>block</code>, <code>auto_approve</code>, <code>add_tag</code>, <code>notify_webhook</code></p>
                                    <p><strong>Semantic Rules:</strong> Use <code>llm_evaluate</code> operator for AI-powered content checks.</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <button type="submit" className="bg-slate-800 text-white hover:bg-slate-900 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                                Save Rule
                            </button>
                        </div>
                    </form>
                </GlazedCard>
            )}

            {/* Policies List */}
            <div className="space-y-4">
                {policies.length === 0 && !loading && !isCreating ? (
                    <div className="p-12 text-center border border-border rounded-xl bg-card">
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                            <IconShieldCheck className="text-muted-foreground" size={24} />
                        </div>
                        <h3 className="text-lg font-medium">No governance rules yet</h3>
                        <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
                            Create rules to automatically flag, block, or approve AI decisions based on their metadata, content, and risk scores.
                        </p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="mt-4 text-slate-800 text-sm font-medium hover:underline"
                        >
                            Create your first rule &rarr;
                        </button>
                    </div>
                ) : (
                    policies.map(policy => (
                        <div key={policy.policy_id} className={cn(
                            "p-5 rounded-xl border transition-all",
                            policy.enabled
                                ? "bg-card border-border"
                                : "bg-secondary border-border opacity-75"
                        )}>
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{policy.name}</h3>
                                        <span className={cn(
                                            "text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold",
                                            policy.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-foreground"
                                        )}>
                                            {policy.enabled ? 'Active' : 'Disabled'}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-indigo-100 text-indigo-700">
                                            {policy.project_id ? (projects.find(p => p.id === policy.project_id)?.name || policy.project_id.slice(0, 8)) : 'Global'}
                                        </span>
                                    </div>
                                    {policy.description && <p className="text-sm text-muted-foreground">{policy.description}</p>}
                                    <p className="text-xs text-muted-foreground font-mono mt-2">ID: {policy.policy_id}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {(userRole === 'owner' || userRole === 'admin') && (
                                        <>
                                            <button
                                                onClick={() => handleToggle(policy.policy_id, policy.enabled)}
                                                className="p-2 text-muted-foreground hover:text-slate-800 transition-colors"
                                                title={policy.enabled ? "Disable Rule" : "Enable Rule"}
                                            >
                                                {policy.enabled ? <IconToggleRight size={24} className="text-emerald-500" /> : <IconToggleLeft size={24} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(policy.policy_id)}
                                                className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                                                title="Delete Rule"
                                            >
                                                <IconTrash size={20} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-secondary p-3 rounded-lg border border-border">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Conditions</h4>
                                    <ul className="space-y-1 text-sm">
                                        {policy.conditions.map((c, i) => (
                                            <li key={i} className="flex gap-2 items-center">
                                                <code className="text-slate-800 font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded">{c.field}</code>
                                                <span className="text-muted-foreground text-xs">{c.operator}</span>
                                                <code className="text-foreground font-mono text-xs">{typeof c.value === 'string' && c.value.length > 40 ? c.value.substring(0, 40) + '...' : c.value}</code>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-secondary p-3 rounded-lg border border-border">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Actions</h4>
                                    <ul className="space-y-1 text-sm">
                                        {policy.actions.map((a: any, i) => {
                                            const params = a.parameters || {};
                                            return (
                                                <li key={i} className="flex items-center gap-2">
                                                    {actionIcons[a.type] || <IconAlertTriangle size={14} className="text-amber-500" />}
                                                    <span className="font-medium">{actionLabels[a.type] || a.type.replace(/_/g, ' ')}</span>
                                                    {a.type === 'notify_email' && params.email && (
                                                        <span className="text-xs text-muted-foreground">&rarr; {params.email}</span>
                                                    )}
                                                    {a.type === 'add_tag' && params.tag_name && (
                                                        <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">{params.tag_name}</span>
                                                    )}
                                                    {a.type === 'notify_webhook' && params.url && (
                                                        <span className="text-xs text-muted-foreground truncate w-32">&rarr; {params.url}</span>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
