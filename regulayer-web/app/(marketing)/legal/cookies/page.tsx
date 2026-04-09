"use client";

import React from "react";

export default function CookiesPage() {
    return (
        <div className="max-w-3xl mx-auto py-16 px-6">
            <div className="mb-12 border-b border-slate-200 pb-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Cookie Policy</h1>
                <p className="text-slate-500">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600">
                <h2>1. Introduction</h2>
                <p>Welcome to Regulayer. This document outlines the Cookie Policy governing your use of our cryptographic trust layer and associated APIs.</p>

                <h2>2. Data Handling & Security</h2>
                <p>As a SOC 2 Type II compliant service, Regulayer treats your data with the highest security standards. All data is encrypted at rest using AES-256 and in transit via TLS 1.3.</p>

                <h2>3. Compliance Frameworks</h2>
                <p>By using Regulayer, you agree to our processing conditions designed to help you achieve compliance with the EU AI Act, NIST AI RMF, and internal governance requirements.</p>

                <h2>4. Contact Information</h2>
                <p>For any inquiries regarding this Cookie Policy, please contact our legal team at legal@regulayer.tech or our Data Protection Officer at dpo@regulayer.tech.</p>
            </div>
        </div>
    );
}