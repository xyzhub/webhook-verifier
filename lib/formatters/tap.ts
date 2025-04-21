import { WebhookPayload } from '../webhook-verifier';

/**
 * Custom formatter for Tap webhooks
 * @param payload The webhook payload to format
 * @returns Formatted string for Tap webhook verification
 */
export default (payload: WebhookPayload): string => {

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
    } as const

    function formatAmount(amount: number, currency: string): string {
      const decimals = CURRENCY_DECIMALS[currency] || 2
      return Number(amount).toFixed(decimals)
    }
    
    const fields = [
      `x_id${payload.id}`,
      `x_amount${formatAmount(payload.amount, payload.currency)}`,
      `x_currency${payload.currency}`
    ]

    // Add invoice-specific fields
    if (payload.object === 'invoice') {
      fields.push(
        `x_updated${payload.updated || ''}`,
        `x_status${payload.status}`,
        `x_created${payload.created}`
      )
    }

    // Add transaction-specific fields for charge, authorize, and refund
    if (['charge', 'authorize', 'refund'].includes(payload.object)) {
      // Add status and created fields regardless of reference existence
      // Add reference fields only if reference object exists
      if ('reference' in payload && payload.reference) {
        fields.push(
          `x_gateway_reference${payload.reference?.gateway || ''}`,
          `x_payment_reference${payload.reference?.payment || ''}`
        );
      }
      if (payload.status) {
        fields.push(`x_status${payload.status}`);
      }
      
      if ('transaction' in payload && payload.transaction) {
        fields.push(`x_created${payload.transaction?.created || ''}`);
      }
      
    }

    return fields.join('')
  }