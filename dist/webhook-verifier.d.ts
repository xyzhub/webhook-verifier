export interface WebhookPayload {
    [key: string]: any;
}
export interface VerificationResult {
    isValid: boolean;
    error?: string;
    data?: any;
}
export interface WebhookConfig {
    debug?: boolean;
    secretKey: string;
    signatureHeader: string;
    signaturePrefix?: string;
    hashAlgorithm?: string;
    encoding?: 'hex' | 'base64';
    payloadFormatter?: (payload: WebhookPayload) => string;
}
export declare class WebhookVerifier {
    readonly config: WebhookConfig;
    constructor(config: WebhookConfig);
    private generateHash;
    private formatSignature;
    private formatPayload;
    /**
     * Extract signature from headers using the configured signatureHeader
     * @param headers The headers object from the HTTP request
     * @returns The extracted signature or undefined if not found
     */
    private extractSignature;
    /**
     * Verify webhook payload with signature or extract signature from headers
     * @param payload The webhook payload to verify
     * @param signatureOrHeaders Either a signature string or headers object
     * @returns Verification result
     */
    verify(payload: WebhookPayload, signatureOrHeaders: string | Record<string, any>): VerificationResult;
}
