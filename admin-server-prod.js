// Production Admin Server for Vercel + Hostinger MySQL
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const cors = require('cors');
const { put } = require('@vercel/blob');
const db = require('./lib/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(__dirname));

// Configure multer (memory storage for Vercel Blob)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Admin credentials — from env, with dev fallback.
// ADMIN_USERS = JSON array [{"username":"a@b.com","password":"x"}], or ADMIN_EMAIL/ADMIN_PASSWORD.
function getAdminCredentials() {
    if (process.env.ADMIN_USERS) {
        try {
            const parsed = JSON.parse(process.env.ADMIN_USERS);
            if (Array.isArray(parsed) && parsed.length) return parsed;
        } catch (e) {
            console.warn('Could not parse ADMIN_USERS env var, falling back');
        }
    }
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
        return [{ username: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }];
    }
    // Dev fallback (override in production via env vars)
    return [
        { username: 'admin@estatenama.com', password: 'EstateNama@8088' },
        { username: 'estatenama@estatenama.com', password: 'Estatenama@8088' },
        { username: 'manager@estatenama.com', password: 'Manager@8088' }
    ];
}

const SESSION_SECRET = process.env.SESSION_SECRET || 'estatenama-dev-secret-change-me';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

// Stateless signed token: base64url(payload).hmac — survives serverless cold starts (no shared memory)
function signToken(payload) {
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
    return `${body}.${sig}`;
}

function verifyToken(token) {
    if (!token || !token.includes('.')) return null;
    const [body, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
    // Constant-time compare
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    try {
        const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
        if (!payload.exp || payload.exp < Date.now()) return null;
        return payload;
    } catch (e) {
        return null;
    }
}

// Authentication middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const payload = verifyToken(token);
    if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = { username: payload.username };
    next();
};

// Routes

// Health check (includes DB connectivity test)
app.get('/api/admin/health', async (req, res) => {
    let dbStatus = 'unknown';
    let dbError = null;
    try {
        const stats = await db.getStats();
        dbStatus = 'connected';
    } catch (error) {
        dbStatus = 'error';
        dbError = error.message;
    }
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: 'production-mysql',
        dbStatus: dbStatus,
        dbError: dbError,
        endpoints: ['/api/admin/login', '/api/admin/data', '/api/admin/upload', '/api/blogs', '/api/pages']
    });
});

// DB Test endpoint (no auth, for debugging)
app.get('/api/test-db', async (req, res) => {
    try {
        const stats = await db.getStats();
        res.json({ success: true, stats, message: 'Database connection working' });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// --- Public API Routes (No Auth Required) ---

// Posts
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await db.getPosts();
        const publishedPosts = posts.filter(p => p.published || p.status === 'published');
        res.json(publishedPosts);
    } catch (error) {
        console.error('Error fetching public posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts', detail: error.message, code: error.code });
    }
});

// Blogs
app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await db.getBlogs();
        const publishedBlogs = blogs.filter(b => b.status === 'published');
        res.json(publishedBlogs);
    } catch (error) {
        console.error('Error fetching public blogs:', error);
        res.status(500).json({ error: 'Failed to fetch blogs', detail: error.message, code: error.code });
    }
});

app.get('/api/blogs/:slug', async (req, res) => {
    try {
        const blog = await db.getBlogBySlug(req.params.slug);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json(blog);
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({ error: 'Failed to fetch blog', detail: error.message, code: error.code });
    }
});

// Pages
app.get('/api/pages', async (req, res) => {
    try {
        const pages = await db.getPagesPublic();
        res.json(pages);
    } catch (error) {
        console.error('Error fetching public pages:', error);
        res.status(500).json({ error: 'Failed to fetch pages', detail: error.message, code: error.code });
    }
});

app.get('/api/pages/nav', async (req, res) => {
    try {
        const pages = await db.getNavPages();
        res.json(pages);
    } catch (error) {
        console.error('Error fetching nav pages:', error);
        res.status(500).json({ error: 'Failed to fetch navigation pages', detail: error.message, code: error.code });
    }
});

app.get('/api/pages/:slug', async (req, res) => {
    try {
        const page = await db.getPageBySlug(req.params.slug);
        if (!page) return res.status(404).json({ error: 'Page not found' });
        res.json(page);
    } catch (error) {
        console.error('Error fetching page:', error);
        res.status(500).json({ error: 'Failed to fetch page', detail: error.message, code: error.code });
    }
});

