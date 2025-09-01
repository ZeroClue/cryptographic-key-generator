import * as openpgp from 'openpgp';
import type { AlgorithmOption, KeyGenerationResult, PgpOptions, KeyProperties } from '../types';

// declare var openpgp: any;

/**
 * Checks if a given key object is a PGP key from openpgp.js.
 * @param key The key object to check.
 * @returns True if it is a PGP key, false otherwise.
 */
function isPgpKey(key: any): boolean {
    return key && typeof key.isPrivate === 'function';
}

/**
 * Converts an ArrayBuffer to a Base64 encoded string.
 * @param buffer The ArrayBuffer to convert.
 * @returns A Base64 encoded string.
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Converts a Base64 string to an ArrayBuffer.
 * @param base64 The Base64 string to convert.
 * @returns An ArrayBuffer.
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Converts an ArrayBuffer to a hexadecimal string.
 * @param buffer The ArrayBuffer to convert.
 * @returns A hexadecimal encoded string.
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
}

/**
 * Converts a hexadecimal string to an ArrayBuffer.
 * @param hex The hexadecimal string to convert.
 * @returns An ArrayBuffer.
 */
function hexToArrayBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes.buffer;
}


/**
 * Decodes a Base64URL encoded string into a Uint8Array.
 * @param base64Url The Base64URL encoded string.
 * @returns A Uint8Array.
 */
function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64.padEnd(base64.length + padLength, '=');
  const binary_string = window.atob(padded);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converts a Base64URL string to an SSH multi-precision integer (mpint) byte representation.
 * @param b64 The base64url encoded string.
 * @returns A Uint8Array representing the mpint.
 */
function base64UrlToMpint(b64: string): Uint8Array {
    const bytes = base64UrlToUint8Array(b64);
    // If the most significant bit is 1, prepend a 0x00 byte to ensure it's treated as a positive number.
    if (bytes.length > 0 && bytes[0] & 0x80) {
      return concatBuffers(new Uint8Array([0x00]), bytes);
    }
    // Handle the value zero, which is represented by a zero-length byte array.
    if (bytes.length === 1 && bytes[0] === 0) {
        return new Uint8Array([]);
    }
    return bytes;
}

/**
 * Concatenates multiple Uint8Arrays into a single Uint8Array.
 * @param arrays The Uint8Arrays to concatenate.
 * @returns A single concatenated Uint8Array.
 */
function concatBuffers(...arrays: Uint8Array[]): Uint8Array {
    const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}

/**
 * Writes a Uint8Array to the SSH string format (4-byte length prefix + data).
 * @param data The data to write.
 * @returns The data in SSH string format.
 */
function writeSshString(data: Uint8Array): Uint8Array {
  const len = data.length;
  const buffer = new ArrayBuffer(4 + len);
  const view = new DataView(buffer);
  view.setUint32(0, len, false); // big-endian
  new Uint8Array(buffer, 4).set(data);
  return new Uint8Array(buffer);
}


/**
 * Formats a Base64 string into a PEM format with headers and line breaks.
 * @param base64 The Base64 encoded key data.
 * @param header The PEM header (e.g., '-----BEGIN PUBLIC KEY-----').
 * @param footer The PEM footer (e.g., '-----END PUBLIC KEY-----').
 * @returns The fully formatted PEM string.
 */
function formatAsPem(base64: string, header: string, footer: string): string {
  const lines = base64.match(/.{1,64}/g) || [];
  return `${header}\n${lines.join('\n')}\n${footer}`;
}

/**
 * Strips PEM headers and footers and concatenates the Base64 content.
 * @param pem The PEM formatted string.
 * @returns The raw Base64 string.
 */
function pemToBase64(pem: string): string {
    return pem
        .replace(/-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/, '')
        .replace(/-----END (?:[A-Z]+ )?PRIVATE KEY-----/, '')
        .replace(/-----BEGIN PUBLIC KEY-----/, '')
        .replace(/-----END PUBLIC KEY-----/, '')
        .replace(/\s/g, '');
}


/**
 * Exports a public CryptoKey to PEM format.
 * @param key The public CryptoKey to export.
 * @returns A promise that resolves to the key in PEM format.
 */
export async function exportPublicKeyPem(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('spki', key);
  const base64 = arrayBufferToBase64(exported);
  return formatAsPem(base64, '-----BEGIN PUBLIC KEY-----', '-----END PUBLIC KEY-----');
}

