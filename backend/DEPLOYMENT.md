# Railway Deployment Guide

## Prerequisites

1. A Railway account (https://railway.app/)
2. This backend project ready for deployment

## Deployment Steps

### 1. Prepare Your Project

Make sure your project structure looks like this:
```
backend/
├── server.js
├── package.json
├── railway.json
├── .gitignore
├── .env.example
└── README.md
```

### 2. Initialize Git Repository (if not already done)

```bash
cd backend
git init
git add .
git commit -m "Initial commit for Railway deployment"
```

### 3. Deploy to Railway Using CLI

1. Install the Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Create a new project:
   ```bash
   railway init
   ```

4. Deploy the project:
   ```bash
   railway up
   ```

### 4. Deploy to Railway Using GitHub Integration

1. Push your backend code to a GitHub repository
2. Go to https://railway.app/
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Railway will automatically detect it as a Node.js project
7. Click "Deploy"

### 5. Configure Environment Variables

After deployment, you may want to set environment variables:

1. Go to your Railway project dashboard
2. Click on your service
3. Go to the "Variables" tab
4. Add any needed variables:
   - `PORT` (optional, defaults to 3000)
   - `DB_PATH` (optional, defaults to ./votes.db)

### 6. Update Frontend Configuration

Once deployed, you'll need to update your frontend to point to the Railway URL:

1. Get your Railway app URL from the Railway dashboard
2. Update the [SERVER_URL](file:///c%3A/Projects/tvorozhniki\tvorozhniki-campaign\src\utils\voteServer.js#L3-L9) in [src/utils/voteServer.js](file:///c%3A/Projects/tvorozhniki\tvorozhniki-campaign\src\utils\voteServer.js) to your Railway URL
3. Rebuild and redeploy your frontend

## Database Information

The application uses SQLite for data storage. The database file (`votes.db`) will be created automatically when the application starts. On Railway, this file will be stored in the ephemeral filesystem, which means it will be reset when the application restarts.

For production use, consider using a persistent database solution like:
- Railway's managed PostgreSQL
- MongoDB Atlas
- Another persistent database service

## Troubleshooting

### Common Issues

1. **CORS errors**: Make sure your frontend URL is added to the CORS configuration in [server.js](file:///c%3A/Projects/tvorozhniki\tvorozhniki-campaign\backend\server.js)

2. **Port issues**: Railway sets the `PORT` environment variable automatically. Make sure your server uses `process.env.PORT` if available.

3. **Database permissions**: Ensure the application has write permissions to the directory where the SQLite database file is stored.

### Logs and Monitoring

1. View application logs in the Railway dashboard
2. Use `railway logs` command if using the CLI
3. Set up alerts in Railway for production monitoring

## Scaling Considerations

For high-traffic applications, consider:

1. Upgrading your Railway plan
2. Using a managed database service instead of SQLite
3. Implementing caching for statistics endpoints
4. Adding rate limiting to prevent abuse