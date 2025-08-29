// Simple test script to verify the API works
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('Testing ТВОРОЖНИКИ.РФ Vote API...\n');
  
  // Test health check
  try {
    const healthResponse = await fetch(`${API_URL}/`);
    const healthData = await healthResponse.json();
    console.log('✓ Health check:', healthData.message);
  } catch (error) {
    console.error('✗ Health check failed:', error.message);
    return;
  }
  
  // Test vote submission
  const testVote = {
    choice: 'tvorozhniki',
    name: 'Test User',
    city: 'Test City',
    email: 'test@example.com',
    fingerprint: 'test-fingerprint-' + Date.now()
  };
  
  try {
    const voteResponse = await fetch(`${API_URL}/api/votes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testVote)
    });
    
    const voteData = await voteResponse.json();
    
    if (voteResponse.ok) {
      console.log('✓ Vote submission:', voteData.message);
    } else {
      console.error('✗ Vote submission failed:', voteData.error);
    }
  } catch (error) {
    console.error('✗ Vote submission error:', error.message);
  }
  
  // Test statistics
  try {
    const statsResponse = await fetch(`${API_URL}/api/votes/stats`);
    const statsData = await statsResponse.json();
    
    if (statsResponse.ok) {
      console.log('✓ Statistics fetch:', `${statsData.totalVotes} total votes`);
    } else {
      console.error('✗ Statistics fetch failed:', statsData.error);
    }
  } catch (error) {
    console.error('✗ Statistics fetch error:', error.message);
  }
  
  // Test recent votes
  try {
    const recentResponse = await fetch(`${API_URL}/api/votes/recent`);
    const recentData = await recentResponse.json();
    
    if (recentResponse.ok) {
      console.log('✓ Recent votes fetch:', `${recentData.length} recent votes`);
    } else {
      console.error('✗ Recent votes fetch failed:', recentData.error);
    }
  } catch (error) {
    console.error('✗ Recent votes fetch error:', error.message);
  }
  
  console.log('\nAPI test completed.');
}

testAPI();