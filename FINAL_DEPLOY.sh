#!/bin/bash

# 🚀 ESTATENAMA.COM FINAL DEPLOYMENT SCRIPT
# Execute this script to deploy your website to Vercel

echo "🚀 EstateNama.com Final Deployment Script"
echo "========================================"
echo ""

# Navigate to project directory
cd "d:/estatenama.com" || exit 1

echo "📍 Current Directory: $(pwd)"
echo ""

# Install Vercel CLI if not present
echo "📦 Installing Vercel CLI..."
npm install -g vercel

echo ""
echo "🚀 Deploying to Production..."
echo "This will take 1-2 minutes..."
echo ""

# Deploy to production
vercel --prod --force

echo ""
echo "🎯 DEPLOYMENT COMPLETE!"
echo ""
echo "✅ Test these URLs:"
echo "   Main Website: https://www.estatenama.com/"
echo "   Admin Login:  https://www.estatenama.com/admin-login.html"
echo "   Admin Dashboard: https://www.estatenama.com/admin-dashboard.html"
echo ""
echo "📊 Check deployment status at:"
echo "   https://vercel.com/dashboard"
echo ""
echo "🎉 Your stunning real estate website is now LIVE!"

read -p "Press Enter to exit"