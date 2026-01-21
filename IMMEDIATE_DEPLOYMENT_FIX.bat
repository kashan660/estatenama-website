@echo off
echo ========================================
echo 🚨 IMMEDIATE DEPLOYMENT FIX - ESTATENAMA.COM
echo ========================================
echo.
echo 📅 After 12+ hours of frustration - LET'S FIX THIS!
echo.

:: Check current directory
echo 📍 Current Directory: %CD%

:: Verify we're in the right location
if not exist index.html (
    echo ❌ ERROR: Not in estatenama.com directory!
    echo Please navigate to: d:\estatenama.com
    pause
    exit /b 1
)

echo ✅ Found estatenama.com project directory
echo.

:: Check Node.js installation
echo 📋 Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! This is CRITICAL.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version and run installer
    pause
    exit /b 1
)

echo ✅ Node.js is installed
echo.

:: Check Vercel CLI
echo 📋 Checking Vercel CLI...
vercel --version
if %errorlevel% neq 0 (
    echo ⚠️ Vercel CLI not found. Installing now...
    npm install -g vercel
    
    :: Verify installation
    vercel --version
    if %errorlevel% neq 0 (
        echo ❌ FAILED to install Vercel CLI
        echo Please try manual installation:
        echo npm install -g vercel
        pause
        exit /b 1
    )
)

echo ✅ Vercel CLI is ready
echo.

:: Show project structure
echo 📁 PROJECT STRUCTURE VERIFICATION:
echo.
if exist index.html (echo ✅ index.html - MAIN WEBSITE) else (echo ❌ index.html - MISSING!)
if exist server.js (echo ✅ server.js - WEB SERVER) else (echo ❌ server.js - MISSING!)
if exist vercel.json (echo ✅ vercel.json - DEPLOYMENT CONFIG) else (echo ❌ vercel.json - MISSING!)
if exist package.json (echo ✅ package.json - NODE CONFIG) else (echo ❌ package.json - MISSING!)
if exist admin-login.html (echo ✅ admin-login.html - ADMIN PANEL) else (echo ❌ admin-login.html - MISSING!)
if exist images (echo ✅ images/ - ASSETS DIRECTORY) else (echo ❌ images/ - MISSING!)

echo.
echo ========================================
echo 🚀 DEPLOYMENT COMMANDS TO RUN
echo ========================================
echo.
echo 📋 COPY AND PASTE THESE COMMANDS INTO GIT BASH:
echo.
echo 1. Navigate to project:
echo    cd /d/estatenama.com
echo.
echo 2. Install Vercel CLI (if needed):
echo    npm install -g vercel
echo.
echo 3. Login to Vercel:
echo    vercel login
echo.
echo 4. FORCE DEPLOYMENT TO PRODUCTION:
echo    vercel --prod --force
echo.
echo 5. Check deployment status:
echo    vercel ls
echo.
echo ========================================
echo ⚡ EMERGENCY DEPLOYMENT OPTIONS
echo ========================================
echo.
echo If the above fails, try these ALTERNATIVES:
echo.
echo Alternative 1: Deploy with clean cache
echo    vercel --prod --force --clean
echo.
echo Alternative 2: Deploy current directory
echo    vercel . --prod
echo.
echo Alternative 3: Use Vercel Dashboard
echo   1. Go to: https://vercel.com/dashboard
echo   2. Find "estatenama.com" project
echo   3. Click "Deploy" -> "Import Project"
echo   4. Connect your Git repository
echo   5. Deploy manually
echo.
echo ========================================
echo 📞 IMMEDIATE SUPPORT CONTACTS
echo ========================================
echo.
echo 🌐 Domain: estatenama.com
echo 📧 Email: info@estatenama.com
echo 📞 WhatsApp: 03195547788
echo 🏢 Address: Phase 7, Anarkali Restaurant, Bahria Town
echo.
echo 💼 Business: Real Estate - Plots, Residential, Commercial
echo 🤝 Partners: Faisal Town, Rudn Enclave, Kingdom Valley
echo.
echo ========================================
echo 🎯 FINAL DEPLOYMENT INSTRUCTIONS
echo ========================================
echo.
echo 1. OPEN GIT BASH
echo 2. RUN: cd /d/estatenama.com
echo 3. RUN: vercel --prod --force
echo 4. WAIT 2-3 minutes
echo 5. TEST: https://www.estatenama.com/
echo.
echo 🎉 YOUR WEBSITE WILL BE LIVE!
echo.
pause