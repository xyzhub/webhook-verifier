import { WebhookPayload } from '../webhook-verifier.js';

/**
 * Invoiless webhook formatter
 */
export const invoiless = (payload: WebhookPayload): string => {
  return JSON.stringify(payload);
}; 