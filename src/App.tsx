import React, { useState, useEffect } from 'react';
import KeyGenerator from './components/KeyGenerator';
import EncryptDecrypt from './components/EncryptDecrypt';
import SignVerify from './components/SignVerify';
import { TABS } from './constants';
import type { SharedKeyInfo, KeyProperties } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(TABS.GENERATE);

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

  const renderActiveTab = () => {
    switch (activeTab) {
      case TABS.ENCRYPT_DECRYPT:
        return <EncryptDecrypt sharedKeyInfo={sharedKeyInfo} onClearSharedKey={clearSharedKey} />;
      case TABS.SIGN_VERIFY:
        return <SignVerify sharedKeyInfo={sharedKeyInfo} onClearSharedKey={clearSharedKey} />;
      case TABS.GENERATE:
      default:
        return <KeyGenerator onShareKey={handleKeyShare} />;
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
        {renderActiveTab()}
      </main>
      <footer className="w-full max-w-4xl mt-8 text-center text-sm text-gray-500">
        <p>All cryptographic operations are performed securely in your browser using the Web Crypto API.</p>
        <p>Your keys and data are never stored or transmitted.</p>
      </footer>
    </div>
  );
};

export default App;