"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formatters_1 = require("../formatters");
/**
 * Configuration template for Tap webhooks
 * Note: You must provide your own secretKey when using this config
 */
const tapConfig = {
    signatureHeader: 'hashstring',
    hashAlgorithm: 'sha256',
    encoding: 'hex',
    payloadFormatter: formatters_1.tap
};
exports.default = tapConfig;
