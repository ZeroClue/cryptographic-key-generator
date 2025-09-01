export type AlgorithmOption =
  // Symmetric Encryption
  | 'AES-128-GCM'
  | 'AES-192-GCM'
  | 'AES-256-GCM'
  | 'AES-128-CBC'
  | 'AES-192-CBC'
  | 'AES-256-CBC'
  | 'AES-128-CTR'
  | 'AES-192-CTR'
  | 'AES-256-CTR'
  // Asymmetric Encryption
  | 'RSA-OAEP-SHA-256-2048'
  | 'RSA-OAEP-SHA-256-4096'
  | 'RSA-OAEP-SHA-384-2048'
  | 'RSA-OAEP-SHA-384-4096'
  | 'RSA-OAEP-SHA-512-2048'
  | 'RSA-OAEP-SHA-512-4096'
  // Digital Signatures
  | 'ECDSA-P-256'
  | 'ECDSA-P-384'
  | 'ECDSA-P-521'
  | 'RSA-PSS-2048'
  | 'RSA-PSS-4096'
  // Key Agreement
  | 'ECDH-P-256'
  | 'ECDH-P-384'
  | 'ECDH-P-521'
  // Message Authentication
  | 'HMAC-SHA-256'
  | 'HMAC-SHA-384'
  | 'HMAC-SHA-512'
  // SSH Keys
  | 'SSH-RSA-2048'
  | 'SSH-RSA-4096'
  | 'SSH-ECDSA-P256'
  | 'SSH-ECDSA-P384'
  | 'SSH-ECDSA-P521'
  // PGP Keys
  | 'PGP-RSA-4096'
  | 'PGP-ECC-curve25519';

export interface SymmetricKeyResult {
  type: 'symmetric';
  key: CryptoKey;
  displayValue: string;
}

export interface AsymmetricKeyResult {
  type: 'asymmetric';
  keyPair: CryptoKeyPair;
  displayValue: string;
}

export interface PgpKeyResult {
  type: 'pgp';
  publicKey: string;
  privateKey: string;
  keyID: string;
  displayValue: string;
}

export type KeyGenerationResult = SymmetricKeyResult | AsymmetricKeyResult | PgpKeyResult;

export interface PgpOptions {
  name: string;
  email: string;
  passphrase?: string;
}

export interface KeyProperties {
  type: KeyType | 'public' | 'private';
  algorithm: string;
  size: string;
  usages: KeyUsage[] | string[];
  extractable: boolean;
}

export interface SharedKeyInfo {
  key: string;
  target: string;
  properties: KeyProperties;
}