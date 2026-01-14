#!/bin/bash

# EstateNama Vercel Deployment Script
echo "🚀 Starting EstateNama deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo ""
echo "📋 Your website will be available at:"
echo "   Main Website: https://your-domain.vercel.app"
echo "   Admin Panel: https://your-domain.vercel.app/admin/admin-login.html"
echo ""
echo "🔑 Admin Credentials:"
echo "   Username: admin | Password: admin123"
echo "   Username: estatenama | Password: estate2024"
echo ""
echo "⚠️  IMPORTANT: Change default passwords immediately after first login!"