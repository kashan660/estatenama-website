// Production Admin Server for Vercel
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

// Health check
app.get('/api/admin/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: 'production-postgres',
        endpoints: ['/api/admin/login', '/api/admin/data', '/api/admin/upload']
    });
});

// --- Public API Routes (No Auth Required) ---
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await db.getPosts();
        // Return only published posts for public view
        const publishedPosts = posts.filter(p => p.published);
        res.json(publishedPosts);
    } catch (error) {
        console.error('Error fetching public posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await db.getBlogs();
        // Return only published blogs for public view
        const publishedBlogs = blogs.filter(b => b.status === 'published');
        res.json(publishedBlogs);
    } catch (error) {
        console.error('Error fetching public blogs:', error);
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
});

app.get('/api/projects', async (req, res) => {
    try {
        const projects = await db.getProjects();
        // Return only active projects for public view
        const activeProjects = projects.filter(p => p.status === 'active');
        res.json(activeProjects);
    } catch (error) {
        console.error('Error fetching public projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
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
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

// --- Posts API ---
app.get('/api/admin/posts', authenticateAdmin, async (req, res) => {
    try {
        const posts = await db.getPosts();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

app.post('/api/admin/posts', authenticateAdmin, async (req, res) => {
    try {
        const newPost = await db.createPost(req.body);
        res.json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

app.put('/api/admin/posts/:id', authenticateAdmin, async (req, res) => {
    try {
        const updatedPost = await db.updatePost(req.params.id, req.body);
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update post' });
    }
});

app.delete('/api/admin/posts/:id', authenticateAdmin, async (req, res) => {
    try {
        await db.deletePost(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// --- Blogs API ---
app.get('/api/admin/blogs', authenticateAdmin, async (req, res) => {
    try {
        const blogs = await db.getBlogs();
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
});

app.post('/api/admin/blogs', authenticateAdmin, async (req, res) => {
    try {
        const newBlog = await db.createBlog(req.body);
        res.json(newBlog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create blog' });
    }
});

app.put('/api/admin/blogs/:id', authenticateAdmin, async (req, res) => {
    try {
        const updatedBlog = await db.updateBlog(req.params.id, req.body);
        res.json(updatedBlog);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update blog' });
    }
});

app.delete('/api/admin/blogs/:id', authenticateAdmin, async (req, res) => {
    try {
        await db.deleteBlog(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete blog' });
    }
});

// --- Projects API ---
app.get('/api/admin/projects', authenticateAdmin, async (req, res) => {
    try {
        const projects = await db.getProjects();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

app.post('/api/admin/projects', authenticateAdmin, async (req, res) => {
    try {
        const newProject = await db.createProject(req.body);
        res.json(newProject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// --- Image Upload (Vercel Blob) ---
app.post('/api/admin/upload', authenticateAdmin, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload to Vercel Blob
        const blob = await put(req.file.originalname, req.file.buffer, {
            access: 'public',
        });
        
        res.json({ 
            success: true, 
            filename: req.file.originalname,
            path: blob.url // Returns the public URL of the blob
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Start server if run directly
if (require.main === module) {
    const PORT = process.env.PORT || 3002;
    app.listen(PORT, () => {
        console.log(`Admin server running on port ${PORT}`);
    });
}

module.exports = app;
