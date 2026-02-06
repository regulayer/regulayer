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
    Plus
} from 'lucide-react';
import {
    getDecision,
    getGovernance,
    addGovernanceAnnotation,
    addGovernanceTag,
    updateReviewState,
    Decision,
    GovernanceMetadata,
    GovernanceAnnotation
} from '@/lib/api';

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

function AnnotationCard({ annotation }: { annotation: GovernanceAnnotation }) {
    return (
        <div className="border-l-4 border-primary-200 bg-slate-50 p-4 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2 text-sm text-slate-500">
                <span className="font-medium text-slate-700 capitalize">{annotation.author_role}</span>
                <span>•</span>
                <Clock className="w-3 h-3" />
                <span>{new Date(annotation.created_at).toLocaleString()}</span>
            </div>
            <p className="text-slate-800">{annotation.note}</p>
        </div>
    );
}

export default function GovernanceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const decisionId = params.decision_id as string;

    const [decision, setDecision] = useState<Decision | null>(null);
    const [governance, setGovernance] = useState<GovernanceMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newNote, setNewNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [newTagName, setNewTagName] = useState('');
    const [newTagCategory, setNewTagCategory] = useState('compliance');
    const [showTagInput, setShowTagInput] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const [decRes, govRes] = await Promise.all([
                    getDecision(decisionId),
                    getGovernance(decisionId)
                ]);

                if (decRes.error) throw new Error(decRes.error);
                if (govRes.error) throw new Error(govRes.error);

                setDecision(decRes.data || null);
                setGovernance(govRes.data || null);
            } catch (err: any) {
                setError(err.message || 'Failed to load');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [decisionId]);

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
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
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddTag = async () => {
        if (!newTagName.trim()) return;
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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-slate-400">Loading decision...</p>
            </div>
        );
    }

    if (error || !decision || !governance) {
        return (
            <div className="min-h-screen bg-slate-50 p-8">
                <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
                    <AlertTriangle className="w-6 h-6 mb-2" />
                    <h2 className="text-lg font-semibold mb-1">Error Loading Decision</h2>
                    <p>{error || 'Decision not found'}</p>
                    <Link href="/governance" className="mt-4 inline-block text-primary-600 hover:underline">
                        ← Back to Queue
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/governance" className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm mb-4">
                        <ArrowLeft className="w-4 h-4" /> Back to Queue
                    </Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 font-mono">
                                {decision.decision_id}
                            </h1>
                            <p className="text-slate-500 mt-1">
                                {decision.system_name} • {new Date(decision.server_timestamp).toLocaleString()}
                            </p>
                        </div>
                        <StatusBadge status={governance.review_state} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Decision Summary Card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                            <h2 className="font-semibold text-slate-900 mb-4">Decision Summary</h2>
                            <dl className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <dt className="text-slate-500">System</dt>
                                    <dd className="font-medium text-slate-900">{decision.system_name}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Risk Level</dt>
                                    <dd className="font-medium text-slate-900 capitalize">{decision.risk_level || 'Unknown'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">SDK Instance</dt>
                                    <dd className="font-mono text-xs text-slate-700">{decision.sdk_instance_id?.substring(0, 12)}...</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Event State</dt>
                                    <dd className="font-medium text-slate-900 capitalize">{decision.event_state}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Tags Section */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <Tag className="w-4 h-4" /> Tags
                                </h2>
                                <button
                                    onClick={() => setShowTagInput(!showTagInput)}
                                    className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Add Tag
                                </button>
                            </div>

                            {showTagInput && (
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={newTagName}
                                        onChange={(e) => setNewTagName(e.target.value)}
                                        placeholder="Tag name"
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    />
                                    <select
                                        value={newTagCategory}
                                        onChange={(e) => setNewTagCategory(e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    >
                                        <option value="compliance">Compliance</option>
                                        <option value="risk">Risk</option>
                                        <option value="review">Review</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                    <button
                                        onClick={handleAddTag}
                                        disabled={submitting}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50"
                                    >
                                        Add
                                    </button>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {governance.tags.length > 0 ? governance.tags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-sm text-slate-700"
                                    >
                                        {tag.name}
                                        <span className="text-slate-400 ml-1">({tag.category})</span>
                                    </span>
                                )) : (
                                    <p className="text-slate-400 text-sm">No tags yet</p>
                                )}
                            </div>
                        </div>

                        {/* Annotations Section */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                            <h2 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                                <MessageSquare className="w-4 h-4" /> Annotations
                            </h2>

                            <div className="space-y-4 mb-6">
                                {governance.annotations.length > 0 ? governance.annotations.map((a) => (
                                    <AnnotationCard key={a.id} annotation={a} />
                                )) : (
                                    <p className="text-slate-400 text-sm">No annotations yet. Add one below.</p>
                                )}
                            </div>

                            {/* Add Note Input */}
                            <div className="flex gap-2">
                                <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Add an annotation..."
                                    rows={2}
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                                <button
                                    onClick={handleAddNote}
                                    disabled={submitting || !newNote.trim()}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 self-end"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Actions Card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Review Actions</h3>
                            <div className="space-y-2">
                                {governance.review_state === 'unreviewed' && (
                                    <button
                                        onClick={() => handleStateChange('in_review')}
                                        disabled={submitting}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Start Review
                                    </button>
                                )}
                                {governance.review_state === 'in_review' && (
                                    <>
                                        <button
                                            onClick={() => handleStateChange('reviewed')}
                                            disabled={submitting}
                                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Mark Reviewed
                                        </button>
                                        <button
                                            onClick={() => handleStateChange('escalated')}
                                            disabled={submitting}
                                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <AlertTriangle className="w-4 h-4" /> Escalate
                                        </button>
                                    </>
                                )}
                                {governance.review_state === 'reviewed' && (
                                    <p className="text-green-600 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Review Complete
                                    </p>
                                )}
                                {governance.review_state === 'escalated' && (
                                    <button
                                        onClick={() => handleStateChange('in_review')}
                                        disabled={submitting}
                                        className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
                                    >
                                        Return to Review
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Export Card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Export</h3>
                            <a
                                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/v1/governance/${decisionId}/evidence`}
                                target="_blank"
                                className="block w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-center hover:bg-slate-50"
                            >
                                Download Evidence Bundle
                            </a>
                        </div>

                        {/* Timeline Card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Last Updated</h3>
                            <p className="text-sm text-slate-500">
                                {new Date(governance.last_updated).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
