/**
 * Regulayer Verification UI - Decision Detail Page
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { verifierAPI, DecisionDetail as DecisionDetailType, SpotVerification } from '../api/verifier';
import { HashDisplay } from '../components/HashDisplay';
import { StatusBadge } from '../components/StatusBadge';

export const DecisionDetail: React.FC = () => {
    const { decisionId } = useParams<{ decisionId: string }>();
    const [decision, setDecision] = useState<DecisionDetailType | null>(null);
    const [verification, setVerification] = useState<SpotVerification | null>(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Decision Record Inspector</h1>
                    <p className="text-gray-600">Read-only forensic view</p>
                </div>
                <button
                    onClick={exportBundle}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Proof Bundle
                </button>
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
                                <div className="font-bold text-red-800">⚠️ TAMPERING DETECTED</div>
                                <div className="text-red-700 text-sm mt-1">
                                    This record has been tampered with or the chain is broken.
                                </div>
                            </div>
                        )}
                        {verification.signature_valid === false && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                                <div className="font-bold text-red-800">⚠️ INVALID SIGNATURE</div>
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
                        ⚠️ Does not affect cryptographic validity
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
        </div>
    );
};
