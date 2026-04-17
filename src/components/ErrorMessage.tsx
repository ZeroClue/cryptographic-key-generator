import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  suggestions?: string[];
  error?: Error | string;
  onCopyError?: () => void;
  showCopyButton?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const getActionableSuggestions = (message: string): string[] => {
  const suggestions: string[] = [];

  // Common error patterns and their suggestions
  if (message.toLowerCase().includes('algorithm')) {
    suggestions.push('Check that you have selected the correct algorithm for your use case.');
    suggestions.push('Ensure the algorithm is supported by your browser/web environment.');
  }

  if (message.toLowerCase().includes('key size')) {
    suggestions.push('Try using a smaller key size if available for your algorithm.');
    suggestions.push('Some algorithms have minimum/maximum key size requirements.');
  }

  if (message.toLowerCase().includes('pgp') || message.toLowerCase().includes('gpg')) {
    suggestions.push('Ensure you have entered valid PGP user information (name and email).');
    suggestions.push('Check that your passphrases match when creating PGP keys.');
  }

  if (message.toLowerCase().includes('passphrase')) {
    suggestions.push('Try a stronger passphrase with more characters or special characters.');
    suggestions.push('Make sure your passphrases match exactly when confirming.');
  }

  if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('format')) {
    suggestions.push('Check that you have pasted the key in the correct format.');
    suggestions.push('Ensure there are no extra spaces or characters at the beginning/end.');
    suggestions.push('Try removing PEM headers (-----BEGIN/-----END) if importing raw key data.');
  }

  if (message.toLowerCase().includes('import') || message.toLowerCase().includes('inspect')) {
    suggestions.push('Make sure the key is in a supported format (PEM, JWK, Base64, Hex).');
    suggestions.push('Check that the key is not corrupted or truncated.');
    suggestions.push('Verify you have pasted the complete key material.');
  }

  if (message.toLowerCase().includes('web crypto') || message.toLowerCase().includes('browser')) {
    suggestions.push('Try using a modern browser like Chrome, Firefox, or Safari.');
    suggestions.push('Some cryptographic operations require HTTPS in production.');
    suggestions.push('Clear browser cache and try again if the error persists.');
  }

  if (message.toLowerCase().includes('timeout') || message.toLowerCase().includes('slow')) {
    suggestions.push('Key generation may take longer for larger key sizes. Please be patient.');
    suggestions.push('Try using a smaller key size or close other browser tabs to free up resources.');
  }

  // General suggestions if no specific patterns match
  if (suggestions.length === 0) {
    suggestions.push('Double-check all your input values and try again.');
    suggestions.push('Refresh the page and attempt the operation again.');
    suggestions.push('Check your internet connection if this is a network-related issue.');
  }

  return suggestions;
};

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'An Error Occurred',
  message,
  error,
  suggestions,
  onCopyError,
  showCopyButton = false,
  className = '',
  icon
}) => {
  const errorText = error instanceof Error ? error.message : error || '';
  const fullMessage = errorText ? `${message}: ${errorText}` : message;
  const actionableSuggestions = suggestions || getActionableSuggestions(message);

  const handleCopyError = () => {
    const errorContent = `[ERROR] ${title}\n\nMessage: ${message}\n\n${errorText ? `Details: ${errorText}\n\n` : ''}Timestamp: ${new Date().toISOString()}`;
    navigator.clipboard.writeText(errorContent).then(() => {
      // Optional: Show feedback that error was copied
      if (onCopyError) {
        onCopyError();
      }
    });
  };

  return (
    <div className={`p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 font-sans ${className}`} role="alert">
      <div className="flex items-start gap-3">
        {icon || (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-red-200">{title}</h3>
          <p className="text-sm mt-1">{message}</p>
          {errorText && (
            <p className="text-xs text-red-400 mt-1 font-mono bg-red-900/30 p-2 rounded">
              {errorText}
            </p>
          )}

          {actionableSuggestions.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-red-200 mb-2">Suggestions:</h4>
              <ul className="text-xs text-red-400 space-y-1">
                {actionableSuggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showCopyButton && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleCopyError}
                className="text-xs text-red-400 hover:text-red-300 underline transition-colors focus:outline-none"
                aria-label="Copy error details"
              >
                Copy error details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Predefined error components for common scenarios
export const KeyGenerationError: React.FC<{
  message: string;
  error?: Error | string;
  suggestions?: string[];
}> = ({ message, error, suggestions }) => (
  <ErrorMessage
    title="Key Generation Failed"
    message={message}
    error={error}
    suggestions={suggestions}
    showCopyButton
  />
);

export const KeyImportError: React.FC<{
  message: string;
  error?: Error | string;
  suggestions?: string[];
}> = ({ message, error, suggestions }) => (
  <ErrorMessage
    title="Key Import Failed"
    message={message}
    error={error}
    suggestions={suggestions}
    showCopyButton
  />
);

export const EncryptionError: React.FC<{
  message: string;
  error?: Error | string;
  suggestions?: string[];
}> = ({ message, error, suggestions }) => (
  <ErrorMessage
    title="Encryption Failed"
    message={message}
    error={error}
    suggestions={suggestions}
    showCopyButton
  />
);

export default ErrorMessage;