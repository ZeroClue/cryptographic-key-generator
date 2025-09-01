import type { AlgorithmOption } from './types';

interface Algorithm {
  value: string;
  label: string;
  group: string;
  description:string;
}

export const TABS = {
    GENERATE: 'Generate',
    ENCRYPT_DECRYPT: 'Encrypt / Decrypt',
    SIGN_VERIFY: 'Sign / Verify',
};

export const USAGE_DEFINITIONS = [
    {
        group: 'Symmetric Encryption',
        shortDescription: 'Fast, single-key encryption.'
    },
    {
        group: 'Asymmetric Encryption',
        shortDescription: 'Two-key (public/private) encryption.'
    },
    {
        group: 'SSH Authentication',
        shortDescription: 'Passwordless server access.'
    },
    {
        group: 'Digital Signatures',
        shortDescription: 'Verify authenticity & integrity.'
    },
    {
        group: 'Key Agreement',
        shortDescription: 'Securely establish a shared secret.'
    },
    {
        group: 'Message Authentication',
        shortDescription: 'Verify message source & integrity.'
    },
    {
        group: 'PGP / GPG',
        shortDescription: 'Encrypt & sign emails/files.'
    }
];

export const ALGORITHM_OPTIONS: Algorithm[] = [
  // Symmetric Encryption
  { value: 'AES-128-GCM', label: 'AES-128-GCM', group: 'Symmetric Encryption', description: 'Modern, fast, authenticated encryption. Recommended for general use.' },
  { value: 'AES-192-GCM', label: 'AES-192-GCM', group: 'Symmetric Encryption', description: 'Modern, fast, authenticated encryption with a larger key size for increased security.' },
  { value: 'AES-256-GCM', label: 'AES-256-GCM', group: 'Symmetric Encryption', description: 'Modern, fast, authenticated encryption with a very large key size for top-tier security.' },
  { value: 'AES-128-CBC', label: 'AES-128-CBC', group: 'Symmetric Encryption', description: 'A legacy encryption mode. Lacks built-in authentication; GCM is generally preferred.' },
  { value: 'AES-192-CBC', label: 'AES-192-CBC', group: 'Symmetric Encryption', description: 'A legacy encryption mode with a larger key size. Lacks built-in authentication.' },
  { value: 'AES-256-CBC', label: 'AES-256-CBC', group: 'Symmetric Encryption', description: 'A legacy encryption mode with a very large key size. Lacks built-in authentication.' },
  { value: 'AES-128-CTR', label: 'AES-128-CTR', group: 'Symmetric Encryption', description: 'Turns the block cipher into a stream cipher. Fast, but provides no authentication.' },
  { value: 'AES-192-CTR', label: 'AES-192-CTR', group: 'Symmetric Encryption', description: 'A stream cipher mode with a larger key size. Provides no authentication.' },
  { value: 'AES-256-CTR', label: 'AES-256-CTR', group: 'Symmetric Encryption', description: 'A stream cipher mode with a very large key size. Provides no authentication.' },
  // Asymmetric Encryption
  { value: 'RSA-OAEP-SHA-256', label: 'RSA-OAEP (SHA-256)', group: 'Asymmetric Encryption', description: 'RSA encryption using the SHA-256 hash function. Recommended for general use.' },
  { value: 'RSA-OAEP-SHA-384', label: 'RSA-OAEP (SHA-384)', group: 'Asymmetric Encryption', description: 'RSA encryption using the SHA-384 hash function for a higher level of security.' },
  { value: 'RSA-OAEP-SHA-512', label: 'RSA-OAEP (SHA-512)', group: 'Asymmetric Encryption', description: 'RSA encryption using the SHA-512 hash function for the highest level of security.' },
  // SSH Keys
  { value: 'SSH-RSA', label: 'SSH RSA', group: 'SSH Authentication', description: 'Legacy-compatible RSA key for SSH. ECDSA is recommended for modern systems.' },
  { value: 'SSH-ECDSA', label: 'SSH ECDSA', group: 'SSH Authentication', description: 'Modern, fast, and secure elliptic curve key for SSH. Recommended for most uses.' },
  // Digital Signatures
  { value: 'ECDSA', label: 'ECDSA', group: 'Digital Signatures', description: 'The modern standard for digital signatures, offering strong security with small keys.' },
  { value: 'RSA-PSS', label: 'RSA-PSS', group: 'Digital Signatures', description: 'The modern standard for robust RSA digital signatures.' },
  // Key Agreement
  { value: 'ECDH', label: 'ECDH', group: 'Key Agreement', description: 'Allows two parties to securely establish a shared secret for symmetric encryption.' },
  // Message Authentication
  { value: 'HMAC-SHA-256', label: 'HMAC (SHA-256)', group: 'Message Authentication', description: 'Verifies message integrity and authenticity using a shared secret key and SHA-256.' },
  { value: 'HMAC-SHA-384', label: 'HMAC (SHA-384)', group: 'Message Authentication', description: 'A more secure version of HMAC using the SHA-384 hash algorithm.' },
  { value: 'HMAC-SHA-512', label: 'HMAC (SHA-512)', group: 'Message Authentication', description: 'The most secure HMAC option, using the SHA-512 hash algorithm.' },
  // PGP / GPG
  { value: 'PGP-ECC-curve25519', label: 'PGP ECC (Curve25519)', group: 'PGP / GPG', description: 'Modern, fast Elliptic Curve PGP key (Curve25519) for signing and encryption. Recommended.' },
  { value: 'PGP-RSA', label: 'PGP RSA', group: 'PGP / GPG', description: 'RSA-based PGP key for signing and encryption. Widely compatible.' },
];

