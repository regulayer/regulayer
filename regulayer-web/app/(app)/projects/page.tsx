'use client';

import { useState } from 'react';
import { FolderKanban, Plus, Copy, MoreVertical } from 'lucide-react';

export default function ProjectsPage() {
    const [projects] = useState([
        { id: 'proj_1a2b3c', name: 'Production', environment: 'prod', decisions: 25000, created: '2024-01-15' },
        { id: 'proj_4d5e6f', name: 'Staging', environment: 'staging', decisions: 3451, created: '2024-01-15' },
    ]);

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
                    <p className="text-slate-600">Manage your decision recording projects</p>
                </div>
                <button className="bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-500 transition flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    New Project
                </button>
            </div>

            {/* Projects Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                <FolderKanban className="w-6 h-6 text-primary-600" />
                            </div>
                            <button className="p-1 hover:bg-slate-100 rounded">
                                <MoreVertical className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <h3 className="text-lg font-semibold text-slate-900 mb-1">{project.name}</h3>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${project.environment === 'prod'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                            {project.environment}
                        </span>

                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-slate-500">Project ID</span>
                                <button className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-mono text-xs">
                                    {project.id}
                                    <Copy className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Total decisions</span>
                                <span className="font-medium text-slate-900">{project.decisions.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add Project Card */}
                <button className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-primary-400 hover:bg-primary-50 transition flex flex-col items-center justify-center min-h-[200px]">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                        <Plus className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-600">Create new project</p>
                    <p className="text-sm text-slate-400 mt-1">2 of 5 projects used</p>
                </button>
            </div>
        </div>
    );
}
