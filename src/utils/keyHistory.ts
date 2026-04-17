import type { KeyProperties } from '../types';

interface KeyHistoryItem {
  id: string;
  key: string;
  algorithm: string;
  timestamp: number;
  properties: KeyProperties;
}

const MAX_HISTORY_ITEMS = 10;
const STORAGE_KEY = 'cryptographic-key-history';

/**
 * Adds a key to the session history
 * @param key - The key to add to history
 * @param algorithm - The algorithm of the key
 * @param properties - Key properties
 */
export const addToKeyHistory = (key: string, algorithm: string, properties: KeyProperties): void => {
  // Check if key already exists in history
  const history = getKeyHistory();
  const existingItem = history.find(item => item.key === key);

  if (existingItem) {
    // Remove existing item to re-add it at the top
    removeFromKeyHistory(existingItem.id);
  }

  const newItem: KeyHistoryItem = {
    id: crypto.randomUUID(),
    key,
    algorithm,
    timestamp: Date.now(),
    properties
  };

  // Add to beginning of array and limit size
  const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);

  // Store in sessionStorage
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
};

/**
 * Gets the key history from sessionStorage
 * @returns Array of KeyHistoryItem objects, sorted by timestamp (newest first)
 */
export const getKeyHistory = (): KeyHistoryItem[] => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const history = JSON.parse(stored);
    // Validate and sort by timestamp (newest first)
    return history
      .filter(item =>
        item.id &&
        item.key &&
        item.algorithm &&
        item.timestamp &&
        item.properties
      )
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error reading key history:', error);
    return [];
  }
};

/**
 * Removes a key from history by ID
 * @param id - The ID of the key to remove
 */
export const removeFromKeyHistory = (id: string): void => {
  const history = getKeyHistory();
  const updatedHistory = history.filter(item => item.id !== id);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
};

/**
 * Clears the entire key history
 */
export const clearKeyHistory = (): void => {
  sessionStorage.removeItem(STORAGE_KEY);
};

/**
 * Copies a key to clipboard and shows feedback
 * @param key - The key to copy
 * @param callback - Optional callback to execute after copy
 */
export const copyKeyToClipboard = async (key: string, callback?: () => void): Promise<void> => {
  try {
    await navigator.clipboard.writeText(key);
    if (callback) callback();
  } catch (error) {
    console.error('Failed to copy key:', error);
    throw new Error('Failed to copy key to clipboard');
  }
};