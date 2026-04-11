'use client';

import { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, ArrowUpRight, Loader2, ShieldCheck, Zap, Clock, Calendar } from 'lucide-react';
import { getUsage, getDailyUsage, getMe, UsageStats, DailyUsage } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default function UsagePage() {
    const [stats, setStats] = useState<UsageStats | null>(null);
    const [dailyData, setDailyData] = useState<DailyUsage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const me = await getMe();
            if (me.data?.org) {
                const orgId = me.data.org.id;
                const [usageRes, dailyRes] = await Promise.all([
                    getUsage(orgId),
                    getDailyUsage(orgId, 30)
                ]);
                if (usageRes.data) setStats(usageRes.data);
                if (dailyRes.data) setDailyData(Array.isArray(dailyRes.data) ? dailyRes.data : []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Compute derived stats
    const computedStats = useMemo(() => {
        if (!dailyData.length) return { avgPerDay: 0, peakDay: '-', peakCount: 0, totalDays: 0, lastActivity: '-' };

        const total = dailyData.reduce((sum, d) => sum + d.count, 0);
        const avgPerDay = Math.round(total / Math.max(dailyData.length, 1));
        const peak = dailyData.reduce((max, d) => d.count > max.count ? d : max, dailyData[0]);
        const lastActive = dailyData.filter(d => d.count > 0);
        const lastActivity = lastActive.length > 0
            ? new Date(lastActive[lastActive.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '-';

        return {
            avgPerDay,
            peakDay: new Date(peak.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            peakCount: peak.count,
            totalDays: dailyData.length,
            lastActivity
        };
    }, [dailyData]);

    // Fill in missing days for chart (last 30 days)
    const chartData = useMemo(() => {
        const days: { date: string; count: number; label: string }[] = [];
        const dailyMap = new Map(dailyData.map(d => [d.date, d.count]));

        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            days.push({ date: key, count: dailyMap.get(key) || 0, label });
        }
        return days;
    }, [dailyData]);

    const maxCount = Math.max(...chartData.map(d => d.count), 1);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-8">
                <div className="bg-red-50 p-4 rounded-lg text-red-800">
                    Failed to load usage data. Please try again later.
                </div>
            </div>
        );
    }

    const percentage = Math.min(100, (stats.used / stats.limit) * 100);
    const remaining = Math.max(0, stats.limit - stats.used);

    return (
        <div className="p-6 md:p-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Usage</h1>
                <p className="text-muted-foreground">Monitor your decision recording usage and quotas</p>
            </div>

            {/* Current Period */}
            <div className="bg-card rounded-xl border border-border p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Current Billing Period</h2>
                        <p className="text-sm text-muted-foreground">
                            {new Date(stats.period_start).toLocaleDateString()} - {new Date(stats.period_end).toLocaleDateString()}
                        </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${percentage > 90
                        ? 'bg-red-100 text-red-700'
                        : percentage > 70
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                        {percentage > 90 ? 'Near Limit' : percentage > 70 ? 'Moderate Use' : 'Within limits'}
                    </span>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Decisions Ingested</p>
                        <p className="text-3xl font-bold text-foreground">{stats.decision_count.toLocaleString()}</p>
                        <div className="mt-3">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Usage</span>
                                <span>{percentage.toFixed(1)}% of {stats.limit.toLocaleString()}</span>
                            </div>
                            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-amber-500' : 'bg-primary'}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Attested Decisions</p>
                        <p className="text-3xl font-bold text-foreground">
                            {stats.decision_count.toLocaleString()}
                        </p>
                        <div className="mt-3 flex items-center gap-1 text-sm text-green-600">
                            <ShieldCheck className="w-4 h-4" />
                            100% attestation rate
                        </div>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Remaining Quota</p>
                        <p className="text-3xl font-bold text-foreground">
                            {remaining.toLocaleString()}
                        </p>
                        <div className="mt-3 text-sm text-muted-foreground">
                            of {stats.limit.toLocaleString()} total
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Avg / Day</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{computedStats.avgPerDay}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Zap className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Peak Day</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{computedStats.peakCount}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{computedStats.peakDay}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Active Days</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{dailyData.filter(d => d.count > 0).length}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">of last 30 days</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Last Activity</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{computedStats.lastActivity}</p>
                </div>
            </div>

            {/* Daily Usage Chart */}
            <div className="bg-card rounded-xl border border-border p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-foreground">Daily Usage</h2>
                    <span className="text-xs text-muted-foreground font-medium">Last 30 days</span>
                </div>

                {chartData.every(d => d.count === 0) ? (
                    <div className="h-48 bg-secondary rounded-lg flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No decisions recorded in the last 30 days</p>
                            <p className="text-xs mt-1">Ingest decisions via the SDK to see activity here</p>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Y-axis labels */}
                        <div className="flex items-end gap-0.5" style={{ height: '200px' }}>
                            {chartData.map((day, i) => (
                                <div
                                    key={day.date}
                                    className="relative flex-1 group cursor-pointer"
                                    style={{ height: '100%' }}
                                >
                                    <div
                                        className="absolute bottom-0 left-0 right-0 mx-auto rounded-t transition-all duration-200 group-hover:opacity-90"
                                        style={{
                                            height: `${Math.max((day.count / maxCount) * 100, day.count > 0 ? 4 : 0)}%`,
                                            backgroundColor: day.count > 0 ? 'rgb(99 102 241)' : 'transparent',
                                            minHeight: day.count > 0 ? '3px' : 0,
                                            width: '80%',
                                            marginLeft: '10%'
                                        }}
                                    />
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-foreground text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        {day.label}: {day.count}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* X-axis labels (show every 5th) */}
                        <div className="flex gap-0.5 mt-2 border-t border-border pt-2">
                            {chartData.map((day, i) => (
                                <div key={day.date} className="flex-1 text-center">
                                    {(i % 5 === 0 || i === chartData.length - 1) && (
                                        <span className="text-[10px] text-muted-foreground">{day.label.split(' ')[1]}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Quota Warnings */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-4">Quota Alerts</h2>

                <div className="space-y-4">
                    {percentage > 90 ? (
                        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-medium text-red-800">Approaching Limit</p>
                                <p className="text-sm text-red-600 mt-0.5">
                                    You&apos;ve used {percentage.toFixed(0)}% of your monthly quota. Contact Sales for an enterprise plan to avoid disruption.
                                </p>
                            </div>
                        </div>
                    ) : percentage > 70 ? (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-medium text-amber-800">Moderate Usage</p>
                                <p className="text-sm text-amber-600 mt-0.5">
                                    You&apos;ve used {percentage.toFixed(0)}% of your monthly quota. Consider upgrading if usage continues to grow.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                            <ShieldCheck className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-medium text-green-800">All Clear</p>
                                <p className="text-sm text-green-600 mt-0.5">
                                    You&apos;re well within your plan limits. {remaining.toLocaleString()} decisions remaining this period.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-foreground">Upcoming Pro Tier</p>
                            <p className="text-sm text-muted-foreground">Pro plans with up to 50,000 decisions/mo are coming soon.</p>
                        </div>
                        <a href="/billing" className="flex items-center gap-1 text-primary hover:text-brand-700 font-medium text-sm">
                            View plans <ArrowUpRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

