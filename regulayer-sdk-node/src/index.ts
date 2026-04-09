/**
 * @regulayer/sdk - Node.js SDK for Regulayer
 *
 * Record provable AI decisions with tamper-detectable audit trails.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { randomUUID, createHash } from 'crypto';

// ============================================================
// Configuration
// ============================================================

export interface RegulayerOptions {
    /** API key from the Regulayer dashboard */
    apiKey: string;
    /** API endpoint (defaults to https://api.regulayer.tech) */
    endpoint?: string;
    /** Enable demo mode for rl_demo_ keys */
    demo?: boolean;
    /** Request timeout in milliseconds (default: 10000) */
    timeout?: number;
    /** Custom headers to include with every request */
    headers?: Record<string, string>;
}

// ============================================================
// Decision Types
// ============================================================

export interface Decision {
    /** Unique decision identifier (auto-generated if omitted) */
    decisionId?: string;
    /** System name that made this decision */
    system: string;
    /** Risk classification */
    riskLevel?: 'standard' | 'high' | 'critical';
    /** Model name or identifier */
    modelName?: string;
    /** Decision input data */
    input: Record<string, any>;
    /** Decision output data */
    output: Record<string, any>;
    /** Optional metadata */
    metadata?: Record<string, any>;
    /** Optional tags for categorization */
    tags?: string[];
}

export interface RecordedDecision {
    decision_id: string;
    record_id: number;
    record_hash: string;
    previous_record_hash: string | null;
    canonical_payload_hash: string;
    chain_id: string;
    server_timestamp: string;
    status: string;
}

export interface VerificationResult {
    decision_id: string;
    record_valid: boolean;
    hash_chain_valid: boolean;
    details: Record<string, any>;
}

// ============================================================
// Error Types
// ============================================================

export class RegulayerError extends Error {
    public statusCode?: number;
    public code: string;

    constructor(message: string, code: string, statusCode?: number) {
        super(message);
        this.name = 'RegulayerError';
        this.code = code;
        this.statusCode = statusCode;
    }
}

export class AuthenticationError extends RegulayerError {
    constructor(message = 'Invalid or expired API key') {
        super(message, 'AUTHENTICATION_ERROR', 401);
    }
}

export class QuotaExceededError extends RegulayerError {
    constructor(message = 'Decision quota exceeded for this billing period') {
        super(message, 'QUOTA_EXCEEDED', 429);
    }
}

export class ValidationError extends RegulayerError {
    constructor(message: string) {
        super(message, 'VALIDATION_ERROR', 422);
    }
}

// ============================================================
// Client
// ============================================================

export class RegulayerClient {
    private client: AxiosInstance;
    private options: Required<Pick<RegulayerOptions, 'apiKey' | 'endpoint' | 'demo' | 'timeout'>>;

