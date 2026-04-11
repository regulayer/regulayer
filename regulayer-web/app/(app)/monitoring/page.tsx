'use client';

import { useState, useEffect } from 'react';
import { IconActivityHeartbeat, IconPlus, IconTrendingUp, IconTrendingDown, IconMinus, IconAlertTriangle, IconCheck, IconX, IconRefresh } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { MonitoringPlan, MonitoringKPI, AISystem, getMonitoringPlans, saveMonitoringPlan, getAISystems } from '@/lib/api';

function generateHistory(baseValue: number, variance: number, days: number = 30): { date: string; value: number }[] {
    const history = [];
    for (let i = days; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        history.push({ date: d.toISOString().split('T')[0], value: Math.max(0, baseValue + (Math.random() - 0.5) * variance * 2) });
    }
    return history;
}

const DEFAULT_KPIS: Omit<MonitoringKPI, 'id' | 'history' | 'last_measured'>[] = [
    { name: 'Model Accuracy', metric_type: 'accuracy', current_value: 94.2, threshold_warning: 90, threshold_critical: 85, unit: '%', trend: 'stable' },
    { name: 'Bias Index', metric_type: 'bias', current_value: 0.12, threshold_warning: 0.15, threshold_critical: 0.25, unit: 'idx', trend: 'stable' },
    { name: 'Prediction Drift', metric_type: 'drift', current_value: 0.03, threshold_warning: 0.1, threshold_critical: 0.2, unit: 'Δ', trend: 'improving' },
    { name: 'Response Latency', metric_type: 'latency', current_value: 145, threshold_warning: 300, threshold_critical: 500, unit: 'ms', trend: 'stable' },
    { name: 'Error Rate', metric_type: 'error_rate', current_value: 2.1, threshold_warning: 5, threshold_critical: 10, unit: '%', trend: 'improving' },
];

