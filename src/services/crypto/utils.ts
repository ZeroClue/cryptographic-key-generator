/**
 * Checks if a given key object is a PGP key from openpgp.js.
 * @param key The key object to check.
 * @returns True if it is a PGP key, false otherwise.
 */
export function isPgpKey(key: any): boolean {
  return key && typeof key.isPrivate === 'function';
}

/**
 * Concatenates multiple Uint8Arrays into a single Uint8Array.
 * @param arrays The Uint8Arrays to concatenate.
 * @returns A single concatenated Uint8Array.
 */
export function concatBuffers(...arrays: Uint8Array[]): Uint8Array {
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
export function writeSshString(data: Uint8Array): Uint8Array {
  const len = data.length;
  const buffer = new ArrayBuffer(4 + len);
  const view = new DataView(buffer);
  view.setUint32(0, len, false); // big-endian
  new Uint8Array(buffer, 4).set(data);
  return new Uint8Array(buffer);
}
