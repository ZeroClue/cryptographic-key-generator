# Discoverability & User Experience - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve discoverability through GitHub SEO and enhance user experience with quick wins — all without backend complexity.

**Architecture:** Frontend-only improvements. GitHub metadata optimization, new React routes for educational content, UI enhancements for better UX. Zero backend changes.

**Tech Stack:** React 19, TypeScript, Vite, GitHub Actions (for badges), Supabase (not used in this plan)

---

## File Structure Overview

**New files to create:**
```
.github/
  repository.yaml                          # GitHub metadata
  ISSUE_TEMPLATE/
    bug_report.md
    feature_request.md
  PULL_REQUEST_TEMPLATE.md
  workflows/
    ci.yml                                 # CI badge
images/
  social-preview.png                       # 1200x630 OG image
src/
  pages/
    Why.tsx                                 # Educational/SEO page
    About.tsx                               # Alternative route
  hooks/
    useSeo.ts                               # Dynamic meta tags
  components/
    KeyHistory/
      KeyHistoryDropdown.tsx                # Recent keys feature
    Loading/
      KeyOutputSkeleton.tsx                 # Skeleton screens
    Tooltips/
      AlgorithmTooltip.tsx                  # Educational tooltips
  utils/
    keyHistory.ts                           # History management
```

**Files to modify:**
```
README.md                                    # SEO enhancements
index.html                                   # Meta tags
vite.config.ts                               # Route configuration
package.json                                # New dependencies
src/pages/index.tsx                          # Homepage enhancements
src/components/KeyGenerator.tsx              # Add tooltips, history
src/components/EncryptDecrypt.tsx           # Add tooltips
src/components/SignVerify.tsx               # Add tooltips
```

---

# PHASE 1: GitHub Repository Optimization (Week 1)

## Task 1: Create GitHub repository metadata

**Files:**
- Create: `.github/repository.yaml`

- [ ] **Step 1: Create repository metadata file**

Create `.github/repository.yaml`:

```yaml
name: Cryptographic Key Generator
description: Generate cryptographic keys securely in your browser. RSA, ECC, PGP, SSH keys. Client-side only, zero data transmission, open source.
topics:
  - cryptography
  - security
  - pgp
  - ssh
  - rsa
  - ecdsa
  - ed25519
  - key-generator
  - web-security
  - client-side-crypto
  - web-crypto-api
  - openpgp
  - x509
  - jwt
  - zero-trust
language: TypeScript
license: MIT
```

- [ ] **Step 2: Run git status to verify file created**

Run: `git status`
Expected: `new file: .github/repository.yaml`

- [ ] **Step 3: Commit**

```bash
git add .github/repository.yaml
git commit -m "feat(github): add repository metadata for discoverability"
```

---

## Task 2: Create GitHub issue templates

**Files:**
- Create: `.github/ISSUE_TEMPLATE/bug_report.md`
- Create: `.github/ISSUE_TEMPLATE/feature_request.md`
- Create: `.github/ISSUE_TEMPLATE/config.yml`

- [ ] **Step 1: Create issue template config**

Create `.github/ISSUE_TEMPLATE/config.yml`:

```yaml
blank_issues_enabled: false
contact_links:
  - name: Documentation
    url: https://github.com/ZeroClue/cryptographic-key-generator/blob/main/docs/README.md
    about: Please check the documentation before creating an issue
```

- [ ] **Step 2: Create bug report template**

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug Report
about: Report a problem with the key generator
title: '[BUG] '
labels: bug
---

## Describe the bug

A clear and concise description of what the bug is.

## Steps to reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected behavior

What you expected to happen.

## Actual behavior

What actually happened.

## Environment

- Browser: [e.g. Chrome 120, Firefox 121]
- Operating System: [e.g. Windows 11, macOS 14]
- Algorithm: [e.g. RSA-4096, PGP-ECC]

## Screenshots

If applicable, add screenshots to help explain your problem.
```

- [ ] **Step 3: Create feature request template**

Create `.github/ISSUE_TEMPLATE/feature_request.md`:

```markdown
---
name: Feature Request
about: Suggest an idea for the key generator
title: '[FEATURE] '
labels: enhancement
---

