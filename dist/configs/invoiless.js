import { invoiless as invoilessFormatter } from '../formatters/index.js';
/**
 * Configuration template for Invoiless webhooks
 * Note: You must provide your own secretKey when using this config
 */
export const invoiless = {
    signatureHeader: 'x-webhook-signature',
    hashAlgorithm: 'sha256',
    encoding: 'hex',
    payloadFormatter: invoilessFormatter
};