// Settings
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await db.getSettings();
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings', detail: error.message, code: error.code });
    }
});

// Projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await db.getProjects();
        const activeProjects = projects.filter(p => p.status === 'active');
        res.json(activeProjects);
    } catch (error) {
        console.error('Error fetching public projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects', detail: error.message, code: error.code });
    }
});

// Single project by slug (public)
app.get('/api/projects/:slug', async (req, res) => {
    try {
        const project = await db.getProjectBySlug(req.params.slug);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project', detail: error.message, code: error.code });
    }
});

// Sections (published homepage blocks)
app.get('/api/sections', async (req, res) => {
    try {
        const sections = await db.getSectionsPublic();
        res.json(sections);
    } catch (error) {
        console.error('Error fetching public sections:', error);
        res.status(500).json({ error: 'Failed to fetch sections', detail: error.message, code: error.code });
    }
});

// --------------------------------------------

// Serve admin pages
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const isValid = getAdminCredentials().some(cred =>
            cred.username === username && cred.password === password
        );

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = signToken({ username, exp: Date.now() + SESSION_TTL_MS });

        res.json({ success: true, token, user: { username } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout (tokens are stateless; client discards it)
app.post('/api/admin/logout', authenticateAdmin, (req, res) => {
    res.json({ success: true });
});

// Stats
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        const stats = await db.getStats();
        res.json(stats);
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Failed to get statistics', detail: error.message, code: error.code });
    }
});

// --- Posts Admin API ---
app.get('/api/admin/posts', authenticateAdmin, async (req, res) => {
    try {
        const posts = await db.getPosts();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts', detail: error.message, code: error.code });
    }
});

app.post('/api/admin/posts', authenticateAdmin, async (req, res) => {
    try {
        const newPost = await db.createPost(req.body);
        res.json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create post', detail: error.message, code: error.code });
    }
});

app.put('/api/admin/posts/:id', authenticateAdmin, async (req, res) => {
    try {
        const updatedPost = await db.updatePost(req.params.id, req.body);
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update post', detail: error.message, code: error.code });
    }
});

app.delete('/api/admin/posts/:id', authenticateAdmin, async (req, res) => {
    try {
        await db.deletePost(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete post', detail: error.message, code: error.code });
    }
});

// --- Blogs Admin API ---
app.get('/api/admin/blogs', authenticateAdmin, async (req, res) => {
    try {
        const blogs = await db.getBlogs();
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blogs', detail: error.message, code: error.code });
    }
});

app.get('/api/admin/blogs/:id', authenticateAdmin, async (req, res) => {
    try {
        const blog = await db.getBlogById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blog', detail: error.message, code: error.code });
    }
});

app.post('/api/admin/blogs', authenticateAdmin, async (req, res) => {
    try {
        const newBlog = await db.createBlog(req.body);
        res.json(newBlog);
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'A blog with this slug already exists' });
        }
        res.status(500).json({ error: 'Failed to create blog', detail: error.message, code: error.code });
    }
});

app.put('/api/admin/blogs/:id', authenticateAdmin, async (req, res) => {
    try {
        const updatedBlog = await db.updateBlog(req.params.id, req.body);
        res.json(updatedBlog);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'A blog with this slug already exists' });
        }
        res.status(500).json({ error: 'Failed to update blog', detail: error.message, code: error.code });
    }
});

app.delete('/api/admin/blogs/:id', authenticateAdmin, async (req, res) => {
    try {
        await db.deleteBlog(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete blog', detail: error.message, code: error.code });
    }
});

// --- Pages Admin API ---
app.get('/api/admin/pages', authenticateAdmin, async (req, res) => {
    try {
        const pages = await db.getPages();
        res.json(pages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pages', detail: error.message, code: error.code });
    }
});

app.get('/api/admin/pages/:id', authenticateAdmin, async (req, res) => {
    try {
        const page = await db.getPageById(req.params.id);
        if (!page) return res.status(404).json({ error: 'Page not found' });
        res.json(page);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch page', detail: error.message, code: error.code });
    }
});

app.post('/api/admin/pages', authenticateAdmin, async (req, res) => {
    try {
        const newPage = await db.createPage(req.body);
        res.json(newPage);
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'A page with this slug already exists' });
        }
        res.status(500).json({ error: 'Failed to create page', detail: error.message, code: error.code });
    }
});

