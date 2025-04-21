import { WebhookPayload } from '../webhook-verifier';

/**
 * Custom formatter for Invoiless webhooks
 * @param payload The webhook payload to format
 * @returns Formatted string for Invoiless webhook verification
 */
export default (payload: WebhookPayload): string => {
  return JSON.stringify(payload);
} 