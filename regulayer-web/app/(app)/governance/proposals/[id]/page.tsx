'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProposal, reviewProposal, GovernanceProposal, getMe } from '@/lib/api';
import { 
    IconArrowLeft, IconCheck, IconX, IconEdit, IconShieldCheck, IconAlertTriangle 
} from '@tabler/icons-react';
import { GlazedCard } from '@/components/ui/glazed-card';
import { cn } from '@/lib/utils';

export default function ProposalReviewPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [proposal, setProposal] = useState<GovernanceProposal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Review State
    const [actionReason, setActionReason] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedOutput, setEditedOutput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        getMe().then(res => setUserRole(res.data?.role || 'member')).catch(() => {});
        
        getProposal(params.id)
            .then(res => {
                setProposal(res.data);
                // Pre-populate edited output with original output if available
                if (res.data.proposed_payload?.output) {
                    setEditedOutput(JSON.stringify(res.data.proposed_payload.output, null, 2));
                }
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load proposal details.');
            })
            .finally(() => setLoading(false));
    }, [params.id]);

    const handleReview = async (action: 'approve' | 'reject') => {
        if (!actionReason.trim() && action === 'reject') {
            alert('A reason is required to reject a decision.');
            return;
        }

        setSubmitting(true);
        try {
            let editedPayload = undefined;
            
            if (isEditing && action === 'approve') {
                try {
                    const parsedOutput = JSON.parse(editedOutput);
                    editedPayload = {
                        ...proposal?.proposed_payload,
                        output: parsedOutput
                    };
                } catch (e) {
                    alert('Invalid JSON in edited output. Please fix before approving.');
                    setSubmitting(false);
                    return;
                }
            }

            await reviewProposal(params.id, action, actionReason, editedPayload);
            router.push('/governance');
        } catch (err: any) {
            console.error(err);
            alert('Failed to submit review: ' + (err.response?.data?.detail || err.message));
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

    if (error || !proposal) {
        return (
            <div className="p-10">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    {error || 'Proposal not found.'}
                </div>
                <Link href="/governance" className="mt-4 inline-flex items-center text-sm font-medium hover:underline text-slate-800">
                    <IconArrowLeft size={16} className="mr-1" /> Back to Queue
                </Link>
            </div>
        );
    }

    const payload = proposal.proposed_payload || {};
    const inputContent = payload.input || {};
    const originalOutputContent = payload.output || {};

    const isPending = proposal.status === 'pending';

    return (
        <div className="p-6 md:p-10 pb-20 space-y-6 max-w-6xl mx-auto text-foreground">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <Link href="/governance" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
                        <IconArrowLeft size={14} className="mr-1" /> Back to Queue
                    </Link>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold tracking-tight">Review Decision</h1>
                        <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border",
                            proposal.status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-200" :
                            proposal.status === 'approved' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            "bg-red-50 text-red-700 border-red-200"
                        )}>
                            {proposal.status}
                        </span>
                    </div>
                    <p className="text-sm font-mono text-muted-foreground">ID: {proposal.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Input Section */}
                    <GlazedCard className="p-5 border-zinc-200">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                            User Input
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
                            {isPending && (
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
                                <p className="text-xs text-muted-foreground">Modify the JSON above to alter the decision before approving.</p>
                            </div>
                        ) : (
                            <div className="bg-secondary rounded-lg p-4 font-mono text-sm overflow-x-auto border border-border">
                                <pre className="whitespace-pre-wrap break-words">{JSON.stringify(originalOutputContent, null, 2)}</pre>
                            </div>
                        )}
                        
                        {/* If this has already been edited, show it */}
                        {!isPending && proposal.edit_chain && (
                             <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                                <p className="font-semibold flex items-center gap-1 mb-1"><IconShieldCheck size={16}/> Output was edited during approval</p>
                                <p className="text-xs">Edited by {proposal.edit_chain.editor_role} at {new Date(proposal.edit_chain.edited_at).toLocaleString()}</p>
                             </div>
                        )}
                    </GlazedCard>
                </div>

                {/* Sidebar (Context & Actions) */}
                <div className="space-y-6">
                    {/* Resolution Actions */}
                    {isPending && (
                        <GlazedCard className="p-5 border-zinc-200 shadow-sm sticky top-6">
                            <h3 className="text-sm font-semibold mb-4 text-foreground">Human Resolution</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Approval / Rejection Reason</label>
                                    <textarea 
                                        value={actionReason}
                                        onChange={(e) => setActionReason(e.target.value)}
                                        placeholder="Optional for approval, required for rejection..."
                                        className="w-full bg-secondary border border-border rounded-lg p-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-slate-400"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => handleReview('reject')}
                                        disabled={submitting}
                                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                                    >
                                        <IconX size={16} /> Decline
                                    </button>
                                    <button 
                                        onClick={() => handleReview('approve')}
                                        disabled={submitting}
                                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium border border-transparent bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        <IconCheck size={16} /> {isEditing ? 'Approve Edited' : 'Approve'}
                                    </button>
                                </div>
                                {(userRole !== 'admin' && userRole !== 'owner') && (
                                    <div className="mt-2 text-[10px] text-amber-600 flex items-start gap-1 bg-amber-50 p-2 rounded">
                                        <IconAlertTriangle size={14} className="flex-shrink-0" />
                                        <p>Warning: Depending on segregation of duties, you might not have permission to approve this.</p>
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
                                <p className="font-medium text-foreground">{payload.system_name || 'Unknown'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Original Risk Level</p>
                                <p className={cn("font-medium capitalize", 
                                    proposal.risk_level === 'high' ? "text-red-600" : 
                                    proposal.risk_level === 'medium' ? "text-amber-600" : "text-emerald-600"
                                )}>
                                    {proposal.risk_level || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Environment</p>
                                <p className="font-medium text-foreground">{proposal.environment || 'prod'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Created At</p>
                                <p className="font-medium text-foreground text-xs font-mono">{new Date(proposal.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </GlazedCard>
                </div>
            </div>
        </div>
    );
}
