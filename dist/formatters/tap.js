"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Custom formatter for Tap webhooks
 * @param payload The webhook payload to format
 * @returns Formatted string for Tap webhook verification
 */
exports.default = (payload) => {
    var _a, _b, _c;
    const CURRENCY_DECIMALS = {
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
    function formatAmount(amount, currency) {
        const decimals = CURRENCY_DECIMALS[currency] || 2;
        return Number(amount).toFixed(decimals);
    }
    const fields = [
        `x_id${payload.id}`,
        `x_amount${formatAmount(payload.amount, payload.currency)}`,
        `x_currency${payload.currency}`
    ];
    // Add invoice-specific fields
    if (payload.object === 'invoice') {
        fields.push(`x_updated${payload.updated || ''}`, `x_status${payload.status}`, `x_created${payload.created}`);
    }
    // Add transaction-specific fields for charge, authorize, and refund
    if (['charge', 'authorize', 'refund'].includes(payload.object)) {
        // Add status and created fields regardless of reference existence
        // Add reference fields only if reference object exists
        if ('reference' in payload && payload.reference) {
            fields.push(`x_gateway_reference${((_a = payload.reference) === null || _a === void 0 ? void 0 : _a.gateway) || ''}`, `x_payment_reference${((_b = payload.reference) === null || _b === void 0 ? void 0 : _b.payment) || ''}`);
        }
        if (payload.status) {
            fields.push(`x_status${payload.status}`);
        }
        if ('transaction' in payload && payload.transaction) {
            fields.push(`x_created${((_c = payload.transaction) === null || _c === void 0 ? void 0 : _c.created) || ''}`);
        }
    }
    return fields.join('');
};