/**
 * Exports a private CryptoKey to PEM format (PKCS#8).
 * @param key The private CryptoKey to export.
 * @returns A promise that resolves to the key in PEM format.
 */
export async function exportPrivateKeyPem(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('pkcs8', key);
  const base64 = arrayBufferToBase64(exported);
  return formatAsPem(base64, '-----BEGIN PRIVATE KEY-----', '-----END PRIVATE KEY-----');
}

/**
 * Exports a private CryptoKey to the modern OpenSSH private key format.
 * @param key The private CryptoKey to export.
 * @param comment A comment to include in the key file.
 * @returns A promise that resolves to the key in OpenSSH format.
 */
export async function exportPrivateKeyOpenSsh(key: CryptoKey, comment: string = 'user@hostname'): Promise<string> {
    const jwk = await window.crypto.subtle.exportKey('jwk', key);
  
    const AUTH_MAGIC = "openssh-key-v1\0";
    const authMagicBytes = new TextEncoder().encode(AUTH_MAGIC);
  
    let keyTypeIdentifier: string;
    let publicKeyData: Uint8Array;
    let privateKeyParts: Uint8Array[];
  
    if (jwk.kty === 'RSA' && jwk.n && jwk.e && jwk.d && jwk.p && jwk.q && jwk.qi) {
      keyTypeIdentifier = 'ssh-rsa';
      const n = base64UrlToMpint(jwk.n);
      const e = base64UrlToMpint(jwk.e);
      const d = base64UrlToMpint(jwk.d);
      const iqmp = base64UrlToMpint(jwk.qi);
      const p = base64UrlToMpint(jwk.p);
      const q = base64UrlToMpint(jwk.q);
      
      publicKeyData = concatBuffers(
        writeSshString(new TextEncoder().encode(keyTypeIdentifier)),
        writeSshString(e),
        writeSshString(n)
      );
      
      privateKeyParts = [
        writeSshString(new TextEncoder().encode(keyTypeIdentifier)),
        writeSshString(n),
        writeSshString(e),
        writeSshString(d),
        writeSshString(iqmp),
        writeSshString(p),
        writeSshString(q),
      ];
    } else if (jwk.kty === 'EC' && jwk.crv && jwk.x && jwk.y && jwk.d) {
      const curveName = `nistp${jwk.crv.substring(2)}`;
      keyTypeIdentifier = `ecdsa-sha2-${curveName}`;
      const x = base64UrlToUint8Array(jwk.x);
      const y = base64UrlToUint8Array(jwk.y);
      const Q = concatBuffers(new Uint8Array([0x04]), x, y);
      const privateScalar = base64UrlToMpint(jwk.d);
  
      publicKeyData = concatBuffers(
        writeSshString(new TextEncoder().encode(keyTypeIdentifier)),
        writeSshString(new TextEncoder().encode(curveName)),
        writeSshString(Q)
      );
      
      privateKeyParts = [
        writeSshString(new TextEncoder().encode(keyTypeIdentifier)),
        writeSshString(new TextEncoder().encode(curveName)),
        writeSshString(Q),
        writeSshString(privateScalar),
      ];
    } else {
      throw new Error('Unsupported key type for OpenSSH export.');
    }
  
    const checkintBytes = new Uint8Array(4);
    crypto.getRandomValues(checkintBytes);
  
    let privateKeyBlob = concatBuffers(
      checkintBytes,
      checkintBytes,
      ...privateKeyParts,
      writeSshString(new TextEncoder().encode(comment))
    );
  
    const blockSize = 8;
    const padLen = (blockSize - (privateKeyBlob.length % blockSize)) % blockSize;
    const padding = new Uint8Array(padLen);
    for (let i = 0; i < padLen; i++) { padding[i] = i + 1; }
    privateKeyBlob = concatBuffers(privateKeyBlob, padding);
    
    const numKeys = new Uint8Array(4);
    new DataView(numKeys.buffer).setUint32(0, 1, false); // big-endian 1
  
    const finalContent = concatBuffers(
      authMagicBytes,
      writeSshString(new TextEncoder().encode('none')),
      writeSshString(new TextEncoder().encode('none')),
      writeSshString(new Uint8Array([])),
      numKeys,
      writeSshString(publicKeyData),
      writeSshString(privateKeyBlob)
    );
  
    const base64Key = arrayBufferToBase64(finalContent.buffer);
    return formatAsPem(base64Key, '-----BEGIN OPENSSH PRIVATE KEY-----', '-----END OPENSSH PRIVATE KEY-----');
}

