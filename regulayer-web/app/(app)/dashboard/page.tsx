"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe, getProjects } from "@/lib/api";
import { GlazedCard } from "@/components/ui/glazed-card";
import { MetricDisplay } from "@/components/ui/metric-display";
import { IconArrowUpRight, IconBox, IconCheck, IconClock, IconShieldCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
    const { data: me } = useQuery({ queryKey: ["me"], queryFn: getMe });
    const orgId = me?.data?.org?.id;
    const { data: projects } = useQuery({
        queryKey: ["projects", orgId],
        queryFn: () => orgId ? getProjects(orgId) : Promise.resolve({ data: [] }),
        enabled: !!orgId
    });

    // Mock data for "Recent Activity" visualization
    const activity = [
        { id: 1, action: "Hash Verified", project: "Quantum Core", time: "2m ago", status: "success" },
        { id: 2, action: "Model Registered", project: "Nexus AI", time: "15m ago", status: "success" },
        { id: 3, action: "Consistency Check", project: "System", time: "1h ago", status: "pending" },
    ];

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto text-zinc-900 dark:text-zinc-100">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Overview of your Regulayer trust infrastructure.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-lg bg-zinc-100 text-zinc-900 font-medium hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 transition-colors">
                        Documentation
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all">
                        New Project
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <GlazedCard>
                    <div className="flex justify-between items-start">
                        <div className="p-2 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500">
                            <IconShieldCheck size={24} />
                        </div>
                        <span className="text-xs font-mono text-zinc-400">LIVE</span>
                    </div>
                    <MetricDisplay label="Total Verifications" value={8432} trend={{ value: 12, isPositive: true }} className="mt-4" />
                </GlazedCard>

                <GlazedCard>
                    <div className="flex justify-between items-start">
                        <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-500">
                            <IconBox size={24} />
                        </div>
                    </div>
                    <MetricDisplay label="Active Projects" value={projects?.data?.length || 0} className="mt-4" />
                </GlazedCard>

                <GlazedCard>
                    <div className="flex justify-between items-start">
                        <div className="p-2 rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            <IconClock size={24} />
                        </div>
                    </div>
                    <MetricDisplay label="Uptime" value={99.9} className="mt-4" />
                </GlazedCard>

                <GlazedCard className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border-zinc-800">
                    <div className="h-full flex flex-col justify-between">
                        <div>
                            <p className="text-zinc-400 text-sm font-medium">System Status</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                <span className="font-semibold text-emerald-400">Operational</span>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-zinc-500 font-mono">
                            v2.4.0-stable
                        </div>
                    </div>
                </GlazedCard>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">Recent Activity</h2>
                    <div className="space-y-4">
                        {activity.map((item) => (
                            <GlazedCard key={item.id} className="p-4 flex items-center justify-between group cursor-pointer" hoverEffect={true}>
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center border",
                                        item.status === 'success'
                                            ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800"
                                            : "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800"
                                    )}>
                                        {item.status === 'success' ? <IconCheck size={18} /> : <IconClock size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.action}</p>
                                        <p className="text-xs text-zinc-500">{item.project}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-mono text-zinc-400">{item.time}</span>
                                    <IconArrowUpRight size={16} className="text-zinc-300 group-hover:text-zinc-600 dark:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                                </div>
                            </GlazedCard>
                        ))}
                    </div>
                </div>

                {/* Quick Actions / Integration */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">Quick Integration</h2>
                    <GlazedCard className="p-6">
                        <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Install SDK</h3>
                        <div className="bg-zinc-950 rounded-lg p-3 font-mono text-xs text-zinc-400 flex justify-between items-center group cursor-pointer hover:bg-zinc-900 transition-colors">
                            <span>npm install @regulayer/sdk</span>
                            <IconArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-zinc-500 mt-4">
                            Check our <a href="/docs" className="text-amber-600 hover:underline">documentation</a> for setup guides.
                        </p>
                    </GlazedCard>
                </div>
            </div>
        </div>
    );
}
