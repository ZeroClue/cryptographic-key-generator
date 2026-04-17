# Cryptographic Key Generator

> Secure, client-side cryptographic key generation. Generate RSA, ECC, PGP, and SSH keys directly in your browser. Zero data transmission. Open source.

## Quick Start

1. **Choose your intended usage** (Encryption, Signing, SSH, or PGP)
2. **Select your algorithm** (pick from recommended options)
3. **Click "Generate Key"** - keys appear instantly
4. **Copy or download** in your preferred format

[![CI Status](https://github.com/ZeroClue/cryptographic-key-generator/workflows/CI/badge.svg)](https://github.com/ZeroClue/cryptographic-key-generator/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/ZeroClue/cryptographic-key-generator?style=social)](https://github.com/ZeroClue/cryptographic-key-generator/stargazers)

## What is this?

This is a **client-side only** cryptographic key generator. All key generation happens in your browser using the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) and [OpenPGP.js](https://openpgpjs.org/).

**What this means:**
- ✅ Your keys never leave your browser
- ✅ No server to trust or compromise
- ✅ Works offline after first load
- ✅ Open source - audit the code yourself

## Algorithm Comparison

| Algorithm | Key Size | Speed | Security | Best For |
|-----------|----------|-------|----------|----------|
| **RSA-2048** | 2048-bit | Slow | Proven | General encryption, certificates |
| **RSA-4096** | 4096-bit | Slower | Future-proof | High-security applications |
| **ECDSA P-256** | 256-bit | Fast | Strong | Certificates, digital signatures |
| **Ed25519** | 256-bit | Fastest | Modern | SSH keys, modern apps |
| **X25519** | 256-bit | Fastest | Modern | Key exchange |
| **AES-256-GCM** | 256-bit | Fastest | Strong | File encryption, data at rest |

## Use Cases

### SSH Keys
- **Server access:** Authenticate to Linux/Unix servers
- **Git hosting:** Add SSH keys to GitHub/GitLab
- **Automation:** Enable passwordless script execution

### PGP Keys
- **Email encryption:** Send encrypted emails
- **File signing:** Prove authorship of documents
- **Identity:** Establish your cryptographic identity

### RSA/ECC Keys
- **TLS certificates:** Generate CSR for HTTPS
- **Document signing:** Sign PDFs, code, data
- **Authentication:** OAuth tokens, JWT signing

## Code Examples

### Generate RSA-4096 Key Pair

```bash
# Using the tool
1. Visit https://zeroclue.github.io/cryptographic-key-generator
2. Select "Encryption & Signing"
3. Choose "RSA-OAEP-SHA-256-4096"
4. Click "Generate Key"
5. Copy keys to clipboard
```

### Integrate with Your App

```javascript
// Coming soon: API access
// For now, embed the tool in your site:
<iframe src="https://zeroclue.github.io/cryptographic-key-generator/embed/rsa"></iframe>
```

---

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-brightgreen)](https://zeroclue.github.io/cryptographic-key-generator)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-blue)](https://zeroclue.github.io/cryptographic-key-generator)
[![Deployment Status](https://img.shields.io/github/actions/deployment/status/ZeroClue/cryptographic-key-generator/pages?label=Deploy)](https://github.com/ZeroClue/cryptographic-key-generator/actions)

## 🚀 Try It Now - Interactive Demo

<p align="center">
  <a href="https://zeroclue.github.io/cryptographic-key-generator" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/🔐-Cryptographic%20Key%20Generator-brightgreen" alt="Cryptographic Key Generator" style="font-size: 24px; padding: 20px;">
  </a>
</p>

<p align="center">
  <strong>Generate keys, encrypt messages, and create signatures directly in your browser</strong><br>
  <br>
  <a href="https://zeroclue.github.io/cryptographic-key-generator" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/🚀-Try%20Live%20Demo-blue" alt="Try Live Demo" style="font-size: 18px;">
  </a>
  <a href="https://zeroclue.github.io/cryptographic-key-generator" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/⚡-No%20Installation%20Required-green" alt="No Installation Required" style="font-size: 18px;">
  </a>
  <a href="https://zeroclue.github.io/cryptographic-key-generator" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/🛡️-Client%20Side%20Only-orange" alt="Client Side Only" style="font-size: 18px;">
  </a>
</p>

<p align="center">
  <table>
    <tr>
      <td align="center" style="padding: 20px; border: 2px solid #0969da; border-radius: 8px; background: #f6f8fa;">
        <strong>🔑 Key Generation</strong><br>
        <small>RSA, ECDSA, Ed25519, SSH, PGP</small>
      </td>
      <td align="center" style="padding: 20px; border: 2px solid #0969da; border-radius: 8px; background: #f6f8fa;">
        <strong>🔐 Encryption</strong><br>
        <small>AES, RSA-OAEP, ECDH</small>
      </td>
      <td align="center" style="padding: 20px; border: 2px solid #0969da; border-radius: 8px; background: #f6f8fa;">
        <strong>✍️ Signatures</strong><br>
        <small>ECDSA, RSA-PSS, PGP</small>
      </td>
    </tr>
  </table>
</p>

<p align="center">
  <strong>👆 Click any button above to launch the interactive demo</strong><br>
  <small>All cryptographic operations happen securely in your browser</small>
</p>

A comprehensive, browser-based cryptographic tool for generating, managing, and working with various types of cryptographic keys. Built with React, TypeScript, and Tailwind CSS, this application provides a secure and user-friendly interface for all your cryptographic needs.

## 🚀 Features

### 🔑 Key Generation
- **Symmetric Encryption Keys**: AES-128/192/256 in GCM, CBC, and CTR modes
- **Asymmetric Key Pairs**: RSA-OAEP with SHA-256/384/512, ECDSA, ECDH
- **SSH Authentication Keys**: RSA and ECDSA keys for secure server access
- **PGP/GPG Keys**: RSA and ECC (Curve25519) keys for email and file encryption
- **HMAC Keys**: SHA-256/384/512 for message authentication

### 🔐 Encryption & Decryption
- Support for multiple key formats (PEM, JWK, Base64, Hex)
- Drag-and-drop file support for keys and messages
- Real-time key property inspection
- Automatic operation selection based on key type
- PGP passphrase support for encrypted private keys

### ✍️ Digital Signatures
- Create digital signatures with private keys
- Verify signatures with public keys
- Support for ECDSA and RSA-PSS algorithms
- PGP signature creation and verification
- Visual feedback for verification results

### 🔍 Key Inspection
- Import and analyze existing cryptographic keys
- Display key properties (algorithm, size, usage, extractability)
- Support for PEM, JWK, SSH, and PGP key formats
- Drag-and-drop key file import

### 📤 Export Options
- **Multiple Formats**: PEM, JWK, OpenSSH, PuTTY (.ppk), Base64, Hex
- **SSH Keys**: Public (.pub) and private in multiple formats
- **PGP Keys**: Armored ASCII format (.asc)
- **Security Warnings**: Modal confirmations for private key exports

### 🛡️ Security Features
- **Client-Side Only**: All operations performed in your browser using Web Crypto API
- **No Data Transmission**: Keys and sensitive data never leave your device
- **Secure Random Generation**: Uses cryptographically secure random number generation
- **Input Validation**: Comprehensive validation for all user inputs
- **Password Strength**: Real-time passphrase strength assessment using zxcvbn

## 🎯 Supported Algorithms

### Symmetric Encryption
- **AES-GCM**: 128, 192, 256 bits (recommended, authenticated encryption)
- **AES-CBC**: 128, 192, 256 bits (legacy mode)
- **AES-CTR**: 128, 192, 256 bits (stream cipher mode)

### Asymmetric Encryption
- **RSA-OAEP**: 2048, 4096 bits with SHA-256/384/512
- **ECDH**: NIST P-256, P-384, P-521 curves for key agreement

### Digital Signatures
- **ECDSA**: NIST P-256, P-384, P-521 curves
- **RSA-PSS**: 2048, 4096 bits

### SSH Authentication
- **SSH-RSA**: 2048, 4096 bits
- **SSH-ECDSA**: NIST P-256, P-384, P-521 curves

### PGP/GPG
- **PGP-RSA**: 4096 bits
- **PGP-ECC**: Curve25519 (recommended)

### Message Authentication
- **HMAC**: SHA-256, SHA-384, SHA-512

## 💻 Usage

### Key Generation
1. Select the intended usage from the dropdown
2. Choose your preferred algorithm and key size
3. For PGP keys, enter your name, email, and optional passphrase
4. Click "Generate Key" to create your cryptographic key pair
5. Export in your preferred format or use directly in other tools

### Encryption/Decryption
1. Import a key by pasting it or dragging a key file
2. The app automatically detects if it's a public/private key
3. Enter your plaintext or ciphertext
4. Click "Encrypt" or "Decrypt" to perform the operation
5. For PGP private keys, enter the passphrase when prompted

### Digital Signatures
1. Import a private key for signing or public key for verification
2. Enter the message you want to sign or verify
3. Click "Generate Signature" to create a digital signature
4. Copy the signature for sharing
5. To verify, import the public key and paste the signature

### Key Inspection
1. Switch to "Inspect Existing Key" mode
2. Paste or drag a key file to analyze
3. View detailed key properties including algorithm, size, and permitted usages

## 🔧 Technology Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Cryptography**: Web Crypto API + OpenPGP.js
- **Build Tool**: Vite
- **Testing**: Playwright for end-to-end testing
- **Password Strength**: zxcvbn library

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
git clone https://github.com/ZeroClue/cryptographic-key-generator.git
cd cryptographic-key-generator
npm install
```

### Development
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Building for Production
```bash
npm run build
```

### Testing
```bash
npm run test        # Run Playwright tests
npm run test:ui     # Run tests with UI
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── KeyGenerator.tsx  # Key generation interface
│   ├── EncryptDecrypt.tsx # Encryption/decryption interface
│   └── SignVerify.tsx    # Digital signature interface
├── services/
│   └── cryptoService.ts  # Core cryptographic operations
├── types.ts              # TypeScript type definitions
├── constants.ts          # Algorithm definitions and constants
├── App.tsx              # Main application component
└── index.css            # Global styles
tests/                   # Playwright end-to-end tests
```

## 🔒 Security Considerations

- **No Server Storage**: All keys are generated and stored only in browser memory
- **Secure RNG**: Uses the Web Crypto API's cryptographically secure random number generator
- **Memory Management**: Sensitive data is cleared from memory when no longer needed
- **HTTPS Recommended**: Always use over HTTPS to prevent man-in-the-middle attacks
- **Private Key Protection**: Security warnings and confirmations for private key exports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## ⚠️ Disclaimer

This tool is provided for educational and development purposes. While it implements standard cryptographic algorithms, always consult with security experts for production cryptographic systems. The developers are not responsible for any security breaches or data loss resulting from the use of this software.

## 🔗 Command-Line Equivalents

The application provides command-line equivalents for generated keys, helping you understand the underlying OpenSSL/OpenSSH commands:

```bash
# RSA 4096-bit key
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out private_key.pem

# SSH ECDSA key
ssh-keygen -t ecdsa -b 384 -C "user@hostname"

# AES-256 key
openssl rand -base64 32

# PGP ECC key
gpg --expert --full-generate-key (select ECC > Curve25519)
```