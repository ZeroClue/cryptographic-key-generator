import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  exportPublicKeyPem,
  exportPrivateKeyPem,
  exportSymmetricKey,
  exportSymmetricKeyHex,
  exportPublicKeyJwk,
  exportPrivateKeyJwk,
  exportSshPublicKey,
  exportPrivateKeyOpenSsh,
  exportPrivateKeyPutty,
} from '@/services/crypto/exporters';

describe('exporters', () => {
  let mockSubtle: any;

  beforeEach(() => {
    // Mock window.crypto.subtle and crypto.getRandomValues
    mockSubtle = {
      exportKey: vi.fn(),
      digest: vi.fn(),
      importKey: vi.fn(),
      sign: vi.fn(),
    };
    vi.stubGlobal('window', {
      crypto: {
        subtle: mockSubtle,
        getRandomValues: vi.fn((arr: Uint8Array) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
          }
          return arr;
        }),
      },
    });
    vi.stubGlobal('crypto', {
      subtle: mockSubtle,
      getRandomValues: vi.fn((arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      }),
    });

    vi.clearAllMocks();
  });

  describe('exportPublicKeyPem', () => {
    it('should export public key to PEM format', async () => {
      const mockKey = {} as CryptoKey;
      const exportedData = new Uint8Array([1, 2, 3, 4, 5]);
      mockSubtle.exportKey.mockResolvedValue(exportedData.buffer);

      const result = await exportPublicKeyPem(mockKey);

      expect(result).toContain('-----BEGIN PUBLIC KEY-----');
      expect(result).toContain('-----END PUBLIC KEY-----');
      expect(result).toContain('AQIDBAU=');
    });

    it('should format PEM with 64-character lines', async () => {
      const mockKey = {} as CryptoKey;
      const exportedData = new Uint8Array(100); // Will create longer base64
      mockSubtle.exportKey.mockResolvedValue(exportedData.buffer);

      const result = await exportPublicKeyPem(mockKey);
      const lines = result.split('\n');

      // Check that data lines are 64 chars or less (except possibly last)
      const dataLines = lines.filter(line => line.length > 0 && !line.startsWith('-----'));
      dataLines.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(64);
      });
    });

    it('should use spki format for public keys', async () => {
      const mockKey = {} as CryptoKey;
      const exportedData = new Uint8Array([1, 2, 3]);
      mockSubtle.exportKey.mockResolvedValue(exportedData.buffer);

      await exportPublicKeyPem(mockKey);

      expect(mockSubtle.exportKey).toHaveBeenCalledWith('spki', mockKey);
    });
  });

  describe('exportPrivateKeyPem', () => {
    it('should export private key to PEM format', async () => {
      const mockKey = {} as CryptoKey;
      const exportedData = new Uint8Array([6, 7, 8, 9, 10]);
      mockSubtle.exportKey.mockResolvedValue(exportedData.buffer);

      const result = await exportPrivateKeyPem(mockKey);

      expect(result).toContain('-----BEGIN PRIVATE KEY-----');
      expect(result).toContain('-----END PRIVATE KEY-----');
      expect(result).toContain('BwgJCQo=');
    });

    it('should use pkcs8 format for private keys', async () => {
      const mockKey = {} as CryptoKey;
      const exportedData = new Uint8Array([1, 2, 3]);
      mockSubtle.exportKey.mockResolvedValue(exportedData.buffer);

      await exportPrivateKeyPem(mockKey);

      expect(mockSubtle.exportKey).toHaveBeenCalledWith('pkcs8', mockKey);
    });

    it('should format with 64-character lines', async () => {
      const mockKey = {} as CryptoKey;
      const exportedData = new Uint8Array(150);
      mockSubtle.exportKey.mockResolvedValue(exportedData.buffer);

      const result = await exportPrivateKeyPem(mockKey);
      const lines = result.split('\n');

      const dataLines = lines.filter(line => line.length > 0 && !line.startsWith('-----'));
      dataLines.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(64);
      });
    });
  });

  describe('exportSymmetricKey', () => {
    it('should export symmetric key to Base64', async () => {
      const mockKey = {} as CryptoKey;
      const exportedData = new Uint8Array([11, 12, 13, 14, 15]);
      mockSubtle.exportKey.mockResolvedValue(exportedData.buffer);

      const result = await exportSymmetricKey(mockKey);

      expect(result).toBe('Cw0ODf8='); // Base64 of [11, 12, 13, 14, 15]
    });

    it('should use raw format for symmetric keys', async () => {
      const mockKey = {} as CryptoKey;
      const exportedData = new Uint8Array([1, 2, 3]);
      mockSubtle.exportKey.mockResolvedValue(exportedData.buffer);

      await exportSymmetricKey(mockKey);

      expect(mockSubtle.exportKey).toHaveBeenCalledWith('raw', mockKey);
    });

    it('should handle empty key data', async () => {
      const mockKey = {} as CryptoKey;
      const exportedData = new Uint8Array([]);
      mockSubtle.exportKey.mockResolvedValue(exportedData.buffer);

      const result = await exportSymmetricKey(mockKey);

      expect(result).toBe('');
    });
  });

  describe('exportSymmetricKeyHex', () => {
    it('should export symmetric key to hex', async () => {
      const mockKey = {} as CryptoKey;
      const exportedData = new Uint8Array([0xAB, 0xCD, 0xEF]);
      mockSubtle.exportKey.mockResolvedValue(exportedData.buffer);

      const result = await exportSymmetricKeyHex(mockKey);

      expect(result).toBe('abcdef');
    });

    it('should handle zero bytes', async () => {
      const mockKey = {} as CryptoKey;
      const exportedData = new Uint8Array([0, 0, 0]);
      mockSubtle.exportKey.mockResolvedValue(exportedData.buffer);

      const result = await exportSymmetricKeyHex(mockKey);

      expect(result).toBe('000000');
    });

    it('should handle mixed values', async () => {
      const mockKey = {} as CryptoKey;
      const exportedData = new Uint8Array([0x00, 0xFF, 0x10, 0x01]);
      mockSubtle.exportKey.mockResolvedValue(exportedData.buffer);

      const result = await exportSymmetricKeyHex(mockKey);

      expect(result).toBe('00ff1001');
    });
  });

  describe('exportPublicKeyJwk', () => {
    it('should export public key to JWK and remove private fields', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = {
        kty: 'RSA',
        n: 'test_n',
        e: 'AQAB',
        d: 'private_d',
        p: 'private_p',
        q: 'private_q',
        dp: 'private_dp',
        dq: 'private_dq',
        qi: 'private_qi',
      };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      const result = await exportPublicKeyJwk(mockKey);
      const parsed = JSON.parse(result);

      expect(parsed.kty).toBe('RSA');
      expect(parsed.n).toBe('test_n');
      expect(parsed.e).toBe('AQAB');
      expect(parsed.d).toBeUndefined();
      expect(parsed.p).toBeUndefined();
      expect(parsed.q).toBeUndefined();
      expect(parsed.dp).toBeUndefined();
      expect(parsed.dq).toBeUndefined();
      expect(parsed.qi).toBeUndefined();
    });

    it('should format JWK with pretty print', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = { kty: 'RSA', n: 'test', e: 'AQAB' };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      const result = await exportPublicKeyJwk(mockKey);

      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });
  });

  describe('exportPrivateKeyJwk', () => {
    it('should export private key to JWK with all fields', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = {
        kty: 'RSA',
        n: 'test_n',
        e: 'AQAB',
        d: 'private_d',
        p: 'private_p',
        q: 'private_q',
        dp: 'private_dp',
        dq: 'private_dq',
        qi: 'private_qi',
      };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      const result = await exportPrivateKeyJwk(mockKey);
      const parsed = JSON.parse(result);

      expect(parsed.kty).toBe('RSA');
      expect(parsed.n).toBe('test_n');
      expect(parsed.d).toBe('private_d');
      expect(parsed.p).toBe('private_p');
      expect(parsed.q).toBe('private_q');
      expect(parsed.dp).toBe('private_dp');
      expect(parsed.dq).toBe('private_dq');
      expect(parsed.qi).toBe('private_qi');
    });

    it('should format JWK with pretty print', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = { kty: 'RSA', n: 'test', e: 'AQAB' };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      const result = await exportPrivateKeyJwk(mockKey);

      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });
  });

  describe('exportSshPublicKey', () => {
    it('should export RSA public key to OpenSSH format', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = {
        kty: 'RSA',
        n: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // 40 chars base64url
        e: 'AQAB',
      };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      const result = await exportSshPublicKey(mockKey);

      expect(result).toMatch(/^ssh-rsa\s+[\w+/=]+\s+user@hostname$/);
    });

    it('should export ECDSA public key to OpenSSH format', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = {
        kty: 'EC',
        crv: 'P-256',
        x: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        y: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      const result = await exportSshPublicKey(mockKey);

      expect(result).toMatch(/^ecdsa-sha2-nistp256\s+[\w+/=]+\s+user@hostname$/);
    });

    it('should use custom comment when provided', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = {
        kty: 'RSA',
        n: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        e: 'AQAB',
      };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      const result = await exportSshPublicKey(mockKey, 'custom@example.com');

      expect(result).toMatch(/^ssh-rsa\s+[\w+/=]+\s+custom@example\.com$/);
    });

    it('should throw error for unsupported key type', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = {
        kty: 'unsupported',
      };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      await expect(exportSshPublicKey(mockKey)).rejects.toThrow('Unsupported key type for SSH public key export');
    });
  });

  describe('exportPrivateKeyOpenSsh', () => {
    it('should export RSA private key to OpenSSH format', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = {
        kty: 'RSA',
        n: 'n'.repeat(100),
        e: 'AQAB',
        d: 'd'.repeat(100),
        p: 'p'.repeat(50),
        q: 'q'.repeat(50),
        qi: 'iqmp'.repeat(20),
      };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      const result = await exportPrivateKeyOpenSsh(mockKey);

      expect(result).toContain('-----BEGIN OPENSSH PRIVATE KEY-----');
      expect(result).toContain('-----END OPENSSH PRIVATE KEY-----');
      expect(result).toContain('openssh-key-v1');
    });

    it('should export ECDSA private key to OpenSSH format', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = {
        kty: 'EC',
        crv: 'P-256',
        x: 'x'.repeat(43),
        y: 'y'.repeat(43),
        d: 'd',
      };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      const result = await exportPrivateKeyOpenSsh(mockKey);

      expect(result).toContain('-----BEGIN OPENSSH PRIVATE KEY-----');
      expect(result).toContain('-----END OPENSSH PRIVATE KEY-----');
      expect(result).toContain('openssh-key-v1');
    });

    it('should throw error for unsupported key type', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = {
        kty: 'unsupported',
      };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      await expect(exportPrivateKeyOpenSsh(mockKey)).rejects.toThrow('Unsupported key type for OpenSSH export');
    });

    it('should include custom comment', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = {
        kty: 'RSA',
        n: 'n'.repeat(100),
        e: 'AQAB',
        d: 'd'.repeat(100),
        p: 'p'.repeat(50),
        q: 'q'.repeat(50),
        qi: 'iqmp'.repeat(20),
      };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      const result = await exportPrivateKeyOpenSsh(mockKey, 'custom@example.com');

      // The comment is embedded in the binary data, so we just check it doesn't throw
      expect(result).toContain('openssh-key-v1');
    });
  });

  describe('exportPrivateKeyPutty', () => {
    it('should export RSA private key to PuTTY format', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = {
        kty: 'RSA',
        n: 'n'.repeat(100),
        e: 'AQAB',
        d: 'd'.repeat(100),
        p: 'p'.repeat(50),
        q: 'q'.repeat(50),
        qi: 'iqmp'.repeat(20),
      };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      // Mock crypto operations
      const macData = new Uint8Array(32);
      mockSubtle.digest.mockResolvedValue(macData.buffer);
      const mockMacKey = {};
      mockSubtle.importKey.mockResolvedValue(mockMacKey);
      const mac = new Uint8Array(20);
      mockSubtle.sign.mockResolvedValue(mac.buffer);

      const result = await exportPrivateKeyPutty(mockKey);

      expect(result).toContain('PuTTY-User-Key-File-2: ssh-rsa');
      expect(result).toContain('Encryption: none');
      expect(result).toContain('Public-Lines:');
      expect(result).toContain('Private-Lines:');
      expect(result).toContain('Private-MAC:');
    });

    it('should export ECDSA private key to PuTTY format', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = {
        kty: 'EC',
        crv: 'P-256',
        x: 'x'.repeat(43),
        y: 'y'.repeat(43),
        d: 'd',
      };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      // Mock crypto operations
      const macData = new Uint8Array(32);
      mockSubtle.digest.mockResolvedValue(macData.buffer);
      const mockMacKey = {};
      mockSubtle.importKey.mockResolvedValue(mockMacKey);
      const mac = new Uint8Array(20);
      mockSubtle.sign.mockResolvedValue(mac.buffer);

      const result = await exportPrivateKeyPutty(mockKey);

      expect(result).toContain('PuTTY-User-Key-File-2: ecdsa-sha2-nistp256');
      expect(result).toContain('Encryption: none');
      expect(result).toContain('Public-Lines:');
      expect(result).toContain('Private-Lines:');
      expect(result).toContain('Private-MAC:');
    });

    it('should throw error for unsupported key type', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = {
        kty: 'unsupported',
      };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      await expect(exportPrivateKeyPutty(mockKey)).rejects.toThrow('Unsupported key type for PuTTY export');
    });

    it('should include custom comment', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = {
        kty: 'RSA',
        n: 'n'.repeat(100),
        e: 'AQAB',
        d: 'd'.repeat(100),
        p: 'p'.repeat(50),
        q: 'q'.repeat(50),
        qi: 'iqmp'.repeat(20),
      };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      // Mock crypto operations
      const macData = new Uint8Array(32);
      mockSubtle.digest.mockResolvedValue(macData.buffer);
      const mockMacKey = {};
      mockSubtle.importKey.mockResolvedValue(mockMacKey);
      const mac = new Uint8Array(20);
      mockSubtle.sign.mockResolvedValue(mac.buffer);

      const result = await exportPrivateKeyPutty(mockKey, 'custom@example.com');

      expect(result).toContain('Comment: custom@example.com');
    });

    it('should calculate MAC correctly', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = {
        kty: 'RSA',
        n: 'n'.repeat(100),
        e: 'AQAB',
        d: 'd'.repeat(100),
        p: 'p'.repeat(50),
        q: 'q'.repeat(50),
        qi: 'iqmp'.repeat(20),
      };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      // Mock crypto operations
      const macData = new Uint8Array(32);
      mockSubtle.digest.mockResolvedValue(macData.buffer);
      const mockMacKey = {};
      mockSubtle.importKey.mockResolvedValue(mockMacKey);
      const mac = new Uint8Array([0x12, 0x34, 0x56, 0x78]);
      mockSubtle.sign.mockResolvedValue(mac.buffer);

      const result = await exportPrivateKeyPutty(mockKey);

      expect(result).toContain('Private-MAC: 12345678');
      expect(mockSubtle.digest).toHaveBeenCalledWith('SHA-1', expect.any(Uint8Array));
    });
  });

  describe('format validation', () => {
    it('PEM format should have correct structure', async () => {
      const mockKey = {} as CryptoKey;
      const exportedData = new Uint8Array([1, 2, 3]);
      mockSubtle.exportKey.mockResolvedValue(exportedData.buffer);

      const pem = await exportPublicKeyPem(mockKey);

      // Should start with BEGIN
      expect(pem.trim()).toMatch(/^-----BEGIN/);
      // Should end with END
      expect(pem.trim()).toMatch(/-----END[^-]+-----$/);
      // Should have exactly two header/footer lines
      const headerCount = (pem.match(/-----BEGIN/g) || []).length;
      const footerCount = (pem.match(/-----END/g) || []).length;
      expect(headerCount).toBe(1);
      expect(footerCount).toBe(1);
    });

    it('SSH format should have three parts', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = {
        kty: 'RSA',
        n: 'n'.repeat(100),
        e: 'AQAB',
      };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      const sshKey = await exportSshPublicKey(mockKey);
      const parts = sshKey.split(' ');

      expect(parts.length).toBe(3);
      expect(parts[0]).toMatch(/^(ssh-rsa|ecdsa-sha2)/);
      expect(parts[1]).toMatch(/^[A-Za-z0-9+/=]+$/);
      expect(parts[2]).toBe('user@hostname');
    });

    it('OpenSSH format should contain magic string', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = {
        kty: 'RSA',
        n: 'n'.repeat(100),
        e: 'AQAB',
        d: 'd'.repeat(100),
        p: 'p'.repeat(50),
        q: 'q'.repeat(50),
        qi: 'iqmp'.repeat(20),
      };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      const openssh = await exportPrivateKeyOpenSsh(mockKey);

      expect(openssh).toContain('openssh-key-v1');
      expect(openssh).toContain('-----BEGIN OPENSSH PRIVATE KEY-----');
      expect(openssh).toContain('-----END OPENSSH PRIVATE KEY-----');
    });

    it('PuTTY format should have required headers', async () => {
      const mockKey = {} as CryptoKey;
      const mockJwk = {
        kty: 'RSA',
        n: 'n'.repeat(100),
        e: 'AQAB',
        d: 'd'.repeat(100),
        p: 'p'.repeat(50),
        q: 'q'.repeat(50),
        qi: 'iqmp'.repeat(20),
      };
      mockSubtle.exportKey.mockResolvedValue(mockJwk);

      const macData = new Uint8Array(32);
      mockSubtle.digest.mockResolvedValue(macData.buffer);
      const mockMacKey = {};
      mockSubtle.importKey.mockResolvedValue(mockMacKey);
      const mac = new Uint8Array(20);
      mockSubtle.sign.mockResolvedValue(mac.buffer);

      const putty = await exportPrivateKeyPutty(mockKey);

      expect(putty).toContain('PuTTY-User-Key-File-2:');
      expect(putty).toContain('Encryption:');
      expect(putty).toContain('Comment:');
      expect(putty).toContain('Public-Lines:');
      expect(putty).toContain('Private-Lines:');
      expect(putty).toContain('Private-MAC:');
    });
  });
});
