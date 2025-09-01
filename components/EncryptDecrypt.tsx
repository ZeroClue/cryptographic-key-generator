import React, { useState, useCallback, useEffect } from 'react';
import type { KeyProperties, SharedKeyInfo } from '../types';
import { importAndInspectKey, encrypt, decrypt, importKey } from '../services/cryptoService';
import { TABS } from '../constants';

const USAGE_DISPLAY_MAP: Record<string, string> = {
    'encrypt': 'Encrypt',
    'decrypt': 'Decrypt',
    'sign': 'Sign',
    'verify': 'Verify',
    'deriveKey': 'Derive Key',
    'deriveBits': 'Derive Bits',
    'wrapKey': 'Wrap Key',
    'unwrapKey': 'Unwrap Key',
};

const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a6 6 0 0110.257-4.257" />
    </svg>
);

const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

interface EncryptDecryptProps {
    sharedKeyInfo: SharedKeyInfo | null;
    onClearSharedKey: () => void;
}

const EncryptDecrypt: React.FC<EncryptDecryptProps> = ({ sharedKeyInfo, onClearSharedKey }) => {
  const [keyInput, setKeyInput] = useState<string>('');
  const [importedKey, setImportedKey] = useState<CryptoKey | any | null>(null);
  const [keyProperties, setKeyProperties] = useState<KeyProperties | null>(null);
  const [operation, setOperation] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [passphrase, setPassphrase] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingKey, setIsDraggingKey] = useState(false);
  const [isDraggingText, setIsDraggingText] = useState(false);


  const handleKeyImport = useCallback(async (keyToImport?: string) => {
    const keyData = keyToImport || keyInput;
    if (!keyData) {
      setError('Please paste a key to import.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setImportedKey(null);
    setKeyProperties(null);
    setOutputText('');
    setPassphrase('');
    try {
      const { key, props } = await importAndInspectKey(keyData);
      setImportedKey(key);
      setKeyProperties(props);
      // Automatically select operation based on key type
      if (props.type === 'public' || (props.usages.includes('encrypt') && !props.usages.includes('decrypt'))) {
        setOperation('encrypt');
      } else if (props.usages.includes('decrypt')) {
        setOperation('decrypt');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import key.');
    } finally {
      setIsLoading(false);
    }
  }, [keyInput]);

  useEffect(() => {
    const handleSharedKey = async () => {
        if (sharedKeyInfo?.target === TABS.ENCRYPT_DECRYPT && sharedKeyInfo.key) {
            setKeyInput(sharedKeyInfo.key);
            setKeyProperties(sharedKeyInfo.properties);
            
            // Auto-select operation based on shared properties
            const { usages, type } = sharedKeyInfo.properties;
            if (type === 'public' || (usages.includes('encrypt') && !usages.includes('decrypt'))) {
              setOperation('encrypt');
            } else if (usages.includes('decrypt')) {
              setOperation('decrypt');
            }

            setIsLoading(true);
            setError(null);
            try {
                const imported = await importKey(sharedKeyInfo.key);
                setImportedKey(imported);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to import shared key.');
                setKeyProperties(null); // Clear properties on error
            } finally {
                setIsLoading(false);
                onClearSharedKey();
            }
        }
    };
    handleSharedKey();
  }, [sharedKeyInfo, onClearSharedKey]);

  const handleOperation = useCallback(async () => {
    if (!importedKey || !inputText) return;
    setIsLoading(true);
    setError(null);
    setOutputText('');
    try {
      let result: string;
      if (operation === 'encrypt') {
        result = await encrypt(importedKey, inputText);
      } else {
        result = await decrypt(importedKey, inputText, passphrase);
      }
      setOutputText(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed. If using a PGP key, ensure the passphrase is correct.');
    } finally {
      setIsLoading(false);
    }
  }, [importedKey, inputText, operation, passphrase]);

  const handleFileDrop = (e: React.DragEvent<HTMLTextAreaElement>, setter: (value: string) => void, onDropCallback?: (content: string) => void) => {
    e.preventDefault();
    setIsDraggingKey(false);
    setIsDraggingText(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            if (typeof loadEvent.target?.result === 'string') {
                const fileContent = loadEvent.target.result;
                setter(fileContent);
                if (onDropCallback) {
                  onDropCallback(fileContent);
                }
            }
        };
        reader.readAsText(file);
    }
  };

  const canEncrypt = keyProperties?.usages.includes('encrypt');
  const canDecrypt = keyProperties?.usages.includes('decrypt');

  return (
    <div className="w-full mx-auto p-6 sm:p-8 bg-brand-secondary rounded-xl shadow-2xl space-y-8">
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-primary">Encrypt / Decrypt</h1>
        <p className="mt-2 text-gray-400">Use a key to encrypt or decrypt messages. You can drag & drop key or text files.</p>
      </header>

      <div className="space-y-6">
        <div>
          <label htmlFor="key-import" className="block text-sm font-medium text-gray-300 mb-2">
            Import Key (PEM, JWK, PGP, Base64, Hex)
          </label>
          <div className="relative">
            <textarea
              id="key-import"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onDrop={(e) => handleFileDrop(e, setKeyInput, handleKeyImport)}
              onDragOver={(e) => { e.preventDefault(); setIsDraggingKey(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDraggingKey(false); }}
              className={`w-full p-3 bg-brand-dark text-brand-light border rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition font-mono text-sm ${isDraggingKey ? 'border-brand-primary ring-2 ring-brand-primary' : 'border-gray-600'}`}
              rows={6}
              placeholder="-----BEGIN PUBLIC KEY-----..."
            />
            {isDraggingKey && (
                <div className="absolute inset-0 flex items-center justify-center bg-brand-secondary/80 border-2 border-dashed border-brand-primary rounded-md pointer-events-none">
                    <span className="text-lg font-semibold text-brand-light">Drop key file here</span>
                </div>
            )}
          </div>
          <button
            onClick={() => handleKeyImport()}
            disabled={isLoading || !keyInput}
            className="mt-3 w-full sm:w-auto p-3 bg-brand-primary text-brand-dark font-bold rounded-md hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-secondary focus:ring-brand-primary transition duration-200 ease-in-out disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Importing Key...' : 'Use Key'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 font-sans" role="alert">
             <div className="flex items-start gap-3">
              <ErrorIcon className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-400" />
              <div>
                <h3 className="font-semibold text-red-200">An Error Occurred</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {keyProperties && (
           <div className="p-4 bg-brand-dark rounded-lg border border-gray-700 space-y-4">
              <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <KeyIcon className="w-5 h-5 text-brand-primary" /> Key Properties
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                      <strong className="text-gray-400 block">Type</strong>
                      <span className="font-mono text-brand-primary capitalize">{keyProperties.type}</span>
                  </div>
                  <div>
                      <strong className="text-gray-400 block">Algorithm</strong>
                      <span className="font-mono">{keyProperties.algorithm}</span>
                  </div>
                  <div>
                      <strong className="text-gray-400 block">Size / Curve</strong>
                      <span className="font-mono">{keyProperties.size}</span>
                  </div>
                  <div>
                      <strong className="text-gray-400 block">Extractable</strong>
                      <span className="font-mono">{keyProperties.extractable ? 'Yes' : 'No'}</span>
                  </div>
              </div>
              <div>
                  <strong className="text-gray-400 block mb-2 text-sm">Permitted Usages</strong>
                  <div className="flex flex-wrap gap-2">
                      {keyProperties.usages.length > 0 ? (
                          keyProperties.usages.map(usage => (
                              <span key={usage as string} className="px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-800 text-teal-200">
                                  {USAGE_DISPLAY_MAP[usage as string] || usage}
                              </span>
                          ))
                      ) : (
                          <span className="text-gray-500 text-xs">No specific usages defined.</span>
                      )}
                  </div>
              </div>
          </div>
        )}
        
        {importedKey && (
            <div className="pt-6 border-t border-gray-700 space-y-6">
                 <div>
                    <div className="flex bg-brand-dark border border-gray-600 rounded-md p-1 space-x-1 mb-4">
                        {canEncrypt && (
                            <button onClick={() => setOperation('encrypt')} className={`flex-1 px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-dark ${operation === 'encrypt' ? 'bg-brand-primary text-brand-dark' : 'text-gray-300 hover:bg-gray-700'}`}>Encrypt</button>
                        )}
                        {canDecrypt && (
                            <button onClick={() => setOperation('decrypt')} className={`flex-1 px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-dark ${operation === 'decrypt' ? 'bg-brand-primary text-brand-dark' : 'text-gray-300 hover:bg-gray-700'}`}>Decrypt</button>
                        )}
                    </div>
                </div>

                {keyProperties?.algorithm.startsWith('PGP') && keyProperties.type === 'private' && operation === 'decrypt' && (
                    <div>
                        <label htmlFor="pgp-passphrase-decrypt" className="block text-sm font-medium text-gray-300 mb-2">
                            PGP Private Key Passphrase
                        </label>
                        <input
                            type="password"
                            id="pgp-passphrase-decrypt"
                            value={passphrase}
                            onChange={(e) => setPassphrase(e.target.value)}
                            className="w-full p-3 bg-brand-dark text-brand-light border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                            placeholder="Enter passphrase if key is protected"
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="input-text" className="block text-sm font-medium text-gray-300 mb-2">
                            {operation === 'encrypt' ? 'Plaintext' : 'Ciphertext (Base64 or PGP)'}
                        </label>
                        <div className="relative">
                            <textarea 
                                id="input-text" 
                                value={inputText} 
                                onChange={(e) => setInputText(e.target.value)} 
                                onDrop={(e) => handleFileDrop(e, setInputText)}
                                onDragOver={(e) => { e.preventDefault(); setIsDraggingText(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setIsDraggingText(false); }}
                                className={`w-full p-3 h-48 bg-brand-dark text-brand-light border rounded-md focus:ring-2 focus:ring-brand-primary font-mono text-sm ${isDraggingText ? 'border-brand-primary ring-2 ring-brand-primary' : 'border-gray-600'}`} />
                             {isDraggingText && (
                                <div className="absolute inset-0 flex items-center justify-center bg-brand-secondary/80 border-2 border-dashed border-brand-primary rounded-md pointer-events-none">
                                    <span className="text-lg font-semibold text-brand-light">Drop text file here</span>
                                </div>
                            )}
                        </div>
                    </div>
                     <div>
                        <label htmlFor="output-text" className="block text-sm font-medium text-gray-300 mb-2">
                            {operation === 'encrypt' ? 'Ciphertext (Base64 or PGP)' : 'Plaintext'}
                        </label>
                        <textarea id="output-text" value={outputText} readOnly className="w-full p-3 h-48 bg-gray-800 text-gray-300 border border-gray-700 rounded-md font-mono text-sm" />
                    </div>
                </div>

                <button
                    onClick={handleOperation}
                    disabled={isLoading || !inputText}
                    className="w-full sm:w-auto p-3 bg-brand-primary text-brand-dark font-bold rounded-md hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-secondary focus:ring-brand-primary transition duration-200 ease-in-out disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Processing...' : `Perform ${operation.charAt(0).toUpperCase() + operation.slice(1)}`}
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default EncryptDecrypt;