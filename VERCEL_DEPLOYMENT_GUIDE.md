# EstateNama Vercel + Hostinger MySQL Deployment Guide

Your site stays on **Vercel**. Your database is on **Hostinger MySQL**. Here's how to connect them.

---

## Step 1: Set Up Hostinger Database

1. Log in to your **Hostinger hPanel**
2. Go to **Databases > phpMyAdmin**
3. Select your database: `u513195619_estatenamadb`
4. Click the **SQL** tab
5. Open `database-setup.sql` from this project
6. Copy all the SQL and paste it into phpMyAdmin
7. Click **Go**

This creates:
- `posts` table
- `blogs` table
- `pages` table
- `projects` table
- `images` table
- `settings` table

---

## Step 2: Update Vercel Environment Variables (Recommended)

Instead of relying on `db-config.json`, set these in your Vercel dashboard:

1. Go to [vercel.com](https://vercel.com) → Your Project → **Settings** → **Environment Variables**
2. Add these variables:

| Variable | Value |
|----------|-------|
| `DB_HOST` | `sql.hostinger.com` |
| `DB_USER` | `u513195619_estatenamau` |
| `DB_PASSWORD` | `v*11?=?^I` |
| `DB_NAME` | `u513195619_estatenamadb` |

3. Click **Save**
4. Redeploy your project (Vercel → Deployments → Redeploy)

> **Why?** Environment variables are more secure than `db-config.json` and won't be exposed in your Git repo.

---

## Step 3: Deploy to Vercel

### Option A: Git-based Deploy (Recommended)

If your project is connected to Git (GitHub/GitLab/Bitbucket):

```bash
git add .
git commit -m "Add MySQL backend for blogs and pages"
git push origin main
```

Vercel will auto-deploy.

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

---

## Step 4: Verify It's Working

After deployment, test these endpoints:

1. **Health Check:**
   ```
   https://yourdomain.com/api/admin/health
   ```

2. **Public Blogs:**
   ```
   https://yourdomain.com/api/blogs
   ```

3. **Public Pages:**
   ```
   https://yourdomain.com/api/pages
   ```

4. **Admin Login:**
   ```
   https://yourdomain.com/admin
   ```
   - Username: `admin@estatenama.com`
   - Password: `EstateNama@8088`

---

## What Changed in This Update

### New Files
- `lib/db.js` — MySQL database layer (replaces Prisma/Vercel Postgres)
- `models/blogs.js`, `models/pages.js`, `models/settings.js` — Local dev models
- `page.html` — Dynamic page renderer
- `nav-loader.js` — Auto-loads pages into navigation
- `database-setup.sql` — MySQL schema
- `database-setup.js` — Auto-setup script

### Updated Files
- `admin-server-prod.js` — Now uses Hostinger MySQL + Vercel Blob
- `admin-dashboard.html` — Added Pages management
- `admin-dashboard.js` — Pages CRUD, API-based settings
- `admin-api.js` — Pages endpoints
- `blog-script.js` — Fetches from `/api/blogs`
- `blog.html` / `blog-details.html` — Dynamic navigation support
- `package.json` — Added `mysql2`, removed Prisma

---

## API Endpoints Available on Vercel

### Public (No Auth)
| Endpoint | Description |
|----------|-------------|
| `GET /api/blogs` | All published blogs |
| `GET /api/blogs/:slug` | Single blog |
| `GET /api/pages` | All published pages |
| `GET /api/pages/nav` | Pages in navigation |
| `GET /api/pages/:slug` | Single page |
| `GET /api/posts` | All published posts |
| `GET /api/projects` | All active projects |
| `GET /api/settings` | Site settings |

### Admin (Requires Auth)
| Endpoint | Description |
|----------|-------------|
| `POST /api/admin/login` | Login |
| `GET /api/admin/stats` | Dashboard stats |
| `GET/POST /api/admin/blogs` | Blog CRUD |
| `GET/POST /api/admin/pages` | Page CRUD |
| `GET/POST /api/admin/posts` | Post CRUD |
| `GET/POST /api/admin/projects` | Project CRUD |
| `POST /api/admin/images/upload` | Upload images (Vercel Blob) |
| `GET/PUT /api/admin/settings` | Settings |

---

## How Admin Panel Works

1. Go to `https://yourdomain.com/admin`
2. Log in
3. **Blogs** → Create blog posts that appear on `blog.html`
4. **Pages** → Create custom pages accessible at `page.html?slug=your-slug`
5. Check "Show in Navigation" to add pages to the site menu automatically
6. **Images** → Upload images (stored on Vercel Blob)
7. **Settings** → Update site title, contact info, etc.

---

## Troubleshooting

### "Database connection failed"
- Check that `DB_PASSWORD` is set correctly in Vercel env vars
- Make sure Hostinger allows remote connections (most do by default)
- Check that `database-setup.sql` was executed in phpMyAdmin

### "Cannot find module 'mysql2'"
- Make sure `package.json` includes `"mysql2": "^3.22.4"`
- Run `npm install` locally and commit `package-lock.json`

### "ER_ACCESS_DENIED_ERROR"
- Wrong database password — double-check in Vercel env vars
- Wrong database host — Hostinger sometimes uses `127.0.0.1` or a specific server name

### "Table doesn't exist"
- You forgot to run `database-setup.sql` in phpMyAdmin
- Re-run the SQL setup

### Images not uploading on Vercel
- Make sure `BLOB_READ_WRITE_TOKEN` is set in Vercel env vars (if using Vercel Blob)
- Or check that the image size is under 10MB

---

## Security Note

The file `db-config.json` currently contains your database password. For better security:

1. **Add `db-config.json` to `.gitignore`** so it never gets committed
2. **Use Vercel Environment Variables** exclusively (Step 2 above)
3. **Change default admin passwords** after first login:
   - `admin@estatenama.com` / `EstateNama@8088`
   - `estatenama@estatenama.com` / `Estatenama@8088`
   - `manager@estatenama.com` / `Manager@8088`

---

Need help? Check Vercel logs: **Vercel Dashboard → Your Project → Deployments → Latest → Logs**
