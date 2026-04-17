import React, { useState, useEffect } from 'react';

interface CopyButtonProps {
  text: string;
  className?: string;
  buttonClassName?: string;
  ariaLabel?: string;
  tooltip?: string;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'primary';
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  className = '',
  buttonClassName = '',
  ariaLabel = 'Copy to clipboard',
  tooltip = 'Copied!',
  showTooltip = false,
  size = 'md',
  variant = 'default'
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showTooltipState, setShowTooltipState] = useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        // Check if the user is not currently typing in an input/textarea
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleCopy();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [text]);

  const handleCopy = () => {
    if (isCopied || !text) return;

    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setShowTooltipState(showTooltip);

      // Clear any existing timeout before setting a new one
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsCopied(false);
        setShowTooltipState(false);
      }, 2000);
    });
  };

  const sizeClasses = {
    sm: 'p-1 text-xs',
    md: 'p-1.5 text-sm',
    lg: 'p-2 text-base'
  };

  const variantClasses = {
    default: 'bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-brand-primary',
    ghost: 'bg-transparent hover:bg-gray-700 text-gray-300 focus:ring-brand-primary',
    primary: 'bg-brand-primary text-brand-dark hover:bg-teal-400 focus:ring-teal-400'
  };

  const baseClasses = `${sizeClasses[size]} ${variantClasses[variant]} rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark disabled:cursor-not-allowed ${buttonClassName}`;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={handleCopy}
        disabled={isCopied}
        aria-label={isCopied ? 'Copied!' : ariaLabel}
        className={`${baseClasses} ${isCopied ? 'cursor-default opacity-100' : ''}`}
      >
        {isCopied ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>

      {showTooltipState && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap shadow-lg z-10">
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default CopyButton;