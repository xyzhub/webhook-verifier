import { WebhookPayload } from '../webhook-verifier.js';
/**
 * TAP Payments formatter
 * Formats the payload according to TAP's webhook signature requirements
 */
export declare const tap: (payload: WebhookPayload) => string;
