import { describe, it, expect } from '@jest/globals';
import { generateTotpCode, validateTotpCode } from '../../utils/totp';

describe('TOTP Utils', () => {
  const testSecret = '3132333435363738393031323334353637383930'; // hex-encoded

  describe('generateTotpCode', () => {
    it('should generate 6-digit TOTP code', () => {
      const time = new Date('2024-01-01T00:00:00Z');
      const code = generateTotpCode(testSecret, time, 30, 6, 0);

      expect(code).toBeGreaterThanOrEqual(0);
      expect(code).toBeLessThan(1000000);
    });

    it('should be deterministic for same inputs', () => {
      const time = new Date('2024-01-01T00:00:00Z');
      
      const code1 = generateTotpCode(testSecret, time, 30, 6, 0);
      const code2 = generateTotpCode(testSecret, time, 30, 6, 0);

      expect(code1).toBe(code2);
    });

    it('should generate different codes for different time windows', () => {
      const time1 = new Date('2024-01-01T00:00:00Z');
      const time2 = new Date('2024-01-01T00:00:30Z');

      const code1 = generateTotpCode(testSecret, time1, 30, 6, 0);
      const code2 = generateTotpCode(testSecret, time2, 30, 6, 0);

      expect(code1).not.toBe(code2);
    });

    it('should respect window offset', () => {
      const time = new Date('2024-01-01T00:00:00Z');

      const code0 = generateTotpCode(testSecret, time, 30, 6, 0);
      const code1 = generateTotpCode(testSecret, time, 30, 6, 1);

      expect(code0).not.toBe(code1);
    });

    it('should generate codes with specified digits', () => {
      const time = new Date('2024-01-01T00:00:00Z');
      
      const code4 = generateTotpCode(testSecret, time, 30, 4, 0);
      const code8 = generateTotpCode(testSecret, time, 30, 8, 0);

      expect(code4).toBeLessThan(10000);
      expect(code8).toBeLessThan(100000000);
    });
  });

  describe('validateTotpCode', () => {
    it('should validate current time window code', () => {
      const time = new Date('2024-01-01T00:00:00Z');
      const code = generateTotpCode(testSecret, time, 30, 6, 0);

      const isValid = validateTotpCode(testSecret, code, time, 2);

      expect(isValid).toBe(true);
    });

    it('should validate next time window code', () => {
      const time = new Date('2024-01-01T00:00:00Z');
      const futureCode = generateTotpCode(testSecret, time, 30, 6, 1);

      const isValid = validateTotpCode(testSecret, futureCode, time, 2);

      expect(isValid).toBe(true);
    });

    it('should reject invalid code', () => {
      const time = new Date('2024-01-01T00:00:00Z');
      const invalidCode = 999999;

      const isValid = validateTotpCode(testSecret, invalidCode, time, 2);

      expect(isValid).toBe(false);
    });

    it('should reject code outside window range', () => {
      const time = new Date('2024-01-01T00:00:00Z');
      const farFutureCode = generateTotpCode(testSecret, time, 30, 6, 5);

      const isValid = validateTotpCode(testSecret, farFutureCode, time, 2);

      expect(isValid).toBe(false);
    });
  });
});
