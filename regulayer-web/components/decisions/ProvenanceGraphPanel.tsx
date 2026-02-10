'use client';

import { useState } from 'react';
import {
    GitMerge, ArrowRight, ArrowLeft, CheckCircle,
    AlertCircle, Shield, Network
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

type RelationshipType =
    | 'input_to'
    | 'derived_from'
    | 'reviewed_by'
    | 'approved_by'
    | 'overrides'
    | 'aggregated_into'
    | 'depends_on'
    | 'validates';

interface ProvenanceLink {
    id: string;
    sourceDecisionId: string;
    targetDecisionId: string;
    relationship: RelationshipType;
    sourceSystem?: string;
    targetSystem?: string;
    declaredAt: string;
}

interface DecisionRelationships {
    decisionId: string;
    decisionHash: string;
    incoming: ProvenanceLink[];
    outgoing: ProvenanceLink[];
}

// ============================================================
// Relationship Labels
// ============================================================

const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
    input_to: 'Input to',
    derived_from: 'Derived from',
    reviewed_by: 'Reviewed by',
    approved_by: 'Approved by',
    overrides: 'Overrides',
    aggregated_into: 'Aggregated into',
    depends_on: 'Depends on',
    validates: 'Validates',
};

const INVERSE_LABELS: Record<RelationshipType, string> = {
    input_to: 'Receives input from',
    derived_from: 'Is source of',
    reviewed_by: 'Reviews',
    approved_by: 'Approves',
    overrides: 'Overridden by',
    aggregated_into: 'Aggregates',
    depends_on: 'Is dependency of',
    validates: 'Validated by',
};

// ============================================================
// Relationship Item
// ============================================================

function RelationshipItem({
    link,
    direction
}: {
    link: ProvenanceLink;
    direction: 'incoming' | 'outgoing';
}) {
    const label = direction === 'outgoing'
        ? RELATIONSHIP_LABELS[link.relationship]
        : INVERSE_LABELS[link.relationship];

    const targetId = direction === 'outgoing'
        ? link.targetDecisionId
        : link.sourceDecisionId;

    const system = direction === 'outgoing'
        ? link.targetSystem
        : link.sourceSystem;

    return (
        <div className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
            <div className={`p-1.5 rounded ${direction === 'outgoing' ? 'bg-blue-100' : 'bg-green-100'}`}>
                {direction === 'outgoing'
                    ? <ArrowRight className="w-4 h-4 text-blue-600" />
                    : <ArrowLeft className="w-4 h-4 text-green-600" />}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                    <code className="text-xs text-slate-500">{targetId.slice(0, 12)}...</code>
                </div>
                {system && (
                    <p className="text-xs text-slate-400">System: {system}</p>
                )}
            </div>
        </div>
    );
}

// ============================================================
// Provenance Graph Panel
// ============================================================

interface ProvenanceGraphPanelProps {
    relationships: DecisionRelationships;
}

export function ProvenanceGraphPanel({ relationships }: ProvenanceGraphPanelProps) {
    const [expanded, setExpanded] = useState(true);

    const totalLinks = relationships.incoming.length + relationships.outgoing.length;

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-slate-600" />
                    <h3 className="font-semibold text-slate-900">Decision Relationships</h3>
                    {totalLinks > 0 && (
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                            {totalLinks} link{totalLinks !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-sm text-primary-600 hover:underline"
                >
                    {expanded ? 'Collapse' : 'Expand'}
                </button>
            </div>

            {expanded && (
                <>
                    {/* Outgoing Relationships */}
                    {relationships.outgoing.length > 0 && (
                        <div className="p-4 border-b border-slate-200">
                            <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                                <ArrowRight className="w-3 h-3" />
                                This decision links to
                            </p>
                            {relationships.outgoing.map((link) => (
                                <RelationshipItem key={link.id} link={link} direction="outgoing" />
                            ))}
                        </div>
                    )}

                    {/* Incoming Relationships */}
                    {relationships.incoming.length > 0 && (
                        <div className="p-4 border-b border-slate-200">
                            <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                                <ArrowLeft className="w-3 h-3" />
                                Linked from
                            </p>
                            {relationships.incoming.map((link) => (
                                <RelationshipItem key={link.id} link={link} direction="incoming" />
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {totalLinks === 0 && (
                        <div className="p-6 text-center">
                            <GitMerge className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-500 text-sm">No linked decisions</p>
                        </div>
                    )}
                </>
            )}

            {/* Trust Banner */}
            <div className="p-4 bg-blue-50">
                <p className="text-blue-700 text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    These links explain context. Each decision remains independently verifiable.
                </p>
            </div>
        </div>
    );
}

// ============================================================
// Demo Page
// ============================================================

export default function ProvenanceDemoPage() {
    const demoRelationships: DecisionRelationships = {
        decisionId: 'dec_current',
        decisionHash: 'sha256:abc123...',
        incoming: [
            {
                id: 'link_001',
                sourceDecisionId: 'dec_risk_model',
                targetDecisionId: 'dec_current',
                relationship: 'input_to',
                sourceSystem: 'Risk Model v2',
                declaredAt: new Date().toISOString(),
            },
        ],
        outgoing: [
            {
                id: 'link_002',
                sourceDecisionId: 'dec_current',
                targetDecisionId: 'dec_approval',
                relationship: 'reviewed_by',
                targetSystem: 'Human Approval',
                declaredAt: new Date().toISOString(),
            },
            {
                id: 'link_003',
                sourceDecisionId: 'dec_current',
                targetDecisionId: 'dec_portfolio',
                relationship: 'aggregated_into',
                targetSystem: 'Portfolio Decision',
                declaredAt: new Date().toISOString(),
            },
        ],
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-3xl mx-auto px-8 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <Network className="w-6 h-6 text-slate-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Decision Provenance</h1>
                        <p className="text-slate-600">Multi-system evidence linking</p>
                    </div>
                </div>

                <ProvenanceGraphPanel relationships={demoRelationships} />

                {/* Semantics */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
                    <h3 className="font-semibold text-slate-900 mb-4">What Linking Does</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                DOES
                            </p>
                            <ul className="space-y-1 text-sm text-slate-600">
                                <li>• Shows dependency graph</li>
                                <li>• Explains workflows</li>
                                <li>• Reconstructs timelines</li>
                                <li>• Enables reasoning</li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                NEVER DOES
                            </p>
                            <ul className="space-y-1 text-sm text-slate-600">
                                <li>❌ Merge chains</li>
                                <li>❌ Create new hashes</li>
                                <li>❌ Affect verification</li>
                                <li>❌ Alter proofs</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-400 mt-8">
                    Linkage is contextual, not cryptographic. Chains remain independent.
                </p>
            </div>
        </div>
    );
}
