/**
 * TAP Payments formatter
 * Formats the payload according to TAP's webhook signature requirements
 */
export const tap = (payload) => {
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
        `x_id${payload.id || ''}`,
        `x_amount${payload.amount ? formatAmount(payload.amount, payload.currency || 'USD') : ''}`,
        `x_currency${payload.currency || ''}`
    ];
    // Add invoice-specific fields
    if (payload.object === 'invoice') {
        fields.push(`x_updated${payload.updated || ''}`, `x_status${payload.status || ''}`, `x_created${payload.created || ''}`);
    }
    // Add transaction-specific fields
    if (['charge', 'authorize', 'refund'].includes(payload.object || '') &&
        'transaction' in payload && 'reference' in payload) {
        fields.push(`x_gateway_reference${((_a = payload.reference) === null || _a === void 0 ? void 0 : _a.gateway) || ''}`, `x_payment_reference${((_b = payload.reference) === null || _b === void 0 ? void 0 : _b.payment) || ''}`, `x_status${payload.status || ''}`, `x_created${((_c = payload.transaction) === null || _c === void 0 ? void 0 : _c.created) || ''}`);
    }
    return fields.join('');
};
