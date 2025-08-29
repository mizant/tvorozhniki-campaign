// Vote tracking utilities to prevent duplicate voting
import { sendVoteToServer } from './voteServer.js';

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
 * Record a vote in all available storage mechanisms
 * @param {Object} voteData - The vote data to record
 * @returns {Object} The recorded vote data
 */
export async function recordVote(voteData) {
  const timestamp = Date.now();
  const fingerprint = generateBrowserFingerprint();
  
  const finalVote = {
    ...voteData,
    timestamp,
    fingerprint
  };

  // Method 1: localStorage
  try {
    localStorage.setItem('tvorozhniki_vote', JSON.stringify(finalVote));
  } catch (e) {
    console.warn('Failed to store vote in localStorage:', e);
  }

  // Method 2: sessionStorage
  try {
    sessionStorage.setItem('tvorozhniki_vote', JSON.stringify(finalVote));
  } catch (e) {
    console.warn('Failed to store vote in sessionStorage:', e);
  }

  // Method 3: IndexedDB
  try {
    const request = indexedDB.open('TvorozhnikiDB', 1);
    
    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('votes')) {
        db.createObjectStore('votes', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(['votes'], 'readwrite');
      const store = transaction.objectStore('votes');
      store.put({ id: 'latest', ...finalVote });
    };
  } catch (e) {
    console.warn('Failed to store vote in IndexedDB:', e);
  }

  // Method 4: Cookies (as a backup)
  try {
    document.cookie = `tvorozhniki_vote=${JSON.stringify(finalVote)}; max-age=31536000; path=/`;
  } catch (e) {
    console.warn('Failed to store vote in cookies:', e);
  }

  // Method 5: Fingerprint-based tracking
  // The fingerprint is already included in the vote data

  // Method 6: Send to central server
  try {
    console.log('Sending vote to server:', finalVote);
    await sendVoteToServer(finalVote);
    console.log('Vote successfully sent to central server');
  } catch (e) {
    console.warn('Failed to send vote to central server:', e);
    // Store in a retry queue for later attempts
    try {
      const pendingVotes = JSON.parse(localStorage.getItem('pending_votes') || '[]');
      pendingVotes.push(finalVote);
      localStorage.setItem('pending_votes', JSON.stringify(pendingVotes));
    } catch (storageError) {
      console.warn('Failed to store vote in retry queue:', storageError);
    }
  }

  return finalVote;
}

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
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const votes = getAllRequest.result || [];
          resolve(votes.length > 0);
        };
        
        getAllRequest.onerror = () => {
          resolve(false);
        };
      };
      
      request.onerror = () => {
        resolve(false);
      };
    } catch (error) {
      console.error('Error checking IndexedDB votes:', error);
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
 * Generate a random verification code
 */
export const generateVerificationCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Store pending vote with verification code
 */
export const storePendingVote = (voteData, code) => {
  sessionStorage.setItem('pending_vote', JSON.stringify(voteData));
  sessionStorage.setItem('verification_code', code);
};

/**
 * Verify a pending vote with email confirmation
 * @param {string} code - The verification code entered by the user
 * @returns {Object} Result of the verification
 */
export async function verifyPendingVote(code) {
  try {
    const pendingVote = JSON.parse(sessionStorage.getItem('pending_vote') || 'null');
    const storedCode = sessionStorage.getItem('verification_code');
    
    if (!pendingVote || !storedCode) {
      return { success: false, error: 'Нет данных для подтверждения' };
    }
    
    if (code === storedCode) {
      // Record the verified vote
      const finalVote = await recordVote(pendingVote);
      
      // Clean up temporary storage
      sessionStorage.removeItem('pending_vote');
      sessionStorage.removeItem('verification_code');
      
      return { success: true, vote: finalVote };
    } else {
      return { success: false, error: 'Неверный код подтверждения' };
    }
  } catch (error) {
    console.error('Error verifying pending vote:', error);
    return { success: false, error: 'Ошибка при подтверждении голоса' };
  }
}