# Security Considerations

This document outlines the security features and considerations for the Cryptographic Key Generator application.

## Client-Side Only Architecture

**All cryptographic operations happen in your browser.** No data is ever sent to a server.

- **Key Generation**: All keys are generated using the browser's native Web Crypto API or OpenPGP.js library
- **Zero Data Transmission**: No keys, passwords, or sensitive data leave your browser
- **No Server Storage**: Generated keys are not logged, cached, or stored on any server

## Content Security Policy

The application uses a strict Content-Security-Policy (CSP) to prevent XSS attacks:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';">
```

### CSP Directives Explained

- **default-src 'self'**: Only load resources from the same origin
- **script-src 'self'**: Scripts only from the same origin (no external scripts)
- **style-src 'self' 'unsafe-inline'**: Styles from same origin and inline styles (required for Tailwind CSS)
- **img-src 'self' data:**: Images from same origin and data URLs
- **connect-src 'self'**: No external network connections allowed

This policy ensures that even if an attacker finds an XSS vulnerability, they cannot inject malicious scripts or exfiltrate data to external servers.

## Key Handling

### Private Key Exports

Private key exports require explicit user confirmation through a security warning modal:

- **Warning Modal**: Users are warned about the sensitivity of private key data
- **Manual Confirmation**: User must click "Export Anyway" to proceed
- **Best Practices**: Modal displays security best practices for key storage

### Key Storage

**The application does not store keys.** Generated keys are displayed in the browser and can be:

- Copied to clipboard
- Downloaded as files
- Shared between tabs (using BroadcastChannel API, ephemeral only)

**Users are responsible for:**
- Storing private keys securely (e.g., password manager, encrypted storage)
- Never sharing private keys with anyone
- Backing up keys in secure locations
- Using strong passphrases for encrypted keys (PGP)

## Cryptographic Algorithms

### Web Crypto API

The following algorithms use the browser's native Web Crypto API:

- **AES-GCM**: Symmetric encryption (256-bit keys)
- **RSA-OAEP**: Asymmetric encryption (2048, 4096-bit keys)
- **RSA-PSS**: Digital signatures (2048, 4096-bit keys)
- **ECDSA**: Digital signatures (P-256, P-384, P-521 curves)
- **ECDH**: Key exchange (P-256, P-384, P-521 curves)
- **HMAC**: Message authentication (SHA-256, SHA-384, SHA-512)

### OpenPGP.js

PGP key generation uses the OpenPGP.js library:

- **PGP-ECC**: Elliptic curve cryptography (Curve25519, Ed25519)
- **PGP-RSA**: RSA encryption and signing (2048, 4096-bit keys)

## Input Validation

All key imports are validated for:

- **Length checks**: Minimum and maximum key lengths enforced
- **Character validation**: Only valid characters allowed for each encoding
- **Format validation**: PEM, JWK, and other formats must be valid
- **Byte length validation**: Validation is performed on decoded byte length, not string length

## Memory Management

The application prevents memory leaks through:

- **Timeout cleanup**: All setTimeout calls have proper cleanup on component unmount
- **Object URL cleanup**: All URL.createObjectURL calls are paired with URL.revokeObjectURL
- **React strict mode**: Components are designed to handle multiple mount/unmount cycles

## Performance Considerations

- **OpenPGP lazy loading**: OpenPGP.js is only loaded when PGP algorithms are selected
- **React.memo**: Expensive components are memoized to prevent unnecessary re-renders
- **Focus management**: Modals include focus traps for accessibility and security

## Security Best Practices for Users

1. **Never share private keys** with anyone
2. **Store keys securely** in a password manager or encrypted storage
3. **Use strong passphrases** for encrypted keys (PGP)
4. **Verify key fingerprints** when sharing public keys
5. **Keep software updated** to receive security patches
6. **Use HTTPS** when deploying to ensure secure delivery of the application

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do not create a public issue**
2. Send details to the project maintainer privately
3. Include steps to reproduce and impact assessment
4. Allow time for the issue to be fixed before disclosing

## License and Warranty

This software is provided "as is" without warranty of any kind. Users are responsible for:

- Understanding the security implications of cryptographic key generation
- Following best practices for key management
- Complying with applicable laws and regulations
- Backing up important keys

** cryptographic operations are only as secure as their implementation and usage. **
