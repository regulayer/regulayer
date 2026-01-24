'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    FolderOpen, Plus, Copy, CheckCircle,
    Key, ExternalLink, ChevronRight
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface Project {
    id: string;
    name: string;
    createdAt: string;
    decisionsCount: number;
    ingestionUrl: string;
}

// ============================================================
// Project Card
// ============================================================

function ProjectCard({ project }: { project: Project }) {
    const [copied, setCopied] = useState(false);

    const copyUrl = () => {
        navigator.clipboard.writeText(project.ingestionUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                        <FolderOpen className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">{project.name}</h3>
                        <p className="text-xs text-slate-500 font-mono">{project.id}</p>
                    </div>
                </div>
                <Link href={`/projects/${project.id}/keys`} className="text-primary-600 hover:underline text-sm flex items-center gap-1">
                    <Key className="w-4 h-4" />
                    API Keys
                </Link>
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Decisions</span>
                    <span className="text-slate-900">{project.decisionsCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Created</span>
                    <span className="text-slate-900">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-2">Ingestion URL</p>
                <div className="flex items-center gap-2">
                    <code className="text-xs text-slate-700 flex-1 truncate">{project.ingestionUrl}</code>
                    <button onClick={copyUrl} className="text-slate-400 hover:text-slate-600">
                        {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Create Project Modal
// ============================================================

function CreateProjectModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
    const [name, setName] = useState('');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Create Project</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Project Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., Production ML"
                    />
                </div>

                <div className="bg-slate-50 rounded-lg p-3 mb-6">
                    <p className="text-xs text-slate-600">
                        Projects organize your decision records. Each project has its own API keys and usage limits.
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
                        onClick={() => onCreate(name)}
                        disabled={!name.trim()}
                        className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                        Create Project
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Main Projects Page
// ============================================================

export default function ProjectsPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [projects] = useState<Project[]>([
        {
            id: 'proj_abc123',
            name: 'Production ML',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            decisionsCount: 45823,
            ingestionUrl: 'https://api.regulayer.io/v1/ingest/proj_abc123'
        },
        {
            id: 'proj_def456',
            name: 'Staging',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            decisionsCount: 1247,
            ingestionUrl: 'https://api.regulayer.io/v1/ingest/proj_def456'
        },
        {
            id: 'proj_ghi789',
            name: 'Demo Environment',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            decisionsCount: 89,
            ingestionUrl: 'https://api.regulayer.io/v1/ingest/proj_ghi789'
        },
    ]);

    const handleCreate = (name: string) => {
        // In production, call POST /v1/projects
        console.log('Creating project:', name);
        setShowCreateModal(false);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
                        <p className="text-slate-600">Organize your decision recording systems</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Project
                    </button>
                </div>

                {/* Important Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 text-sm">
                        <strong>Note:</strong> You can create and organize projects, but you cannot edit or delete decision history.
                    </p>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>

                {/* Footer Disclaimer */}
                <p className="text-center text-xs text-slate-400 mt-8">
                    Regulayer interfaces do not modify cryptographic records.
                </p>
            </div>

            {showCreateModal && (
                <CreateProjectModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreate}
                />
            )}
        </div>
    );
}
