# Webhook Verifier

A lightweight library for verifying webhook signatures.

## Installation

```bash
npm install webhook-verifier
```

## Usage

```typescript
import { WebhookVerifier } from 'webhook-verifier';

// Create a verifier with your configuration
const verifier = new WebhookVerifier({
  secretKey: process.env.SECRET_KEY,
  signatureHeader: 'x-signature', // The name of the header containing the signature
  encoding: 'base64'
});

// In your webhook handler (e.g., in an Express route)
app.post('/webhook', (req, res) => {
  // Pass request headers directly - signature will be automatically extracted
  const result = verifier.verify(req.body, req.headers);
  
  if (!result.isValid) {
    console.error('Invalid webhook signature:', result.error);
    return res.status(401).json({ status: 'error', message: 'Invalid signature' });
  }
  
  // Process the verified webhook data
  console.log('Verified webhook payload:', result.data);
  return res.status(200).json({ status: 'success' });
});

// You can also verify with a signature string directly
app.post('/webhook/manual', (req, res) => {
  const signature = req.headers['x-signature'] as string;
  const result = verifier.verify(req.body, signature);
  
  // Rest of handler...
});
```

## Configuration Options

The `WebhookVerifier` accepts the following configuration options:

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| secretKey | string | Yes | - | The secret key used to verify the signature |
| signatureHeader | string | Yes | - | The name of the header that contains the signature |
| signaturePrefix | string | No | - | A prefix for the signature (e.g., "sha256=") |
| hashAlgorithm | string | No | "sha256" | The hashing algorithm to use |
| encoding | "hex" \| "base64" | No | "hex" | The encoding format for the signature |
| payloadFormatter | function | No | JSON.stringify | A function to format the payload before hashing |

## Verification Method

The `WebhookVerifier` provides an intelligent verify method that can handle both signature strings and header objects:

```typescript
verify(payload: WebhookPayload, signatureOrHeaders: string | Record<string, any>): VerificationResult
```

This method intelligently detects whether the second argument is:
- A string: treated as the signature directly
- An object: treated as headers from which it extracts the signature using `signatureHeader`

When using headers, the method:
- Handles case-insensitive header lookups
- Works with headers that are strings or arrays of strings (for different HTTP libraries)
- Returns a clear error message if the signature is missing

## Predefined Configurations

The library includes predefined configuration templates for common webhook providers. 
**Note: These templates do not include a secret key - you must provide your own.**

```typescript
import { WebhookVerifier } from 'webhook-verifier';
import { tap, invoiless } from 'webhook-verifier/configs';

// Using a predefined config template (you must add your secret key)
const tapVerifier = new WebhookVerifier({
  ...tap,
  secretKey: process.env.TAP_SECRET_KEY // Add your own secret key
});

// In your request handler
app.post('/webhook/tap', (req, res) => {
  // Automatically use the correct header name from the config
  const result = tapVerifier.verify(req.body, req.headers);
  
  if (result.isValid) {
    // Process the webhook...
  }
});

// You can also customize other options while using the predefined config
const customVerifier = new WebhookVerifier({
  ...invoiless,
  secretKey: process.env.MY_SECRET_KEY,
  hashAlgorithm: 'sha512' // Override specific options as needed
});
```

## Custom Formatters

The library provides specialized formatters for common webhook providers, which can be imported directly:

```typescript
import { WebhookVerifier } from 'webhook-verifier';
import { tap, invoiless } from 'webhook-verifier/formatters';

// Using a pre-defined formatter
const verifier = new WebhookVerifier({
  secretKey: process.env.SECRET_KEY,
  signatureHeader: 'x-signature',
  payloadFormatter: tap
});
```

### Creating Custom Formatters

You can create your own custom formatters by defining a function that takes a webhook payload and returns a string:

```typescript
import { WebhookVerifier, WebhookPayload } from 'webhook-verifier';

// Define a custom formatter
const myCustomFormatter = (payload: WebhookPayload): string => {
  return `${payload.eventType}|${payload.id}|${JSON.stringify(payload.data)}`;
};

// Use the custom formatter
const verifier = new WebhookVerifier({
  secretKey: process.env.SECRET_KEY,
  signatureHeader: 'x-signature',
  payloadFormatter: myCustomFormatter
});
```

## License

MIT 