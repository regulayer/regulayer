
import React from 'react';
import { ShieldCheck, Download, ExternalLink } from 'lucide-react';

export default function ContinuityPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl prose prose-slate">
            <h1>Trust & Continuity Promise</h1>
            <p className="lead">
                We believe that your evidence belongs to you, forever. Our architecture ensures that your proofs remain verifiable even if Regulayer ceases to exist.
            </p>

            <h2>1. The "Kill Switch" Mechanism</h2>
            <p>
                Regulayer creates self-contained, cryptographically verifiable proof bundles. These bundles depend on standard algorithms (SHA-256, Ed25519, Merkle Trees), not on our servers.
            </p>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6 not-prose">
                <div className="flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-green-600 mt-1" />
                    <div>
                        <strong className="block text-green-900">Verification Guarantee</strong>
                        <p className="text-green-800 text-sm mt-1">
                            You can verify any exported Decision Bundle offline, using open-source tools, without contacting Regulayer API.
                        </p>
                    </div>
                </div>
            </div>

            <h2>2. Open Source Reference Tools</h2>
            <p>
                To guarantee long-term access, we publish our core verification logic and reference implementations as open source software (MIT License).
            </p>
            <ul>
                <li>
                    <a href="https://github.com/regulayer/regulayer-evidence-standard" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
                        regulayer-evidence-standard <ExternalLink className="w-3 h-3" />
                    </a>
                    <br />
                    <span className="text-sm text-slate-500">Formal specification of the JSON proof format and cryptographic structure.</span>
                </li>
                <li>
                    <a href="https://github.com/regulayer/regulayer-reference-verifier" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
                        regulayer-reference-verifier <ExternalLink className="w-3 h-3" />
                    </a>
                    <br />
                    <span className="text-sm text-slate-500">Standalone Python/JS script to verify bundles offline.</span>
                </li>
                <li>
                    <a href="https://github.com/regulayer/regulayer-trust-registry-snapshot" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
                        regulayer-trust-registry-snapshot <ExternalLink className="w-3 h-3" />
                    </a>
                    <br />
                    <span className="text-sm text-slate-500">Daily snapshots of our root public keys (anchored in transparency logs).</span>
                </li>
            </ul>

            <h2>3. Escrow Statement</h2>
            <p>
                In the event of a discontinuation of the Cloud Service:
            </p>
            <ol>
                <li>We will provide a 90-day window for bulk export of all organization data.</li>
                <li>We will publish the final root hash of the global Merkle Tree to the Ethereum blockchain (or comparable public ledger) as a final trust anchor.</li>
                <li>We will release a Docker container capable of hosting the Verification API in a read-only mode for self-hosting.</li>
            </ol>

            <div className="mt-12 p-6 bg-slate-900 text-white rounded-xl not-prose">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Download Verification Kit
                </h3>
                <p className="text-slate-300 text-sm mb-4">
                    Includes the offline verifier script, the latest root key snapshot, and the evidence standard spec.
                </p>
                <button className="px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors">
                    Download Kit (v1.0.2)
                </button>
            </div>
        </div>
    );
}
