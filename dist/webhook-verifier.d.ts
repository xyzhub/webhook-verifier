export interface WebhookPayload {
    [key: string]: any;
}
export interface VerificationResult {
    isValid: boolean;
    error?: string;
    data?: any;
}
export interface WebhookConfig {
    secretKey: string;
    signatureHeader: string;
    signaturePrefix?: string;
    hashAlgorithm?: string;
    encoding?: 'hex' | 'base64';
    payloadFormatter?: (payload: WebhookPayload) => string;
}
export declare const WEBHOOK_CONFIGS: Record<string, WebhookConfig>;
export declare class WebhookVerifier {
    private config;
    constructor(config: WebhookConfig);
    private generateHash;
    private formatSignature;
    private formatPayload;
    verify(payload: WebhookPayload, signature: string): VerificationResult;
}
