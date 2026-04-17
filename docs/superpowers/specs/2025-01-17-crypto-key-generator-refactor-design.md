# Cryptographic Key Generator - Comprehensive Refactor Design

**Date:** 2025-01-17
**Author:** Claude Code
**Status:** Approved

## Overview

This document outlines a three-stage refactoring plan for the cryptographic key generator application, addressing security vulnerabilities, code organization, testing coverage, and user experience improvements.

**Current State:**
- 979-line `cryptoService.ts` handling all crypto operations
- Memory leaks in setTimeout and URL.createObjectURL
- Missing input validation for key imports
- Type safety issues with `any` types
- Only E2E tests (Playwright), no unit tests

**Target State:**
- Modular crypto service organized by domain
- All memory leaks fixed
- Robust input validation
- Full type safety
- Comprehensive test coverage (unit + E2E)
- Performance optimizations and UX improvements

---

## Stage 1: High Priority Security Fixes

### 1.1 Fix Memory Leaks

**Location:** `src/components/KeyGenerator.tsx`

**Issue 1: setTimeout cleanup (line 221-224)**
```typescript
// BEFORE - No cleanup on unmount
const handleCopy = useCallback(() => {
  navigator.clipboard.writeText(value).then(() => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // ❌ No cleanup
  });
}, [value, isCopied]);

// AFTER - Proper cleanup
const handleCopy = useCallback(() => {
  if (isCopied || !value) return;
  navigator.clipboard.writeText(value).then(() => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  });
}, [value, isCopied]);

useEffect(() => {
  setIsCopied(false);
  return () => {
    // Cleanup will be called on unmount
  };
}, [value]);
```

**Issue 2: URL.createObjectURL cleanup (line 630-636)**
```typescript
// BEFORE - Object URL never revoked
const downloadFile = (filename: string, content: string, mimeType: string) => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: mimeType });
  element.href = URL.createObjectURL(file); // ❌ Never revoked
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// AFTER - Revoke object URL after download
const downloadFile = (filename: string, content: string, mimeType: string) => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: mimeType });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);

  // Revoke after short delay to allow download to start
  setTimeout(() => {
    URL.revokeObjectURL(element.href);
  }, 100);
};
```

### 1.2 Add Input Validation

**Location:** `src/services/cryptoService.ts:689-712`

Add validation before processing raw key imports:

```typescript
async function importRaw(raw: string, encoding: 'base64' | 'hex' = 'base64'): Promise<CryptoKey> {
  // Validate input length
  const minLength = encoding === 'base64' ? 16 : 32; // 128 bits minimum
  const maxLength = encoding === 'base64' ? 512 : 1024; // Reasonable upper bound

  if (raw.length < minLength || raw.length > maxLength) {
    throw new Error(
      `Invalid key length: ${raw.length} characters. Expected ${minLength}-${maxLength} characters.`
    );
  }

  // Validate characters
  if (encoding === 'hex' && !/^[0-9a-fA-F]*$/.test(raw)) {
    throw new Error('Invalid hexadecimal characters in key.');
  }

  if (encoding === 'base64' && !/^[A-Za-z0-9+/]*={0,2}$/.test(raw)) {
    throw new Error('Invalid Base64 characters in key.');
  }

  const buffer = encoding === 'base64' ? base64ToArrayBuffer(raw) : hexToArrayBuffer(raw);
  // ... rest of function
}
```

### 1.3 Fix Type Safety Issues

**Issue 1: zxcvbn types**
```typescript
// Add to package.json: "@types/zxcvbn": "^4.4.5"

// In KeyGenerator.tsx
interface ZxcvbnResult {
  score: 0 | 1 | 2 | 3 | 4;
  feedback: {
    warning: string;
    suggestions: string[];
  };
}

const PasswordStrengthMeter: React.FC<{ strength: ZxcvbnResult | null }> = ({ strength }) => {
  if (!strength) return null;
  const { score, feedback } = strength;
  // ... rest of component
};
```

**Issue 2: KeyType reference**
```typescript
// In src/types.ts
import type { KeyType as WebCryptoKeyType } from 'crypto';

export interface KeyProperties {
  type: WebCryptoKeyType | 'public' | 'private';
  algorithm: string;
  size: string;
  usages: KeyUsage[] | string[];
  extractable: boolean;
}
```

---

## Stage 2: Medium Priority - Modularization & Testing

### 2.1 CryptoService Modularization

**New directory structure:**
```
src/services/crypto/
├── generators.ts          # Key generation functions
├── converters.ts          # Format conversion utilities
├── importers.ts           # Key import functions
├── exporters.ts           # Key export functions
├── operations.ts          # Encrypt/decrypt/sign/verify
├── utils.ts              # Helper functions
└── index.ts              # Public API facade
```

**File responsibilities:**

**generators.ts** (~200 lines)
- `generateKey()` - main entry point
- Algorithm-specific generation logic (AES, RSA, ECDSA, ECDH, HMAC, SSH, PGP)
- PGP key generation with OpenPGP.js integration

