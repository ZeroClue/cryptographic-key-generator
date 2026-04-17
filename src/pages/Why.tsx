import React from 'react';
import { useSeo } from '../hooks/useSeo';

const WhyPage: React.FC = () => {
  useSeo({
    title: 'Why Client-Side Cryptography? | Crypto Key Generator',
    description: 'Learn why client-side key generation is secure, private, and the right choice for modern applications.',
    path: '/why'
  });

  return (
    <div className="min-h-screen bg-brand-dark text-brand-light">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-primary mb-6">
            Why Client-Side Cryptography?
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover why generating keys in your browser is the most secure approach for modern cryptography
          </p>
        </div>

        {/* Zero Server Trust Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🔒</span>
            <h2 className="text-3xl font-bold text-brand-secondary">
              Zero Server Trust Required
            </h2>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 mb-6 border border-gray-700">
            <p className="text-lg text-gray-200 mb-4">
              Traditional key generators run on servers. You send them your requirements, they generate keys, and send them back. This approach has serious security implications:
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">⚠️</span>
                <span>The server sees your keys (or could keep logs)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">⚠️</span>
                <span>The server could be compromised at any time</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">⚠️</span>
                <span>You're trusting their security practices</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 text-xl">⚠️</span>
                <span>Your keys traverse the internet unencrypted</span>
              </li>
            </ul>
          </div>

          <div className="bg-brand-primary/10 rounded-lg p-6 border-2 border-brand-primary">
            <p className="text-lg text-gray-200">
              <strong className="text-brand-primary font-semibold">With client-side generation:</strong> Your keys are created in your browser using the Web Crypto API. They never leave your device. No server. No logs. No trust required.
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">⚙️</span>
            <h2 className="text-3xl font-bold text-brand-secondary">
              How It Works
            </h2>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700 overflow-x-auto">
            <pre className="text-sm text-gray-300 font-mono whitespace-pre">
{`┌─────────────────┐    ┌──────────────────┐
│  Your Browser   │    │   This Tool       │
│                  │    │                   │
│  Generate Key   │───>│  Web Crypto API   │
│                  │    │                   │
│  Private Key    │<───│  (No data sent!)  │
│  Public Key     │<───│                   │
│                  │    │                   │
└─────────────────┘    └──────────────────┘
         │                       │
         └───────────────────────┘
              (No server communication)`}
            </pre>
          </div>

          <p className="text-lg text-gray-300 leading-relaxed">
            All cryptographic operations use the{' '}
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API"
              className="text-brand-primary hover:underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              Web Crypto API
            </a>
            , a military-grade cryptographic standard built into modern browsers. This means:
          </p>
          <ul className="mt-4 space-y-2 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <span>Keys are generated using hardware-accelerated cryptography</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <span>All operations happen locally in your browser's secure context</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <span>Works offline after the initial page load</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 text-xl">✓</span>
              <span>Open source - audit the code yourself on GitHub</span>
            </li>
          </ul>
        </section>

        {/* Algorithm Comparison Table */}
        <section className="mb-16" id="algorithms">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🔑</span>
            <h2 className="text-3xl font-bold text-brand-secondary">
              Choosing the Right Algorithm
            </h2>
          </div>

          <p className="text-lg text-gray-300 mb-6">
            Different algorithms serve different purposes. Here's how to choose the right one for your needs:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-700">
                  <th className="p-4 text-left text-brand-primary font-semibold">Algorithm</th>
                  <th className="p-4 text-left text-brand-primary font-semibold">Speed</th>
                  <th className="p-4 text-left text-brand-primary font-semibold">Security</th>
                  <th className="p-4 text-left text-brand-primary font-semibold">Best For</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-brand-primary font-semibold">Ed25519</span>
                      <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">Recommended</span>
                    </div>
                  </td>
                  <td className="p-4">⚡ Fastest</td>
                  <td className="p-4">🟢 Modern</td>
                  <td className="p-4 text-gray-300">SSH keys, modern apps</td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                  <td className="p-4">
                    <span className="text-brand-primary font-semibold">X25519</span>
                  </td>
                  <td className="p-4">⚡ Fastest</td>
                  <td className="p-4">🟢 Modern</td>
                  <td className="p-4 text-gray-300">Key exchange</td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                  <td className="p-4">
                    <span className="text-brand-primary font-semibold">ECDSA P-256</span>
                  </td>
                  <td className="p-4">⚡ Fast</td>
                  <td className="p-4">🟢 Strong</td>
                  <td className="p-4 text-gray-300">Certificates, signatures</td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                  <td className="p-4">
                    <span className="text-brand-primary font-semibold">RSA-2048</span>
                  </td>
                  <td className="p-4">⏳ Slow</td>
                  <td className="p-4">🔵 Proven</td>
                  <td className="p-4 text-gray-300">General encryption, certificates</td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                  <td className="p-4">
                    <span className="text-brand-primary font-semibold">RSA-4096</span>
                  </td>
                  <td className="p-4">⏳ Slower</td>
                  <td className="p-4">🔵 Future-proof</td>
                  <td className="p-4 text-gray-300">Maximum security</td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                  <td className="p-4">
                    <span className="text-brand-primary font-semibold">AES-256-GCM</span>
                  </td>
                  <td className="p-4">⚡ Fastest</td>
                  <td className="p-4">🟢 Strong</td>
                  <td className="p-4 text-gray-300">File encryption, data at rest</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <p className="text-sm text-gray-300">
              <strong className="text-brand-primary">💡 Pro tip:</strong> For new projects, prefer Ed25519 for SSH keys and signatures, X25519 for key exchange, and AES-256-GCM for encryption. These modern algorithms offer better security and performance than RSA.
            </p>
          </div>
        </section>

        {/* Security Architecture Section */}
        <section className="mb-16" id="security">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🛡️</span>
            <h2 className="text-3xl font-bold text-brand-secondary">
              Security Architecture
            </h2>
          </div>

          <p className="text-lg text-gray-300 mb-6">
            This tool is built with defense-in-depth principles. Every layer is designed to protect your keys:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1: Content Security Policy */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-brand-primary transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-brand-primary text-xl">🔐</span>
                </div>
                <h3 className="text-lg font-semibold text-brand-primary">Content Security Policy</h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Strict CSP meta tag prevents XSS attacks by restricting what resources can be loaded:
              </p>
              <code className="text-xs text-gray-400 block bg-gray-900 p-3 rounded font-mono">
                default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
              </code>
            </div>

            {/* Card 2: HTTPS Only */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-brand-primary transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-brand-primary text-xl">🔒</span>
                </div>
                <h3 className="text-lg font-semibold text-brand-primary">HTTPS Only</h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Enforced HTTPS ensures secure delivery of the application code. The Web Crypto API only works on secure origins (HTTPS or localhost).
              </p>
              <p className="text-xs text-gray-400">
                This prevents man-in-the-middle attacks during initial page load.
              </p>
            </div>

            {/* Card 3: OpenPGP.js Lazy Loading */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-brand-primary transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-brand-primary text-xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold text-brand-primary">OpenPGP.js Lazy Loading</h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                PGP library loads only when needed, reducing initial bundle size and attack surface.
              </p>
              <p className="text-xs text-gray-400">
                Other algorithms load instantly using native Web Crypto API. PGP is the only feature requiring external code.
              </p>
            </div>

            {/* Card 4: Memory Leak Prevention */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-brand-primary transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-brand-primary text-xl">🧹</span>
                </div>
                <h3 className="text-lg font-semibold text-brand-primary">Memory Leak Prevention</h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                All setTimeout and URL.createObjectURL operations are properly cleaned up after use.
              </p>
              <p className="text-xs text-gray-400">
                No sensitive data remains in browser memory after cryptographic operations complete.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">💼</span>
            <h2 className="text-3xl font-bold text-brand-secondary">
              Common Use Cases
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl mb-4">🖥️</div>
              <h3 className="text-lg font-semibold text-brand-primary mb-3">SSH Keys</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Server access authentication</li>
                <li>• Git hosting (GitHub/GitLab)</li>
                <li>• Automation & scripting</li>
                <li>• Passwordless login</li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl mb-4">📧</div>
              <h3 className="text-lg font-semibold text-brand-primary mb-3">PGP Keys</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Email encryption</li>
                <li>• File signing</li>
                <li>• Identity verification</li>
                <li>• Secure messaging</li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl mb-4">🔐</div>
              <h3 className="text-lg font-semibold text-brand-primary mb-3">RSA/ECC Keys</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• TLS certificates</li>
                <li>• Document signing</li>
                <li>• OAuth tokens</li>
                <li>• JWT signing</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-lg border border-brand-primary/30">
          <h2 className="text-3xl font-bold text-brand-primary mb-4">
            Ready to Generate Secure Keys?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Start generating cryptographic keys in your browser. No registration, no data transmission, complete privacy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/"
              className="inline-block bg-brand-primary text-brand-dark px-8 py-4 rounded-md font-bold text-lg hover:bg-brand-primary/90 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Generate Keys Now →
            </a>
            <a
              href="https://github.com/ZeroClue/cryptographic-key-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gray-700 text-white px-8 py-4 rounded-md font-semibold text-lg hover:bg-gray-600 transition border border-gray-600"
            >
              View on GitHub
            </a>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="mt-16 pt-8 border-t border-gray-700">
          <h2 className="text-2xl font-bold text-brand-secondary mb-6 text-center">
            Learn More About Cryptography
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-6 transition group"
            >
              <h3 className="text-lg font-semibold text-brand-primary mb-2 group-hover:underline">
                Web Crypto API Documentation →
              </h3>
              <p className="text-gray-400 text-sm">
                Official MDN documentation for the Web Cryptography API
              </p>
            </a>
            <a
              href="https://github.com/ZeroClue/cryptographic-key-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-6 transition group"
            >
              <h3 className="text-lg font-semibold text-brand-primary mb-2 group-hover:underline">
                Source Code on GitHub →
              </h3>
              <p className="text-gray-400 text-sm">
                Review the code, contribute, or deploy your own instance
              </p>
            </a>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-gray-500">
          <p>All cryptographic operations are performed securely in your browser using the Web Crypto API.</p>
          <p className="mt-2">Your keys and data are never stored or transmitted.</p>
        </div>
      </footer>
    </div>
  );
};

export default WhyPage;