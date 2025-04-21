import { WebhookVerifier, WebhookPayload } from '../webhook-verifier';
import { tap } from '../configs';
import { invoiless } from '../formatters';

describe('WebhookVerifier', () => {
  const secretKey = 'random-test-key';
  
  let verifier: WebhookVerifier;
  
  beforeEach(() => {
    verifier = new WebhookVerifier({ secretKey, ...tap });
  });
  
  it('should validate a correct signature for tap charge', () => {
    // This is a pre-calculated signature for the test payload with the test secret
    const signature = 'db29b6c720bbbdbc17ea51983a2cbcd5e27335d3b0f133ca71381e897cb61755';
    const payload = {
      id: 'chg_TS04A5520250810b5FO2104705',
      object: 'charge',
      live_mode: false,
      customer_initiated: true,
      api_version: 'V2',
      method: 'POST',
      status: 'CAPTURED',
      amount: 10,
      currency: 'BHD',
      transaction: {
        created: '1745223055707',
      },
      reference: {
        payment: '59212508100474072259',
        gateway: '202511111555714'
      },
    };
    
    const result = verifier.verify(payload, signature);
    
    expect(result.isValid).toBe(true);
    expect(result.data).toEqual(payload);
  });

  it('should validate a correct signature for tap refund', () => {
    // This is a pre-calculated signature for the test payload with the test secret
    const signature = '885db4da291d6badd07d2545cef17f27f880a6d6b0ee6a07ca74abfe58691a29';
    const payload = {
      id: 'chg_TS04A5520250810b5FO2104705',
      object: 'refund',
      live_mode: false,
      customer_initiated: true,
      api_version: 'V2',
      method: 'POST',
      status: 'REFUNDED',
      amount: 10,
      currency: 'BHD',
      transaction: {
        created: '1745223055707',
      },
      reference: {
        payment: '59212508100474072259',
        gateway: '202511111555714'
      },
    };
    
    const result = verifier.verify(payload, signature);
    
    expect(result.isValid).toBe(true);
    expect(result.data).toEqual(payload);
  });

  it('should validate a correct signature for tap authorize', () => {
    // This is a pre-calculated signature for the test payload with the test secret
    const signature = '12a691202e05d452641e3ef1a429593f225f2f2bd93c839b06a4b91813055109';
    const payload = {
      id: 'auth_TS04A5520250810b5FO2104705',
      object: 'authorize',
      live_mode: false,
      customer_initiated: true,
      api_version: 'V2',
      method: 'POST',
      status: 'AUTHORIZED',
      amount: 10,
      currency: 'BHD',
      transaction: {
        created: '1745223055707',
      },
      reference: {
        payment: '59212508100474072259',
        gateway: '202511111555714'
      },
    };
    
    const result = verifier.verify(payload, signature);
    
    expect(result.isValid).toBe(true);
    expect(result.data).toEqual(payload);
  });

  it('should validate a correct signature for tap invoice', () => {
    const signature = '0e28d246ed422bd92557cd0db38fa7adfb657e774f0b412a0a8a2e9d25991c10';
    const payload = {
      id: 'inv_Ijl81311012OEE0527609',
      object: 'invoice',
      created: 1745228336609,
      live_mode: false,
      api_version: 'V1.2',
      method: 'CREATE',
      status: 'PAID',
      amount: 20,
      currency: 'BHD',
      timezone: '+03:00',
      updated: 1745228419069,
    };
    
    const result = verifier.verify(payload, signature);
    
    expect(result.isValid).toBe(true);
    expect(result.data).toEqual(payload);
  })
  
  it('should reject an invalid signature', () => {
    const signature = 'invalid-signature';
    const payload = { test: 'data' };
    
    const result = verifier.verify(payload, signature);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });
  
  it('should reject empty signatures', () => {
    const signature = '';
    const payload = { test: 'data' };
    
    const result = verifier.verify(payload, signature);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Missing signature');
  });
  
  it('should use a custom payload formatter if provided', () => {
    const customVerifier = new WebhookVerifier({
      secretKey,
      ...tap,
      payloadFormatter: (payload) => `custom:${JSON.stringify(payload)}`
    });
    
    // Pre-calculated signature for the custom formatted payload
    const signature = 'daaefe52a27eef3aedf2f435f781419c60ce28e947937ce09acd04b942bfea3c';
    const payload = { test: 'data' };
    
    const result = customVerifier.verify(payload, signature);
    
    expect(result.isValid).toBe(true);
  });

  // New tests to improve coverage

  it('should throw an error when secretKey is missing', () => {
    // @ts-ignore - intentionally passing invalid config to test error
    expect(() => new WebhookVerifier({ signatureHeader: 'x-signature' }))
      .toThrow('Secret key is required');
  });

  it('should throw an error when signatureHeader is missing', () => {
    // @ts-ignore - intentionally passing invalid config to test error
    expect(() => new WebhookVerifier({ secretKey: 'test-key' }))
      .toThrow('Signature header name is required');
  });

  it('should use default hash algorithm and encoding if not provided', () => {
    const basicVerifier = new WebhookVerifier({
      secretKey: 'test-key',
      signatureHeader: 'x-signature'
    });
    
    // @ts-ignore - accessing private property for testing
    expect(basicVerifier.config.hashAlgorithm).toBe('sha256');
    // @ts-ignore - accessing private property for testing
    expect(basicVerifier.config.encoding).toBe('hex');
  });

  it('should format signature with prefix when specified', () => {
    const verifierWithPrefix = new WebhookVerifier({
      secretKey: 'test-key',
      signatureHeader: 'x-signature',
      signaturePrefix: 'sha256='
    });
    
    // Generate a signature with a known prefix and verify it works
    const payload = { test: 'data' };
    const hash = require('crypto')
      .createHmac('sha256', 'test-key')
      .update(JSON.stringify(payload))
      .digest('hex');
    
    const signature = `sha256=${hash}`;
    
    const result = verifierWithPrefix.verify(payload, signature);
    expect(result.isValid).toBe(true);
  });

  it('should use the default JSON.stringify when no formatter is provided', () => {
    const defaultVerifier = new WebhookVerifier({
      secretKey: 'test-key',
      signatureHeader: 'x-signature'
    });
    
    const payload = { test: 'data' };
    const hash = require('crypto')
      .createHmac('sha256', 'test-key')
      .update(JSON.stringify(payload))
      .digest('hex');
    
    const result = defaultVerifier.verify(payload, hash);
    expect(result.isValid).toBe(true);
  });

  it('should handle errors during verification', () => {
    const invalidVerifier = new WebhookVerifier({
      secretKey: 'test-key',
      signatureHeader: 'x-signature',
      // @ts-ignore - intentionally providing invalid algorithm to trigger error
      hashAlgorithm: 'invalid-algorithm'
    });
    
    const result = invalidVerifier.verify({ test: 'data' }, 'signature');
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should extract signature from headers object when verify is called with headers', () => {
    const payload = { test: 'data' };
    
    // For tap formatter, we need to create a properly formatted payload for the signature
    const expectedFormattedPayload = 'x_idundefinedx_amountNaNx_currencyundefined';
    
    const hash = require('crypto')
      .createHmac('sha256', secretKey)
      .update(expectedFormattedPayload)
      .digest('hex');
    
    const headers = {
      'hashstring': hash
    };
    
    const result = verifier.verify(payload, headers);
    expect(result.isValid).toBe(true);
  });

  it('should work with case-insensitive header names', () => {
    const payload = { test: 'data' };
    
    // For tap formatter, we need to create a properly formatted payload for the signature
    const expectedFormattedPayload = 'x_idundefinedx_amountNaNx_currencyundefined';
    
    const hash = require('crypto')
      .createHmac('sha256', secretKey)
      .update(expectedFormattedPayload)
      .digest('hex');
    
    const headers = {
      'HASHSTRING': hash
    };
    
    const result = verifier.verify(payload, headers);
    expect(result.isValid).toBe(true);
  });

  it('should handle array of strings in headers', () => {
    const payload = { test: 'data' };
    
    // For tap formatter, we need to create a properly formatted payload for the signature
    const expectedFormattedPayload = 'x_idundefinedx_amountNaNx_currencyundefined';
    
    const hash = require('crypto')
      .createHmac('sha256', secretKey)
      .update(expectedFormattedPayload)
      .digest('hex');
    
    const headers = {
      'hashstring': [hash]
    };
    
    const result = verifier.verify(payload, headers);
    expect(result.isValid).toBe(true);
  });

  it('should return error if signature header is missing in headers', () => {
    const payload = { test: 'data' };
    const headers = {
      'other-header': 'value'
    };
    
    const result = verifier.verify(payload, headers);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(`Missing signature header: ${verifier.config.signatureHeader}`);
  });

  it('should return error for invalid signatureOrHeaders argument type', () => {
    const payload = { test: 'data' };
    
    // @ts-ignore - intentionally passing invalid type to test error handling
    const result = verifier.verify(payload, 123);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid signature or headers argument');
  });

  // Tests for the debug option and non-Error object error handling

  it('should enable debug mode when debug option is set to true', () => {
    const debugVerifier = new WebhookVerifier({
      secretKey,
      signatureHeader: 'x-signature',
      debug: true
    });

    // Mock console.log to verify it's called
    const originalConsoleLog = console.log;
    const mockConsoleLog = jest.fn();
    console.log = mockConsoleLog;

    try {
      const payload = { test: 'data' };
      const hash = require('crypto')
        .createHmac('sha256', secretKey)
        .update(JSON.stringify(payload))
        .digest('hex');

      debugVerifier.verify(payload, hash);
      
      // Verify console.log was called
      expect(mockConsoleLog).toHaveBeenCalled();
    } finally {
      // Restore original console.log
      console.log = originalConsoleLog;
    }
  });

  it('should enable debug mode for errors when debug option is true', () => {
    const debugVerifier = new WebhookVerifier({
      secretKey,
      signatureHeader: 'x-signature',
      debug: true,
      // @ts-ignore - intentionally providing invalid algorithm to trigger error
      hashAlgorithm: 'invalid-algorithm'
    });

    // Mock console.error to verify it's called
    const originalConsoleError = console.error;
    const mockConsoleError = jest.fn();
    console.error = mockConsoleError;

    try {
      debugVerifier.verify({ test: 'data' }, 'signature');
      
      // Verify console.error was called
      expect(mockConsoleError).toHaveBeenCalled();
    } finally {
      // Restore original console.error
      console.error = originalConsoleError;
    }
  });

}); 