
import React from 'react';

export default function TermsPage() {
    return (
        <div>
            <h1>Terms of Service</h1>
            <p className="lead">Last Updated: February 2026</p>

            <h2>1. Introduction</h2>
            <p>
                These Terms of Service ("Terms") govern your access to and use of the Regulayer platform ("Service"), provided by Regulayer Inc. ("Regulayer", "we", "us").
                By accessing or using the Service, you agree to be bound by these Terms.
            </p>

            <h2>2. Nature of Service</h2>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
                <p className="font-semibold text-amber-900 m-0">Critical Disclaimer</p>
                <p className="text-amber-800 mt-2 m-0">
                    Regulayer provides <strong>technical verification of data integrity</strong> only.
                    We verify that data has not been tampered with since the moment of ingestion.
                    We do <strong>not</strong> evaluate, certify, or guarantee the correctness, fairness, legality, or compliance of the underlying decisions or data.
                </p>
            </div>
            <p>
                Our service is limited to the cryptographic recording, timestamping, and verification of digital records. The interpretation of these records is solely the responsibility of you and your auditors.
            </p>

            <h2>3. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul>
                <li>Store illegal content or content that infringes on intellectual property rights.</li>
                <li>Attempt to manipulate the cryptographic integrity of the Service.</li>
                <li>Reverse engineer or attempt to compromise the security of the Service.</li>
            </ul>

            <h2>4. Service Levels & Availability</h2>
            <p>
                We strive for 99.9% uptime for the API and Verification services. However, we do not guarantee uninterrupted access.
                In the event of service termination, we provide tools for you to export your data and verify it independently using open-source tools.
            </p>

            <h2>5. Limitation of Liability</h2>
            <p>
                To the maximum extent permitted by law, Regulayer shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits or data.
            </p>

            <h2>6. Governing Law</h2>
            <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions.
            </p>
        </div>
    );
}
