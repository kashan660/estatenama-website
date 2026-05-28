const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database config: Vercel env vars first, then db-config.json, then defaults
function getConfig() {
    let fileConfig = {};
    try {
        const configPath = path.join(process.cwd(), 'db-config.json');
        if (fs.existsSync(configPath)) {
            fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
    } catch (e) {
        // ignore file read errors
    }

    const config = {
        host: process.env.DB_HOST || fileConfig.host || 'sql.hostinger.com',
        user: process.env.DB_USER || fileConfig.user || 'u513195619_estatenamau',
        password: process.env.DB_PASSWORD || fileConfig.password || 'v*11?=?^I',
        database: process.env.DB_NAME || fileConfig.database || 'u513195619_estatenamadb',
        connectTimeout: 15000,
        acquireTimeout: 15000
    };
    return config;
}

// Create a connection for this request (serverless-safe)
async function getConnection() {
    const config = getConfig();
    if (!config.password) {
        throw new Error('Database password not configured. Set DB_PASSWORD environment variable.');
    }
    return mysql.createConnection(config);
}

// Helper: generate slug
function slugify(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

// Helper: normalize MySQL row (snake_case to camelCase for frontend compatibility)
function normalizeRow(row) {
    if (!row) return row;
    const normalized = {};
    for (const [key, value] of Object.entries(row)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        normalized[camelKey] = value;
    }
    return normalized;
}

function normalizeRows(rows) {
    return rows.map(normalizeRow);
}

const db = {
    // Stats
    async getStats() {
        const conn = await getConnection();
        try {
            const [[postsCount]] = await conn.execute('SELECT COUNT(*) as count FROM posts');
            const [[blogsCount]] = await conn.execute('SELECT COUNT(*) as count FROM blogs');
            const [[pagesCount]] = await conn.execute('SELECT COUNT(*) as count FROM pages');
            const [[projectsCount]] = await conn.execute('SELECT COUNT(*) as count FROM projects');
            const [[imagesCount]] = await conn.execute('SELECT COUNT(*) as count FROM images');
            return {
                posts: postsCount.count,
                blogs: blogsCount.count,
                pages: pagesCount.count,
                projects: projectsCount.count,
                images: imagesCount.count,
                visitors: 0,
                inquiries: 0
            };
        } finally {
            await conn.end();
        }
    },

    // --- Posts ---
    async getPosts() {
        const conn = await getConnection();
        try {
            const [rows] = await conn.execute('SELECT * FROM posts ORDER BY created_at DESC');
            return normalizeRows(rows);
        } finally {
            await conn.end();
        }
    },

    async createPost(post) {
        const conn = await getConnection();
        try {
            let { title, slug, content, excerpt, featuredImage, category, author, status, published } = post;
            if (!slug && title) slug = slugify(title) + '-' + Date.now();
            if (published === undefined && status) published = status === 'published';

            const [result] = await conn.execute(
                `INSERT INTO posts (title, slug, content, excerpt, featured_image, category, author, status, published, published_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [title, slug, content, excerpt || null, featuredImage || null, category || 'Real Estate',
                 author || 'Estate Nama', status || 'draft', published ? 1 : 0,
                 published ? new Date() : null]
            );
            const [rows] = await conn.execute('SELECT * FROM posts WHERE id = ?', [result.insertId]);
            return normalizeRow(rows[0]);
        } finally {
            await conn.end();
        }
    },

    async updatePost(id, post) {
        const conn = await getConnection();
        try {
            const fields = [];
            const values = [];
            const mappings = {
                title: 'title', slug: 'slug', content: 'content', excerpt: 'excerpt',
                featuredImage: 'featured_image', category: 'category', author: 'author',
                status: 'status'
            };
            for (const [key, col] of Object.entries(mappings)) {
                if (post[key] !== undefined) {
                    fields.push(`${col} = ?`);
                    values.push(post[key]);
                }
            }
            if (post.published !== undefined) {
                fields.push('published = ?');
                values.push(post.published ? 1 : 0);
            }
            if (post.status === 'published') {
                fields.push('published_at = ?');
                values.push(new Date());
            }
            if (fields.length === 0) return await this.getPostById(id);
            values.push(id);
            await conn.execute(`UPDATE posts SET ${fields.join(', ')} WHERE id = ?`, values);
            const [rows] = await conn.execute('SELECT * FROM posts WHERE id = ?', [id]);
            return normalizeRow(rows[0]);
        } finally {
            await conn.end();
        }
    },

    async getPostById(id) {
        const conn = await getConnection();
        try {
            const [rows] = await conn.execute('SELECT * FROM posts WHERE id = ?', [id]);
            return normalizeRow(rows[0]);
        } finally {
            await conn.end();
        }
    },

    async deletePost(id) {
        const conn = await getConnection();
        try {
            await conn.execute('DELETE FROM posts WHERE id = ?', [id]);
            return { success: true };
        } finally {
            await conn.end();
        }
    },

    // --- Blogs ---
    async getBlogs() {
        const conn = await getConnection();
        try {
            const [rows] = await conn.execute('SELECT * FROM blogs ORDER BY created_at DESC');
            return normalizeRows(rows);
        } finally {
            await conn.end();
        }
    },

    async getBlogBySlug(slug) {
        const conn = await getConnection();
        try {
            const [rows] = await conn.execute('SELECT * FROM blogs WHERE slug = ?', [slug]);
            return normalizeRow(rows[0]);
        } finally {
            await conn.end();
        }
    },

    async createBlog(blog) {
        const conn = await getConnection();
        try {
            let { title, slug, excerpt, content, featuredImage, category, author, status, metaTitle, metaDescription } = blog;
            if (!slug && title) slug = slugify(title) + '-' + Date.now();
            const publishedAt = status === 'published' ? new Date() : null;

            const [result] = await conn.execute(
                `INSERT INTO blogs (title, slug, excerpt, content, featured_image, category, author, status, meta_title, meta_description, published_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [title, slug, excerpt || null, content, featuredImage || null, category || 'Real Estate',
                 author || 'Estate Nama', status || 'draft', metaTitle || null, metaDescription || null, publishedAt]
            );
            const [rows] = await conn.execute('SELECT * FROM blogs WHERE id = ?', [result.insertId]);
            return normalizeRow(rows[0]);
        } finally {
            await conn.end();
        }
    },

    async updateBlog(id, blog) {
        const conn = await getConnection();
        try {
            const fields = [];
            const values = [];
            const mappings = {
                title: 'title', slug: 'slug', excerpt: 'excerpt', content: 'content',
                featuredImage: 'featured_image', category: 'category', author: 'author',
                status: 'status', metaTitle: 'meta_title', metaDescription: 'meta_description'
            };
            for (const [key, col] of Object.entries(mappings)) {
                if (blog[key] !== undefined) {
                    fields.push(`${col} = ?`);
                    values.push(blog[key]);
                }
            }
            if (blog.status === 'published') {
                fields.push('published_at = ?');
                values.push(new Date());
            }
            if (fields.length === 0) return await this.getBlogById(id);
            values.push(id);
            await conn.execute(`UPDATE blogs SET ${fields.join(', ')} WHERE id = ?`, values);
            const [rows] = await conn.execute('SELECT * FROM blogs WHERE id = ?', [id]);
            return normalizeRow(rows[0]);
        } finally {
            await conn.end();
        }
    },

    async getBlogById(id) {
        const conn = await getConnection();
        try {
            const [rows] = await conn.execute('SELECT * FROM blogs WHERE id = ?', [id]);
            return normalizeRow(rows[0]);
        } finally {
            await conn.end();
        }
    },

    async deleteBlog(id) {
        const conn = await getConnection();
        try {
            await conn.execute('DELETE FROM blogs WHERE id = ?', [id]);
            return { success: true };
        } finally {
            await conn.end();
        }
    },

    // --- Pages ---
    async getPages() {
        const conn = await getConnection();
        try {
            const [rows] = await conn.execute('SELECT * FROM pages ORDER BY sort_order ASC, created_at DESC');
            return normalizeRows(rows);
        } finally {
            await conn.end();
        }
    },

    async getPagesPublic() {
        const conn = await getConnection();
        try {
            const [rows] = await conn.execute('SELECT * FROM pages WHERE status = ? ORDER BY sort_order ASC', ['published']);
            return normalizeRows(rows);
        } finally {
            await conn.end();
        }
    },

    async getNavPages() {
        const conn = await getConnection();
        try {
            const [rows] = await conn.execute(
                'SELECT * FROM pages WHERE status = ? AND show_in_nav = 1 ORDER BY sort_order ASC',
                ['published']
            );
            return normalizeRows(rows);
        } finally {
            await conn.end();
        }
    },

    async getPageBySlug(slug) {
        const conn = await getConnection();
        try {
            const [rows] = await conn.execute('SELECT * FROM pages WHERE slug = ?', [slug]);
            return normalizeRow(rows[0]);
        } finally {
            await conn.end();
        }
    },

    async createPage(page) {
        const conn = await getConnection();
        try {
            let { title, slug, content, featuredImage, metaTitle, metaDescription, status, sortOrder, showInNav } = page;
            if (!slug && title) slug = slugify(title);
            const [result] = await conn.execute(
                `INSERT INTO pages (title, slug, content, featured_image, meta_title, meta_description, status, sort_order, show_in_nav)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [title, slug, content, featuredImage || null, metaTitle || null,
                 metaDescription || null, status || 'draft', sortOrder || 0, showInNav ? 1 : 0]
            );
            const [rows] = await conn.execute('SELECT * FROM pages WHERE id = ?', [result.insertId]);
            return normalizeRow(rows[0]);
        } finally {
            await conn.end();
        }
    },

    async updatePage(id, page) {
        const conn = await getConnection();
        try {
            const fields = [];
            const values = [];
            const mappings = {
                title: 'title', slug: 'slug', content: 'content',
                featuredImage: 'featured_image', metaTitle: 'meta_title',
                metaDescription: 'meta_description', status: 'status'
            };
            for (const [key, col] of Object.entries(mappings)) {
                if (page[key] !== undefined) {
                    fields.push(`${col} = ?`);
                    values.push(page[key]);
                }
            }
            if (page.sortOrder !== undefined) {
                fields.push('sort_order = ?');
                values.push(page.sortOrder);
            }
            if (page.showInNav !== undefined) {
                fields.push('show_in_nav = ?');
                values.push(page.showInNav ? 1 : 0);
            }
            if (fields.length === 0) return await this.getPageById(id);
            values.push(id);
            await conn.execute(`UPDATE pages SET ${fields.join(', ')} WHERE id = ?`, values);
            const [rows] = await conn.execute('SELECT * FROM pages WHERE id = ?', [id]);
            return normalizeRow(rows[0]);
        } finally {
            await conn.end();
        }
    },

    async getPageById(id) {
        const conn = await getConnection();
        try {
            const [rows] = await conn.execute('SELECT * FROM pages WHERE id = ?', [id]);
            return normalizeRow(rows[0]);
        } finally {
            await conn.end();
        }
    },

    async deletePage(id) {
        const conn = await getConnection();
        try {
            await conn.execute('DELETE FROM pages WHERE id = ?', [id]);
            return { success: true };
        } finally {
            await conn.end();
        }
    },

    // --- Projects ---
    async getProjects() {
        const conn = await getConnection();
        try {
            const [rows] = await conn.execute('SELECT * FROM projects ORDER BY created_at DESC');
            return normalizeRows(rows);
        } finally {
            await conn.end();
        }
    },

    async createProject(project) {
        const conn = await getConnection();
        try {
            let { title, name, slug, description, location, price, status, featuredImage, image, images, amenities, features } = project;
            const projectTitle = title || name;
            if (!slug && projectTitle) slug = slugify(projectTitle) + '-' + Date.now();
            const projectAmenities = JSON.stringify(amenities || features || []);
            const projectImages = JSON.stringify(images || []);
            const projectImage = featuredImage || image;

            const [result] = await conn.execute(
                `INSERT INTO projects (title, slug, description, location, price, status, featured_image, images, amenities, features)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [projectTitle, slug, description || null, location || null, price || null,
                 status || 'active', projectImage || null, projectImages, projectAmenities, projectAmenities]
            );
            const [rows] = await conn.execute('SELECT * FROM projects WHERE id = ?', [result.insertId]);
            return normalizeRow(rows[0]);
        } finally {
            await conn.end();
        }
    },

    async updateProject(id, project) {
        const conn = await getConnection();
        try {
            const fields = [];
            const values = [];
            const mappings = {
                title: 'title', slug: 'slug', description: 'description',
                location: 'location', price: 'price', status: 'status'
            };
            for (const [key, col] of Object.entries(mappings)) {
                if (project[key] !== undefined) {
                    fields.push(`${col} = ?`);
                    values.push(project[key]);
                }
            }
            if (project.featuredImage !== undefined || project.image !== undefined) {
                fields.push('featured_image = ?');
                values.push(project.featuredImage || project.image);
            }
            if (project.images !== undefined) {
                fields.push('images = ?');
                values.push(JSON.stringify(project.images));
            }
            if (project.amenities !== undefined || project.features !== undefined) {
                fields.push('amenities = ?');
                values.push(JSON.stringify(project.amenities || project.features));
                fields.push('features = ?');
                values.push(JSON.stringify(project.amenities || project.features));
            }
            if (fields.length === 0) return await this.getProjectById(id);
            values.push(id);
            await conn.execute(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);
            const [rows] = await conn.execute('SELECT * FROM projects WHERE id = ?', [id]);
            return normalizeRow(rows[0]);
        } finally {
            await conn.end();
        }
    },

    async getProjectById(id) {
        const conn = await getConnection();
        try {
            const [rows] = await conn.execute('SELECT * FROM projects WHERE id = ?', [id]);
            return normalizeRow(rows[0]);
        } finally {
            await conn.end();
        }
    },

    async deleteProject(id) {
        const conn = await getConnection();
        try {
            await conn.execute('DELETE FROM projects WHERE id = ?', [id]);
            return { success: true };
        } finally {
            await conn.end();
        }
    },

    // --- Images ---
    async getImages() {
        const conn = await getConnection();
        try {
            const [rows] = await conn.execute('SELECT * FROM images ORDER BY uploaded_at DESC');
            return normalizeRows(rows);
        } finally {
            await conn.end();
        }
    },

    async createImage(image) {
        const conn = await getConnection();
        try {
            const { name, filename, url, size } = image;
            const [result] = await conn.execute(
                'INSERT INTO images (name, filename, url, size) VALUES (?, ?, ?, ?)',
                [name, filename, url, size]
            );
            const [rows] = await conn.execute('SELECT * FROM images WHERE id = ?', [result.insertId]);
            return normalizeRow(rows[0]);
        } finally {
            await conn.end();
        }
    },

    async deleteImage(id) {
        const conn = await getConnection();
        try {
            await conn.execute('DELETE FROM images WHERE id = ?', [id]);
            return { success: true };
        } finally {
            await conn.end();
        }
    },

    // --- Settings ---
    async getSettings() {
        const conn = await getConnection();
        try {
            const [rows] = await conn.execute('SELECT setting_key, setting_value FROM settings');
            const settings = {};
            rows.forEach(row => {
                settings[row.setting_key] = row.setting_value;
            });
            return settings;
        } finally {
            await conn.end();
        }
    },

    async updateSettings(settingsObj) {
        const conn = await getConnection();
        try {
            for (const [key, value] of Object.entries(settingsObj)) {
                await conn.execute(
                    `INSERT INTO settings (setting_key, setting_value)
                     VALUES (?, ?)
                     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
                    [key, value]
                );
            }
            return await this.getSettings();
        } finally {
            await conn.end();
        }
    }
};

module.exports = db;
