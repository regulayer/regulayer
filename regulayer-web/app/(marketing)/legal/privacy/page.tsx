
import React from 'react';

export default function PrivacyPage() {
    return (
        <div>
            <h1>Privacy Policy</h1>
            <p className="lead">Last Updated: February 2026</p>

            <h2>1. Data We Collect</h2>
            <p>
                Regulayer collects the minimum amount of data necessary to provide our service:
            </p>
            <ul>
                <li><strong>Account Info:</strong> Email address, organization name, and billing details (processed via Stripe).</li>
                <li><strong>System usage:</strong> API logs, usage metrics, and audit logs for security.</li>
                <li><strong>Ingested Data:</strong> The content of the decisions you ingest.</li>
            </ul>

            <h2>2. How We Use Data</h2>
            <p>
                We use your data solely to:
            </p>
            <ul>
                <li>Provide the cryptographic verification service.</li>
                <li>Bill for services rendered.</li>
                <li>Comply with legal obligations.</li>
            </ul>
            <p>
                <strong>We do not sell your data.</strong> We do not use your ingested decision data for training general AI models.
            </p>

            <h2>3. Data Immutability</h2>
            <p>
                Due to the nature of our service (immutable cryptographic ledger), records ingested into the Regulayer system cannot be deleted or modified once finalized, in accordance with audit requirements.
                If you ingest personal data, please ensure you have the necessary consent and legal basis to do so in an immutable format.
            </p>

            <h2>4. Data Security</h2>
            <p>
                We implement industry-standard security measures, including encryption at rest and in transit, strict access controls, and regular security audits.
            </p>

            <h2>5. Contact Us</h2>
            <p>
                For privacy-related inquiries, please contact <a href="mailto:privacy@regulayer.tech">privacy@regulayer.tech</a>.
            </p>
        </div>
    );
}