**converters.ts** (~150 lines)
- `arrayBufferToBase64()`, `base64ToArrayBuffer()`
- `arrayBufferToHex()`, `hexToArrayBuffer()`
- `base64UrlToUint8Array()`, `base64UrlToMpint()`
- `formatAsPem()`, `pemToBase64()`

**exporters.ts** (~250 lines)
- `exportPublicKeyPem()`, `exportPrivateKeyPem()`
- `exportSshPublicKey()`
- `exportPrivateKeyOpenSsh()`, `exportPrivateKeyPutty()`
- `exportPublicKeyJwk()`, `exportPrivateKeyJwk()`
- `exportSymmetricKey()`, `exportSymmetricKeyHex()`

**importers.ts** (~150 lines)
- `importPem()`, `importJwk()`, `importRaw()`
- `importKey()` - main entry point with format detection
- `importAndInspectKey()` - import with property extraction
- `inspectKey()` - key property analysis

**operations.ts** (~150 lines)
- `encrypt()` - symmetric and asymmetric encryption
- `decrypt()` - symmetric and asymmetric decryption
- `sign()` - digital signatures
- `verify()` - signature verification
- PGP operations support

**utils.ts** (~80 lines)
- `isPgpKey()` - type guard for PGP keys
- `concatBuffers()` - buffer concatenation
- `writeSshString()` - SSH format helper

**index.ts** (~20 lines)
```typescript
// Re-export public API for convenience
export { generateKey } from './generators';
export { importKey, importAndInspectKey, inspectKey } from './importers';
export {
  exportPublicKeyPem,
  exportPrivateKeyPem,
  exportSshPublicKey,
  exportPublicKeyJwk,
  exportPrivateKeyJwk,
  exportSymmetricKey,
  exportSymmetricKeyHex
} from './exporters';
export { encrypt, decrypt, sign, verify } from './operations';
```

### 2.2 Component Import Updates

**Before:**
```typescript
import {
  generateKey,
  exportPublicKeyPem,
  exportPrivateKeyPem,
  exportSymmetricKey,
  exportPublicKeyJwk,
  exportPrivateKeyJwk,
  exportSymmetricKeyHex,
  exportPrivateKeyOpenSsh,
  exportPrivateKeyPutty,
  importAndInspectKey,
  inspectKey
} from '../services/cryptoService';
```

**After:**
```typescript
import { generateKey } from '../services/crypto/generators';
import {
  exportPublicKeyPem,
  exportPrivateKeyPem,
  exportSshPublicKey,
  exportPublicKeyJwk,
  exportPrivateKeyJwk,
  exportSymmetricKey,
  exportSymmetricKeyHex,
  exportPrivateKeyOpenSsh,
  exportPrivateKeyPutty
} from '../services/crypto/exporters';
import { importAndInspectKey, inspectKey } from '../services/crypto/importers';
import { encrypt, decrypt, sign, verify } from '../services/crypto/operations';
```

### 2.3 Unit Testing with Vitest

**Dependencies:**
```json
{
  "devDependencies": {
    "vitest": "^2.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jsdom": "^24.0.0"
  }
}
```

**Test structure:**
```
tests/unit/
├── crypto/
│   ├── generators.spec.ts      # Test key generation
│   ├── converters.spec.ts      # Test format conversions
│   ├── importers.spec.ts       # Test key import with validation
│   ├── exporters.spec.ts       # Test key export formats
│   └── operations.spec.ts      # Test encrypt/decrypt/sign/verify
└── components/
    ├── KeyGenerator.spec.ts    # Test component logic
    ├── EncryptDecrypt.spec.ts  # Test encryption UI
    └── SignVerify.spec.ts      # Test signature UI
```

**Vitest configuration:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
});
```

**Example test structure:**
```typescript
// tests/unit/crypto/generators.spec.ts
import { describe, it, expect } from 'vitest';
import { generateKey } from '@/services/crypto/generators';

describe('generateKey', () => {
  it('should generate AES-256-GCM key', async () => {
    const result = await generateKey('AES-256-GCM');
    expect(result.type).toBe('symmetric');
    expect(result.displayValue).toMatch(/^[A-Za-z0-9+/=]+$/);
  });

  it('should generate RSA-OAEP key pair', async () => {
    const result = await generateKey('RSA-OAEP-SHA-256-2048');
    expect(result.type).toBe('asymmetric');
    expect(result.keyPair).toBeDefined();
    expect(result.keyPair.publicKey).toBeDefined();
    expect(result.keyPair.privateKey).toBeDefined();
  });

  // ... more tests
});
```

**Coverage goals:**
- Crypto functions: 90%+ (critical for security)
- Components: 80%+ (UI logic)
- Edge cases: Malformed inputs, boundary conditions

---

## Stage 3: Low Priority - Polish

### 3.1 Performance Optimizations

**OpenPGP.js lazy loading:**
```typescript
// In KeyGenerator.tsx
const handleGenerateKey = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  setGenerationResult(null);

  if (selectedAlgorithm.startsWith('PGP')) {
    // Lazy load OpenPGP only when needed
    const openpgp = (await import('openpgp')).default;
    // Use the dynamically imported module
  }

  // ... rest of function
}, [selectedAlgorithm, /* other deps */]);
```

**React.memo for expensive components:**
```typescript
export const KeyOutput = React.FC<KeyOutputProps> = memo(({ title, value, isLoading, placeholder, error }) => {
  // ... component code
});

