// Polyfill btoa and atob for jsdom environment
if (typeof globalThis.btoa !== 'function') {
  globalThis.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
}

if (typeof globalThis.atob !== 'function') {
  globalThis.atob = (b64: string) => Buffer.from(b64, 'base64').toString('binary');
}

// Add to window for jsdom environment
if (typeof window !== 'undefined') {
  if (typeof (window as any).btoa !== 'function') {
    (window as any).btoa = globalThis.btoa;
  }
  if (typeof (window as any).atob !== 'function') {
    (window as any).atob = globalThis.atob;
  }
}
