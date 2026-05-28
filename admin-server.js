// EstateNama Admin Panel Backend Server with MySQL Database
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const cors = require('cors');
const { pool, testConnection } = require('./db');
const blogsModel = require('./models/blogs');
const pagesModel = require('./models/pages');
const settingsModel = require('./models/settings');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(__dirname));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
    try {
        await fs.access('uploads');
    } catch {
        await fs.mkdir('uploads', { recursive: true });
    }
};

// Authentication middleware
const activeSessions = new Map();

const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);

    if (!activeSessions.has(token)) {
        return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }

    const sessionData = activeSessions.get(token);
    const now = Date.now();
    const tokenAge = now - sessionData.createdAt;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (tokenAge > maxAge) {
        activeSessions.delete(token);
        return res.status(401).json({ error: 'Token expired' });
    }

    req.user = sessionData.user;
    next();
};

// ===== PUBLIC API ENDPOINTS (No auth required - for frontend) =====

// Get all published blogs
app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await blogsModel.getAllBlogs('published');
        res.json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
});

// Get single blog by slug
app.get('/api/blogs/:slug', async (req, res) => {
    try {
        const blog = await blogsModel.getBlogBySlug(req.params.slug);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json(blog);
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({ error: 'Failed to fetch blog' });
    }
});

// Get all published pages
app.get('/api/pages', async (req, res) => {
    try {
        const pages = await pagesModel.getAllPages('published');
        res.json(pages);
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.status(500).json({ error: 'Failed to fetch pages' });
    }
});

// Get navigation pages
app.get('/api/pages/nav', async (req, res) => {
    try {
        const pages = await pagesModel.getNavPages();
        res.json(pages);
    } catch (error) {
        console.error('Error fetching nav pages:', error);
        res.status(500).json({ error: 'Failed to fetch navigation pages' });
    }
});

// Get single page by slug
app.get('/api/pages/:slug', async (req, res) => {
    try {
        const page = await pagesModel.getPageBySlug(req.params.slug);
        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }
        res.json(page);
    } catch (error) {
        console.error('Error fetching page:', error);
        res.status(500).json({ error: 'Failed to fetch page' });
    }
});

// Get public settings
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await settingsModel.getAllSettings();
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// ===== ADMIN API ENDPOINTS (Auth required) =====

// Serve admin login page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

// Serve admin dashboard
app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// Authentication endpoint
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;

    const validCredentials = [
        { username: 'admin@estatenama.com', password: 'EstateNama@8088' },
        { username: 'estatenama@estatenama.com', password: 'Estatenama@8088' },
        { username: 'manager@estatenama.com', password: 'Manager@8088' }
    ];

    const isValid = validCredentials.some(cred =>
        cred.username === username && cred.password === password
    );

    if (isValid) {
        const token = 'admin-token-' + Date.now();
        activeSessions.set(token, {
            user: { username },
            createdAt: Date.now()
        });

        res.json({
            success: true,
            token,
            user: { username }
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }
});

// --- Blogs Admin API ---
app.get('/api/admin/blogs', authenticateAdmin, async (req, res) => {
    try {
        const blogs = await blogsModel.getAllBlogs();
        res.json(blogs);
    } catch (error) {
        console.error('Error fetching admin blogs:', error);
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
});

app.get('/api/admin/blogs/:id', authenticateAdmin, async (req, res) => {
    try {
        const blog = await blogsModel.getBlogById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json(blog);
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({ error: 'Failed to fetch blog' });
    }
});

app.post('/api/admin/blogs', authenticateAdmin, async (req, res) => {
    try {
        const data = req.body;
        if (!data.slug && data.title) {
            data.slug = blogsModel.generateSlug(data.title);
        }
        const blog = await blogsModel.createBlog(data);
        res.json(blog);
    } catch (error) {
        console.error('Error creating blog:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'A blog with this slug already exists' });
        }
        res.status(500).json({ error: 'Failed to create blog' });
    }
});

app.put('/api/admin/blogs/:id', authenticateAdmin, async (req, res) => {
    try {
        const blog = await blogsModel.updateBlog(req.params.id, req.body);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json(blog);
    } catch (error) {
        console.error('Error updating blog:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'A blog with this slug already exists' });
        }
        res.status(500).json({ error: 'Failed to update blog' });
    }
});

app.delete('/api/admin/blogs/:id', authenticateAdmin, async (req, res) => {
    try {
        const success = await blogsModel.deleteBlog(req.params.id);
        if (!success) return res.status(404).json({ error: 'Blog not found' });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ error: 'Failed to delete blog' });
    }
});

// --- Pages Admin API ---
app.get('/api/admin/pages', authenticateAdmin, async (req, res) => {
    try {
        const pages = await pagesModel.getAllPages();
        res.json(pages);
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.status(500).json({ error: 'Failed to fetch pages' });
    }
});