/**
 * Exports a private CryptoKey to the PuTTY .ppk private key format.
 * @param key The private CryptoKey to export.
 * @param comment A comment to include in the key file.
 * @returns A promise that resolves to the key in .ppk format.
 */
export async function exportPrivateKeyPutty(key: CryptoKey, comment: string = 'user@hostname'): Promise<string> {
    const jwk = await window.crypto.subtle.exportKey('jwk', key);
    
    let keyTypeIdentifier: string;
    let publicBlob: Uint8Array;
    let privateBlob: Uint8Array;

    if (jwk.kty === 'RSA' && jwk.n && jwk.e && jwk.d && jwk.p && jwk.q && jwk.qi) {
        keyTypeIdentifier = 'ssh-rsa';
        const e = base64UrlToMpint(jwk.e);
        const n = base64UrlToMpint(jwk.n);
        const d = base64UrlToMpint(jwk.d);
        const p = base64UrlToMpint(jwk.p);
        const q = base64UrlToMpint(jwk.q);
        const iqmp = base64UrlToMpint(jwk.qi);

        publicBlob = concatBuffers(
            writeSshString(new TextEncoder().encode(keyTypeIdentifier)),
            writeSshString(e),
            writeSshString(n)
        );
        privateBlob = concatBuffers(
            writeSshString(d),
            writeSshString(p),
            writeSshString(q),
            writeSshString(iqmp)
        );
    } else if (jwk.kty === 'EC' && jwk.crv && jwk.x && jwk.y && jwk.d) {
        const curveName = `nistp${jwk.crv.substring(2)}`;
        keyTypeIdentifier = `ecdsa-sha2-${curveName}`;
        const x = base64UrlToUint8Array(jwk.x);
        const y = base64UrlToUint8Array(jwk.y);
        const Q = concatBuffers(new Uint8Array([0x04]), x, y);
        const privateScalar = base64UrlToMpint(jwk.d);

        publicBlob = concatBuffers(
            writeSshString(new TextEncoder().encode(keyTypeIdentifier)),
            writeSshString(new TextEncoder().encode(curveName)),
            writeSshString(Q)
        );
        privateBlob = writeSshString(privateScalar);
    } else {
        throw new Error('Unsupported key type for PuTTY export.');
    }
    
    const te = new TextEncoder();
    const macData = concatBuffers(
        writeSshString(te.encode(keyTypeIdentifier)),
        writeSshString(te.encode('none')),
        writeSshString(te.encode(comment)),
        writeSshString(publicBlob),
        writeSshString(privateBlob)
    );

    const macKeyData = await crypto.subtle.digest('SHA-1', te.encode('putty-private-key-file-mac-key'));
    const macKey = await crypto.subtle.importKey('raw', macKeyData, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    const mac = await crypto.subtle.sign('HMAC', macKey, macData);

    const publicB64 = (arrayBufferToBase64(publicBlob.buffer).match(/.{1,64}/g) || []).join('\n');
    const privateB64 = (arrayBufferToBase64(privateBlob.buffer).match(/.{1,64}/g) || []).join('\n');
    const publicLines = publicB64.split('\n').length;
    const privateLines = privateB64.split('\n').length;

    return [
        `PuTTY-User-Key-File-2: ${keyTypeIdentifier}`,
        `Encryption: none`,
        `Comment: ${comment}`,
        `Public-Lines: ${publicLines}`,
        publicB64,
        `Private-Lines: ${privateLines}`,
        privateB64,
        `Private-MAC: ${arrayBufferToHex(mac)}`
    ].join('\n');
}

/**
 * Exports a public CryptoKey to JWK (JSON Web Key) format.
 * @param key The public CryptoKey to export.
 * @returns A promise that resolves to the key as a JWK formatted string.
 */
export async function exportPublicKeyJwk(key: CryptoKey): Promise<string> {
    const jwk = await window.crypto.subtle.exportKey('jwk', key);
    delete jwk.d;
    delete jwk.dp;
    delete jwk.dq;
    delete jwk.q;
    delete jwk.qi;
    return JSON.stringify(jwk, null, 2);
}

/**
 * Exports a private CryptoKey to JWK (JSON Web Key) format.
 * @param key The private CryptoKey to export.
 * @returns A promise that resolves to the key as a JWK formatted string.
 */
export async function exportPrivateKeyJwk(key: CryptoKey): Promise<string> {
    const jwk = await window.crypto.subtle.exportKey('jwk', key);
    return JSON.stringify(jwk, null, 2);
}

/**
 * Exports a symmetric CryptoKey to a Base64 encoded string.
 * @param key The symmetric CryptoKey to export.
 * @returns A promise that resolves to the key as a Base64 string.
 */
export async function exportSymmetricKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

/**
 * Exports a symmetric CryptoKey to a hexadecimal encoded string.
 * @param key The symmetric CryptoKey to export.
 * @returns A promise that resolves to the key as a hexadecimal string.
 */
export async function exportSymmetricKeyHex(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('raw', key);
    return arrayBufferToHex(exported);
}

/**
 * Exports a public CryptoKey to the OpenSSH public key format.
 * @param key The public CryptoKey to export.
 * @param comment A comment to append to the key, typically user@host.
 * @returns A promise that resolves to the key in OpenSSH format.
 */
export async function exportSshPublicKey(key: CryptoKey, comment: string = 'user@hostname'): Promise<string> {
  const jwk = await window.crypto.subtle.exportKey('jwk', key);
  let keyTypeIdentifier: string;
  let keyData: Uint8Array;

  if (jwk.kty === 'RSA' && jwk.n && jwk.e) {
    keyTypeIdentifier = 'ssh-rsa';
    const n = base64UrlToMpint(jwk.n);
    const e = base64UrlToMpint(jwk.e);
    
    keyData = concatBuffers(
      writeSshString(new TextEncoder().encode(keyTypeIdentifier)),
      writeSshString(e),
      writeSshString(n)
    );
  } else if (jwk.kty === 'EC' && jwk.crv && jwk.x && jwk.y) {
    const curveName = `nistp${jwk.crv.substring(2)}`; // P-256 -> nistp256
    keyTypeIdentifier = `ecdsa-sha2-${curveName}`;
    const x = base64UrlToUint8Array(jwk.x);
    const y = base64UrlToUint8Array(jwk.y);
    const Q = concatBuffers(new Uint8Array([0x04]), x, y); // Uncompressed point format

    keyData = concatBuffers(
      writeSshString(new TextEncoder().encode(keyTypeIdentifier)),
      writeSshString(new TextEncoder().encode(curveName)),
      writeSshString(Q)
    );
  } else {
    throw new Error('Unsupported key type for SSH public key export.');
  }

  const base64Key = arrayBufferToBase64(keyData.buffer);
  return `${keyTypeIdentifier} ${base64Key} ${comment}`;
}


/**
 * Generates a cryptographic key based on the specified algorithm.
 * @param algorithm The algorithm to use for key generation.
 * @param pgpOptions Optional user info for PGP key generation.
 * @returns A promise that resolves to an object containing the key(s) and a display value.
 */
export async function generateKey(algorithm: AlgorithmOption, pgpOptions?: PgpOptions): Promise<KeyGenerationResult> {
  const parts = algorithm.split('-');

  if (parts[0] === 'PGP') {
    if (!openpgp) {
        throw new Error('OpenPGP.js library is not loaded.');
    }
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

// ===================================================================================
// NEW FUNCTIONS FOR ENCRYPTION/DECRYPTION, SIGN/VERIFY, and KEY IMPORT
// ===================================================================================
async function importPem(pem: string): Promise<CryptoKey> {
    const isPublic = pem.includes('PUBLIC');
    const format = isPublic ? 'spki' : 'pkcs8';
    const b64 = pemToBase64(pem);
    const buffer = base64ToArrayBuffer(b64);
    
    // Common algorithms to try
    const algorithms = [
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        { name: 'RSA-PSS', hash: 'SHA-256' },
        { name: 'ECDSA', namedCurve: 'P-256' },
        { name: 'ECDSA', namedCurve: 'P-384' },
        { name: 'ECDSA', namedCurve: 'P-521' },
    ];
    
    const usages: KeyUsage[] = isPublic ? ['encrypt', 'verify'] : ['decrypt', 'sign'];

    for (const alg of algorithms) {
        try {
            return await window.crypto.subtle.importKey(format, buffer, alg, true, usages);
        } catch (e) { /* Try next algorithm */ }
    }
    throw new Error('Could not import PEM key. The key may be corrupted or use an unsupported algorithm.');
}

async function importJwk(jwk: JsonWebKey): Promise<CryptoKey> {
    let algorithm: RsaHashedImportParams | EcKeyImportParams;
    if (jwk.kty === 'RSA') {
        algorithm = { name: jwk.alg?.includes('PSS') ? 'RSA-PSS' : 'RSA-OAEP', hash: 'SHA-256' }; // A sensible default
    } else if (jwk.kty === 'EC') {
        algorithm = { name: jwk.alg?.startsWith('ES') ? 'ECDSA' : 'ECDH', namedCurve: jwk.crv || 'P-256' };
    } else if (jwk.kty === 'oct') { // Symmetric
        return importRaw(jwk.k || '', 'base64');
    } else {
        throw new Error('Unsupported JWK key type (kty).');
    }
    
    const usages: KeyUsage[] = (jwk.key_ops as KeyUsage[]) || (jwk.d ? ['decrypt', 'sign'] : ['encrypt', 'verify']);
    return await window.crypto.subtle.importKey('jwk', jwk, algorithm, true, usages);
}

async function importRaw(raw: string, encoding: 'base64' | 'hex' = 'base64'): Promise<CryptoKey> {
    const buffer = encoding === 'base64' ? base64ToArrayBuffer(raw) : hexToArrayBuffer(raw);

    // Try importing as various AES key types
    const keyLengths = [128, 192, 256];
    const modes = ['GCM', 'CBC', 'CTR'];
    
    for (const length of keyLengths) {
        if (buffer.byteLength === length / 8) {
            for (const mode of modes) {
                try {
                    return await window.crypto.subtle.importKey(
                        'raw',
                        buffer,
                        { name: `AES-${mode}`, length },
                        true,
                        ['encrypt', 'decrypt']
                    );
                } catch (e) { /* Continue */ }
            }
        }
    }
    throw new Error('Raw key length does not match a standard AES key size (128, 192, or 256 bits).');
}

/**
 * Imports a key from various formats.
 * @param keyData The raw key data as a string (PEM, JWK, Base64, Hex).
 * @returns A promise that resolves to the CryptoKey or PGP key object.
 */
export async function importKey(keyData: string): Promise<CryptoKey | any> {
    keyData = keyData.trim();
    
    if (keyData.startsWith('-----BEGIN PGP')) {
        try { return await openpgp.readKey({ armoredKey: keyData }); } catch (e) { /* Fall through */ }
    }
    
    try {
        const jwk = JSON.parse(keyData);
        if (jwk.kty) { return await importJwk(jwk); }
    } catch (e) { /* Not a JSON, so continue */ }

    if (keyData.startsWith('-----BEGIN')) {
        return await importPem(keyData);
    }

    try { return await importRaw(keyData); } catch (e) { /* Failed raw import */ }

    throw new Error("Unsupported key format. Please provide a valid PEM, JWK, PGP, Base64, or Hex key.");
}

/**
 * Imports a key from various formats and inspects its properties.
 * @param keyData The raw key data as a string (PEM, JWK, Base64, Hex).
 * @returns A promise that resolves to the CryptoKey and its properties.
 */
export async function importAndInspectKey(keyData: string): Promise<{ key: CryptoKey | any; props: KeyProperties }> {
    keyData = keyData.trim();
    
    // Try importing as PGP
    if (keyData.startsWith('-----BEGIN PGP')) {
        try {
            const key = await openpgp.readKey({ armoredKey: keyData });
            const isPrivate = key.isPrivate();
            const algoInfo = key.getAlgorithmInfo();
            const props: KeyProperties = {
                type: isPrivate ? 'private' : 'public',
                algorithm: `PGP/${algoInfo.algorithm?.toUpperCase() || 'Unknown'}`,
                size: algoInfo.bits ? `${algoInfo.bits} bits` : 'N/A',
                usages: isPrivate ? ['decrypt', 'sign'] : ['encrypt', 'verify'],
                extractable: true,
            };
            return { key, props };
        } catch (e) { /* Fall through */ }
    }
    
    const key = await importKey(keyData);
    const props = await inspectKey(key);
    return { key, props };
}


export async function inspectKey(key: CryptoKey | any): Promise<KeyProperties> {
    if (isPgpKey(key)) {
        const isPrivate = key.isPrivate();
        const algoInfo = key.getAlgorithmInfo();
        return {
            type: isPrivate ? 'private' : 'public',
            algorithm: `PGP/${algoInfo.algorithm?.toUpperCase() || 'Unknown'}`,
            size: algoInfo.bits ? `${algoInfo.bits} bits` : 'N/A',
            usages: isPrivate ? ['decrypt', 'sign'] : ['encrypt', 'verify'],
            extractable: true,
        };
    }
    const { type, algorithm, usages, extractable } = key;
    const jwk = await window.crypto.subtle.exportKey('jwk', key);
    
    let detailedAlgorithm = (algorithm as any).name || 'Unknown';
    let size: string | number | undefined;

    if (jwk.kty === 'RSA') {
        if (usages.includes('sign') || usages.includes('verify')) {
            detailedAlgorithm = 'RSA-PSS';
        } else if (usages.includes('encrypt') || usages.includes('decrypt')) {
            detailedAlgorithm = 'RSA-OAEP';
        }
        const hashName = (algorithm as any).hash?.name;
        if (hashName) {
            detailedAlgorithm += ` (${hashName})`;
        }

        if (jwk.n) {
            size = base64UrlToUint8Array(jwk.n).length * 8;
        }
    } else if (jwk.kty === 'EC') {
        if (usages.includes('sign') || usages.includes('verify')) {
            detailedAlgorithm = 'ECDSA';
        } else if (usages.includes('deriveKey') || usages.includes('deriveBits')) {
            detailedAlgorithm = 'ECDH';
        }
        if (jwk.crv) {
            size = jwk.crv;
        }
    } else if (jwk.kty === 'oct') { // Symmetric key
        if(algorithm.name) {
            detailedAlgorithm = algorithm.name;
        }
        if (jwk.k) {
            size = base64UrlToUint8Array(jwk.k).length * 8;
        }
    }

    return {
        type: type,
        algorithm: detailedAlgorithm,
        size: size ? `${size}${jwk.kty === 'RSA' || jwk.kty === 'oct' ? ' bits' : ''}` : 'N/A',
        usages: [...usages],
        extractable: extractable,
    };
}


/**
 * Encrypts a plaintext string using the provided key.
 * @param key The CryptoKey (public or symmetric) or PGP key to use for encryption.
 * @param plaintext The string to encrypt.
 * @returns A promise that resolves to the Base64 encoded (or PGP armored) ciphertext.
 */
export async function encrypt(key: CryptoKey | any, plaintext: string): Promise<string> {
    if (isPgpKey(key)) {
        const message = await openpgp.createMessage({ text: plaintext });
        const encrypted = await openpgp.encrypt({
            message,
            encryptionKeys: key,
        });
        return encrypted as string;
    }
    
    const data = new TextEncoder().encode(plaintext);
    const algorithm = (key as CryptoKey).algorithm.name;
    let encryptedBuffer: ArrayBuffer;

    if (algorithm === 'RSA-OAEP') {
        encryptedBuffer = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, data);
    } else if (algorithm.startsWith('AES-')) {
        const iv = window.crypto.getRandomValues(new Uint8Array(12)); // GCM standard IV size
        encryptedBuffer = await window.crypto.subtle.encrypt({ name: algorithm, iv }, key, data);
        // Prepend IV to ciphertext for decryption
        const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encryptedBuffer), iv.length);
        encryptedBuffer = combined.buffer;
    } else {
        throw new Error(`Encryption not supported for algorithm: ${algorithm}`);
    }

    return arrayBufferToBase64(encryptedBuffer);
}

