import type { AlgorithmOption } from './types';

export interface Algorithm {
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

export interface EducationalContent {
  title: string;
  description: string;
  securityLevel?: string;
  useCases?: string[];
  learnMoreUrl: string;
}

export const ALGORITHM_EDUCATIONAL_CONTENT: Record<string, EducationalContent> = {
  // Symmetric Encryption
  'AES-128-GCM': {
    title: 'AES-128-GCM',
    description: 'Advanced Encryption Standard in Galois/Counter Mode. Provides authenticated encryption with associated data (AEAD), ensuring both confidentiality and integrity. GCM is faster than CBC and provides built-in authentication.',
    securityLevel: 'Standard security, suitable for most applications',
    useCases: ['General-purpose encryption', 'Database encryption', 'File encryption', 'Network protocols'],
    learnMoreUrl: '/why#algorithms'
  },
  'AES-192-GCM': {
    title: 'AES-192-GCM',
    description: 'AES-GCM with a 192-bit key. Offers enhanced security while maintaining excellent performance. The middle ground between AES-128 and AES-256 for environments requiring higher security margins.',
    securityLevel: 'High security, recommended for sensitive data',
    useCases: ['Financial transactions', 'Confidential business data', 'Health records'],
    learnMoreUrl: '/why#algorithms'
  },
  'AES-256-GCM': {
    title: 'AES-256-GCM',
    description: 'The highest security level in the AES family. AES-256-GCM provides top-tier security with authenticated encryption. Recommended for long-term data protection and high-security applications.',
    securityLevel: 'Maximum security, used for classified and long-term data',
    useCases: ['Top-secret data', 'Long-term archival', 'Government/military use', 'Compliance requirements'],
    learnMoreUrl: '/why#algorithms'
  },
  'AES-128-CBC': {
    title: 'AES-128-CBC',
    description: 'AES in Cipher Block Chaining mode. A legacy mode that lacks built-in authentication. Requires proper implementation of HMAC or similar for integrity. GCM is generally preferred for new applications.',
    securityLevel: 'Standard security (legacy mode)',
    useCases: ['Legacy system compatibility', 'Interoperability with older systems'],
    learnMoreUrl: '/why#algorithms'
  },
  'AES-192-CBC': {
    title: 'AES-192-CBC',
    description: 'AES-CBC with a 192-bit key. Provides stronger security than AES-128-CBC but still lacks built-in authentication. Consider GCM for new implementations.',
    securityLevel: 'High security (legacy mode)',
    useCases: ['Legacy systems requiring higher security'],
    learnMoreUrl: '/why#algorithms'
  },
  'AES-256-CBC': {
    title: 'AES-256-CBC',
    description: 'AES-CBC with a 256-bit key. Maximum security but without built-in authentication. Widely supported but GCM is recommended for modern applications.',
    securityLevel: 'Maximum security (legacy mode)',
    useCases: ['High-security legacy systems', 'Compliance with older standards'],
    learnMoreUrl: '/why#algorithms'
  },
  'AES-128-CTR': {
    title: 'AES-128-CTR',
    description: 'AES in Counter mode. Transforms the block cipher into a stream cipher. Very fast and allows parallel processing, but provides no authentication. Must be combined with HMAC for secure applications.',
    securityLevel: 'Standard security (no authentication)',
    useCases: ['High-performance requirements', 'Stream data encryption', 'When combined with HMAC'],
    learnMoreUrl: '/why#algorithms'
  },
  'AES-192-CTR': {
    title: 'AES-192-CTR',
    description: 'AES-CTR with a 192-bit key. Offers higher security with the same performance benefits as CTR mode. Requires separate authentication mechanism.',
    securityLevel: 'High security (no authentication)',
    useCases: ['High-performance with enhanced security'],
    learnMoreUrl: '/why#algorithms'
  },
  'AES-256-CTR': {
    title: 'AES-256-CTR',
    description: 'AES-CTR with a 256-bit key. Maximum security with stream cipher performance. Authentication must be implemented separately.',
    securityLevel: 'Maximum security (no authentication)',
    useCases: ['High-security streaming applications'],
    learnMoreUrl: '/why#algorithms'
  },
  // Asymmetric Encryption
  'RSA-OAEP-SHA-256': {
    title: 'RSA-OAEP (SHA-256)',
    description: 'RSA encryption with Optimal Asymmetric Encryption Padding using SHA-256. OAEP provides security against padding oracle attacks. The modern standard for RSA encryption.',
    securityLevel: 'Standard security with SHA-256',
    useCases: ['Encrypting symmetric keys', 'Small data encryption', 'Key exchange mechanisms'],
    learnMoreUrl: '/why#algorithms'
  },
  'RSA-OAEP-SHA-384': {
    title: 'RSA-OAEP (SHA-384)',
    description: 'RSA-OAEP using SHA-384 hash function. Provides a higher security margin than SHA-256. Recommended for applications requiring enhanced security.',
    securityLevel: 'High security with SHA-384',
    useCases: ['High-security key exchange', 'Enhanced protection applications'],
    learnMoreUrl: '/why#algorithms'
  },
  'RSA-OAEP-SHA-512': {
    title: 'RSA-OAEP (SHA-512)',
    description: 'RSA-OAEP using SHA-512 hash function. The highest security level in the RSA-OAEP family. Used for maximum protection requirements.',
    securityLevel: 'Maximum security with SHA-512',
    useCases: ['Top-secret key exchange', 'Maximum security requirements'],
    learnMoreUrl: '/why#algorithms'
  },
  // SSH Keys
  'SSH-RSA': {
    title: 'SSH RSA',
    description: 'RSA key for SSH protocol authentication. Widely compatible with older SSH servers and systems. ECDSA or Ed25519 are recommended for modern systems due to better performance and security.',
    securityLevel: 'Legacy-compatible, use ECDSA for new systems',
    useCases: ['Legacy server compatibility', 'Older SSH implementations', 'Maximum interoperability'],
    learnMoreUrl: '/why#ssh-keys'
  },
  'SSH-ECDSA': {
    title: 'SSH ECDSA',
    description: 'Elliptic Curve Digital Signature Algorithm for SSH. Provides equivalent security to RSA with much smaller keys. Faster key generation and signatures. Recommended for modern SSH deployments.',
    securityLevel: 'Modern, efficient, secure',
    useCases: ['Modern SSH deployments', 'Cloud infrastructure', 'Container orchestration', 'DevOps workflows'],
    learnMoreUrl: '/why#ssh-keys'
  },
  // Digital Signatures
  'ECDSA': {
    title: 'ECDSA',
    description: 'Elliptic Curve Digital Signature Algorithm. The modern standard for digital signatures. Provides strong security with small key sizes and fast operations. Widely used in blockchain, TLS, and code signing.',
    securityLevel: 'Modern standard for digital signatures',
    useCases: ['Software signing', 'Blockchain transactions', 'TLS certificates', 'Code authentication'],
    learnMoreUrl: '/why#algorithms'
  },
  'RSA-PSS': {
    title: 'RSA-PSS',
    description: 'RSA Probabilistic Signature Scheme. The modern, secure way to create RSA signatures. PSS provides stronger security guarantees than traditional PKCS#1 v1.5 signatures.',
    securityLevel: 'Modern RSA signature standard',
    useCases: ['Document signing', 'Software distribution', 'Secure messaging'],
    learnMoreUrl: '/why#algorithms'
  },
  // Key Agreement
  'ECDH': {
    title: 'ECDH',
    description: 'Elliptic Curve Diffie-Hellman. Allows two parties to establish a shared secret over an insecure channel. The foundation for forward-secret communication in protocols like TLS and Signal.',
    securityLevel: 'Secure key exchange with forward secrecy',
    useCases: ['TLS handshakes', 'End-to-end encryption', 'Secure messaging protocols', 'VPN key exchange'],
    learnMoreUrl: '/why#algorithms'
  },
  // Message Authentication
  'HMAC-SHA-256': {
    title: 'HMAC (SHA-256)',
    description: 'Hash-based Message Authentication Code using SHA-256. Verifies both data integrity and authenticity using a secret key. Standard choice for most HMAC applications.',
    securityLevel: 'Standard security for message authentication',
    useCases: ['API authentication', 'JWT tokens', 'Message integrity verification', 'Password hashing'],
    learnMoreUrl: '/why#algorithms'
  },
  'HMAC-SHA-384': {
    title: 'HMAC (SHA-384)',
    description: 'HMAC using SHA-384 hash. Provides a higher security margin than SHA-256. Used when enhanced security is required.',
    securityLevel: 'High security for message authentication',
    useCases: ['High-security API authentication', 'Sensitive data integrity'],
    learnMoreUrl: '/why#algorithms'
  },
  'HMAC-SHA-512': {
    title: 'HMAC (SHA-512)',
    description: 'HMAC using SHA-512 hash. The highest security level in the HMAC family. Used for maximum protection requirements.',
    securityLevel: 'Maximum security for message authentication',
    useCases: ['Critical system authentication', 'High-integrity requirements'],
    learnMoreUrl: '/why#algorithms'
  },
  // PGP / GPG
  'PGP-ECC-curve25519': {
    title: 'PGP ECC (Curve25519)',
    description: 'Modern elliptic curve PGP key using Curve25519. Offers excellent security, performance, and smaller key sizes. Recommended for new PGP key generation. Faster than RSA with equivalent security.',
    securityLevel: 'Modern, fast, secure - recommended for new keys',
    useCases: ['Email encryption', 'File signing and encryption', 'Modern PGP deployments', 'High-performance applications'],
    learnMoreUrl: '/why#pgp-keys'
  },
  'PGP-RSA': {
    title: 'PGP RSA',
    description: 'RSA-based PGP key for signing and encryption. Widely compatible with existing PGP/GPG implementations. Larger key sizes and slower operations than ECC keys.',
    securityLevel: 'Widely compatible, slower than ECC',
    useCases: ['Legacy PGP compatibility', 'Interoperability with older systems', 'Organizations standardized on RSA'],
    learnMoreUrl: '/why#pgp-keys'
  }
};

export const KEY_SIZE_EDUCATIONAL_CONTENT: Record<string, EducationalContent> = {
  '2048': {
    title: '2048-bit Key Size',
    description: 'Standard security level for RSA keys. Provides adequate protection against current computational capabilities. Suitable for most non-critical applications and short-term data protection.',
    securityLevel: 'Standard security (RSA)',
    useCases: ['General-purpose encryption', 'Short-term certificates', 'Non-critical applications'],
    learnMoreUrl: '/why#algorithms'
  },
  '4096': {
    title: '4096-bit Key Size',
    description: 'High security level for RSA keys. Recommended for long-term data protection and meeting stringent compliance requirements. Provides a significant security margin against future advances in computing power.',
    securityLevel: 'High security (RSA) - recommended for sensitive data',
    useCases: ['Long-term data protection', 'Compliance requirements (CNSA Suite)', 'High-value certificates'],
    learnMoreUrl: '/why#algorithms'
  },
  'P-256': {
    title: 'NIST P-256 (secp256r1)',
    description: '256-bit elliptic curve providing approximately 128-bit security (equivalent to 3072-bit RSA). Excellent performance and widely supported. The recommended choice for most new applications.',
    securityLevel: '~128-bit security (equivalent to 3072-bit RSA)',
    useCases: ['General-purpose ECC applications', 'TLS certificates', 'Digital signatures', 'Recommended default'],
    learnMoreUrl: '/why#algorithms'
  },
  'P-384': {
    title: 'NIST P-384 (secp384r1)',
    description: '384-bit elliptic curve providing approximately 192-bit security (equivalent to 7680-bit RSA). Very high security for sensitive applications. Good balance of security and performance.',
    securityLevel: '~192-bit security (equivalent to 7680-bit RSA)',
    useCases: ['High-security applications', 'Government use', 'Long-term certificates', 'Sensitive data protection'],
    learnMoreUrl: '/why#algorithms'
  },
  'P-521': {
    title: 'NIST P-521 (secp521r1)',
    description: '521-bit elliptic curve providing approximately 260-bit security (equivalent to 15360-bit RSA). The highest security level available in the NIST P-series. Used for maximum security requirements.',
    securityLevel: '~260-bit security (equivalent to 15360-bit RSA)',
    useCases: ['Top-secret applications', 'Long-term archival', 'Maximum security requirements', 'National security'],
    learnMoreUrl: '/why#algorithms'
  },
  'P256': {
    title: 'NIST P-256 (secp256r1)',
    description: '256-bit elliptic curve for SSH ECDSA keys. Provides approximately 128-bit security with excellent performance. The recommended choice for most SSH deployments.',
    securityLevel: '~128-bit security (equivalent to 3072-bit RSA)',
    useCases: ['Modern SSH deployments', 'Cloud infrastructure', 'DevOps workflows', 'Recommended default for SSH'],
    learnMoreUrl: '/why#ssh-keys'
  },
  'P384': {
    title: 'NIST P-384 (secp384r1)',
    description: '384-bit elliptic curve for SSH ECDSA keys. Provides approximately 192-bit security. High security option for sensitive SSH infrastructure.',
    securityLevel: '~192-bit security (equivalent to 7680-bit RSA)',
    useCases: ['High-security SSH infrastructure', 'Government SSH access', 'Critical system authentication'],
    learnMoreUrl: '/why#ssh-keys'
  },
  'P521': {
    title: 'NIST P-521 (secp521r1)',
    description: '521-bit elliptic curve for SSH ECDSA keys. Maximum security level for SSH authentication. Used for top-secret systems and maximum security requirements.',
    securityLevel: '~260-bit security (equivalent to 15360-bit RSA)',
    useCases: ['Top-secret SSH access', 'Maximum security infrastructure', 'Long-term SSH keys'],
    learnMoreUrl: '/why#ssh-keys'
  }
};