app.get('/api/admin/pages/:id', authenticateAdmin, async (req, res) => {
    try {
        const page = await pagesModel.getPageById(req.params.id);
        if (!page) return res.status(404).json({ error: 'Page not found' });
        res.json(page);
    } catch (error) {
        console.error('Error fetching page:', error);
        res.status(500).json({ error: 'Failed to fetch page' });
    }
});

app.post('/api/admin/pages', authenticateAdmin, async (req, res) => {
    try {
        const data = req.body;
        if (!data.slug && data.title) {
            data.slug = pagesModel.generateSlug(data.title);
        }
        const page = await pagesModel.createPage(data);
        res.json(page);
    } catch (error) {
        console.error('Error creating page:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'A page with this slug already exists' });
        }
        res.status(500).json({ error: 'Failed to create page' });
    }
});

app.put('/api/admin/pages/:id', authenticateAdmin, async (req, res) => {
    try {
        const page = await pagesModel.updatePage(req.params.id, req.body);
        if (!page) return res.status(404).json({ error: 'Page not found' });
        res.json(page);
    } catch (error) {
        console.error('Error updating page:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'A page with this slug already exists' });
        }
        res.status(500).json({ error: 'Failed to update page' });
    }
});

app.delete('/api/admin/pages/:id', authenticateAdmin, async (req, res) => {
    try {
        const success = await pagesModel.deletePage(req.params.id);
        if (!success) return res.status(404).json({ error: 'Page not found' });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting page:', error);
        res.status(500).json({ error: 'Failed to delete page' });
    }
});

// --- Images Admin API ---
app.get('/api/admin/images', authenticateAdmin, async (req, res) => {
    try {
        const [images] = await pool.execute('SELECT * FROM images ORDER BY uploaded_at DESC');
        res.json(images);
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

app.post('/api/admin/images/upload', authenticateAdmin, upload.array('images', 10), async (req, res) => {
    try {
        const newImages = [];
        for (const file of req.files) {
            const [result] = await pool.execute(
                'INSERT INTO images (name, filename, url, size) VALUES (?, ?, ?, ?)',
                [file.originalname, file.filename, `/uploads/${file.filename}`, file.size]
            );
            newImages.push({
                id: result.insertId,
                name: file.originalname,
                filename: file.filename,
                url: `/uploads/${file.filename}`,
                size: file.size
            });
        }
        res.json(newImages);
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({ error: 'Failed to upload images' });
    }
});

app.delete('/api/admin/images/:id', authenticateAdmin, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM images WHERE id = ?', [req.params.id]);
        const image = rows[0];
        if (!image) return res.status(404).json({ error: 'Image not found' });

        try {
            await fs.unlink(path.join('uploads', image.filename));
        } catch (err) {
            console.warn('Failed to delete file:', err.message);
        }

        await pool.execute('DELETE FROM images WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

// --- Settings Admin API ---
app.get('/api/admin/settings', authenticateAdmin, async (req, res) => {
    try {
        const settings = await settingsModel.getAllSettings();
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

app.put('/api/admin/settings', authenticateAdmin, async (req, res) => {
    try {
        const settings = await settingsModel.updateMultipleSettings(req.body);
        res.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// --- Statistics Admin API ---
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        const [[blogCount]] = await pool.execute('SELECT COUNT(*) as count FROM blogs');
        const [[pageCount]] = await pool.execute('SELECT COUNT(*) as count FROM pages');
        const [[imageCount]] = await pool.execute('SELECT COUNT(*) as count FROM images');

        res.json({
            totalBlogs: blogCount.count,
            totalPages: pageCount.count,
            totalImages: imageCount.count,
            totalProjects: 4
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
        }
    }
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'Endpoint not found' });
    } else {
        res.status(404).sendFile(path.join(__dirname, '404.html'));
    }
});

// Initialize server
const startServer = async () => {
    try {
        await ensureUploadsDir();
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('\n⚠️  WARNING: Database not connected. Check your db-config.json or environment variables.');
            console.log('   Run: node database-setup.js after configuring database credentials.\n');
        }

        app.listen(PORT, () => {
            console.log(`\n🚀 Admin Panel Server running on http://localhost:${PORT}`);
            console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
            console.log(`🔧 API Base URL: http://localhost:${PORT}/api`);
            console.log('\n📁 Admin Panel Features:');
            console.log('   ✅ Authentication System');
            console.log('   ✅ Blogs Management (MySQL Database)');
            console.log('   ✅ Pages Management (MySQL Database)');
            console.log('   ✅ Image Upload & Gallery');
            console.log('   ✅ Settings Management');
            console.log('   ✅ Statistics Dashboard');
            console.log('\n🔐 Default Admin Credentials:');
            console.log('   Username: admin@estatenama.com | Password: EstateNama@8088');
            console.log('   Username: estatenama@estatenama.com | Password: Estatenama@8088');
            console.log('   Username: manager@estatenama.com | Password: Manager@8088');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