/**
 * Decrypts a ciphertext string using the provided key.
 * @param key The CryptoKey (private or symmetric) or PGP key to use for decryption.
 * @param ciphertext The Base64 encoded or PGP armored ciphertext.
 * @param passphrase Optional passphrase for decrypting a PGP private key.
 * @returns A promise that resolves to the decrypted plaintext string.
 */
export async function decrypt(key: CryptoKey | any, ciphertext: string, passphrase?: string): Promise<string> {
    if (isPgpKey(key)) {
        const message = await openpgp.readMessage({ armoredMessage: ciphertext });
        const options: { message: any, decryptionKeys: any, passphrases?: string[] } = {
            message,
            decryptionKeys: key
        };
        if (passphrase) {
            options.passphrases = [passphrase];
        }
        const { data: decrypted } = await openpgp.decrypt(options);
        return decrypted as string;
    }

    const data = base64ToArrayBuffer(ciphertext);
    const algorithm = (key as CryptoKey).algorithm.name;
    let decryptedBuffer: ArrayBuffer;

    if (algorithm === 'RSA-OAEP') {
        decryptedBuffer = await window.crypto.subtle.decrypt({ name: 'RSA-OAEP' }, key, data);
    } else if (algorithm.startsWith('AES-')) {
        const iv = data.slice(0, 12); // Extract IV from the start
        const ciphertextData = data.slice(12);
        decryptedBuffer = await window.crypto.subtle.decrypt({ name: algorithm, iv }, key, ciphertextData);
    } else {
        throw new Error(`Decryption not supported for algorithm: ${algorithm}`);
    }
    
    return new TextDecoder().decode(decryptedBuffer);
}


