import React, { useState, useEffect } from 'react';
import KeyGenerator from './components/KeyGenerator';
import EncryptDecrypt from './components/EncryptDecrypt';
import SignVerify from './components/SignVerify';
import { TABS } from './constants';
import type { SharedKeyInfo, KeyProperties } from './types';

// Quick Start Card Component
interface QuickStartCard {
  id: string;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  targetAlgorithm: string;
  group: string;
}

const QuickStartCards: React.FC<{ setActiveTab: (tab: string) => void; onAlgorithmSelect: (algorithm: string) => void }> = ({ setActiveTab, onAlgorithmSelect }) => {
  const cards: QuickStartCard[] = [
    {
      id: 'ssh-keys',
      title: 'SSH Keys',
      description: 'Generate keys for secure server access',
      icon: ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      targetAlgorithm: 'SSH-ECDSA',
      group: 'SSH Authentication'
    },
    {
      id: 'pgp-keys',
      title: 'PGP Keys',
      description: 'Create keys for email and file encryption',
      icon: ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      targetAlgorithm: 'PGP-ECC-curve25519',
      group: 'PGP / GPG'
    },
    {
      id: 'tls-https',
      title: 'TLS/HTTPS',
      description: 'Generate keys for web server security',
      icon: ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      targetAlgorithm: 'RSA-OAEP-SHA-256',
      group: 'Asymmetric Encryption'
    }
  ];

  const handleCardClick = (algorithm: string) => {
    setActiveTab(TABS.GENERATE);
    onAlgorithmSelect(algorithm);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {cards.map((card) => (
        <button
          key={card.id}
          onClick={() => handleCardClick(card.targetAlgorithm)}
          className="bg-gray-700 border border-gray-600 rounded-lg p-6 hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-dark"
          aria-label={`Generate ${card.title}`}
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 p-3 bg-brand-primary bg-opacity-20 rounded-full">
              <card.icon className="w-8 h-8 text-brand-primary" />
            </div>
            <h3 className="text-xl font-bold text-brand-light mb-2">{card.title}</h3>
            <p className="text-gray-300 text-sm">{card.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

// Educational Resources Component
const EducationalResources: React.FC = () => {
  const resources = [
    {
      title: 'Why Cryptography Matters',
      description: 'Learn about the importance of secure key management',
      href: '/why'
    },
    {
      title: 'Algorithm Comparison',
      description: 'Compare different cryptographic algorithms',
      href: '/algorithms'
    },
    {
      title: 'Documentation',
      description: 'Complete technical documentation and API reference',
      href: '/docs'
    }
  ];

  return (
    <div className="mt-12 pt-8 border-t border-gray-700">
      <h2 className="text-2xl font-bold text-brand-light mb-6 text-center">Learn More</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <a
            key={resource.href}
            href={resource.href}
            className="bg-gray-700 border border-gray-600 rounded-lg p-6 hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-dark"
          >
            <h3 className="text-xl font-bold text-brand-light mb-2">{resource.title}</h3>
            <p className="text-gray-300 text-sm">{resource.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(TABS.GENERATE);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('');

  // Handle GitHub Pages routing for SPA
  useEffect(() => {
    const redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    if (redirect && redirect !== location.pathname) {
      window.history.replaceState(null, '', redirect);
    }
  }, []);
  const [sharedKeyInfo, setSharedKeyInfo] = useState<SharedKeyInfo | null>(null);

  const handleKeyShare = (key: string, target: string, properties: KeyProperties) => {
    setSharedKeyInfo({ key, target, properties });
    setActiveTab(target);
  };

  const clearSharedKey = () => {
    setSharedKeyInfo(null);
  };

  const handleAlgorithmSelect = (algorithm: string) => {
    setSelectedAlgorithm(algorithm);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case TABS.ENCRYPT_DECRYPT:
        return <EncryptDecrypt sharedKeyInfo={sharedKeyInfo} onClearSharedKey={clearSharedKey} />;
      case TABS.SIGN_VERIFY:
        return <SignVerify sharedKeyInfo={sharedKeyInfo} onClearSharedKey={clearSharedKey} />;
      case TABS.GENERATE:
      default:
        return <KeyGenerator onShareKey={handleKeyShare} selectedAlgorithm={selectedAlgorithm} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-brand-light flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <header className="w-full max-w-4xl mb-8">
        <div className="flex bg-brand-dark border border-gray-600 rounded-lg p-1 space-x-1">
          {Object.values(TABS).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 text-sm font-bold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-dark ${
                activeTab === tab
                  ? 'bg-brand-primary text-brand-dark'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              aria-pressed={activeTab === tab}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="w-full max-w-4xl">
        {/* Quick Start Cards - only show on Generate tab */}
        {activeTab === TABS.GENERATE && (
          <QuickStartCards setActiveTab={setActiveTab} onAlgorithmSelect={handleAlgorithmSelect} />
        )}

        {renderActiveTab()}
      </main>

      <footer className="w-full max-w-4xl mt-8 text-center text-sm text-gray-500">
        <p>All cryptographic operations are performed securely in your browser using the Web Crypto API.</p>
        <p>Your keys and data are never stored or transmitted.</p>
      </footer>

      {/* Educational Resources Section */}
      <EducationalResources />
    </div>
  );
};

export default App;