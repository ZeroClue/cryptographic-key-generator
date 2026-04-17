import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateKey } from '@/services/crypto/generators';
import type { AlgorithmOption, PgpOptions } from '@/types';

// Mock openpgp module
vi.mock('openpgp', () => ({
  generateKey: vi.fn(),
  readKey: vi.fn(),
}));

// Mock converters
vi.mock('@/services/crypto/converters', () => ({
  arrayBufferToBase64: (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },
}));

// Mock exporters
vi.mock('@/services/crypto/exporters', () => ({
  exportPublicKeyPem: vi.fn(),
  exportSshPublicKey: vi.fn(),
}));

describe('generators', () => {
  let mockSubtle: any;

  beforeEach(() => {
    // Mock window.crypto.subtle
    mockSubtle = {
      generateKey: vi.fn(),
      exportKey: vi.fn(),
    };
    vi.stubGlobal('window', {
      crypto: {
        subtle: mockSubtle,
      },
    });

    vi.clearAllMocks();
  });

  describe('symmetric key generation', () => {
    describe('AES algorithms', () => {
      it('should generate AES-256-GCM key', async () => {
        const algorithm: AlgorithmOption = 'AES-256-GCM';
        const mockKey = {
          type: 'secret',
          algorithm: { name: 'AES-GCM', length: 256 },
        };
        const rawKey = new Uint8Array(32); // 256 bits
        mockSubtle.generateKey.mockResolvedValue(mockKey);
        mockSubtle.exportKey.mockResolvedValue(rawKey.buffer);

        const result = await generateKey(algorithm);

        expect(result.type).toBe('symmetric');
        expect(result.key).toBe(mockKey);
        expect(result.displayValue).toBeDefined();
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );
      });

      it('should generate AES-192-CBC key', async () => {
        const algorithm: AlgorithmOption = 'AES-192-CBC';
        const mockKey = {
          type: 'secret',
          algorithm: { name: 'AES-CBC', length: 192 },
        };
        const rawKey = new Uint8Array(24); // 192 bits
        mockSubtle.generateKey.mockResolvedValue(mockKey);
        mockSubtle.exportKey.mockResolvedValue(rawKey.buffer);

        const result = await generateKey(algorithm);

        expect(result.type).toBe('symmetric');
        expect(result.key).toBe(mockKey);
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          { name: 'AES-CBC', length: 192 },
          true,
          ['encrypt', 'decrypt']
        );
      });

      it('should generate AES-128-CTR key', async () => {
        const algorithm: AlgorithmOption = 'AES-128-CTR';
        const mockKey = {
          type: 'secret',
          algorithm: { name: 'AES-CTR', length: 128 },
        };
        const rawKey = new Uint8Array(16); // 128 bits
        mockSubtle.generateKey.mockResolvedValue(mockKey);
        mockSubtle.exportKey.mockResolvedValue(rawKey.buffer);

        const result = await generateKey(algorithm);

        expect(result.type).toBe('symmetric');
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          { name: 'AES-CTR', length: 128 },
          true,
          ['encrypt', 'decrypt']
        );
      });

      it('should export symmetric key as base64', async () => {
        const algorithm: AlgorithmOption = 'AES-256-GCM';
        const mockKey = { type: 'secret' };
        const rawKey = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        mockSubtle.generateKey.mockResolvedValue(mockKey);
        mockSubtle.exportKey.mockResolvedValue(rawKey.buffer);

        const result = await generateKey(algorithm);

        expect(result.displayValue).toMatch(/^[A-Za-z0-9+/=]+$/);
      });
    });

    describe('HMAC algorithms', () => {
      it('should generate HMAC-SHA-256 key', async () => {
        const algorithm: AlgorithmOption = 'HMAC-SHA-256';
        const mockKey = {
          type: 'secret',
          algorithm: { name: 'HMAC', hash: 'SHA-256' },
        };
        const rawKey = new Uint8Array(32);
        mockSubtle.generateKey.mockResolvedValue(mockKey);
        mockSubtle.exportKey.mockResolvedValue(rawKey.buffer);

        const result = await generateKey(algorithm);

        expect(result.type).toBe('symmetric');
        expect(result.key).toBe(mockKey);
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          { name: 'HMAC', hash: 'SHA-256' },
          true,
          ['sign', 'verify']
        );
      });

      it('should generate HMAC-SHA-384 key', async () => {
        const algorithm: AlgorithmOption = 'HMAC-SHA-384';
        const mockKey = {
          type: 'secret',
          algorithm: { name: 'HMAC', hash: 'SHA-384' },
        };
        const rawKey = new Uint8Array(48);
        mockSubtle.generateKey.mockResolvedValue(mockKey);
        mockSubtle.exportKey.mockResolvedValue(rawKey.buffer);

        const result = await generateKey(algorithm);

        expect(result.type).toBe('symmetric');
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          { name: 'HMAC', hash: 'SHA-384' },
          true,
          ['sign', 'verify']
        );
      });

      it('should generate HMAC-SHA-512 key', async () => {
        const algorithm: AlgorithmOption = 'HMAC-SHA-512';
        const mockKey = {
          type: 'secret',
          algorithm: { name: 'HMAC', hash: 'SHA-512' },
        };
        const rawKey = new Uint8Array(64);
        mockSubtle.generateKey.mockResolvedValue(mockKey);
        mockSubtle.exportKey.mockResolvedValue(rawKey.buffer);

        const result = await generateKey(algorithm);

        expect(result.type).toBe('symmetric');
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          { name: 'HMAC', hash: 'SHA-512' },
          true,
          ['sign', 'verify']
        );
      });
    });
  });

  describe('asymmetric key generation', () => {
    describe('RSA algorithms', () => {
      it('should generate RSA-OAEP-SHA-256-2048 key pair', async () => {
        const algorithm: AlgorithmOption = 'RSA-OAEP-SHA-256-2048';
        const mockPublicKey = { type: 'public' };
        const mockPrivateKey = { type: 'private' };
        const mockKeyPair = {
          publicKey: mockPublicKey,
          privateKey: mockPrivateKey,
        };
        mockSubtle.generateKey.mockResolvedValue(mockKeyPair);

        const { exportPublicKeyPem } = await import('@/services/crypto/exporters');
        (exportPublicKeyPem as any).mockResolvedValue('-----BEGIN PUBLIC KEY-----\ntest\n-----END PUBLIC KEY-----');

        const result = await generateKey(algorithm);

        expect(result.type).toBe('asymmetric');
        expect(result.keyPair).toBe(mockKeyPair);
        expect(result.displayValue).toContain('BEGIN PUBLIC KEY');
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: 'SHA-256',
          },
          true,
          ['encrypt', 'decrypt']
        );
      });

      it('should generate RSA-OAEP-SHA-512-4096 key pair', async () => {
        const algorithm: AlgorithmOption = 'RSA-OAEP-SHA-512-4096';
        const mockKeyPair = {
          publicKey: { type: 'public' },
          privateKey: { type: 'private' },
        };
        mockSubtle.generateKey.mockResolvedValue(mockKeyPair);

        const { exportPublicKeyPem } = await import('@/services/crypto/exporters');
        (exportPublicKeyPem as any).mockResolvedValue('-----BEGIN PUBLIC KEY-----\nrsa4096\n-----END PUBLIC KEY-----');

        const result = await generateKey(algorithm);

        expect(result.type).toBe('asymmetric');
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'RSA-OAEP',
            modulusLength: 4096,
            hash: 'SHA-512',
          }),
          true,
          ['encrypt', 'decrypt']
        );
      });

      it('should generate RSA-PSS-2048 key pair', async () => {
        const algorithm: AlgorithmOption = 'RSA-PSS-2048';
        const mockKeyPair = {
          publicKey: { type: 'public' },
          privateKey: { type: 'private' },
        };
        mockSubtle.generateKey.mockResolvedValue(mockKeyPair);

        const { exportPublicKeyPem } = await import('@/services/crypto/exporters');
        (exportPublicKeyPem as any).mockResolvedValue('-----BEGIN PUBLIC KEY-----\nrsapss\n-----END PUBLIC KEY-----');

        const result = await generateKey(algorithm);

        expect(result.type).toBe('asymmetric');
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'RSA-PSS',
            modulusLength: 2048,
          }),
          true,
          ['sign', 'verify']
        );
      });
    });

    describe('ECDSA algorithms', () => {
      it('should generate ECDSA-P-256 key pair', async () => {
        const algorithm: AlgorithmOption = 'ECDSA-P-256';
        const mockKeyPair = {
          publicKey: { type: 'public' },
          privateKey: { type: 'private' },
        };
        mockSubtle.generateKey.mockResolvedValue(mockKeyPair);

        const { exportPublicKeyPem } = await import('@/services/crypto/exporters');
        (exportPublicKeyPem as any).mockResolvedValue('-----BEGIN PUBLIC KEY-----\necdsa\n-----END PUBLIC KEY-----');

        const result = await generateKey(algorithm);

        expect(result.type).toBe('asymmetric');
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          {
            name: 'ECDSA',
            namedCurve: 'P-256',
          },
          true,
          ['sign', 'verify']
        );
      });

      it('should generate ECDSA-P-384 key pair', async () => {
        const algorithm: AlgorithmOption = 'ECDSA-P-384';
        const mockKeyPair = {
          publicKey: { type: 'public' },
          privateKey: { type: 'private' },
        };
        mockSubtle.generateKey.mockResolvedValue(mockKeyPair);

        const { exportPublicKeyPem } = await import('@/services/crypto/exporters');
        (exportPublicKeyPem as any).mockResolvedValue('-----BEGIN PUBLIC KEY-----\necdsa384\n-----END PUBLIC KEY-----');

        const result = await generateKey(algorithm);

        expect(result.type).toBe('asymmetric');
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          {
            name: 'ECDSA',
            namedCurve: 'P-384',
          },
          true,
          ['sign', 'verify']
        );
      });

      it('should generate ECDSA-P-521 key pair', async () => {
        const algorithm: AlgorithmOption = 'ECDSA-P-521';
        const mockKeyPair = {
          publicKey: { type: 'public' },
          privateKey: { type: 'private' },
        };
        mockSubtle.generateKey.mockResolvedValue(mockKeyPair);

        const { exportPublicKeyPem } = await import('@/services/crypto/exporters');
        (exportPublicKeyPem as any).mockResolvedValue('-----BEGIN PUBLIC KEY-----\necdsa521\n-----END PUBLIC KEY-----');

        const result = await generateKey(algorithm);

        expect(result.type).toBe('asymmetric');
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          {
            name: 'ECDSA',
            namedCurve: 'P-521',
          },
          true,
          ['sign', 'verify']
        );
      });
    });

    describe('ECDH algorithms', () => {
      it('should generate ECDH-P-256 key pair', async () => {
        const algorithm: AlgorithmOption = 'ECDH-P-256';
        const mockKeyPair = {
          publicKey: { type: 'public' },
          privateKey: { type: 'private' },
        };
        mockSubtle.generateKey.mockResolvedValue(mockKeyPair);

        const { exportPublicKeyPem } = await import('@/services/crypto/exporters');
        (exportPublicKeyPem as any).mockResolvedValue('-----BEGIN PUBLIC KEY-----\necdh\n-----END PUBLIC KEY-----');

        const result = await generateKey(algorithm);

        expect(result.type).toBe('asymmetric');
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          {
            name: 'ECDH',
            namedCurve: 'P-256',
          },
          true,
          ['deriveKey', 'deriveBits']
        );
      });

      it('should generate ECDH-P-384 key pair', async () => {
        const algorithm: AlgorithmOption = 'ECDH-P-384';
        const mockKeyPair = {
          publicKey: { type: 'public' },
          privateKey: { type: 'private' },
        };
        mockSubtle.generateKey.mockResolvedValue(mockKeyPair);

        const { exportPublicKeyPem } = await import('@/services/crypto/exporters');
        (exportPublicKeyPem as any).mockResolvedValue('-----BEGIN PUBLIC KEY-----\necdh384\n-----END PUBLIC KEY-----');

        const result = await generateKey(algorithm);

        expect(result.type).toBe('asymmetric');
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          {
            name: 'ECDH',
            namedCurve: 'P-384',
          },
          true,
          ['deriveKey', 'deriveBits']
        );
      });

      it('should generate ECDH-P-521 key pair', async () => {
        const algorithm: AlgorithmOption = 'ECDH-P-521';
        const mockKeyPair = {
          publicKey: { type: 'public' },
          privateKey: { type: 'private' },
        };
        mockSubtle.generateKey.mockResolvedValue(mockKeyPair);

        const { exportPublicKeyPem } = await import('@/services/crypto/exporters');
        (exportPublicKeyPem as any).mockResolvedValue('-----BEGIN PUBLIC KEY-----\necdh521\n-----END PUBLIC KEY-----');

        const result = await generateKey(algorithm);

        expect(result.type).toBe('asymmetric');
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          {
            name: 'ECDH',
            namedCurve: 'P-521',
          },
          true,
          ['deriveKey', 'deriveBits']
        );
      });
    });

    describe('SSH algorithms', () => {
      it('should generate SSH-RSA-2048 key pair', async () => {
        const algorithm: AlgorithmOption = 'SSH-RSA-2048';
        const mockKeyPair = {
          publicKey: { type: 'public' },
          privateKey: { type: 'private' },
        };
        mockSubtle.generateKey.mockResolvedValue(mockKeyPair);

        const { exportSshPublicKey } = await import('@/services/crypto/exporters');
        (exportSshPublicKey as any).mockResolvedValue('ssh-rsa AAAAB3NzaC1yc2E... user@hostname');

        const result = await generateKey(algorithm);

        expect(result.type).toBe('asymmetric');
        expect(result.displayValue).toContain('ssh-rsa');
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          {
            name: 'RSA-PSS',
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: 'SHA-256',
          },
          true,
          ['sign', 'verify']
        );
      });

      it('should generate SSH-RSA-4096 key pair', async () => {
        const algorithm: AlgorithmOption = 'SSH-RSA-4096';
        const mockKeyPair = {
          publicKey: { type: 'public' },
          privateKey: { type: 'private' },
        };
        mockSubtle.generateKey.mockResolvedValue(mockKeyPair);

        const { exportSshPublicKey } = await import('@/services/crypto/exporters');
        (exportSshPublicKey as any).mockResolvedValue('ssh-rsa AAAAB3NzaC1yc2E... user@hostname');

        const result = await generateKey(algorithm);

        expect(result.type).toBe('asymmetric');
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          expect.objectContaining({
            modulusLength: 4096,
          }),
          true,
          ['sign', 'verify']
        );
      });

      it('should generate SSH-ECDSA-P256 key pair', async () => {
        const algorithm: AlgorithmOption = 'SSH-ECDSA-P256';
        const mockKeyPair = {
          publicKey: { type: 'public' },
          privateKey: { type: 'private' },
        };
        mockSubtle.generateKey.mockResolvedValue(mockKeyPair);

        const { exportSshPublicKey } = await import('@/services/crypto/exporters');
        (exportSshPublicKey as any).mockResolvedValue('ecdsa-sha2-nistp256 AAAA... user@hostname');

        const result = await generateKey(algorithm);

        expect(result.type).toBe('asymmetric');
        expect(result.displayValue).toContain('ecdsa-sha2-nistp256');
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          {
            name: 'ECDSA',
            namedCurve: 'P-256',
          },
          true,
          ['sign', 'verify']
        );
      });

      it('should generate SSH-ECDSA-P384 key pair', async () => {
        const algorithm: AlgorithmOption = 'SSH-ECDSA-P384';
        const mockKeyPair = {
          publicKey: { type: 'public' },
          privateKey: { type: 'private' },
        };
        mockSubtle.generateKey.mockResolvedValue(mockKeyPair);

        const { exportSshPublicKey } = await import('@/services/crypto/exporters');
        (exportSshPublicKey as any).mockResolvedValue('ecdsa-sha2-nistp384 AAAA... user@hostname');

        const result = await generateKey(algorithm);

        expect(result.type).toBe('asymmetric');
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          {
            name: 'ECDSA',
            namedCurve: 'P-384',
          },
          true,
          ['sign', 'verify']
        );
      });

      it('should generate SSH-ECDSA-P521 key pair', async () => {
        const algorithm: AlgorithmOption = 'SSH-ECDSA-P521';
        const mockKeyPair = {
          publicKey: { type: 'public' },
          privateKey: { type: 'private' },
        };
        mockSubtle.generateKey.mockResolvedValue(mockKeyPair);

        const { exportSshPublicKey } = await import('@/services/crypto/exporters');
        (exportSshPublicKey as any).mockResolvedValue('ecdsa-sha2-nistp521 AAAA... user@hostname');

        const result = await generateKey(algorithm);

        expect(result.type).toBe('asymmetric');
        expect(mockSubtle.generateKey).toHaveBeenCalledWith(
          {
            name: 'ECDSA',
            namedCurve: 'P-521',
          },
          true,
          ['sign', 'verify']
        );
      });
    });
  });

  describe('PGP key generation', () => {
    it('should generate PGP-RSA-2048 key', async () => {
      const algorithm: AlgorithmOption = 'PGP-RSA-2048';
      const pgpOptions: PgpOptions = {
        name: 'Test User',
        email: 'test@example.com',
        passphrase: 'test123',
      };

      const openpgp = await import('openpgp');
      (openpgp.generateKey as any).mockResolvedValue({
        publicKey: '-----BEGIN PGP PUBLIC KEY-----\ntest\n-----END PGP PUBLIC KEY-----',
        privateKey: '-----BEGIN PGP PRIVATE KEY-----\ntest\n-----END PGP PRIVATE KEY-----',
      });

      const mockPublicKey = {
        getKeyID: vi.fn(() => ({ toHex: vi.fn(() => 'ABCD1234') })),
      };
      (openpgp.readKey as any).mockResolvedValue(mockPublicKey);

      const result = await generateKey(algorithm, pgpOptions);

      expect(result.type).toBe('pgp');
      expect(result.publicKey).toContain('BEGIN PGP PUBLIC KEY');
      expect(result.privateKey).toContain('BEGIN PGP PRIVATE KEY');
      expect(result.keyID).toBe('ABCD1234');
      expect(openpgp.generateKey).toHaveBeenCalledWith({
        type: 'rsa',
        rsaBits: 2048,
        userIDs: [{ name: 'Test User', email: 'test@example.com' }],
        passphrase: 'test123',
      });
    });

    it('should generate PGP-RSA-4096 key', async () => {
      const algorithm: AlgorithmOption = 'PGP-RSA-4096';
      const pgpOptions: PgpOptions = {
        name: 'Test User',
        email: 'test@example.com',
        passphrase: 'pass',
      };

      const openpgp = await import('openpgp');
      (openpgp.generateKey as any).mockResolvedValue({
        publicKey: '-----BEGIN PGP PUBLIC KEY-----\n4096\n-----END PGP PUBLIC KEY-----',
        privateKey: '-----BEGIN PGP PRIVATE KEY-----\n4096\n-----END PGP PRIVATE KEY-----',
      });

      const mockPublicKey = {
        getKeyID: vi.fn(() => ({ toHex: vi.fn(() => 'EFGH5678') })),
      };
      (openpgp.readKey as any).mockResolvedValue(mockPublicKey);

      const result = await generateKey(algorithm, pgpOptions);

      expect(result.type).toBe('pgp');
      expect(openpgp.generateKey).toHaveBeenCalledWith(
        expect.objectContaining({
          rsaBits: 4096,
        })
      );
    });

    it('should generate PGP-ECC-curve25519 key', async () => {
      const algorithm: AlgorithmOption = 'PGP-ECC-curve25519';
      const pgpOptions: PgpOptions = {
        name: 'ECC User',
        email: 'ecc@example.com',
        passphrase: 'eccpass',
      };

      const openpgp = await import('openpgp');
      (openpgp.generateKey as any).mockResolvedValue({
        publicKey: '-----BEGIN PGP PUBLIC KEY-----\necc\n-----END PGP PUBLIC KEY-----',
        privateKey: '-----BEGIN PGP PRIVATE KEY-----\necc\n-----END PGP PRIVATE KEY-----',
      });

      const mockPublicKey = {
        getKeyID: vi.fn(() => ({ toHex: vi.fn(() => 'IJKL9012') })),
      };
      (openpgp.readKey as any).mockResolvedValue(mockPublicKey);

      const result = await generateKey(algorithm, pgpOptions);

      expect(result.type).toBe('pgp');
      expect(openpgp.generateKey).toHaveBeenCalledWith({
        type: 'ecc',
        curve: 'curve25519',
        userIDs: [{ name: 'ECC User', email: 'ecc@example.com' }],
        passphrase: 'eccpass',
      });
    });

    it('should throw error when PGP options are missing', async () => {
      const algorithm: AlgorithmOption = 'PGP-RSA-2048';

      await expect(generateKey(algorithm)).rejects.toThrow('PGP user information is required for key generation');
    });

    it('should throw error for unsupported PGP key type', async () => {
      const algorithm: AlgorithmOption = 'PGP-INVALID-2048' as AlgorithmOption;
      const pgpOptions: PgpOptions = {
        name: 'Test',
        email: 'test@test.com',
        passphrase: 'test',
      };

      await expect(generateKey(algorithm, pgpOptions)).rejects.toThrow('Unsupported PGP key type');
    });
  });

  describe('error handling', () => {
    it('should throw error for unsupported algorithm', async () => {
      const algorithm: AlgorithmOption = 'INVALID-ALGORITHM' as AlgorithmOption;

      await expect(generateKey(algorithm)).rejects.toThrow('Unsupported algorithm');
    });

    it('should throw error when Web Crypto API is not available', async () => {
      vi.stubGlobal('window', {
        crypto: {},
      });

      const algorithm: AlgorithmOption = 'AES-256-GCM';

      await expect(generateKey(algorithm)).rejects.toThrow('Web Crypto API is not supported');
    });

    it('should throw error for unsupported SSH key type', async () => {
      const algorithm: AlgorithmOption = 'SSH-INVALID-2048' as AlgorithmOption;

      await expect(generateKey(algorithm)).rejects.toThrow('Unsupported SSH key type');
    });
  });

  describe('result type verification', () => {
    it('should return symmetric key result for AES', async () => {
      const algorithm: AlgorithmOption = 'AES-256-GCM';
      const mockKey = { type: 'secret' };
      mockSubtle.generateKey.mockResolvedValue(mockKey);
      mockSubtle.exportKey.mockResolvedValue(new Uint8Array(32).buffer);

      const result = await generateKey(algorithm);

      expect(result).toHaveProperty('type', 'symmetric');
      expect(result).toHaveProperty('key');
      expect(result).toHaveProperty('displayValue');
      expect(result).not.toHaveProperty('keyPair');
    });

    it('should return asymmetric key result for RSA', async () => {
      const algorithm: AlgorithmOption = 'RSA-OAEP-SHA-256-2048';
      const mockKeyPair = {
        publicKey: { type: 'public' },
        privateKey: { type: 'private' },
      };
      mockSubtle.generateKey.mockResolvedValue(mockKeyPair);

      const { exportPublicKeyPem } = await import('@/services/crypto/exporters');
      (exportPublicKeyPem as any).mockResolvedValue('-----BEGIN PUBLIC KEY-----\ntest\n-----END PUBLIC KEY-----');

      const result = await generateKey(algorithm);

      expect(result).toHaveProperty('type', 'asymmetric');
      expect(result).toHaveProperty('keyPair');
      expect(result).toHaveProperty('displayValue');
      expect(result).not.toHaveProperty('key');
    });

    it('should return PGP key result for PGP', async () => {
      const algorithm: AlgorithmOption = 'PGP-RSA-2048';
      const pgpOptions: PgpOptions = {
        name: 'Test',
        email: 'test@test.com',
        passphrase: 'test',
      };

      const openpgp = await import('openpgp');
      (openpgp.generateKey as any).mockResolvedValue({
        publicKey: '-----BEGIN PGP PUBLIC KEY-----\ntest\n-----END PGP PUBLIC KEY-----',
        privateKey: '-----BEGIN PGP PRIVATE KEY-----\ntest\n-----END PGP PRIVATE KEY-----',
      });

      const mockPublicKey = {
        getKeyID: vi.fn(() => ({ toHex: vi.fn(() => 'ABCD') })),
      };
      (openpgp.readKey as any).mockResolvedValue(mockPublicKey);

      const result = await generateKey(algorithm, pgpOptions);

      expect(result).toHaveProperty('type', 'pgp');
      expect(result).toHaveProperty('publicKey');
      expect(result).toHaveProperty('privateKey');
      expect(result).toHaveProperty('keyID');
      expect(result).toHaveProperty('displayValue');
      expect(result).not.toHaveProperty('key');
      expect(result).not.toHaveProperty('keyPair');
    });
  });

  describe('output format validation', () => {
    it('should generate valid Base64 for symmetric keys', async () => {
      const algorithm: AlgorithmOption = 'AES-256-GCM';
      const mockKey = { type: 'secret' };
      const rawKey = new Uint8Array([1, 2, 3, 4, 5]);
      mockSubtle.generateKey.mockResolvedValue(mockKey);
      mockSubtle.exportKey.mockResolvedValue(rawKey.buffer);

      const result = await generateKey(algorithm);

      expect(result.displayValue).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    it('should generate valid PEM for RSA keys', async () => {
      const algorithm: AlgorithmOption = 'RSA-OAEP-SHA-256-2048';
      const mockKeyPair = {
        publicKey: { type: 'public' },
        privateKey: { type: 'private' },
      };
      mockSubtle.generateKey.mockResolvedValue(mockKeyPair);

      const { exportPublicKeyPem } = await import('@/services/crypto/exporters');
      const pemKey = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\n-----END PUBLIC KEY-----';
      (exportPublicKeyPem as any).mockResolvedValue(pemKey);

      const result = await generateKey(algorithm);

      expect(result.displayValue).toContain('-----BEGIN PUBLIC KEY-----');
      expect(result.displayValue).toContain('-----END PUBLIC KEY-----');
    });

    it('should generate valid SSH format for SSH keys', async () => {
      const algorithm: AlgorithmOption = 'SSH-RSA-2048';
      const mockKeyPair = {
        publicKey: { type: 'public' },
        privateKey: { type: 'private' },
      };
      mockSubtle.generateKey.mockResolvedValue(mockKeyPair);

      const { exportSshPublicKey } = await import('@/services/crypto/exporters');
      const sshKey = 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC user@hostname';
      (exportSshPublicKey as any).mockResolvedValue(sshKey);

      const result = await generateKey(algorithm);

      expect(result.displayValue).toMatch(/^ssh-rsa\s+[\w+/=]+\s+user@hostname$/);
    });

    it('should generate valid PEM for PGP keys', async () => {
      const algorithm: AlgorithmOption = 'PGP-RSA-2048';
      const pgpOptions: PgpOptions = {
        name: 'Test',
        email: 'test@test.com',
        passphrase: 'test',
      };

      const openpgp = await import('openpgp');
      const pgpPublicKey = '-----BEGIN PGP PUBLIC KEY-----\nPGPKEY\n-----END PGP PUBLIC KEY-----';
      (openpgp.generateKey as any).mockResolvedValue({
        publicKey: pgpPublicKey,
        privateKey: '-----BEGIN PGP PRIVATE KEY-----\nPGPKEY\n-----END PGP PRIVATE KEY-----',
      });

      const mockPublicKey = {
        getKeyID: vi.fn(() => ({ toHex: vi.fn(() => 'ABCD') })),
      };
      (openpgp.readKey as any).mockResolvedValue(mockPublicKey);

      const result = await generateKey(algorithm, pgpOptions);

      expect(result.displayValue).toContain('-----BEGIN PGP PUBLIC KEY-----');
      expect(result.displayValue).toContain('-----END PGP PUBLIC KEY-----');
    });
  });
});
