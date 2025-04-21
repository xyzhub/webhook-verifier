"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Custom formatter for Invoiless webhooks
 * @param payload The webhook payload to format
 * @returns Formatted string for Invoiless webhook verification
 */
exports.default = (payload) => {
    return JSON.stringify(payload);
};
