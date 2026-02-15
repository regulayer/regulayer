"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    IconSearch,
    IconFilter,
    IconDownload,
    IconRefresh,
    IconCheck,
    IconAlertTriangle,
    IconClock,
    IconHash
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { getMe, getProjects, getDecisions, UserWithOrg, Project, Decision } from "@/lib/api";

export default function DecisionsPage() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserWithOrg | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                // 1. Get User & Org
                const userRes = await getMe();
                if (userRes.error || !userRes.data) {
                    throw new Error(userRes.error || "Failed to fetch user profile");
                }
                setUser(userRes.data);

                // 2. Get Projects
                const projectsRes = await getProjects(userRes.data.organization_id);
                if (projectsRes.error || !projectsRes.data) {
                    throw new Error(projectsRes.error || "Failed to fetch projects");
                }
                setProjects(projectsRes.data);

                if (projectsRes.data.length > 0) {
                    const firstProjectId = projectsRes.data[0].id;
                    setSelectedProjectId(firstProjectId);

                    // 3. Get Decisions for first project
                    await fetchDecisions(firstProjectId);
                } else {
                    setLoading(false);
                }
            } catch (err: any) {
                console.error("Error fetching data:", err);
                setError(err.message || "An unexpected error occurred");
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const fetchDecisions = async (projectId: string) => {
        setLoading(true);
        try {
            const res = await getDecisions(projectId);
            if (res.error) {
                setError(res.error);
            } else {
                setDecisions(res.data || []);
                setError("");
            }
        } catch (err) {
            console.error("Error fetching decisions:", err);
            setError("Failed to load decisions");
        } finally {
            setLoading(false);
        }
    };

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const projectId = e.target.value;
        setSelectedProjectId(projectId);
        fetchDecisions(projectId);
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto min-h-screen pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                        Decisions
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Immutable record of all AI decisions and their verification status.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {projects.length > 0 && (
                        <div className="relative group">
                            <select
                                value={selectedProjectId || ""}
                                onChange={handleProjectChange}
                                className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-w-[200px]"
                            >
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => selectedProjectId && fetchDecisions(selectedProjectId)}
                        className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <IconRefresh size={20} />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg shadow-indigo-500/20 font-medium">
                        <IconDownload size={18} />
                        <span className="hidden sm:inline">Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm">
                <div className="md:col-span-6 relative">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by ID, hash, or tags..."
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                </div>
                <div className="md:col-span-6 flex gap-3 justify-end">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                        <IconFilter size={16} />
                        Filter
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-zinc-500 animate-pulse">Loading secure records...</p>
                    </div>
                ) : error ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                            <IconAlertTriangle size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Failed to load decisions</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 max-w-md">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity"
                        >
                            Retry
                        </button>
                    </div>
                ) : decisions.length === 0 ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-400 mb-2">
                            <IconHash size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No decisions recorded yet</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                            Connect your AI system using the SDK to start logging immutable decisions.
                        </p>
                        <Link
                            href="/docs"
                            className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors inline-block"
                        >
                            View Documentation
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Decision ID</th>
                                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Status</th>
                                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Timestamp</th>
                                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Model / Context</th>
                                    <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {decisions.map((decision) => (
                                    <tr
                                        key={decision.decision_id}
                                        className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                                                    <IconHash size={14} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 w-24" title={decision.decision_id}>
                                                        {decision.decision_id.substring(0, 8)}...
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                <IconCheck size={12} />
                                                Verified
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                                                <IconClock size={14} className="text-zinc-400" />
                                                {new Date(decision.server_timestamp).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                {decision.metadata?.model || "Unknown Model"}
                                            </div>
                                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                                Context: {Object.keys(decision.context || {}).length} keys
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Link
                                                href={`/decisions/${decision.decision_id}`}
                                                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination / Footer */}
            {!loading && decisions.length > 0 && (
                <div className="flex justify-between items-center text-sm text-zinc-500 dark:text-zinc-400 px-2">
                    <p>Showing {decisions.length} results</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800">Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}
