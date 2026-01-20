/**
 * Regulayer Verification UI - Main App with Routing
 */

import React from 'react';
import { ChainOverview } from './pages/ChainOverview';
import { DecisionList } from './pages/DecisionList';
import { DecisionDetail } from './pages/DecisionDetail';
import { VerificationReport } from './pages/VerificationReport';
import './index.css';

// Simple hash-based routing
function App() {
    const [currentPage, setCurrentPage] = React.useState('overview');
    const [params, setParams] = React.useState<Record<string, string>>({});

    React.useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.slice(1) || '/';
            const [path, ...paramParts] = hash.split('/').filter(Boolean);

            if (!path) {
                setCurrentPage('overview');
            } else if (path === 'decisions' && paramParts.length > 0) {
                setCurrentPage('decision-detail');
                setParams({ decisionId: paramParts[0] });
            } else if (path === 'decisions') {
                setCurrentPage('decision-list');
            } else if (path === 'verify' && paramParts.length > 0) {
                setCurrentPage('decision-detail');
                setParams({ decisionId: paramParts[0] });
            } else if (path === 'verify') {
                setCurrentPage('verification-report');
            } else {
                setCurrentPage('overview');
            }
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const renderPage = () => {
        switch (currentPage) {
            case 'decision-list':
                return <DecisionList />;
            case 'decision-detail':
                return <DecisionDetail />;
            case 'verification-report':
                return <VerificationReport />;
            default:
                return <ChainOverview />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <nav className="bg-white border-b border-gray-200 px-8 py-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Regulayer Verification UI</h1>
                    <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm font-semibold">
                            READ-ONLY
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            Internal Forensic Tool
                        </span>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="flex space-x-6 text-sm">
                    <a
                        href="#/"
                        className={`hover:text-blue-600 ${currentPage === 'overview' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}
                    >
                        Chain Overview
                    </a>
                    <a
                        href="#/decisions"
                        className={`hover:text-blue-600 ${currentPage === 'decision-list' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}
                    >
                        Decision Records
                    </a>
                    <a
                        href="#/verify"
                        className={`hover:text-blue-600 ${currentPage === 'verification-report' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}
                    >
                        Verification Report
                    </a>
                </div>
            </nav>

            <main className="flex-1">
                {renderPage()}
            </main>

            <footer className="bg-white border-t border-gray-200 px-8 py-4">
                <div className="text-sm text-gray-600 text-center space-y-1">
                    <p>
                        ⚠️ <strong>Internal forensic tool</strong> - Not for regulator-facing evidence submission.
                    </p>
                    <p className="text-xs text-gray-500">
                        This UI is READ-ONLY. All verification happens server-side. No POST/PUT/DELETE requests allowed.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default App;
