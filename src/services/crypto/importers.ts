import * as openpgp from 'openpgp';
import type { KeyProperties } from '../../types';
import { pemToBase64, base64ToArrayBuffer, hexToArrayBuffer, base64UrlToUint8Array } from './converters';

/**
 * Checks if a given key object is a PGP key from openpgp.js.
 * @param key The key object to check.
 * @returns True if it is a PGP key, false otherwise.
 */
function isPgpKey(key: any): boolean {
  return key && typeof key.isPrivate === 'function';
}

/**
 * Imports a key from PEM format.
 * @param pem The PEM formatted key string.
 * @returns A promise that resolves to the imported CryptoKey.
 */
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

/**
 * Imports a key from JWK format.
 * @param jwk The JsonWebKey object.
 * @returns A promise that resolves to the imported CryptoKey.
 */
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

/**
 * Imports a raw symmetric key from Base64 or Hex encoding.
 * @param raw The raw key data as a string.
 * @param encoding The encoding format ('base64' or 'hex').
 * @returns A promise that resolves to the imported CryptoKey.
 */
async function importRaw(raw: string, encoding: 'base64' | 'hex' = 'base64'): Promise<CryptoKey> {
  // Validate characters before decoding to catch invalid inputs early
  if (encoding === 'hex' && !/^[0-9a-fA-F]*$/.test(raw)) {
    throw new Error('Invalid hexadecimal characters in key.');
  }

  if (encoding === 'base64' && !/^[A-Za-z0-9+/]*={0,2}$/.test(raw)) {
    throw new Error('Invalid Base64 characters in key.');
  }

  // Decode first to get actual byte length
  const buffer = encoding === 'base64' ? base64ToArrayBuffer(raw) : hexToArrayBuffer(raw);
  const byteLength = buffer.byteLength;

  // Validate byte length (128 bits minimum, 4096 bits maximum)
  const minBytes = 16; // 128 bits
  const maxBytes = 512; // 4096 bits

  if (byteLength < minBytes || byteLength > maxBytes) {
    throw new Error(
      `Invalid key length: ${byteLength} bytes (${byteLength * 8} bits). Expected ${minBytes}-${maxBytes} bytes.`
    );
  }

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
  } catch (e) {
    // If it's a JWK parsing/import error, re-throw it
    if (e instanceof Error && e.message.includes('JWK')) {
      throw e;
    }
    /* Not a JSON or other error, so continue */
  }

  if (keyData.startsWith('-----BEGIN')) {
    return await importPem(keyData);
  }

  // Auto-detect hex vs base64 encoding
  let encoding: 'base64' | 'hex' = 'base64';
  if (/^[0-9a-fA-F]+$/.test(keyData) && keyData.length % 2 === 0) {
    encoding = 'hex';
  }

  try { return await importRaw(keyData, encoding); } catch (e) {
    // Re-throw validation errors from importRaw with more context
    if (e instanceof Error) {
      throw e;
    }
    /* Failed raw import */
  }

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

/**
 * Inspects a CryptoKey and returns its properties.
 * @param key The CryptoKey or PGP key to inspect.
 * @returns A promise that resolves to the key's properties.
 */
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