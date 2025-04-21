import { WebhookConfig } from '../webhook-verifier';
/**
 * Configuration template for Tap webhooks
 * Note: You must provide your own secretKey when using this config
 */
declare const tapConfig: Omit<WebhookConfig, 'secretKey'>;
export default tapConfig;
