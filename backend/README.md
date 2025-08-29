# ТВОРОЖНИКИ.РФ Vote API

Backend API for the ТВОРОЖНИКИ.РФ voting campaign, designed for deployment on Railway.

## Features

- SQLite database for storing votes
- RESTful API endpoints for vote submission and statistics
- Duplicate vote prevention using browser fingerprinting
- CORS support for frontend integration
- Health check endpoint

## API Endpoints

### `POST /api/votes`
Submit a vote

**Request Body:**
```json
{
  "choice": "tvorozhniki", // or "syrniki"
  "name": "User Name",
  "city": "User City",
  "email": "user@example.com", // optional
  "fingerprint": "browser_fingerprint"
}
```

**Response:**
```json
{
  "id": 123,
  "message": "Vote recorded successfully"
}
```

### `GET /api/votes/stats`
Get voting statistics

**Response:**
```json
{
  "totalVotes": 100,
  "tvorozhnikisVotes": 65,
  "syrnikisVotes": 35,
  "topCities": [
    {
      "city": "Moscow",
      "votes": 25,
      "tvorozhniki": 18,
      "syrniki": 7
    }
  ],
  "recentVotes": [
    {
      "name": "User Name",
      "city": "User City",
      "choice": "tvorozhniki",
      "timestamp": "2023-01-01T10:00:00Z",
      "timeAgo": "5 мин назад"
    }
  ]
}
```

### `GET /api/votes/recent`
Get recent votes

**Response:**
```json
[
  {
    "name": "User Name",
    "city": "User City",
    "choice": "tvorozhniki",
    "timestamp": "2023-01-01T10:00:00Z",
    "timeAgo": "5 мин назад"
  }
]
```

## Deployment to Railway

1. Create a new project on Railway
2. Connect your GitHub repository
3. Railway will automatically detect the Node.js project and deploy it
4. Add environment variables if needed:
   - `PORT` (optional, defaults to 3000)
   - `DB_PATH` (optional, defaults to ./votes.db)

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The API will be available at `http://localhost:3000`

## Database

The application uses SQLite for data storage. The database file (`votes.db`) will be created automatically when the application starts.