    constructor(options: RegulayerOptions) {
        if (!options.apiKey) {
            throw new RegulayerError('API key is required', 'CONFIG_ERROR');
        }

        this.options = {
            apiKey: options.apiKey,
            endpoint: options.endpoint || 'https://api.regulayer.tech',
            demo: options.demo || false,
            timeout: options.timeout || 10000,
        };

        // Validate demo key usage
        if (this.options.apiKey.startsWith('rl_demo_') && !this.options.demo) {
            throw new RegulayerError(
                'Demo API key provided but demo mode not enabled. Pass demo: true.',
                'CONFIG_ERROR'
            );
        }

        this.client = axios.create({
            baseURL: this.options.endpoint,
            timeout: this.options.timeout,
            headers: {
                'Authorization': `Bearer ${this.options.apiKey}`,
                'X-Regulayer-Api-Key': this.options.apiKey,
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
        });
    }

    // --------------------------------------------------------
    // Hashing
    // --------------------------------------------------------

    private hashJson(data: any): string {
        if (!data || Object.keys(data).length === 0) return '';
        const canonical = JSON.stringify(data, Object.keys(data).sort());
        return createHash('sha256').update(canonical).digest('hex');
    }

    // --------------------------------------------------------
    // Error Mapping
    // --------------------------------------------------------

    private mapError(error: AxiosError): RegulayerError {
        if (!error.response) {
            return new RegulayerError(
                `Network error: ${error.message}`,
                'NETWORK_ERROR'
            );
        }

        const status = error.response.status;
        const detail = (error.response.data as any)?.detail || error.message;

        switch (status) {
            case 401:
            case 403:
                return new AuthenticationError(detail);
            case 422:
                return new ValidationError(detail);
            case 429:
                return new QuotaExceededError(detail);
            default:
                return new RegulayerError(detail, 'API_ERROR', status);
        }
    }

    // --------------------------------------------------------
    // Record Decision
    // --------------------------------------------------------

    /**
     * Record an AI decision with cryptographic proof.
     *
     * @param decision - Decision payload
     * @returns Recorded decision with hash chain proof
     */
    async recordDecision(decision: Decision): Promise<RecordedDecision> {
        const decisionId = decision.decisionId || randomUUID();
        const now = new Date().toISOString();

        const payload = {
            event_version: '2.0',
            event_state: 'completed',
            decision_id: decisionId,
            system_name: decision.system,
            risk_level: decision.riskLevel || 'standard',
            model_name: decision.modelName || 'default',
            input_hash: this.hashJson(decision.input),
            output_hash: this.hashJson(decision.output),
            input: decision.input,
            output: decision.output,
            metadata: {
                ...(decision.metadata || {}),
                tags: decision.tags || [],
            },
            start_timestamp: now,
            end_timestamp: now,
        };

        try {
            const response = await this.client.post<RecordedDecision>(
                '/v1/decisions',
                payload,
                { headers: { 'X-Request-ID': decisionId } }
            );
            return response.data;
        } catch (error) {
            throw this.mapError(error as AxiosError);
        }
    }

    // --------------------------------------------------------
    // Verify Decision
    // --------------------------------------------------------

    /**
     * Verify the integrity of a previously recorded decision.
     *
     * @param decisionId - The decision ID to verify
     * @returns Verification result with hash chain validity
     */
    async verifyDecision(decisionId: string): Promise<VerificationResult> {
        try {
            const response = await this.client.get<VerificationResult>(
                `/v1/verify/decision/${decisionId}`
            );
            return response.data;
        } catch (error) {
            throw this.mapError(error as AxiosError);
        }
    }

    // --------------------------------------------------------
    // Get Decision
    // --------------------------------------------------------

    /**
     * Retrieve a previously recorded decision by ID.
     *
     * @param decisionId - The decision ID to retrieve
     * @returns Decision record data
     */
    async getDecision(decisionId: string): Promise<RecordedDecision> {
        try {
            const response = await this.client.get<RecordedDecision>(
                `/v1/decisions/${decisionId}`
            );
            return response.data;
        } catch (error) {
            throw this.mapError(error as AxiosError);
        }
    }

    // --------------------------------------------------------
    // Verify Chain
    // --------------------------------------------------------

    /**
     * Verify the integrity of the full decision hash chain.
     *
     * @returns Chain verification result
     */
    async verifyChain(): Promise<{ is_valid: boolean; total_records_checked: number; broken_at_record_id: number | null }> {
        try {
            const response = await this.client.get('/v1/verify/chain/full');
            return response.data;
        } catch (error) {
            throw this.mapError(error as AxiosError);
        }
    }
}

// ============================================================
// Factory
// ============================================================

/**
 * Create a new Regulayer client instance.
 *
 * @example
 * ```ts
 * import { createClient } from '@regulayer/sdk';
 *
 * const client = createClient({ apiKey: 'rl_...' });
 *
 * const result = await client.recordDecision({
 *   system: 'loan-approval',
 *   input: { applicant_id: '123', income: 50000 },
 *   output: { approved: true, amount: 25000 },
 * });
 *
 * console.log('Recorded:', result.record_hash);
 * ```
 */
export function createClient(options: RegulayerOptions): RegulayerClient {
    return new RegulayerClient(options);
}

export default RegulayerClient;
