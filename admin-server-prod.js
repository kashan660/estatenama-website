// Production Admin Server for Vercel + Hostinger MySQL
const express = require('express');
const path = require('path');
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

// Admin credentials
const ADMIN_CREDENTIALS = [
    { username: 'admin@estatenama.com', password: 'EstateNama@8088' },
    { username: 'estatenama@estatenama.com', password: 'Estatenama@8088' },
    { username: 'manager@estatenama.com', password: 'Manager@8088' }
];

// Session storage (simple in-memory)
const sessions = new Map();

// Authentication middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const sessionData = sessions.get(token);
    if (!sessionData || sessionData.expires < Date.now()) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = sessionData.user;
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

        const isValid = ADMIN_CREDENTIALS.some(cred =>
            cred.username === username && cred.password === password
        );

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        sessions.set(token, {
            user: { username },
            expires: Date.now() + 24 * 60 * 60 * 1000
        });

        res.json({ success: true, token, user: { username } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout
app.post('/api/admin/logout', authenticateAdmin, (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    sessions.delete(token);
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

// --- Sitemap API (Public) ---
app.get('/api/sitemap', async (req, res) => {
    try {
        const BASE_URL = process.env.SITE_URL || 'https://estatenama.com';
        const currentDate = new Date().toISOString().split('T')[0];

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Static pages
        const staticPages = [
            '', '/blog.html', '/project-details.html?project=kingdom-valley',
            '/faisal-town-projects.html', '/eighteen-projects.html',
            '/bahria-town-phase8-projects.html', '/ruden-enclave-projects.html'
        ];
        staticPages.forEach(page => {
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}${page}</loc>\n`;
            xml += `    <lastmod>${currentDate}</lastmod>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        });

        // Published blogs
        const blogs = await db.getBlogs();
        blogs.filter(b => b.status === 'published').forEach(blog => {
            const blogDate = blog.updatedAt ? new Date(blog.updatedAt).toISOString().split('T')[0] : currentDate;
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}/blog-details.html?slug=${blog.slug}</loc>\n`;
            xml += `    <lastmod>${blogDate}</lastmod>\n`;
            xml += '    <changefreq>monthly</changefreq>\n';
            xml += '    <priority>0.6</priority>\n';
            xml += '  </url>\n';
        });

        // Published pages
        const pages = await db.getPagesPublic();
        pages.forEach(page => {
            const pageDate = page.updatedAt ? new Date(page.updatedAt).toISOString().split('T')[0] : currentDate;
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}/page.html?slug=${page.slug}</loc>\n`;
            xml += `    <lastmod>${pageDate}</lastmod>\n`;
            xml += '    <changefreq>monthly</changefreq>\n';
            xml += '    <priority>0.6</priority>\n';
            xml += '  </url>\n';
        });

        xml += '</urlset>';

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
