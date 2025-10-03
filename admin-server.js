// Admin Panel Backend Server
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const cors = require('cors');

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
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Check file type
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

// Data storage paths
const DATA_DIR = 'admin-data';
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const BLOGS_FILE = path.join(DATA_DIR, 'blogs.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const IMAGES_FILE = path.join(DATA_DIR, 'images.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data directory exists
const ensureDataDir = async () => {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
};

// Helper functions for data management
const readJsonFile = async (filePath, defaultValue = []) => {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch {
        return defaultValue;
    }
};

const writeJsonFile = async (filePath, data) => {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// Authentication middleware
// Store active tokens (in production, use Redis or database)
const activeSessions = new Map();

const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.substring(7);
    
    // Check if token exists in active sessions
    if (!activeSessions.has(token)) {
        return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }
    
    // Check if token is expired (24 hours)
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

// Routes

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
    
    // Simple authentication (in production, use proper password hashing)
    const validCredentials = [
        { username: 'admin', password: 'admin123' },
        { username: 'estatenama', password: 'estate2024' },
        { username: 'manager', password: 'manager123' }
    ];
    
    const isValid = validCredentials.some(cred => 
        cred.username === username && cred.password === password
    );
    
    if (isValid) {
        // Generate simple token (in production, use proper JWT)
        const token = 'admin-token-' + Date.now();
        
        // Store token in active sessions
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

// Posts API
app.get('/api/admin/posts', authenticateAdmin, async (req, res) => {
    try {
        const posts = await readJsonFile(POSTS_FILE);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

app.post('/api/admin/posts', authenticateAdmin, async (req, res) => {
    try {
        const posts = await readJsonFile(POSTS_FILE);
        const newPost = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        posts.unshift(newPost);
        await writeJsonFile(POSTS_FILE, posts);
        res.json(newPost);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});

app.put('/api/admin/posts/:id', authenticateAdmin, async (req, res) => {
    try {
        const posts = await readJsonFile(POSTS_FILE);
        const postIndex = posts.findIndex(p => p.id === req.params.id);
        
        if (postIndex === -1) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        posts[postIndex] = {
            ...posts[postIndex],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        await writeJsonFile(POSTS_FILE, posts);
        res.json(posts[postIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update post' });
    }
});

app.delete('/api/admin/posts/:id', authenticateAdmin, async (req, res) => {
    try {
        const posts = await readJsonFile(POSTS_FILE);
        const filteredPosts = posts.filter(p => p.id !== req.params.id);
        
        if (posts.length === filteredPosts.length) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        await writeJsonFile(POSTS_FILE, filteredPosts);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Blogs API
app.get('/api/admin/blogs', authenticateAdmin, async (req, res) => {
    try {
        const blogs = await readJsonFile(BLOGS_FILE);
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
});

app.post('/api/admin/blogs', authenticateAdmin, async (req, res) => {
    try {
        const blogs = await readJsonFile(BLOGS_FILE);
        const newBlog = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        blogs.unshift(newBlog);
        await writeJsonFile(BLOGS_FILE, blogs);
        res.json(newBlog);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create blog' });
    }
});

app.put('/api/admin/blogs/:id', authenticateAdmin, async (req, res) => {
    try {
        const blogs = await readJsonFile(BLOGS_FILE);
        const blogIndex = blogs.findIndex(b => b.id === req.params.id);
        
        if (blogIndex === -1) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        
        blogs[blogIndex] = {
            ...blogs[blogIndex],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        await writeJsonFile(BLOGS_FILE, blogs);
        res.json(blogs[blogIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update blog' });
    }
});

app.delete('/api/admin/blogs/:id', authenticateAdmin, async (req, res) => {
    try {
        const blogs = await readJsonFile(BLOGS_FILE);
        const filteredBlogs = blogs.filter(b => b.id !== req.params.id);
        
        if (blogs.length === filteredBlogs.length) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        
        await writeJsonFile(BLOGS_FILE, filteredBlogs);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete blog' });
    }
});

// Projects API
app.get('/api/admin/projects', authenticateAdmin, async (req, res) => {
    try {
        const projects = await readJsonFile(PROJECTS_FILE);
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

app.post('/api/admin/projects', authenticateAdmin, async (req, res) => {
    try {
        const projects = await readJsonFile(PROJECTS_FILE);
        const newProject = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        projects.unshift(newProject);
        await writeJsonFile(PROJECTS_FILE, projects);
        res.json(newProject);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
});

app.put('/api/admin/projects/:id', authenticateAdmin, async (req, res) => {
    try {
        const projects = await readJsonFile(PROJECTS_FILE);
        const projectIndex = projects.findIndex(p => p.id === req.params.id);
        
        if (projectIndex === -1) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        projects[projectIndex] = {
            ...projects[projectIndex],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        await writeJsonFile(PROJECTS_FILE, projects);
        res.json(projects[projectIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update project' });
    }
});

app.delete('/api/admin/projects/:id', authenticateAdmin, async (req, res) => {
    try {
        const projects = await readJsonFile(PROJECTS_FILE);
        const filteredProjects = projects.filter(p => p.id !== req.params.id);
        
        if (projects.length === filteredProjects.length) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        await writeJsonFile(PROJECTS_FILE, filteredProjects);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// Images API
app.get('/api/admin/images', authenticateAdmin, async (req, res) => {
    try {
        const images = await readJsonFile(IMAGES_FILE);
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

app.post('/api/admin/images/upload', authenticateAdmin, upload.array('images', 10), async (req, res) => {
    try {
        const images = await readJsonFile(IMAGES_FILE);
        const newImages = req.files.map(file => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2),
            name: file.originalname,
            filename: file.filename,
            url: `/uploads/${file.filename}`,
            size: file.size,
            uploadedAt: new Date().toISOString()
        }));
        
        images.push(...newImages);
        await writeJsonFile(IMAGES_FILE, images);
        res.json(newImages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload images' });
    }
});

app.delete('/api/admin/images/:id', authenticateAdmin, async (req, res) => {
    try {
        const images = await readJsonFile(IMAGES_FILE);
        const imageToDelete = images.find(img => img.id === req.params.id);
        
        if (!imageToDelete) {
            return res.status(404).json({ error: 'Image not found' });
        }
        
        // Delete file from filesystem
        try {
            await fs.unlink(path.join('uploads', imageToDelete.filename));
        } catch (error) {
            console.warn('Failed to delete file:', error.message);
        }
        
        const filteredImages = images.filter(img => img.id !== req.params.id);
        await writeJsonFile(IMAGES_FILE, filteredImages);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

// Settings API
app.get('/api/admin/settings', authenticateAdmin, async (req, res) => {
    try {
        const settings = await readJsonFile(SETTINGS_FILE, {
            siteTitle: 'EstateNama - Real Estate Solutions',
            siteDescription: 'Leading real estate company specializing in plots, residential, and commercial properties with trusted installment plans.',
            contactEmail: 'info@estatenama.com',
            contactPhone: '03195547788',
            companyAddress: 'Phase 7, Anarkali Restaurant, Bahria Town'
        });
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

app.put('/api/admin/settings', authenticateAdmin, async (req, res) => {
    try {
        const settings = {
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        await writeJsonFile(SETTINGS_FILE, settings);
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Statistics API
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        const posts = await readJsonFile(POSTS_FILE);
        const blogs = await readJsonFile(BLOGS_FILE);
        const images = await readJsonFile(IMAGES_FILE);
        
        res.json({
            totalPosts: posts.length,
            totalBlogs: blogs.length,
            totalImages: images.length,
            totalProjects: 4 // Static for now
        });
    } catch (error) {
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
    res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize server
const startServer = async () => {
    try {
        await ensureDataDir();
        await ensureUploadsDir();
        
        app.listen(PORT, () => {
            console.log(`\n🚀 Admin Panel Server running on http://localhost:${PORT}`);
            console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
            console.log(`🔧 API Base URL: http://localhost:${PORT}/api/admin`);
            console.log('\n📁 Admin Panel Features:');
            console.log('   ✅ Authentication System');
            console.log('   ✅ Posts Management');
            console.log('   ✅ Blogs Management');
            console.log('   ✅ Image Upload & Gallery');
            console.log('   ✅ Settings Management');
            console.log('   ✅ Statistics Dashboard');
            console.log('\n🔐 Default Admin Credentials:');
            console.log('   Username: admin | Password: admin123');
            console.log('   Username: estatenama | Password: estate2024');
            console.log('   Username: manager | Password: manager123');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;