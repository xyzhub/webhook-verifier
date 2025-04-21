import { WebhookConfig } from '../webhook-verifier';
import { invoiless } from '../formatters';

/**
 * Configuration template for Invoiless webhooks
 * Note: You must provide your own secretKey when using this config
 */
const invoilessConfig: Omit<WebhookConfig, 'secretKey'> = {
  signatureHeader: 'invoiless-signature',
  signaturePrefix: 'sha256=',
  hashAlgorithm: 'sha256',
  encoding: 'base64',
  payloadFormatter: invoiless
};

export default invoilessConfig; 