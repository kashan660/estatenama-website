@echo off
echo ========================================
echo 🚨 EMERGENCY DEPLOYMENT DIAGNOSTICS
echo ========================================
echo.

:: Check if Node.js is installed
echo 📋 Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if Vercel CLI is installed
echo 📋 Checking Vercel CLI installation...
vercel --version
if %errorlevel% neq 0 (
    echo ⚠️ Vercel CLI not found. Installing...
    npm install -g vercel
    vercel --version
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Vercel CLI
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo 🔍 CHECKING PROJECT STRUCTURE
echo ========================================
echo.

:: Check critical files
echo 📁 Checking critical files...
if exist index.html (echo ✅ index.html - FOUND) else (echo ❌ index.html - MISSING)
if exist server.js (echo ✅ server.js - FOUND) else (echo ❌ server.js - MISSING) 
if exist vercel.json (echo ✅ vercel.json - FOUND) else (echo ❌ vercel.json - MISSING)
if exist package.json (echo ✅ package.json - FOUND) else (echo ❌ package.json - MISSING)

:: Check admin files
echo.
echo 📁 Checking admin files...
if exist admin-login.html (echo ✅ admin-login.html - FOUND) else (echo ❌ admin-login.html - MISSING)
if exist admin-dashboard.html (echo ✅ admin-dashboard.html - FOUND) else (echo ❌ admin-dashboard.html - MISSING)
if exist admin-server-prod.js (echo ✅ admin-server-prod.js - FOUND) else (echo ❌ admin-server-prod.js - MISSING)

:: Check directories
echo.
echo 📁 Checking directories...
if exist images (echo ✅ images/ - FOUND) else (echo ❌ images/ - MISSING)
if exist uploads (echo ✅ uploads/ - FOUND) else (echo ❌ uploads/ - MISSING)

echo.
echo ========================================
echo 🚀 DEPLOYMENT COMMANDS
echo ========================================
echo.
echo 📋 Run these commands in Git Bash:
echo.
echo 1. Install Vercel CLI (if needed):
echo    npm install -g vercel
echo.
echo 2. Login to Vercel:
echo    vercel login
echo.
echo 3. Force deployment to production:
echo    vercel --prod --force
echo.
echo 4. Check deployment status:
echo    vercel ls
echo.
echo 5. View deployment logs:
echo    vercel logs
echo.
echo ========================================
echo 📞 IMMEDIATE SUPPORT
echo ========================================
echo.
echo If deployment fails, check:
echo 1. Vercel Dashboard: https://vercel.com/dashboard
echo 2. Project Settings: https://vercel.com/estatenama/settings
echo 3. Deployment Logs: https://vercel.com/estatenama/deployments
echo.
echo 📧 Contact: info@estatenama.com
echo 📞 Phone: 03195547788
echo.
pause