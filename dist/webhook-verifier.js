import crypto from 'node:crypto';
export class WebhookVerifier {
    constructor(config) {
        this.config = {
            debug: false,
            hashAlgorithm: 'sha256',
            encoding: 'hex',
            ...config
        };
        if (!this.config.secretKey) {
            throw new Error('Secret key is required');
        }
        if (!this.config.signatureHeader) {
            throw new Error('Signature header name is required');
        }
    }
    generateHash(payload) {
        const hmac = crypto.createHmac(this.config.hashAlgorithm, this.config.secretKey);
        hmac.update(payload);
        return hmac.digest(this.config.encoding);
    }
    formatSignature(hash) {
        if (this.config.signaturePrefix) {
            return `${this.config.signaturePrefix}${hash}`;
        }
        return hash;
    }
    formatPayload(payload) {
        if (this.config.payloadFormatter) {
            return this.config.payloadFormatter(payload);
        }
        return JSON.stringify(payload);
    }
    /**
     * Extract signature from headers using the configured signatureHeader
     * @param headers The headers object from the HTTP request
     * @returns The extracted signature or undefined if not found
     */
    extractSignature(headers) {
        // Handle case insensitivity in headers
        const headerName = this.config.signatureHeader.toLowerCase();
        // First try direct access
        let signature = headers[headerName];
        // If not found, try to find it in a case-insensitive way
        if (!signature) {
            const headerKey = Object.keys(headers).find(key => key.toLowerCase() === headerName);
            if (headerKey) {
                signature = headers[headerKey];
            }
        }
        // Handle array of strings (some HTTP libraries do this)
        if (Array.isArray(signature)) {
            signature = signature[0];
        }
        return signature;
    }
    /**
     * Verify webhook payload with signature or extract signature from headers
     * @param payload The webhook payload to verify
     * @param signatureOrHeaders Either a signature string or headers object
     * @returns Verification result
     */
    verify(payload, signatureOrHeaders) {
        let signature;
        // Determine if the second argument is a signature string or headers object
        if (typeof signatureOrHeaders === 'string') {
            signature = signatureOrHeaders;
        }
        else if (typeof signatureOrHeaders === 'object' && signatureOrHeaders !== null) {
            // Extract signature from headers
            signature = this.extractSignature(signatureOrHeaders);
            if (!signature) {
                return {
                    isValid: false,
                    error: `Missing signature header: ${this.config.signatureHeader}`
                };
            }
        }
        else {
            return {
                isValid: false,
                error: 'Invalid signature or headers argument'
            };
        }
        try {
            if (!signature) {
                return {
                    isValid: false,
                    error: 'Missing signature'
                };
            }
            const formattedPayload = this.formatPayload(payload);
            const hash = this.generateHash(formattedPayload);
            const generatedSignature = this.formatSignature(hash);
            if (this.config.debug)
                console.log('Webhook verification:', {
                    header: this.config.signatureHeader,
                    receivedSignature: signature,
                    generatedSignature,
                    receivedPayload: payload,
                    formattedPayload
                });
            if (signature !== generatedSignature) {
                return {
                    isValid: false,
                    error: 'Invalid signature'
                };
            }
            return {
                isValid: true,
                data: payload
            };
        }
        catch (error) {
            if (this.config.debug)
                console.error('Webhook verification error:', error);
            return {
                isValid: false,
                error: error instanceof Error ? error.message : 'Unknown error during verification'
            };
        }
    }
}
// Example usage:
/*
// Example 1: Simple JSON payload with base64 signature
const verifier = new WebhookVerifier({
  secretKey: process.env.SECRET_KEY,
  signatureHeader: 'x-signature',
  encoding: 'base64'
})

// Example 2: Using with formatters
import { tap } from './formatters';
const customVerifier = new WebhookVerifier({
  secretKey: process.env.SECRET_KEY,
  signatureHeader: 'x-signature',
  payloadFormatter: tap
})

// Example 3: Using a pre-configured webhook config
import { invoiless } from './configs';
const invoilessVerifier = new WebhookVerifier({
  ...invoiless,
  secretKey: process.env.MY_SECRET_KEY // You must provide a secret key
});

// Example 4: Using with Express - pass headers directly
app.post('/webhook', (req, res) => {
  // The verifier will automatically extract the signature from req.headers
  const result = verifier.verify(req.body, req.headers)
  
  if (!result.isValid) {
    return res.status(401).json({
      status: 'error',
      error: result.error
    })
  }
  
  // Process verified webhook data
  console.log('Verified webhook data:', result.data)
  return res.status(200).json({ status: 'success' })
})

// Example 5: Using with a string signature still works
const manualResult = verifier.verify(
  payload,
  req.headers['x-signature']
)
*/
