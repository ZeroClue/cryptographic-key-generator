import { concatBuffers, writeSshString } from './utils';

/**
 * Converts an ArrayBuffer to a Base64 encoded string.
 * @param buffer The ArrayBuffer to convert.
 * @returns A Base64 encoded string.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
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
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
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
export function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converts a hexadecimal string to an ArrayBuffer.
 * @param hex The hexadecimal string to convert.
 * @returns An ArrayBuffer.
 */
export function hexToArrayBuffer(hex: string): ArrayBuffer {
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
export function base64UrlToUint8Array(base64Url: string): Uint8Array {
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
export function base64UrlToMpint(b64: string): Uint8Array {
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
 * Formats a Base64 string into a PEM format with headers and line breaks.
 * @param base64 The Base64 encoded key data.
 * @param header The PEM header (e.g., '-----BEGIN PUBLIC KEY-----').
 * @param footer The PEM footer (e.g., '-----END PUBLIC KEY-----').
 * @returns The fully formatted PEM string.
 */
export function formatAsPem(base64: string, header: string, footer: string): string {
  const lines = base64.match(/.{1,64}/g) || [];
  return `${header}\n${lines.join('\n')}\n${footer}`;
}

/**
 * Strips PEM headers and footers and concatenates the Base64 content.
 * @param pem The PEM formatted string.
 * @returns The raw Base64 string.
 */
export function pemToBase64(pem: string): string {
  return pem
    .replace(/-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/, '')
    .replace(/-----END (?:[A-Z]+ )?PRIVATE KEY-----/, '')
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '');
}
