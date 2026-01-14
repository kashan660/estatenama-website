# EstateNama Website Deployment Guide

## 🚨 Current Issue: Main Website Showing 404 Errors

The main website at https://www.estatenama.com is currently showing 404 errors. This is because the Vercel deployment configuration needs to be updated.

## ✅ What Has Been Fixed

The following changes have been made to resolve the 404 errors:

1. **Updated vercel.json** to include all website files:
   - Added `index.html` to static builds
   - Added wildcard patterns for HTML, CSS, and JS files
   - Added image and upload directories
   - Added explicit route for `/index.html`

2. **Verified all files exist**:
   - Main index.html with proper SEO metadata
   - All image assets in the images directory
   - Server configuration is correct

## 🚀 Next Steps: Manual Deployment

Since the automated deployment tools aren't available, you need to manually push these changes to Git:

### Option 1: Run the Deployment Script

**For Windows (Command Prompt):**
```cmd
deploy.bat
```

**For Windows (PowerShell):**
```powershell
.\deploy.ps1
```

### Option 2: Manual Git Commands

Open your terminal/command prompt and run:

```bash
# Check current status
git status

# Add all changes
git add .

# Commit the changes
git commit -m "Fix main website 404 errors - Updated Vercel configuration to include all website files"

# Push to your repository
git push origin main
```

### Option 3: Using Git GUI

1. Open your Git GUI tool (GitHub Desktop, GitKraken, etc.)
2. Stage all changed files
3. Commit with message: "Fix main website 404 errors - Updated Vercel configuration to include all website files"
4. Push to origin/main

## 📋 Prerequisites

Before running the deployment, make sure:

1. **Git is installed** on your system
2. **You have a Git repository** initialized (`git init` if needed)
3. **You have a remote repository** configured:
   ```bash
   git remote add origin YOUR_GITHUB_REPO_URL
   ```
4. **You have proper authentication** set up (GitHub token, SSH key, etc.)

## 🔍 Verification Steps

After deployment, verify the fixes:

1. **Check Vercel Dashboard**: https://vercel.com/dashboard
2. **Test the main website**: https://www.estatenama.com
3. **Test admin login**: https://www.estatenama.com/admin-login.html
4. **Check server health**: https://www.estatenama.com/api/admin/health

## 🛠️ Files Modified

The following files have been updated:
- `vercel.json` - Updated builds and routes configuration
- `admin-auth.js` - Fixed localhost API endpoint
- `admin-dashboard.js` - Fixed image manager navigation
- `admin-images.html` - Added authentication check
- `admin-login.html` - Added debug tools

## 📞 Need Help?

If you encounter any issues:

1. Check the Vercel deployment logs
2. Verify your Git repository settings
3. Ensure all files are properly committed
4. Check that your Vercel project is linked to the correct Git repository

## 🎯 Expected Outcome

Once successfully deployed:
- Main website will load without 404 errors
- Admin login will work with the new credentials
- Image manager will be accessible from the dashboard
- All static files will be properly served