import { WebhookConfig } from '../webhook-verifier.js';
import { invoiless as invoilessFormatter } from '../formatters/index.js';

/**
 * Configuration template for Invoiless webhooks
 * Note: You must provide your own secretKey when using this config
 */
export const invoiless: Omit<WebhookConfig, 'secretKey'> = {
  signatureHeader: 'x-webhook-signature',
  hashAlgorithm: 'sha256',
  encoding: 'hex',
  payloadFormatter: invoilessFormatter
}; 