# Deployment Guide

This document describes how to build and deploy the Cryptographic Key Generator application.

## Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher
- **Git**: For cloning the repository

## Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ZeroClue/cryptographic-key-generator.git
cd cryptographic-key-generator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Production Build

### 1. Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### 2. Preview Production Build

```bash
npm run preview
```

This serves the production build locally at `http://localhost:4173`

### 3. Run Type Checking

```bash
npx tsc --noEmit
```

This checks TypeScript types without generating output files.

### 4. Run Tests

```bash
# Run all Playwright E2E tests
npm run test

# Run Vitest unit tests
npm run test:unit

# Run Playwright with UI
npm run test:ui
```

### 5. Run Security Audit

```bash
npm audit
```

## Deployment Options

### GitHub Pages

The application can be deployed to GitHub Pages as a static site.

#### Using GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### Manual Deployment

```bash
# Build the application
npm run build

# Checkout the gh-pages branch
git checkout gh-pages

# Remove old files (except .git)
git rm -rf .
git checkout main -- .git

# Copy new build
cp -r dist/* .
cp -r dist/.* . 2>/dev/null || true

# Commit and push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

### Netlify

1. **Connect your repository** to Netlify
2. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Deploy**: Netlify will automatically deploy on push to main branch

### Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Configure**:
   - Build command: `npm run build`
   - Output directory: `dist`

### Static Hosting

The `dist/` folder can be deployed to any static hosting service:

- **AWS S3 + CloudFront**
- **Azure Static Web Apps**
- **Google Firebase Hosting**
- **Any web server** (Apache, Nginx, Caddy)

Simply upload the contents of `dist/` to your web server's document root.

## Environment Configuration

### Base Path

If deploying to a subdirectory (e.g., `https://example.com/crypto-tool/`), update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/crypto-tool/',
  // ...
});
```

### HTTPS

**Always use HTTPS in production.** Cryptographic applications require HTTPS to:

- Ensure secure delivery of the application code
- Enable Web Crypto API (some browsers block crypto on non-secure origins)
- Protect against man-in-the-middle attacks

Most hosting providers provide free SSL/TLS certificates:
- GitHub Pages: Automatic HTTPS
- Netlify: Automatic HTTPS with Let's Encrypt
- Vercel: Automatic HTTPS
- Cloudflare: Automatic HTTPS

## Performance Optimization

### Build Output

The production build creates:

- **HTML**: `index.html` (0.87 kB)
- **CSS**: `*.css` (18 kB gzipped)
- **JavaScript**: 
  - `vendor-*.js` (12 kB gzipped) - React and dependencies
  - `crypto-*.js` (394 kB gzipped) - Crypto modules
  - `index-*.js` (1,079 kB gzipped) - Application code

### Optimization Recommendations

The build shows a warning about large chunks (>500 kB). To optimize:

1. **Code splitting**: Split large modules into smaller chunks
2. **Manual chunks**: Configure `build.rollupOptions.output.manualChunks`
3. **Lazy loading**: Already implemented for OpenPGP.js
4. **Compression**: Ensure gzip/brotli is enabled on the server

### Server Configuration

Enable compression in your web server:

**Nginx:**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_min_length 1000;
```

**Apache:**
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>
```

## Monitoring and Maintenance

### Browser Compatibility

Test the application in target browsers:

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

### Update Dependencies

Regularly update dependencies:

```bash
npm update
npm audit fix
```

### Update Browserslist Data

```bash
npx update-browserslist-db@latest
```

## Troubleshooting

### Build Fails

- Check Node.js version: `node --version` (should be 18+)
- Clear cache: `rm -rf node_modules/.vite`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Tests Fail

- Ensure dev server is not running (or tests will fail to bind to port 5173)
- Install Playwright browsers: `npx playwright install`
- Check TypeScript types: `npx tsc --noEmit`

### Deployment Issues

- **404 errors**: Check `base` path in `vite.config.ts`
- **CORS errors**: Ensure CSP header is configured correctly
- **Crypto not working**: Ensure site is served over HTTPS

## Support

For issues or questions:
- GitHub Issues: https://github.com/ZeroClue/cryptographic-key-generator/issues
- Documentation: See `docs/` directory
- Security: See `docs/SECURITY.md`