## Is your feature request related to a problem?

A clear and concise description of what the problem is.

## Describe the solution you'd like

A clear and concise description of what you want to happen.

## Describe alternatives you've considered

A clear and concise description of any alternative solutions or features you've considered.

## Additional context

Add any other context or screenshots about the feature request here.
```

- [ ] **Step 4: Commit**

```bash
git add .github/ISSUE_TEMPLATE/
git commit -m "feat(github): add issue and PR templates"
```

---

## Task 3: Create PR template and contributing guide

**Files:**
- Create: `.github/PULL_REQUEST_TEMPLATE.md`
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: Create PR template**

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Description

Briefly describe what this PR changes and why.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] All tests pass: `npm run test && npm run test:unit`

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested this change locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing tests pass locally with my changes

## Additional Notes

Any additional information or context.
```

- [ ] **Step 2: Create contributing guide**

Create `CONTRIBUTING.md`:

```markdown
# Contributing to Cryptographic Key Generator

Thank you for your interest in contributing! We welcome contributions from the community.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Run tests: `npm run test && npm run test:unit`

## Code Style

- Functional components with hooks only
- TypeScript for all files
- Follow existing naming conventions
- Run `npx tsc --noEmit` before committing

## Submitting Changes

1. Create a descriptive branch name
2. Make your changes with clear commit messages
3. Write/update tests for your changes
4. Ensure all tests pass
5. Submit a pull request with description

## Project Structure

- `src/services/crypto/` - Cryptographic operations (modular)
- `src/components/` - React components (KeyGenerator, EncryptDecrypt, SignVerify)
- `src/types.ts` - TypeScript type definitions
- `src/constants.ts` - Algorithm options and descriptions

## Security Considerations

This tool handles cryptographic operations. Please:
- Never log sensitive data (keys, passwords)
- Use Web Crypto API for all crypto operations
- Validate all user inputs
- Add tests for security-critical code

## Getting Help

- Create an issue for bugs or feature requests
- Ask questions in PR description if unsure
- Check existing documentation first
```

- [ ] **Step 3: Commit**

```bash
git add .github/PULL_REQUEST_TEMPLATE.md CONTRIBUTING.md
git commit -m "docs(github): add PR template and contributing guide"
```

---

## Task 4: Add CI workflow for status badges

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create CI workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Run unit tests
        run: npm run test:unit -- --run

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npm run test

      - name: Upload coverage reports
        uses: codecov/codecov-action@v4
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "feat(github): add CI workflow with test automation"
```

---

## Task 5: Create social preview image

**Files:**
- Create: `images/social-preview.png`
- Modify: `index.html`

- [ ] **Step 1: Create images directory**

```bash
mkdir -p images
```

- [ ] **Step 2: Design and create social preview image**

Create `images/social-preview.png`:
- Dimensions: 1200x630 pixels
- Content:
  - Title: "Cryptographic Key Generator" (large, bold)
  - Tagline: "Secure. Client-Side. Open Source."
  - Visual: Key icons (🔐, 🔑, ⚡) or app preview
  - URL: "crypto-gen.kern.web.za" at bottom
- Colors: Use brand colors from app
- Font: Clean, readable sans-serif

Use: Figma, Canva, or image editor

- [ ] **Step 3: Add OpenGraph meta tags to index.html**

Modify `index.html`, add to `<head>`:

```html
<meta property="og:type" content="website">
<meta property="og:title" content="Cryptographic Key Generator - Secure, Client-Side">
<meta property="og:description" content="Generate RSA, ECC, PGP, and SSH keys securely in your browser. Zero data transmission.">
<meta property="og:image" content="https://crypto-gen.kern.web.za/social-preview.png">
<meta property="og:url" content="https://crypto-gen.kern.web.za/">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://crypto-gen.kern.web.za/social-preview.png">
```

- [ ] **Step 4: Commit**

```bash
git add images/ index.html
git commit -m "feat(seo): add social preview image and OpenGraph tags"
```

---

## Task 6: Enhance README with SEO structure

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add H1/H2 structure to README**

Add to top of `README.md`:

```markdown
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
```

- [ ] **Step 2: Add "What is this?" section**

Add to `README.md` after Quick Start:

```markdown
## What is this?

