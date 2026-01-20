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

    if (loading) return <div className="p-8">Loading decision...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;
    if (!decision) return null;

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Decision Record Inspector</h1>
                <p className="text-gray-600">Read-only forensic view</p>
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
              <span className={verification.hash_matches ? 'text-green-600'>✓ PASS' : 'text-red-600 font-bold'>✗ FAIL</span>
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
            
            {!verification.record_valid && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                        <div className="font-bold text-red-800">⚠️ TAMPERING DETECTED</div>
                        <div className="text-red-700 text-sm mt-1">
                            This record has been tampered with or the chain is broken.
                        </div>
                    </div>
                )}
            </div>
        )}
        </div>
    </div >
  );
};
