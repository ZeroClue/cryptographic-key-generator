// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks - React ecosystem
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }

          // OpenPGP library - already lazy-loaded but ensure separate chunk
          if (id.includes('node_modules/openpgp')) {
            return 'vendor-openpgp';
          }

          // zxcvbn password strength checker - only used in KeyGenerator
          if (id.includes('node_modules/zxcvbn')) {
            return 'vendor-zxcvbn';
          }

          // Crypto service modules - split by functionality
          if (id.includes('/src/services/crypto/')) {
            // Generators module
            if (id.includes('generators.ts')) {
              return 'crypto-generators';
            }
            // Importers module
            if (id.includes('importers.ts')) {
              return 'crypto-importers';
            }
            // Exporters module
            if (id.includes('exporters.ts')) {
              return 'crypto-exporters';
            }
            // Operations module (encrypt/decrypt/sign/verify)
            if (id.includes('operations.ts')) {
              return 'crypto-operations';
            }
            // Converters module (shared utilities)
            if (id.includes('converters.ts')) {
              return 'crypto-converters';
            }
            // Utils module
            if (id.includes('utils.ts')) {
              return 'crypto-utils';
            }
          }

          // UI components - split by tab for route-based chunking
          if (id.includes('/src/components/')) {
            if (id.includes('KeyGenerator.tsx')) {
              return 'component-key-generator';
            }
            if (id.includes('EncryptDecrypt.tsx')) {
              return 'component-encrypt-decrypt';
            }
            if (id.includes('SignVerify.tsx')) {
              return 'component-sign-verify';
            }
            // Shared components
            if (id.includes('SecurityWarningModal.tsx')) {
              return 'component-shared';
            }
            if (id.includes('KeyOutput.tsx')) {
              return 'component-shared';
            }
          }
        }
      }
    }
  }
});