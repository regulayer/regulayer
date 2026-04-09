'use client';

import { useState } from 'react';
import {
    Globe, Lock, CheckCircle,
    Shield, Download
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

type ResidencyRegion = 'eu' | 'india' | 'us' | 'us_gov' | 'global';

interface RegionConfig {
    id: ResidencyRegion;
    name: string;
    code: string;
    flag: string;
    frameworks: string[];
    description: string;
}

// ============================================================
// Region Configurations
// ============================================================

const REGIONS: RegionConfig[] = [
    {
        id: 'eu',
        name: 'European Union',
        code: 'EU',
        flag: '🇪🇺',
        frameworks: ['GDPR', 'AI Act'],
        description: 'Data stored and processed in EU data centers',
    },
    {
        id: 'india',
        name: 'India',
        code: 'IN',
        flag: '🇮🇳',
        frameworks: ['DPDP Act'],
        description: 'Data stored and processed in India data centers',
    },
    {
        id: 'us',
        name: 'United States',
        code: 'US',
        flag: '🇺🇸',
        frameworks: [],
        description: 'Data stored and processed in US data centers',
    },
    {
        id: 'us_gov',
        name: 'US Government',
        code: 'US-GOV',
        flag: '🏛️',
        frameworks: ['FedRAMP'],
        description: 'Government cloud with enhanced security',
    },
    {
        id: 'global',
        name: 'Global',
        code: 'GLOBAL',
        flag: '🌍',
        frameworks: [],
        description: 'No regional restrictions',
    },
];

// ============================================================
// Region Card
// ============================================================

function RegionCard({
    region,
    isPrimary,
    isAllowed,
    isLocked,
    onToggle,
    onSetPrimary
}: {
    region: RegionConfig;
    isPrimary: boolean;
    isAllowed: boolean;
    isLocked: boolean;
    onToggle: () => void;
    onSetPrimary: () => void;
}) {
    return (
        <div className={`rounded-xl border-2 p-4 transition-all ${isPrimary
            ? 'border-primary-500 bg-primary-50'
            : isAllowed
                ? 'border-green-300 bg-green-50'
                : 'border-border bg-card'
            }`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{region.flag}</span>
                    <div>
                        <h3 className="font-semibold text-foreground">{region.name}</h3>
                        <p className="text-xs text-muted-foreground">{region.code}</p>
                    </div>
                </div>
                {isPrimary && (
                    <span className="bg-slate-800 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        {isLocked && <Lock className="w-3 h-3" />}
                        Primary
                    </span>
                )}
            </div>

            <p className="text-sm text-muted-foreground mb-3">{region.description}</p>

            {region.frameworks.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {region.frameworks.map((f) => (
                        <span key={f} className="text-xs text-zinc-100 bg-slate-900 px-2 py-0.5 rounded">
                            {f}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-border">
                {!isPrimary && (
                    <>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isAllowed}
                                onChange={onToggle}
                                disabled={isPrimary}
                                className="rounded"
                            />
                            <span className="text-foreground">Allowed</span>
                        </label>
                        {isAllowed && !isLocked && (
                            <button
                                onClick={onSetPrimary}
                                className="text-xs bg-slate-800 hover:underline ml-auto"
                            >
                                Set as Primary
                            </button>
                        )}
                    </>
                )}
                {isPrimary && isLocked && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Locked after first ingest
                    </span>
                )}
            </div>
        </div>
    );
}

// ============================================================
// Main Residency Settings Page
// ============================================================

export default function ResidencySettingsPage() {
    const [primaryRegion, setPrimaryRegion] = useState<ResidencyRegion>('eu');
    const [allowedRegions, setAllowedRegions] = useState<ResidencyRegion[]>(['eu']);
    const [isLocked] = useState(true); // Locked after first ingest

    const toggleRegion = (regionId: ResidencyRegion) => {
        if (regionId === primaryRegion) return; // Can't remove primary
        if (allowedRegions.includes(regionId)) {
            setAllowedRegions(allowedRegions.filter((r) => r !== regionId));
        } else {
            setAllowedRegions([...allowedRegions, regionId]);
        }
    };

    const setAsPrimary = (regionId: ResidencyRegion) => {
        if (isLocked) return;
        setPrimaryRegion(regionId);
        if (!allowedRegions.includes(regionId)) {
            setAllowedRegions([...allowedRegions, regionId]);
        }
    };

    return (
        <div className="min-h-screen bg-secondary">
            <div className="px-6 md:px-10 py-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Globe className="w-6 h-6 text-muted-foreground" />
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Data Residency</h1>
                        <p className="text-muted-foreground">Control where your data is stored and processed</p>
                    </div>
                </div>

                {/* Trust Disclaimer */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                        <p className="text-green-800 text-sm font-medium">Cryptographic Validity Unchanged</p>
                        <p className="text-green-700 text-sm">
                            Residency controls where data lives, not what can be proven.
                            Proofs exported from any region verify identically worldwide.
                        </p>
                    </div>
                </div>

                {/* Region Locked Warning */}
                {isLocked && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <Lock className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                            <p className="text-amber-800 text-sm font-medium">Primary Region Locked</p>
                            <p className="text-amber-700 text-sm">
                                Your primary region was locked after the first decision was recorded.
                                Changing residency does not move historical records.
                            </p>
                        </div>
                    </div>
                )}

                {/* Regions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {REGIONS.map((region) => (
                        <RegionCard
                            key={region.id}
                            region={region}
                            isPrimary={region.id === primaryRegion}
                            isAllowed={allowedRegions.includes(region.id)}
                            isLocked={isLocked}
                            onToggle={() => toggleRegion(region.id)}
                            onSetPrimary={() => setAsPrimary(region.id)}
                        />
                    ))}
                </div>

                {/* Export Guarantees */}
                <div className="bg-card rounded-xl border border-border p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Download className="w-5 h-5 text-muted-foreground" />
                        <h3 className="font-semibold text-foreground">Export Guarantees</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Export is <strong>always available</strong> regardless of:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {['Active', 'Frozen', 'Org Closed', 'Region Outage', 'Regulayer Down'].map((state) => (
                            <div key={state} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-foreground">{state}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Compliance Frameworks */}
                <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-semibold text-foreground mb-4">Supported Frameworks</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">🇪🇺</span>
                            <div>
                                <span className="font-medium text-foreground">EU: GDPR, AI Act</span>
                                <p className="text-muted-foreground">Supports data residency requirements</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-xl">🇮🇳</span>
                            <div>
                                <span className="font-medium text-foreground">India: DPDP Act</span>
                                <p className="text-muted-foreground">Supports local storage requirements</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-xl">🏛️</span>
                            <div>
                                <span className="font-medium text-foreground">US Gov: FedRAMP</span>
                                <p className="text-muted-foreground">Supports government cloud requirements</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                        Note: Regulayer &quot;supports&quot; and &quot;enables&quot; compliance. This does not constitute legal advice.
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground mt-8">
                    Jurisdiction controls storage and access — never evidence, hashes, or verification semantics.
                </p>
            </div>
        </div>
    );
}

