import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Polyfill btoa and atob for jsdom environment
global.btoa = global.btoa || ((str: string) => Buffer.from(str, 'binary').toString('base64'));
global.atob = global.atob || ((b64: string) => Buffer.from(b64, 'base64').toString('binary'));

// Also add to window for consistency
if (typeof window !== 'undefined') {
  window.btoa = global.btoa as any;
  window.atob = global.atob as any;
}

afterEach(() => {
  cleanup();
});
