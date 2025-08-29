// Vote data aggregation and analysis utilities
import { fetchVotingStatistics } from './voteServer.js';

/**
 * Get all votes from various storage methods
 */
export const getAllVotes = async () => {
  const votes = [];
  
  // Get vote from localStorage
  const localStorageVote = localStorage.getItem('tvorozhniki_vote_cast');
  if (localStorageVote) {
    try {
      const vote = JSON.parse(localStorageVote);
      votes.push({ ...vote, source: 'localStorage' });
    } catch (err) {
      console.warn('Error parsing localStorage vote:', err);
    }
  }
  
  // Get votes from IndexedDB
  const indexedDBVotes = await getVotesFromIndexedDB();
  votes.push(...indexedDBVotes.map(vote => ({ ...vote, source: 'indexedDB' })));
  
  // Get votes from global vote collection (if exists)
  const globalVotes = getGlobalVotes();
  votes.push(...globalVotes.map(vote => ({ ...vote, source: 'global' })));
  
  // Remove duplicates based on fingerprint
  const uniqueVotes = votes.filter((vote, index, self) => 
    index === self.findIndex(v => v.fingerprint === vote.fingerprint)
  );
  
  return uniqueVotes;
};

/**
 * Get votes from IndexedDB
 */
const getVotesFromIndexedDB = async () => {
  if (!window.indexedDB) return [];
  
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('TvorozhnikVotes', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('votes')) {
          resolve([]);
          return;
        }
        
        const transaction = db.transaction(['votes'], 'readonly');
        const store = transaction.objectStore('votes');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result || []);
        };
        
        getAllRequest.onerror = () => {
          resolve([]);
        };
      };
      
      request.onerror = () => {
        resolve([]);
      };
    } catch (error) {
      console.error(error);
      resolve([]);
    }
  });
};

/**
 * Get votes from global collection (for cross-tab sharing)
 */
const getGlobalVotes = () => {
  try {
    const globalVotesStr = localStorage.getItem('tvorozhniki_global_votes');
    return globalVotesStr ? JSON.parse(globalVotesStr) : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

/**
 * Add vote to global collection for cross-tab statistics
 */
export const addToGlobalVotes = (voteData) => {
  try {
    const existingVotes = getGlobalVotes();
    
    // Check if vote already exists (by fingerprint)
    const existingVote = existingVotes.find(vote => vote.fingerprint === voteData.fingerprint);
    if (existingVote) {
      return; // Don't add duplicates
    }
    
    // Add new vote
    existingVotes.push(voteData);
    
    // Keep only last 1000 votes to prevent storage overflow
    if (existingVotes.length > 1000) {
      existingVotes.splice(0, existingVotes.length - 1000);
    }
    
    localStorage.setItem('tvorozhniki_global_votes', JSON.stringify(existingVotes));
  } catch (error) {
    console.warn('Error adding to global votes:', error);
  }
};

/**
 * Calculate voting statistics from local storage
 * @returns {Object} Voting statistics
 */
async function calculateLocalVotingStatistics() {
  const votes = await getAllVotes();
  
  const stats = {
    totalVotes: votes.length,
    tvorozhnikisVotes: 0,
    syrnikisVotes: 0,
    citiesData: {},
    recentVotes: [],
    votingTrend: []
  };
  
  votes.forEach(vote => {
    // Count vote choices
    if (vote.choice === 'tvorozhniki') {
      stats.tvorozhnikisVotes++;
    } else if (vote.choice === 'syrniki') {
      stats.syrnikisVotes++;
    }
    
    // Aggregate by city
    if (vote.city) {
      const cityKey = vote.city.toLowerCase().trim();
      if (!stats.citiesData[cityKey]) {
        stats.citiesData[cityKey] = {
          name: vote.city,
          votes: 0,
          tvorozhniki: 0,
          syrniki: 0
        };
      }
      stats.citiesData[cityKey].votes++;
      
      if (vote.choice === 'tvorozhniki') {
        stats.citiesData[cityKey].tvorozhniki++;
      } else if (vote.choice === 'syrniki') {
        stats.citiesData[cityKey].syrniki++;
      }
    }
  });
  
  // Sort votes by timestamp for recent activity
  const sortedVotes = votes
    .filter(vote => vote.timestamp)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10); // Last 10 votes
  
  stats.recentVotes = sortedVotes.map(vote => ({
    name: vote.name || 'Аноним',
    city: vote.city || 'Неизвестно',
    choice: vote.choice,
    timestamp: vote.timestamp,
    timeAgo: getTimeAgo(vote.timestamp)
  }));
  
  // Calculate top cities
  stats.topCities = Object.values(stats.citiesData)
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5);
  
  return stats;
}

