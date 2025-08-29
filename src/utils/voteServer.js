// Utility functions for communicating with the central vote server

// Use Railway backend URL in production, localhost in development
const SERVER_URL = typeof process !== 'undefined' && process.env.VOTE_SERVER_URL 
  ? process.env.VOTE_SERVER_URL 
  : (typeof window !== 'undefined' && window.location.hostname === 'localhost') 
    ? 'http://localhost:3000' 
    : 'https://tvorozhniki-campaign-production.up.railway.app'; // Updated with your actual Railway URL

/**
 * Send a vote to the central server
 * @param {Object} voteData - The vote data to send
 * @returns {Promise<Object>} The server response
 */
export async function sendVoteToServer(voteData) {
  try {
    console.log('Sending vote to:', `${SERVER_URL}/api/votes`);
    console.log('Vote data:', voteData);
    
    const response = await fetch(`${SERVER_URL}/api/votes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(voteData),
    });

    console.log('Server response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Server responded with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Server response:', result);
    return result;
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
    console.log('Fetching voting statistics from:', `${SERVER_URL}/api/votes/stats`);
    const response = await fetch(`${SERVER_URL}/api/votes/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Statistics response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Statistics error response:', errorText);
      throw new Error(`Server responded with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Statistics response:', result);
    return result;
  } catch (error) {
    console.error('Failed to fetch voting statistics from server:', error);
    throw error;
  }
}
