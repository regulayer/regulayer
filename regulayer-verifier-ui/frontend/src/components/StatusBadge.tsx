/**
 * Regulayer Verification UI -  Status Badge Component
 */

import React from 'react';

interface StatusBadgeProps {
    status: 'PASS' | 'FAIL' | 'UNKNOWN' | 'completed' | 'failed';
    size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
    const getStyles = () => {
        const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium';

        const sizeStyles = {
            sm: 'px-2 py-1 text-xs',
            md: 'px-3 py-1 text-sm',
            lg: 'px-4 py-2 text-base',
        };

        const statusStyles = {
            PASS: 'bg-green-100 text-green-800 border border-green-300',
            FAIL: 'bg-red-100 text-red-800 border border-red-300',
            UNKNOWN: 'bg-gray-100 text-gray-800 border border-gray-300',
            completed: 'bg-blue-100 text-blue-800 border border-blue-300',
            failed: 'bg-orange-100 text-orange-800 border border-orange-300',
        };

        return `${baseStyles} ${sizeStyles[size]} ${statusStyles[status]}`;
    };

    return (
        <span className={getStyles()}>
            {status.toUpperCase()}
        </span>
    );
};
