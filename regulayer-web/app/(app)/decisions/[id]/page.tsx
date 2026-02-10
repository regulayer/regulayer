'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ShieldCheck,
    ArrowLeft,
    Clock,
    FileJson,
    Link as LinkIcon,
    Calendar,
    Server,
    Activity,
    GitCommit
} from 'lucide-react';
import { getDecision, Decision } from '@/lib/api';

export default function DecisionDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [decision, setDecision] = useState<Decision | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        async function fetchDecision() {
            try {
                const res = await getDecision(id);
                if (res.error) throw new Error(res.error);
                if (res.data) setDecision(res.data);
            } catch (e: unknown) {
                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError('An unknown error occurred');
                }
            } finally {
                setLoading(false);
            }
        }

        fetchDecision();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    Loading decision record...
                </div>
            </div>
        );
    }

    if (error || !decision) {
        return (
            <div className="min-h-screen bg-slate-50 p-8">
                <div className="max-w-2xl mx-auto bg-white rounded-xl border border-red-200 p-8 text-center">
                    <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Record Not Found</h3>
                    <p className="text-slate-500 mb-6">{error || "This decision ID does not exist in the referenced chain."}</p>
                    <Link href="/dashboard" className="text-primary-600 hover:underline">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Cast to any to access custom fields not yet in strict type definition - FIXED via Interface update
    const d = decision;
    const previousHash = d.previous_record_hash || null;
    const recordHash = d.record_hash || "PENDING";
    const status = d.event_state;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                {/* Header */}
                <div className="bg-white rounded-xl border border-slate-200 p-8 mb-6 shadow-sm">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                                    {d.decision_id}
                                </h1>
                                {status === 'completed' ? (
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 border border-green-200">
                                        <ShieldCheck className="w-3 h-3" /> Sealed
                                    </span>
                                ) : (
                                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 border border-amber-200">
                                        <Clock className="w-3 h-3" /> Pending
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-500 text-sm">
                                Recorded at {new Date(d.server_timestamp).toLocaleString()}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <a
                                href={`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'}/v1/decisions/${d.decision_id}/export`}
                                target="_blank"
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-sm font-medium"
                            >
                                <FileJson className="w-4 h-4" />
                                Export Proof
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-t border-slate-100">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">System</p>
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                <Server className="w-4 h-4 text-slate-400" />
                                {d.system_name}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Risk Level</p>
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                <Activity className="w-4 h-4 text-slate-400" />
                                <span className="capitalize">{d.risk_level}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Created</p>
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                {new Date(d.server_timestamp).toLocaleDateString()}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Governance</p>
                            <Link href={`/governance/${d.decision_id}`} className="text-primary-600 hover:underline text-sm font-medium flex items-center gap-1">
                                View Review Status →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Cryptographic Chain */}
                <div className="bg-slate-900 text-slate-300 rounded-xl p-8 shadow-lg overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldCheck className="w-32 h-32" />
                    </div>

                    <h2 className="text-white font-semibold flex items-center gap-2 mb-6">
                        <LinkIcon className="w-5 h-5 text-primary-400" />
                        Cryptographic Chain Lineage
                    </h2>

                    <div className="space-y-6 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-700"></div>

                        {/* Current Block */}
                        <div className="relative pl-14">
                            <div className="absolute left-3 top-2 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-900 z-10"></div>
                            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs text-green-400 font-mono">CURRENT RECORD</span>
                                    <span className="text-xs text-slate-500 font-mono">ID: {d.record_id || '?'}</span>
                                </div>
                                <div className="font-mono text-sm text-white break-all">{recordHash}</div>
                            </div>
                        </div>

                        {/* Previous Block Link */}
                        <div className="relative pl-14">
                            <div className="absolute left-3 top-2 w-6 h-6 bg-slate-700 rounded-full border-4 border-slate-900 z-10"></div>
                            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs text-slate-400 font-mono">PREVIOUS RECORD HASH</span>
                                </div>
                                {previousHash ? (
                                    <div className="font-mono text-sm text-slate-400 break-all mb-2">{previousHash}</div>
                                ) : (
                                    <div className="font-mono text-sm text-slate-500 italic">GENESIS RECORD (No previous hash)</div>
                                )}

                                {previousHash && (
                                    <button
                                        disabled={true}
                                        className="text-xs flex items-center gap-1 text-slate-500 mt-2 cursor-not-allowed"
                                        title="Traversal requires full chain index (Not available in Phase 1 UI)"
                                    >
                                        <GitCommit className="w-3 h-3" />
                                        Traverse to previous record (Offline Verification Only)
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
                        <p>Chain ID: {d.chain_id || 'global'}</p>
                        <p>Algorithm: Ed25519 / SHA-256</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
