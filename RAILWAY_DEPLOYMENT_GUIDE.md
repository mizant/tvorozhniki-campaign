# Railway Deployment Guide for ТВОРОЖНИКИ.РФ

## Project Structure

Your project now has a complete backend API ready for deployment on Railway:

```
backend/
├── server.js          # Main server file with Express API
├── package.json       # Dependencies and scripts
├── railway.json       # Railway deployment configuration
├── .gitignore         # Files to ignore in Git
├── .env.example       # Environment variables template
├── README.md          # Backend documentation
├── DEPLOYMENT.md      # Detailed deployment instructions
└── test-api.js        # API testing script
```

## What You Need From You

To complete the deployment, I need the following information from you:

1. **GitHub Repository**: Do you have a GitHub repository for this project?
   - If yes, what is the URL?
   - If no, we'll need to create one

2. **Railway Account**: Do you have a Railway account?
   - If yes, please share your Railway project URL after creation
   - If no, you'll need to sign up at https://railway.app/

3. **Domain Preferences**: 
   - Do you want to use the default Railway domain or a custom domain?

## Deployment Steps

### 1. Prepare GitHub Repository

If you don't have a GitHub repository yet:
1. Create a new repository on GitHub
2. Push the backend code to this repository:
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial commit for Railway deployment"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

### 2. Deploy to Railway

1. Go to https://railway.app/
2. Sign up or log in to your account
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Railway will automatically detect it as a Node.js project
7. Click "Deploy"

### 3. Configure Environment Variables (Optional)

In the Railway dashboard:
1. Go to your project
2. Click on your service
3. Go to the "Variables" tab
4. Add any needed variables (usually not required for basic setup)

### 4. Update Frontend Configuration

After deployment, you'll need to update your frontend:
1. Get your Railway app URL from the Railway dashboard
2. Update the [SERVER_URL](file:///c%3A/Projects/tvorozhniki\tvorozhniki-campaign\src\utils\voteServer.js#L3-L9) in [src/utils/voteServer.js](file:///c%3A/Projects/tvorozhniki\tvorozhniki-campaign\src\utils\voteServer.js) to your Railway URL
3. Rebuild and redeploy your frontend

## API Endpoints

Your backend provides the following endpoints:

- `POST /api/votes` - Submit a vote
- `GET /api/votes/stats` - Get voting statistics
- `GET /api/votes/recent` - Get recent votes
- `GET /` - Health check endpoint

## Testing the API

You can test your API locally before deployment:
1. Go to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Start the server: `node server.js`
4. Run the test script: `node test-api.js`

## Database Information

The application uses SQLite for data storage. The database file (`votes.db`) will be created automatically when the application starts.

## Troubleshooting

### Common Issues

1. **CORS errors**: The backend already includes CORS middleware for all origins
2. **Port issues**: Railway sets the `PORT` environment variable automatically
3. **Database permissions**: The SQLite database will be stored in the Railway filesystem

### Logs and Monitoring

1. View application logs in the Railway dashboard
2. Set up alerts in Railway for production monitoring

## Next Steps

1. [ ] Create/push to GitHub repository
2. [ ] Deploy backend to Railway
3. [ ] Update frontend with Railway URL
4. [ ] Rebuild and redeploy frontend
5. [ ] Test the complete system

## Support

If you encounter any issues during deployment, please reach out for assistance.