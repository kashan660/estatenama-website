#!/bin/bash

echo "🚀 EstateNama Website Deployment Script"
echo "========================================"
echo ""

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed or not in PATH"
    echo "Please install Git and try again"
    read -p "Press Enter to exit"
    exit 1
fi

echo "📋 Checking current Git status..."
git status
echo ""

echo "📁 Adding all changes to staging..."
git add .
echo ""

echo "💬 Committing changes..."
git commit -m "Fix main website 404 errors - Updated Vercel configuration to include all website files"
if [ $? -ne 0 ]; then
    echo "⚠️  No changes to commit or commit failed"
else
    echo "✅ Changes committed successfully"
fi
echo ""

echo "🔄 Pushing to remote repository..."
git push origin main
if [ $? -ne 0 ]; then
    echo "❌ Push failed. Please check your Git configuration and remote repository settings"
    echo "Make sure you have:"
    echo "- Configured your Git remote (git remote add origin YOUR_REPO_URL)"
    echo "- Proper authentication set up"
    echo "- Write permissions to the repository"
else
    echo "✅ Changes pushed successfully!"
    echo "🌐 Your website should be deployed automatically by Vercel"
fi
echo ""

echo "🎯 Deployment process completed!"
echo "Check your Vercel dashboard for deployment status:"
echo "https://vercel.com/dashboard"
read -p "Press Enter to exit"