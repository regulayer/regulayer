'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    getDecision, getGovernance, resolveGateDecision, getMe, 
    Decision, GovernanceMetadata 
} from '@/lib/api';
import { 
    IconArrowLeft, IconCheck, IconX, IconEdit, IconShieldCheck, IconAlertTriangle,
    IconClock, IconEye, IconFlagFilled, IconPlayerPause
} from '@tabler/icons-react';
import { GlazedCard } from '@/components/ui/glazed-card';
import { cn } from '@/lib/utils';

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { style: string; icon: React.ReactNode; label: string }> = {
        unreviewed: { style: 'bg-secondary text-foreground border-border', icon: <IconClock size={12} />, label: 'Unreviewed' },
        in_review: { style: 'bg-zinc-50 text-slate-900 border-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-300 dark:border-zinc-500/20', icon: <IconEye size={12} />, label: 'In Review' },
        reviewed: { style: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20', icon: <IconCheck size={12} />, label: 'Approved' },
        approved: { style: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20', icon: <IconCheck size={12} />, label: 'Approved' },
        rejected: { style: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20', icon: <IconX size={12} />, label: 'Rejected' },
        escalated: { style: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20', icon: <IconAlertTriangle size={12} />, label: 'Escalated' },
        flagged: { style: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20', icon: <IconFlagFilled size={12} />, label: 'Flagged' },
        frozen: { style: 'bg-zinc-50 text-slate-900 border-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-300 dark:border-zinc-500/20', icon: <IconPlayerPause size={12} />, label: 'Frozen' },
        pending: { style: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20', icon: <IconClock size={12} />, label: 'Proposal' },
        pending_review: { style: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20', icon: <IconClock size={12} />, label: 'Pending Review' },
    };
    const c = config[status] || config.unreviewed;
    return (
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", c.style)}>
            {c.icon} {c.label}
        </span>
    );
}

export default function DecisionReviewPage({ params }: { params: { decision_id: string } }) {
    const router = useRouter();
    const [decision, setDecision] = useState<Decision | null>(null);
    const [governance, setGovernance] = useState<GovernanceMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Review State for Gate Mode
    const [declineMessage, setDeclineMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedOutput, setEditedOutput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        getMe().then(res => setUserRole(res.data?.role || 'member')).catch(() => {});
        
        Promise.all([
            getDecision(params.decision_id),
            getGovernance(params.decision_id)
        ]).then(([decisionRes, govRes]) => {
            setDecision(decisionRes.data);
            setGovernance(govRes.data);
            
            // Pre-populate edited output with original AI output
            if (decisionRes.data.canonical_payload?.output) {
                setEditedOutput(JSON.stringify(decisionRes.data.canonical_payload.output, null, 2));
            }
        }).catch(err => {
            console.error(err);
            setError('Failed to load decision details.');
        }).finally(() => {
            setLoading(false);
        });
    }, [params.decision_id]);

    const handleResolve = async (status: 'approved' | 'declined') => {
        if (!declineMessage.trim() && status === 'declined') {
            alert('A decline message is required to reject a decision.');
            return;
        }

        setSubmitting(true);
        try {
            let editedPayload = undefined;
            
            if (isEditing && status === 'approved') {
                try {
                    editedPayload = JSON.parse(editedOutput);
                } catch (e) {
                    alert('Invalid JSON in edited output. Please fix before approving.');
                    setSubmitting(false);
                    return;
                }
            }

            await resolveGateDecision(params.decision_id, status, declineMessage, editedPayload);
            router.push('/governance');
        } catch (err: any) {
            console.error(err);
            alert('Failed to submit resolution: ' + (err.response?.data?.detail || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-border border-t-indigo-500 animate-spin" />
            </div>
        );
    }

    if (error || !decision || !governance) {
        return (
            <div className="p-10">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    {error || 'Decision not found.'}
                </div>
                <Link href="/governance" className="mt-4 inline-flex items-center text-sm font-medium hover:underline text-slate-800">
                    <IconArrowLeft size={16} className="mr-1" /> Back to Queue
                </Link>
            </div>
        );
    }

    const payload = decision.canonical_payload || {};
    const inputContent = payload.input || {};
    const originalOutputContent = payload.output || {};
    const isPendingReview = governance.review_state === 'escalated' || governance.review_state === 'unreviewed';

    return (
        <div className="p-6 md:p-10 pb-20 space-y-6 max-w-6xl mx-auto text-foreground">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <Link href="/governance" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
                        <IconArrowLeft size={14} className="mr-1" /> Back to Queue
                    </Link>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold tracking-tight">Review Blocked Decision</h1>
                        <StatusBadge status={governance.review_state} />
                    </div>
                    <p className="text-sm font-mono text-muted-foreground">ID: {decision.decision_id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Input Section */}
                    <GlazedCard className="p-5 border-zinc-200">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                            User Input Context
                        </h3>
                        <div className="bg-secondary rounded-lg p-4 font-mono text-sm overflow-x-auto border border-border">
                            <pre className="whitespace-pre-wrap break-words">{JSON.stringify(inputContent, null, 2)}</pre>
                        </div>
                    </GlazedCard>

                    {/* Output Section */}
                    <GlazedCard className="p-5 border-zinc-200 border-l-4 border-l-indigo-500">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                AI Proposed Output
                            </h3>
                            {isPendingReview && (
                                <button 
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="text-xs flex items-center gap-1 font-medium bg-secondary hover:bg-slate-200 border border-border px-2 py-1 rounded transition-colors"
                                >
                                    <IconEdit size={14} /> {isEditing ? 'Cancel Edit' : 'Edit Output'}
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="space-y-2">
                                <textarea 
                                    value={editedOutput}
                                    onChange={(e) => setEditedOutput(e.target.value)}
                                    className="w-full h-64 font-mono text-sm p-4 bg-slate-900 text-emerald-400 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <p className="text-xs text-muted-foreground">Modify the JSON above to alter the decision before approving. The modified payload will be recorded and released to the SDK.</p>
                            </div>
                        ) : (
                            <div className="bg-secondary rounded-lg p-4 font-mono text-sm overflow-x-auto border border-border">
                                <pre className="whitespace-pre-wrap break-words">{JSON.stringify(originalOutputContent, null, 2)}</pre>
                            </div>
                        )}
                        
                    </GlazedCard>
                </div>

                {/* Sidebar (Context & Actions) */}
                <div className="space-y-6">
                    {/* Resolution Actions */}
                    {isPendingReview && (
                        <GlazedCard className="p-5 border-zinc-200 shadow-sm sticky top-6">
                            <h3 className="text-sm font-semibold mb-4 text-foreground">Human-in-the-Loop Resolution</h3>
                            <p className="text-xs text-muted-foreground mb-4">
                                This decision was blocked by Gate Mode policies. 
                                Resolve it by approving (with optional edits) or declining.
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Custom Decline Message</label>
                                    <textarea 
                                        value={declineMessage}
                                        onChange={(e) => setDeclineMessage(e.target.value)}
                                        placeholder="Reason for declining. The SDK will receive this message."
                                        className="w-full bg-secondary border border-border rounded-lg p-3 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-slate-400"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => handleResolve('declined')}
                                        disabled={submitting}
                                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        <IconX size={16} /> Decline
                                    </button>
                                    <button 
                                        onClick={() => handleResolve('approved')}
                                        disabled={submitting}
                                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium border border-transparent bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        <IconCheck size={16} /> {isEditing ? 'Approve Edited' : 'Approve'}
                                    </button>
                                </div>
                                {(userRole !== 'admin' && userRole !== 'owner') && (
                                    <div className="mt-2 text-[10px] text-amber-600 flex items-start gap-1 bg-amber-50 p-2 rounded">
                                        <IconAlertTriangle size={14} className="flex-shrink-0" />
                                        <p>Warning: Restrictions apply. Make sure you have approval permissions.</p>
                                    </div>
                                )}
                            </div>
                        </GlazedCard>
                    )}

                    {/* Metadata Context */}
                    <GlazedCard className="p-5 border-zinc-200">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            Trace Context
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground">System Name</p>
                                <p className="font-medium text-foreground">{decision.system_name || 'Unknown'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Risk Level</p>
                                <p className={cn("font-medium capitalize", 
                                    decision.risk_level === 'high' ? "text-red-600" : 
                                    decision.risk_level === 'medium' ? "text-amber-600" : "text-emerald-600"
                                )}>
                                    {decision.risk_level || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Tags</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {governance.tags?.map((t) => (
                                        <span key={t.id} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded block">
                                            {t.name}
                                        </span>
                                    ))}
                                    {(!governance.tags || governance.tags.length === 0) && (
                                        <span className="text-slate-400 italic text-xs">No tags</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Captured At</p>
                                <p className="font-medium text-foreground text-xs font-mono">{new Date(decision.server_timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                    </GlazedCard>
                </div>
            </div>
        </div>
    );
}
