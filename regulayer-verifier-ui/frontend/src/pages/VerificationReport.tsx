/**
 * Regulayer Verification UI - Verification Report Page
 */

import React, { useState } from 'react';
import { verifierAPI, VerificationResult } from '../api/verifier';

export const VerificationReport: React.FC = () => {
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const runFullVerification = async () => {
        try {
            setRunning(true);
            setError(null);
            setProgress(0);

            // Simulate progress
            const interval = setInterval(() => {
                setProgress(p => Math.min(p + 10, 90));
            }, 500);

            const data = await verifierAPI.runFullVerification();

            clearInterval(interval);
            setProgress(100);
            setResult(data);
        } catch (err) {
            setError('Verification failed');
        } finally {
            setRunning(false);
        }
    };

    const exportReport = () => {
        if (!result) return;

        const report = {
            timestamp: new Date().toISOString(),
            verification_result: result,
            chain_status: result.is_valid ? 'PASS' : 'FAIL',
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `verification-report-${new Date().toISOString()}.json`;
        a.click();
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Chain Integrity Verification Report</h1>

            {!result && !running && (
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-600 mb-6">
                        Run a full chain verification to check integrity of all records.
                        This may take several seconds for large chains.
                    </p>
                    <button
                        onClick={runFullVerification}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold"
                    >
                        Run Full Chain Verification
                    </button>
                </div>
            )}

            {running && (
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                    <div className="text-center mb-6">
                        <div className="text-xl font-semibold mb-4">Verifying Chain Integrity...</div>
                        <div className="text-gray-600">This may take a few moments</div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                        <div
                            className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="text-center text-sm text-gray-600">{progress}%</div>
                </div>
            )}

            {result && (
                <div className="space-y-6">
                    {/* Summary Card */}
                    <div className={`border-2 rounded-lg p-6 ${result.is_valid
                        ? 'bg-green-50 border-green-300'
                        : 'bg-red-50 border-red-300'
                        }`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-2xl font-bold">
                                {result.is_valid ? '✓ CHAIN VALID' : '✗ CHAIN INVALID'}
                            </div>
                            <button
                                onClick={exportReport}
                                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
                            >
                                Export Report (JSON)
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <div>
                                <div className="text-sm text-gray-600">Records Checked</div>
                                <div className="text-2xl font-bold">{result.total_records_checked.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Verification Time</div>
                                <div className="text-2xl font-bold">{result.verification_duration_ms.toFixed(0)}ms</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Errors Found</div>
                                <div className="text-2xl font-bold">{result.errors.length}</div>
                            </div>
                        </div>

                        {/* Attestation Stats (Phase 2.3) */}
                        <div className="border-t border-gray-200 mt-6 pt-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Attestation Statistics</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white p-3 rounded border border-gray-200">
                                    <div className="text-xs text-gray-500">Signed Records</div>
                                    <div className="text-xl font-bold text-green-700">
                                        {(result as any).attested_records_count || 0}
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded border border-gray-200">
                                    <div className="text-xs text-gray-500">Legacy Records</div>
                                    <div className="text-xl font-bold text-gray-600">
                                        {(result as any).legacy_records_count || 0}
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded border border-gray-200">
                                    <div className="text-xs text-gray-500">Revoked Identities</div>
                                    <div className="text-xl font-bold text-orange-600">
                                        {(result as any).revoked_records_count || 0}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Broken Chain Alert */}
                    {!result.is_valid && result.broken_at_record_id && (
                        <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6">
                            <div className="font-bold text-red-900 text-lg mb-2">⚠️ CHAIN BREAK DETECTED</div>
                            <div className="text-red-800">
                                Chain integrity violation at <strong>Record ID: {result.broken_at_record_id}</strong>
                            </div>
                            <div className="mt-3">
                                <a
                                    href={`#/decisions`}
                                    className="text-blue-600 hover:text-blue-800 underline"
                                >
                                    Inspect records starting from #{result.broken_at_record_id}
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Error Details */}
                    {result.errors.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Error Details</h2>
                            <div className="space-y-2">
                                {result.errors.map((error, idx) => (
                                    <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded text-sm font-mono">
                                        {error}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {result.is_valid && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-4">✓ Verification Complete</h2>
                            <p className="text-gray-700">
                                All {result.total_records_checked.toLocaleString()} records have been verified.
                                No tampering detected. Chain integrity is intact.
                            </p>
                        </div>
                    )}

                    {/* Rerun Button */}
                    <div className="text-center">
                        <button
                            onClick={() => {
                                setResult(null);
                                runFullVerification();
                            }}
                            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Run Verification Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
