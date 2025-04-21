import { WebhookConfig } from '../webhook-verifier.js';
import { tap as tapFormatter } from '../formatters/index.js';

/**
 * Configuration template for Tap webhooks
 * Note: You must provide your own secretKey when using this config
 */
export const tap: Omit<WebhookConfig, 'secretKey'> = {
  signatureHeader: 'hashstring',
  hashAlgorithm: 'sha256',
  encoding: 'hex',
  payloadFormatter: tapFormatter
}; 