const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Initialize Express app
const app = express();
// Make sure we're using the PORT from Railway environment variables
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Add logging middleware to see incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize SQLite database
const dbPath = process.env.DB_PATH || './votes.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    choice TEXT NOT NULL,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    email TEXT,
    fingerprint TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating votes table:', err.message);
    } else {
      console.log('Votes table ready');
    }
  });

  // Create index for faster queries
  db.run(`CREATE INDEX IF NOT EXISTS idx_fingerprint ON votes(fingerprint)`, (err) => {
    if (err) {
      console.error('Error creating index:', err.message);
    }
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_timestamp ON votes(timestamp DESC)`, (err) => {
    if (err) {
      console.error('Error creating timestamp index:', err.message);
    }
  });
}

// API Routes

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'ТВОРОЖНИКИ.РФ Vote API is running', 
    timestamp: new Date().toISOString() 
  });
});

// Submit a vote
app.post('/api/votes', (req, res) => {
  console.log('Received vote request:', req.body);
  const { choice, name, city, email, fingerprint } = req.body;
  
  // Validate required fields
  if (!choice || !name || !city || !fingerprint) {
    console.log('Missing required fields:', { choice, name, city, fingerprint });
    return res.status(400).json({ 
      error: 'Missing required fields: choice, name, city, fingerprint' 
    });
  }
  
  // Check for duplicate vote by fingerprint
  db.get(`SELECT id FROM votes WHERE fingerprint = ?`, [fingerprint], (err, row) => {
    if (err) {
      console.error('Error checking for duplicate vote:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (row) {
      console.log('Duplicate vote detected for fingerprint:', fingerprint);
      return res.status(409).json({ 
        error: 'Vote already recorded for this device/browser' 
      });
    }
    
    // Insert new vote
    const stmt = db.prepare(`INSERT INTO votes (choice, name, city, email, fingerprint) 
                            VALUES (?, ?, ?, ?, ?)`);
    stmt.run([choice, name, city, email, fingerprint], function(err) {
      if (err) {
        console.error('Error inserting vote:', err.message);
        return res.status(500).json({ error: 'Failed to record vote' });
      }
      
      console.log('Vote recorded successfully with ID:', this.lastID);
      res.status(201).json({
        id: this.lastID,
        message: 'Vote recorded successfully'
      });
    });
    stmt.finalize();
  });
});

// Get voting statistics
app.get('/api/votes/stats', (req, res) => {
  // Get total votes and counts by choice
  db.all(`SELECT 
            COUNT(*) as totalVotes,
            SUM(CASE WHEN choice = 'tvorozhniki' THEN 1 ELSE 0 END) as tvorozhnikisVotes,
            SUM(CASE WHEN choice = 'syrniki' THEN 1 ELSE 0 END) as syrnikisVotes
          FROM votes`, [], (err, rows) => {
    if (err) {
      console.error('Error fetching vote statistics:', err.message);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }
    
    const stats = rows[0] || { totalVotes: 0, tvorozhnikisVotes: 0, syrnikisVotes: 0 };
    
    // Get votes by city
    db.all(`SELECT 
              city,
              COUNT(*) as votes,
              SUM(CASE WHEN choice = 'tvorozhniki' THEN 1 ELSE 0 END) as tvorozhniki,
              SUM(CASE WHEN choice = 'syrniki' THEN 1 ELSE 0 END) as syrniki
            FROM votes 
            GROUP BY city 
            ORDER BY votes DESC 
            LIMIT 10`, [], (err, cityRows) => {
      if (err) {
        console.error('Error fetching city statistics:', err.message);
        return res.status(500).json({ error: 'Failed to fetch statistics' });
      }
      
      stats.topCities = cityRows;
      
      // Get recent votes
      db.all(`SELECT 
                name, 
                city, 
                choice, 
                timestamp 
              FROM votes 
              ORDER BY timestamp DESC 
              LIMIT 10`, [], (err, voteRows) => {
        if (err) {
          console.error('Error fetching recent votes:', err.message);
          return res.status(500).json({ error: 'Failed to fetch statistics' });
        }
        
        stats.recentVotes = voteRows.map(vote => ({
          name: vote.name,
          city: vote.city,
          choice: vote.choice,
          timestamp: vote.timestamp,
          timeAgo: getTimeAgo(vote.timestamp)
        }));
        
        res.json(stats);
      });
    });
  });
});

// Get recent votes
app.get('/api/votes/recent', (req, res) => {
  db.all(`SELECT 
            name, 
            city, 
            choice, 
            timestamp 
          FROM votes 
          ORDER BY timestamp DESC 
          LIMIT 20`, [], (err, rows) => {
    if (err) {
      console.error('Error fetching recent votes:', err.message);
      return res.status(500).json({ error: 'Failed to fetch recent votes' });
    }
    
    const recentVotes = rows.map(vote => ({
      name: vote.name,
      city: vote.city,
      choice: vote.choice,
      timestamp: vote.timestamp,
      timeAgo: getTimeAgo(vote.timestamp)
    }));
    
    res.json(recentVotes);
  });
});

// Helper function to calculate time ago
function getTimeAgo(timestamp) {
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
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
// Listen on all interfaces (0.0.0.0) which is required for Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ТВОРОЖНИКИ.РФ Vote API server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});