/**
 * Signs a message using the provided private key.
 * @param privateKey The private CryptoKey or PGP key to use for signing.
 * @param message The message string to sign.
 * @param passphrase Optional passphrase for signing with a PGP private key.
 * @returns A promise that resolves to the Base64 encoded or PGP armored signature.
 */
export async function sign(privateKey: CryptoKey | any, message: string, passphrase?: string): Promise<string> {
    if (isPgpKey(privateKey)) {
        const options: { message: any, signingKeys: any, detached: boolean, passphrases?: string[] } = {
            message: await openpgp.createMessage({ text: message }),
            signingKeys: privateKey,
            detached: true,
        };
        if (passphrase) {
            options.passphrases = [passphrase];
        }
        const signature = await openpgp.sign(options);
        return signature as string;
    }

    const data = new TextEncoder().encode(message);
    const algorithm = (privateKey as CryptoKey).algorithm.name;
    let signatureBuffer: ArrayBuffer;

    if (algorithm === 'RSA-PSS') {
        signatureBuffer = await window.crypto.subtle.sign({ name: 'RSA-PSS', saltLength: 32 }, privateKey, data);
    } else if (algorithm === 'ECDSA') {
        const hash = ((privateKey as CryptoKey).algorithm as any).hash?.name || 'SHA-256';
        signatureBuffer = await window.crypto.subtle.sign({ name: 'ECDSA', hash }, privateKey, data);
    } else {
        throw new Error(`Signing not supported for algorithm: ${algorithm}`);
    }

    return arrayBufferToBase64(signatureBuffer);
}

