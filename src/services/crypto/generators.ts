import type { AlgorithmOption, KeyGenerationResult, PgpOptions } from '../../types';
import { exportPublicKeyPem, exportSshPublicKey } from './exporters';

/**
 * Generates a cryptographic key based on the specified algorithm.
 * @param algorithm The algorithm to use for key generation.
 * @param pgpOptions Optional user info for PGP key generation.
 * @returns A promise that resolves to an object containing the key(s) and a display value.
 */
export async function generateKey(algorithm: AlgorithmOption, pgpOptions?: PgpOptions): Promise<KeyGenerationResult> {
  const parts = algorithm.split('-');

  // Handle PGP key generation with dynamic import
  if (parts[0] === 'PGP') {
    const openpgp = await import('openpgp');

    if (!pgpOptions) {
      throw new Error('PGP user information is required for key generation.');
    }
    const type = parts[1]; // RSA or ECC
    let keyOptions: any;

    if (type === 'RSA') {
      const rsaBits = parseInt(parts[2], 10);
      keyOptions = {
        type: 'rsa',
        rsaBits,
        userIDs: [{ name: pgpOptions.name, email: pgpOptions.email }],
        passphrase: pgpOptions.passphrase,
      };
    } else if (type === 'ECC') {
      const curve = parts[2]; // e.g., 'curve25519'
      keyOptions = {
        type: 'ecc',
        curve,
        userIDs: [{ name: pgpOptions.name, email: pgpOptions.email }],
        passphrase: pgpOptions.passphrase,
      };
    } else {
      throw new Error(`Unsupported PGP key type: ${type}`);
    }

    const key = await openpgp.generateKey(keyOptions);
    const publicKeyObject = await openpgp.readKey({ armoredKey: key.publicKey });
    const keyID = publicKeyObject.getKeyID()?.toHex().toUpperCase() || 'N/A';

    return {
      type: 'pgp',
      publicKey: key.publicKey,
      privateKey: key.privateKey,
      keyID,
      displayValue: key.publicKey,
    };
  }

  // Check for Web Crypto API support
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not supported in this browser. For security, this application requires a modern browser like Chrome, Firefox, Edge, or Safari.');
  }
  const crypto = window.crypto.subtle;

  switch (parts[0]) {
    case 'AES': {
      const name = `AES-${parts[2]}`;
      const length = parseInt(parts[1], 10);
      const key = await crypto.generateKey(
        { name, length },
        true, // extractable
        ['encrypt', 'decrypt']
      );
      const exportedKey = await crypto.exportKey('raw', key);

      // Import arrayBufferToBase64 from converters
      const { arrayBufferToBase64 } = await import('./converters');

      return {
        type: 'symmetric',
        key,
        displayValue: arrayBufferToBase64(exportedKey),
      };
    }

    case 'RSA': {
      const name = `RSA-${parts[1]}`;
      const keyUsage: KeyUsage[] = name === 'RSA-OAEP' ? ['encrypt', 'decrypt'] : ['sign', 'verify'];

      let modulusLength: number;
      let hash: string;

      // New format for RSA-OAEP: RSA-OAEP-SHA-256-2048 -> parts.length is 5
      // The parts would be ['RSA', 'OAEP', 'SHA', '256', '2048']
      if (name === 'RSA-OAEP' && parts.length === 5) {
        hash = `${parts[2]}-${parts[3]}`; // e.g., SHA-256
        modulusLength = parseInt(parts[4], 10);
      } else { // Handle RSA-PSS and other legacy formats if any
        modulusLength = parseInt(parts[2], 10);
        hash = 'SHA-256'; // Default hash for older formats
      }

      const keyPair = await crypto.generateKey(
        {
          name,
          modulusLength,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
          hash,
        },
        true, // extractable
        keyUsage
      );

      const publicKeyPem = await exportPublicKeyPem(keyPair.publicKey);

      return {
        type: 'asymmetric',
        keyPair,
        displayValue: publicKeyPem,
      };
    }

    case 'ECDSA':
    case 'ECDH': {
      const name = parts[0];
      const namedCurve = `P-${parts[2]}`;
      const keyUsage: KeyUsage[] = name === 'ECDSA' ? ['sign', 'verify'] : ['deriveKey', 'deriveBits'];
      const keyPair = await crypto.generateKey(
        { name, namedCurve },
        true, // extractable
        keyUsage
      );

      const publicKeyPem = await exportPublicKeyPem(keyPair.publicKey);

      return {
        type: 'asymmetric',
        keyPair,
        displayValue: publicKeyPem
      };
    }

    case 'HMAC': {
      const hash = `SHA-${parts[1]}`;
      const key = await crypto.generateKey(
        {
          name: 'HMAC',
          hash,
        },
        true, // extractable
        ['sign', 'verify']
      );
      const exportedKey = await crypto.exportKey('raw', key);

      // Import arrayBufferToBase64 from converters
      const { arrayBufferToBase64 } = await import('./converters');

      return {
        type: 'symmetric',
        key,
        displayValue: arrayBufferToBase64(exportedKey),
      };
    }

    case 'SSH': {
      const subType = parts[1]; // RSA or ECDSA
      const params = parts[2]; // e.g. 2048 or P256

      if (subType === 'RSA') {
        const modulusLength = parseInt(params, 10);
        const keyPair = await crypto.generateKey(
          {
            name: 'RSA-PSS', // Modern signing algorithm
            modulusLength,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: 'SHA-256',
          },
          true, // extractable
          ['sign', 'verify']
        );
        const sshPublicKey = await exportSshPublicKey(keyPair.publicKey);
        return {
          type: 'asymmetric',
          keyPair,
          displayValue: sshPublicKey
        };
      } else if (subType === 'ECDSA') {
        const namedCurve = `P-${params.substring(1)}`; // P256 -> P-256
        const keyPair = await crypto.generateKey(
          { name: 'ECDSA', namedCurve },
          true, // extractable
          ['sign', 'verify']
        );
        const sshPublicKey = await exportSshPublicKey(keyPair.publicKey);
        return {
          type: 'asymmetric',
          keyPair,
          displayValue: sshPublicKey,
        };
      } else {
        throw new Error(`Unsupported SSH key type: ${subType}`);
      }
    }

    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
}
