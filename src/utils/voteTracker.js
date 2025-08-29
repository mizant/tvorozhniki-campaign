// Vote tracking utilities to prevent duplicate voting
import { addToGlobalVotes } from './voteDataAnalyzer';

/**
 * Generate a simple browser fingerprint based on available browser characteristics
 */
export const generateBrowserFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('Browser fingerprint test', 2, 2);
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvas.toDataURL(),
    plugins: Array.from(navigator.plugins).map(p => p.name).join(','),
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack
  };

  // Create hash from fingerprint
  const fingerprintString = JSON.stringify(fingerprint);
  let hash = 0;
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
};

/**
 * Check if user has already voted using multiple methods
 */
export const hasUserVoted = () => {
  // Method 1: Check localStorage
  const localStorageVote = localStorage.getItem('tvorozhniki_vote_cast');
  
  // Method 2: Check sessionStorage (survives page refresh but not browser close)
  const sessionVote = sessionStorage.getItem('tvorozhniki_vote_session');
  
  // Method 3: Check browser fingerprint
  const browserFingerprint = generateBrowserFingerprint();
  const storedFingerprints = JSON.parse(localStorage.getItem('tvorozhniki_fingerprints') || '[]');
  const fingerprintExists = storedFingerprints.includes(browserFingerprint);

  return {
    hasVoted: !!(localStorageVote || sessionVote || fingerprintExists),
    voteData: localStorageVote ? JSON.parse(localStorageVote) : null,
    fingerprint: browserFingerprint,
    detectionMethods: {
      localStorage: !!localStorageVote,
      sessionStorage: !!sessionVote,
      fingerprint: fingerprintExists
    }
  };
};

/**
 * Record a vote with multiple tracking methods
 */
export const recordVote = (voteData) => {
  const timestamp = new Date().toISOString();
  const browserFingerprint = generateBrowserFingerprint();
  
  const voteRecord = {
    ...voteData,
    timestamp,
    fingerprint: browserFingerprint,
    id: generateVoteId()
  };

  // Method 1: localStorage (persistent)
  localStorage.setItem('tvorozhniki_vote_cast', JSON.stringify(voteRecord));
  
  // Method 2: sessionStorage (session-based)
  sessionStorage.setItem('tvorozhniki_vote_session', JSON.stringify(voteRecord));
  
  // Method 3: Add fingerprint to collection
  const storedFingerprints = JSON.parse(localStorage.getItem('tvorozhniki_fingerprints') || '[]');
  if (!storedFingerprints.includes(browserFingerprint)) {
    storedFingerprints.push(browserFingerprint);
    localStorage.setItem('tvorozhniki_fingerprints', JSON.stringify(storedFingerprints));
  }

  // Method 4: Store in IndexedDB for more persistent storage
  storeVoteInIndexedDB(voteRecord);
  
  // Method 5: Add to global vote collection for statistics
  addToGlobalVotes(voteRecord);

  return voteRecord;
};

/**
 * Generate a unique vote ID
 */
const generateVoteId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Store vote in IndexedDB for enhanced persistence
 */
const storeVoteInIndexedDB = async (voteRecord) => {
  if (!window.indexedDB) return;

  try {
    const request = indexedDB.open('TvorozhnikVotes', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('votes')) {
        const store = db.createObjectStore('votes', { keyPath: 'id' });
        store.createIndex('fingerprint', 'fingerprint', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['votes'], 'readwrite');
      const store = transaction.objectStore('votes');
      store.add(voteRecord);
    };
  } catch (error) {
    console.warn('IndexedDB storage failed:', error);
  }
};

/**
 * Check IndexedDB for existing votes
 */
export const checkIndexedDBVotes = async () => {
  if (!window.indexedDB) return false;

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('TvorozhnikVotes', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('votes')) {
          resolve(false);
          return;
        }

        const transaction = db.transaction(['votes'], 'readonly');
        const store = transaction.objectStore('votes');
        const fingerprint = generateBrowserFingerprint();
        const index = store.index('fingerprint');
        const request = index.getAll(fingerprint);

        request.onsuccess = () => {
          resolve(request.result.length > 0);
        };

        request.onerror = () => {
          resolve(false);
        };
      };

      request.onerror = () => {
        resolve(false);
      };
    } catch (error) {
      resolve(false);
    }
  });
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate verification code for email
 */
export const generateVerificationCode = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

/**
 * Store pending vote for email verification
 */
export const storePendingVote = (voteData, verificationCode) => {
  const pendingVote = {
    ...voteData,
    verificationCode,
    timestamp: new Date().toISOString(),
    expires: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
  };
  
  localStorage.setItem('tvorozhniki_pending_vote', JSON.stringify(pendingVote));
  return pendingVote;
};

/**
 * Verify and confirm pending vote
 */
export const verifyPendingVote = (inputCode) => {
  const pendingVoteStr = localStorage.getItem('tvorozhniki_pending_vote');
  if (!pendingVoteStr) return { success: false, error: 'Нет ожидающих голосов' };

  const pendingVote = JSON.parse(pendingVoteStr);
  
  // Check if expired
  if (new Date() > new Date(pendingVote.expires)) {
    localStorage.removeItem('tvorozhniki_pending_vote');
    return { success: false, error: 'Код истёк. Попробуйте снова.' };
  }

  // Check code
  if (inputCode.toUpperCase() !== pendingVote.verificationCode) {
    return { success: false, error: 'Неверный код подтверждения' };
  }

  // Code is correct - record the vote
  const finalVote = recordVote(pendingVote);
  localStorage.removeItem('tvorozhniki_pending_vote');
  
  return { success: true, vote: finalVote };
};

/**
 * Clear all vote data (for testing purposes)
 */
export const clearAllVoteData = () => {
  localStorage.removeItem('tvorozhniki_vote_cast');
  localStorage.removeItem('tvorozhniki_fingerprints');
  localStorage.removeItem('tvorozhniki_pending_vote');
  sessionStorage.removeItem('tvorozhniki_vote_session');
  
  // Clear IndexedDB
  if (window.indexedDB) {
    indexedDB.deleteDatabase('TvorozhnikVotes');
  }
};