import React, { useState, useCallback, useEffect } from 'react';
import type { KeyProperties, SharedKeyInfo } from '../types';
import { importAndInspectKey, sign, verify, importKey } from '../services/cryptoService';
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

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);
  
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

interface SignVerifyProps {
    sharedKeyInfo: SharedKeyInfo | null;
    onClearSharedKey: () => void;
}

const SignVerify: React.FC<SignVerifyProps> = ({ sharedKeyInfo, onClearSharedKey }) => {
    const [keyInput, setKeyInput] = useState<string>('');
    const [importedKey, setImportedKey] = useState<CryptoKey | any | null>(null);
    const [keyProperties, setKeyProperties] = useState<KeyProperties | null>(null);
    const [operation, setOperation] = useState<'sign' | 'verify'>('sign');
    const [message, setMessage] = useState<string>('');
    const [signature, setSignature] = useState<string>('');
    const [passphrase, setPassphrase] = useState<string>('');
    const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [isDraggingKey, setIsDraggingKey] = useState(false);
    const [isDraggingMessage, setIsDraggingMessage] = useState(false);


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
        setSignature('');
        setVerificationResult(null);
        setPassphrase('');
        try {
            const { key, props } = await importAndInspectKey(keyData);
            setImportedKey(key);
            setKeyProperties(props);
            if (props.type === 'public' || (props.usages.includes('verify') && !props.usages.includes('sign'))) {
                setOperation('verify');
            } else if (props.usages.includes('sign')) {
                setOperation('sign');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import key.');
        } finally {
            setIsLoading(false);
        }
    }, [keyInput]);

    useEffect(() => {
        const handleSharedKey = async () => {
            if (sharedKeyInfo?.target === TABS.SIGN_VERIFY && sharedKeyInfo.key) {
                setKeyInput(sharedKeyInfo.key);
                setKeyProperties(sharedKeyInfo.properties);

                const { usages, type } = sharedKeyInfo.properties;
                if (type === 'public' || (usages.includes('verify') && !usages.includes('sign'))) {
                    setOperation('verify');
                } else if (usages.includes('sign')) {
                    setOperation('sign');
                }
                
                setIsLoading(true);
                setError(null);
                try {
                    const imported = await importKey(sharedKeyInfo.key);
                    setImportedKey(imported);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to import shared key.');
                    setKeyProperties(null);
                } finally {
                    setIsLoading(false);
                    onClearSharedKey();
                }
            }
        };
        handleSharedKey();
      }, [sharedKeyInfo, onClearSharedKey]);

    const handleSign = useCallback(async () => {
        if (!importedKey || !message) return;
        setIsLoading(true);
        setError(null);
        setSignature('');
        try {
            const newSignature = await sign(importedKey, message, passphrase);
            setSignature(newSignature);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Signing failed. If using a PGP key, ensure the passphrase is correct.');
        } finally {
            setIsLoading(false);
        }
    }, [importedKey, message, passphrase]);

    const handleVerify = useCallback(async () => {
        if (!importedKey || !message || !signature) return;
        setIsLoading(true);
        setError(null);
        setVerificationResult(null);
        try {
            const isValid = await verify(importedKey, signature, message);
            setVerificationResult(isValid);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Verification failed.');
            setVerificationResult(false);
        } finally {
            setIsLoading(false);
        }
    }, [importedKey, message, signature]);
    
    const handleCopy = useCallback(() => {
        if (isCopied || !signature) return;
        navigator.clipboard.writeText(signature).then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        });
    }, [signature, isCopied]);

    const handleFileDrop = (e: React.DragEvent<HTMLTextAreaElement>, setter: (value: string) => void, onDropCallback?: (content: string) => void) => {
        e.preventDefault();
        setIsDraggingKey(false);
        setIsDraggingMessage(false);
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

    const canSign = keyProperties?.usages.includes('sign');
    const canVerify = keyProperties?.usages.includes('verify');

    return (
        <div className="w-full mx-auto p-6 sm:p-8 bg-brand-secondary rounded-xl shadow-2xl space-y-8">
            <header className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-brand-primary">Sign / Verify</h1>
                <p className="mt-2 text-gray-400">Create or verify a digital signature. You can drag & drop key or message files.</p>
            </header>

            <div className="space-y-6">
                <div>
                    <label htmlFor="key-import-sign" className="block text-sm font-medium text-gray-300 mb-2">
                        Import Key (PEM, JWK, PGP)
                    </label>
                    <div className="relative">
                        <textarea
                            id="key-import-sign"
                            value={keyInput}
                            onChange={(e) => setKeyInput(e.target.value)}
                            onDrop={(e) => handleFileDrop(e, setKeyInput, handleKeyImport)}
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingKey(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setIsDraggingKey(false); }}
                            className={`w-full p-3 bg-brand-dark text-brand-light border rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition font-mono text-sm ${isDraggingKey ? 'border-brand-primary ring-2 ring-brand-primary' : 'border-gray-600'}`}
                            rows={6}
                            placeholder="-----BEGIN PRIVATE KEY-----..."
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
                                {canSign && (
                                    <button onClick={() => setOperation('sign')} className={`flex-1 px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-dark ${operation === 'sign' ? 'bg-brand-primary text-brand-dark' : 'text-gray-300 hover:bg-gray-700'}`}>Sign</button>
                                )}
                                {canVerify && (
                                    <button onClick={() => setOperation('verify')} className={`flex-1 px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-dark ${operation === 'verify' ? 'bg-brand-primary text-brand-dark' : 'text-gray-300 hover:bg-gray-700'}`}>Verify</button>
                                )}
                            </div>
                        </div>

                        {keyProperties?.algorithm.startsWith('PGP') && keyProperties.type === 'private' && operation === 'sign' && (
                            <div>
                                <label htmlFor="pgp-passphrase-sign" className="block text-sm font-medium text-gray-300 mb-2">
                                    PGP Private Key Passphrase
                                </label>
                                <input
                                    type="password"
                                    id="pgp-passphrase-sign"
                                    value={passphrase}
                                    onChange={(e) => setPassphrase(e.target.value)}
                                    className="w-full p-3 bg-brand-dark text-brand-light border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                                    placeholder="Enter passphrase to sign"
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="message-input" className="block text-sm font-medium text-gray-300 mb-2">
                                {operation === 'sign' ? 'Message to Sign' : 'Original Message'}
                            </label>
                            <div className="relative">
                                <textarea 
                                    id="message-input" 
                                    value={message} 
                                    onChange={(e) => setMessage(e.target.value)}
                                    onDrop={(e) => handleFileDrop(e, setMessage)}
                                    onDragOver={(e) => { e.preventDefault(); setIsDraggingMessage(true); }}
                                    onDragLeave={(e) => { e.preventDefault(); setIsDraggingMessage(false); }}
                                    className={`w-full p-3 h-32 bg-brand-dark text-brand-light border rounded-md focus:ring-2 focus:ring-brand-primary font-sans text-sm ${isDraggingMessage ? 'border-brand-primary ring-2 ring-brand-primary' : 'border-gray-600'}`} />
                                {isDraggingMessage && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-brand-secondary/80 border-2 border-dashed border-brand-primary rounded-md pointer-events-none">
                                        <span className="text-lg font-semibold text-brand-light">Drop message file here</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="signature-input" className="block text-sm font-medium text-gray-300 mb-2">
                                {operation === 'sign' ? 'Generated Signature (PGP or Base64)' : 'Signature to Verify (PGP or Base64)'}
                            </label>
                            <div className="relative">
                                <textarea
                                    id="signature-input"
                                    value={signature}
                                    onChange={(e) => setSignature(e.target.value)}
                                    readOnly={operation === 'sign'}
                                    className={`w-full p-3 h-24 bg-brand-dark text-brand-light border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-primary font-mono text-sm ${operation === 'sign' ? 'bg-gray-800 text-gray-300' : ''}`}
                                />
                                {operation === 'sign' && signature && (
                                    <button
                                        onClick={handleCopy}
                                        disabled={isCopied}
                                        aria-label={isCopied ? 'Copied!' : 'Copy signature to clipboard'}
                                        className={`absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark ${
                                        isCopied
                                            ? 'bg-green-500 text-white cursor-default'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-brand-primary'
                                        }`}
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
                                )}
                            </div>
                        </div>

                        <button
                            onClick={operation === 'sign' ? handleSign : handleVerify}
                            disabled={isLoading || !message || (operation === 'verify' && !signature)}
                            className="w-full sm:w-auto p-3 bg-brand-primary text-brand-dark font-bold rounded-md hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-secondary focus:ring-brand-primary transition duration-200 ease-in-out disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Processing...' : operation === 'sign' ? 'Generate Signature' : 'Verify Signature'}
                        </button>
                        
                        {verificationResult !== null && (
                            <div className={`p-4 rounded-lg flex items-center gap-3 ${verificationResult ? 'bg-green-900/20 border border-green-500/30 text-green-300' : 'bg-red-900/20 border border-red-500/30 text-red-300'}`}>
                                {verificationResult ? <CheckCircleIcon className="w-6 h-6 text-green-400" /> : <XCircleIcon className="w-6 h-6 text-red-400" />}
                                <span className="font-semibold">{verificationResult ? 'Signature is Valid' : 'Signature is Invalid'}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignVerify;