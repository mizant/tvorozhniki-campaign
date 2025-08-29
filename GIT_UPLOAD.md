# Git Upload Instructions

## Prerequisites
1. GitHub account (or other Git hosting service)
2. Git installed on your local machine

## Steps to Upload to GitHub

### 1. Create a New Repository on GitHub
1. Go to https://github.com/
2. Log in to your account
3. Click the "+" icon in the top right corner and select "New repository"
4. Name your repository (e.g., "tvorozhniki-campaign")
5. Choose Public (or Private if you prefer)
6. **Do NOT initialize with a README** - leave all checkboxes unchecked
7. Click "Create repository"

### 2. Connect Your Local Repository to GitHub
After creating the repository on GitHub, you'll get a repository URL. It will look something like:
`https://github.com/yourusername/tvorozhniki-campaign.git`

Run these commands in your terminal (replace the URL with your actual repository URL):

```bash
cd tvorozhniki-campaign
git branch -M main
git remote add origin https://github.com/yourusername/tvorozhniki-campaign.git
git push -u origin main
```

### 3. Future Updates
To push future changes to GitHub:

```bash
git add .
git commit -m "Description of changes"
git push
```

## Troubleshooting

If you get authentication errors:
1. Use GitHub CLI: `gh auth login`
2. Or use a Personal Access Token instead of password
3. Or set up SSH keys for authentication

## Alternative Git Hosting Services

If you prefer other services:
- GitLab: https://gitlab.com/
- Bitbucket: https://bitbucket.org/
- Self-hosted Git: You can host your own Git server

The process is similar for all services.