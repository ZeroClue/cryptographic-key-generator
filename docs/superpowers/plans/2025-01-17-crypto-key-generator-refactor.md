# Cryptographic Key Generator - Comprehensive Refactor Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the cryptographic key generator: fix security vulnerabilities, modularize codebase, add unit testing, improve performance/UX.

**Architecture:** Three stages:
1. **Stage 1:** Security fixes (memory leaks, input validation, type safety)
2. **Stage 2:** Modularization (split 979-line cryptoService.ts) + Vitest
3. **Stage 3:** Polish (lazy loading, focus management, docs)

**Tech Stack:** React 19, TypeScript, Vite, Web Crypto API, OpenPGP.js, Vitest

---

# STAGE 1: Security Fixes

## Task 1: Install @types/zxcvbn
Modify `package.json` - Add `"@types/zxcvbn": "^4.4.5"` to devDependencies, run `npm install`, commit.

## Task 2: Fix zxcvbn Type
Modify `src/components/KeyGenerator.tsx` - Add ZxcvbnResult interface, update PasswordStrengthMeter and passphraseStrength state types. Run `npx tsc --noEmit`, commit.

## Task 3: Fix KeyType Reference
Modify `src/types.ts` - Import `KeyType as WebCryptoKeyType` from 'crypto', update KeyProperties interface. Type check, commit.

## Task 4: Fix setTimeout Memory Leak
Modify `src/components/KeyGenerator.tsx:226` - Add cleanup function to useEffect that resets isCopied. Commit.

## Task 5: Fix URL.createObjectURL Memory Leak
Modify `src/components/KeyGenerator.tsx:630` - Store objectUrl in variable, add setTimeout with URL.revokeObjectURL. Commit.

## Task 6: Add Input Validation
Modify `src/services/cryptoService.ts:689` - Add length and character validation to importRaw function. Commit.

## Task 7: Create Stage 1 Branch
```bash
git checkout -b stage-1-security-fixes
git add .
git commit -m "feat(stage-1): complete security fixes"
git push origin stage-1-security-fixes
```

---

# STAGE 2: Modularization & Testing

## Task 8: Install Vitest
Modify `package.json` - Add vitest, @testing-library/react, @testing-library/jest-dom, jsdom to devDependencies. Add scripts: `"test:unit": "vitest"`. Run `npm install`, commit.

## Task 9: Configure Vitest
Create `vitest.config.ts` - Configure with jsdom environment, coverage, path aliases.
Create `tests/setup.ts` - Setup cleanup and matchers.
Modify `tsconfig.json` - Add `"@/*": ["./src/*"]` to paths.
Run `npm run test:unit -- --run`, commit.

## Task 10: Create crypto/utils.ts
Create `src/services/crypto/utils.ts` - Export isPgpKey, concatBuffers, writeSshString functions. Type check, commit.

## Task 11: Create crypto/converters.ts
Create `src/services/crypto/converters.ts` - Export arrayBufferToBase64, base64ToArrayBuffer, arrayBufferToHex, hexToArrayBuffer, base64UrlToUint8Array, base64UrlToMpint, formatAsPem, pemToBase64. Import utils. Type check, commit.

## Task 12: Create crypto/exporters.ts
Create `src/services/crypto/exporters.ts` - Export all key export functions (exportPublicKeyPem, exportPrivateKeyPem, exportSymmetricKey, exportSymmetricKeyHex, exportPublicKeyJwk, exportPrivateKeyJwk, exportSshPublicKey, exportPrivateKeyOpenSsh, exportPrivateKeyPutty). Import from converters. Type check, commit.

## Task 13: Create crypto/importers.ts
Create `src/services/crypto/importers.ts` - Export importKey, importAndInspectKey, inspectKey with importPem, importJwk, importRaw helpers. Include input validation. Import from converters, utils, types. Type check, commit.