app.put('/api/admin/pages/:id', authenticateAdmin, async (req, res) => {
    try {
        const updatedPage = await db.updatePage(req.params.id, req.body);
        res.json(updatedPage);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'A page with this slug already exists' });
        }
        res.status(500).json({ error: 'Failed to update page', detail: error.message, code: error.code });
    }
});

app.delete('/api/admin/pages/:id', authenticateAdmin, async (req, res) => {
    try {
        await db.deletePage(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete page', detail: error.message, code: error.code });
    }
});

// --- Projects Admin API ---
app.get('/api/admin/projects', authenticateAdmin, async (req, res) => {
    try {
        const projects = await db.getProjects();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects', detail: error.message, code: error.code });
    }
});

app.post('/api/admin/projects', authenticateAdmin, async (req, res) => {
    try {
        const newProject = await db.createProject(req.body);
        res.json(newProject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create project', detail: error.message, code: error.code });
    }
});

app.put('/api/admin/projects/:id', authenticateAdmin, async (req, res) => {
    try {
        const updatedProject = await db.updateProject(req.params.id, req.body);
        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update project', detail: error.message, code: error.code });
    }
});

app.delete('/api/admin/projects/:id', authenticateAdmin, async (req, res) => {
    try {
        await db.deleteProject(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project', detail: error.message, code: error.code });
    }
});

// --- Sections Admin API ---
app.get('/api/admin/sections', authenticateAdmin, async (req, res) => {
    try {
        const sections = await db.getSections();
        res.json(sections);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sections', detail: error.message, code: error.code });
    }
});

app.get('/api/admin/sections/:id', authenticateAdmin, async (req, res) => {
    try {
        const section = await db.getSectionById(req.params.id);
        if (!section) return res.status(404).json({ error: 'Section not found' });
        res.json(section);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch section', detail: error.message, code: error.code });
    }
});

app.post('/api/admin/sections', authenticateAdmin, async (req, res) => {
    try {
        const newSection = await db.createSection(req.body);
        res.json(newSection);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create section', detail: error.message, code: error.code });
    }
});

app.put('/api/admin/sections/:id', authenticateAdmin, async (req, res) => {
    try {
        const updatedSection = await db.updateSection(req.params.id, req.body);
        res.json(updatedSection);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update section', detail: error.message, code: error.code });
    }
});

app.delete('/api/admin/sections/:id', authenticateAdmin, async (req, res) => {
    try {
        await db.deleteSection(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete section', detail: error.message, code: error.code });
    }
});

// --- Images Admin API ---
app.get('/api/admin/images', authenticateAdmin, async (req, res) => {
    try {
        const images = await db.getImages();
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch images', detail: error.message, code: error.code });
    }
});

// Image Upload (Vercel Blob)
app.post('/api/admin/images/upload', authenticateAdmin, upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const uploadedImages = [];
        for (const file of req.files) {
            // Upload to Vercel Blob
            const blob = await put(file.originalname, file.buffer, {
                access: 'public',
                addRandomSuffix: true,
            });

            // Save metadata to database
            const imageRecord = await db.createImage({
                name: file.originalname,
                filename: file.originalname,
                url: blob.url,
                size: file.size
            });

            uploadedImages.push(imageRecord);
        }

        res.json(uploadedImages);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload files' });
    }
});

app.delete('/api/admin/images/:id', authenticateAdmin, async (req, res) => {
    try {
        await db.deleteImage(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

// --- Settings Admin API ---
app.get('/api/admin/settings', authenticateAdmin, async (req, res) => {
    try {
        const settings = await db.getSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings', detail: error.message, code: error.code });
    }
});

app.put('/api/admin/settings', authenticateAdmin, async (req, res) => {
    try {
        const settings = await db.updateSettings(req.body);
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update settings', detail: error.message, code: error.code });
    }
});

// --- Server-Side Rendered SEO pages (clean URLs) ---

const SITE_URL = process.env.SITE_URL || 'https://estatenama.com';

// Escape for use inside HTML attributes / text
function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function stripHtml(html) {
    return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Build a fully-rendered, SEO-complete HTML document
function renderSeoHtml({ title, description, canonical, image, type = 'article', author, publishedAt, jsonLd, bodyHtml, headerTitle, headerSubtitle }) {
    const safeTitle = esc(title);
    const safeDesc = esc(description);
    const safeImage = esc(image || `${SITE_URL}/images/homepage/home1.png`);
    const safeCanonical = esc(canonical);
    return `<!DOCTYPE html>
<html lang="en-PK">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDesc}">
    <meta name="author" content="${esc(author || 'Estate Nama')}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${safeCanonical}">

    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDesc}">
    <meta property="og:type" content="${esc(type)}">
    <meta property="og:url" content="${safeCanonical}">
    <meta property="og:image" content="${safeImage}">
    <meta property="og:site_name" content="Estate Nama">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${safeTitle}">
    <meta name="twitter:description" content="${safeDesc}">
    <meta name="twitter:image" content="${safeImage}">

    <link rel="icon" type="image/x-icon" href="/images/favicons/favicon.ico">
    <link rel="stylesheet" href="/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <style>
        .ssr-header { background: linear-gradient(rgba(44,62,80,0.85), rgba(44,62,80,0.85)), url('${safeImage}'); background-size: cover; background-position: center; padding: 120px 20px 60px; text-align: center; color: #fff; margin-top: 80px; }
        .ssr-header h1 { font-size: 2.4rem; max-width: 900px; margin: 0 auto 12px; }
        .ssr-header p { opacity: .9; }
        .ssr-container { max-width: 900px; margin: 0 auto; padding: 50px 20px; }
        .ssr-content { background: #fff; border-radius: 10px; padding: 40px; box-shadow: 0 5px 15px rgba(0,0,0,.08); line-height: 1.8; color: #333; }
        .ssr-content img, .ssr-content video, .ssr-content iframe { max-width: 100%; border-radius: 8px; }
        .ssr-content h2, .ssr-content h3 { color: #2c3e50; margin: 1.4em 0 .5em; }
        .video-embed { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 20px 0; border-radius: 8px; }
        .video-embed iframe, .video-embed video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
        .ssr-back { display: inline-block; margin-bottom: 20px; color: #e67e22; text-decoration: none; font-weight: 600; }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <a href="/index.html"><h2>Estate<span>Nama</span></h2></a>
            </div>
            <ul class="nav-menu" id="mainNavMenu">
                <li><a href="/index.html#home" class="nav-link">Home</a></li>
                <li><a href="/index.html#about" class="nav-link">About</a></li>
                <li><a href="/index.html#projects" class="nav-link">Projects</a></li>
                <li><a href="/index.html#services" class="nav-link">Services</a></li>
                <li><a href="/blog.html" class="nav-link">Blog</a></li>
                <li><a href="/index.html#contact" class="nav-link">Contact</a></li>
            </ul>
            <div class="hamburger"><span class="bar"></span><span class="bar"></span><span class="bar"></span></div>
        </div>
    </nav>

    <header class="ssr-header">
        <h1>${esc(headerTitle || title)}</h1>
        ${headerSubtitle ? `<p>${esc(headerSubtitle)}</p>` : ''}
    </header>

    <main class="ssr-container">
        <div class="ssr-content">
            <a href="/blog.html" class="ssr-back"><i class="fas fa-arrow-left"></i> Back</a>
            ${bodyHtml || ''}
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-bottom">
                <p>&copy; 2024 Estate Nama. All rights reserved.</p>
                <a href="/admin-login.html" style="color:#666;text-decoration:none;font-size:12px;margin-left:20px;">Admin</a>
            </div>
        </div>
    </footer>
    <script src="/nav-loader.js"></script>
</body>
</html>`;
}

// Blog detail (SSR, SEO-complete)
app.get('/blog/:slug', async (req, res) => {
    try {
        const blog = await db.getBlogBySlug(req.params.slug);
        if (!blog || blog.status !== 'published') {
            return res.status(404).sendFile(path.join(__dirname, '404.html'));
        }
        const canonical = `${SITE_URL}/blog/${blog.slug}`;
        const description = blog.metaDescription || blog.excerpt || stripHtml(blog.content).slice(0, 160);
        const image = blog.featuredImage || `${SITE_URL}/images/homepage/home1.png`;
        const published = blog.publishedAt || blog.createdAt;
        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: blog.title,
            description,
            image,
            author: { '@type': 'Organization', name: blog.author || 'Estate Nama' },
            publisher: { '@type': 'Organization', name: 'Estate Nama', logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/logos/logoe_statenama.png` } },
            datePublished: published ? new Date(published).toISOString() : undefined,
            dateModified: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined,
            mainEntityOfPage: canonical
        };
        const dateStr = published ? new Date(published).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
        res.send(renderSeoHtml({
            title: blog.metaTitle || `${blog.title} - Estate Nama`,
            description,
            canonical,
            image,
            type: 'article',
            author: blog.author,
            jsonLd,
            headerTitle: blog.title,
            headerSubtitle: [blog.category, dateStr].filter(Boolean).join(' • '),
            bodyHtml: blog.content || ''
        }));
    } catch (error) {
        console.error('Blog SSR error:', error);
        res.status(500).send('Error loading article');
    }
});

// Page detail (SSR, SEO-complete)
app.get('/page/:slug', async (req, res) => {
    try {
        const page = await db.getPageBySlug(req.params.slug);
        if (!page || page.status !== 'published') {
            return res.status(404).sendFile(path.join(__dirname, '404.html'));
        }
        const canonical = `${SITE_URL}/page/${page.slug}`;
        const description = page.metaDescription || stripHtml(page.content).slice(0, 160);
        const image = page.featuredImage || `${SITE_URL}/images/homepage/home1.png`;
        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: page.title,
            description,
            url: canonical
        };
        res.send(renderSeoHtml({
            title: page.metaTitle || `${page.title} - Estate Nama`,
            description,
            canonical,
            image,
            type: 'website',
            jsonLd,
            headerTitle: page.title,
            bodyHtml: page.content || ''
        }));
    } catch (error) {
        console.error('Page SSR error:', error);
        res.status(500).send('Error loading page');
    }
});

// robots.txt
app.get('/robots.txt', (req, res) => {
    res.type('text/plain').send(
        `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
    );
});

// --- Sitemap (Public, clean URLs) ---
async function buildSitemap() {
    const currentDate = new Date().toISOString().split('T')[0];
    const fmt = (d) => d ? new Date(d).toISOString().split('T')[0] : currentDate;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    const url = (loc, lastmod, changefreq, priority) => {
        xml += '  <url>\n';
        xml += `    <loc>${SITE_URL}${loc}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>${changefreq}</changefreq>\n`;
        xml += `    <priority>${priority}</priority>\n`;
        xml += '  </url>\n';
    };

    // Static pages
    url('/', currentDate, 'weekly', '1.0');
    url('/blog.html', currentDate, 'weekly', '0.8');
    ['/faisal-town-projects.html', '/eighteen-projects.html', '/bahria-town-phase8-projects.html',
     '/ruden-enclave-projects.html', '/project-details.html?project=kingdom-valley']
        .forEach(p => url(p, currentDate, 'weekly', '0.7'));

    // Published blogs (clean URLs)
    const blogs = await db.getBlogs();
    blogs.filter(b => b.status === 'published').forEach(b => url(`/blog/${b.slug}`, fmt(b.updatedAt), 'monthly', '0.6'));

    // Published pages (clean URLs)
    const pages = await db.getPagesPublic();
    pages.forEach(p => url(`/page/${p.slug}`, fmt(p.updatedAt), 'monthly', '0.6'));

    xml += '</urlset>';
    return xml;
}

app.get(['/api/sitemap', '/sitemap.xml'], async (req, res) => {
    try {
        const xml = await buildSitemap();
        res.set('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

// Admin-triggered sitemap regeneration (returns JSON for admin panel)
app.post('/api/admin/sitemap/regenerate', authenticateAdmin, async (req, res) => {
    try {
        // The sitemap is dynamic, so "regenerating" just means the next request to /api/sitemap will have fresh data
        // But we can also ping search engines here if needed in the future
        res.json({ success: true, message: 'Sitemap will be refreshed on next request. Dynamic sitemap is always up-to-date.' });
    } catch (error) {
        console.error('Sitemap regeneration error:', error);
        res.status(500).json({ error: 'Failed to regenerate sitemap' });
    }
});

// Error handling
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
        }
    }
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', detail: error.message, code: error.code });
});

// 404 handler
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'Endpoint not found' });
    } else {
        res.status(404).sendFile(path.join(__dirname, '404.html'));
    }
});

// Start server if run directly (local dev)
if (require.main === module) {
    const PORT = process.env.PORT || 3002;
    app.listen(PORT, () => {
        console.log(`Admin server running on port ${PORT}`);
    });
}

module.exports = app;