/**
 * Verifies a signature against a message using the provided public key.
 * @param publicKey The public CryptoKey or PGP key to use for verification.
 * @param signature The Base64 encoded or PGP armored signature.
 * @param message The original message string.
 * @returns A promise that resolves to a boolean indicating if the signature is valid.
 */
export async function verify(publicKey: CryptoKey | any, signature: string, message: string): Promise<boolean> {
    if (isPgpKey(publicKey)) {
        try {
            const verificationResult = await openpgp.verify({
                signature: await openpgp.readSignature({ armoredSignature: signature }),
                message: await openpgp.createMessage({ text: message }),
                verificationKeys: publicKey
            });
            const valid = await verificationResult.signatures[0].verified;
            return valid;
        } catch (e) {
            console.error("PGP verification error:", e);
            return false;
        }
    }

    const signatureBuffer = base64ToArrayBuffer(signature);
    const data = new TextEncoder().encode(message);
    const algorithm = (publicKey as CryptoKey).algorithm.name;

    if (algorithm === 'RSA-PSS') {
        return await window.crypto.subtle.verify({ name: 'RSA-PSS', saltLength: 32 }, publicKey, signatureBuffer, data);
    } else if (algorithm === 'ECDSA') {
        const hash = ((publicKey as CryptoKey).algorithm as any).hash?.name || 'SHA-256';
        return await window.crypto.subtle.verify({ name: 'ECDSA', hash }, publicKey, signatureBuffer, data);
    } else {
        throw new Error(`Verification not supported for algorithm: ${algorithm}`);
    }
}