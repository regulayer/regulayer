"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { IconArrowLeft, IconShieldCheck, IconClock, IconAlertTriangle } from "@tabler/icons-react";
import { getDecision, Decision } from "@/lib/api";
import { cn } from "@/lib/utils";
import { GlazedCard } from "@/components/ui/glazed-card";

export default function DecisionDetail() {
    const params = useParams();
    const id = params.id as string;
    const [decision, setDecision] = useState<Decision | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        getDecision(id)
            .then(res => setDecision(res.data))
            .catch(err => setError(err.message || "Failed to load decision"))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 animate-pulse">Loading record {id}...</p>
            </div>
        );
    }

    if (error || !decision) {
        return (
            <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600"><IconAlertTriangle size={24} /></div>
                <h3 className="text-lg font-semibold">Decision not found</h3>
                <p className="text-slate-500 max-w-md">{error || "The requested decision record could not be found."}</p>
                <Link href="/decisions" className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-brand-700 transition">Back to Decisions</Link>
            </div>
        );
    }

    const state = decision.event_state || 'unknown';
    const statusStyles: Record<string, string> = {
        completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        started: 'bg-zinc-50 text-zinc-700 border-zinc-200',
    };

    return (
        <div className="p-6 md:p-10 flex flex-col gap-6 w-full min-h-screen pb-20 text-slate-900 max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
                <Link href="/decisions" className="text-slate-500 hover:text-slate-900 flex items-center gap-1 transition text-sm">
                    <IconArrowLeft size={16} /> Back to Decisions
                </Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold font-mono tracking-tight break-all">{decision.decision_id}</h1>
                    <div className="flex items-center gap-3 mt-3">
                        <span className={cn("inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border capitalize", statusStyles[state] || statusStyles.pending)}>
                            {state === 'completed' || state === 'verified' ? <IconShieldCheck size={14} /> : <IconClock size={14} />}
                            {state}
                        </span>
                        <span className="text-sm text-slate-500">
                            {new Date(decision.server_timestamp).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <GlazedCard className="p-6 border-slate-200">
                    <h2 className="text-lg font-semibold mb-4 text-slate-800">Cryptographic Proof</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50#0c0c10] p-4 rounded-xl border border-slate-200">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Record Hash</p>
                            <p className="font-mono text-sm text-slate-700 break-all">{decision.record_hash || 'PENDING'}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Previous Hash</p>
                            <p className="font-mono text-sm text-slate-700 break-all">{decision.previous_record_hash || 'N/A'}</p>
                        </div>
                    </div>
                </GlazedCard>

                <GlazedCard className="p-6 border-slate-200">
                    <h2 className="text-lg font-semibold mb-4 text-slate-800">Payload Details</h2>
                    <div className="bg-background rounded-xl p-4 overflow-x-auto border border-slate-200">
                        <pre className="text-xs font-mono text-emerald-400">
                            {JSON.stringify(decision.canonical_payload, null, 2)}
                        </pre>
                    </div>
                </GlazedCard>
            </div>
        </div>
    );
}
