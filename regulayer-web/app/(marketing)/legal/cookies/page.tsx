
import React from 'react';

export default function CookiesPage() {
    return (
        <div>
            <h1>Cookie Policy</h1>
            <p className="lead">Last Updated: February 2026</p>

            <h2>1. What Are Cookies?</h2>
            <p>
                Cookies are small text files stored on your device when you visit our website. They help us recognize your device and settings.
            </p>

            <h2>2. How We Use Cookies</h2>
            <p>We use cookies for the following purposes:</p>
            <ul>
                <li><strong>Essential Cookies:</strong> Required for authentication, security (CSRF protection), and billing. These cannot be disabled.</li>
                <li><strong>Functional Cookies:</strong> To remember your preferences, such as language or theme.</li>
                <li><strong>Analytics Cookies:</strong> To understand how users interact with our service (e.g., page views, error rates). We use privacy-preserving analytics.</li>
            </ul>

            <h2>3. Managing Cookies</h2>
            <p>
                You can control and delete cookies through your browser settings. However, disabling essential cookies may prevent you from using the Regulayer dashboard effectively.
            </p>
        </div>
    );
}
