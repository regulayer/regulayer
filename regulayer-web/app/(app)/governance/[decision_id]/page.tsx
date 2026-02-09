'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    MessageSquare,
    Tag,
    Clock,
    CheckCircle,
    AlertTriangle,
    Send,
    Plus,
    Lock,
    ShieldCheck,
    FileJson,
    Info
} from 'lucide-react';
import {
    getDecision,
    getGovernance,
    getOrg,
    getMe,
    addGovernanceAnnotation,
    addGovernanceTag,
    updateReviewState,
    Decision,
    GovernanceMetadata,
    GovernanceAnnotation
} from '@/lib/api';

// --- Components ---

function StatusBadge({ status }: { status: string }) {
    const styles = {
        unreviewed: 'bg-slate-100 text-slate-700',
        in_review: 'bg-blue-100 text-blue-700',
        reviewed: 'bg-green-100 text-green-700',
        escalated: 'bg-red-100 text-red-700',
    };
    const s = styles[status as keyof typeof styles] || styles.unreviewed;

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${s}`}>
            {status.replace('_', ' ')}
        </span>
    );
}

function CryptoBadge({ state }: { state: string }) {
    if (state === 'pending') {
        return (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                <Clock className="w-3 h-3" /> Pending Recorder
            </span>
        );
    }
    return (
        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
            <ShieldCheck className="w-3 h-3" /> Cryptographically Sealed
        </span>
    );
}

function AnnotationCard({ annotation }: { annotation: GovernanceAnnotation }) {
    return (
        <div className="border-l-4 border-primary-200 bg-slate-50 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-sm text-slate-500">
                <span className="font-medium text-slate-700 capitalize">{annotation.author_role}</span>
                <span>•</span>
                <Clock className="w-3 h-3" />
                <span>{new Date(annotation.created_at).toLocaleString()}</span>
            </div>
            <p className="text-slate-800 whitespace-pre-wrap">{annotation.note}</p>
        </div>
    );
}

function ReadOnlyBanner({ reason }: { reason: string }) {
    return (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-amber-600" />
            <div>
                <p className="font-semibold text-sm">Read-Only Mode Enabled</p>
                <p className="text-sm opacity-90">{reason}</p>
            </div>
        </div>
    );
}

function GovernanceUnavailableBanner() {
    return (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg flex items-center gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <div>
                <p className="font-semibold text-sm">Governance Service Unavailable</p>
                <p className="text-sm opacity-90">Cryptographic proof remains valid. Metadata annotations are temporarily inaccessible.</p>
            </div>
        </div>
    );
}

// --- Main Page ---

export default function GovernanceDetailPage() {
    const params = useParams();
    const decisionId = params.decision_id as string;

    const [decision, setDecision] = useState<Decision | null>(null);
    const [governance, setGovernance] = useState<GovernanceMetadata | null>(null);
    const [orgStatus, setOrgStatus] = useState<string>('active');
    const [userRole, setUserRole] = useState<string>('member');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [govUnavailable, setGovUnavailable] = useState(false);

    // Form States
    const [newNote, setNewNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagCategory, setNewTagCategory] = useState('compliance');
    const [showTagInput, setShowTagInput] = useState(false);

    // --- Data Loading ---
    useEffect(() => {
        async function load() {
            try {
                // 1. Fetch Core Data (Parallel)
                const [decRes, govRes, meRes] = await Promise.all([
                    getDecision(decisionId),
                    getGovernance(decisionId).catch(() => ({ error: 'unavailable', data: null })), // Fail-safe
                    getMe().catch(() => ({ data: { user: { role: 'member' }, org: { status: 'active' } } })) // Fallback
                ]);

                // 2. Handle Decision Error (Critical)
                if (decRes.error) throw new Error(decRes.error);
                setDecision(decRes.data || null);

                // 3. Handle Governance (Overlay)
                if (govRes.error || !govRes.data) {
                    setGovUnavailable(true);
                    // Mock empty governance for UI stability if unavailable
                    setGovernance({
                        decision_id: decisionId,
                        review_state: 'unreviewed',
                        tags: [],
                        annotations: [],
                        last_updated: new Date().toISOString()
                    });
                } else {
                    setGovernance(govRes.data);
                }

                // 4. Handle Context (Org/User)
                // Assuming getMe returns { user: { role }, org: { status } }
                // Adjust based on actual API response structure
                const userData = meRes.data?.user || {};
                const orgData = meRes.data?.org || {};

                setUserRole(userData.role || 'member');
                setOrgStatus(orgData.status || 'active');

            } catch (err: any) {
                setError(err.message || 'Failed to load');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [decisionId]);

    // --- Hardening Checks ---

    const isFrozen = orgStatus === 'frozen' || orgStatus === 'trial_ended';
    const isGovReadOnly = isFrozen || govUnavailable;

    const canReview = ['owner', 'admin', 'compliance'].includes(userRole) && !isGovReadOnly;
    const canAnnotate = !isGovReadOnly; // Members can annotate if active
    const canEditTags = !isGovReadOnly;

    const readOnlyReason = isFrozen
        ? "Organization is Frozen. Governance actions are disabled."
        : govUnavailable
            ? "Governance service unavailable."
            : "";

    // --- Actions ---

    const handleAddNote = async () => {
        if (!newNote.trim() || !canAnnotate) return;
        setSubmitting(true);
        try {
            const res = await addGovernanceAnnotation(decisionId, newNote);
            if (res.data && governance) {
                setGovernance({
                    ...governance,
                    annotations: [res.data, ...governance.annotations]
                });
                setNewNote('');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to add annotation'); // Better toast in production
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddTag = async () => {
        if (!newTagName.trim() || !canEditTags) return;
        setSubmitting(true);
        try {
            const res = await addGovernanceTag(decisionId, newTagName, newTagCategory);
            if (res.data && governance) {
                setGovernance({
                    ...governance,
                    tags: [...governance.tags, res.data]
                });
                setNewTagName('');
                setShowTagInput(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleStateChange = async (newState: string) => {
        if (!canReview) return;
        setSubmitting(true);
        try {
            const res = await updateReviewState(decisionId, newState);
            if (res.data) {
                setGovernance(res.data);
            }
        } catch (err: any) {
            alert(err.message || 'State transition failed');
        } finally {
            setSubmitting(false);
        }
    };

    // --- Render Loading/Error ---

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading record...</div>;

    if (error || !decision || !governance) {
        return (
            <div className="min-h-screen bg-slate-50 p-8">
                <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
                    <AlertTriangle className="w-6 h-6 mb-2" />
                    <h2 className="text-lg font-semibold mb-1">Error Loading Decision</h2>
                    <p>{error || 'Decision not found'}</p>
                    <Link href="/governance" className="mt-4 inline-block text-primary-600 hover:underline">← Back to Queue</Link>
                </div>
            </div>
        );
    }

    // --- Render Main UI ---

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/governance" className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm mb-4">
                        <ArrowLeft className="w-4 h-4" /> Back to Queue
                    </Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
                                    {decision.decision_id}
                                </h1>
                                <CryptoBadge state={decision.event_state === 'completed' ? 'recorded' : 'pending'} />
                            </div>
                            <p className="text-slate-500 mt-1 flex items-center gap-2">
                                <span className="font-medium text-slate-700">{decision.system_name}</span>
                                <span>•</span>
                                <span>{new Date(decision.server_timestamp).toLocaleString()}</span>
                            </p>
                        </div>
                        {!govUnavailable && <StatusBadge status={governance.review_state} />}
                    </div>
                </div>

                {isFrozen && <ReadOnlyBanner reason={readOnlyReason} />}
                {govUnavailable && <GovernanceUnavailableBanner />}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Cryptographic Record (The Truth) */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-green-600" />
                                Cryptographic Record
                            </h2>
                            <dl className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                <div>
                                    <dt className="text-slate-500 mb-1">System Name</dt>
                                    <dd className="font-medium text-slate-900">{decision.system_name}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500 mb-1">Risk Level</dt>
                                    <dd className="font-medium text-slate-900 capitalize">{decision.risk_level || 'Unknown'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500 mb-1">SDK Instance ID</dt>
                                    <dd className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 truncate">
                                        {decision.sdk_instance_id}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500 mb-1">Event State</dt>
                                    <dd className="font-medium text-slate-900 capitalize">{decision.event_state}</dd>
                                </div>
                                <div className="col-span-2">
                                    <dt className="text-slate-500 mb-1">Verification Hash (SHA-256)</dt>
                                    {/* Placeholder hash if not in model yet, or add to API response */}
                                    <dd className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 break-all">
                                        {/* Using record_hash if available, else placeholder */}
                                        {(decision as any).record_hash || "Fetch Verification Proof to see Hash"}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* 2. Governance Overlay (Non-Crypto) */}
                        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                                        <FileJson className="w-4 h-4 text-blue-600" />
                                        Governance Overlay <span className="text-slate-400 font-normal text-sm ml-1">(Not part of cryptographic proof)</span>
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Annotations and review states are <strong className="font-bold text-slate-600">NOT</strong> part of the cryptographic proof bundle.
                                    </p>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Tag className="w-3 h-3" /> Tags
                                    </h3>
                                    {!isGovReadOnly && (
                                        <button
                                            onClick={() => setShowTagInput(!showTagInput)}
                                            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Tag
                                        </button>
                                    )}
                                </div>

                                {showTagInput && (
                                    <div className="flex gap-2 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100 animate-in fade-in slide-in-from-top-2">
                                        <input
                                            type="text"
                                            value={newTagName}
                                            onChange={(e) => setNewTagName(e.target.value)}
                                            placeholder="Tag name"
                                            className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                        />
                                        <select
                                            value={newTagCategory}
                                            onChange={(e) => setNewTagCategory(e.target.value)}
                                            className="px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white"
                                        >
                                            <option value="compliance">Compliance</option>
                                            <option value="risk">Risk</option>
                                            <option value="review">Review</option>
                                            <option value="custom">Custom</option>
                                        </select>
                                        <button
                                            onClick={handleAddTag}
                                            disabled={submitting}
                                            className="px-3 py-1.5 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 disabled:opacity-50"
                                        >
                                            Add
                                        </button>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {governance.tags.length > 0 ? governance.tags.map((tag) => (
                                        <span key={`${tag.id}-${tag.name}`} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-700 font-medium">
                                            {tag.name}
                                            <span className="text-slate-400 ml-1 font-normal">({tag.category})</span>
                                        </span>
                                    )) : (
                                        <p className="text-slate-400 text-sm italic">No tags applied.</p>
                                    )}
                                </div>
                            </div>

                            {/* Annotations */}
                            <div>
                                <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-3">
                                    <MessageSquare className="w-3 h-3" /> Annotations
                                </h3>

                                <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto pr-1">
                                    {governance.annotations.length > 0 ? governance.annotations.map((a) => (
                                        <AnnotationCard key={a.id} annotation={a} />
                                    )) : (
                                        <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                                            <p className="text-slate-400 text-sm">No annotations yet.</p>
                                        </div>
                                    )}
                                </div>

                                {!isGovReadOnly ? (
                                    <div className="flex gap-2 items-start mt-4">
                                        <div className="flex-1 relative">
                                            <textarea
                                                value={newNote}
                                                onChange={(e) => setNewNote(e.target.value)}
                                                placeholder="Add a governance note..."
                                                rows={2}
                                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={handleAddNote}
                                            disabled={submitting || !newNote.trim()}
                                            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded border border-amber-100">
                                        Locked: {readOnlyReason}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">

                        {/* Review Actions */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                            <h3 className="font-semibold text-slate-900 mb-4">Review Actions</h3>

                            {isGovReadOnly ? (
                                <p className="text-sm text-slate-500 italic">Actions disabled (Read-Only).</p>
                            ) : !canReview ? (
                                <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded border border-slate-100">
                                    <Lock className="w-3 h-3 inline mr-1" />
                                    Requires Admin or Compliance role to change state.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {governance.review_state === 'unreviewed' && (
                                        <button
                                            onClick={() => handleStateChange('in_review')}
                                            disabled={submitting}
                                            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                        >
                                            Start Review
                                        </button>
                                    )}
                                    {governance.review_state === 'in_review' && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleStateChange('reviewed')}
                                                disabled={submitting}
                                                className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-1"
                                            >
                                                <CheckCircle className="w-3 h-3" /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleStateChange('escalated')}
                                                disabled={submitting}
                                                className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-1"
                                            >
                                                <AlertTriangle className="w-3 h-3" /> Escalate
                                            </button>
                                        </div>
                                    )}
                                    {(governance.review_state === 'reviewed' || governance.review_state === 'escalated') && (
                                        <button
                                            onClick={() => handleStateChange('in_review')}
                                            disabled={submitting}
                                            className="w-full px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition disabled:opacity-50 border border-slate-200"
                                        >
                                            Re-open Review
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Forensic Export */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-slate-600" />
                                Forensic Export
                            </h3>
                            <p className="text-xs text-slate-500 mb-4">
                                Download the cryptographically verified proof bundle (JSON). Contains strict hash chain and original decision data.
                            </p>
                            <a
                                // Correct Export Link: Recorder via Gateway
                                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/v1/decisions/${decisionId}/export`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full px-4 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg text-center hover:bg-slate-50 hover:border-slate-400 transition shadow-sm"
                            >
                                <FileJson className="w-4 h-4 inline mr-2 text-slate-500" />
                                Download Evidence Bundle
                            </a>
                        </div>

                        {/* Metadata */}
                        <div className="p-4 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                            <div className="flex justify-between mb-1">
                                <span>Last Updated:</span>
                                <span>{new Date(governance.last_updated).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Record ID:</span>
                                <span className="font-mono">{(decision as any).record_id || '?'}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
