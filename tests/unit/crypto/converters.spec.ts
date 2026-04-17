import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  arrayBufferToHex,
  hexToArrayBuffer,
  base64UrlToUint8Array,
  base64UrlToMpint,
  formatAsPem,
  pemToBase64,
} from '@/services/crypto/converters';

describe('converters', () => {
  describe('arrayBufferToBase64', () => {
    it('should convert ArrayBuffer to Base64', () => {
      const buffer = new Uint8Array([72, 101, 108, 108, 111]).buffer;
      const result = arrayBufferToBase64(buffer);
      expect(result).toBe('SGVsbG8=');
    });

    it('should handle empty buffer', () => {
      const buffer = new Uint8Array([]).buffer;
      const result = arrayBufferToBase64(buffer);
      expect(result).toBe('');
    });

    it('should handle binary data', () => {
      const buffer = new Uint8Array([0, 1, 2, 255, 254, 253]).buffer;
      const result = arrayBufferToBase64(buffer);
      expect(result).toBe('AAEC//79'); // Correct base64 for [0,1,2,255,254,253]
    });

    it('should handle larger buffers', () => {
      const data = new Uint8Array(256);
      for (let i = 0; i < 256; i++) {
        data[i] = i;
      }
      const result = arrayBufferToBase64(data.buffer);
      expect(result.length).toBeGreaterThan(0);
      // Verify it's valid base64
      expect(/^[A-Za-z0-9+/=]+$/.test(result)).toBe(true);
    });
  });

  describe('base64ToArrayBuffer', () => {
    it('should convert Base64 to ArrayBuffer', () => {
      const result = base64ToArrayBuffer('SGVsbG8=');
      expect(new Uint8Array(result)).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
    });

    it('should roundtrip with arrayBufferToBase64', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5]).buffer;
      const base64 = arrayBufferToBase64(original);
      const restored = base64ToArrayBuffer(base64);
      expect(new Uint8Array(restored)).toEqual(new Uint8Array(original));
    });

    it('should handle empty string', () => {
      const result = base64ToArrayBuffer('');
      expect(new Uint8Array(result)).toEqual(new Uint8Array([]));
    });

    it('should handle binary data', () => {
      const result = base64ToArrayBuffer('AAEC//79');
      expect(new Uint8Array(result)).toEqual(new Uint8Array([0, 1, 2, 255, 254, 253]));
    });
  });

  describe('arrayBufferToHex', () => {
    it('should convert ArrayBuffer to hexadecimal string', () => {
      const buffer = new Uint8Array([255, 16, 32, 48]).buffer;
      const result = arrayBufferToHex(buffer);
      expect(result).toBe('ff102030');
    });

    it('should handle single bytes with leading zeros', () => {
      const buffer = new Uint8Array([1, 2, 10, 15]).buffer;
      const result = arrayBufferToHex(buffer);
      expect(result).toBe('01020a0f');
    });

    it('should handle empty buffer', () => {
      const buffer = new Uint8Array([]).buffer;
      const result = arrayBufferToHex(buffer);
      expect(result).toBe('');
    });

    it('should handle all byte values', () => {
      const buffer = new Uint8Array([0, 255, 128, 1]).buffer;
      const result = arrayBufferToHex(buffer);
      expect(result).toBe('00ff8001');
    });
  });

  describe('hexToArrayBuffer', () => {
    it('should convert hexadecimal string to ArrayBuffer', () => {
      const result = hexToArrayBuffer('ff102030');
      expect(new Uint8Array(result)).toEqual(new Uint8Array([255, 16, 32, 48]));
    });

    it('should roundtrip with arrayBufferToHex', () => {
      const original = new Uint8Array([0xAB, 0xCD, 0xEF, 0x12]).buffer;
      const hex = arrayBufferToHex(original);
      const restored = hexToArrayBuffer(hex);
      expect(new Uint8Array(restored)).toEqual(new Uint8Array(original));
    });

    it('should handle empty string', () => {
      const result = hexToArrayBuffer('');
      expect(new Uint8Array(result)).toEqual(new Uint8Array([]));
    });

    it('should handle uppercase and lowercase hex', () => {
      const result1 = hexToArrayBuffer('ff102030');
      const result2 = hexToArrayBuffer('FF102030');
      expect(new Uint8Array(result1)).toEqual(new Uint8Array(result2));
    });
  });

  describe('base64UrlToUint8Array', () => {
    it('should convert Base64URL to Uint8Array', () => {
      const result = base64UrlToUint8Array('SGVsbG8');
      expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
    });

    it('should handle URL-safe characters', () => {
      // Base64URL replaces + with - and / with _
      const result = base64UrlToUint8Array('abcd-_');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle padding', () => {
      const result = base64UrlToUint8Array('SGVsbG8=');
      expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
    });

    it('should handle empty string', () => {
      const result = base64UrlToUint8Array('');
      expect(result).toEqual(new Uint8Array([]));
    });

    it('should convert - to +', () => {
      const result = base64UrlToUint8Array('a-b');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should convert _ to /', () => {
      const result = base64UrlToUint8Array('a_b');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('base64UrlToMpint', () => {
    it('should handle zero value', () => {
      const result = base64UrlToMpint('AA');
      expect(result).toEqual(new Uint8Array([]));
    });

    it('should prepend 0x00 when most significant bit is 1', () => {
      // 0x80 has MSB set, should prepend 0x00
      const result = base64UrlToMpint('gA'); // Base64URL for 0x80
      expect(result).toEqual(new Uint8Array([0x00, 0x80]));
    });

    it('should not prepend 0x00 when MSB is 0', () => {
      const result = base64UrlToMpint('AQ'); // Base64URL for 0x01
      expect(result).toEqual(new Uint8Array([0x01]));
    });

    it('should handle multi-byte values with MSB set', () => {
      const result = base64UrlToMpint('4houdS4'); // Some multi-byte value
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toBe(0x00); // Should have prepend byte
    });

    it('should handle single byte non-zero', () => {
      const result = base64UrlToMpint('QQ'); // Base64URL for 0x41 (65)
      expect(result).toEqual(new Uint8Array([0x41]));
    });
  });

  describe('formatAsPem', () => {
    it('should format Base64 as PEM with headers and footers', () => {
      const base64 = 'SGVsbG8gV29ybGQ=';
      const result = formatAsPem(base64, '-----BEGIN TEST-----', '-----END TEST-----');
      expect(result).toBe('-----BEGIN TEST-----\nSGVsbG8gV29ybGQ=\n-----END TEST-----');
    });

    it('should break long Base64 strings into 64-character lines', () => {
      const base64 = 'A'.repeat(128);
      const result = formatAsPem(base64, '-----BEGIN TEST-----', '-----END TEST-----');
      const lines = result.split('\n');
      expect(lines[1]).toHaveLength(64);
      expect(lines[2]).toHaveLength(64);
    });

    it('should handle short Base64 strings', () => {
      const base64 = 'SGVsbG8=';
      const result = formatAsPem(base64, '-----BEGIN PUBLIC KEY-----', '-----END PUBLIC KEY-----');
      expect(result).toContain('-----BEGIN PUBLIC KEY-----');
      expect(result).toContain('-----END PUBLIC KEY-----');
    });

    it('should handle empty Base64 string', () => {
      const base64 = '';
      const result = formatAsPem(base64, '-----BEGIN TEST-----', '-----END TEST-----');
      expect(result).toBe('-----BEGIN TEST-----\n\n-----END TEST-----');
    });
  });

  describe('pemToBase64', () => {
    it('should strip PEM headers and footers', () => {
      const pem = '-----BEGIN PUBLIC KEY-----\nSGVsbG8=\n-----END PUBLIC KEY-----';
      const result = pemToBase64(pem);
      expect(result).toBe('SGVsbG8=');
    });

    it('should strip PRIVATE KEY headers', () => {
      const pem = '-----BEGIN PRIVATE KEY-----\nYWJjZGVm\n-----END PRIVATE KEY-----';
      const result = pemToBase64(pem);
      expect(result).toBe('YWJjZGVm');
    });

    it('should remove all whitespace', () => {
      const pem = `-----BEGIN PUBLIC KEY-----
SGVs
bG8g
V29ybGQ=
-----END PUBLIC KEY-----`;
      const result = pemToBase64(pem);
      expect(result).toBe('SGVsbG8gV29ybGQ=');
    });

    it('should roundtrip with formatAsPem for content', () => {
      const originalBase64 = 'SGVsbG8gV29ybGQ=';
      // Use standard PUBLIC KEY header for roundtrip test
      const pem = formatAsPem(originalBase64, '-----BEGIN PUBLIC KEY-----', '-----END PUBLIC KEY-----');
      const extractedBase64 = pemToBase64(pem);
      expect(extractedBase64).toBe(originalBase64);
      // Verify PEM format
      expect(pem).toContain('-----BEGIN PUBLIC KEY-----');
      expect(pem).toContain('-----END PUBLIC KEY-----');
    });

    it('should handle various PEM header formats', () => {
      const pem = '-----BEGIN RSA PRIVATE KEY-----\ndGVzdA==\n-----END RSA PRIVATE KEY-----';
      const result = pemToBase64(pem);
      expect(result).toBe('dGVzdA==');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle special characters in Base64', () => {
      const buffer = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]).buffer;
      const base64 = arrayBufferToBase64(buffer);
      const restored = base64ToArrayBuffer(base64);
      expect(new Uint8Array(restored)).toEqual(new Uint8Array(buffer));
    });

    it('should handle Unicode edge cases', () => {
      const buffer = new TextEncoder().encode('😀🔑').buffer;
      const base64 = arrayBufferToBase64(buffer);
      const restored = base64ToArrayBuffer(base64);
      expect(new TextDecoder().decode(restored)).toBe('😀🔑');
    });

    it('should handle very long hex strings', () => {
      const hex = 'ff'.repeat(1000);
      const result = hexToArrayBuffer(hex);
      expect(new Uint8Array(result).length).toBe(1000); // Each 'ff' is 1 byte, so 1000 bytes total
    });

    it('should handle mixed case hex', () => {
      const result = hexToArrayBuffer('Ff102030');
      expect(new Uint8Array(result)).toEqual(new Uint8Array([255, 16, 32, 48]));
    });
  });
});
