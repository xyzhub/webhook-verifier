"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formatters_1 = require("../formatters");
/**
 * Configuration template for Invoiless webhooks
 * Note: You must provide your own secretKey when using this config
 */
const invoilessConfig = {
    signatureHeader: 'invoiless-signature',
    signaturePrefix: 'sha256=',
    hashAlgorithm: 'sha256',
    encoding: 'base64',
    payloadFormatter: formatters_1.invoiless
};
exports.default = invoilessConfig;
