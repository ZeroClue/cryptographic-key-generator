import React, { useState, useRef, useEffect } from 'react';
import type { KeyProperties } from '../../types';
import { getKeyHistory, removeFromKeyHistory, copyKeyToClipboard, clearKeyHistory } from '../../utils/keyHistory';
import { CheckIcon, CopyIcon, TrashIcon } from '../KeyGenerator';

interface KeyHistoryDropdownProps {
  onSelect?: (key: string, properties: KeyProperties) => void;
  onClose?: () => void;
}

const KeyHistoryDropdown: React.FC<KeyHistoryDropdownProps> = ({ onSelect, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const history = getKeyHistory();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (onClose) onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const handleCopy = async (key: string, id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await copyKeyToClipboard(key);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy key:', error);
    }
  };

  const handleSelect = (key: string, properties: KeyProperties, event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOpen(false);
    if (onSelect) onSelect(key, properties);
  };

  const handleDelete = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    removeFromKeyHistory(id);
    if (history.length <= 1) {
      setIsOpen(false);
      if (onClose) onClose();
    }
  };

  if (history.length === 0) {
    return (
      <div className="relative">
        <button
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
          aria-label="View key history"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>No recent keys</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-gray-200 transition-colors bg-gray-700 rounded-md hover:bg-gray-600"
        aria-label="View key history"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Recent Keys</span>
        <span className="text-xs bg-gray-600 px-1.5 py-0.5 rounded-full">
          {history.length}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-brand-secondary border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
          <div className="max-h-96 overflow-y-auto">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3 hover:bg-gray-700/50 border-b border-gray-700 last:border-b-0 cursor-pointer transition-colors"
                onClick={(e) => handleSelect(item.key, item.properties, e)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-400">
                        {item.algorithm}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300 font-mono break-all">
                      {item.key.substring(0, 30)}...
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={(e) => handleCopy(item.key, item.id, e)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-300 hover:bg-gray-600 rounded transition-colors"
                        aria-label={copiedId === item.id ? 'Copied!' : 'Copy key'}
                      >
                        {copiedId === item.id ? (
                          <CheckIcon className="w-3 h-3" />
                        ) : (
                          <CopyIcon className="w-3 h-3" />
                        )}
                        <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                        aria-label="Delete from history"
                      >
                        <TrashIcon className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-2 bg-gray-800 border-t border-gray-700">
            <button
              onClick={() => {
                clearKeyHistory();
                setIsOpen(false);
                if (onClose) onClose();
              }}
              className="w-full px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
            >
              Clear All History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Trash icon for delete button
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default KeyHistoryDropdown;