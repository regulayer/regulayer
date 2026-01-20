/**
 * Regulayer Verification UI - API Client
 * 
 * READ-ONLY: All requests are GET-only.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface ChainStatus {
    chain_id: string;
    total_records: number;
    first_record_timestamp: string | null;
    last_record_timestamp: string | null;
    integrity_status: 'PASS' | 'FAIL' | 'UNKNOWN';
    failure_reason: string | null;
}

export interface VerificationResult {
    is_valid: boolean;
    total_records_checked: number;
    broken_at_record_id: number | null;
    verification_duration_ms: number;
    errors: string[];
}

export interface DecisionSummary {
    decision_id: string;
    record_id: number;
    server_timestamp: string;
    system_name: string;
    event_state: string;
    record_hash: string;
}

export interface DecisionListResponse {
    decisions: DecisionSummary[];
    total: number;
    limit: number;
    offset: number;
}

export interface DecisionDetail {
    decision_id: string;
    record_id: number;
    record_hash: string;
    previous_record_hash: string | null;
    canonical_payload: any;
    canonical_payload_hash: string;
    sdk_instance_id: string;
    server_timestamp: string;
    system_name: string;
    risk_level: string;
    event_state: string;
    sdk_version: string;
    verification_status: string;
}

export interface SpotVerification {
    decision_id: string;
    hash_matches: boolean;
    chain_link_valid: boolean;
    record_valid: boolean;
    verification_timestamp: string;
}

export const verifierAPI = {
    // Chain verification
    getChainStatus: async (): Promise<ChainStatus> => {
        const { data } = await client.get('/v1/verify/chain');
        return data;
    },

    runFullVerification: async (): Promise<VerificationResult> => {
        const { data } = await client.get('/v1/verify/chain/full');
        return data;
    },

    // Decision list
    getDecisions: async (limit: number = 100, offset: number = 0): Promise<DecisionListResponse> => {
        const { data } = await client.get('/v1/decisions', { params: { limit, offset } });
        return data;
    },

    // Decision detail
    getDecisionDetail: async (decisionId: string): Promise<DecisionDetail> => {
        const { data } = await client.get(`/v1/decisions/${decisionId}`);
        return data;
    },

    // Spot verification
    verifyDecision: async (decisionId: string): Promise<SpotVerification> => {
        const { data } = await client.get(`/v1/verify/decision/${decisionId}`);
        return data;
    },
};
