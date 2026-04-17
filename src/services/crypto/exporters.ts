import {
  arrayBufferToBase64,
  arrayBufferToHex,
  base64UrlToMpint,
  base64UrlToUint8Array,
  formatAsPem,
} from './converters';
import { concatBuffers, writeSshString } from './utils';

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
 * Exports a public CryptoKey to JWK (JSON Web Key) format.
 * @param key The public CryptoKey to export.
 * @returns A promise that resolves to the key as a JWK formatted string.
 */
export async function exportPublicKeyJwk(key: CryptoKey): Promise<string> {
  const jwk = await window.crypto.subtle.exportKey('jwk', key);
  delete jwk.d;
  delete jwk.dp;
  delete jwk.dq;
  delete jwk.p;
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

  const base64Key = arrayBufferToBase64(keyData.buffer as ArrayBuffer);
  return `${keyTypeIdentifier} ${base64Key} ${comment}`;
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

  const base64Key = arrayBufferToBase64(finalContent.buffer as ArrayBuffer);
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

  const publicB64 = (arrayBufferToBase64(publicBlob.buffer as ArrayBuffer).match(/.{1,64}/g) || []).join('\n');
  const privateB64 = (arrayBufferToBase64(privateBlob.buffer as ArrayBuffer).match(/.{1,64}/g) || []).join('\n');
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
