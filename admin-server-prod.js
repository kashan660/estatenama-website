// Production Admin Server for Vercel
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const cors = require('cors');

const app = express();

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

// Admin credentials - In production, use environment variables
const ADMIN_CREDENTIALS = [
    { username: 'admin@estatenama.com', password: 'EstateNama@8088' },
    { username: 'estatenama@estatenama.com', password: 'Estatenama@8088' },
    { username: 'manager@estatenama.com', password: 'Manager@8088' }
];

// Session storage (simple in-memory, in production use Redis or database)
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

// Health check endpoint
app.get('/api/admin/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: 'production',
        endpoints: ['/api/admin/login', '/api/admin/data', '/api/admin/upload']
    });
});

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
    try {
        console.log('Login attempt received:', req.body);
        const { username, password } = req.body;
        
        if (!username || !password) {
            console.log('Missing username or password');
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        console.log('Attempting login for username:', username);
        
        // Check credentials
        const isValid = ADMIN_CREDENTIALS.some(cred => {
            console.log('Checking against:', cred.username);
            return cred.username === username && cred.password === password;
        });
        
        console.log('Credentials valid:', isValid);
        
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate token
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        
        // Store session
        sessions.set(token, {
            user: { username },
            expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });
        
        res.json({ 
            success: true, 
            token,
            user: { username }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout endpoint
app.post('/api/admin/logout', authenticateAdmin, (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    sessions.delete(token);
    res.json({ success: true });
});

// Get admin data
app.get('/api/admin/data', authenticateAdmin, async (req, res) => {
    try {
        const data = {};
        
        // Read all data files
        const dataFiles = ['posts.json', 'blogs.json', 'projects.json', 'gallery.json', 'settings.json'];
        
        for (const file of dataFiles) {
            try {
                const filePath = path.join(__dirname, 'admin-data', file);
                const fileContent = await fs.readFile(filePath, 'utf8');
                data[file.replace('.json', '')] = JSON.parse(fileContent);
            } catch (error) {
                data[file.replace('.json', '')] = [];
            }
        }
        
        res.json(data);
    } catch (error) {
        console.error('Error reading admin data:', error);
        res.status(500).json({ error: 'Failed to read admin data' });
    }
});

// Update admin data
app.post('/api/admin/data', authenticateAdmin, async (req, res) => {
    try {
        const { type, data } = req.body;
        
        if (!type || !data) {
            return res.status(400).json({ error: 'Type and data are required' });
        }
        
        const validTypes = ['posts', 'blogs', 'projects', 'gallery', 'settings'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: 'Invalid data type' });
        }
        
        const filePath = path.join(__dirname, 'admin-data', `${type}.json`);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating admin data:', error);
        res.status(500).json({ error: 'Failed to update admin data' });
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
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// File upload endpoint
app.post('/api/admin/upload', authenticateAdmin, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        res.json({ 
            success: true, 
            filename: req.file.filename,
            path: `/uploads/${req.file.filename}`
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Get statistics
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        const stats = {
            posts: 0,
            blogs: 0,
            projects: 0,
            gallery: 0
        };
        
        const dataFiles = ['posts.json', 'blogs.json', 'projects.json', 'gallery.json'];
        
        for (const file of dataFiles) {
            try {
                const filePath = path.join(__dirname, 'admin-data', file);
                const fileContent = await fs.readFile(filePath, 'utf8');
                const data = JSON.parse(fileContent);
                stats[file.replace('.json', '')] = data.length || 0;
            } catch (error) {
                // File doesn't exist or is empty
            }
        }
        
        res.json(stats);
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

// Export for Vercel
module.exports = app;