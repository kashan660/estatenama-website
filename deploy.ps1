# EstateNama Website Deployment Script
# Run this script to push changes to Git and deploy to Vercel

Write-Host "🚀 EstateNama Website Deployment Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if git is available
try {
    git --version | Out-Null
    Write-Host "✅ Git is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git and try again" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "📋 Checking current Git status..." -ForegroundColor Cyan
git status
Write-Host ""

Write-Host "📁 Adding all changes to staging..." -ForegroundColor Cyan
git add .
Write-Host ""

Write-Host "💬 Committing changes..." -ForegroundColor Cyan
git commit -m "Fix main website 404 errors - Updated Vercel configuration to include all website files"
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  No changes to commit or commit failed" -ForegroundColor Yellow
} else {
    Write-Host "✅ Changes committed successfully" -ForegroundColor Green
}
Write-Host ""

Write-Host "🔄 Pushing to remote repository..." -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Push failed. Please check your Git configuration and remote repository settings" -ForegroundColor Red
    Write-Host "Make sure you have:" -ForegroundColor Yellow
    Write-Host "- Configured your Git remote (git remote add origin YOUR_REPO_URL)" -ForegroundColor Yellow
    Write-Host "- Proper authentication set up" -ForegroundColor Yellow
    Write-Host "- Write permissions to the repository" -ForegroundColor Yellow
} else {
    Write-Host "✅ Changes pushed successfully!" -ForegroundColor Green
    Write-Host "🌐 Your website should be deployed automatically by Vercel" -ForegroundColor Green
}
Write-Host ""

Write-Host "🎯 Deployment process completed!" -ForegroundColor Green
Write-Host "Check your Vercel dashboard for deployment status:" -ForegroundColor Cyan
Write-Host "https://vercel.com/dashboard" -ForegroundColor Blue
Read-Host "Press Enter to exit"