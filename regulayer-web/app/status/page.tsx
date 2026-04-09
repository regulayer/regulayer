"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CheckCircle2, AlertTriangle, XCircle, Clock, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface SystemStatus {
    status: "operational" | "degraded" | "critical";
    last_updated: string;
}

interface Incident {
    id: string;
    incident_type: string;
    severity: string;
    source: string;
    message: string;
    status: string;
    created_at: string;
    resolved_at?: string;
}

export default function StatusPage() {
    const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100";
                
                // Fetch public status
                const statusRes = await fetch(`${apiBase}/v1/public/status`);
                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    setSystemStatus(statusData);
                }

                // Fetch global incidents history (no org_id)
                const incRes = await fetch(`${apiBase}/v1/incidents`);
                if (incRes.ok) {
                    const incData = await incRes.json();
                    setIncidents(incData);
                }
            } catch (e) {
                console.error("Failed to fetch status:", e);
                setSystemStatus({ status: "degraded", last_updated: new Date().toISOString() });
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, []);

    const getStatusConfig = (statusString: string) => {
        switch (statusString) {
            case "operational":
                return {
                    color: "emerald",
                    icon: CheckCircle2,
                    text: "All Systems Operational",
                    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
                    textStyle: "text-emerald-500",
                    bgStyle: "bg-emerald-500",
                };
            case "critical":
                return {
                    color: "rose",
                    icon: XCircle,
                    text: "System Outage",
                    gradient: "from-rose-500/20 via-rose-500/5 to-transparent",
                    textStyle: "text-rose-500",
                    bgStyle: "bg-rose-500",
                };
            default:
                return {
                    color: "amber",
                    icon: AlertTriangle,
                    text: "Degraded Performance",
                    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
                    textStyle: "text-amber-500",
                    bgStyle: "bg-amber-500",
                };
        }
    };

    const config = systemStatus ? getStatusConfig(systemStatus.status) : getStatusConfig("operational");
    const StatusIcon = config.icon;

    return (
        <div className="min-h-screen bg-background text-slate-900 font-sans selection:bg-brand-100 flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
                {/* Dynamic Background Gradient */}
                {systemStatus && (
                    <div className={`absolute top-0 inset-x-0 h-96 bg-gradient-to-b ${config.gradient} pointer-events-none -z-10`} />
                )}

                <div className="container px-6 mx-auto max-w-4xl">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <h1 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">System Status</h1>
                        <p className="text-slate-500 text-lg">Real-time health of the Regulayer infrastructure.</p>
                    </motion.div>

                    {/* Current Status Box */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white border border-slate-200 rounded-2xl p-8 mb-16 shadow-xl relative overflow-hidden"
                    >
                        <div className={`absolute top-0 inset-x-0 h-1 ${config.bgStyle}`} />
                        
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-${config.color}-50 border border-${config.color}-100`}>
                                    {loading ? (
                                        <Activity className={`w-8 h-8 text-slate-400 animate-pulse`} />
                                    ) : (
                                        <StatusIcon className={`w-8 h-8 ${config.textStyle}`} />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        {loading ? "Checking Status..." : config.text}
                                    </h2>
                                    {!loading && systemStatus && (
                                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Last updated: {new Date(systemStatus.last_updated).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Incident History Timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="text-xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-4">Incident History</h3>
                        
                        {loading ? (
                            <div className="flex items-center justify-center py-12 text-slate-400">
                                <Activity className="w-6 h-6 animate-spin mr-2" />
                                <span className="text-sm">Loading history...</span>
                            </div>
                        ) : incidents.length === 0 ? (
                            <div className="text-center py-16 bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
                                <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">No recorded incidents</p>
                                <p className="text-slate-400 text-sm mt-1">Regulayer has maintained 100% uptime recently.</p>
                            </div>
                        ) : (
                            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                {incidents.map((inc, i) => {
                                    const isResolved = inc.status === "resolved";
                                    const SeverityIcon = inc.severity === "critical" ? XCircle : AlertTriangle;
                                    const sevColor = inc.severity === "critical" ? "text-rose-500" : "text-amber-500";
                                    const sevBg = inc.severity === "critical" ? "bg-rose-50" : "bg-amber-50";
                                    const sevBorder = inc.severity === "critical" ? "border-rose-200" : "border-amber-200";

                                    return (
                                        <div key={inc.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                                {isResolved ? (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                ) : (
                                                    <SeverityIcon className={`w-5 h-5 ${sevColor}`} />
                                                )}
                                            </div>
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${isResolved ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : `${sevBg} ${sevColor} ${sevBorder}`}`}>
                                                        {isResolved ? 'Resolved' : inc.severity}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-mono">
                                                        {new Date(inc.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-slate-900 mb-2">{inc.incident_type}</h4>
                                                <p className="text-sm text-slate-600">{inc.message}</p>
                                                
                                                {inc.resolved_at && (
                                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-600 font-medium">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Resolved at {new Date(inc.resolved_at).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
