// Utility functions for communicating with the central vote server

// Use Railway backend URL in production, localhost in development
const SERVER_URL = typeof process !== 'undefined' && process.env.VOTE_SERVER_URL 
  ? process.env.VOTE_SERVER_URL 
  : (typeof window !== 'undefined' && window.location.hostname === 'localhost') 
    ? 'http://localhost:3000' 
    : 'https://your-railway-app-url.up.railway.app'; // Replace with your actual Railway URL

/**
 * Send a vote to the central server
 * @param {Object} voteData - The vote data to send
 * @returns {Promise<Object>} The server response
 */
export async function sendVoteToServer(voteData) {
  try {
    const response = await fetch(`${SERVER_URL}/api/votes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(voteData),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to send vote to server:', error);
    throw error;
  }
}

/**
 * Fetch recent votes from the central server
 * @returns {Promise<Array>} Array of recent votes
 */
export async function fetchRecentVotes() {
  try {
    const response = await fetch(`${SERVER_URL}/api/votes/recent`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch recent votes from server:', error);
    throw error;
  }
}

/**
 * Fetch voting statistics from the central server
 * @returns {Promise<Object>} Voting statistics
 */
export async function fetchVotingStatistics() {
  try {
    const response = await fetch(`${SERVER_URL}/api/votes/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch voting statistics from server:', error);
    throw error;
  }
}