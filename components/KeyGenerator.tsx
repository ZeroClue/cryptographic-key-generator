import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { AlgorithmOption, KeyGenerationResult, KeyProperties } from '../types';
import { ALGORITHM_OPTIONS, USAGE_DESCRIPTIONS, KEY_SIZE_OPTIONS, KEY_SIZE_DESCRIPTIONS, USAGE_DEFINITIONS, TABS } from '../constants';
import { 
  generateKey, 
  exportPublicKeyPem, 
  exportPrivateKeyPem, 
  exportSymmetricKey,
  exportPublicKeyJwk,
  exportPrivateKeyJwk,
  exportSymmetricKeyHex,
  exportPrivateKeyOpenSsh,
  exportPrivateKeyPutty,
  importAndInspectKey,
  inspectKey,
} from '../services/cryptoService';

declare const zxcvbn: (password: string) => {
    score: 0 | 1 | 2 | 3 | 4;
    feedback: {
        warning: string;
        suggestions: string[];
    };
};

// ===================================================================================
// ICONS
// ===================================================================================
const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a6 6 0 0110.257-4.257" />
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
const ExportIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);
const WarningIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);
const TerminalIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" >
        <path fillRule="evenodd" d="M2.25 4.5A.75.75 0 001.5 5.25v13.5c0 .414.336.75.75.75h2.25a.75.75 0 000-1.5H3V6h18v12h-1.5a.75.75 0 000 1.5h2.25a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75H2.25z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M6.54 9.22a.75.75 0 00-1.06 1.06l2.22 2.22-2.22 2.22a.75.75 0 101.06 1.06L8.84 12.5l-2.3-2.22a.75.75 0 00-1.06-1.061zM11.25 14.25a.75.75 0 000 1.5h5.25a.75.75 0 000-1.5H11.25z" clipRule="evenodd" />
    </svg>
);

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
);

// ===================================================================================
// HELPER FUNCTIONS
// ===================================================================================
const getAlgorithmFamily = (alg: AlgorithmOption): string => {
    if (alg.startsWith('PGP')) return 'pgp';
    if (alg.startsWith('SSH')) return 'ssh';
    if (alg.startsWith('RSA')) return 'rsa';
    if (alg.startsWith('ECDSA') || alg.startsWith('ECDH')) return 'ec';
    if (alg.startsWith('AES')) return 'aes';
    if (alg.startsWith('HMAC')) return 'hmac';
    return 'key';
};

const getCommandEquivalent = (fullAlgorithm: string): string | null => {
    const parts = fullAlgorithm.split('-');
    const family = parts[0];

    switch (family) {
        case 'SSH':
            const type = parts[1].toLowerCase();
            const param = parts[2];
            let bitLength: string;
            if (type === 'rsa') {
                bitLength = param;
            } else { // ecdsa
                bitLength = param.startsWith('P') ? param.substring(1) : param; // P256 -> 256
            }
            return `ssh-keygen -t ${type} -b ${bitLength} -C "user@hostname"`;

        case 'RSA':
            const rsaBits = parts[parts.length - 1];
            return `openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:${rsaBits} -out private_key.pem`;

        case 'ECDSA':
        case 'ECDH':
            const curve = parts[2]; // P-256
            const opensslCurveName = {
                'P-256': 'prime256v1', 'P-384': 'secp384r1', 'P-521': 'secp521r1'
            }[curve as 'P-256' | 'P-384' | 'P-521'];
            if (!opensslCurveName) return null;
            return `openssl ecparam -name ${opensslCurveName} -genkey -out private_key.pem`;
        
        case 'AES':
            const aesBits = parseInt(parts[1], 10);
            return `openssl rand -base64 ${aesBits / 8}`;

        case 'HMAC':
            const hashSize = parseInt(parts[1], 10);
            return `openssl rand -hex ${hashSize / 8}`;

        case 'PGP':
            const pgpType = parts[1];
            if (pgpType === 'ECC') {
                return `gpg --expert --full-generate-key (select ECC > Curve25519)`;
            }
            if (pgpType === 'RSA') {
                const pgpBits = parts[2];
                return `gpg --full-generate-key (select RSA > ${pgpBits} bits)`;
            }
            return 'gpg --full-generate-key';

        default:
            return null;
    }
};


// ===================================================================================
// CHILD COMPONENTS
// ===================================================================================

const USAGE_DISPLAY_MAP: Record<string, string> = {
    'encrypt': 'Encrypt', 'decrypt': 'Decrypt', 'sign': 'Sign', 'verify': 'Verify',
    'deriveKey': 'Derive Key', 'deriveBits': 'Derive Bits', 'wrapKey': 'Wrap Key', 'unwrapKey': 'Unwrap Key',
};

interface SegmentedControlProps {
    options: { label: string; value: string }[];
    selected: string;
    onChange: (value: string) => void;
}
const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, selected, onChange }) => (
    <div className="flex bg-brand-dark border border-gray-600 rounded-md p-1 space-x-1">
        {options.map(option => (
            <button key={option.value} onClick={() => onChange(option.value)}
                className={`flex-1 px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-dark ${
                    selected === option.value ? 'bg-brand-primary text-brand-dark' : 'text-gray-300 hover:bg-gray-700'
                }`}
                aria-pressed={selected === option.value}>
                {option.label}
            </button>
        ))}
    </div>
);