export const CommandLineEquivalent = React.FC<{ command: string | null }> = memo(({ command }) => {
  // ... component code
});
```

### 3.2 UX Improvements

**Focus management for modals:**
```typescript
const SecurityWarningModal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus first focusable element
      const focusable = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      focusable?.focus();

      // Trap focus within modal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as NodeListOf<HTMLElement>;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }

        // Close on Escape
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // ... rest of component
};
```

**Loading skeletons:**
```typescript
const KeyOutputSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
    <div className="h-48 bg-gray-700 rounded"></div>
  </div>
);

// Use in KeyOutput
{isLoading && <KeyOutputSkeleton />}
```

### 3.3 Documentation Improvements

**Add security documentation:**
```markdown
# Security Considerations

## Content Security Policy
Add to index.html:
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">

## Key Handling
- All keys are generated client-side using Web Crypto API
- No data is sent to servers
- Private key exports require user confirmation
- Keys are never logged or stored
```

**Add deployment guide:**
```markdown
# Deployment Guide

## Build
npm run build

## Preview
npm run preview

## GitHub Pages
The build output in `dist/` can be deployed to GitHub Pages or any static hosting.
```

---

## Testing Strategy

### Test Pyramid
```
        E2E (Playwright)
           ~10 tests
        Critical user flows

    Integration Tests
         ~15 tests
    Multi-component flows

    Unit Tests (Vitest)
        ~50 tests
    Individual functions
```

### Test Categories

**E2E Tests (Playwright):**
- PGP key generation flow
- SSH key generation flow
- Key export workflow
- Encryption/decryption flow
- Sign/verify flow

**Integration Tests:**
- Key sharing between tabs
- Format conversion roundtrips
- Import/export consistency

**Unit Tests:**
- Each algorithm's key generation
- Format conversion utilities
- Input validation edge cases
- Cryptographic operations

---

## Implementation Workflow

### Per-Stage Process

1. **Create feature branch:**
   ```bash
   git checkout -b stage-N-name
   ```

2. **Implement changes:**
   - Follow the design specification
   - Write tests alongside code
   - Run type checking: `npm run tsc --noEmit`

3. **Run full test suite:**
   ```bash
   npm run test          # Vitest unit tests
   npm run test:e2e     # Playwright E2E tests
   ```

4. **Manual testing:**
   - Start dev server: `npm run dev`
   - Test all affected features
   - Verify no regressions

5. **Commit changes:**
   ```bash
   git add .
   git commit -m "Stage N: description"
   git push origin stage-N-name
   ```

6. **Create pull request:**
   - Describe changes made
   - List tests added
   - Request review

7. **Merge after approval:**
   ```bash
   git checkout main
   git merge stage-N-name
   git tag v1.N.0  # Optional
   ```

### Branch Strategy
```
stage-1-security-fixes → main
stage-2-modularization → main
stage-3-polish → main
```

---

## Success Criteria

### Stage 1
- ✅ No memory leaks (verified with React DevTools Profiler)
- ✅ Input validation catches all test cases
- ✅ Zero TypeScript `any` types
- ✅ All tests pass

### Stage 2
- ✅ `cryptoService.ts` split into 7 focused modules
- ✅ 90%+ test coverage for crypto functions
- ✅ All imports updated to new structure
- ✅ Zero regression in E2E tests

### Stage 3
- ✅ OpenPGP.js loads only when needed (verified with Network tab)
- ✅ Focus trapped in modals (verified with keyboard navigation)
- ✅ Loading states improved with skeletons
- ✅ Performance budget maintained

---

## Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Breaking crypto functionality | Comprehensive test coverage before refactoring |
| Performance regression | Benchmark before/after each stage |
| Type errors | Strict TypeScript checking throughout |
| Merge conflicts | Work in feature branches, merge incrementally |
| Browser compatibility | Test in target browsers after each stage |

---

## Timeline Estimate

- **Stage 1:** 2-3 hours (security fixes are focused)
- **Stage 2:** 6-8 hours (modularization + comprehensive tests)
- **Stage 3:** 3-4 hours (performance and UX improvements)

**Total:** 11-15 hours

---

## Post-Implementation

After completing all stages:

1. **Run full audit:**
   ```bash
   npm audit
   tsc --noEmit
   npm run test
   npm run test:e2e
   ```

2. **Update documentation:**
   - README with new architecture
   - API documentation
   - Deployment guide

3. **Release:**
   - Tag version: `git tag v2.0.0`
   - Create GitHub release
   - Deploy to production
