// PostgreSQL data layer for EstateNama (Vercel + Prisma/Neon Postgres)
// Exposes the same method contract the rest of the app expects (getPosts, createBlog, ...).
// Internals use node-postgres (`pg`) against POSTGRES_URL.
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Resolve the connection string: env first, then db-config.json { url } fallback (local dev).
function getConnectionString() {
    if (process.env.POSTGRES_URL) return process.env.POSTGRES_URL;
    if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
    try {
        const configPath = path.join(process.cwd(), 'db-config.json');
        if (fs.existsSync(configPath)) {
            const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (fileConfig.url || fileConfig.connectionString) {
                return fileConfig.url || fileConfig.connectionString;
            }
        }
    } catch (e) {
        // ignore file read errors
    }
    return null;
}

// Reuse a single pool across warm serverless invocations.
let pool = null;
function getPool() {
    if (pool) return pool;
    const connectionString = getConnectionString();
    if (!connectionString) {
        throw new Error('Database not configured. Set the POSTGRES_URL environment variable (or provide db-config.json with a "url").');
    }
    pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 5,
        connectionTimeoutMillis: 15000,
        idleTimeoutMillis: 30000
    });
    pool.on('error', (err) => {
        console.error('Unexpected idle Postgres client error:', err.message);
    });
    return pool;
}

// Run a parameterized query and return rows.
async function query(text, params) {
    const client = getPool();
    try {
        const result = await client.query(text, params);
        return result.rows;
    } catch (error) {
        error.message = `[DB] ${error.message}`;
        throw error;
    }
}

async function queryOne(text, params) {
    const rows = await query(text, params);
    return rows[0];
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

// Helper: normalize a row's keys (snake_case -> camelCase) for frontend compatibility.
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

// Helper: coerce any incoming value into a clean string[] (accepts arrays or JSON strings).
function toTextArray(value) {
    if (value === undefined || value === null) return null;
    if (Array.isArray(value)) return value.map(v => (v === null || v === undefined) ? '' : String(v));
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed.map(v => String(v));
        } catch (e) {
            // Fallback: comma/newline separated list
            return trimmed.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
        }
        return [trimmed];
    }
    return null;
}

// Helper: coerce any incoming value into JSON (for jsonb columns).
function toJson(value) {
    if (value === undefined || value === null) return null;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return null;
        try {
            return JSON.stringify(JSON.parse(trimmed));
        } catch (e) {
            return JSON.stringify(trimmed);
        }
    }
    return JSON.stringify(value);
}

