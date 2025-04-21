import { WebhookConfig } from '../webhook-verifier';
/**
 * Configuration template for Invoiless webhooks
 * Note: You must provide your own secretKey when using this config
 */
declare const invoilessConfig: Omit<WebhookConfig, 'secretKey'>;
export default invoilessConfig;
