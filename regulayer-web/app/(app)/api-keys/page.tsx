'use client';

import { useState, useEffect } from 'react';
import {
    IconKey,
    IconPlus,
    IconCopy,
    IconTrash,
    IconAlertTriangle,
    IconLoader2,
    IconEye,
    IconEyeOff,
    IconCheck
} from '@tabler/icons-react';
import { getMe, getProjects, getApiKeys, ApiKey, Project, createApiKey, revokeApiKey } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { GlazedCard } from '@/components/ui/glazed-card';
import { cn } from '@/lib/utils'; // Assuming cn utility exists

export const dynamic = 'force-dynamic';

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [creating, setCreating] = useState(false);
    const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [currentUserRole, setCurrentUserRole] = useState<string>('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const me = await getMe();
            if (me.data?.org) {
                setCurrentUserRole(me.data.role || 'member');
                const projectsRes = await getProjects(me.data.org.id);
                if (projectsRes.data) {
                    setProjects(projectsRes.data);
                    const allKeys: ApiKey[] = [];
                    for (const project of projectsRes.data) {
                        const keysRes = await getApiKeys(project.id);
                        if (keysRes.data) {
                            allKeys.push(...keysRes.data.map(k => ({ ...k, _projectName: project.name })));
                        }
                    }
                    setKeys(allKeys);
                    if (projectsRes.data.length > 0) {
                        setSelectedProjectId(projectsRes.data[0].id);
                    }
                }
            }
        } catch (e) {
            console.error("Failed to load keys", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKey = async () => {
        if (projects.length === 0) return;
        setCreating(true);
        setNewKeySecret(null);

        if (!selectedProjectId) {
            alert("No project selected");
            setCreating(false);
            return;
        }

        try {
            const res = await createApiKey(selectedProjectId, {
                name: `New Key ${keys.length + 1}`,
                scopes: ["ingest"]
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (res.data && (res.data as any).key_secret) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setNewKeySecret((res.data as any).key_secret);
                loadData();
            }
        } catch {
            alert("Failed to create key");
        } finally {
            setCreating(false);
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm("Are you sure you want to revoke this key?")) return;
        try {
            await revokeApiKey(id);
            loadData();
        } catch {
            alert("Failed to revoke key");
        }
    };

    if (loading) {
        return (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-border border-t-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 pb-20 space-y-8 text-foreground">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        API Keys
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Securely access the Regulayer SDK and API for a specific project.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        disabled={projects.length === 0}
                        className="h-10 px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:bg-slate-700/50"
                    >
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                        <button
                            onClick={handleCreateKey}
                            disabled={creating || projects.length === 0 || !selectedProjectId}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium shadow-lg bg-slate-700/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            {creating ? <IconLoader2 className="animate-spin" size={18} /> : <IconPlus size={18} />}
                            Create Key
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {newKeySecret && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        className="overflow-hidden"
                    >
                        <GlazedCard className="border-amber-500/50 bg-primary/10 p-6 relative">
                            <h3 className="text-lg font-bold text-amber-600 mb-2 flex items-center gap-2">
                                <IconKey size={20} />
                                New API Key Created
                            </h3>
                            <p className="text-sm text-amber-700/80 mb-4 max-w-xl">
                                This is the only time you will see this key. Please copy it and store it securely.
                            </p>

                            <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg border border-warning/30">
                                <code className="flex-1 font-mono text-lg text-amber-900 break-all">
                                    {newKeySecret}
                                </code>
                                <CopyButton text={newKeySecret} />
                            </div>

                            <button
                                onClick={() => setNewKeySecret(null)}
                                className="mt-4 text-xs text-amber-700 hover:text-amber-900 underline font-semibold"
                            >
                                I have saved this key
                            </button>
                        </GlazedCard>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-4">
                {keys.length === 0 ? (
                    <div className="text-center py-20 bg-background rounded-2xl border border-dashed border-border">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                            <IconKey size={32} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">No API keys found</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Create a key to authenticate your SDK integration.</p>
                    </div>
                ) : keys.map((key) => (
                    <GlazedCard key={key.id} className="flex items-center justify-between p-4 group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                                <IconKey size={20} />
                            </div>
                            <div>
                                <h3 className="font-medium text-foreground">{key.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 text-zinc-50 bg-slate-800 rounded text-xs font-medium border text-zinc-200">
                                        {(key as any)._projectName || 'Unknown Project'}
                                    </span>
                                    <code className="text-xs bg-secondary px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                                        {key.key_prefix}••••••••
                                    </code>
                                    <span className="text-xs text-muted-foreground">
                                        Created {new Date(key.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {key.scopes.map((scope) => (
                                <span key={scope} className="px-2 py-0.5 bg-secondary text-foreground rounded text-xs font-medium uppercase tracking-wider border border-border">
                                    {scope}
                                </span>
                            ))}
                            <div className="h-4 w-px bg-slate-200 mx-2" />
                            {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                                <button
                                    onClick={() => handleRevoke(key.id)}
                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Revoke Key"
                                >
                                    <IconTrash size={18} />
                                </button>
                            )}
                        </div>
                    </GlazedCard>
                ))}
            </div>
        </div>
    );
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="p-2 text-muted-foreground hover:text-emerald-500 transition-colors"
        >
            {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
        </button>
    );
}

