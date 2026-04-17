import { isPgpKey } from './utils';
import { arrayBufferToBase64, base64ToArrayBuffer } from './converters';

/**
 * Encrypts a plaintext string using the provided key.
 * @param key The CryptoKey (public or symmetric) or PGP key to use for encryption.
 * @param plaintext The string to encrypt.
 * @returns A promise that resolves to the Base64 encoded (or PGP armored) ciphertext.
 */
export async function encrypt(key: CryptoKey | any, plaintext: string): Promise<string> {
  if (isPgpKey(key)) {
    const openpgp = await import('openpgp');
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
    const openpgp = await import('openpgp');
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
    const openpgp = await import('openpgp');
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
      const openpgp = await import('openpgp');
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
