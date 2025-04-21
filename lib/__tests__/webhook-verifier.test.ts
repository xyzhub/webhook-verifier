import { WebhookVerifier, WebhookPayload } from '../webhook-verifier';

describe('WebhookVerifier', () => {
  const secretKey = 'random-test-key';
  const signatureHeader = 'hashstring';
  
  let verifier: WebhookVerifier;
  
  beforeEach(() => {
    verifier = new WebhookVerifier({
      secretKey,
      signatureHeader,
      hashAlgorithm: 'sha256',
      encoding: 'hex',
      payloadFormatter: (payload: WebhookPayload) => {

        const CURRENCY_DECIMALS: Record<string, number> = {
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
        } as const

        function formatAmount(amount: number, currency: string): string {
          const decimals = CURRENCY_DECIMALS[currency] || 2
          return Number(amount).toFixed(decimals)
        }
        
        const fields = [
          `x_id${payload.id}`,
          `x_amount${formatAmount(payload.amount, payload.currency)}`,
          `x_currency${payload.currency}`
        ]
    
        // Add invoice-specific fields
        if (payload.object === 'invoice') {
          fields.push(
            `x_updated${payload.updated || ''}`,
            `x_status${payload.status}`,
            `x_created${payload.created}`
          )
        }
    
        // Add transaction-specific fields
        if (['charge', 'authorize', 'refund'].includes(payload.object) && 'transaction' in payload && 'reference' in payload) 
          {
          fields.push(
            `x_gateway_reference${payload.reference?.gateway || ''}`,
            `x_payment_reference${payload.reference?.payment || ''}`,
            `x_status${payload.status}`,
            `x_created${payload.transaction?.created || ''}`
          )
        }
    
        return fields.join('')
      }
    });
  });
  
  it('should validate a correct signature', () => {
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
      threeDSecure: true,
      card_threeDSecure: false,
      save_card: false,
      merchant_id: '',
      product: '',
      description: 'Subscription Plan X',
      metadata: { orgID: 'XYZ_123' },
      order: { id: 'ord_NCna825811FaIC21nG3x32' },
      transaction: {
        authorization_id: '123456',
        timezone: 'UTC+03:00',
        created: '1745223055707',
        expiry: [Object],
        asynchronous: false,
        amount: 10,
        currency: 'BHD',
        date: [Object]
      },
      reference: {
        track: 'tck_TS05A5920250810Zm522104740',
        payment: '59212508100474072259',
        transaction: 'txn_1739985393593',
        order: 'ord_1739985393593',
        acquirer: '511150000088',
        gateway: '202511111555714'
      },
      response: { code: '000', message: 'Captured' },
      acquirer: { response: [Object] },
      gateway: { response: [Object] },
      card: {
        object: 'card',
        first_six: '460041',
        first_eight: '46004101',
        scheme: 'BENEFIT',
        brand: 'VISA',
        last_four: '6789',
        name: 'TEST TEST',
        expiry: [Object]
      },
      receipt: { id: '200021250811044257', email: true, sms: true },
      customer: {
        id: 'cus_TS04A2720250811n9PL2104463',
        first_name: 'hhhhh',
        last_name: 'hhhhh',
        email: 'hhhg@ddddd.ccc',
        phone: [Object]
      },
      merchant: { country: 'SA', currency: 'KWD', id: '599424' },
      source: {
        object: 'token',
        type: 'CARD_NOT_PRESENT',
        payment_type: 'DEBIT',
        channel: 'INTERNET',
        id: 'tok_TS79A2425811Fces21vX3d620',
        on_file: false,
        payment_method: 'BENEFIT'
      },
      redirect: {
        status: 'PENDING',
        url: 'https://webhook-hazel-five.vercel.app/api/webhook'
      },
      post: {
        status: 'PENDING',
        url: 'https://webhook-hazel-five.vercel.app/api/tap'
      },
      activities: [ [Object], [Object] ],
      auto_reversed: false,
      moto: false
    };
    
    const result = verifier.verify(payload, signature);
    
    expect(result.isValid).toBe(true);
    expect(result.data).toEqual(payload);
  });
  
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
      signatureHeader,
      payloadFormatter: (payload) => `custom:${JSON.stringify(payload)}`
    });
    
    // Pre-calculated signature for the custom formatted payload
    const signature = 'daaefe52a27eef3aedf2f435f781419c60ce28e947937ce09acd04b942bfea3c';
    const payload = { test: 'data' };
    
    const result = customVerifier.verify(payload, signature);
    
    expect(result.isValid).toBe(true);
  });
}); 