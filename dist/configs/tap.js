import { tap as tapFormatter } from '../formatters/index.js';
/**
 * Configuration template for Tap webhooks
 * Note: You must provide your own secretKey when using this config
 */
export const tap = {
    signatureHeader: 'hashstring',
    hashAlgorithm: 'sha256',
    encoding: 'hex',
    payloadFormatter: tapFormatter
};
