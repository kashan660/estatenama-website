/**
 * Blog Management Script
 * Handles fetching and displaying blog posts
 */

// Format date helper
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Fetch blog posts from the server (admin-data/blogs.json and posts.json)
async function fetchBlogPosts() {
    try {
        // Fetch both blogs and posts in parallel
        const [blogsResponse, postsResponse] = await Promise.all([
            fetch('/admin-data/blogs.json').catch(() => ({ ok: false })),
            fetch('/admin-data/posts.json').catch(() => ({ ok: false }))
        ]);

        let allContent = [];

        if (blogsResponse.ok) {
            const blogs = await blogsResponse.json();
            allContent = [...allContent, ...blogs];
        }

        if (postsResponse.ok) {
            const posts = await postsResponse.json();
            allContent = [...allContent, ...posts];
        }

        return allContent;
    } catch (error) {
        console.error('Error fetching content:', error);
        return [];
    }
}

// Load blog posts for the listing page
async function loadBlogPosts() {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;

    try {
        const posts = await fetchBlogPosts();
        
        // Filter for published posts only (unless in admin preview)
        const publishedPosts = posts.filter(post => post.status === 'published');
        
        if (publishedPosts.length === 0) {
            grid.innerHTML = `
                <div class="error-message" style="grid-column: 1/-1;">
                    <i class="fas fa-newspaper fa-3x" style="margin-bottom: 20px;"></i>
                    <h3>No posts found</h3>
                    <p>Check back later for new updates.</p>
                </div>
            `;
            return;
        }

        // Sort by date (newest first)
        publishedPosts.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

        grid.innerHTML = publishedPosts.map(post => `
            <article class="blog-card" onclick="window.location.href='blog-details.html?slug=${post.slug}'">
                <div class="blog-image">
                    <img src="${post.featuredImage || post.image || 'images/logos/logoe_statenama.png'}" alt="${post.title}" loading="lazy">
                    <div class="blog-category">${post.category || 'Real Estate'}</div>
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <span class="blog-date"><i class="far fa-calendar-alt"></i> ${formatDate(post.date || post.createdAt || new Date())}</span>
                    </div>
                    <h3 class="blog-title">${post.title}</h3>
                    <p class="blog-excerpt">${post.excerpt || post.content.substring(0, 100) + '...'}</p>
                    <div class="blog-footer">
                        <span class="read-more">Read Article <i class="fas fa-arrow-right"></i></span>
                    </div>
                </div>
            </article>
        `).join('');

    } catch (error) {
        grid.innerHTML = `
            <div class="error-message" style="grid-column: 1/-1;">
                <h3>Error loading posts</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

// Load single blog details
async function loadBlogDetails() {
    const contentContainer = document.getElementById('blog-content');
    if (!contentContainer) return;

    // Get slug or id from URL
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    const id = urlParams.get('id');

    if (!slug && !id) {
        window.location.href = 'blog.html';
        return;
    }

    try {
        const posts = await fetchBlogPosts();
        
        // Find post by slug or id
        const post = posts.find(p => p.slug === slug || p.id == id);

        if (!post) {
            contentContainer.innerHTML = `
                <div class="container" style="text-align: center; padding: 100px 0;">
                    <h1>Article Not Found</h1>
                    <p>The article you are looking for does not exist.</p>
                    <a href="blog.html" class="btn btn-primary" style="margin-top: 20px;">Back to Blog</a>
                </div>
            `;
            return;
        }

        // Update Page Title and Meta
        document.title = `${post.title} - Estate Nama`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && post.metaDescription) {
            metaDesc.content = post.metaDescription;
        }

        // Render Content
        contentContainer.innerHTML = `
            <header class="blog-header">
                <div class="blog-header-bg" style="background-image: url('${post.featuredImage || post.image || 'images/homepage/home2.png'}')"></div>
                <div class="blog-header-overlay"></div>
                <div class="blog-header-content">
                    <div class="blog-category-badge">${post.category || 'Real Estate'}</div>
                    <h1 class="blog-title-large">${post.title}</h1>
                    <div class="blog-meta-large">
                        <span><i class="far fa-user"></i> ${post.author || 'Estate Nama'}</span>
                        <span style="margin: 0 10px;">|</span>
                        <span><i class="far fa-calendar-alt"></i> ${formatDate(post.date || post.createdAt || new Date())}</span>
                    </div>
                </div>
            </header>

            <article class="blog-body">
                <a href="blog.html" class="back-btn"><i class="fas fa-arrow-left"></i> Back to All Articles</a>
                
                ${post.content}

                <div class="share-section">
                    <h3>Share this article</h3>
                    <div class="share-buttons">
                        <button onclick="shareArticle('facebook')" title="Share on Facebook"><i class="fab fa-facebook-f"></i></button>
                        <button onclick="shareArticle('twitter')" title="Share on Twitter"><i class="fab fa-twitter"></i></button>
                        <button onclick="shareArticle('whatsapp')" title="Share on WhatsApp"><i class="fab fa-whatsapp"></i></button>
                        <button onclick="shareArticle('linkedin')" title="Share on LinkedIn"><i class="fab fa-linkedin-in"></i></button>
                    </div>
                </div>
            </article>
        `;

    } catch (error) {
        console.error('Error rendering blog details:', error);
        contentContainer.innerHTML = `
            <div class="container" style="text-align: center; padding: 100px 0;">
                <h1>Error Loading Article</h1>
                <p>Please try again later.</p>
                <a href="blog.html" class="btn btn-primary">Back to Blog</a>
            </div>
        `;
    }
}

// Share functionality
function shareArticle(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    
    let shareUrl = '';
    
    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${title} ${url}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

// Navigation handling (Hamburger menu)
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }
});
