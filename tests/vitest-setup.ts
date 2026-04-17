// Polyfill btoa and atob for jsdom environment
// This needs to be set up before any tests run

const btoaPolyfill = (str: string): string => {
  return Buffer.from(str, 'binary').toString('base64');
};

const atobPolyfill = (b64: string): string => {
  return Buffer.from(b64, 'base64').toString('binary');
};

// Set up polyfills that will work across all contexts
const setupPolyfills = () => {
  // Set up on global scope (Node.js environment)
  if (typeof global !== 'undefined') {
    (global as any).btoa = btoaPolyfill;
    (global as any).atob = atobPolyfill;
  }

  // Set up on globalThis
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).btoa = btoaPolyfill;
    (globalThis as any).atob = atobPolyfill;
  }

  // Set up on window (jsdom environment)
  if (typeof window !== 'undefined') {
    (window as any).btoa = btoaPolyfill;
    (window as any).atob = atobPolyfill;
  }
};

// Run polyfill setup immediately
setupPolyfills();

// Export for use in other setup files if needed
export { setupPolyfills };
