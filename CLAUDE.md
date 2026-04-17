# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev                # Start development server at http://localhost:5173
npm run build              # TypeScript compile + Vite production build
npm run preview            # Preview production build
npm run test               # Run all Playwright tests
npm run test:ui            # Run Playwright tests with UI
npx playwright install     # Install Playwright browsers (required before first test run)
npx playwright test [filename]  # Run single test file
npx tsc --noEmit           # TypeScript type checking only
```

## Architecture Overview

This is a **client-side only** cryptographic key generator web application. All cryptographic operations happen in the browser using the Web Crypto API (native) and OpenPGP.js (for PGP operations). No data is ever sent to a server.

### Three-Tab Architecture

The app has three main tabs implemented as separate components:
- **Generate** (`KeyGenerator.tsx`) - Key generation for various algorithms
- **Encrypt / Decrypt** (`EncryptDecrypt.tsx`) - Encryption/decryption operations
- **Sign / Verify** (`SignVerify.tsx`) - Digital signatures

### Key Sharing Between Tabs

Keys generated in the "Generate" tab can be shared to other tabs via the `onShareKey` callback. This passes `SharedKeyInfo` (key, target tab, properties) through the App component state to the target component, which auto-fills the shared key. Each component clears the shared key after use via `onClearSharedKey`.

### Core Cryptographic Layer

`src/services/cryptoService.ts` is the single source of truth for all cryptographic operations. It handles:
- Key generation (symmetric, asymmetric, SSH, PGP)
- Key import/export (PEM, JWK, OpenSSH, PuTTY, Base64, Hex)
- Encryption/decryption
- Signing/verification
- Key inspection

**Algorithm naming convention**: Algorithm strings are parsed with hyphen delimiters (e.g., `RSA-OAEP-SHA-256-2048`). The `generateKey` function splits on `-` to determine algorithm type, hash, and key size. When adding new algorithms, follow the existing pattern in `types.ts` and `constants.ts`.

Key types are discriminated unions: `SymmetricKeyResult`, `AsymmetricKeyResult`, `PgpKeyResult`.

### Type System

`src/types.ts` defines all shared TypeScript types:
- `AlgorithmOption` - Union type of all supported algorithm strings
- `KeyGenerationResult` - Discriminated union of key generation results
- `PgpOptions` - User info for PGP key generation (name, email, passphrase)
- `KeyProperties` - Metadata about imported/inspected keys
- `SharedKeyInfo` - Data passed between tabs when sharing keys

### Constants

`src/constants.ts` contains:
- `TABS` - Tab identifiers
- `ALGORITHM_OPTIONS` - Available algorithms with descriptions
- `KEY_SIZE_OPTIONS` - Valid key sizes per algorithm
- `KEY_SIZE_DESCRIPTIONS` - Explanations of security levels
- `USAGE_DESCRIPTIONS` - Educational content for key usage categories

## Code Style Guidelines

### TypeScript & React
- Functional components with hooks only (no classes)
- `React.FC<Props>` for component annotations
- `interface` for object shapes, `type` for unions/primitives
- `import type` for type-only imports
- Group imports: React/hooks → external libs → internal modules

### Naming Conventions
- PascalCase: Components, Types, Interfaces
- camelCase: Functions, variables
- UPPER_SNAKE_CASE: Constants (TABS, ALGORITHM_OPTIONS)

### File Organization
- Business logic in `src/services/` directory
- UI logic in components only
- Constants in `constants.ts`, types in `types.ts`
- Tailwind CSS for styling with semantic color classes
- Inline SVG components for icons (no icon library dependency)

## Security Constraints

- **Never log sensitive data** (keys, passwords, plaintext)
- All crypto operations must use `window.crypto.subtle` (Web Crypto API) or `openpgp` library
- Private key exports require modal confirmation warnings
- Input validation on blur/submission
- Loading states for all async operations
- Try/catch for async operations with user-friendly error messages

## Technology Stack

- React 19 with TypeScript
- Tailwind CSS with custom dark theme
- Vite as build tool
- Playwright for E2E testing (tests run against localhost:5173; Playwright auto-starts dev server before tests)
- zxcvbn for password strength assessment
- OpenPGP.js for PGP operations
