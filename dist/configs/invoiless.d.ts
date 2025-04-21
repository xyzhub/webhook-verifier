import { WebhookConfig } from '../webhook-verifier.js';
/**
 * Configuration template for Invoiless webhooks
 * Note: You must provide your own secretKey when using this config
 */
export declare const invoiless: Omit<WebhookConfig, 'secretKey'>;
