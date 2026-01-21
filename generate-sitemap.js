const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'https://estatenama.com'; // Replace with your actual domain
const OUTPUT_FILE = 'sitemap.xml';
const DATA_DIR = path.join(__dirname, 'admin-data');

// Static pages to include
const staticPages = [
    '',
    '/index.html',
    '/about.html',
    '/projects.html',
    '/services.html',
    '/blog.html',
    '/contact.html',
    '/faisal-town-projects.html',
    '/eighteen-projects.html',
    '/bahria-town-phase8-projects.html',
    '/ruden-enclave-projects.html',
    '/project-details.html?project=kingdom-valley'
];

// Helper to read JSON file
function readJsonFile(filename) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error(`Error reading ${filename}:`, error.message);
    }
    return [];
}

function generateSitemap() {
    console.log('Generating sitemap...');

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    const currentDate = new Date().toISOString().split('T')[0];

    // 1. Add Static Pages
    console.log(`Processing ${staticPages.length} static pages...`);
    staticPages.forEach(page => {
        const url = page.startsWith('http') ? page : `${BASE_URL}${page}`;
        xml += '  <url>\n';
        xml += `    <loc>${url}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
    });

    // 2. Add Blog Posts
    const blogs = readJsonFile('blogs.json');
    const posts = readJsonFile('posts.json');
    const allPosts = [...blogs, ...posts];
    
    console.log(`Processing ${allPosts.length} blog posts...`);
    
    allPosts.forEach(post => {
        if (post.status === 'published' && post.slug) {
            xml += '  <url>\n';
            xml += `    <loc>${BASE_URL}/blog-details.html?slug=${post.slug}</loc>\n`;
            xml += `    <lastmod>${post.date ? new Date(post.date).toISOString().split('T')[0] : currentDate}</lastmod>\n`;
            xml += '    <changefreq>monthly</changefreq>\n';
            xml += '    <priority>0.6</priority>\n';
            xml += '  </url>\n';
        }
    });

    // 3. Add Dynamic Projects (if any from JSON)
    const projects = readJsonFile('projects.json');
    // Note: If you have dynamic project pages like project-details.html?id=xyz
    // you can loop through them here.
    // For now, assuming most are static or handled in staticPages list.

    xml += '</urlset>';

    try {
        fs.writeFileSync(path.join(__dirname, OUTPUT_FILE), xml);
        console.log(`✅ Sitemap generated successfully at ${OUTPUT_FILE}`);
    } catch (error) {
        console.error('❌ Error writing sitemap:', error.message);
    }
}

// Run the generator
generateSitemap();
