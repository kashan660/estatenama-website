const { pool } = require('../db');

async function getAllBlogs(status = null) {
    let sql = 'SELECT * FROM blogs';
    const params = [];
    if (status) {
        sql += ' WHERE status = ?';
        params.push(status);
    }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute(sql, params);
    return rows;
}

async function getBlogBySlug(slug) {
    const [rows] = await pool.execute('SELECT * FROM blogs WHERE slug = ?', [slug]);
    return rows[0] || null;
}

async function getBlogById(id) {
    const [rows] = await pool.execute('SELECT * FROM blogs WHERE id = ?', [id]);
    return rows[0] || null;
}

async function createBlog(data) {
    const {
        title, slug, excerpt, content, featured_image,
        category, author, meta_title, meta_description, status
    } = data;

    const publishedAt = status === 'published' ? new Date() : null;

    const [result] = await pool.execute(
        `INSERT INTO blogs
         (title, slug, excerpt, content, featured_image, category, author, meta_title, meta_description, status, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, slug, excerpt, content, featured_image || null, category || 'Real Estate',
         author || 'Estate Nama', meta_title || null, meta_description || null,
         status || 'draft', publishedAt]
    );
    return getBlogById(result.insertId);
}

async function updateBlog(id, data) {
    const existing = await getBlogById(id);
    if (!existing) return null;

    const fields = [];
    const values = [];

    const mappings = {
        title: 'title', slug: 'slug', excerpt: 'excerpt', content: 'content',
        featured_image: 'featured_image', category: 'category', author: 'author',
        meta_title: 'meta_title', meta_description: 'meta_description', status: 'status'
    };

    for (const [key, col] of Object.entries(mappings)) {
        if (data[key] !== undefined) {
            fields.push(`${col} = ?`);
            values.push(data[key]);
        }
    }

    if (data.status === 'published' && existing.status !== 'published') {
        fields.push('published_at = ?');
        values.push(new Date());
    }

    if (fields.length === 0) return existing;

    values.push(id);
    await pool.execute(`UPDATE blogs SET ${fields.join(', ')} WHERE id = ?`, values);
    return getBlogById(id);
}

async function deleteBlog(id) {
    const [result] = await pool.execute('DELETE FROM blogs WHERE id = ?', [id]);
    return result.affectedRows > 0;
}

// Generate slug from title
function generateSlug(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 200);
}

module.exports = {
    getAllBlogs,
    getBlogBySlug,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    generateSlug
};
