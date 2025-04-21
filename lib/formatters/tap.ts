import { WebhookPayload } from '../webhook-verifier.js';

/**
 * TAP Payments formatter
 * Formats the payload according to TAP's webhook signature requirements
 */
export const tap = (payload: WebhookPayload): string => {
  const CURRENCY_DECIMALS: Record<string, number> = {
    'BHD': 3,
    'KWD': 3,
    'OMR': 3,
    'AED': 2,
    'SAR': 2,
    'QAR': 2,
    'USD': 2,
    'EUR': 2,
    'GBP': 2,
    'EGP': 2
  };

  function formatAmount(amount: number, currency: string): string {
    const decimals = CURRENCY_DECIMALS[currency] || 2;
    return Number(amount).toFixed(decimals);
  }
  
  const fields = [
    `x_id${payload.id || ''}`,
    `x_amount${payload.amount ? formatAmount(payload.amount, payload.currency || 'USD') : ''}`,
    `x_currency${payload.currency || ''}`
  ];

  // Add invoice-specific fields
  if (payload.object === 'invoice') {
    fields.push(
      `x_updated${payload.updated || ''}`,
      `x_status${payload.status || ''}`,
      `x_created${payload.created || ''}`
    );
  }

  // Add transaction-specific fields
  if (['charge', 'authorize', 'refund'].includes(payload.object || '') && 
      'transaction' in payload && 'reference' in payload) {
    fields.push(
      `x_gateway_reference${payload.reference?.gateway || ''}`,
      `x_payment_reference${payload.reference?.payment || ''}`,
      `x_status${payload.status || ''}`,
      `x_created${payload.transaction?.created || ''}`
    );
  }

  return fields.join('');
};