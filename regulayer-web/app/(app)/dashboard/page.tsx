"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe, getProjects, getUsage, getDailyUsage, getAuditLogs, getIncidents, DailyUsage } from "@/lib/api";
import {
    IconShieldCheck, IconShieldLock, IconClock, IconAlertTriangle,
    IconAlertCircle, IconPlus, IconBook, IconCode, IconKey, IconArrowRight
} from "@tabler/icons-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
    const router = useRouter();
    const { data: me } = useQuery({ queryKey: ["me"], queryFn: getMe, refetchInterval: 3000 });
    const orgId = me?.data?.org?.id;
    const orgName = me?.data?.org?.name || "Organization";

    const { data: projects, isLoading: projectsLoading } = useQuery({
        queryKey: ["projects", orgId], queryFn: () => getProjects(orgId!), enabled: !!orgId, refetchInterval: 3000
    });
    const { data: usage } = useQuery({
        queryKey: ["usage", orgId], queryFn: () => getUsage(orgId!), enabled: !!orgId, refetchInterval: 3000
    });
    const { data: dailyUsage } = useQuery({
        queryKey: ["dailyUsage", orgId], queryFn: () => getDailyUsage(orgId!, 30), enabled: !!orgId, refetchInterval: 3000
    });
    const { data: auditLogs } = useQuery({
        queryKey: ["audit", orgId], queryFn: () => getAuditLogs(orgId!), enabled: !!orgId, refetchInterval: 3000
    });
    const { data: incidents } = useQuery({
        queryKey: ["incidents", orgId], queryFn: () => getIncidents(orgId!), enabled: !!orgId, refetchInterval: 3000
    });

    const hasProjects = projects?.data && projects.data.length > 0;
    const activeIncidents = incidents?.data?.filter((i: any) => i.status === "open").length || 0;
    const totalDecisions = usage?.data?.decision_count || 0;
    const sealedPercent = totalDecisions > 0 ? 100 : 0;
    const planLimit = usage?.data?.limit || 1000;
    const usagePercent = Math.min(100, (totalDecisions / planLimit) * 100);
    const integrityHealthy = activeIncidents === 0;

    const chartData = useMemo(() => {
        const raw: DailyUsage[] = Array.isArray(dailyUsage?.data) ? dailyUsage.data : [];
        const dailyMap = new Map(raw.map(d => [d.date, d.count]));
        const days: { date: string; count: number; label: string }[] = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            days.push({ date: key, count: dailyMap.get(key) || 0, label });
        }
        return days;
    }, [dailyUsage]);
    const chartMax = Math.max(...chartData.map(d => d.count), 1);

    const recentLogs = (auditLogs?.data || []).slice(0, 5);

    const [dismissedWelcome, setDismissedWelcome] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined' && localStorage.getItem('regulayer_welcome_dismissed')) {
            setDismissedWelcome(true);
        }
    }, []);

    const handleDismiss = () => {
        localStorage.setItem('regulayer_welcome_dismissed', 'true');
        setDismissedWelcome(true);
    };

    /* ── Empty state ── */
    if (!projectsLoading && !hasProjects && !dismissedWelcome) {
        return (
            <div className="p-6 md:p-8 min-h-[80vh] flex flex-col justify-center max-w-2xl relative">
                <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Welcome, {orgName}.</h1>
                <p className="text-sm text-muted-foreground mb-8">Your trust infrastructure is ready. Start by creating a project.</p>

                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                    {[
                        { icon: <IconPlus className="w-4 h-4" />, title: "Create Project", desc: "Define your first AI system.", href: "/projects" },
                        { icon: <IconKey className="w-4 h-4" />, title: "Generate API Key", desc: "Get your SDK credentials.", href: "/api-keys" },
                        { icon: <IconBook className="w-4 h-4" />, title: "Read the Docs", desc: "Integrate in 5 minutes.", href: "/docs" },
                    ].map((c, i) => (
                        <Link key={i} href={c.href} className="bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-glow-sm hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 group">
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground mb-3">
                                {c.icon}
                            </div>
                            <h3 className="text-sm font-semibold text-foreground mb-0.5">{c.title}</h3>
                            <p className="text-xs text-muted-foreground">{c.desc}</p>
                        </Link>
                    ))}
                </div>

                <div className="bg-card border border-border rounded-xl p-5 mb-8">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.1em] mb-3">Quick setup</p>
                    <pre className="!bg-primary !text-primary-foreground !text-[12px] !leading-relaxed !rounded-lg !p-4 !border-0">{`pip install regulayer

from regulayer import Regulayer
rl = Regulayer("rl_sk_live_...")

with rl.trace("my-model") as t:
    result = model.predict(data)
    t.record(input=data, output=result)`}</pre>
                </div>

                <div className="flex items-center gap-4">
                    <Button onClick={handleDismiss} variant="outline" className="rounded-full px-6 font-medium shadow-sm hover:bg-secondary">
                        Continue to Dashboard <IconArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        );
    }

    /* ── Main dashboard ── */
    return (
        <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-foreground tracking-tight">{orgName}</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">Dashboard overview</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="h-9 text-xs rounded-lg border-border hover:bg-accent/10">
                        Date Range: 30D
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 text-xs rounded-lg border-border hover:bg-accent/10">
                        Project: All
                    </Button>
                    <Button size="sm" className="h-9 text-xs rounded-lg" onClick={() => router.push("/projects")}>
                        <IconPlus className="w-3.5 h-3.5 mr-1" /> New Project
                    </Button>
                </div>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                {[
                    { label: "Total Decisions", value: totalDecisions.toLocaleString(), sub: "This period", icon: <IconShieldCheck className="w-4 h-4" />, href: "/decisions" },
                    { label: "Sealed", value: `${sealedPercent}%`, sub: `${totalDecisions} sealed`, icon: <IconShieldLock className="w-4 h-4" />, href: "/decisions" },
                    { label: "Pending Review", value: "0", sub: "Governance queue", icon: <IconClock className="w-4 h-4" />, href: "/governance" },
                    { label: "Flagged", value: "0", sub: "Requires attention", icon: <IconAlertTriangle className="w-4 h-4" />, href: "/governance" },
                    { label: "Integrity", value: integrityHealthy ? "Healthy" : "Degraded", sub: integrityHealthy ? "All chains OK" : `${activeIncidents} incident(s)`, icon: <IconShieldCheck className="w-4 h-4" />, href: "/alerts", ok: integrityHealthy },
                    { label: "Incidents", value: activeIncidents.toString(), sub: activeIncidents > 0 ? "Needs action" : "None", icon: <IconAlertCircle className="w-4 h-4" />, href: "/alerts" },
                ].map((m, i) => (
                    <Link key={i} href={m.href} className="bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-glow-sm hover:scale-[1.02] hover:border-primary/30 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground font-medium">{m.label}</span>
                            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                                {m.icon}
                            </div>
                        </div>
                        <div className="text-xl font-bold text-foreground tracking-tight">{m.value}</div>
                        <span className="text-[11px] text-muted-foreground">{m.sub}</span>
                    </Link>
                ))}
            </div>

            {/* Chart + Usage */}
            <div className="grid lg:grid-cols-[1fr_320px] gap-4 mb-6">
                <div className="bg-card border border-border rounded-2xl shadow-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-foreground">Decisions (30 days)</h3>
                    </div>
                    <div className="h-44 w-full">
                        {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="label" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                    minTickGap={20}
                                />
                                <RechartsTooltip
                                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                    itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 600 }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="hsl(var(--primary))" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorCount)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Usage meter */}
                <div className="bg-card border border-border rounded-2xl shadow-card p-6">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Usage</h3>
                    <div className="mb-3">
                        <div className="flex items-baseline justify-between mb-1.5">
                            <span className="text-2xl font-bold text-foreground">{totalDecisions.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground">of {planLimit.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${usagePercent}%` }} />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1.5">{usagePercent.toFixed(1)}% of monthly allocation</p>
                    </div>
                    <div className="border-t border-border pt-3 mt-3">
                        <Link href="/billing" className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 flex items-center gap-1">
                            Manage plan <IconArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent audit logs */}
            <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Recent Audit Logs</h3>
                    <Link href="/audit" className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150">View all &rarr;</Link>
                </div>
                {recentLogs.length > 0 ? (
                    <div className="divide-y divide-border">
                        {recentLogs.map((log: any, i: number) => (
                            <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors duration-150">
                                <div className="flex items-center gap-3 min-w-0">
                                    <code className="text-[11px] text-muted-foreground font-mono shrink-0">{log.id?.slice(0, 8) || "—"}</code>
                                    <span className="text-sm text-foreground truncate">{log.action || log.event_type || "Event"}</span>
                                </div>
                                <span className="text-[11px] text-muted-foreground shrink-0">
                                    {log.created_at ? new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "—"}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-5 py-8 text-center">
                        <p className="text-sm text-muted-foreground">No audit logs yet. Seal your first decision to see activity here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
