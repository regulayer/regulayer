/**
 * Regulayer Verification UI - Hash Display Component
 */

import React, { useState } from 'react';

interface HashDisplayProps {
    hash: string;
    label?: string;
    truncate?: boolean;
}

export const HashDisplay: React.FC<HashDisplayProps> = ({ hash, label, truncate = false }) => {
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(!truncate);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(hash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const displayHash = expanded ? hash : `${hash.slice(0, 16)}...${hash.slice(-16)}`;

    return (
        <div className="flex flex-col space-y-1">
            {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
            <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded p-2">
                <code className="flex-1 font-mono text-sm text-gray-900">
                    {displayHash}
                </code>
                {truncate && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                        {expanded ? 'Collapse' : 'Expand'}
                    </button>
                )}
                <button
                    onClick={copyToClipboard}
                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
        </div>
    );
};