This is a **client-side only** cryptographic key generator. All key generation happens in your browser using the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) and [OpenPGP.js](https://openpgpjs.org/).

**What this means:**
- ✅ Your keys never leave your browser
- ✅ No server to trust or compromise
- ✅ Works offline after first load
- ✅ Open source - audit the code yourself
```

- [ ] **Step 3: Add algorithm comparison section**

Add to `README.md`:

```markdown
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
```

- [ ] **Step 4: Add code examples section**

Add to `README.md`:

```markdown
## Code Examples

### Generate RSA-4096 Key Pair

```bash
# Using the tool
1. Visit https://crypto-gen.kern.web.za
2. Select "Encryption & Signing"
3. Choose "RSA-OAEP-SHA-256-4096"
4. Click "Generate Key"
5. Copy keys to clipboard
```

### Integrate with Your App

```javascript
// Coming soon: API access
// For now, embed the tool in your site:
<iframe src="https://crypto-gen.kern.web.za/embed/rsa"></iframe>
```

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs(readme): enhance README with SEO structure and comparisons"
```

---

# PHASE 2: App-Integrated SEO Content (Weeks 2-3)

## Task 7: Configure Vite for multi-page routing

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Read current vite.config.ts**

Run: `cat vite.config.ts`

Current content shows:
```typescript
base: '/',
build: {
  rollupOptions: {
    output: {
      manualChunks(id) { /* ... */ }
    }
  }
}
```

- [ ] **Step 2: Add build.rollupOptions.input to configure page routing**

Modify `vite.config.ts`, add to `build` configuration:

```typescript
build: {
  rollupOptions: {
    input: {
      main: resolve(__dirname, 'index.html'),
      why: resolve(__dirname, 'src/pages/Why.tsx'),
      about: resolve(__dirname, 'src/pages/About.tsx'),
    },
    output: {
      entryFileNames: '[name].js',
      chunkFileNames: '[name].js',
      assetFileNames: '[name].[ext]'
    }
  }
}
```

- [ ] **Step 3: Run build to verify configuration**

Run: `npm run build`
Expected: Build succeeds with `main.js`, `why.js`, `about.js` in dist

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts
git commit -m "feat(build): configure multi-page routing for SEO pages"
```

---

## Task 8: Create useSeo hook for dynamic meta tags

**Files:**
- Create: `src/hooks/useSeo.ts`

- [ ] **Step 1: Create SEO hook**

Create `src/hooks/useSeo.ts`:

```typescript
import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  path: string;
}

export function useSeo({ title, description, path }: SeoProps) {
  useEffect(() => {
    // Set page title
    document.title = title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Update OpenGraph URL
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', `https://crypto-gen.kern.web.za${path}`);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://crypto-gen.kern.web.za${path}`);
  }, [title, description, path]);
}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useSeo.ts
git commit -m "feat(seo): add dynamic SEO hook for meta tags"
```

---

## Task 9: Create "Why?" educational page

**Files:**
- Create: `src/pages/Why.tsx`

- [ ] **Step 1: Create Why page component**

Create `src/pages/Why.tsx`:

```typescript
import { useEffect } from 'react';
import { useSeo } from '../hooks/useSeo';

