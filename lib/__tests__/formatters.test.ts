import { invoiless, tap } from '../formatters';

describe('Formatters', () => {
  describe('invoiless formatter', () => {
    it('should correctly format the payload', () => {
      const payload = {
        id: 'test-id',
        amount: 100,
        currency: 'USD',
        metadata: { key: 'value' }
      };
      
      const formatted = invoiless(payload);
      expect(formatted).toBe(JSON.stringify(payload));
    });
    
    it('should handle empty payload', () => {
      const payload = {};
      const formatted = invoiless(payload);
      expect(formatted).toBe('{}');
    });
    
    it('should handle payload with nested objects', () => {
      const payload = {
        data: {
          nested: {
            value: 'test'
          }
        }
      };
      
      const formatted = invoiless(payload);
      expect(formatted).toBe(JSON.stringify(payload));
    });
  });
  
  describe('tap formatter', () => {
    it('should correctly format transaction payload', () => {
      const payload = {
        id: 'test-transaction',
        object: 'charge',
        amount: 100,
        currency: 'USD',
        status: 'CAPTURED',
        transaction: {
          created: '20220101'
        },
        reference: {
          gateway: 'test-gateway',
          payment: 'test-payment'
        }
      };
      
      const formatted = tap(payload);
      
      // Should include transaction-specific fields
      expect(formatted).toContain('x_idtest-transaction');
      expect(formatted).toContain('x_amount100.00');
      expect(formatted).toContain('x_currencyUSD');
      expect(formatted).toContain('x_statusCAPTURED');
      expect(formatted).toContain('x_created20220101');
      expect(formatted).toContain('x_gateway_referencetest-gateway');
      expect(formatted).toContain('x_payment_referencetest-payment');
    });
    
    it('should correctly format invoice payload', () => {
      const payload = {
        id: 'test-invoice',
        object: 'invoice',
        amount: 100,
        currency: 'USD',
        status: 'PAID',
        updated: '20220102',
        created: '20220101'
      };
      
      const formatted = tap(payload);
      
      // Should include invoice-specific fields
      expect(formatted).toContain('x_idtest-invoice');
      expect(formatted).toContain('x_amount100.00');
      expect(formatted).toContain('x_currencyUSD');
      expect(formatted).toContain('x_statusPAID');
      expect(formatted).toContain('x_updated20220102');
      expect(formatted).toContain('x_created20220101');
    });
    
    it('should handle payload with unknown currency', () => {
      const payload = {
        id: 'test-id',
        amount: 100,
        currency: 'XYZ' // Unknown currency
      };
      
      const formatted = tap(payload);
      // Should use default decimals (2) for unknown currency
      expect(formatted).toContain('x_amount100.00');
    });
    
    it('should format amounts with correct currency decimals', () => {
      // Test each currency with different decimal places
      const testCases = [
        { currency: 'BHD', amount: 100, expected: '100.000' }, // 3 decimals
        { currency: 'KWD', amount: 100, expected: '100.000' }, // 3 decimals
        { currency: 'OMR', amount: 100, expected: '100.000' }, // 3 decimals
        { currency: 'USD', amount: 100, expected: '100.00' },  // 2 decimals
        { currency: 'EUR', amount: 100, expected: '100.00' },  // 2 decimals
      ];
      
      testCases.forEach(({ currency, amount, expected }) => {
        const payload = { id: 'test', amount, currency };
        const formatted = tap(payload);
        expect(formatted).toContain(`x_amount${expected}`);
      });
    });

    // Tests for remaining branches in tap formatter

    it('should correctly format authorize payload', () => {
      const payload = {
        id: 'test-auth',
        object: 'authorize',
        amount: 100,
        currency: 'USD',
        status: 'AUTHORIZED',
        transaction: {
          created: '20220101'
        },
        reference: {
          gateway: 'test-gateway',
          payment: 'test-payment'
        }
      };
      
      const formatted = tap(payload);
      
      // Should include transaction-specific fields
      expect(formatted).toContain('x_idtest-auth');
      expect(formatted).toContain('x_amount100.00');
      expect(formatted).toContain('x_currencyUSD');
      expect(formatted).toContain('x_statusAUTHORIZED');
      expect(formatted).toContain('x_created20220101');
      expect(formatted).toContain('x_gateway_referencetest-gateway');
      expect(formatted).toContain('x_payment_referencetest-payment');
    });

    it('should correctly format refund payload', () => {
      const payload = {
        id: 'test-refund',
        object: 'refund',
        amount: 100,
        currency: 'USD',
        status: 'REFUNDED',
        transaction: {
          created: '20220101'
        },
        reference: {
          gateway: 'test-gateway',
          payment: 'test-payment'
        }
      };
      
      const formatted = tap(payload);
      
      // Should include transaction-specific fields
      expect(formatted).toContain('x_idtest-refund');
      expect(formatted).toContain('x_amount100.00');
      expect(formatted).toContain('x_currencyUSD');
      expect(formatted).toContain('x_statusREFUNDED');
      expect(formatted).toContain('x_created20220101');
      expect(formatted).toContain('x_gateway_referencetest-gateway');
      expect(formatted).toContain('x_payment_referencetest-payment');
    });

    it('should handle transaction without reference object', () => {
      const payload = {
        id: 'test-transaction',
        object: 'charge',
        amount: 100,
        currency: 'USD',
        transaction: {
          created: '20220101'
        }
        // No reference object and no status
      };
      
      const formatted = tap(payload);
      
      // Should format without the reference fields
      expect(formatted).toContain('x_idtest-transaction');
      expect(formatted).toContain('x_amount100.00');
      expect(formatted).toContain('x_currencyUSD');
      // These should not be included
      expect(formatted).not.toContain('x_gateway_reference');
      expect(formatted).not.toContain('x_payment_reference');
    });

    it('should handle transaction with status but no reference object', () => {
      const payload = {
        id: 'test-transaction',
        object: 'charge',
        amount: 100,
        currency: 'USD',
        status: 'CAPTURED',
        transaction: {
          created: '20220101'
        }
        // No reference object
      };
      
      const formatted = tap(payload);
      
      expect(formatted).toContain('x_statusCAPTURED');
      expect(formatted).toContain('x_created20220101');
      // These should not be included
      expect(formatted).not.toContain('x_gateway_reference');
      expect(formatted).not.toContain('x_payment_reference');
    });

    it('should handle transaction with null reference values', () => {
      const payload = {
        id: 'test-transaction',
        object: 'charge',
        amount: 100,
        currency: 'USD',
        status: 'CAPTURED',
        transaction: {
          created: '20220101'
        },
        reference: {
          gateway: null,
          payment: null
        }
      };
      
      const formatted = tap(payload);
      
      // Fields should be empty strings
      expect(formatted).toContain('x_gateway_reference');
      expect(formatted).toContain('x_payment_reference');
    });

    it('should handle transaction with missing transaction.created field', () => {
      const payload = {
        id: 'test-transaction',
        object: 'charge',
        amount: 100,
        currency: 'USD',
        status: 'CAPTURED',
        transaction: {
          // No created field
        },
        reference: {
          gateway: 'test-gateway',
          payment: 'test-payment'
        }
      };
      
      const formatted = tap(payload);
      
      // Created field should be empty
      expect(formatted).toContain('x_created');
    });
  });
}); 