import { WebhookConfig } from '../webhook-verifier';
import { tap } from '../formatters';

/**
 * Configuration template for Tap webhooks
 * Note: You must provide your own secretKey when using this config
 */
const tapConfig: Omit<WebhookConfig, 'secretKey'> = {
  signatureHeader: 'hashstring',
  hashAlgorithm: 'sha256',
  encoding: 'hex',
  payloadFormatter: tap
};

export default tapConfig; 