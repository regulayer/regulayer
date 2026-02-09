
import React from 'react';

export default function DPAPage() {
    return (
        <div>
            <h1>Data Processing Addendum (DPA)</h1>
            <p className="lead">Last Updated: February 2026</p>

            <p>
                This Data Processing Addendum ("DPA") forms part of the Regulayer Terms of Service and applies to the processing of Personal Data by Regulayer on behalf of the Customer.
            </p>

            <h2>1. Definitions</h2>
            <p>
                Terms such as "Controller", "Processor", "Data Subject", and "Personal Data" shall have the meanings given to them in the GDPR.
            </p>

            <h2>2. Roles</h2>
            <ul>
                <li><strong>Customer</strong> acts as the Data Controller.</li>
                <li><strong>Regulayer</strong> acts as the Data Processor.</li>
            </ul>

            <h2>3. Processing Details</h2>
            <p>
                Regulayer processes Personal Data only on documented instructions from the Customer (i.e., via API ingestion) and for the purpose of providing the Service.
            </p>

            <h2>4. Security Measures</h2>
            <p>
                Regulayer implements appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including pseudonymization and encryption of Personal Data.
            </p>

            <h2>5. Sub-processors</h2>
            <p>
                Customer authorizes Regulayer to engage sub-processors (e.g., AWS, Stripe) to provide the Service. We maintain a list of current sub-processors.
            </p>

            <h2>6. International Transfers</h2>
            <p>
                Data may be transferred to and processed in the United States. We rely on Standard Contractual Clauses (SCCs) for such transfers unless an adequacy decision applies.
            </p>
        </div>
    );
}
