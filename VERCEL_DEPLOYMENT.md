# Vercel Deployment Configuration

This project is configured for deployment on Vercel with multiple server functions.

## Deployment Setup

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy the project:**
   ```bash
   vercel --prod
   ```

## Server Functions

The project uses three server functions:

1. **Main Website Server** (`server.js`)
   - Handles the main website and static files
   - Route: `/` (all other routes)

2. **Admin Panel Server** (`admin-server.js`)
   - Handles admin dashboard and API
   - Routes: `/admin/*` and `/api/admin/*`

3. **Image Server** (`image-server.js`)
   - Handles image uploads and serving
   - Route: `/images/*`

## Environment Variables

Set these environment variables in Vercel dashboard:

```bash
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
ADMIN_PASSWORD=your-secure-admin-password
ESTATENAMA_PASSWORD=your-secure-estatenama-password
```

## Admin Dashboard Access

After deployment, access your admin dashboard at:
- **Admin Login:** `https://your-domain.vercel.app/admin/admin-login.html`
- **Admin Dashboard:** `https://your-domain.vercel.app/admin/admin-dashboard.html`

**Default Credentials:**
- Username: `admin` | Password: `admin123`
- Username: `estatenama` | Password: `estate2024`

## Troubleshooting

### 404 Errors
If you see 404 errors, ensure:
1. All server files exist in the project root
2. Environment variables are set correctly
3. The deployment completed successfully

### Server Issues
Check Vercel function logs in the Vercel dashboard for any server errors.

## Custom Domain

To use your custom domain (estatenama.com):
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings > Domains
4. Add your domain and follow DNS configuration instructions