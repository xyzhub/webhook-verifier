# Webhook Verifier

A lightweight library for verifying webhook signatures.

## Installation

```bash
npm install webhook-verifier
```

## Usage

```typescript
import { WebhookVerifier, WebhookConfig } from 'webhook-verifier';

// Create a verifier with your configuration
const verifier = new WebhookVerifier({
  secretKey: process.env.SECRET_KEY,
  signatureHeader: 'x-signature',
  encoding: 'base64'
});

// In your webhook handler
function handleWebhook(payload, signature) {
  const result = verifier.verify(payload, signature);
  
  if (!result.isValid) {
    console.error('Invalid webhook signature:', result.error);
    return { status: 'error', message: 'Invalid signature' };
  }
  
  // Process the verified webhook data
  console.log('Verified webhook payload:', result.data);
  return { status: 'success' };
}
```

## Configuration Options

The `WebhookVerifier` accepts the following configuration options:

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| secretKey | string | Yes | - | The secret key used to verify the signature |
| signatureHeader | string | Yes | - | The header name that contains the signature |
| signaturePrefix | string | No | - | A prefix for the signature (e.g., "sha256=") |
| hashAlgorithm | string | No | "sha256" | The hashing algorithm to use |
| encoding | "hex" \| "base64" | No | "hex" | The encoding format for the signature |
| payloadFormatter | function | No | JSON.stringify | A function to format the payload before hashing |

## Predefined Configurations

The library includes predefined configurations for common webhook providers:

```typescript
import { WebhookVerifier, WEBHOOK_CONFIGS } from 'webhook-verifier';

// Using a predefined configuration
const tapVerifier = new WebhookVerifier(WEBHOOK_CONFIGS.tap);
```

## License

MIT 