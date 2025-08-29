# Deployment Guide for ТВОРОЖНИКИ.РФ

## Prerequisites
1. Domain: творожники.рф (purchased from sweb.ru)
2. Hosting service that supports static websites
3. FTP/SFTP access or deployment tool provided by your hosting provider

## Build Process
The website has already been built. The production files are located in the `dist` directory:
- `index.html` - Main HTML file
- `assets/` - Directory containing CSS, JavaScript, and other assets

## Deployment Options

### Option 1: GitHub Pages (Free Hosting)
This project is configured to work with GitHub Pages:

1. Create a new repository on GitHub named `tvorozhniki-campaign`
2. Push the code to GitHub:
   ```bash
   git remote add origin https://github.com/yourusername/tvorozhniki-campaign.git
   git branch -M main
   git push -u origin main
   ```
3. Go to your repository settings on GitHub
4. Navigate to "Pages" section
5. Select "GitHub Actions" as the source
6. The site will be automatically deployed to:
   `https://yourusername.github.io/tvorozhniki-campaign/`

The GitHub Actions workflow will automatically build and deploy your site whenever you push to the main branch.

### Option 2: Using FTP/SFTP
1. Connect to your hosting provider using FTP/SFTP client
2. Upload all contents from the `dist` directory to your website's root directory
3. Ensure the following files are uploaded:
   - `index.html`
   - `404.html`
   - `robots.txt`
   - `sitemap.xml`
   - `assets/` directory with all its contents

### Option 3: Using sweb.ru Control Panel
1. Log in to your sweb.ru hosting control panel
2. Navigate to the file manager for your domain
3. Upload all contents from the `dist` directory to your website's root directory
4. Set `index.html` as your default page if required

## Post-Deployment Checklist
- [ ] Verify the website loads correctly at https://творожники.рф/
- [ ] Check that all navigation links work
- [ ] Test the voting functionality
- [ ] Verify social sharing buttons work
- [ ] Confirm the 404 page displays correctly for non-existent pages
- [ ] Check that the favicon appears in the browser tab

## Updating the Website
To make changes to the website:
1. Modify the source files in the `src` directory
2. Run `npm run build` to create a new production build
3. Upload the updated files from the `dist` directory to your hosting provider

## Troubleshooting
- If the website doesn't load, check that all files were uploaded correctly
- If CSS is not loading, verify that the paths in `index.html` are correct
- If there are JavaScript errors, ensure all files from the `assets` directory are uploaded

## Support
For any issues with deployment, contact your hosting provider's support team.