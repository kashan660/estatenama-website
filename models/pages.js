const { pool } = require('../db');

async function getAllPages(status = null) {
    let sql = 'SELECT * FROM pages';
    const params = [];
    if (status) {
        sql += ' WHERE status = ?';
        params.push(status);
    }
    sql += ' ORDER BY sort_order ASC, created_at DESC';
    const [rows] = await pool.execute(sql, params);
    return rows;
}

async function getNavPages() {
    const [rows] = await pool.execute(
        'SELECT * FROM pages WHERE status = ? AND show_in_nav = 1 ORDER BY sort_order ASC',
        ['published']
    );
    return rows;
}

async function getPageBySlug(slug) {
    const [rows] = await pool.execute('SELECT * FROM pages WHERE slug = ?', [slug]);
    return rows[0] || null;
}

async function getPageById(id) {
    const [rows] = await pool.execute('SELECT * FROM pages WHERE id = ?', [id]);
    return rows[0] || null;
}

async function createPage(data) {
    const {
        title, slug, content, featured_image,
        meta_title, meta_description, status, sort_order, show_in_nav
    } = data;

    const [result] = await pool.execute(
        `INSERT INTO pages
         (title, slug, content, featured_image, meta_title, meta_description, status, sort_order, show_in_nav)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, slug, content, featured_image || null, meta_title || null,
         meta_description || null, status || 'draft', sort_order || 0, show_in_nav ? 1 : 0]
    );
    return getPageById(result.insertId);
}

async function updatePage(id, data) {
    const existing = await getPageById(id);
    if (!existing) return null;

    const fields = [];
    const values = [];

    const mappings = {
        title: 'title', slug: 'slug', content: 'content',
        featured_image: 'featured_image', meta_title: 'meta_title',
        meta_description: 'meta_description', status: 'status',
        sort_order: 'sort_order'
    };

    for (const [key, col] of Object.entries(mappings)) {
        if (data[key] !== undefined) {
            fields.push(`${col} = ?`);
            values.push(data[key]);
        }
    }

    if (data.show_in_nav !== undefined) {
        fields.push('show_in_nav = ?');
        values.push(data.show_in_nav ? 1 : 0);
    }

    if (fields.length === 0) return existing;

    values.push(id);
    await pool.execute(`UPDATE pages SET ${fields.join(', ')} WHERE id = ?`, values);
    return getPageById(id);
}

async function deletePage(id) {
    const [result] = await pool.execute('DELETE FROM pages WHERE id = ?', [id]);
    return result.affectedRows > 0;
}

function generateSlug(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 200);
}

module.exports = {
    getAllPages,
    getNavPages,
    getPageBySlug,
    getPageById,
    createPage,
    updatePage,
    deletePage,
    generateSlug
};