export default function MonitoringPage() {
    const [plans, setPlans] = useState<MonitoringPlan[]>([]);
    const [systems, setSystems] = useState<AISystem[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedSystemId, setSelectedSystemId] = useState('');
    const [selectedPlanIdx, setSelectedPlanIdx] = useState(0);

    useEffect(() => {
        getMonitoringPlans().then(setPlans).catch(console.error);
        getAISystems().then(setSystems).catch(console.error);
    }, []);

    const handleCreate = () => {
        const sys = systems.find(s => s.id === selectedSystemId);
        if (!sys) return;
        const now = new Date().toISOString();
        const nextReview = new Date(); nextReview.setMonth(nextReview.getMonth() + 1);
        const plan: MonitoringPlan = {
            id: crypto.randomUUID(), system_id: sys.id, system_name: sys.name,
            kpis: DEFAULT_KPIS.map(k => ({
                ...k, id: crypto.randomUUID(), last_measured: now,
                history: generateHistory(k.current_value, k.current_value * 0.1),
            })),
            review_frequency: 'monthly', next_review_date: nextReview.toISOString(), alerts_enabled: true,
            created_at: now, updated_at: now,
        };
        saveMonitoringPlan(plan);
        getMonitoringPlans().then(setPlans).catch(console.error);
        setShowModal(false);
        setSelectedSystemId('');
    };

    const currentPlan = plans[selectedPlanIdx];

    const TREND_ICON: Record<string, React.ReactNode> = {
        improving: <IconTrendingUp size={14} className="text-emerald-500" />,
        stable: <IconMinus size={14} className="text-muted-foreground" />,
        degrading: <IconTrendingDown size={14} className="text-red-500" />,
    };

    const getKPIStatus = (kpi: MonitoringKPI): 'healthy' | 'warning' | 'critical' => {
        if (kpi.metric_type === 'accuracy') {
            if (kpi.current_value < kpi.threshold_critical) return 'critical';
            if (kpi.current_value < kpi.threshold_warning) return 'warning';
            return 'healthy';
        }
        if (kpi.current_value > kpi.threshold_critical) return 'critical';
        if (kpi.current_value > kpi.threshold_warning) return 'warning';
        return 'healthy';
    };

    const STATUS_STYLE = {
        healthy: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/5 dark:border-emerald-500/20' },
        warning: { dot: 'bg-amber-500 animate-pulse', bg: 'bg-amber-50 border-amber-200 dark:bg-amber-500/5 dark:border-amber-500/20' },
        critical: { dot: 'bg-red-500 animate-pulse', bg: 'bg-red-50 border-red-200 dark:bg-red-500/5 dark:border-red-500/20' },
    };

    const healthySystems = plans.filter(p => p.kpis.every(k => getKPIStatus(k) === 'healthy')).length;
    const warningSystems = plans.filter(p => p.kpis.some(k => getKPIStatus(k) === 'warning') && !p.kpis.some(k => getKPIStatus(k) === 'critical')).length;

    return (
        <div className="p-6 md:p-10 pb-20 space-y-6 text-foreground">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Post-Market Monitoring</h1>
                    <p className="text-muted-foreground text-sm">Real-time performance tracking for deployed AI systems — Article 72.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
                    <IconPlus size={16} /> Add Monitoring Plan
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Systems Monitored', value: plans.length, icon: <IconActivityHeartbeat size={18} />, color: 'text-foreground bg-secondary' },
                    { label: 'Healthy', value: healthySystems, icon: <IconCheck size={18} />, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' },
                    { label: 'Warning', value: warningSystems, icon: <IconAlertTriangle size={18} />, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10' },
                    { label: 'Next Review', value: currentPlan ? `${Math.max(0, Math.ceil((new Date(currentPlan.next_review_date).getTime() - Date.now()) / 86400000))}d` : '—', icon: <IconRefresh size={18} />, color: 'text-primary bg-primary/10' },
                ].map(s => (
                    <div key={s.label} className="bg-card border border-border rounded-2xl shadow-card p-5 hover:shadow-glow-sm hover:-translate-y-1 transition-all duration-300">
                        <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center mb-2', s.color)}>{s.icon}</div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{s.label}</p>
                        <p className="text-2xl font-bold mt-1">{s.value}</p>
                    </div>
                ))}
            </div>

            {plans.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl shadow-card p-20 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4"><IconActivityHeartbeat size={32} /></div>
                    <h3 className="text-lg font-medium">No monitoring plans</h3>
                    <p className="text-muted-foreground mt-1 max-w-sm">Set up monitoring for your deployed AI systems to track performance, bias, and drift.</p>
                    <button onClick={() => setShowModal(true)} className="mt-4 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm"><IconPlus size={16} className="inline mr-1" /> Add Plan</button>
                </div>
            ) : (
                <>
                    {/* Plan Tabs */}
                    {plans.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto">
                            {plans.map((plan, idx) => (
                                <button key={plan.id} onClick={() => setSelectedPlanIdx(idx)}
                                    className={cn("px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                                        selectedPlanIdx === idx ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
                                    {plan.system_name}
                                </button>
                            ))}
                        </div>
                    )}

                    {currentPlan && (
                        <div className="space-y-4">
                            {/* KPI Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {currentPlan.kpis.map(kpi => {
                                    const status = getKPIStatus(kpi);
                                    const style = STATUS_STYLE[status];
                                    return (
                                        <div key={kpi.id} className={cn("border rounded-2xl p-5 space-y-3 transition-all", style.bg)}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-2 h-2 rounded-full", style.dot)} />
                                                    <h4 className="text-sm font-medium">{kpi.name}</h4>
                                                </div>
                                                {TREND_ICON[kpi.trend]}
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold">{kpi.current_value.toFixed(kpi.metric_type === 'bias' || kpi.metric_type === 'drift' ? 2 : 1)}</span>
                                                <span className="text-xs text-muted-foreground">{kpi.unit}</span>
                                            </div>
                                            <div className="h-16">
                                                <ResponsiveContainer width="100%" height="100%" minHeight={60} minWidth={0}>
                                                    <AreaChart data={kpi.history.slice(-14)}>
                                                        <defs>
                                                            <linearGradient id={`grad-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor={status === 'healthy' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444'} stopOpacity={0.3} />
                                                                <stop offset="100%" stopColor={status === 'healthy' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444'} stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <Area type="monotone" dataKey="value" stroke={status === 'healthy' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444'} fill={`url(#grad-${kpi.id})`} strokeWidth={2} dot={false} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span> {kpi.threshold_warning}{kpi.unit}</span>
                                                <span>🔴 {kpi.threshold_critical}{kpi.unit}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Alerts */}
                            {currentPlan.kpis.filter(k => getKPIStatus(k) !== 'healthy').map(kpi => (
                                <div key={kpi.id} className={cn("border rounded-xl p-4 flex items-center gap-3",
                                    getKPIStatus(kpi) === 'critical' ? "bg-red-50 border-red-200 dark:bg-red-500/5 dark:border-red-500/20" : "bg-amber-50 border-amber-200 dark:bg-amber-500/5 dark:border-amber-500/20")}>
                                    <IconAlertTriangle size={16} className={getKPIStatus(kpi) === 'critical' ? "text-red-500" : "text-amber-500"} />
                                    <div>
                                        <p className="text-sm font-medium">{kpi.name}: {kpi.current_value.toFixed(2)}{kpi.unit} {getKPIStatus(kpi) === 'critical' ? 'exceeds critical threshold' : 'approaching warning threshold'}</p>
                                        <p className="text-xs text-muted-foreground">Threshold: Warning at {kpi.threshold_warning}{kpi.unit}, Critical at {kpi.threshold_critical}{kpi.unit}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Plan Config */}
                            <div className="bg-card border border-border rounded-2xl shadow-card p-5">
                                <h4 className="text-sm font-semibold mb-3">Monitoring Plan Configuration</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div><span className="text-muted-foreground text-xs block">Review Frequency</span><span className="font-medium capitalize">{currentPlan.review_frequency}</span></div>
                                    <div><span className="text-muted-foreground text-xs block">Next Review</span><span className="font-medium">{new Date(currentPlan.next_review_date).toLocaleDateString()}</span></div>
                                    <div><span className="text-muted-foreground text-xs block">KPIs Tracked</span><span className="font-medium">{currentPlan.kpis.length}</span></div>
                                    <div><span className="text-muted-foreground text-xs block">Alerts</span><span className={cn("font-medium", currentPlan.alerts_enabled ? "text-emerald-500" : "text-muted-foreground")}>{currentPlan.alerts_enabled ? 'Enabled' : 'Disabled'}</span></div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
                        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Add Monitoring Plan</h2><button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><IconX size={20} /></button></div>
                        <div>
                            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Select AI System</label>
                            <select value={selectedSystemId} onChange={e => setSelectedSystemId(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm">
                                <option value="">Choose a system...</option>
                                {systems.filter(s => s.lifecycle_status === 'deployed' || s.lifecycle_status === 'monitoring').map(s => (
                                    <option key={s.id} value={s.id}>{s.name} (v{s.version}) — {s.lifecycle_status}</option>
                                ))}
                                {systems.filter(s => s.lifecycle_status !== 'deployed' && s.lifecycle_status !== 'monitoring').map(s => (
                                    <option key={s.id} value={s.id}>{s.name} (v{s.version})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                            <button onClick={handleCreate} disabled={!selectedSystemId} className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">Create Plan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