/**
 * Calculate voting statistics with preference for server data
 * @returns {Promise<Object>} Voting statistics
 */
export async function calculateVotingStatistics() {
  // Try to fetch statistics from the central server first
  try {
    console.log('Fetching statistics from server...');
    const serverStats = await fetchVotingStatistics();
    console.log('Server statistics received:', serverStats);
    return serverStats;
  } catch (error) {
    console.warn('Failed to fetch server statistics, using local calculation:', error);
    // Fall back to local calculation if server is unavailable
    return calculateLocalVotingStatistics();
  }
}

/**
 * Calculate time ago in Russian
 */
const getTimeAgo = (timestamp) => {
  if (!timestamp) return 'недавно';
  
  const now = new Date();
  const voteTime = new Date(timestamp);
  const diffMs = now - voteTime;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'только что';
  if (diffMinutes < 60) return `${diffMinutes} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  if (diffDays === 1) return 'вчера';
  if (diffDays < 7) return `${diffDays} дн назад`;
  
  return voteTime.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  });
};

/**
 * Generate mock baseline data for better visualization
 * This simulates some existing votes to make the statistics more interesting
 */
export const generateBaselineData = () => {
  const baselineVotes = [
    { choice: 'tvorozhniki', city: 'Москва', name: 'Анна К.', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
    { choice: 'tvorozhniki', city: 'Санкт-Петербург', name: 'Дмитрий П.', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    { choice: 'syrniki', city: 'Казань', name: 'Елена М.', timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString() },
    { choice: 'tvorozhniki', city: 'Новосибирск', name: 'Алексей В.', timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
    { choice: 'tvorozhniki', city: 'Екатеринбург', name: 'Мария С.', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    { choice: 'tvorozhniki', city: 'Москва', name: 'Игорь Б.', timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
    { choice: 'syrniki', city: 'Ростов-на-Дону', name: 'Ольга З.', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
    { choice: 'tvorozhniki', city: 'Краснодар', name: 'Андрей Н.', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  ];
  
  // Add baseline votes to global collection if not already present
  const existingVotes = getGlobalVotes();
  if (existingVotes.length === 0) {
    baselineVotes.forEach(vote => {
      const voteWithFingerprint = {
        ...vote,
        id: `baseline_${Math.random().toString(36).substr(2, 9)}`,
        fingerprint: `baseline_${Math.random().toString(36).substr(2, 9)}`
      };
      addToGlobalVotes(voteWithFingerprint);
    });
  }
};

/**
 * Initialize statistics system
 */
export const initializeStatistics = () => {
  // Generate baseline data if needed
  generateBaselineData();
};

/**
 * Clear all voting data (for development/testing)
 */
export const clearAllVotingData = () => {
  localStorage.removeItem('tvorozhniki_global_votes');
  localStorage.removeItem('tvorozhniki_vote_cast');
  localStorage.removeItem('tvorozhniki_fingerprints');
  sessionStorage.removeItem('tvorozhniki_vote_session');
  
  // Clear IndexedDB
  if (window.indexedDB) {
    indexedDB.deleteDatabase('TvorozhnikVotes');
  }
};