const PasswordStrengthMeter: React.FC<{ strength: any }> = ({ strength }) => {
    if (!strength) return null;
    const { score, feedback } = strength;
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-600', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-600'];
    const textColors = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-lime-400', 'text-green-400'];
    return (
        <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-300 ${colors[score]}`} style={{ width: `${((score + 1) / 5) * 100}%` }}
                        role="progressbar" aria-valuenow={score + 1} aria-valuemin={1} aria-valuemax={5} aria-label={`Passphrase strength: ${labels[score]}`}></div>
                </div>
                <span className={`text-sm font-semibold w-24 text-right ${textColors[score]}`}>{labels[score]}</span>
            </div>
            {feedback.warning && (<p className="text-xs text-red-400">{feedback.warning}</p>)}
            {feedback.suggestions?.length > 0 && (
                 <ul className="text-xs text-gray-400 list-disc list-inside space-y-1">
                    {feedback.suggestions.map((s, i) => (<li key={i}>{s}</li>))}
                </ul>
            )}
        </div>
    );
};

const SecurityWarningModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; }> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="security-warning-title">
            <div className="bg-brand-secondary rounded-lg shadow-xl p-6 max-w-md w-full border border-yellow-500/30">
                <h2 id="security-warning-title" className="text-xl font-bold text-yellow-400 flex items-center gap-3">
                    <WarningIcon className="w-6 h-6" /> Security Warning
                </h2>
                <p className="mt-4 text-gray-300">You are about to export a <strong>private key</strong>. This key is highly sensitive.</p>
                <ul className="mt-3 text-sm text-gray-400 list-disc list-inside space-y-1.5">
                    <li><strong>Never</strong> share it with anyone.</li>
                    <li>Store it in a secure, encrypted location (e.g., a password manager).</li>
                    <li>Anyone with this key can decrypt your data or impersonate you.</li>
                </ul>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white font-semibold transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-brand-secondary">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white font-bold transition focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-brand-secondary">Export Anyway</button>
                </div>
            </div>
        </div>
    );
};

const KeyOutput: React.FC<{ title: string; value: string; isLoading: boolean; placeholder: string; error: string | null; }> = ({ title, value, isLoading, placeholder, error }) => {
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = useCallback(() => {
        if (isCopied || !value) return;
        navigator.clipboard.writeText(value).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    }, [value, isCopied]);

    useEffect(() => { setIsCopied(false); }, [value]);

    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-200 mb-2">{title}</h2>
            <div className="relative">
                {isLoading && (
                    <div className="w-full p-4 flex items-center justify-center bg-brand-dark rounded-md shadow-inner min-h-[12rem] border border-gray-700 text-gray-400">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>Generating...</span>
                    </div>
                )}
                {error && !isLoading && (
                    <div className="w-full p-4 flex items-center justify-center bg-brand-dark rounded-md shadow-inner min-h-[12rem] border border-red-500/30 text-red-400 font-sans text-center">
                        <div>
                            <ErrorIcon className="w-8 h-8 mx-auto mb-2" />
                            <span>Key generation failed.</span>
                            <p className="text-xs text-gray-500 mt-1">Review options or try again.</p>
                        </div>
                    </div>
                )}
                {!isLoading && !error && (
                    <>
                        <textarea
                            readOnly
                            value={value}
                            aria-label={title}
                            placeholder={placeholder}
                            className="w-full p-4 bg-brand-dark rounded-md shadow-inner text-sm font-mono min-h-[12rem] max-h-96 border border-gray-700 resize-none text-gray-300 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition placeholder-gray-500"
                        />
                         {value && (
                            <div className="absolute top-3 right-3 flex items-center gap-2">
                                <button onClick={handleCopy} disabled={isCopied} aria-label={isCopied ? 'Copied!' : 'Copy key to clipboard'}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark ${isCopied ? 'bg-green-500 text-white cursor-default' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-brand-primary'}`}>
                                    {isCopied ? (<><CheckIcon className="w-4 h-4" /><span>Copied!</span></>) : (<><CopyIcon className="w-4 h-4" /><span>Copy</span></>)}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const CommandLineEquivalent: React.FC<{ command: string | null }> = ({ command }) => {
    const [isCopied, setIsCopied] = useState(false);
    if (!command) return null;
    const handleCopy = () => {
        if (isCopied) return;
        navigator.clipboard.writeText(command).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };
    return (
        <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-200 flex items-center gap-2">
                <TerminalIcon className="w-5 h-5 text-gray-400" /> Command-Line Equivalent
            </h3>
            <div className="relative p-3 bg-brand-dark rounded-md border border-gray-700 font-mono text-sm text-gray-300">
                <button onClick={handleCopy} aria-label={isCopied ? 'Copied!' : 'Copy command'}
                    className={`absolute top-2 right-2 p-1.5 text-xs rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark ${isCopied ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-brand-primary'}`}>
                    {isCopied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                </button>
                <code className="pr-10 block whitespace-pre-wrap break-all">{command}</code>
            </div>
        </div>
    );
};

const KeyGenerationForm: React.FC<any> = ({
    selectedUsage, setSelectedUsage, filteredAlgorithms, selectedAlgorithm,
    setSelectedAlgorithm, availableKeySizes, selectedKeySize, setSelectedKeySize,
    handleGenerateKey, isLoading, selectedAlgorithmInfo, currentUsageInfo
}) => (
    <div className="space-y-6">
        <div>
            <label htmlFor="usage-select" className="block text-sm font-medium text-gray-300 mb-2">Select Intended Usage</label>
            <select id="usage-select" value={selectedUsage} onChange={(e) => setSelectedUsage(e.target.value)}
                className="w-full p-3 bg-brand-dark text-brand-light border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition">
                {USAGE_DEFINITIONS.map(usage => (<option key={usage.group} value={usage.group}>{usage.group} - {usage.shortDescription}</option>))}
            </select>
        </div>
        
        {currentUsageInfo && (
            <div className="p-4 bg-brand-dark rounded-md border border-gray-700">
                 <h3 className="text-base font-semibold text-brand-primary mb-2">{currentUsageInfo.title}</h3>
                 <p className="text-sm text-gray-400 leading-relaxed">{currentUsageInfo.description}</p>
            </div>
        )}

        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className={availableKeySizes ? 'md:col-span-1' : 'md:col-span-2'}>
                    <label htmlFor="algorithm-select" className="block text-sm font-medium text-gray-300 mb-2">Choose Algorithm</label>
                    <select id="algorithm-select" value={selectedAlgorithm} onChange={(e) => setSelectedAlgorithm(e.target.value)}
                        className="w-full p-3 bg-brand-dark text-brand-light border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                        title={selectedAlgorithmInfo?.description}>
                        {filteredAlgorithms.map((option: any) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                    </select>
                </div>
                {availableKeySizes && (
                    <div className="md:col-span-1">
                        <label htmlFor="keysize-select" className="block text-sm font-medium text-gray-300 mb-2">Key Size / Curve</label>
                        <select id="keysize-select" value={selectedKeySize} onChange={(e) => setSelectedKeySize(e.target.value)}
                            className="w-full p-3 bg-brand-dark text-brand-light border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition">
                            {availableKeySizes.map((size: any) => (<option key={size.value} value={size.value} title={KEY_SIZE_DESCRIPTIONS[size.value]}>{size.label}</option>))}
                        </select>
                    </div>
                )}
                <div className={availableKeySizes ? "md:col-span-1" : "md:col-span-1"}>
                    <button onClick={handleGenerateKey} disabled={isLoading}
                        className="w-full p-3 bg-brand-primary text-brand-dark font-bold rounded-md hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-secondary focus:ring-brand-primary transition duration-200 ease-in-out disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {isLoading ? 'Generating...' : 'Generate Key'}
                    </button>
                </div>
            </div>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 text-xs text-gray-400">
                <div className="min-h-[3rem] py-1">
                    {selectedAlgorithmInfo?.description && (<p><span className="font-semibold text-gray-300">Algorithm: </span>{selectedAlgorithmInfo.description}</p>)}
                </div>
                {availableKeySizes && (
                    <div className="min-h-[3rem] py-1">
                        {selectedKeySize && KEY_SIZE_DESCRIPTIONS[selectedKeySize] && (<p><span className="font-semibold text-gray-300">Key Size/Curve: </span>{KEY_SIZE_DESCRIPTIONS[selectedKeySize]}</p>)}
                    </div>
                )}
            </div>
        </div>
    </div>
);

const PgpForm: React.FC<any> = ({ pgpUserInfo, handlePgpInfoChange, handlePgpBlur, pgpFormErrors, passphraseStrength }) => (
    <div className="p-4 bg-brand-dark rounded-lg border border-gray-700 space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">PGP User Information (User ID)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="pgp-name" className="block text-sm font-medium text-gray-300 mb-2">Name (Required)</label>
                <input type="text" id="pgp-name" name="name" value={pgpUserInfo.name} onChange={handlePgpInfoChange} onBlur={handlePgpBlur} className={`w-full p-2 bg-brand-dark text-brand-light border ${pgpFormErrors.name ? 'border-red-500' : 'border-gray-600'} rounded-md focus:ring-2 focus:ring-brand-primary`} placeholder="John Doe" required />
                {pgpFormErrors.name && <p className="text-red-400 text-xs mt-1">{pgpFormErrors.name}</p>}
            </div>
            <div>
                <label htmlFor="pgp-email" className="block text-sm font-medium text-gray-300 mb-2">Email (Required)</label>
                <input type="email" id="pgp-email" name="email" value={pgpUserInfo.email} onChange={handlePgpInfoChange} onBlur={handlePgpBlur} className={`w-full p-2 bg-brand-dark text-brand-light border ${pgpFormErrors.email ? 'border-red-500' : 'border-gray-600'} rounded-md focus:ring-2 focus:ring-brand-primary`} placeholder="john.doe@example.com" required />
                {pgpFormErrors.email && <p className="text-red-400 text-xs mt-1">{pgpFormErrors.email}</p>}
            </div>
            <div>
                <label htmlFor="pgp-passphrase" className="block text-sm font-medium text-gray-300 mb-2">Passphrase (Recommended)</label>
                <input type="password" id="pgp-passphrase" name="passphrase" value={pgpUserInfo.passphrase} onChange={handlePgpInfoChange} className={`w-full p-2 bg-brand-dark text-brand-light border ${pgpFormErrors.confirmPassphrase ? 'border-red-500' : 'border-gray-600'} rounded-md focus:ring-2 focus:ring-brand-primary`} placeholder="••••••••" />
                {pgpUserInfo.passphrase && <PasswordStrengthMeter strength={passphraseStrength} />}
            </div>
            <div>
                <label htmlFor="pgp-confirm-passphrase" className="block text-sm font-medium text-gray-300 mb-2">Confirm Passphrase</label>
                <input type="password" id="pgp-confirm-passphrase" name="confirmPassphrase" value={pgpUserInfo.confirmPassphrase} onChange={handlePgpInfoChange} className={`w-full p-2 bg-brand-dark text-brand-light border ${pgpFormErrors.confirmPassphrase ? 'border-red-500' : 'border-gray-600'} rounded-md focus:ring-2 focus:ring-brand-primary`} placeholder="••••••••" />
                {pgpFormErrors.confirmPassphrase && <p className="text-red-400 text-xs mt-1">{pgpFormErrors.confirmPassphrase}</p>}
            </div>
        </div>
    </div>
);

const ExportOptions: React.FC<any> = ({
    generationResult, isPgp, isSymmetric, isAsymmetric, isSsh,
    symmetricExportFormat, setSymmetricExportFormat, asymmetricExportFormat,
    setAsymmetricExportFormat, sshExportFormat, setSshExportFormat,
    handleExport, error, getSshExportFilename
}) => {
    if (!generationResult) return null;
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-200">Export Options</h2>
            {isPgp && (
                <div className="p-4 bg-brand-dark rounded-lg border border-gray-700 space-y-4">
                    {generationResult.type === 'pgp' && generationResult.keyID && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">PGP Key ID</label>
                            <div className="p-2 bg-gray-900 rounded-md border border-gray-600">
                                <code className="font-mono text-brand-primary">{generationResult.keyID}</code>
                            </div>
                        </div>
                    )}
                    <div>
                        <h3 className="text-base font-medium text-gray-300 mb-2">PGP Armored Keys</h3>
                        <div className="flex flex-wrap gap-4">
                            <button onClick={() => handleExport('public')} disabled={!!error} className="flex items-center gap-2 p-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-secondary focus:ring-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"><ExportIcon className="w-5 h-5" />Export Public Key (.asc)</button>
                            <button onClick={() => handleExport('private')} disabled={!!error} className="flex items-center gap-2 p-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-secondary focus:ring-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"><ExportIcon className="w-5 h-5" />Export Private Key (.asc)</button>
                        </div>
                    </div>
                </div>
            )}
            {isSymmetric && (
                <div className="p-4 bg-brand-dark rounded-lg border border-gray-700 space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                        <SegmentedControl options={[{label: 'Base64', value: 'base64'}, {label: 'Hex', value: 'hex'}]} selected={symmetricExportFormat} onChange={(val) => setSymmetricExportFormat(val as any)} />
                    </div>
                    <button onClick={() => handleExport('symmetric')} disabled={!!error} className="flex items-center gap-2 w-full sm:w-auto p-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-secondary focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"><ExportIcon className="w-5 h-5" />Export Key (.{symmetricExportFormat === 'hex' ? 'hex' : 'b64'})</button>
                </div>
            )}
            {isAsymmetric && !isSsh && !isPgp && (
                <div className="p-4 bg-brand-dark rounded-lg border border-gray-700 space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                        <SegmentedControl options={[{label: 'PEM', value: 'pem'}, {label: 'JWK', value: 'jwk'}]} selected={asymmetricExportFormat} onChange={(val) => setAsymmetricExportFormat(val as any)} />
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <button onClick={() => handleExport('public')} disabled={!!error} className="flex items-center gap-2 p-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-secondary focus:ring-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"><ExportIcon className="w-5 h-5" />Export Public Key (.{asymmetricExportFormat})</button>
                        <button onClick={() => handleExport('private')} disabled={!!error} className="flex items-center gap-2 p-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-secondary focus:ring-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"><ExportIcon className="w-5 h-5" />Export Private Key (.{asymmetricExportFormat})</button>
                    </div>
                </div>
            )}
            {isAsymmetric && isSsh && (
                <div className="p-4 bg-brand-dark rounded-lg border border-gray-700 space-y-4">
                    <button onClick={() => handleExport('public')} disabled={!!error} className="flex items-center gap-2 p-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-secondary focus:ring-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"><ExportIcon className="w-5 h-5" />Export Public Key (.pub)</button>
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-300">Private Key Format</label>
                        <SegmentedControl options={[{label: 'PEM', value: 'pem'}, {label: 'OpenSSH', value: 'openssh'}, {label: 'PuTTY', value: 'putty'}]} selected={sshExportFormat} onChange={(val) => setSshExportFormat(val as any)} />
                        <button onClick={() => handleExport('private')} disabled={!!error} className="flex items-center gap-2 p-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-secondary focus:ring-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"><ExportIcon className="w-5 h-5" />Export Private Key ({getSshExportFilename()})</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const KeyDisplay: React.FC<any> = ({
    isAsymmetricMode, isSsh, asymmetricExportFormat, isSymmetric, symmetricExportFormat,
    publicKeyOutput, privateKeyOutput, symmetricOutput, isLoading, error,
    isPgp
}) => (
    <div className="space-y-6">
        {isAsymmetricMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <KeyOutput 
                    title={isSsh ? "Public Key (SSH Format)" : isPgp ? "Public Key (PGP)" : `Public Key (${asymmetricExportFormat.toUpperCase()})`} 
                    value={publicKeyOutput} 
                    isLoading={isLoading} 
                    error={error} 
                    placeholder="Your public key will appear here." 
                />
                <KeyOutput title={isSsh ? "Private Key" : isPgp ? "Private Key (PGP)" : `Private Key (${asymmetricExportFormat.toUpperCase()})`} value={privateKeyOutput} isLoading={isLoading} error={error} placeholder="Your private key will appear here." />
            </div>
        ) : (
            <KeyOutput title={isSymmetric ? `Generated Key (${symmetricExportFormat === 'hex' ? 'Hex' : 'Base64'})` : "Generated Key"} value={symmetricOutput} isLoading={isLoading} error={error} placeholder="Your generated key will appear here." />
        )}
    </div>
);

// Calculate initial state for the generator form once, outside the component.
// This ensures the form is pre-filled on first load for one-click generation.
const initialUsage = USAGE_DEFINITIONS[0].group;
const initialAlgorithmsForUsage = ALGORITHM_OPTIONS.filter(opt => opt.group === initialUsage);
const initialAlgorithm = initialAlgorithmsForUsage[0]?.value || '';
const initialKeySizesForAlgorithm = KEY_SIZE_OPTIONS[initialAlgorithm] || null;
const initialKeySize = initialKeySizesForAlgorithm ? initialKeySizesForAlgorithm[0].value : '';


// ===================================================================================
// MAIN COMPONENT
// ===================================================================================

interface KeyGeneratorProps {
    onShareKey: (key: string, target: string, properties: KeyProperties) => void;
}

const KeyGenerator: React.FC<KeyGeneratorProps> = ({ onShareKey }) => {
  // State for mode
  const [mode, setMode] = useState<'generate' | 'inspect'>('generate');

  // State for Generation
  const [selectedUsage, setSelectedUsage] = useState<string>(initialUsage);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>(initialAlgorithm);
  const [selectedKeySize, setSelectedKeySize] = useState<string>(initialKeySize);
  const [generationResult, setGenerationResult] = useState<KeyGenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [asymmetricExportFormat, setAsymmetricExportFormat] = useState<'pem' | 'jwk'>('pem');
  const [symmetricExportFormat, setSymmetricExportFormat] = useState<'base64' | 'hex'>('base64');
  const [sshExportFormat, setSshExportFormat] = useState<'pem' | 'openssh' | 'putty'>('pem');
  const [pgpUserInfo, setPgpUserInfo] = useState({ name: '', email: '', passphrase: '', confirmPassphrase: '' });
  const [pgpFormErrors, setPgpFormErrors] = useState({ name: '', email: '', confirmPassphrase: '' });
  const [passphraseStrength, setPassphraseStrength] = useState<any>(null);
  const [commandLineEquivalent, setCommandLineEquivalent] = useState<string | null>(null);

  // State for key display strings
  const [publicKeyOutput, setPublicKeyOutput] = useState('');
  const [privateKeyOutput, setPrivateKeyOutput] = useState('');
  const [symmetricOutput, setSymmetricOutput] = useState('');

  // State for export modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exportAction, setExportAction] = useState<(() => void) | null>(null);

  // State for Inspection
  const [keyImportInput, setKeyImportInput] = useState<string>('');
  const [importedKeyProps, setImportedKeyProps] = useState<KeyProperties | null>(null);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const filteredAlgorithms = useMemo(() => ALGORITHM_OPTIONS.filter(opt => opt.group === selectedUsage), [selectedUsage]);
  const selectedAlgorithmInfo = useMemo(() => ALGORITHM_OPTIONS.find(opt => opt.value === selectedAlgorithm), [selectedAlgorithm]);
  const availableKeySizes = useMemo(() => KEY_SIZE_OPTIONS[selectedAlgorithm] || null, [selectedAlgorithm]);
  const isSsh = useMemo(() => selectedUsage === 'SSH Authentication', [selectedUsage]);
  const isPgp = useMemo(() => selectedUsage === 'PGP / GPG', [selectedUsage]);
  const isAsymmetricMode = useMemo(() => ['Asymmetric Encryption', 'SSH Authentication', 'Digital Signatures', 'Key Agreement', 'PGP / GPG'].includes(selectedUsage), [selectedUsage]);
  const isSymmetric = useMemo(() => selectedUsage === 'Symmetric Encryption' || selectedUsage === 'Message Authentication', [selectedUsage]);

  useEffect(() => {
    setGenerationResult(null);
    setError(null);
    setCommandLineEquivalent(null);
    if (selectedUsage === 'PGP / GPG') {
        setSelectedAlgorithm('PGP-ECC-curve25519');
    } else {
        const firstAlgorithmInGroup = filteredAlgorithms[0];
        if (firstAlgorithmInGroup) {
            setSelectedAlgorithm(firstAlgorithmInGroup.value);
        }
    }
  }, [selectedUsage, filteredAlgorithms]);

  useEffect(() => {
    setGenerationResult(null);
    setError(null);
    setCommandLineEquivalent(null);
    if (availableKeySizes) {
        setSelectedKeySize(availableKeySizes[0].value);
    } else {
        setSelectedKeySize('');
    }
  }, [availableKeySizes, selectedAlgorithm]);

  // Consolidated effect to format and display keys
  useEffect(() => {
    if (!generationResult) {
        setPublicKeyOutput('');
        setPrivateKeyOutput('');
        setSymmetricOutput('');
        return;
    }
    const formatAndSetKeys = async () => {
        try {
            setError(null);
            if (generationResult.type === 'symmetric') {
                const newValue = symmetricExportFormat === 'hex' ? await exportSymmetricKeyHex(generationResult.key) : await exportSymmetricKey(generationResult.key);
                setSymmetricOutput(newValue); setPublicKeyOutput(''); setPrivateKeyOutput('');
            } else if (generationResult.type === 'asymmetric') {
                const { keyPair } = generationResult;
                if (isSsh) {
                    setPublicKeyOutput(generationResult.displayValue);
                    let privateValue;
                    switch (sshExportFormat) {
                        case 'openssh': privateValue = await exportPrivateKeyOpenSsh(keyPair.privateKey); break;
                        case 'putty': privateValue = await exportPrivateKeyPutty(keyPair.privateKey); break;
                        default: privateValue = await exportPrivateKeyPem(keyPair.privateKey); break;
                    }
                    setPrivateKeyOutput(privateValue);
                } else {
                    const publicValue = asymmetricExportFormat === 'jwk' ? await exportPublicKeyJwk(keyPair.publicKey) : await exportPublicKeyPem(keyPair.publicKey);
                    const privateValue = asymmetricExportFormat === 'jwk' ? await exportPrivateKeyJwk(keyPair.privateKey) : await exportPrivateKeyPem(keyPair.privateKey);
                    setPublicKeyOutput(publicValue); setPrivateKeyOutput(privateValue);
                }
                setSymmetricOutput('');
            } else if (generationResult.type === 'pgp') {
                setPublicKeyOutput(generationResult.publicKey); setPrivateKeyOutput(generationResult.privateKey); setSymmetricOutput('');
            }
        } catch (err) {
            setError(`Failed to format key: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };
    formatAndSetKeys();
}, [generationResult, symmetricExportFormat, asymmetricExportFormat, sshExportFormat, isSsh]);

  const handlePgpInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedUserInfo = { ...pgpUserInfo, [name]: value };
    setPgpUserInfo(updatedUserInfo);

    if (name === 'passphrase') {
      setPassphraseStrength(value ? zxcvbn(value) : null);
    }

    // Clear name/email errors as user types
    if ((name === 'name' || name === 'email') && pgpFormErrors[name as 'name' | 'email']) {
      setPgpFormErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Real-time validation for passphrase confirmation
    if (name === 'passphrase' || name === 'confirmPassphrase') {
      if (updatedUserInfo.passphrase !== updatedUserInfo.confirmPassphrase && updatedUserInfo.confirmPassphrase) {
        setPgpFormErrors(prev => ({ ...prev, confirmPassphrase: 'Passphrases do not match.' }));
      } else {
        setPgpFormErrors(prev => ({ ...prev, confirmPassphrase: '' }));
      }
    }
  };
  const handlePgpBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target; let error = '';
    if (name === 'name' && !value.trim()) error = 'Name is required.';
    else if (name === 'email' && !value.trim()) error = 'Email is required.';
    else if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email address.';
    if (error) setPgpFormErrors(prev => ({ ...prev, [name]: error }));
  };

  const downloadFile = (filename: string, content: string, mimeType: string = 'application/octet-stream') => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); element.click(); document.body.removeChild(element); URL.revokeObjectURL(element.href);
  };

  const handleGenerateKey = useCallback(async () => {
    setIsLoading(true); setError(null); setGenerationResult(null); setCommandLineEquivalent(null);
    if (isPgp) {
        const errors = { name: '', email: '', confirmPassphrase: '' };
        if (!pgpUserInfo.name.trim()) errors.name = 'Name is required.';
        if (!pgpUserInfo.email.trim()) errors.email = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pgpUserInfo.email)) errors.email = 'Please enter a valid email address.';
        if (pgpUserInfo.passphrase !== pgpUserInfo.confirmPassphrase) errors.confirmPassphrase = 'Passphrases do not match.';
        if (Object.values(errors).some(e => e)) {
            setPgpFormErrors(errors); setError('Please fix the errors in the PGP information form.'); setIsLoading(false); return;
        }
        setPgpFormErrors({ name: '', email: '', confirmPassphrase: '' });
    }
    const fullAlgorithm = availableKeySizes ? `${selectedAlgorithm}-${selectedKeySize}` : selectedAlgorithm;
    try {
      const pgpOptions = isPgp ? { name: pgpUserInfo.name, email: pgpUserInfo.email, passphrase: pgpUserInfo.passphrase } : undefined;
      const result = await generateKey(fullAlgorithm as AlgorithmOption, pgpOptions);
      setGenerationResult(result);
      setCommandLineEquivalent(getCommandEquivalent(fullAlgorithm));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during key generation.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAlgorithm, selectedKeySize, availableKeySizes, isPgp, pgpUserInfo]);
  
  const getSshExportFilename = () => ({ pem: '.pem', openssh: '.openssh', putty: '.ppk' })[sshExportFormat] || '.pem';
  const handleExport = async (keyType: 'public' | 'private' | 'symmetric') => {
    if (!generationResult) return;
    const performExport = async () => {
        try {
          if (generationResult.type === 'pgp') {
              downloadFile(keyType === 'public' ? 'public_key.asc' : 'private_key.asc', keyType === 'public' ? generationResult.publicKey : generationResult.privateKey, 'application/pgp-keys'); return;
          }
          let content: string, filename: string, mimeType = 'application/octet-stream';
          const family = getAlgorithmFamily(generationResult.type === 'asymmetric' ? (selectedAlgorithm as AlgorithmOption) : (generationResult.key.algorithm.name as AlgorithmOption));
          if (isSsh && generationResult.type === 'asymmetric') {
            const sshType = family === 'ssh-rsa' ? 'rsa' : 'ecdsa';
            filename = keyType === 'public' ? `id_${sshType}.pub` : `id_${sshType}${getSshExportFilename()}`;
            content = keyType === 'public' ? publicKeyOutput : privateKeyOutput;
            if (keyType === 'public') mimeType = 'text/plain';
            else if (sshExportFormat === 'putty') mimeType = 'application/x-putty-key';
          } else if (generationResult.type === 'symmetric' && keyType === 'symmetric') {
            filename = `symmetric_${family}_key.${symmetricExportFormat === 'hex' ? 'hex' : 'b64'}`;
            content = symmetricOutput; mimeType = 'text/plain';
          } else if (generationResult.type === 'asymmetric') {
            filename = `${keyType}_${family}_key.${asymmetricExportFormat}`;
            content = keyType === 'public' ? publicKeyOutput : privateKeyOutput;
            mimeType = asymmetricExportFormat === 'jwk' ? 'application/json' : 'application/x-pem-file';
          } else { return; }
          downloadFile(filename, content, mimeType);
        } catch (err) {
          setError(`Failed to export key: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };
    if (keyType === 'private') { setExportAction(() => performExport); setIsModalOpen(true); } else { await performExport(); }
  };
  const handleConfirmExport = () => { if (exportAction) { exportAction(); } setIsModalOpen(false); setExportAction(null); };
  
  const handleInspectKey = useCallback(async (keyToInspect?: string) => {
    const keyData = keyToInspect || keyImportInput;
    if (!keyData) { setImportError('Please paste a key to inspect.'); return; }
    setIsInspecting(true); setImportError(null); setImportedKeyProps(null);
    try {
        const { props } = await importAndInspectKey(keyData); setImportedKeyProps(props);
    } catch (err) { setImportError(err instanceof Error ? err.message : 'Failed to import or inspect key.'); }
    finally { setIsInspecting(false); }
  }, [keyImportInput]);

  const handleFileDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            if (typeof loadEvent.target?.result === 'string') {
                const fileContent = loadEvent.target.result;
                setKeyImportInput(fileContent);
                handleInspectKey(fileContent);
            }
        };
        reader.readAsText(file);
    }
  };

  const handleShareKey = async (keyType: 'public' | 'private' | 'symmetric') => {
    if (!generationResult) return;

    let key: string = '';
    let target: string = '';
    let properties: KeyProperties | null = null;
    
    try {
        if (generationResult.type === 'asymmetric') {
            const keyObject = keyType === 'public' ? generationResult.keyPair.publicKey : generationResult.keyPair.privateKey;
            key = keyType === 'public' ? publicKeyOutput : privateKeyOutput;
            target = keyType === 'public' ? TABS.ENCRYPT_DECRYPT : TABS.SIGN_VERIFY;
            properties = await inspectKey(keyObject);
        } else if (generationResult.type === 'symmetric') {
            key = symmetricOutput;
            target = TABS.ENCRYPT_DECRYPT;
            properties = await inspectKey(generationResult.key);
        } else if (generationResult.type === 'pgp') {
            const algoInfo = selectedAlgorithm.split('-'); // e.g. PGP-ECC-curve25519
            key = keyType === 'public' ? publicKeyOutput : privateKeyOutput;
            target = keyType === 'public' ? TABS.ENCRYPT_DECRYPT : TABS.SIGN_VERIFY;
            properties = {
                type: keyType as 'public' | 'private',
                algorithm: `PGP/${algoInfo[1]}`,
                size: algoInfo[1] === 'RSA' ? `${algoInfo[2]} bits` : algoInfo[2],
                usages: keyType === 'public' ? ['encrypt', 'verify'] : ['decrypt', 'sign'],
                extractable: true,
            };
        }

        if (key && target && properties) {
            onShareKey(key, target, properties);
        }
    } catch (e) {
        setError(e instanceof Error ? `Failed to prepare shared key: ${e.message}`: 'Unknown error preparing shared key');
    }
};

  const currentUsageInfo = USAGE_DESCRIPTIONS[selectedUsage];

  const canBeUsedForEncryption = ['Asymmetric Encryption', 'Symmetric Encryption', 'PGP / GPG'].includes(selectedUsage);
  const canBeUsedForSigning = ['Digital Signatures', 'SSH Authentication', 'PGP / GPG'].includes(selectedUsage);


  return (
    <div className="w-full mx-auto p-6 sm:p-8 bg-brand-secondary rounded-xl shadow-2xl space-y-8">
      <SecurityWarningModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmExport} />
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-primary flex items-center justify-center gap-3"><KeyIcon className="w-8 h-8"/>Key Generation & Inspection</h1>
        <p className="mt-2 text-gray-400">A simple, secure, browser-based tool for all your key needs.</p>
      </header>
      <SegmentedControl options={[{ label: 'Generate New Key', value: 'generate' }, { label: 'Inspect Existing Key', value: 'inspect' }]} selected={mode} onChange={(val) => setMode(val as 'generate' | 'inspect')} />

      {mode === 'generate' && (
        <>
            <KeyGenerationForm {...{ selectedUsage, setSelectedUsage, filteredAlgorithms, selectedAlgorithm, setSelectedAlgorithm, availableKeySizes, selectedKeySize, setSelectedKeySize: (val: string) => { setSelectedKeySize(val); setGenerationResult(null); setError(null); }, handleGenerateKey, isLoading, selectedAlgorithmInfo, currentUsageInfo }} />
            {isPgp && <PgpForm {...{ pgpUserInfo, handlePgpInfoChange, handlePgpBlur, pgpFormErrors, passphraseStrength }} />}
            
            <div className="pt-6 border-t border-gray-700 space-y-6">
                {error && (
                    <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 font-sans" role="alert">
                        <div className="flex items-start gap-3"><ErrorIcon className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-400" /><div><h3 className="font-semibold text-red-200">An Error Occurred</h3><p className="text-sm">{error}</p></div></div>
                    </div>
                )}
                
                <KeyDisplay {...{ isAsymmetricMode, isSsh, asymmetricExportFormat, isSymmetric, symmetricExportFormat, publicKeyOutput, privateKeyOutput, symmetricOutput, isLoading, error, isPgp }} />

                {generationResult && (
                  <div className="space-y-4">
                      <h2 className="text-lg font-semibold text-gray-200">Next Steps</h2>
                      <div className="p-4 bg-brand-dark rounded-lg border border-gray-700 space-y-3">
                        <p className="text-sm text-gray-400">Your key has been generated. You can now use it in other parts of the application.</p>
                        <div className="flex flex-wrap gap-3">
                            {canBeUsedForEncryption && isAsymmetricMode && publicKeyOutput && (
                                <button onClick={() => handleShareKey('public')} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-blue-500">
                                    Use Public Key to Encrypt <ArrowRightIcon className="w-4 h-4" />
                                </button>
                            )}
                            {canBeUsedForSigning && isAsymmetricMode && privateKeyOutput && (
                                <button onClick={() => handleShareKey('private')} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-blue-500">
                                    Use Private Key to Sign <ArrowRightIcon className="w-4 h-4" />
                                </button>
                            )}
                            {canBeUsedForEncryption && isSymmetric && symmetricOutput && (
                                <button onClick={() => handleShareKey('symmetric')} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-blue-500">
                                    Use Key to Encrypt/Decrypt <ArrowRightIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                      </div>
                  </div>
                )}

                <ExportOptions {...{ generationResult, isPgp, isSymmetric, isAsymmetric: isAsymmetricMode, isSsh, symmetricExportFormat, setSymmetricExportFormat, asymmetricExportFormat, setAsymmetricExportFormat, sshExportFormat, setSshExportFormat, handleExport, error, getSshExportFilename }}/>
                <CommandLineEquivalent command={commandLineEquivalent} />
            </div>
        </>
      )}

      {mode === 'inspect' && (
         <div className="space-y-6">
            <div>
                <label htmlFor="key-inspect-input" className="block text-sm font-medium text-gray-300 mb-2">Paste Key to Inspect (PEM, JWK, Base64, Hex)</label>
                <div className="relative">
                    <textarea id="key-inspect-input" value={keyImportInput} onChange={(e) => setKeyImportInput(e.target.value)}
                        onDrop={handleFileDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setIsDraggingOver(false); }}
                        className={`w-full p-3 bg-brand-dark text-brand-light border rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition font-mono text-sm ${isDraggingOver ? 'border-brand-primary ring-2 ring-brand-primary' : 'border-gray-600'}`}
                        rows={8} placeholder="-----BEGIN PUBLIC KEY-----..." />
                    {isDraggingOver && (
                        <div className="absolute inset-0 flex items-center justify-center bg-brand-secondary/80 border-2 border-dashed border-brand-primary rounded-md pointer-events-none">
                            <span className="text-lg font-semibold text-brand-light">Drop key file here</span>
                        </div>
                    )}
                </div>
                <button onClick={() => handleInspectKey()} disabled={isInspecting || !keyImportInput} className="mt-3 w-full sm:w-auto p-3 bg-brand-primary text-brand-dark font-bold rounded-md hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-secondary focus:ring-brand-primary transition disabled:bg-gray-500 disabled:cursor-not-allowed">
                    {isInspecting ? 'Inspecting...' : 'Inspect Key'}
                </button>
            </div>
            {importError && (
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 font-sans" role="alert">
                    <div className="flex items-start gap-3"><ErrorIcon className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-400" /><div><h3 className="font-semibold text-red-200">An Error Occurred</h3><p className="text-sm">{importError}</p></div></div>
                </div>
            )}
            {importedKeyProps && (
                <div className="p-4 bg-brand-dark rounded-lg border border-gray-700 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2"><KeyIcon className="w-5 h-5 text-brand-primary" /> Key Properties</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div><strong className="text-gray-400 block">Type</strong><span className="font-mono text-brand-primary capitalize">{importedKeyProps.type}</span></div>
                        <div><strong className="text-gray-400 block">Algorithm</strong><span className="font-mono">{importedKeyProps.algorithm}</span></div>
                        <div><strong className="text-gray-400 block">Size / Curve</strong><span className="font-mono">{importedKeyProps.size}</span></div>
                        <div><strong className="text-gray-400 block">Extractable</strong><span className="font-mono">{importedKeyProps.extractable ? 'Yes' : 'No'}</span></div>
                    </div>
                    <div>
                        <strong className="text-gray-400 block mb-2 text-sm">Permitted Usages</strong>
                        <div className="flex flex-wrap gap-2">
                            {importedKeyProps.usages.length > 0 ? (
                                importedKeyProps.usages.map(usage => (<span key={usage} className="px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-800 text-teal-200">{USAGE_DISPLAY_MAP[usage as string] || usage}</span>))
                            ) : (<span className="text-gray-500 text-xs">No specific usages defined.</span>)}
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default KeyGenerator;