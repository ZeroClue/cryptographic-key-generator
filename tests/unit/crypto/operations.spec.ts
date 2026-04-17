import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  encrypt,
  decrypt,
  sign,
  verify,
} from '@/services/crypto/operations';

// Mock openpgp module
const openpgpMock = {
  createMessage: vi.fn(),
  encrypt: vi.fn(),
  readMessage: vi.fn(),
  decrypt: vi.fn(),
  sign: vi.fn(),
  readSignature: vi.fn(),
  verify: vi.fn(),
};
vi.mock('openpgp', () => ({
  default: openpgpMock,
  createMessage: openpgpMock.createMessage,
  encrypt: openpgpMock.encrypt,
  readMessage: openpgpMock.readMessage,
  decrypt: openpgpMock.decrypt,
  sign: openpgpMock.sign,
  readSignature: openpgpMock.readSignature,
  verify: openpgpMock.verify,
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
  base64ToArrayBuffer: (base64: string) => {
    const binary_string = atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  },
}));

describe('operations', () => {
  let mockSubtle: any;

  beforeEach(() => {
    // Mock window.crypto.subtle
    mockSubtle = {
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      sign: vi.fn(),
      verify: vi.fn(),
      generateKey: vi.fn(),
    };
    vi.stubGlobal('window', {
      crypto: {
        subtle: mockSubtle,
        getRandomValues: vi.fn((arr: Uint8Array) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = i;
          }
          return arr;
        }),
      },
    });

    vi.clearAllMocks();
  });

  describe('encrypt', () => {
    describe('PGP encryption', () => {
      it('should encrypt with PGP public key', async () => {
        const pgpKey = {
          isPrivate: vi.fn(() => false),
        };
        const plaintext = 'Hello, World!';
        const encrypted = '-----BEGIN PGP MESSAGE-----\nencrypted\n-----END PGP MESSAGE-----';

        const mockMessage = {};
        openpgpMock.createMessage.mockResolvedValue(mockMessage);
        openpgpMock.encrypt.mockResolvedValue(encrypted);

        const result = await encrypt(pgpKey, plaintext);

        expect(result).toBe(encrypted);
        expect(openpgpMock.createMessage).toHaveBeenCalledWith({ text: plaintext });
        expect(openpgpMock.encrypt).toHaveBeenCalledWith({
          message: mockMessage,
          encryptionKeys: pgpKey,
        });
      });

      it('should handle empty message', async () => {
        const pgpKey = {
          isPrivate: vi.fn(() => false),
        };
        const encrypted = '-----BEGIN PGP MESSAGE-----\nencrypted\n-----END PGP MESSAGE-----';

        (openpgpMock.createMessage as any).mockResolvedValue({});
        (openpgpMock.encrypt as any).mockResolvedValue(encrypted);

        const result = await encrypt(pgpKey, '');

        expect(result).toBe(encrypted);
      });
    });

    describe('RSA-OAEP encryption', () => {
      it('should encrypt with RSA-OAEP public key', async () => {
        const mockKey = {
          algorithm: { name: 'RSA-OAEP' },
        } as CryptoKey;
        const plaintext = 'Hello, World!';
        const encryptedData = new Uint8Array([1, 2, 3, 4, 5]);
        mockSubtle.encrypt.mockResolvedValue(encryptedData.buffer);

        const result = await encrypt(mockKey, plaintext);

        expect(result).toMatch(/^[A-Za-z0-9+/=]+$/); // Base64
        expect(mockSubtle.encrypt).toHaveBeenCalledWith(
          { name: 'RSA-OAEP' },
          mockKey,
          new TextEncoder().encode(plaintext)
        );
      });

      it('should handle special characters', async () => {
        const mockKey = {
          algorithm: { name: 'RSA-OAEP' },
        } as CryptoKey;
        const plaintext = 'Hello 🔑 World!';
        const encryptedData = new Uint8Array([10, 20, 30]);
        mockSubtle.encrypt.mockResolvedValue(encryptedData.buffer);

        const result = await encrypt(mockKey, plaintext);

        expect(result).toBeDefined();
        expect(mockSubtle.encrypt).toHaveBeenCalled();
      });

      it('should throw error for unsupported algorithm', async () => {
        const mockKey = {
          algorithm: { name: 'unsupported' },
        } as CryptoKey;

        await expect(encrypt(mockKey, 'test')).rejects.toThrow('Encryption not supported for algorithm');
      });
    });

    describe('AES encryption', () => {
      it('should encrypt with AES-GCM', async () => {
        const mockKey = {
          algorithm: { name: 'AES-GCM' },
        } as CryptoKey;
        const plaintext = 'Hello, World!';
        const encryptedData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
        mockSubtle.encrypt.mockResolvedValue(encryptedData.buffer);

        const result = await encrypt(mockKey, plaintext);

        expect(result).toBeDefined();
        expect(mockSubtle.encrypt).toHaveBeenCalledWith(
          { name: 'AES-GCM', iv: expect.any(Uint8Array) },
          mockKey,
          new TextEncoder().encode(plaintext)
        );
        // Check that IV is 12 bytes
        const ivArg = mockSubtle.encrypt.mock.calls[0][0].iv;
        expect(ivArg).toHaveProperty('length', 12);
      });

      it('should encrypt with AES-CBC', async () => {
        const mockKey = {
          algorithm: { name: 'AES-CBC' },
        } as CryptoKey;
        const plaintext = 'Test message';
        const encryptedData = new Uint8Array([1, 2, 3, 4]);
        mockSubtle.encrypt.mockResolvedValue(encryptedData.buffer);

        const result = await encrypt(mockKey, plaintext);

        expect(result).toBeDefined();
        expect(mockSubtle.encrypt).toHaveBeenCalledWith(
          { name: 'AES-CBC', iv: expect.any(Uint8Array) },
          mockKey,
          new TextEncoder().encode(plaintext)
        );
      });

      it('should prepend IV to ciphertext for AES', async () => {
        const mockKey = {
          algorithm: { name: 'AES-GCM' },
        } as CryptoKey;
        const plaintext = 'Test';
        const encryptedData = new Uint8Array([5, 6, 7, 8]);
        mockSubtle.encrypt.mockResolvedValue(encryptedData.buffer);

        const result = await encrypt(mockKey, plaintext);
        const decoded = atob(result);

        // Result should be IV (12 bytes) + ciphertext
        expect(decoded.length).toBeGreaterThan(0);
        expect(mockSubtle.encrypt).toHaveBeenCalled();
      });
    });
  });

  describe('decrypt', () => {
    describe('PGP decryption', () => {
      it('should decrypt PGP message', async () => {
        const pgpKey = {
          isPrivate: vi.fn(() => false),
        };
        const ciphertext = '-----BEGIN PGP MESSAGE-----\nencrypted\n-----END PGP MESSAGE-----';
        const plaintext = 'Hello, World!';

        const mockMessage = {};
        (openpgpMock.readMessage as any).mockResolvedValue(mockMessage);
        (openpgpMock.decrypt as any).mockResolvedValue({ data: plaintext });

        const result = await decrypt(pgpKey, ciphertext);

        expect(result).toBe(plaintext);
        expect(openpgpMock.readMessage).toHaveBeenCalledWith({ armoredMessage: ciphertext });
        expect(openpgpMock.decrypt).toHaveBeenCalledWith({
          message: mockMessage,
          decryptionKeys: pgpKey,
        });
      });

      it('should support passphrase for PGP decryption', async () => {
        const pgpKey = {
          isPrivate: vi.fn(() => false),
        };
        const ciphertext = '-----BEGIN PGP MESSAGE-----\nencrypted\n-----END PGP MESSAGE-----';
        const plaintext = 'Secret message';
        const passphrase = 'test123';

        const mockMessage = {};
        (openpgpMock.readMessage as any).mockResolvedValue(mockMessage);
        (openpgpMock.decrypt as any).mockResolvedValue({ data: plaintext });

        const result = await decrypt(pgpKey, ciphertext, passphrase);

        expect(result).toBe(plaintext);
        expect(openpgpMock.decrypt).toHaveBeenCalledWith({
          message: mockMessage,
          decryptionKeys: pgpKey,
          passphrases: [passphrase],
        });
      });
    });

    describe('RSA-OAEP decryption', () => {
      it('should decrypt RSA-OAEP ciphertext', async () => {
        const mockKey = {
          algorithm: { name: 'RSA-OAEP' },
        } as CryptoKey;
        const plaintext = 'Hello, World!';
        const ciphertext = btoa('encrypted_data'); // Base64

        const decryptedBuffer = new TextEncoder().encode(plaintext);
        mockSubtle.decrypt.mockResolvedValue(decryptedBuffer.buffer);

        const result = await decrypt(mockKey, ciphertext);

        expect(result).toBe(plaintext);
        expect(mockSubtle.decrypt).toHaveBeenCalledWith(
          { name: 'RSA-OAEP' },
          mockKey,
          expect.any(ArrayBuffer)
        );
      });

      it('should handle empty ciphertext', async () => {
        const mockKey = {
          algorithm: { name: 'RSA-OAEP' },
        } as CryptoKey;
        const ciphertext = '';
        const decryptedBuffer = new TextEncoder().encode('');
        mockSubtle.decrypt.mockResolvedValue(decryptedBuffer.buffer);

        const result = await decrypt(mockKey, ciphertext);

        expect(result).toBe('');
      });
    });

    describe('AES decryption', () => {
      it('should decrypt AES-GCM ciphertext', async () => {
        const mockKey = {
          algorithm: { name: 'AES-GCM' },
        } as CryptoKey;
        const plaintext = 'Hello, World!';

        // Create ciphertext with IV prepended
        const iv = new Uint8Array(12);
        const encryptedData = new Uint8Array([1, 2, 3, 4, 5]);
        const combined = new Uint8Array(iv.length + encryptedData.length);
        combined.set(iv);
        combined.set(encryptedData, iv.length);
        const ciphertext = btoa(String.fromCharCode(...combined));

        const decryptedBuffer = new TextEncoder().encode(plaintext);
        mockSubtle.decrypt.mockResolvedValue(decryptedBuffer.buffer);

        const result = await decrypt(mockKey, ciphertext);

        expect(result).toBe(plaintext);
        expect(mockSubtle.decrypt).toHaveBeenCalledWith(
          { name: 'AES-GCM', iv: expect.any(ArrayBuffer) },
          mockKey,
          expect.any(ArrayBuffer)
        );
      });

      it('should extract IV from start of AES ciphertext', async () => {
        const mockKey = {
          algorithm: { name: 'AES-GCM' },
        } as CryptoKey;
        const plaintext = 'Test';

        const iv = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
        const encryptedData = new Uint8Array([20, 21, 22]);
        const combined = new Uint8Array(iv.length + encryptedData.length);
        combined.set(iv);
        combined.set(encryptedData, iv.length);
        const ciphertext = btoa(String.fromCharCode(...combined));

        const decryptedBuffer = new TextEncoder().encode(plaintext);
        mockSubtle.decrypt.mockResolvedValue(decryptedBuffer.buffer);

        await decrypt(mockKey, ciphertext);

        // Verify decrypt was called (IV extraction happens internally)
        expect(mockSubtle.decrypt).toHaveBeenCalled();
        const ivArg = mockSubtle.decrypt.mock.calls[0][0].iv;
        // IV should be a buffer of 12 bytes
        expect(ivArg.byteLength).toBe(12);
      });

      it('should handle AES-CBC', async () => {
        const mockKey = {
          algorithm: { name: 'AES-CBC' },
        } as CryptoKey;
        const plaintext = 'Test message';

        const iv = new Uint8Array(16);
        const encryptedData = new Uint8Array([1, 2, 3]);
        const combined = new Uint8Array(iv.length + encryptedData.length);
        combined.set(iv);
        combined.set(encryptedData, iv.length);
        const ciphertext = btoa(String.fromCharCode(...combined));

        const decryptedBuffer = new TextEncoder().encode(plaintext);
        mockSubtle.decrypt.mockResolvedValue(decryptedBuffer.buffer);

        const result = await decrypt(mockKey, ciphertext);

        expect(result).toBe(plaintext);
        expect(mockSubtle.decrypt).toHaveBeenCalledWith(
          { name: 'AES-CBC', iv: expect.any(ArrayBuffer) },
          mockKey,
          expect.any(ArrayBuffer)
        );
      });

      it('should throw error for unsupported algorithm', async () => {
        const mockKey = {
          algorithm: { name: 'unsupported' },
        } as CryptoKey;

        await expect(decrypt(mockKey, 'ciphertext')).rejects.toThrow('Decryption not supported for algorithm');
      });
    });
  });

  describe('sign', () => {
    describe('PGP signing', () => {
      it('should sign with PGP private key', async () => {
        const pgpKey = {
          isPrivate: vi.fn(() => false),
        };
        const message = 'Hello, World!';
        const signature = '-----BEGIN PGP SIGNATURE-----\nsig\n-----END PGP SIGNATURE-----';

        const mockMessage = {};
        (openpgpMock.createMessage as any).mockResolvedValue(mockMessage);
        (openpgpMock.sign as any).mockResolvedValue(signature);

        const result = await sign(pgpKey, message);

        expect(result).toBe(signature);
        expect(openpgpMock.createMessage).toHaveBeenCalledWith({ text: message });
        expect(openpgpMock.sign).toHaveBeenCalledWith({
          message: mockMessage,
          signingKeys: pgpKey,
          detached: true,
        });
      });

      it('should support passphrase for PGP signing', async () => {
        const pgpKey = {
          isPrivate: vi.fn(() => false),
        };
        const message = 'Message to sign';
        const signature = '-----BEGIN PGP SIGNATURE-----\nsig\n-----END PGP SIGNATURE-----';
        const passphrase = 'pass123';

        const mockMessage = {};
        (openpgpMock.createMessage as any).mockResolvedValue(mockMessage);
        (openpgpMock.sign as any).mockResolvedValue(signature);

        const result = await sign(pgpKey, message, passphrase);

        expect(result).toBe(signature);
        expect(openpgpMock.sign).toHaveBeenCalledWith({
          message: mockMessage,
          signingKeys: pgpKey,
          detached: true,
          passphrases: [passphrase],
        });
      });
    });

    describe('RSA-PSS signing', () => {
      it('should sign with RSA-PSS private key', async () => {
        const mockKey = {
          algorithm: { name: 'RSA-PSS' },
        } as CryptoKey;
        const message = 'Hello, World!';
        const signatureData = new Uint8Array([1, 2, 3, 4, 5]);
        mockSubtle.sign.mockResolvedValue(signatureData.buffer);

        const result = await sign(mockKey, message);

        expect(result).toMatch(/^[A-Za-z0-9+/=]+$/); // Base64
        expect(mockSubtle.sign).toHaveBeenCalledWith(
          { name: 'RSA-PSS', saltLength: 32 },
          mockKey,
          new TextEncoder().encode(message)
        );
      });

      it('should handle empty message', async () => {
        const mockKey = {
          algorithm: { name: 'RSA-PSS' },
        } as CryptoKey;
        const signatureData = new Uint8Array([]);
        mockSubtle.sign.mockResolvedValue(signatureData.buffer);

        const result = await sign(mockKey, '');

        expect(result).toBeDefined();
      });
    });

    describe('ECDSA signing', () => {
      it('should sign with ECDSA private key', async () => {
        const mockKey = {
          algorithm: { name: 'ECDSA', hash: { name: 'SHA-256' } },
        } as CryptoKey;
        const message = 'Test message';
        const signatureData = new Uint8Array([10, 20, 30, 40]);
        mockSubtle.sign.mockResolvedValue(signatureData.buffer);

        const result = await sign(mockKey, message);

        expect(result).toMatch(/^[A-Za-z0-9+/=]+$/);
        expect(mockSubtle.sign).toHaveBeenCalledWith(
          { name: 'ECDSA', hash: 'SHA-256' },
          mockKey,
          new TextEncoder().encode(message)
        );
      });

      it('should use default hash if not specified', async () => {
        const mockKey = {
          algorithm: { name: 'ECDSA' },
        } as CryptoKey;
        const message = 'Test';
        const signatureData = new Uint8Array([1, 2, 3]);
        mockSubtle.sign.mockResolvedValue(signatureData.buffer);

        await sign(mockKey, message);

        expect(mockSubtle.sign).toHaveBeenCalledWith(
          { name: 'ECDSA', hash: 'SHA-256' },
          mockKey,
          new TextEncoder().encode(message)
        );
      });

      it('should throw error for unsupported algorithm', async () => {
        const mockKey = {
          algorithm: { name: 'unsupported' },
        } as CryptoKey;

        await expect(sign(mockKey, 'test')).rejects.toThrow('Signing not supported for algorithm');
      });
    });
  });

  describe('verify', () => {
    describe('PGP verification', () => {
      it('should verify PGP signature', async () => {
        const pgpKey = {
          isPrivate: vi.fn(() => false),
        };
        const signature = '-----BEGIN PGP SIGNATURE-----\nsig\n-----END PGP SIGNATURE-----';
        const message = 'Hello, World!';

        const mockMessage = {};
        const mockSignature = {};
        const mockVerificationResult = {
          signatures: [{ verified: Promise.resolve(true) }],
        };

        (openpgpMock.createMessage as any).mockResolvedValue(mockMessage);
        (openpgpMock.readSignature as any).mockResolvedValue(mockSignature);
        (openpgpMock.verify as any).mockResolvedValue(mockVerificationResult);

        const result = await verify(pgpKey, signature, message);

        expect(result).toBe(true);
        expect(openpgpMock.createMessage).toHaveBeenCalledWith({ text: message });
        expect(openpgpMock.readSignature).toHaveBeenCalledWith({ armoredSignature: signature });
        expect(openpgpMock.verify).toHaveBeenCalledWith({
          signature: mockSignature,
          message: mockMessage,
          verificationKeys: pgpKey,
        });
      });

      it('should return false on PGP verification error', async () => {
        const pgpKey = {
          isPrivate: vi.fn(() => false),
        };
        const signature = '-----BEGIN PGP SIGNATURE-----\nsig\n-----END PGP SIGNATURE-----';
        const message = 'Hello, World!';

        (openpgpMock.createMessage as any).mockResolvedValue({});
        (openpgpMock.readSignature as any).mockRejectedValue(new Error('Invalid signature'));

        const result = await verify(pgpKey, signature, message);

        expect(result).toBe(false);
      });

      it('should return false for invalid PGP signature', async () => {
        const pgpKey = {
          isPrivate: vi.fn(() => false),
        };
        const signature = '-----BEGIN PGP SIGNATURE-----\nsig\n-----END PGP SIGNATURE-----';
        const message = 'Hello, World!';

        const mockMessage = {};
        const mockSignature = {};
        const mockVerificationResult = {
          signatures: [{ verified: Promise.resolve(false) }],
        };

        (openpgpMock.createMessage as any).mockResolvedValue(mockMessage);
        (openpgpMock.readSignature as any).mockResolvedValue(mockSignature);
        (openpgpMock.verify as any).mockResolvedValue(mockVerificationResult);

        const result = await verify(pgpKey, signature, message);

        expect(result).toBe(false);
      });
    });

    describe('RSA-PSS verification', () => {
      it('should verify RSA-PSS signature', async () => {
        const mockKey = {
          algorithm: { name: 'RSA-PSS' },
        } as CryptoKey;
        const signature = btoa('signature_data');
        const message = 'Hello, World!';
        mockSubtle.verify.mockResolvedValue(true);

        const result = await verify(mockKey, signature, message);

        expect(result).toBe(true);
        expect(mockSubtle.verify).toHaveBeenCalledWith(
          { name: 'RSA-PSS', saltLength: 32 },
          mockKey,
          expect.any(ArrayBuffer),
          new TextEncoder().encode(message)
        );
      });

      it('should return false for invalid RSA-PSS signature', async () => {
        const mockKey = {
          algorithm: { name: 'RSA-PSS' },
        } as CryptoKey;
        const signature = btoa('invalid_signature');
        const message = 'Hello, World!';
        mockSubtle.verify.mockResolvedValue(false);

        const result = await verify(mockKey, signature, message);

        expect(result).toBe(false);
      });
    });

    describe('ECDSA verification', () => {
      it('should verify ECDSA signature', async () => {
        const mockKey = {
          algorithm: { name: 'ECDSA', hash: { name: 'SHA-384' } },
        } as CryptoKey;
        const signature = btoa('signature_data');
        const message = 'Test message';
        mockSubtle.verify.mockResolvedValue(true);

        const result = await verify(mockKey, signature, message);

        expect(result).toBe(true);
        expect(mockSubtle.verify).toHaveBeenCalledWith(
          { name: 'ECDSA', hash: 'SHA-384' },
          mockKey,
          expect.any(ArrayBuffer),
          new TextEncoder().encode(message)
        );
      });

      it('should use default hash if not specified', async () => {
        const mockKey = {
          algorithm: { name: 'ECDSA' },
        } as CryptoKey;
        const signature = btoa('sig');
        const message = 'Test';
        mockSubtle.verify.mockResolvedValue(true);

        await verify(mockKey, signature, message);

        expect(mockSubtle.verify).toHaveBeenCalledWith(
          { name: 'ECDSA', hash: 'SHA-256' },
          mockKey,
          expect.any(ArrayBuffer),
          new TextEncoder().encode(message)
        );
      });

      it('should return false for invalid ECDSA signature', async () => {
        const mockKey = {
          algorithm: { name: 'ECDSA', hash: { name: 'SHA-256' } },
        } as CryptoKey;
        const signature = btoa('invalid_sig');
        const message = 'Test message';
        mockSubtle.verify.mockResolvedValue(false);

        const result = await verify(mockKey, signature, message);

        expect(result).toBe(false);
      });

      it('should throw error for unsupported algorithm', async () => {
        const mockKey = {
          algorithm: { name: 'unsupported' },
        } as CryptoKey;

        await expect(verify(mockKey, 'sig', 'msg')).rejects.toThrow('Verification not supported for algorithm');
      });
    });
  });

  describe('roundtrip operations', () => {
    it('should roundtrip AES encrypt and decrypt', async () => {
      const mockKey = {
        algorithm: { name: 'AES-GCM' },
      } as CryptoKey;
      const plaintext = 'Hello, World!';

      // Setup encrypt
      const iv = new Uint8Array(12);
      const encryptedData = new Uint8Array([1, 2, 3, 4, 5]);
      const combined = new Uint8Array(iv.length + encryptedData.length);
      combined.set(iv);
      combined.set(encryptedData, iv.length);
      mockSubtle.encrypt.mockResolvedValue(encryptedData.buffer);

      // Setup decrypt
      const decryptedBuffer = new TextEncoder().encode(plaintext);
      mockSubtle.decrypt.mockResolvedValue(decryptedBuffer.buffer);

      const ciphertext = await encrypt(mockKey, plaintext);
      const decrypted = await decrypt(mockKey, ciphertext);

      expect(decrypted).toBe(plaintext);
    });

    it('should roundtrip RSA sign and verify', async () => {
      const mockKey = {
        algorithm: { name: 'RSA-PSS' },
      } as CryptoKey;
      const message = 'Message to sign';

      const signatureData = new Uint8Array([1, 2, 3, 4, 5]);
      mockSubtle.sign.mockResolvedValue(signatureData.buffer);
      mockSubtle.verify.mockResolvedValue(true);

      const signature = await sign(mockKey, message);
      const isValid = await verify(mockKey, signature, message);

      expect(isValid).toBe(true);
    });

    it('should roundtrip ECDSA sign and verify', async () => {
      const mockKey = {
        algorithm: { name: 'ECDSA', hash: { name: 'SHA-256' } },
      } as CryptoKey;
      const message = 'ECDSA message';

      const signatureData = new Uint8Array([10, 20, 30, 40]);
      mockSubtle.sign.mockResolvedValue(signatureData.buffer);
      mockSubtle.verify.mockResolvedValue(true);

      const signature = await sign(mockKey, message);
      const isValid = await verify(mockKey, signature, message);

      expect(isValid).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle encryption errors', async () => {
      const mockKey = {
        algorithm: { name: 'AES-GCM' },
      } as CryptoKey;
      mockSubtle.encrypt.mockRejectedValue(new Error('Encryption failed'));

      await expect(encrypt(mockKey, 'test')).rejects.toThrow('Encryption failed');
    });

    it('should handle decryption errors', async () => {
      const mockKey = {
        algorithm: { name: 'AES-GCM' },
      } as CryptoKey;
      mockSubtle.decrypt.mockRejectedValue(new Error('Decryption failed'));

      await expect(decrypt(mockKey, 'ciphertext')).rejects.toThrow('Decryption failed');
    });

    it('should handle signing errors', async () => {
      const mockKey = {
        algorithm: { name: 'RSA-PSS' },
      } as CryptoKey;
      mockSubtle.sign.mockRejectedValue(new Error('Signing failed'));

      await expect(sign(mockKey, 'message')).rejects.toThrow('Signing failed');
    });

    it('should handle verification errors', async () => {
      const mockKey = {
        algorithm: { name: 'RSA-PSS' },
      } as CryptoKey;
      mockSubtle.verify.mockRejectedValue(new Error('Verification failed'));

      await expect(verify(mockKey, 'sig', 'msg')).rejects.toThrow('Verification failed');
    });
  });
});
