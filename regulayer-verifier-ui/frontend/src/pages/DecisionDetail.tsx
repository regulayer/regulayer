/**
 * Regulayer Verification UI - Decision Detail Page
 * 
 * Phase 4.4: Access Control & Segregation of Duties
 * - Role-based button states
 * - Auditor read-only mode
 */

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { verifierAPI, DecisionDetail as DecisionDetailType, SpotVerification } from '../api/verifier';
import { HashDisplay } from '../components/HashDisplay';
import { StatusBadge } from '../components/StatusBadge';

// Role capabilities (mirrored from backend)
const ROLE_CAPABILITIES = {
    analyst: { can_annotate: true, can_tag: true, can_approve: false, can_change_state: false },
    compliance: { can_annotate: false, can_tag: false, can_approve: true, can_change_state: true },
    auditor: { can_annotate: false, can_tag: false, can_approve: false, can_change_state: false, read_only: true },
    admin: { can_annotate: false, can_tag: false, can_approve: false, can_change_state: false },
};

export const DecisionDetail: React.FC = () => {
    const { decisionId } = useParams<{ decisionId: string }>();
    const [searchParams] = useSearchParams();
    const [decision, setDecision] = useState<DecisionDetailType | null>(null);
    const [verification, setVerification] = useState<SpotVerification | null>(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Role-based access control (Phase 4.4)
    const userRole = (searchParams.get('role') || 'analyst') as keyof typeof ROLE_CAPABILITIES;
    const capabilities = ROLE_CAPABILITIES[userRole] || ROLE_CAPABILITIES.analyst;
    const isAuditor = userRole === 'auditor';

    useEffect(() => {
        if (decisionId) {
            loadDecision();
        }
    }, [decisionId]);

    const loadDecision = async () => {
        try {
            setLoading(true);
            const data = await verifierAPI.getDecisionDetail(decisionId!);
            setDecision(data);
        } catch (err) {
            setError('Failed to load decision');
        } finally {
            setLoading(false);
        }
    };

    const runVerification = async () => {
        try {
            setVerifying(true);
            const result = await verifierAPI.verifyDecision(decisionId!);
            setVerification(result);
        } catch (err) {
            setError('Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const exportBundle = async () => {
        try {
            await verifierAPI.exportProof(decisionId!);
        } catch (err) {
            alert('Failed to export proof bundle');
        }
    };

    const getAttestationColor = () => {
        if (!decision?.attestation) return 'bg-gray-100 text-gray-800 border-gray-200';
        if (verification && !verification.signature_valid) return 'bg-red-100 text-red-800 border-red-200';
        if (decision.attestation.identity_status_at_signing === 'revoked_after') return 'bg-orange-100 text-orange-800 border-orange-200';
        return 'bg-green-100 text-green-800 border-green-200';
    };

    const getAttestationLabel = () => {
        if (!decision?.attestation) return 'Legacy Record (Unsigned)';
        if (verification && !verification.signature_valid) return 'Invalid Attestation';
        if (decision.attestation.identity_status_at_signing === 'revoked_after') return 'Identity Revoked After Signing';
        return 'Cryptographically Verified';
    };

    if (loading) return <div className="p-8">Loading decision...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;
    if (!decision) return null;

    return (
        <div className="p-8">
            {/* Auditor Read-Only Banner */}
            {isAuditor && (
                <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg text-blue-800 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <strong>Read-Only Audit Mode</strong>
                    <span className="ml-2 text-sm">You have view and export access only. No modifications permitted.</span>
                </div>
            )}

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Decision Record Inspector</h1>
                    <p className="text-gray-600">Read-only forensic view</p>
                </div>
                <div className="flex gap-2 items-center">
                    {/* Role indicator */}
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm border">
                        Role: <strong>{userRole}</strong>
                    </span>
                    <button
                        onClick={exportBundle}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export Proof Bundle
                    </button>
                    <button
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export Governance Evidence
                    </button>
                </div>
            </div>

            {/* Cryptographic Attestation */}
            <div className={`border rounded-lg p-6 mb-6 ${getAttestationColor()}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                            Cryptographic Attestation
                            {decision.attestation && (
                                <span className="ml-3 px-2 py-0.5 text-xs border rounded-full bg-white opacity-75">
                                    {getAttestationLabel()}
                                </span>
                            )}
                        </h2>
                        {!decision.attestation ? (
                            <p className="text-sm opacity-75">
                                This is a legacy record created before cryptographic attestation was enabled.
                                It relies on hash-chain integrity for security.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <div>
                                    <div className="text-xs uppercase opacity-75 mb-1">Signer Identity ID</div>
                                    <div className="font-mono text-sm">{decision.attestation.identity_id}</div>
                                </div>
                                <div>
                                    <div className="text-xs uppercase opacity-75 mb-1">Algorithm</div>
                                    <div className="font-mono text-sm">{decision.attestation.algorithm}</div>
                                </div>
                                <div>
                                    <div className="text-xs uppercase opacity-75 mb-1">Signed At</div>
                                    <div className="font-mono text-sm">{new Date(decision.attestation.signed_at).toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-xs uppercase opacity-75 mb-1">Identity Status</div>
                                    <div className="font-bold flex items-center">
                                        {decision.attestation.identity_status_at_signing === 'active' ? (
                                            <>
                                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                Active at Signing time
                                            </>
                                        ) : (
                                            <>
                                                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                                Revoked After Signing
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Record Metadata */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Record Metadata</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-sm text-gray-600">Record ID</div>
                        <div className="font-mono text-lg">{decision.record_id}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Decision ID</div>
                        <div className="font-mono text-sm">{decision.decision_id}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">System Name</div>
                        <div className="text-lg">{decision.system_name}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Event State</div>
                        <div><StatusBadge status={decision.event_state as any} /></div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Server Timestamp</div>
                        <div className="font-mono text-sm">{new Date(decision.server_timestamp).toLocaleString()}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">SDK Version</div>
                        <div className="font-mono">{decision.sdk_version}</div>
                    </div>
                </div>
            </div>

            {/* Cryptographic Hashes */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Cryptographic Hashes</h2>
                <div className="space-y-4">
                    <HashDisplay hash={decision.record_hash} label="Record Hash" truncate />
                    <HashDisplay
                        hash={decision.previous_record_hash || 'NULL (First Record)'}
                        label="Previous Record Hash"
                        truncate
                    />
                    <HashDisplay hash={decision.canonical_payload_hash} label="Canonical Payload Hash" truncate />
                </div>
            </div>

            {/* Canonical Payload */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Canonical Payload (Read-Only)</h2>
                <pre className="bg-gray-50 border border-gray-200 rounded p-4 overflow-x-auto text-sm">
                    {JSON.stringify(decision.canonical_payload, null, 2)}
                </pre>
            </div>

            {/* Verification */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Spot Verification</h2>

                {!verification && (
                    <button
                        onClick={runVerification}
                        disabled={verifying}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {verifying ? 'Verifying...' : 'Run Spot Verification'}
                    </button>
                )}

                {verification && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span>Hash Matches:</span>
                            <span className={verification.hash_matches ? 'text-green-600' : 'text-red-600 font-bold'}>
                                {verification.hash_matches ? '✓ PASS' : '✗ FAIL'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span>Chain Link Valid:</span>
                            <span className={verification.chain_link_valid ? 'text-green-600' : 'text-red-600 font-bold'}>
                                {verification.chain_link_valid ? '✓ PASS' : '✗ FAIL'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span>Record Valid:</span>
                            <span className={verification.record_valid ? 'text-green-600' : 'text-red-600 font-bold'}>
                                {verification.record_valid ? '✓ PASS' : '✗ FAIL'}
                            </span>
                        </div>
                        {decision.attestation && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <span>Signature Valid:</span>
                                <span className={verification.signature_valid ? 'text-green-600' : 'text-red-600 font-bold'}>
                                    {verification.signature_valid ? '✓ PASS' : '✗ FAIL'}
                                </span>
                            </div>
                        )}

                        {!verification.record_valid && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                                <div className="font-bold text-red-800">️ TAMPERING DETECTED</div>
                                <div className="text-red-700 text-sm mt-1">
                                    This record has been tampered with or the chain is broken.
                                </div>
                            </div>
                        )}
                        {verification.signature_valid === false && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                                <div className="font-bold text-red-800">️ INVALID SIGNATURE</div>
                                <div className="text-red-700 text-sm mt-1">
                                    The cryptographic signature does not match the record content.
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Governance Metadata Panel */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">Governance Metadata</h2>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-200">
                        ️ Does not affect cryptographic validity
                    </span>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded mb-4 text-sm text-gray-600">
                    Governance metadata is an organizational overlay. It does not alter, invalidate, or affect
                    the cryptographic verification of this record. Auditors may ignore this section entirely.
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <div className="text-sm text-gray-600 mb-1">Review State</div>
                        <select
                            className="w-full border rounded px-3 py-2 bg-white"
                            defaultValue="unreviewed"
                        >
                            <option value="unreviewed">Unreviewed</option>
                            <option value="in_review">In Review</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="escalated">Escalated</option>
                        </select>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 mb-1">Tags</div>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">high-risk</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">gdpr</span>
                            <button className="px-2 py-1 border border-dashed border-gray-300 rounded text-sm text-gray-500 hover:bg-gray-50">
                                + Add Tag
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="text-sm text-gray-600 mb-2">Annotations</div>
                    <div className="space-y-2 mb-3">
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded text-sm">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>analyst</span>
                                <span>2026-01-21 10:30</span>
                            </div>
                            <div>Flagged for quarterly review.</div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Add annotation..."
                            className="flex-1 border rounded px-3 py-2 text-sm"
                        />
                        <button className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                            Add
                        </button>
                    </div>
                </div>
            </div>

            {/* Policies Applied Panel */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">Policies Applied</h2>
                    <button className="text-xs px-2 py-1 border rounded text-gray-600 hover:bg-gray-50">
                        Re-evaluate
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded">
                        <div>
                            <div className="font-medium text-orange-800">high_risk_escalation</div>
                            <div className="text-xs text-orange-600">Matched • Escalate high-risk decisions</div>
                        </div>
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            🟠 Escalation Required
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded">
                        <div>
                            <div className="font-medium text-gray-700">gdpr_sensitive</div>
                            <div className="text-xs text-gray-500">Not Matched • GDPR data handling</div>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            — No Action
                        </span>
                    </div>
                </div>
            </div>

            {/* Approvals Panel */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">Approval Workflow</h2>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded border border-red-200">
                        🔴 Compliance Approval Pending
                    </span>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded mb-4 text-sm text-gray-600">
                    Approvals are append-only and immutable. They cannot be edited or deleted.
                </div>

                <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Required Approvals</div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            compliance
                        </span>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Approval History</div>
                    <div className="text-sm text-gray-400 italic">No approvals recorded yet.</div>
                </div>

                <div className="flex gap-2">
                    <select
                        className="border rounded px-3 py-2 text-sm bg-white disabled:opacity-50"
                        disabled={!capabilities.can_approve || isAuditor}
                    >
                        <option value="analyst">Analyst</option>
                        <option value="compliance">Compliance</option>
                        <option value="legal">Legal</option>
                        <option value="manager">Manager</option>
                    </select>
                    <button
                        className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!capabilities.can_approve || isAuditor}
                        title={!capabilities.can_approve ? `Role '${userRole}' cannot approve decisions` : 'Record approval'}
                    >
                        ✓ Approve
                    </button>
                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!capabilities.can_approve || isAuditor}
                        title={!capabilities.can_approve ? `Role '${userRole}' cannot reject decisions` : 'Record rejection'}
                    >
                        ✗ Reject
                    </button>
                    {!capabilities.can_approve && (
                        <span className="text-xs text-gray-500 italic self-center">
                            {userRole === 'analyst' ? "Analysts cannot approve" : "View only"}
                        </span>
                    )}
                </div>
            </div>

            {/* Governance Timeline Panel */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">Governance Timeline</h2>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded border border-purple-200">
                        📄 Process Evidence
                    </span>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded mb-4 text-sm text-gray-600">
                    This timeline documents organizational review actions.
                    It does NOT attest to AI correctness or cryptographic integrity.
                </div>

                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                    {/* Timeline events */}
                    <div className="space-y-4 ml-10">
                        <div className="relative">
                            <div className="absolute -left-8 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                                <div className="flex justify-between text-xs text-orange-600 mb-1">
                                    <span className="font-medium">Policy Match</span>
                                    <span>2026-01-21 09:00</span>
                                </div>
                                <div className="text-sm text-orange-800">
                                    <strong>high_risk_escalation</strong> triggered 2 action(s)
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -left-8 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                <div className="flex justify-between text-xs text-blue-600 mb-1">
                                    <span className="font-medium">State Change</span>
                                    <span>2026-01-21 09:01</span>
                                </div>
                                <div className="text-sm text-blue-800">
                                    unreviewed → in_review (triggered by policy)
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -left-8 w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span className="font-medium">Annotation</span>
                                    <span>2026-01-21 10:30</span>
                                </div>
                                <div className="text-sm text-gray-700">
                                    <span className="text-gray-500">[analyst]</span> Flagged for quarterly review.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
