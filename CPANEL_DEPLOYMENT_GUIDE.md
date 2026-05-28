# EstateNama Backend - cPanel Deployment Guide

This guide walks you through deploying the EstateNama website with its new MySQL backend on cPanel shared hosting.

## Prerequisites

1. **cPanel hosting with Node.js support** (or a VPS with Node.js)
2. **MySQL database** (create one in cPanel)
3. **SSH access** (recommended for running npm install)

---

## Step 1: Create MySQL Database in cPanel

1. Log in to cPanel
2. Go to **MySQL Database Wizard**
3. Create a new database (e.g., `estatenama_db`)
4. Create a database user with a strong password
5. Grant the user **ALL PRIVILEGES** on the database
6. Save these credentials:
   - Database Name: `yourcpanel_estatenama_db`
   - Username: `yourcpanel_estatenama_user`
   - Password: `your_password`
   - Host: `localhost` (usually)

---

## Step 2: Update Database Configuration

Edit `db-config.json` in the project root:

```json
{
  "host": "localhost",
  "user": "yourcpanel_estatenama_user",
  "password": "your_password",
  "database": "yourcpanel_estatenama_db"
}
```

> Replace `yourcpanel_` prefix with your actual cPanel username prefix.

---

## Step 3: Upload Files to Server

### Option A: Via cPanel File Manager
1. Compress all project files into a `.zip`
2. Open cPanel **File Manager**
3. Navigate to `public_html` (or subdomain folder)
4. Upload and extract the `.zip`

### Option B: Via FTP/SFTP
1. Use FileZilla or any FTP client
2. Connect to your hosting account
3. Upload all files to `public_html/` or your subdomain folder

**Important files to upload:**
- All `.html` files
- All `.js` files (including `db.js`, `models/`, `admin-server.js`)
- All `.css` files
- `package.json`
- `db-config.json`
- `database-setup.sql`
- `uploads/` folder (create empty if not exists)
- `images/` folder

---

## Step 4: Install Node.js Dependencies

### If your cPanel has Node.js Selector:
1. Go to **Setup Node.js App** in cPanel
2. Create a new application
3. Point it to your application root folder
4. Select Node.js version 18+ (recommended)
5. Set application startup file: `admin-server.js`
6. Set application URL: your domain or subdomain
7. Click **Create**
8. Click **Run NPM Install**

### If you have SSH access:
```bash
cd /home/youruser/public_html
npm install
```

---

## Step 5: Initialize the Database

### Option A: Using the setup script (SSH)
```bash
cd /home/youruser/public_html
node database-setup.js
```

### Option B: Using phpMyAdmin
1. Open **phpMyAdmin** in cPanel
2. Select your database
3. Go to the **SQL** tab
4. Open `database-setup.sql` from your local files
5. Copy and paste the SQL into phpMyAdmin
6. Click **Go** to execute

This creates the `blogs`, `pages`, `images`, and `settings` tables.

---

## Step 6: Start the Server

### Using cPanel Node.js Selector:
1. Go back to **Setup Node.js App**
2. Click **Restart** or **Start**
3. The app should now be running on the assigned port

### Using SSH / Terminal:
```bash
cd /home/youruser/public_html
node admin-server.js
```

> For production, use a process manager like PM2:
> ```bash
> npm install -g pm2
> pm2 start admin-server.js --name "estatenama"
> pm2 save
> pm2 startup
> ```

---

## Step 7: Configure Domain Routing

If your Node.js app runs on a specific port (e.g., 3002), you need to map it to your domain:

### Option A: cPanel Node.js Selector (Recommended)
The selector usually handles proxying automatically.

### Option B: .htaccess Rewrite
Create/edit `.htaccess` in `public_html`:

```apache
RewriteEngine On
RewriteCond %{HTTP_HOST} ^yourdomain.com$ [NC,OR]
RewriteCond %{HTTP_HOST} ^www.yourdomain.com$
RewriteCond %{REQUEST_URI} !^/[
RewriteRule ^(.*)$ "http://127.0.0.1:3002/$1" [P,L]
```

> Replace `3002` with your actual Node.js app port.

---

## Step 8: Access the Admin Panel

1. Go to `https://yourdomain.com/admin`
2. Log in with default credentials:
   - **Username:** `admin@estatenama.com`
   - **Password:** `EstateNama@8088`
3. Change the default password after first login (recommended)

---

## What You Can Do in Admin Panel

### Blogs
- Create, edit, delete blog posts
- Set status: Draft or Published
- Add featured images, categories, SEO meta tags
- Blogs are automatically shown on `blog.html`

### Pages
- Create custom pages (About Us, Services, Terms, etc.)
- Write HTML content directly
- Set slug for URL (e.g., `about-us` -> `page.html?slug=about-us`)
- Choose whether to show in navigation menu
- Pages load dynamically via `page.html?slug=your-slug`

### Images
- Upload images to the gallery
- Use image URLs in blogs and pages

### Settings
- Update site title, description
- Update contact email, phone, address
- Changes reflect on the frontend automatically

---

## API Endpoints (Public)

These endpoints are available without authentication:

| Endpoint | Description |
|----------|-------------|
| `GET /api/blogs` | List all published blogs |
| `GET /api/blogs/:slug` | Get single blog by slug |
| `GET /api/pages` | List all published pages |
| `GET /api/pages/nav` | List pages marked for navigation |
| `GET /api/pages/:slug` | Get single page by slug |
| `GET /api/settings` | Get public site settings |

---

## Troubleshooting

### "Database connection failed"
- Check `db-config.json` credentials
- Make sure the database user has privileges
- Verify the database host (some hosts use `127.0.0.1` instead of `localhost`)

### "Cannot find module 'mysql2'"
- Run `npm install` again on the server
- Check that `node_modules` was uploaded correctly

### "Port already in use"
- Change the port in `admin-server.js` or use the `PORT` environment variable
- On cPanel, use the port assigned by the Node.js selector

### Admin panel not loading
- Check that the server is running
- Check `.htaccess` rewrite rules
- Check cPanel error logs

### Images not uploading
- Make sure `uploads/` folder exists and is writable (`chmod 755 uploads`)
- Check PHP/File Manager upload limits

---

## Security Recommendations

1. **Change default admin passwords** immediately
2. **Use HTTPS** (enable SSL in cPanel)
3. **Restrict admin access** by IP if possible
4. **Keep backups** of your database regularly
5. **Update Node.js** dependencies periodically

---

## File Structure Summary

```
estatenama.com/
  admin-server.js       # Main backend server
  db.js                 # Database connection
  db-config.json        # Your MySQL credentials
  database-setup.sql    # Database schema
  database-setup.js     # Auto-setup script
  models/
    blogs.js            # Blog database queries
    pages.js            # Page database queries
    settings.js         # Settings database queries
  admin-dashboard.html  # Admin panel UI
  admin-dashboard.js    # Admin panel logic
  admin-api.js          # API client for admin
  page.html             # Dynamic page renderer
  blog.html             # Blog listing page
  blog-details.html     # Single blog page
  blog-script.js        # Blog frontend logic
  nav-loader.js         # Dynamic navigation loader
  uploads/              # Uploaded images
```

---

Need help? Contact support or check your hosting provider's Node.js documentation.
