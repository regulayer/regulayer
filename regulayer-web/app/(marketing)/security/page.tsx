
import React from 'react';

export default function SecurityPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl prose prose-slate">
            <h1>Security Policy</h1>
            <p className="lead">At Regulayer, security is our core product.</p>

            <h2>1. Reporting Vulnerabilities</h2>
            <p>
                If you discover a security vulnerability, please report it immediately to <a href="mailto:security@regulayer.tech">security@regulayer.tech</a>.
                We will acknowledge your report within 24 hours.
            </p>

            <h2>2. Infrastructure Security</h2>
            <ul>
                <li><strong>Encryption:</strong> All data is encrypted at rest (AES-256) and in transit (TLS 1.2+).</li>
                <li><strong>Access Control:</strong> Strict Role-Based Access Control (RBAC) and Principle of Least Privilege.</li>
                <li><strong>Audit Logging:</strong> Comprehensive immutable audit logs for all sensitive actions.</li>
            </ul>

            <h2>3. Cryptographic Integrity</h2>
            <p>
                Our core recorder uses Ed25519 signatures and SHA-256 hash chains. Private keys are stored in hardware security modules (HSM) or secure enclaves where applicable.
                Keys are never accessible to the application layer.
            </p>

            <h2>4. Compliance</h2>
            <p>
                We undergo regular penetration testing and security audits.
            </p>
        </div>
    );
}