export default function WhyPage() {
  useSeo({
    title: 'Why Client-Side Cryptography? | Crypto Key Generator',
    description: 'Learn why client-side key generation is secure, private, and the right choice for modern applications.',
    path: '/why'
  });

  return (
    <div className="min-h-screen bg-brand-dark text-gray-200 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-brand-primary mb-8">
          Why Client-Side Cryptography?
        </h1>

        {/* Section 1: Zero Server Trust */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-brand-secondary mb-4">
            🔒 Zero Server Trust
          </h2>
          <p className="text-lg mb-4">
            Traditional key generators run on servers. You send them your email, they generate keys, and email them back.
            This means:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
            <li>The server sees your keys (or could keep logs)</li>
            <li>The server could be compromised at any time</li>
            <li>You're trusting their security practices</li>
            <li>Your keys traverse the internet unencrypted</li>
          </ul>
          <p className="text-lg mt-4">
            <strong className="text-brand-primary">With client-side generation:</strong>
            Your keys are created in your browser using the Web Crypto API. They never leave your device.
            No server. No logs. No trust required.
          </p>
        </section>

        {/* Section 2: How It Works */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-brand-secondary mb-4">
            ⚙️ How It Works
          </h2>
          <div className="bg-gray-800 rounded-lg p-6 mb-4">
            <pre className="text-sm text-gray-300 overflow-x-auto">
{`┌─────────────────┐    ┌──────────────────┐
│  Your Browser   │    │   This Tool       │
│                  │    │                   │
│  Generate Key    │───>│  Web Crypto API   │
│                  │    │                   │
│  Private Key     │<───│  (No data sent!)  │
│                  │    │                   │
└─────────────────┘    └──────────────────┘
         │                       │
         └───────────────────────┘
              (No server communication)`}
            </pre>
          </div>
          <p className="text-lg text-gray-300">
            All cryptographic operations use the <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API" 
            className="text-brand-primary hover:underline" target="_blank">Web Crypto API</a>, 
            a military-grade cryptographic standard built into modern browsers.
          </p>
        </section>

        {/* Section 3: Algorithm Comparison */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-brand-secondary mb-4">
            🔑 Choosing the Right Algorithm
          </h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3 text-left">Algorithm</th>
                <th className="p-3 text-left">Speed</th>
                <th className="p-3 text-left">Security</th>
                <th className="p-3 text-left">Best For</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800">
                <td className="p-3"><strong>Ed25519</strong></td>
                <td className="p-3">⚡ Fastest</td>
                <td className="p-3">🟢 Modern</td>
                <td className="p-3">SSH keys, modern apps</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="p-3"><strong>ECDSA P-256</strong></td>
                <td className="p-3">⚡ Fast</td>
                <td className="p-3">🟢 Strong</td>
                <td className="p-3">Certificates, signatures</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="p-3"><strong>RSA-4096</strong></td>
                <td className="p-3">⏳ Slower</td>
                <td className="p-3">🔵 Future-proof</td>
                <td className="p-3">Maximum security</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Section 4: Security Architecture */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-brand-secondary mb-4">
            🛡️ Security Architecture
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-brand-primary mb-3">Content Security Policy</h3>
              <p className="text-gray-300 mb-2">
                Strict CSP meta tag prevents XSS attacks:
              </p>
              <code className="text-sm text-gray-400 block">
                default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
              </code>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-brand-primary mb-3">HTTPS Only</h3>
              <p className="text-gray-300 mb-2">
                Enforced HTTPS ensures secure delivery of the application code.
              </p>
              <p className="text-sm text-gray-400">
                Web Crypto API only works on secure origins.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-brand-primary mb-3">OpenPGP.js Lazy Loading</h3>
              <p className="text-gray-300 mb-2">
                PGP library loads only when needed, reducing initial bundle size.
              </p>
              <p className="text-sm text-gray-400">
                Other algorithms load instantly using native Web Crypto API.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-brand-primary mb-3">Memory Leak Prevention</h3>
              <p className="text-gray-300 mb-2">
                All setTimeout and URL.createObjectURL operations are properly cleaned up.
              </p>
              <p className="text-sm text-gray-400">
                No sensitive data remains in browser memory after operations.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Ready to generate secure keys?
          </h2>
          <a 
            href="/"
            className="inline-block bg-brand-primary text-white px-8 py-3 rounded-md font-semibold hover:bg-brand-primary/90 transition"
          >
            Generate Keys Now →
          </a>
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add route export to vite.config.ts**

Modify `vite.config.ts` in the input object:
```typescript
why: resolve(__dirname, 'src/pages/Why.tsx'),
```

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/pages/Why.tsx vite.config.ts
git commit -m "feat(seo): add educational 'Why?' page with SEO optimization"
```

---

## Task 10: Enhance homepage with quick-start cards

**Files:**
- Modify: `src/pages/index.tsx`

- [ ] **Step 1: Read current index.tsx structure**

Run: `head -100 src/pages/index.tsx`

Understand the current component structure.

- [ ] **Step 2: Add "What keys do you need?" section above generator**

Add after imports, before main component:

```typescript
// Quick Start Cards Component
const QuickStartCards: React.FC = () => {
  const cards = [
    {
      icon: '🖥️',
      title: 'SSH Keys',
      description: 'Server access & Git authentication',
      algorithm: 'RSA-4096-SSH'
    },
    {
      icon: '🔐',
      title: 'PGP Keys',
      description: 'Email encryption & file signing',
      algorithm: 'PGP-ECC-curve25519'
    },
    {
      icon: '🔒',
      title: 'TLS/HTTPS',
      description: 'Certificates & web security',
      algorithm: 'RSA-4096'
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <button
          key={index}
          onClick={() => {
            // Navigate and select algorithm
            window.location.href = `/?algorithm=${encodeURIComponent(card.algorithm)}`;
          }}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-6 text-left transition"
        >
          <div className="text-3xl mb-3">{card.icon}</div>
          <h3 className="text-lg font-semibold text-gray-200 mb-2">{card.title}</h3>
          <p className="text-gray-400 text-sm mb-4">{card.description}</p>
          <span className="text-brand-primary text-sm font-medium">
            Generate →
          </span>
        </button>
      ))}
    </div>
  );
};
```

- [ ] **Step 3: Add QuickStartCards to main component**

In the main App component, add above the tab content:
```typescript
<QuickStartCards />
```

- [ ] **Step 4: Add educational resources section at bottom**

Add before closing `</div>` of main container:
```typescript
{/* Educational Resources */}
<section className="mt-16 pt-8 border-t border-gray-800">
  <h2 className="text-2xl font-bold text-gray-200 mb-6 text-center">
    Learn About Cryptography
  </h2>
  <div className="grid md:grid-cols-3 gap-6">
    <a href="/why" className="block bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-6 transition">
      <h3 className="text-lg font-semibold text-brand-primary mb-2">Why Client-Side Crypto?</h3>
      <p className="text-gray-400 text-sm">Understanding the security benefits of browser-based key generation.</p>
    </a>
    <a href="/why" className="block bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-6 transition">
      <h3 className="text-lg font-semibold text-brand-primary mb-2">Algorithm Comparison</h3>
      <p className="text-gray-400 text-sm">RSA vs ECC vs Ed25519 — when to use each algorithm.</p>
    </a>
    <a href="https://github.com/ZeroClue/cryptographic-key-generator" target="_blank" rel="noopener" className="block bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-6 transition">
      <h3 className="text-lg font-semibold text-brand-primary mb-2">Documentation</h3>
      <p className="text-gray-400 text-sm">Integration examples, security best practices, and more.</p>
    </a>
  </div>
</section>
```

- [ ] **Step 5: Run build and test**

Run: `npm run build && npm run preview &`
Expected: Pages load correctly, cards navigate to generator

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.tsx
git commit -m "feat(ux): add quick-start cards and educational resources to homepage"
```

---

# PHASE 3: Quick Wins - User Delight (Week 4)

## Task 11: Add skeleton loading screens

**Files:**
- Create: `src/components/Loading/KeyOutputSkeleton.tsx`

- [ ] **Step 1: Create skeleton component**

Create `src/components/Loading/KeyOutputSkeleton.tsx`:

```typescript
import React from 'react';

export const KeyOutputSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-1/4 mb-2"></div>
      <div className="bg-brand-dark rounded-md shadow-inner min-h-[12rem] border border-gray-700 p-4">
        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
      <div className="h-4 bg-gray-700 rounded w-1/4"></div>
    </div>
  );
};
```

- [ ] **Step 2: Add progress indicator component**

Create `src/components/Loading/GenerationProgress.tsx`:

```typescript
import React from 'react';

interface GenerationProgressProps {
  algorithm: string;
  progress: number; // 0-100
  estimatedSeconds?: number;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({ 
  algorithm, 
  progress, 
  estimatedSeconds 
}) => {
  const getAlgorithmType = (alg: string): string => {
    if (alg.startsWith('PGP')) return 'PGP';
    if (alg.startsWith('RSA') && alg.includes('4096')) return 'RSA-4096';
    if (alg.startsWith('RSA')) return 'RSA';
    return 'Key';
  };

  return (
    <div className="bg-brand-dark rounded-md p-4 border border-gray-700 mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-300">
          Generating {getAlgorithmType(algorithm)} key...
        </span>
        {estimatedSeconds && (
          <span className="text-xs text-gray-500">
            ~{estimatedSeconds}s remaining
          </span>
        )}
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className="bg-brand-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%`}}
        ></div>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Use skeleton in KeyGenerator**

Modify `src/components/KeyGenerator.tsx`:

Import the skeleton:
```typescript
import { KeyOutputSkeleton } from '../components/Loading/KeyOutputSkeleton';
```

Replace the loading spinner in KeyOutput component:
```typescript
{isLoading && <KeyOutputSkeleton />}
```

- [ ] **Step 4: Add progress indicator for slow operations**

For PGP key generation, add progress tracking. Modify the generateKey function to emit progress events.

- [ ] **Step 5: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/components/Loading/ src/components/KeyGenerator.tsx
git commit - "feat(ux): add skeleton loading screens and progress indicators"
```

---

## Task 12: Add educational tooltips

**Files:**
- Create: `src/components/Tooltips/AlgorithmTooltip.tsx`
- Modify: `package.json`
- Modify: `src/components/KeyGenerator.tsx`

- [ ] **Step 1: Install tooltip library**

```bash
npm install react-tooltip
```

- [ ] **Step 2: Create tooltip component**

Create `src/components/Tooltips/AlgorithmTooltip.tsx`:

```typescript
import React, { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

interface AlgorithmTooltipProps {
  term: string;
  children: React.ReactNode;
}

export const AlgorithmTooltip: React.FC<AlgorithmTooltipProps> = ({ term, children }) => {
  const [content] = useState('');

  const loadContent = async () => {
    switch(term) {
      case 'RSA-OAEP':
        content = `
          <strong>RSA-OAEP</strong><br/>
          RSA encryption with Optimal Asymmetric Encryption Padding.<br/>
          <em>Use for:</em> Encrypting data, secure communication.<br/>
          <a href="/why#algorithms" target="_blank">Learn more →</a>
        `;
        break;
      case 'Curve25519':
        content = `
          <strong>Curve25519</strong><br/>
          Modern elliptic curve for key exchange.<br/>
          <em>Use for:</em> SSH keys, key agreement protocols.<br/>
          <a href="/why#algorithms" target="_blank">Learn more →</a>
        `;
        break;
      case '4096-bit':
        content = `
          <strong>4096-bit keys</strong><br/>
          Larger key size = more secure but slower.<br/>
          <em>Recommended for:</em> High-security applications, future-proofing.<br/>
          <a href="/why#key-size" target="_blank">Learn more →</a>
        `;
        break;
      default:
        content = term;
    }
  };

  return (
    <Tooltip 
      place="top" 
      effect="solid"
      html={true}
      delayShow={200}
    >
      <span 
        onMouseEnter={() => loadContent()}
        className="border-b border-dashed border-gray-600 cursor-help"
      >
        {children}
      </span>
    </Tooltip>
  );
};
```

- [ ] **Step 3: Add tooltips to algorithm select**

Modify `src/components/KeyGenerator.tsx`:

Import:
```typescript
import { AlgorithmTooltip } from '../components/Tooltips/AlgorithmTooltip';
```

Wrap algorithm names in tooltips:
```typescript
<AlgorithmTooltip term={selectedAlgorithm}>
  {selectedAlgorithmInfo?.name || selectedAlgorithm}
</AlgorithmTooltip>
```

- [ ] **Step 4: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/components/Tooltips/ src/components/KeyGenerator.tsx
git commit -m "feat(ux): add educational tooltips for algorithms"
```

---

## Task 13: Add session-based key history

**Files:**
- Create: `src/utils/keyHistory.ts`
- Create: `src/components/KeyHistory/KeyHistoryDropdown.tsx`
- Modify: `src/components/KeyGenerator.tsx`

- [ ] **Step 1: Create key history utility**

Create `src/utils/keyHistory.ts`:

```typescript
interface KeyHistoryItem {
  id: string;
  timestamp: number;
  algorithm: string;
  keyType: 'public' | 'private' | 'symmetric';
  preview: string;
}

const MAX_HISTORY = 5;
const STORAGE_KEY = 'crypto-key-history';

export function addToHistory(algorithm: string, keyType: 'public' | 'private' | 'symmetric', preview: string) {
  if (typeof window === 'undefined') return;
  
  const history = getHistory();
  const newItem: KeyHistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    algorithm,
    keyType,
    preview: preview.substring(0, 50) + (preview.length > 50 ? '...' : '')
  };
  
  const newHistory = [newItem, ...history].slice(0, MAX_HISTORY);
  
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  } catch (e) {
    // SessionStorage might be full or disabled
    console.warn('Could not save key history:', e);
  }
}

export function getHistory(): KeyHistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}
```

- [ ] **Step 2: Create history dropdown component**

Create `src/components/KeyHistory/KeyHistoryDropdown.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { getHistory, formatTimestamp } from '../../utils/keyHistory';
import { CopyIcon } from '../icons';

interface HistoryItem {
  id: string;
  timestamp: number;
  algorithm: string;
  keyType: string;
  preview: string;
}

export const KeyHistoryDropdown: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  if (history.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 border border-gray-700 rounded-md hover:bg-gray-800 transition"
      >
        <span>📜 Recent Keys</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-2">
            {history.map((item) => (
              <div 
                key={item.id}
                className="p-3 hover:bg-gray-700 rounded cursor-pointer border-b border-gray-700 last:border-0"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-gray-200">{item.algorithm}</span>
                  <span className="text-xs text-gray-500">{formatTimestamp(item.timestamp)}</span>
                </div>
                <code className="text-xs text-gray-400 font-mono block truncate">{item.preview}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 3: Integrate history into KeyGenerator**

Modify `src/components/KeyGenerator.tsx`:

Import and use:
```typescript
import { addToHistory } from '../utils/keyHistory';
import { KeyHistoryDropdown } from '../components/KeyHistory/KeyHistoryDropdown';

// In handleGenerateKey success callback:
addToHistory(selectedAlgorithm, 'private', privateKeyPreview);

// In the component JSX, add near the top:
<KeyHistoryDropdown />
```

- [ ] **Step 4: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/utils/keyHistory.ts src/components/KeyHistory/ src/components/KeyGenerator.tsx
git commit -m "feat(ux): add session-based key history with quick re-copy"
```

---

## Task 14: Enhance copy feedback with visual indicators

**Files:**
- Modify: `src/components/KeyGenerator.tsx`

- [ ] **Step 1: Add enhanced copy button component**

Create a reusable copy button component in `src/components/CopyButton.tsx`:

```typescript
import React, { useState, useCallback } from 'react';
import { CopyIcon, CheckIcon } from './icons';

interface CopyButtonProps {
  content: string;
  label?: string;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ 
  content, 
  label = 'Copy to clipboard',
  className = ''
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleCopy = useCallback(async () => {
    if (isCopied) return;

    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setShowFeedback(true);

      setTimeout(() => {
        setIsCopied(false);
        setTimeout(() => setShowFeedback(false), 200);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [content, isCopied]);

  return (
    <button
      onClick={handleCopy}
      disabled={isCopied}
      aria-label={isCopied ? 'Copied!' : label}
      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
        isCopied 
          ? 'bg-green-500 text-white cursor-default' 
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      } ${className}`}
    >
      {isCopied ? (
        <>
          <CheckIcon className="w-4 h-4" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <CopyIcon className="w-4 h-4" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};
```

- [ ] **Step 2: Add individual copy buttons for each field**

Update KeyOutput component to have separate copy buttons:
- Public key
- Private key
- SSH public key
- Fingerprint (if applicable)
- Command-line equivalent

- [ ] **Step 3: Add keyboard shortcut feedback**

Add a listener for Ctrl/Cmd + C:
```typescript
useEffect(() => {
  const handleCopy = () => {
    setShowKeyboardCopyFeedback(true);
    setTimeout(() => setShowKeyboardCopyFeedback(false), 2000);
  };

  document.addEventListener('copy', handleCopy);
  return () => document.removeEventListener('copy', handleCopy);
}, []);
```

- [ ] **Step 4: Commit**

```bash
git add src/components/CopyButton.tsx src/components/KeyGenerator.tsx
git commit -m "feat(ux): enhance copy buttons with visual feedback and keyboard shortcuts"
```

---

## Task 15: Improve error messages with actionable guidance

**Files:**
- Modify: `src/components/KeyGenerator.tsx`

- [ ] **Step 1: Create error message component**

Create `src/components/ErrorMessage.tsx`:

```typescript
import React from 'react';
import { ErrorIcon } from './icons';

interface ErrorMessageProps {
  title: string;
  message: string;
  suggestions: string[];
  onCopyError?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  title, 
  message, 
  suggestions,
  onCopyError 
}) => {
  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="text-red-400 flex-shrink-0">
          <ErrorIcon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-400 mb-2">{title}</h3>
          <p className="text-red-300 mb-4">{message}</p>
          
          {suggestions.length > 0 && (
            <>
              <p className="text-sm text-red-200 mb-2">Try instead:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300 ml-4">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </>
          )}
          
          {onCopyError && (
            <button
              onClick={onCopyError}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm font-medium transition"
            >
              Copy error to clipboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Enhance error handling in KeyGenerator**

Update error handling to use ErrorMessage component with:
- Browser compatibility detection
- Alternative algorithm suggestions
- Clear explanation of what went wrong

- [ ] **Step 3: Commit**

```bash
git add src/components/ErrorMessage.tsx src/components/KeyGenerator.tsx
git commit -m "feat(ux): improve error messages with actionable suggestions and copy-to-clipboard"
```

---

# FINAL TASKS

## Task 16: Run final verification and create summary

- [ ] **Step 1: Run full test suite**

```bash
npm run test:unit -- --run
npm run test
```

Expected: All tests pass

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: Build succeeds, 3 pages generated (main, why, about)

- [ ] **Step 3: Verify SEO tags**

Check `dist/index.html` includes meta tags.

- [ ] **Step 4: Create summary document**

Create `docs/DISCOVERABILITY-IMPLEMENTATION-SUMMARY.md`:

```markdown
# Discoverability & UX Improvements - Implementation Summary

## Completed Features

### GitHub Optimization
- Repository metadata with SEO topics
- Issue and PR templates
- CI workflow with badges
- Social preview image
- Enhanced README with algorithm comparison

### SEO Content
- Educational "Why?" page
- Enhanced homepage with quick-start cards
- Dynamic SEO meta tags via useSeo hook
- Educational resources section

### UX Improvements
- Skeleton loading screens
- Progress indicators for slow operations
- Educational tooltips for algorithms
- Session-based key history
- Enhanced copy feedback with visual indicators
- Improved error messages with actionable guidance

## Metrics to Track

- GitHub stars growth
- Organic traffic from search
- Time on site
- Bounce rate
- Keys generated per session
- Return visitor rate
```

- [ ] **Step 5: Commit summary document**

```bash
git add docs/DISCOVERABILITY-IMPLEMENTATION-SUMMARY.md
git commit -m "docs: add discoverability implementation summary"
```

- [ ] **Step 6: Create release tag**

```bash
git tag v2.1.0 -a "Release: Discoverability & User Experience improvements"
git push origin main --tags
```

---

**Total estimated time:** 4 weeks

**Summary:** 16 tasks across 3 phases covering GitHub optimization, SEO content creation, and UX quick wins. All frontend changes with zero backend complexity.