## Task 14: Create crypto/operations.ts
Create `src/services/crypto/operations.ts` - Export encrypt, decrypt, sign, verify functions with PGP support. Import from converters, utils. Type check, commit.

## Task 15: Create crypto/generators.ts
Create `src/services/crypto/generators.ts` - Export generateKey function with algorithm parsing logic. Import openpgp dynamically for PGP. Import from exporters. Type check, commit.

## Task 16: Create crypto/index.ts
Create `src/services/crypto/index.ts` - Re-export all public APIs from generators, importers, exporters, operations. Commit.

## Task 17: Update KeyGenerator Imports
Modify `src/components/KeyGenerator.tsx` - Update imports to use new crypto module structure:
```typescript
import { generateKey } from '../services/crypto/generators';
import { exportPublicKeyPem, exportPrivateKeyPem, exportSymmetricKey, exportSymmetricKeyHex, exportPublicKeyJwk, exportPrivateKeyJwk, exportSshPublicKey, exportPrivateKeyOpenSsh, exportPrivateKeyPutty } from '../services/crypto/exporters';
import { importAndInspectKey, inspectKey } from '../services/crypto/importers';
import { encrypt, decrypt, sign, verify } from '../services/crypto/operations';
```
Type check, test in browser, commit.

## Task 18: Update Other Component Imports
Modify `src/components/EncryptDecrypt.tsx` - Update imports from crypto/operations.
Modify `src/components/SignVerify.tsx` - Update imports from crypto/operations.
Type check, commit.

## Task 19: Delete Old cryptoService.ts
Delete `src/services/cryptoService.ts` after verifying all imports work. Commit.

## Task 20: Write Unit Tests
Create `tests/unit/crypto/converters.spec.ts` - Test all format conversions.
Create `tests/unit/crypto/importers.spec.ts` - Test import functions with validation.
Create `tests/unit/crypto/exporters.spec.ts` - Test export functions.
Create `tests/unit/crypto/operations.spec.ts` - Test encrypt/decrypt/sign/verify.
Create `tests/unit/crypto/generators.spec.ts` - Test key generation for each algorithm.
Run `npm run test:unit`, commit.

## Task 21: Create Stage 2 Branch
```bash
git checkout -b stage-2-modularization
git add .
git commit -m "feat(stage-2): complete modularization and unit testing"
git push origin stage-2-modularization
```

---

# STAGE 3: Polish

## Task 22: Lazy Load OpenPGP
Modify `src/services/crypto/generators.ts` - Change OpenPGP import to dynamic import within generateKey function for PGP algorithms. Test with network tab, commit.

## Task 23: Add React.memo
Modify `src/components/KeyGenerator.tsx` - Wrap KeyOutput and CommandLineEquivalent components with React.memo. Commit.

## Task 24: Add Focus Management
Modify `src/components/KeyGenerator.tsx` - Update SecurityWarningModal with focus trap (focus first element on open, trap tab navigation, close on escape). Commit.

## Task 25: Add CSP Meta Tag
Modify `index.html` - Add Content-Security-Policy meta tag. Commit.

## Task 26: Create Documentation
Create `docs/SECURITY.md` - Document security considerations and CSP.
Create `docs/DEPLOYMENT.md` - Document build and deployment process.
Commit docs.

## Task 27: Create Stage 3 Branch
```bash
git checkout -b stage-3-polish
git add .
git commit -m "feat(stage-3): complete polish and documentation"
git push origin stage-3-polish
```

---

# FINAL: Merge and Release

## Task 28: Merge All Stages
```bash
git checkout main
git merge stage-1-security-fixes
git merge stage-2-modularization
git merge stage-3-polish
```

## Task 29: Final Verification
Run: `npx tsc --noEmit`, `npm run test`, `npm run test:e2e`
Run: `npm audit`
Manual test in browser

## Task 30: Release
```bash
git tag v2.0.0
git push origin main --tags
```

---

**Total: ~30 tasks across 3 stages**
