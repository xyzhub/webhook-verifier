import { invoiless as invoilessConfig, tap as tapConfig } from '../configs';
import { invoiless, tap } from '../formatters';

describe('Configs', () => {
  describe('invoiless config', () => {
    it('should have the correct configuration properties', () => {
      expect(invoilessConfig).toMatchObject({
        signatureHeader: 'invoiless-signature',
        signaturePrefix: 'sha256=',
        hashAlgorithm: 'sha256',
        encoding: 'base64'
      });
    });
    
    it('should use the invoiless formatter', () => {
      expect(invoilessConfig.payloadFormatter).toBe(invoiless);
    });
    
    it('should not include a secretKey', () => {
      expect(invoilessConfig).not.toHaveProperty('secretKey');
    });
  });
  
  describe('tap config', () => {
    it('should have the correct configuration properties', () => {
      expect(tapConfig).toMatchObject({
        signatureHeader: 'hashstring',
        hashAlgorithm: 'sha256',
        encoding: 'hex'
      });
    });
    
    it('should use the tap formatter', () => {
      expect(tapConfig.payloadFormatter).toBe(tap);
    });
    
    it('should not include a secretKey', () => {
      expect(tapConfig).not.toHaveProperty('secretKey');
    });
    
    it('should not have a signature prefix', () => {
      expect(tapConfig.signaturePrefix).toBeUndefined();
    });
  });
}); 