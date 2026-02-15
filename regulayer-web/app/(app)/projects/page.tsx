'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    IconFolder,
    IconPlus,
    IconCopy,
    IconCheck,
    IconKey,
    IconLoader2,
    IconDotsVertical,
    IconCalendar,
    IconSearch,
    IconFilter
} from '@tabler/icons-react';
import { getMe, getProjects, createProject, Project } from '@/lib/api';
import { GlazedCard } from '@/components/ui/glazed-card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// Project Card
// ============================================================

function ProjectCard({ project }: { project: Project }) {
    const [copied, setCopied] = useState(false);

    const copyUrl = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(project.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <GlazedCard className="group relative p-6 hover:border-indigo-500/30 transition-all duration-300">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800">
                    <IconDotsVertical size={16} />
                </button>
            </div>

            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <IconFolder className="w-6 h-6 text-indigo-500" />
                </div>
            </div>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-indigo-400 transition-colors">
                {project.name}
            </h3>

            <div className="space-y-3">
                <div className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                    <IconKey size={14} className="text-zinc-400" />
                    <code className="text-xs font-mono text-zinc-600 dark:text-zinc-400 flex-1 truncate">
                        {project.id}
                    </code>
                    <button
                        onClick={copyUrl}
                        className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                        title="Copy Project ID"
                    >
                        {copied ? <IconCheck size={14} className="text-emerald-500" /> : <IconCopy size={14} className="text-zinc-400" />}
                    </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
                    <IconCalendar size={14} />
                    <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        </GlazedCard>
    );
}

// ============================================================
// Create Project Modal
// ============================================================

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <GlazedCard className="w-full max-w-md p-6 bg-zinc-950 border-zinc-800">
                <h2 className="text-xl font-bold text-white mb-4">Create New Project</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Project Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="e.g. Production Environment"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading && <IconLoader2 className="animate-spin" size={16} />}
                            Create Project
                        </button>
                    </div>
                </form>
            </GlazedCard>
        </div>
    );
}

// ============================================================
// Main Projects Page
// ============================================================

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const me = await getMe();
            if (me.data?.org) {
                const res = await getProjects(me.data.org.id);
                if (res.data) setProjects(res.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (name: string) => {
        try {
            const me = await getMe();
            if (me.data?.org) {
                await createProject(me.data.org.id, name);
                await loadProjects();
                setShowCreate(false);
            }
        } catch (e) {
            alert('Failed to create project');
        }
    };

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                        Projects
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Manage your environments and API scopes.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <IconPlus size={18} />
                        New Project
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-2 rounded-xl">
                <div className="relative flex-1">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="w-full bg-transparent border-none focus:ring-0 pl-10 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                    />
                </div>
                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    <IconFilter size={16} />
                    Filters
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 animate-pulse" />
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                        <IconFolder size={32} className="text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">No projects yet</h3>
                    <p className="text-zinc-500 mb-6 max-w-sm mx-auto">Create your first project to start generating keys and recording decisions.</p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg inline-flex items-center gap-2"
                    >
                        <IconPlus size={18} />
                        Create Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}

                    {/* Add Project Card */}
                    <button
                        onClick={() => setShowCreate(true)}
                        className="group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-300 h-full min-h-[200px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-indigo-500/10 flex items-center justify-center mb-3 transition-colors">
                            <IconPlus className="w-6 h-6 text-zinc-400 group-hover:text-indigo-500" />
                        </div>
                        <span className="font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Create New Project</span>
                    </button>
                </div>
            )}

            {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
        </div>
    );
}
