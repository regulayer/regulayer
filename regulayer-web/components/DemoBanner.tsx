"use client";

/**
 * DemoBanner - Non-dismissible demo environment warning
 * 
 * Phase I.1: This banner CANNOT be hidden by demo orgs.
 * It informs users that they are viewing demo data.
 */

interface DemoBannerProps {
    className?: string;
}

export function DemoBanner({ className = "" }: DemoBannerProps) {
    return (
        <div
            className={`bg-amber-500 text-black px-4 py-2 text-center font-medium text-sm ${className}`}
            role="alert"
            aria-live="polite"
        >
            ⚠️ You are viewing demo data. Proofs are cryptographically valid, but this environment is not production.
        </div>
    );
}

export default DemoBanner;