const db = {
    // Stats
    async getStats() {
        const [posts] = await query('SELECT COUNT(*)::int AS count FROM posts');
        const [blogs] = await query('SELECT COUNT(*)::int AS count FROM blogs');
        const [pages] = await query('SELECT COUNT(*)::int AS count FROM pages');
        const [projects] = await query('SELECT COUNT(*)::int AS count FROM projects');
        const [images] = await query('SELECT COUNT(*)::int AS count FROM images');
        return {
            posts: posts.count,
            blogs: blogs.count,
            pages: pages.count,
            projects: projects.count,
            images: images.count,
            // camelCase aliases used by the dashboard UI
            totalPosts: posts.count,
            totalBlogs: blogs.count,
            totalPages: pages.count,
            totalProjects: projects.count,
            totalImages: images.count,
            visitors: 0,
            inquiries: 0
        };
    },

    // --- Posts ---
    async getPosts() {
        return normalizeRows(await query('SELECT * FROM posts ORDER BY created_at DESC'));
    },

    async createPost(post) {
        let { title, slug, content, excerpt, featuredImage, category, author, status, published } = post;
        if (!slug && title) slug = slugify(title) + '-' + Date.now();
        if (published === undefined && status) published = status === 'published';
        const row = await queryOne(
            `INSERT INTO posts (title, slug, content, excerpt, featured_image, category, author, status, published, published_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [title, slug, content, excerpt || null, featuredImage || null, category || 'Real Estate',
             author || 'Estate Nama', status || 'draft', !!published, published ? new Date() : null]
        );
        return normalizeRow(row);
    },

    async updatePost(id, post) {
        const fields = [];
        const values = [];
        let i = 1;
        const mappings = {
            title: 'title', slug: 'slug', content: 'content', excerpt: 'excerpt',
            featuredImage: 'featured_image', category: 'category', author: 'author', status: 'status'
        };
        for (const [key, col] of Object.entries(mappings)) {
            if (post[key] !== undefined) { fields.push(`${col} = $${i++}`); values.push(post[key]); }
        }
        if (post.published !== undefined) { fields.push(`published = $${i++}`); values.push(!!post.published); }
        if (post.status === 'published') { fields.push(`published_at = $${i++}`); values.push(new Date()); }
        if (fields.length === 0) return await this.getPostById(id);
        values.push(id);
        const row = await queryOne(`UPDATE posts SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`, values);
        return normalizeRow(row);
    },

    async getPostById(id) {
        return normalizeRow(await queryOne('SELECT * FROM posts WHERE id = $1', [id]));
    },

    async deletePost(id) {
        await query('DELETE FROM posts WHERE id = $1', [id]);
        return { success: true };
    },

    // --- Blogs ---
    async getBlogs() {
        return normalizeRows(await query('SELECT * FROM blogs ORDER BY created_at DESC'));
    },

    async getBlogBySlug(slug) {
        return normalizeRow(await queryOne('SELECT * FROM blogs WHERE slug = $1', [slug]));
    },

    async createBlog(blog) {
        let { title, slug, excerpt, content, featuredImage, category, author, status, metaTitle, metaDescription } = blog;
        if (!slug && title) slug = slugify(title) + '-' + Date.now();
        const publishedAt = status === 'published' ? new Date() : null;
        const row = await queryOne(
            `INSERT INTO blogs (title, slug, excerpt, content, featured_image, category, author, status, meta_title, meta_description, published_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [title, slug, excerpt || null, content, featuredImage || null, category || 'Real Estate',
             author || 'Estate Nama', status || 'draft', metaTitle || null, metaDescription || null, publishedAt]
        );
        return normalizeRow(row);
    },

    async updateBlog(id, blog) {
        const fields = [];
        const values = [];
        let i = 1;
        const mappings = {
            title: 'title', slug: 'slug', excerpt: 'excerpt', content: 'content',
            featuredImage: 'featured_image', category: 'category', author: 'author',
            status: 'status', metaTitle: 'meta_title', metaDescription: 'meta_description'
        };
        for (const [key, col] of Object.entries(mappings)) {
            if (blog[key] !== undefined) { fields.push(`${col} = $${i++}`); values.push(blog[key]); }
        }
        if (blog.status === 'published') { fields.push(`published_at = $${i++}`); values.push(new Date()); }
        if (fields.length === 0) return await this.getBlogById(id);
        values.push(id);
        const row = await queryOne(`UPDATE blogs SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`, values);
        return normalizeRow(row);
    },

    async getBlogById(id) {
        return normalizeRow(await queryOne('SELECT * FROM blogs WHERE id = $1', [id]));
    },

    async deleteBlog(id) {
        await query('DELETE FROM blogs WHERE id = $1', [id]);
        return { success: true };
    },

    // --- Pages ---
    async getPages() {
        return normalizeRows(await query('SELECT * FROM pages ORDER BY sort_order ASC, created_at DESC'));
    },

    async getPagesPublic() {
        return normalizeRows(await query("SELECT * FROM pages WHERE status = 'published' ORDER BY sort_order ASC"));
    },

    async getNavPages() {
        return normalizeRows(await query(
            "SELECT * FROM pages WHERE status = 'published' AND show_in_nav = true ORDER BY sort_order ASC"
        ));
    },

    async getPageBySlug(slug) {
        return normalizeRow(await queryOne('SELECT * FROM pages WHERE slug = $1', [slug]));
    },

    async createPage(page) {
        // Accept both camelCase (API client) and snake_case (admin dashboard) keys.
        let title = page.title;
        let slug = page.slug;
        let content = page.content;
        const featuredImage = page.featuredImage ?? page.featured_image;
        const metaTitle = page.metaTitle ?? page.meta_title;
        const metaDescription = page.metaDescription ?? page.meta_description;
        const status = page.status;
        const sortOrder = page.sortOrder ?? page.sort_order;
        const showInNav = page.showInNav ?? page.show_in_nav;
        if (!slug && title) slug = slugify(title);
        const row = await queryOne(
            `INSERT INTO pages (title, slug, content, featured_image, meta_title, meta_description, status, sort_order, show_in_nav)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [title, slug, content, featuredImage || null, metaTitle || null,
             metaDescription || null, status || 'draft', sortOrder || 0, !!showInNav]
        );
        return normalizeRow(row);
    },

    async updatePage(id, page) {
        const fields = [];
        const values = [];
        let i = 1;
        // Accept both camelCase (API client) and snake_case (admin dashboard) keys.
        const p = {
            title: page.title,
            slug: page.slug,
            content: page.content,
            featuredImage: page.featuredImage ?? page.featured_image,
            metaTitle: page.metaTitle ?? page.meta_title,
            metaDescription: page.metaDescription ?? page.meta_description,
            status: page.status,
            sortOrder: page.sortOrder ?? page.sort_order,
            showInNav: page.showInNav ?? page.show_in_nav,
        };
        const mappings = {
            title: 'title', slug: 'slug', content: 'content',
            featuredImage: 'featured_image', metaTitle: 'meta_title',
            metaDescription: 'meta_description', status: 'status'
        };
        for (const [key, col] of Object.entries(mappings)) {
            if (p[key] !== undefined) { fields.push(`${col} = $${i++}`); values.push(p[key]); }
        }
        if (p.sortOrder !== undefined) { fields.push(`sort_order = $${i++}`); values.push(p.sortOrder); }
        if (p.showInNav !== undefined) { fields.push(`show_in_nav = $${i++}`); values.push(!!p.showInNav); }
        if (fields.length === 0) return await this.getPageById(id);
        values.push(id);
        const row = await queryOne(`UPDATE pages SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`, values);
        return normalizeRow(row);
    },

    async getPageById(id) {
        return normalizeRow(await queryOne('SELECT * FROM pages WHERE id = $1', [id]));
    },

    async deletePage(id) {
        await query('DELETE FROM pages WHERE id = $1', [id]);
        return { success: true };
    },

    // --- Projects ---
    async getProjects() {
        return normalizeRows(await query('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC'));
    },

    async getProjectBySlug(slug) {
        return normalizeRow(await queryOne('SELECT * FROM projects WHERE slug = $1', [slug]));
    },

    async getProjectById(id) {
        return normalizeRow(await queryOne('SELECT * FROM projects WHERE id = $1', [id]));
    },

    async createProject(project) {
        let { title, name, slug, subtitle, description, location, price, type, category, status, badge,
              featuredImage, image, images, videos, amenities, features, plots, paymentPlan, sortOrder } = project;
        const projectTitle = title || name;
        if (!slug && projectTitle) slug = slugify(projectTitle) + '-' + Date.now();
        const row = await queryOne(
            `INSERT INTO projects
                (title, slug, subtitle, description, location, price, type, category, status, badge,
                 featured_image, images, videos, amenities, features, plots, payment_plan, sort_order)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
            [projectTitle, slug, subtitle || null, description || null, location || null, price || null,
             type || 'residential', category || null, status || 'active', badge || null,
             featuredImage || image || null,
             toTextArray(images) || [], toTextArray(videos) || [],
             toTextArray(amenities) || [], toTextArray(features) || [],
             toJson(plots), paymentPlan || null, sortOrder || 0]
        );
        return normalizeRow(row);
    },

    async updateProject(id, project) {
        const fields = [];
        const values = [];
        let i = 1;
        const scalar = {
            title: 'title', slug: 'slug', subtitle: 'subtitle', description: 'description',
            location: 'location', price: 'price', type: 'type', category: 'category',
            status: 'status', badge: 'badge', paymentPlan: 'payment_plan'
        };
        for (const [key, col] of Object.entries(scalar)) {
            if (project[key] !== undefined) { fields.push(`${col} = $${i++}`); values.push(project[key]); }
        }
        if (project.featuredImage !== undefined || project.image !== undefined) {
            fields.push(`featured_image = $${i++}`); values.push(project.featuredImage || project.image || null);
        }
        if (project.images !== undefined) { fields.push(`images = $${i++}`); values.push(toTextArray(project.images) || []); }
        if (project.videos !== undefined) { fields.push(`videos = $${i++}`); values.push(toTextArray(project.videos) || []); }
        if (project.amenities !== undefined) { fields.push(`amenities = $${i++}`); values.push(toTextArray(project.amenities) || []); }
        if (project.features !== undefined) { fields.push(`features = $${i++}`); values.push(toTextArray(project.features) || []); }
        if (project.plots !== undefined) { fields.push(`plots = $${i++}`); values.push(toJson(project.plots)); }
        if (project.sortOrder !== undefined) { fields.push(`sort_order = $${i++}`); values.push(project.sortOrder); }
        if (fields.length === 0) return await this.getProjectById(id);
        values.push(id);
        const row = await queryOne(`UPDATE projects SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`, values);
        return normalizeRow(row);
    },

    async deleteProject(id) {
        await query('DELETE FROM projects WHERE id = $1', [id]);
        return { success: true };
    },

    // --- Images ---
    async getImages() {
        return normalizeRows(await query('SELECT * FROM images ORDER BY uploaded_at DESC'));
    },

    async createImage(image) {
        const { name, filename, url, size } = image;
        const row = await queryOne(
            'INSERT INTO images (name, filename, url, size) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, filename, url, size]
        );
        return normalizeRow(row);
    },

    async deleteImage(id) {
        await query('DELETE FROM images WHERE id = $1', [id]);
        return { success: true };
    },

    // --- Settings ---
    async getSettings() {
        const rows = await query('SELECT setting_key, setting_value FROM settings');
        const settings = {};
        rows.forEach(row => { settings[row.setting_key] = row.setting_value; });
        return settings;
    },

    async updateSettings(settingsObj) {
        for (const [key, value] of Object.entries(settingsObj)) {
            await query(
                `INSERT INTO settings (setting_key, setting_value) VALUES ($1, $2)
                 ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value`,
                [key, value]
            );
        }
        return await this.getSettings();
    },

    // --- Sections (editable homepage blocks; hero holds a slideshow in images[]) ---
    async getSections() {
        return normalizeRows(await query('SELECT * FROM sections ORDER BY sort_order ASC, created_at DESC'));
    },

    async getSectionsPublic() {
        return normalizeRows(await query(
            "SELECT * FROM sections WHERE status = 'published' ORDER BY sort_order ASC, created_at DESC"
        ));
    },

    async getSectionById(id) {
        return normalizeRow(await queryOne('SELECT * FROM sections WHERE id = $1', [id]));
    },

    async createSection(section) {
        const { type, title, subtitle, content, imageUrl, videoUrl, images, videos, buttonText, buttonLink, sortOrder, status } = section;
        const row = await queryOne(
            `INSERT INTO sections
                (type, title, subtitle, content, image_url, video_url, images, videos, button_text, button_link, sort_order, status)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
            [type || 'custom', title || null, subtitle || null, content || null,
             imageUrl || null, videoUrl || null, toTextArray(images) || [], toTextArray(videos) || [],
             buttonText || null, buttonLink || null, sortOrder || 0, status || 'draft']
        );
        return normalizeRow(row);
    },

    async updateSection(id, section) {
        const fields = [];
        const values = [];
        let i = 1;
        const scalar = {
            type: 'type', title: 'title', subtitle: 'subtitle', content: 'content',
            imageUrl: 'image_url', videoUrl: 'video_url', buttonText: 'button_text',
            buttonLink: 'button_link', status: 'status'
        };
        for (const [key, col] of Object.entries(scalar)) {
            if (section[key] !== undefined) { fields.push(`${col} = $${i++}`); values.push(section[key]); }
        }
        if (section.images !== undefined) { fields.push(`images = $${i++}`); values.push(toTextArray(section.images) || []); }
        if (section.videos !== undefined) { fields.push(`videos = $${i++}`); values.push(toTextArray(section.videos) || []); }
        if (section.sortOrder !== undefined) { fields.push(`sort_order = $${i++}`); values.push(section.sortOrder); }
        if (fields.length === 0) return await this.getSectionById(id);
        values.push(id);
        const row = await queryOne(`UPDATE sections SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`, values);
        return normalizeRow(row);
    },

    async deleteSection(id) {
        await query('DELETE FROM sections WHERE id = $1', [id]);
        return { success: true };
    },

    // Expose low-level helpers for setup/seed scripts
    _query: query,
    _slugify: slugify
};

module.exports = db;
