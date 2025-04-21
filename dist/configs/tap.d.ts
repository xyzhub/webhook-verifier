import { WebhookConfig } from '../webhook-verifier.js';
/**
 * Configuration template for Tap webhooks
 * Note: You must provide your own secretKey when using this config
 */
export declare const tap: Omit<WebhookConfig, 'secretKey'>;