export const KEY_SIZE_OPTIONS: Record<string, { value: string; label: string; }[]> = {
    'RSA-OAEP-SHA-256': [
        { value: '2048', label: '2048 bits' },
        { value: '4096', label: '4096 bits' },
    ],
    'RSA-OAEP-SHA-384': [
        { value: '2048', label: '2048 bits' },
        { value: '4096', label: '4096 bits' },
    ],
    'RSA-OAEP-SHA-512': [
        { value: '2048', label: '2048 bits' },
        { value: '4096', label: '4096 bits' },
    ],
    'RSA-PSS': [
      { value: '2048', label: '2048 bits' },
      { value: '4096', label: '4096 bits' },
    ],
    'ECDSA': [
      { value: 'P-256', label: 'NIST P-256' },
      { value: 'P-384', label: 'NIST P-384' },
      { value: 'P-521', label: 'NIST P-521' },
    ],
    'ECDH': [
      { value: 'P-256', label: 'NIST P-256' },
      { value: 'P-384', label: 'NIST P-384' },
      { value: 'P-521', label: 'NIST P-521' },
    ],
    'SSH-RSA': [
        { value: '2048', label: '2048 bits' },
        { value: '4096', label: '4096 bits' },
    ],
    'SSH-ECDSA': [
        { value: 'P256', label: 'NIST P-256' },
        { value: 'P384', label: 'NIST P-384' },
        { value: 'P521', label: 'NIST P-521' },
    ],
    'PGP-RSA': [
        { value: '4096', label: '4096 bits' },
    ]
  };

export const KEY_SIZE_DESCRIPTIONS: Record<string, string> = {
    '2048': 'Standard security level for RSA keys, suitable for most applications. Resistant to attacks with current computing power.',
    '4096': 'High security level, recommended for long-term data protection or meeting stringent compliance requirements (e.g., CNSA Suite).',
    'P-256': 'Equivalent to ~3072-bit RSA security. Excellent performance and widely supported. Recommended for most new applications.',
    'P-384': 'Equivalent to ~7680-bit RSA security. Provides a very high level of security for sensitive data.',
    'P-521': 'Equivalent to ~15360-bit RSA security. The highest level of security available, often used for top-secret or long-term archival purposes.',
    'P256': 'Equivalent to ~3072-bit RSA security. Excellent performance and widely supported. Recommended for most new applications.',
    'P384': 'Equivalent to ~7680-bit RSA security. Provides a very high level of security for sensitive data.',
    'P521': 'Equivalent to ~15360-bit RSA security. The highest level of security available, often used for top-secret or long-term archival purposes.',
};

export const USAGE_DESCRIPTIONS: Record<string, { title: string; description: string; }> = {
    'Symmetric Encryption': {
      title: 'About Symmetric Encryption',
      description: 'Uses a single secret key to both encrypt and decrypt data. This method is very fast and is ideal for securing large amounts of data at rest or in transit, provided the key can be shared securely between parties.'
    },
    'Asymmetric Encryption': {
      title: 'About Asymmetric Encryption',
      description: 'Uses a key pair: a public key to encrypt data and a private key to decrypt it. Anyone can use the public key to encrypt a message, but only the holder of the private key can decrypt and read it.'
    },
    'Digital Signatures': {
      title: 'About Digital Signatures',
      description: 'Uses a private key to sign data and the corresponding public key to verify the signature. This ensures the data\'s authenticity (proving it came from the key holder) and integrity (proving it hasn\'t been altered).'
    },
    'Key Agreement': {
      title: 'About Key Agreement',
      description: 'Allows two parties, each with their own key pair, to establish a shared secret over an insecure channel. This shared secret can then be used for fast and efficient symmetric encryption.'
    },
    'Message Authentication': {
      title: 'About Message Authentication (HMAC)',
      description: 'Uses a secret key to generate a Hash-based Message Authentication Code (HMAC). This code is sent along with the message to verify both its integrity and authenticity, ensuring it was not tampered with and originated from a trusted source.'
    },
    'SSH Authentication': {
      title: 'About SSH Authentication',
      description: 'Generates a key pair for use with the Secure Shell (SSH) protocol. The public key is placed on a server, allowing the holder of the private key to authenticate securely without needing a password.'
    },
    'PGP / GPG': {
        title: 'About PGP / GPG',
        description: 'Generates an OpenPGP key pair used for encrypting and signing emails, files, and other data. The public key is shared so others can encrypt messages for you, while the private key (protected by a passphrase) is used for decryption and signing.'
    }
  };