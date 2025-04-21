import crypto from 'node:crypto'

// Types
export interface WebhookPayload {
  [key: string]: any
}

export interface VerificationResult {
  isValid: boolean
  error?: string
  data?: any
}

export interface WebhookConfig {
  secretKey: string
  signatureHeader: string
  signaturePrefix?: string
  hashAlgorithm?: string
  encoding?: 'hex' | 'base64'
  payloadFormatter?: (payload: WebhookPayload) => string
}

// Provider-specific configurations
export const WEBHOOK_CONFIGS: Record<string, WebhookConfig> = {
  invoiless: {
    secretKey: process.env.INVOILESS_SECRET_KEY || '',
    signatureHeader: 'invoiless-signature',
    signaturePrefix: 'sha256=',
    hashAlgorithm: 'sha256',
    encoding: 'base64'
  },
  tap: {
    secretKey: process.env.SECRET_KEY || '',
    signatureHeader: 'hashstring',
    hashAlgorithm: 'sha256',
    encoding: 'hex'
  }
}

export class WebhookVerifier {
  private config: WebhookConfig

  constructor(config: WebhookConfig) {
    this.config = {
      hashAlgorithm: 'sha256',
      encoding: 'hex',
      ...config
    }

    if (!this.config.secretKey) {
      throw new Error('Secret key is required')
    }
    if (!this.config.signatureHeader) {
      throw new Error('Signature header name is required')
    }
  }

  private generateHash(payload: string): string {
    const hmac = crypto.createHmac(this.config.hashAlgorithm!, this.config.secretKey)
    hmac.update(payload)
    return hmac.digest(this.config.encoding!)
  }

  private formatSignature(hash: string): string {
    if (this.config.signaturePrefix) {
      return `${this.config.signaturePrefix}${hash}`
    }
    return hash
  }

  private formatPayload(payload: WebhookPayload): string {
    if (this.config.payloadFormatter) {
      return this.config.payloadFormatter(payload)
    }
    return JSON.stringify(payload)
  }

  verify(payload: WebhookPayload, signature: string): VerificationResult {
    try {
      if (!signature) {
        return {
          isValid: false,
          error: 'Missing signature'
        }
      }

      const formattedPayload = this.formatPayload(payload)
      const hash = this.generateHash(formattedPayload)
      const generatedSignature = this.formatSignature(hash)

      console.log('Webhook verification:', {
        header: this.config.signatureHeader,
        receivedSignature: signature,
        generatedSignature,
        receivedPayload: payload,
        formattedPayload
      })

      if (signature !== generatedSignature) {
        return {
          isValid: false,
          error: 'Invalid signature'
        }
      }

      return {
        isValid: true,
        data: payload
      }
    } catch (error) {
      console.error('Webhook verification error:', error)
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error during verification'
      }
    }
  }
}

// Example usage:
/*
// Example 1: Simple JSON payload with base64 signature
const simpleVerifier = new WebhookVerifier({
  secretKey: process.env.SECRET_KEY,
  signatureHeader: 'x-signature',
  encoding: 'base64'
})

// Example 2: Custom payload formatting
const customVerifier = new WebhookVerifier({
  secretKey: process.env.SECRET_KEY,
  signatureHeader: 'x-signature',
  payloadFormatter: (payload) => {
    // Custom formatting logic
    return `${payload.id}:${payload.timestamp}:${JSON.stringify(payload.data)}`
  }
})

// Example 3: With signature prefix
const prefixedVerifier = new WebhookVerifier({
  secretKey: process.env.SECRET_KEY,
  signatureHeader: 'x-signature',
  signaturePrefix: 'sha256=',
  encoding: 'base64'
})

// Usage in an API route
const result = verifier.verify(req.body, req.headers['x-signature'])

if (!result.isValid) {
  return res.status(401).json({
    status: 'invalid',
    error: result.error
  })
}

// Process the verified webhook data
console.log('Verified webhook data:', result.data)
*/
