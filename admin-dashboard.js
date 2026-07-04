// Admin Dashboard Management System
class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.api = new AdminAPI();
        
        // Set API token from current session
        const sessionData = localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                if (session.token) {
                    this.api.setToken(session.token);
                }
            } catch (error) {
                console.error('Failed to parse session data:', error);
            }
        }
        
        this.posts = [];
        this.blogs = [];
        this.pages = [];
        this.images = [];
        this.projects = [];
        this.init();
    }

    init() {
        // Check authentication first
        const auth = new AdminAuth();
        if (!auth.isLoggedIn()) {
            window.location.href = 'admin-login.html';
            return;
        }

        // Check for production environment
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            // production check
        }
        
        this.setupEventListeners();
        this.loadUserInfo();
        this.loadSettings();
        this.updateStats();
        this.loadContent();
    }

    showProductionWarning() {
        // Warning removed as we are now using Vercel Postgres
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(e);
            });
        });

        // Logout button
        document.querySelector('.logout-btn')?.addEventListener('click', () => {
            const auth = new AdminAuth();
            auth.logout();
        });

        // Add buttons
        document.getElementById('addPostBtn')?.addEventListener('click', () => { window.location.href = 'new-post.html'; });
        document.getElementById('addBlogBtn')?.addEventListener('click', () => { window.location.href = 'new-blog.html'; });
        document.getElementById('addPageBtn')?.addEventListener('click', () => { window.location.href = 'new-page.html'; });
        document.getElementById('addProjectBtn')?.addEventListener('click', () => this.showProjectModal());
        document.getElementById('addSectionBtn')?.addEventListener('click', () => this.showSectionModal());
        document.getElementById('addHeroImageBtn')?.addEventListener('click', () => this.addHeroImage());
        document.getElementById('saveHeroBtn')?.addEventListener('click', () => this.saveHero());
        document.getElementById('uploadImageBtn')?.addEventListener('click', () => this.showImageUploadModal());

        // Settings form
        document.getElementById('settingsForm')?.addEventListener('submit', (e) => this.saveSettings(e));

        // Sitemap refresh
        document.getElementById('refreshSitemapBtn')?.addEventListener('click', () => this.refreshSitemap());

        // Modal close
        document.querySelector('.modal-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'modal') this.closeModal();
        });
    }

    loadUserInfo() {
        const auth = new AdminAuth();
        const user = auth.getCurrentUser();
        if (user) {
            document.getElementById('currentUser').textContent = user.username;
        }
    }

    handleNavigation(e) {
        const section = e.currentTarget.dataset.section;
        if (section) {
            // Handle image manager separately - redirect to dedicated page
            if (section === 'images') {
                window.location.href = 'admin-images.html';
                return;
            }
            // Settings has its own dedicated page
            if (section === 'settings') {
                window.location.href = 'admin-settings.html';
                return;
            }
            this.switchSection(section);
        }
    }

    switchSection(section) {
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update active content section
        document.querySelectorAll('.content-section').forEach(contentSection => {
            contentSection.classList.remove('active');
        });
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            posts: 'Manage Posts',
            blogs: 'Manage Blogs',
            pages: 'Manage Pages',
            projects: 'Manage Projects / Societies',
            hero: 'Hero Slideshow',
            sections: 'Homepage Sections',
            gallery: 'Manage Gallery',
            images: 'Image Manager',
            seo: 'SEO & Sitemap',
            settings: 'Website Settings'
        };
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = titles[section] || 'Dashboard';
        }

        this.currentSection = section;
        this.loadContent();
    }

    toggleSidebar() {
        document.querySelector('.admin-sidebar').classList.toggle('collapsed');
    }

    async updateStats() {
        try {
            const stats = await this.api.getStats();
            const totalBlogsEl = document.getElementById('totalBlogs');
            const totalPagesEl = document.getElementById('totalPages');
            const totalImagesEl = document.getElementById('totalImages');
            if (totalBlogsEl) totalBlogsEl.textContent = stats.totalBlogs || 0;
            if (totalPagesEl) totalPagesEl.textContent = stats.totalPages || 0;
            if (totalImagesEl) totalImagesEl.textContent = stats.totalImages || 0;
        } catch (error) {
            console.error('Failed to load stats:', error);
            document.getElementById('totalBlogs').textContent = this.blogs.length;
            document.getElementById('totalPages').textContent = this.pages.length;
            document.getElementById('totalImages').textContent = this.images.length;
        }
    }

    async loadContent() {
        try {
            // Load data from API
            await this.loadPosts();
            await this.loadBlogs();
            await this.loadPages();
            await this.loadGallery();
            await this.loadProjects();
            await this.loadSections();
            await this.loadHero();
            await this.updateStats();
            
            // Load recent activity
            const activityList = document.getElementById('activityList');
            if (activityList) {
                activityList.innerHTML = `
                    <div class="activity-item">
                        <i class="fas fa-plus"></i>
                        <span>New post created: Welcome to EstateNama</span>
                        <time>2 hours ago</time>
                    </div>
                    <div class="activity-item">
                        <i class="fas fa-edit"></i>
                        <span>Blog updated: Real Estate Investment Tips</span>
                        <time>4 hours ago</time>
                    </div>
                    <div class="activity-item">
                        <i class="fas fa-upload"></i>
                        <span>5 new images uploaded to gallery</span>
                        <time>6 hours ago</time>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Failed to load content:', error);
            this.showNotification('Failed to load content. Please refresh the page.', 'error');
        }
    }

    // Posts Management
    // Clickable live-URL link for a content row. Published => opens the real
    // page in a new tab; Draft => a disabled hint (drafts have no public URL yet).
    contentViewLink(type, item) {
        if (!item.slug) return '';
        const url = `/${type}/${item.slug}`;
        if (item.status === 'published') {
            return `<a class="btn btn-sm btn-secondary" href="${url}" target="_blank" rel="noopener" title="Open live page: ${url}"><i class="fas fa-external-link-alt"></i> View</a>`;
        }
        return `<span class="btn btn-sm btn-secondary" style="opacity:.5;cursor:not-allowed;" title="Draft — publish to get a live URL"><i class="fas fa-eye-slash"></i> Draft</span>`;
    }

    async loadPosts() {
        const tbody = document.getElementById('postsTableBody');
        if (!tbody) return;

        try {
            const response = await this.api.getPosts();
            this.posts = Array.isArray(response) ? response : (response.posts || []);
            
            tbody.innerHTML = this.posts.map(post => `
                <tr>
                    <td>${post.title}</td>
                    <td>${new Date(post.date || post.createdAt).toLocaleDateString()}</td>
                    <td><span class="status ${post.status}">${post.status}</span></td>
                    <td>
                        ${this.contentViewLink('post', post)}
                        <button class="btn btn-sm btn-secondary" onclick="adminDashboard.editPost('${post.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminDashboard.deletePost('${post.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Failed to load posts:', error);
            tbody.innerHTML = '<tr><td colspan="4">Failed to load posts. Please try again.</td></tr>';
        }
    }

    showPostModal(postId = null) {
        const post = postId ? this.posts.find(p => String(p.id) === String(postId)) : null;
        const isEdit = !!post;

        const modalContent = `
            <h2>${isEdit ? 'Edit Post' : 'Add New Post'}</h2>
            <form id="addPostForm">
                <div class="form-group">
                    <label for="postTitle">Title</label>
                    <input type="text" id="postTitle" value="${post?.title || ''}" required>
                </div>
                <div class="form-group">
                    <label for="postContent">Content</label>
                    <textarea id="postContent" rows="8" required>${post?.content || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="postStatus">Status</label>
                    <select id="postStatus">
                        <option value="draft" ${post?.status === 'draft' ? 'selected' : ''}>Draft</option>
                        <option value="published" ${post?.status === 'published' || post?.published === true ? 'selected' : ''}>Published</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" id="savePostBtn" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        ${isEdit ? 'Update' : 'Create'} Post
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="adminDashboard.closeModal()">
                        Cancel
                    </button>
                </div>
            </form>
        `;

        this.showModal(modalContent);

        // Handle button click directly to prevent form submission issues
        document.getElementById('savePostBtn').addEventListener('click', (e) => {
            e.preventDefault(); // Just in case
            const form = document.getElementById('addPostForm');
            if (form.checkValidity()) {
                this.savePost(postId);
            } else {
                form.reportValidity();
            }
        });
    }

    async savePost(postId = null) {
        const title = document.getElementById('postTitle').value;
        const content = document.getElementById('postContent').value;
        const status = document.getElementById('postStatus').value;

        const postData = {
            title,
            content,
            status
        };

        console.log('Saving post:', postId, postData);

        try {
            let savedPost;
            if (postId) {
                // Update existing post
                savedPost = await this.api.updatePost(postId, postData);
                console.log('Post updated successfully');
            } else {
                // Create new post
                savedPost = await this.api.createPost(postData);
                console.log('Post created successfully');
            }

            await this.loadPosts();
            this.updateStats();
            this.closeModal();
            this.showNotification(`Post successfully published and verified!`, 'success');
            this.addActivity(`${postId ? 'Updated' : 'Created'} post: ${title}`);
        } catch (error) {
            console.error('Failed to save post:', error);
            const msg = error.message || `Failed to ${postId ? 'update' : 'create'} post. Please try again.`;
            this.showNotification(msg, 'error');
            alert(msg); // Fallback alert
        }
    }

    editPost(postId) {
        window.location.href = 'new-post.html?id=' + encodeURIComponent(postId);
    }

    async deletePost(postId) {
        if (confirm('Are you sure you want to delete this post?')) {
            try {
                const post = this.posts.find(p => String(p.id) === String(postId));
                await this.api.deletePost(postId);
                await this.loadPosts();
                this.updateStats();
                this.showNotification('Post deleted successfully!', 'success');
                this.addActivity(`Deleted post: ${post?.title || 'Unknown'}`);
            } catch (error) {
                console.error('Failed to delete post:', error);
                this.showNotification(error.message || 'Failed to delete post. Please try again.', 'error');
            }
        }
    }

    // Blogs Management
    async loadBlogs() {
        const tbody = document.getElementById('blogsTableBody');
        if (!tbody) return;

        try {
            const response = await this.api.getBlogs();
            this.blogs = Array.isArray(response) ? response : (response.blogs || []);
            
            tbody.innerHTML = this.blogs.map(blog => `
                <tr>
                    <td>${blog.title}</td>
                    <td>${new Date(blog.date || blog.createdAt).toLocaleDateString()}</td>
                    <td><span class="status ${blog.status}">${blog.status}</span></td>
                    <td>
                        ${this.contentViewLink('blog', blog)}
                        <button class="btn btn-sm btn-secondary" onclick="adminDashboard.editBlog('${blog.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteBlog('${blog.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Failed to load blogs:', error);
            tbody.innerHTML = '<tr><td colspan="4">Failed to load blogs. Please try again.</td></tr>';
        }
    }

    showBlogModal(blogId = null) {
        const blog = blogId ? this.blogs.find(b => String(b.id) === String(blogId)) : null;
        const isEdit = !!blog;

        const modalContent = `
            <h2>${isEdit ? 'Edit Blog' : 'Add New Blog'}</h2>
            <form id="blogForm">
                <div class="form-group">
                    <label for="blogTitle">Title</label>
                    <input type="text" id="blogTitle" value="${blog?.title || ''}" required>
                </div>
                <div class="form-group">
                    <label for="blogSlug">Slug (URL)</label>
                    <input type="text" id="blogSlug" value="${blog?.slug || ''}" placeholder="Leave empty to auto-generate from title">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="blogCategory">Category</label>
                        <input type="text" id="blogCategory" value="${blog?.category || 'Real Estate'}">
                    </div>
                    <div class="form-group">
                        <label for="blogAuthor">Author</label>
                        <input type="text" id="blogAuthor" value="${blog?.author || 'Estate Nama'}">
                    </div>
                </div>
                <div class="form-group">
                    <label for="blogFeaturedImage">Featured Image</label>
                    <div style="display:flex;gap:8px;">
                        <input type="text" id="blogFeaturedImage" value="${blog?.featuredImage || ''}" placeholder="/uploads/image.jpg" style="flex:1;">
                        <button type="button" class="btn btn-secondary" onclick="adminDashboard.browseFeaturedImage('blogFeaturedImage','blogImagePreview')">Browse</button>
                    </div>
                    <img id="blogImagePreview" src="${blog?.featuredImage || ''}" style="${blog?.featuredImage ? '' : 'display:none;'}max-height:120px;margin-top:8px;border-radius:6px;">
                </div>
                <div class="form-group">
                    <label for="blogExcerpt">Excerpt</label>
                    <textarea id="blogExcerpt" rows="2">${blog?.excerpt || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="blogContent">Content (HTML, images & video supported)</label>
                    ${this.mediaToolbar('blogContent')}
                    <textarea id="blogContent" rows="10" required>${blog?.content || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="blogMetaTitle">Meta Title (SEO)</label>
                    <input type="text" id="blogMetaTitle" value="${blog?.metaTitle || ''}" placeholder="Defaults to title if empty">
                </div>
                <div class="form-group">
                    <label for="blogMetaDescription">Meta Description (SEO)</label>
                    <textarea id="blogMetaDescription" rows="2" placeholder="Defaults to excerpt if empty">${blog?.metaDescription || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="blogStatus">Status</label>
                    <select id="blogStatus">
                        <option value="published" ${blog?.status === 'published' ? 'selected' : ''}>Published</option>
                        <option value="draft" ${blog?.status === 'draft' ? 'selected' : ''}>Draft</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" id="saveBlogBtn" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        ${isEdit ? 'Update' : 'Create'} Blog
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="adminDashboard.closeModal()">
                        Cancel
                    </button>
                </div>
            </form>
        `;

        this.showModal(modalContent);

        document.getElementById('saveBlogBtn').addEventListener('click', (e) => {
            e.preventDefault();
            const form = document.getElementById('blogForm');
            if (form.checkValidity()) {
                this.saveBlog(blogId);
            } else {
                form.reportValidity();
            }
        });
    }

    async saveBlog(blogId = null) {
        const title = document.getElementById('blogTitle').value;
        const blogData = {
            title,
            slug: document.getElementById('blogSlug').value,
            category: document.getElementById('blogCategory').value,
            author: document.getElementById('blogAuthor').value,
            featuredImage: document.getElementById('blogFeaturedImage').value,
            excerpt: document.getElementById('blogExcerpt').value,
            content: document.getElementById('blogContent').value,
            metaTitle: document.getElementById('blogMetaTitle').value,
            metaDescription: document.getElementById('blogMetaDescription').value,
            status: document.getElementById('blogStatus').value
        };

        console.log('Saving blog:', blogId, blogData);

        try {
            let savedBlog;
            if (blogId) {
                // Update existing blog
                savedBlog = await this.api.updateBlog(blogId, blogData);
                console.log('Blog updated successfully');
            } else {
                // Create new blog
                savedBlog = await this.api.createBlog(blogData);
                console.log('Blog created successfully');
            }

            await this.loadBlogs();
            this.updateStats();
            this.closeModal();
            this.showNotification(`Blog successfully published and verified!`, 'success');
            this.addActivity(`${blogId ? 'Updated' : 'Created'} blog: ${title}`);
        } catch (error) {
            console.error('Failed to save blog:', error);
            const msg = error.message || `Failed to ${blogId ? 'update' : 'create'} blog. Please try again.`;
            this.showNotification(msg, 'error');
            alert(msg); // Fallback alert
        }
    }

    editBlog(blogId) {
        window.location.href = 'new-blog.html?id=' + encodeURIComponent(blogId);
    }

    async deleteBlog(blogId) {
        if (confirm('Are you sure you want to delete this blog?')) {
            try {
                const blog = this.blogs.find(b => String(b.id) === String(blogId));
                await this.api.deleteBlog(blogId);
                await this.loadBlogs();
                this.updateStats();
                this.showNotification('Blog deleted successfully!', 'success');
                this.addActivity(`Deleted blog: ${blog?.title || 'Unknown'}`);
            } catch (error) {
                console.error('Failed to delete blog:', error);
                this.showNotification(error.message || 'Failed to delete blog. Please try again.', 'error');
            }
        }
    }

    // Pages Management
    async loadPages() {
        const tbody = document.getElementById('pagesTableBody');
        if (!tbody) return;

        try {
            const response = await this.api.getPages();
            this.pages = Array.isArray(response) ? response : (response.pages || []);

            tbody.innerHTML = this.pages.map(page => `
                <tr>
                    <td>${page.title}</td>
                    <td><code>${page.slug}</code></td>
                    <td><span class="status ${page.status}">${page.status}</span></td>
                    <td>${(page.showInNav || page.show_in_nav) ? '<i class="fas fa-check" style="color: #27ae60;"></i>' : '<i class="fas fa-times" style="color: #e74c3c;"></i>'}</td>
                    <td>
                        ${this.contentViewLink('page', page)}
                        <button class="btn btn-sm btn-secondary" onclick="adminDashboard.editPage('${page.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminDashboard.deletePage('${page.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Failed to load pages:', error);
            tbody.innerHTML = '<tr><td colspan="5">Failed to load pages. Please try again.</td></tr>';
        }
    }

    showPageModal(pageId = null) {
        const page = pageId ? this.pages.find(p => String(p.id) === String(pageId)) : null;
        const isEdit = !!page;

        const modalContent = `
            <h2>${isEdit ? 'Edit Page' : 'Add New Page'}</h2>
            <form id="pageForm">
                <div class="form-group">
                    <label for="pageTitle">Title</label>
                    <input type="text" id="pageTitle" value="${page?.title || ''}" required>
                </div>
                <div class="form-group">
                    <label for="pageSlug">Slug (URL)</label>
                    <input type="text" id="pageSlug" value="${page?.slug || ''}" placeholder="e.g., about-us, services">
                    <small>Leave empty to auto-generate from title</small>
                </div>
                <div class="form-group">
                    <label for="pageContent">Content (HTML, images & video supported)</label>
                    ${this.mediaToolbar('pageContent')}
                    <textarea id="pageContent" rows="10" required>${page?.content || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="pageFeaturedImage">Featured Image</label>
                    <div style="display:flex;gap:8px;">
                        <input type="text" id="pageFeaturedImage" value="${page?.featuredImage || ''}" placeholder="/uploads/image.jpg" style="flex:1;">
                        <button type="button" class="btn btn-secondary" onclick="adminDashboard.browseFeaturedImage('pageFeaturedImage','pageImagePreview')">Browse</button>
                    </div>
                    <img id="pageImagePreview" src="${page?.featuredImage || ''}" style="${page?.featuredImage ? '' : 'display:none;'}max-height:120px;margin-top:8px;border-radius:6px;">
                </div>
                <div class="form-group">
                    <label for="pageMetaTitle">Meta Title (SEO)</label>
                    <input type="text" id="pageMetaTitle" value="${page?.metaTitle || ''}">
                </div>
                <div class="form-group">
                    <label for="pageMetaDescription">Meta Description (SEO)</label>
                    <textarea id="pageMetaDescription" rows="2">${page?.metaDescription || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="pageStatus">Status</label>
                        <select id="pageStatus">
                            <option value="published" ${page?.status === 'published' ? 'selected' : ''}>Published</option>
                            <option value="draft" ${page?.status === 'draft' ? 'selected' : ''}>Draft</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="pageSortOrder">Sort Order</label>
                        <input type="number" id="pageSortOrder" value="${page?.sort_order ?? 0}" min="0">
                    </div>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="pageShowInNav" ${page?.show_in_nav ? 'checked' : ''}>
                        Show in Navigation Menu
                    </label>
                </div>
                <div class="form-actions">
                    <button type="button" id="savePageBtn" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        ${isEdit ? 'Update' : 'Create'} Page
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="adminDashboard.closeModal()">
                        Cancel
                    </button>
                </div>
            </form>
        `;

        this.showModal(modalContent);

        document.getElementById('savePageBtn').addEventListener('click', (e) => {
            e.preventDefault();
            const form = document.getElementById('pageForm');
            if (form.checkValidity()) {
                this.savePage(pageId);
            } else {
                form.reportValidity();
            }
        });
    }

    async savePage(pageId = null) {
        const title = document.getElementById('pageTitle').value;
        const slug = document.getElementById('pageSlug').value;
        const content = document.getElementById('pageContent').value;
        const featured_image = document.getElementById('pageFeaturedImage').value;
        const meta_title = document.getElementById('pageMetaTitle').value;
        const meta_description = document.getElementById('pageMetaDescription').value;
        const status = document.getElementById('pageStatus').value;
        const sort_order = parseInt(document.getElementById('pageSortOrder').value) || 0;
        const show_in_nav = document.getElementById('pageShowInNav').checked;

        const pageData = {
            title, slug, content, featured_image, meta_title, meta_description, status, sort_order, show_in_nav
        };

        try {
            if (pageId) {
                await this.api.updatePage(pageId, pageData);
            } else {
                await this.api.createPage(pageData);
            }

            await this.loadPages();
            this.updateStats();
            this.closeModal();
            this.showNotification(`Page ${pageId ? 'updated' : 'created'} successfully!`, 'success');
            this.addActivity(`${pageId ? 'Updated' : 'Created'} page: ${title}`);
        } catch (error) {
            console.error('Failed to save page:', error);
            this.showNotification(error.message || `Failed to ${pageId ? 'update' : 'create'} page. Please try again.`, 'error');
        }
    }

    editPage(pageId) {
        window.location.href = 'new-page.html?id=' + encodeURIComponent(pageId);
    }

    async deletePage(pageId) {
        if (confirm('Are you sure you want to delete this page?')) {
            try {
                const page = this.pages.find(p => String(p.id) === String(pageId));
                await this.api.deletePage(pageId);
                await this.loadPages();
                this.updateStats();
                this.showNotification('Page deleted successfully!', 'success');
                this.addActivity(`Deleted page: ${page?.title || 'Unknown'}`);
            } catch (error) {
                console.error('Failed to delete page:', error);
                this.showNotification(error.message || 'Failed to delete page. Please try again.', 'error');
            }
        }
    }

    // Projects Management
    async loadProjects() {
        const grid = document.getElementById('projectsGrid');
        if (!grid) return;

        try {
            const response = await this.api.getProjects();
            this.projects = Array.isArray(response) ? response : (response.projects || []);
            
            grid.innerHTML = this.projects.map(project => `
                <div class="project-card">
                    <div class="project-image">
                        <img src="${project.featuredImage || project.image || ''}" alt="${project.title}">
                    </div>
                    <div class="project-info">
                        <h3>${project.title}</h3>
                        <p style="color:#888;font-size:13px;">${project.category || ''} ${(project.images && project.images.length) ? '• ' + project.images.length + ' photos' : ''} ${(project.videos && project.videos.length) ? '• ' + project.videos.length + ' videos' : ''}</p>
                        <p>${(project.description || '').slice(0, 120)}</p>
                        <div class="project-actions">
                            <button class="btn btn-sm btn-secondary" onclick="adminDashboard.editProject('${project.id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteProject('${project.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load projects:', error);
            grid.innerHTML = '<div class="error-message">Failed to load projects. Please try again.</div>';
        }
    }

    showProjectModal(projectId = null) {
        const project = projectId ? this.projects.find(p => String(p.id) === String(projectId)) : null;
        const isEdit = !!project;
        
        // Plots are stored as JSON [{label, type}]; show them as one "label | type" per line.
        const plotsText = Array.isArray(project?.plots)
            ? project.plots.map(p => `${p.label || ''}${p.type ? ' | ' + p.type : ''}`).join('\n')
            : '';

        const modalContent = `
            <h2>${isEdit ? 'Edit Project / Society' : 'Add New Project / Society'}</h2>
            <form id="projectForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="projectTitle">Project / Society Name</label>
                        <input type="text" id="projectTitle" name="title" value="${project?.title || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="projectCategory">Category / Group</label>
                        <input type="text" id="projectCategory" name="category" value="${project?.category || ''}" placeholder="e.g., Faisal Town, Premium Projects">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="projectLocation">Location</label>
                        <input type="text" id="projectLocation" name="location" value="${project?.location || ''}">
                    </div>
                    <div class="form-group">
                        <label for="projectBadge">Badge / Status Label</label>
                        <input type="text" id="projectBadge" name="badge" value="${project?.badge || ''}" placeholder="e.g., New Launch, Luxury, Premium">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="projectPrice">Price Range</label>
                        <input type="text" id="projectPrice" name="price" value="${project?.price || ''}">
                    </div>
                    <div class="form-group">
                        <label for="projectType">Property Type</label>
                        <select id="projectType" name="type">
                            <option value="residential" ${project?.type === 'residential' ? 'selected' : ''}>Residential</option>
                            <option value="commercial" ${project?.type === 'commercial' ? 'selected' : ''}>Commercial</option>
                            <option value="plots" ${project?.type === 'plots' ? 'selected' : ''}>Plots</option>
                            <option value="mixed" ${project?.type === 'mixed' ? 'selected' : ''}>Mixed</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="projectSubtitle">Subtitle (short tagline)</label>
                    <input type="text" id="projectSubtitle" name="subtitle" value="${project?.subtitle || ''}">
                </div>
                <div class="form-group">
                    <label for="projectDescription">Description</label>
                    <textarea id="projectDescription" name="description" rows="4">${project?.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="projectImage">Featured Image</label>
                    <div style="display:flex;gap:8px;">
                        <input type="text" id="projectImage" name="image" value="${project?.featuredImage || project?.image || ''}" placeholder="https://..." style="flex:1;">
                        <button type="button" class="btn btn-secondary" onclick="adminDashboard.browseFeaturedImage('projectImage','projectImagePreview')">Browse</button>
                    </div>
                    <img id="projectImagePreview" src="${project?.featuredImage || project?.image || ''}" style="${(project?.featuredImage || project?.image) ? '' : 'display:none;'}max-height:120px;margin-top:8px;border-radius:6px;">
                </div>
                ${this.mediaArrayField('projectGallery', 'Photo Gallery', 'image', project?.images || [], 'Upload progress/development photos. Shown on the project details page.')}
                ${this.mediaArrayField('projectVideos', 'Videos', 'video', project?.videos || [], 'YouTube, Vimeo or MP4 links of the project/society.')}
                <div class="form-group">
                    <label for="projectFeatures">Key Features (comma separated)</label>
                    <input type="text" id="projectFeatures" name="features" value="${(project?.features || project?.amenities || []).join(', ')}" placeholder="e.g., 270ft Boulevard, Green Belts, Gated">
                </div>
                <div class="form-group">
                    <label for="projectPlots">Plot Pricing (one per line, format: <em>Label | Type</em>)</label>
                    <textarea id="projectPlots" rows="5" placeholder="5 Marla - PKR 34.75 Lac | Residential
Main Boulevard (50x60) - PKR 85 Lac | Commercial">${plotsText}</textarea>
                </div>
                <div class="form-group">
                    <label for="projectPaymentPlan">Payment Plan</label>
                    <textarea id="projectPaymentPlan" rows="2" placeholder="48 Months | 20% Down Payment | Flexible Installments">${project?.paymentPlan || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="projectLink">Menu Link (optional)</label>
                    <input type="text" id="projectLink" name="link" value="${project?.link || ''}" placeholder="e.g. /faisal-town-projects.html — leave blank to use the standard details page">
                    <small style="color:#666;">Where the header/footer menu points for this project. Blank = generic details page.</small>
                </div>
                <div class="form-group">
                    <label for="projectStatus">Status</label>
                    <select id="projectStatus">
                        <option value="active" ${(!project || project?.status === 'active') ? 'selected' : ''}>Active (visible)</option>
                        <option value="inactive" ${project?.status === 'inactive' ? 'selected' : ''}>Inactive (hidden)</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" id="saveProjectBtn" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        ${isEdit ? 'Update Project' : 'Add Project'}
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="adminDashboard.closeModal()">
                        Cancel
                    </button>
                </div>
            </form>
        `;

        this.showModal(modalContent);
        this.renderMediaArray('projectGallery', 'image');
        this.renderMediaArray('projectVideos', 'video');
        document.getElementById('saveProjectBtn').addEventListener('click', (e) => {
            e.preventDefault();
            const form = document.getElementById('projectForm');
            if (form.checkValidity()) {
                this.saveProject(projectId);
            } else {
                form.reportValidity();
            }
        });
    }

    // Parse the "Label | Type" plot textarea into [{label, type}]
    parsePlots(text) {
        if (!text) return [];
        return text.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
            const [label, type] = line.split('|').map(s => s.trim());
            return { label: label || '', type: type || '' };
        });
    }

    async saveProject(projectId = null) {
        const form = document.getElementById('projectForm');
        const formData = new FormData(form);

        const projectData = {
            title: formData.get('title'),
            category: formData.get('category'),
            location: formData.get('location'),
            badge: formData.get('badge'),
            price: formData.get('price'),
            type: formData.get('type'),
            subtitle: formData.get('subtitle'),
            description: formData.get('description'),
            featuredImage: formData.get('image'),
            images: this.getMediaArray('projectGallery'),
            videos: this.getMediaArray('projectVideos'),
            features: formData.get('features') ? formData.get('features').split(',').map(f => f.trim()).filter(Boolean) : [],
            plots: this.parsePlots(document.getElementById('projectPlots').value),
            paymentPlan: document.getElementById('projectPaymentPlan').value,
            link: formData.get('link') ? formData.get('link').trim() : '',
            status: document.getElementById('projectStatus').value
        };

        try {
            if (projectId) {
                // Update existing project
                await this.api.updateProject(projectId, projectData);
            } else {
                // Create new project
                await this.api.createProject(projectData);
            }

            await this.loadProjects();
            this.updateStats();
            this.closeModal();
            this.showNotification(`Project ${projectId ? 'updated' : 'created'} successfully!`, 'success');
            this.addActivity(`${projectId ? 'Updated' : 'Created'} project: ${projectData.title}`);
        } catch (error) {
            console.error('Failed to save project:', error);
            this.showNotification(error.message || `Failed to ${projectId ? 'update' : 'create'} project. Please try again.`, 'error');
        }
    }

    editProject(projectId) {
        this.showProjectModal(projectId);
    }

    async deleteProject(projectId) {
        if (confirm('Are you sure you want to delete this project?')) {
            try {
                const project = this.projects.find(p => String(p.id) === String(projectId));
                await this.api.deleteProject(projectId);
                await this.loadProjects();
                this.updateStats();
                this.showNotification('Project deleted successfully!', 'success');
                this.addActivity(`Deleted project: ${project?.title || 'Unknown'}`);
            } catch (error) {
                console.error('Failed to delete project:', error);
                this.showNotification(error.message || 'Failed to delete project. Please try again.', 'error');
            }
        }
    }

    // Gallery Management
    async loadGallery() {
        const grid = document.getElementById('galleryGrid');
        if (!grid) return;

        try {
            const response = await this.api.getImages();
            this.images = Array.isArray(response) ? response : (response.images || []);
            
            if (this.images.length === 0) {
                grid.innerHTML = '<div class="empty-state"><p>No images uploaded yet. Click "Upload Images" to get started.</p></div>';
                return;
            }

            grid.innerHTML = this.images.map(image => `
                <div class="gallery-item">
                    <img src="${image.url}" alt="${image.name || image.filename}">
                    <div class="gallery-overlay">
                        <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteImage('${image.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load gallery:', error);
            grid.innerHTML = '<div class="error-message">Failed to load images. Please try again.</div>';
        }
    }

    showImageUploadModal() {
        const modalContent = `
            <h2>Upload Images</h2>
            <div class="upload-area" id="uploadArea">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag and drop images here or click to select</p>
                <input type="file" id="imageInput" multiple accept="image/*" style="display: none;">
                <button type="button" class="btn btn-primary" onclick="document.getElementById('imageInput').click()">
                    Select Images
                </button>
            </div>
            <div id="uploadPreview" class="upload-preview"></div>
            <div class="form-actions">
                <button type="button" class="btn btn-primary" id="uploadBtn" style="display: none;">
                    <i class="fas fa-upload"></i>
                    Upload Images
                </button>
                <button type="button" class="btn btn-secondary" onclick="adminDashboard.closeModal()">
                    Cancel
                </button>
            </div>
        `;

        this.showModal(modalContent);
        this.setupImageUpload();
    }

    setupImageUpload() {
        const input = document.getElementById('imageInput');
        const uploadArea = document.getElementById('uploadArea');
        const preview = document.getElementById('uploadPreview');
        const uploadBtn = document.getElementById('uploadBtn');

        input.addEventListener('change', (e) => this.handleImageSelection(e.target.files));

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleImageSelection(e.dataTransfer.files);
        });

        uploadBtn.addEventListener('click', () => this.uploadImages());
    }

    handleImageSelection(files) {
        const preview = document.getElementById('uploadPreview');
        const uploadBtn = document.getElementById('uploadBtn');
        
        if (files.length > 0) {
            preview.innerHTML = '';
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const div = document.createElement('div');
                    div.className = 'preview-item';
                    div.innerHTML = `
                        <img src="${e.target.result}" alt="${file.name}">
                        <span>${file.name}</span>
                    `;
                    preview.appendChild(div);
                };
                reader.readAsDataURL(file);
            });
            uploadBtn.style.display = 'block';
        }
    }

    async uploadImages() {
        const input = document.getElementById('imageInput');
        const files = input.files;

        if (!files || files.length === 0) {
            this.showNotification('Please select at least one image.', 'warning');
            return;
        }

        const uploadBtn = document.getElementById('uploadBtn');
        if (uploadBtn) uploadBtn.disabled = true;

        try {
            const formData = new FormData();
            for (const file of files) {
                formData.append('images', file);
            }

            await this.api.uploadImages(formData);

            await this.loadGallery();
            this.updateStats();
            this.closeModal();
            this.showNotification(`${files.length} image(s) uploaded successfully!`, 'success');
            this.addActivity(`Uploaded ${files.length} image(s)`);
        } catch (error) {
            console.error('Failed to upload images:', error);
            this.showNotification(error.message || 'Failed to upload images. Please try again.', 'error');
        } finally {
            if (uploadBtn) uploadBtn.disabled = false;
        }
    }

    async deleteImage(imageId) {
        if (confirm('Are you sure you want to delete this image?')) {
            try {
                const image = this.images.find(img => String(img.id) === String(imageId));
                await this.api.deleteImage(imageId);
                await this.loadGallery();
                this.updateStats();
                this.showNotification('Image deleted successfully!', 'success');
                this.addActivity(`Deleted image: ${image?.name || image?.filename || 'Unknown'}`);
            } catch (error) {
                console.error('Failed to delete image:', error);
                this.showNotification(error.message || 'Failed to delete image. Please try again.', 'error');
            }
        }
    }

    // Post Management
    async addPost(e) {
        e.preventDefault();
        
        const postData = {
            title: document.getElementById('postTitle').value,
            content: document.getElementById('postContent').value,
            excerpt: document.getElementById('postExcerpt').value,
            category: document.getElementById('postCategory').value,
            status: document.getElementById('postStatus').value,
            featured: document.getElementById('postFeatured').checked
        };

        try {
            await this.api.createPost(postData);
            await this.loadPosts();
            this.updateStats();
            this.closeModal();
            this.showNotification('Post created successfully!', 'success');
            this.addActivity(`Created new post: ${postData.title}`);
            document.getElementById('addPostForm').reset();
        } catch (error) {
            console.error('Failed to create post:', error);
            this.showNotification(error.message || 'Failed to create post. Please try again.', 'error');
        }
    }

    // Blog Management
    async addBlog(e) {
        e.preventDefault();
        
        const blogData = {
            title: document.getElementById('blogTitle').value,
            content: document.getElementById('blogContent').value,
            excerpt: document.getElementById('blogExcerpt').value,
            author: document.getElementById('blogAuthor').value,
            tags: document.getElementById('blogTags').value.split(',').map(tag => tag.trim()),
            status: document.getElementById('blogStatus').value,
            featured: document.getElementById('blogFeatured').checked
        };

        try {
            await this.api.createBlog(blogData);
            await this.loadBlogs();
            this.updateStats();
            this.closeModal();
            this.showNotification('Blog article created successfully!', 'success');
            this.addActivity(`Created new blog: ${blogData.title}`);
            document.getElementById('addBlogForm').reset();
        } catch (error) {
            console.error('Failed to create blog:', error);
            this.showNotification(error.message || 'Failed to create blog. Please try again.', 'error');
        }
    }

    // Project Management
    async addProject(e) {
        e.preventDefault();
        
        const projectData = {
            name: document.getElementById('projectName').value,
            description: document.getElementById('projectDescription').value,
            location: document.getElementById('projectLocation').value,
            price: document.getElementById('projectPrice').value,
            type: document.getElementById('projectType').value,
            status: document.getElementById('projectStatus').value,
            features: document.getElementById('projectFeatures').value.split(',').map(feature => feature.trim()),
            installmentPlan: document.getElementById('projectInstallment').checked
        };

        try {
            await this.api.createProject(projectData);
            await this.loadProjects();
            this.updateStats();
            this.closeModal();
            this.showNotification('Project created successfully!', 'success');
            this.addActivity(`Created new project: ${projectData.name}`);
            document.getElementById('addProjectForm').reset();
        } catch (error) {
            console.error('Failed to create project:', error);
            this.showNotification(error.message || 'Failed to create project. Please try again.', 'error');
        }
    }

    // Image Upload Management
    async uploadImages(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('imageFiles');
        const files = fileInput.files;
        const category = document.getElementById('imageCategory').value;
        const description = document.getElementById('imageDescription').value;

        if (files.length === 0) {
            this.showNotification('Please select at least one image to upload.', 'warning');
            return;
        }

        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('images', files[i]);
            }
            formData.append('category', category);
            formData.append('description', description);

            await this.api.uploadImages(formData);
            await this.loadGallery();
            this.updateStats();
            this.closeModal();
            this.showNotification(`${files.length} image(s) uploaded successfully!`, 'success');
            this.addActivity(`Uploaded ${files.length} new image(s)`);
            document.getElementById('uploadImagesForm').reset();
        } catch (error) {
            console.error('Failed to upload images:', error);
            this.showNotification(error.message || 'Failed to upload images. Please try again.', 'error');
        }
    }

    // Settings Management
    async loadSettings() {
        try {
            const settings = await this.api.getSettings();
            if (document.getElementById('siteTitle')) {
                document.getElementById('siteTitle').value = settings.site_title || settings.siteTitle || '';
            }
            if (document.getElementById('siteDescription')) {
                document.getElementById('siteDescription').value = settings.site_description || settings.siteDescription || '';
            }
            if (document.getElementById('contactEmail')) {
                document.getElementById('contactEmail').value = settings.contact_email || settings.contactEmail || '';
            }
            if (document.getElementById('contactPhone')) {
                document.getElementById('contactPhone').value = settings.contact_phone || settings.contactPhone || '';
            }
            if (document.getElementById('companyAddress')) {
                document.getElementById('companyAddress').value = settings.company_address || settings.companyAddress || '';
            }
        } catch (error) {
            console.warn('Failed to load settings from API:', error);
        }
    }

    async saveSettings(e) {
        e.preventDefault();

        const settings = {
            site_title: document.getElementById('siteTitle').value,
            site_description: document.getElementById('siteDescription').value,
            contact_email: document.getElementById('contactEmail').value,
            contact_phone: document.getElementById('contactPhone').value,
            company_address: document.getElementById('companyAddress').value
        };

        try {
            await this.api.updateSettings(settings);
            this.showNotification('Settings saved successfully!', 'success');
            this.addActivity('Updated website settings');
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showNotification('Failed to save settings. Please try again.', 'error');
        }
    }

    // Sitemap / SEO
    async refreshSitemap() {
        const btn = document.getElementById('refreshSitemapBtn');
        if (btn) btn.disabled = true;
        try {
            await this.api.refreshSitemap();
            this.showNotification('Sitemap refreshed successfully!', 'success');
            this.addActivity('Refreshed sitemap');
        } catch (error) {
            console.error('Failed to refresh sitemap:', error);
            this.showNotification('Sitemap refresh failed. It will auto-update on next request.', 'warning');
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    // ===== Shared rich-content media helpers =====

    // Toolbar (HTML string) placed above a content <textarea>
    mediaToolbar(targetId) {
        return `
            <div class="editor-toolbar" style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
                <button type="button" class="btn btn-sm btn-secondary" onclick="adminDashboard.insertImage('${targetId}')"><i class="fas fa-image"></i> Image</button>
                <button type="button" class="btn btn-sm btn-secondary" onclick="adminDashboard.insertVideo('${targetId}')"><i class="fas fa-video"></i> Video</button>
                <button type="button" class="btn btn-sm btn-secondary" onclick="adminDashboard.insertSnippet('${targetId}','heading')"><i class="fas fa-heading"></i> Heading</button>
                <button type="button" class="btn btn-sm btn-secondary" onclick="adminDashboard.insertSnippet('${targetId}','paragraph')"><i class="fas fa-paragraph"></i> Paragraph</button>
                <button type="button" class="btn btn-sm btn-secondary" onclick="adminDashboard.insertSnippet('${targetId}','link')"><i class="fas fa-link"></i> Link</button>
            </div>`;
    }

    // Convert a YouTube/Vimeo/MP4 URL into responsive embed HTML
    toEmbedHtml(url) {
        if (!url) return '';
        url = url.trim();
        let m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
        if (m) {
            return `\n<div class="video-embed"><iframe src="https://www.youtube.com/embed/${m[1]}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>\n`;
        }
        m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        if (m) {
            return `\n<div class="video-embed"><iframe src="https://player.vimeo.com/video/${m[1]}" title="Vimeo video" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>\n`;
        }
        if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
            return `\n<div class="video-embed"><video controls src="${url}"></video></div>\n`;
        }
        return `\n<div class="video-embed"><iframe src="${url}" frameborder="0" allowfullscreen></iframe></div>\n`;
    }

    insertIntoTextarea(targetId, snippet) {
        const ta = document.getElementById(targetId);
        if (!ta) return;
        const start = ta.selectionStart ?? ta.value.length;
        const end = ta.selectionEnd ?? ta.value.length;
        ta.value = ta.value.slice(0, start) + snippet + ta.value.slice(end);
        ta.focus();
        const pos = start + snippet.length;
        ta.setSelectionRange(pos, pos);
    }

    insertSnippet(targetId, kind) {
        if (kind === 'heading') this.insertIntoTextarea(targetId, '\n<h2>Heading</h2>\n');
        else if (kind === 'paragraph') this.insertIntoTextarea(targetId, '\n<p>Your text here...</p>\n');
        else if (kind === 'link') {
            const url = prompt('Link URL:');
            if (!url) return;
            const text = prompt('Link text:', url) || url;
            this.insertIntoTextarea(targetId, `<a href="${url}" target="_blank" rel="noopener">${text}</a>`);
        }
    }

    insertVideo(targetId) {
        const url = prompt('Paste a YouTube, Vimeo, or MP4 video URL:');
        if (!url) return;
        this.insertIntoTextarea(targetId, this.toEmbedHtml(url));
    }

    insertImage(targetId) {
        this.openMediaLibrary((url) => {
            const alt = prompt('Image alt text (for SEO):', '') || '';
            this.insertIntoTextarea(targetId, `\n<img src="${url}" alt="${alt}" loading="lazy">\n`);
        });
    }

    // Media library overlay; calls onPick(url) when an image is chosen
    async openMediaLibrary(onPick) {
        this._mediaPickCb = onPick;
        const existing = document.getElementById('mediaLibraryOverlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'mediaLibraryOverlay';
        // z-index must exceed the content modal (.modal = 9999) so the picker
        // appears ABOVE it, not hidden behind — otherwise it looks like the popup vanished.
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:10001;display:flex;align-items:center;justify-content:center;padding:20px;';
        overlay.innerHTML = `
            <div style="background:#fff;border-radius:10px;max-width:820px;width:100%;max-height:85vh;overflow:auto;padding:24px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h3 style="margin:0;">Media Library</h3>
                    <button type="button" class="btn btn-sm btn-secondary" id="mediaLibClose">&times; Close</button>
                </div>
                <div class="form-group">
                    <label>Paste an image URL</label>
                    <div style="display:flex;gap:8px;">
                        <input type="text" id="mediaLibUrl" placeholder="https://..." style="flex:1;">
                        <button type="button" class="btn btn-primary" id="mediaLibUrlBtn">Use URL</button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Or upload a new image</label>
                    <input type="file" id="mediaLibUpload" accept="image/*">
                </div>
                <h4 style="margin:16px 0 8px;">Your uploads</h4>
                <div id="mediaLibGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;"><p>Loading...</p></div>
            </div>`;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        document.getElementById('mediaLibClose').onclick = close;
        document.getElementById('mediaLibUrlBtn').onclick = () => {
            const url = document.getElementById('mediaLibUrl').value.trim();
            if (url) { close(); if (this._mediaPickCb) this._mediaPickCb(url); }
        };
        document.getElementById('mediaLibUpload').onchange = async (e) => {
            const files = e.target.files;
            if (!files || !files.length) return;
            const fd = new FormData();
            fd.append('images', files[0]);
            try {
                const res = await this.api.uploadImages(fd);
                const uploaded = Array.isArray(res) ? res[0] : res;
                if (uploaded && uploaded.url) {
                    close();
                    if (this._mediaPickCb) this._mediaPickCb(uploaded.url);
                    this.loadGallery();
                }
            } catch (err) {
                this.showNotification('Upload failed. Please try again.', 'error');
            }
        };

        try {
            const res = await this.api.getImages();
            const images = Array.isArray(res) ? res : (res.images || []);
            const grid = document.getElementById('mediaLibGrid');
            if (!grid) return;
            grid.innerHTML = images.length
                ? images.map(img => `<img src="${img.url}" alt="${img.name || ''}" title="${img.name || ''}" style="width:100%;height:90px;object-fit:cover;border-radius:6px;cursor:pointer;" onclick="adminDashboard._pickMedia(this.src)">`).join('')
                : '<p>No uploads yet. Use the URL field or upload above.</p>';
        } catch (err) {
            const grid = document.getElementById('mediaLibGrid');
            if (grid) grid.innerHTML = '<p>Failed to load images.</p>';
        }
    }

    _pickMedia(url) {
        const cb = this._mediaPickCb;
        const overlay = document.getElementById('mediaLibraryOverlay');
        if (overlay) overlay.remove();
        if (cb) cb(url);
    }

    // Set a featured-image <input> via the media library
    browseFeaturedImage(inputId, previewId) {
        this.openMediaLibrary((url) => {
            const input = document.getElementById(inputId);
            if (input) input.value = url;
            const preview = document.getElementById(previewId);
            if (preview) { preview.src = url; preview.style.display = 'block'; }
        });
    }

    // ===== Reusable media-array widget (image galleries & video lists) =====
    // State keyed by the list container id, so multiple widgets can coexist in one modal.
    _ensureMediaStore() { if (!this._mediaArrays) this._mediaArrays = {}; }

    // Returns the HTML for a managed list of images or videos.
    // kind: 'image' | 'video'
    mediaArrayField(listId, label, kind, items, hint) {
        this._ensureMediaStore();
        this._mediaArrays[listId] = Array.isArray(items) ? items.slice() : [];
        const addFn = kind === 'image' ? `adminDashboard.addMediaArrayImage('${listId}')` : `adminDashboard.addMediaArrayVideo('${listId}')`;
        const addLabel = kind === 'image' ? 'Add Image' : 'Add Video';
        return `
            <div class="form-group">
                <label>${label}</label>
                ${hint ? `<small style="display:block;color:#666;margin-bottom:6px;">${hint}</small>` : ''}
                <div id="${listId}" class="media-array-list" style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:8px;"></div>
                <button type="button" class="btn btn-sm btn-secondary" onclick="${addFn}"><i class="fas fa-plus"></i> ${addLabel}</button>
            </div>`;
    }

    renderMediaArray(listId, kind) {
        this._ensureMediaStore();
        const list = document.getElementById(listId);
        if (!list) return;
        const items = this._mediaArrays[listId] || [];
        if (!items.length) {
            list.innerHTML = '<p style="color:#888;margin:0;">None yet.</p>';
            return;
        }
        list.innerHTML = items.map((item, i) => {
            const preview = kind === 'image'
                ? `<img src="${item}" style="width:100%;height:90px;object-fit:cover;border-radius:6px;">`
                : `<div style="height:90px;display:flex;align-items:center;justify-content:center;background:#222;color:#fff;border-radius:6px;text-align:center;font-size:11px;padding:4px;word-break:break-all;"><i class="fas fa-play-circle" style="margin-right:4px;"></i>${item.slice(0, 40)}</div>`;
            return `
                <div style="width:130px;border:1px solid #e0e0e0;border-radius:8px;padding:6px;background:#fff;">
                    ${preview}
                    <div style="display:flex;justify-content:space-between;margin-top:4px;">
                        <button type="button" class="btn btn-sm btn-secondary" title="Move left" onclick="adminDashboard.moveMediaArrayItem('${listId}','${kind}',${i},-1)"><i class="fas fa-arrow-left"></i></button>
                        <button type="button" class="btn btn-sm btn-secondary" title="Move right" onclick="adminDashboard.moveMediaArrayItem('${listId}','${kind}',${i},1)"><i class="fas fa-arrow-right"></i></button>
                        <button type="button" class="btn btn-sm btn-danger" title="Remove" onclick="adminDashboard.removeMediaArrayItem('${listId}','${kind}',${i})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
        }).join('');
    }

    addMediaArrayImage(listId) {
        this.openMediaLibrary((url) => {
            this._ensureMediaStore();
            (this._mediaArrays[listId] = this._mediaArrays[listId] || []).push(url);
            this.renderMediaArray(listId, 'image');
        });
    }

    addMediaArrayVideo(listId) {
        const url = prompt('Paste a YouTube, Vimeo, or MP4 video URL:');
        if (!url) return;
        this._ensureMediaStore();
        (this._mediaArrays[listId] = this._mediaArrays[listId] || []).push(url.trim());
        this.renderMediaArray(listId, 'video');
    }

    removeMediaArrayItem(listId, kind, idx) {
        this._ensureMediaStore();
        const arr = this._mediaArrays[listId];
        if (!arr) return;
        arr.splice(idx, 1);
        this.renderMediaArray(listId, kind);
    }

    moveMediaArrayItem(listId, kind, idx, delta) {
        this._ensureMediaStore();
        const arr = this._mediaArrays[listId];
        if (!arr) return;
        const j = idx + delta;
        if (j < 0 || j >= arr.length) return;
        [arr[idx], arr[j]] = [arr[j], arr[idx]];
        this.renderMediaArray(listId, kind);
    }

    getMediaArray(listId) {
        this._ensureMediaStore();
        return this._mediaArrays[listId] || [];
    }

    // ===== Hero Slideshow Management =====
    // The hero is a single section with type='hero'; its images[] are the rotating banner.
    async loadHero() {
        const list = document.getElementById('heroImagesList');
        if (!list) return;
        try {
            const response = await this.api.getSections();
            const sections = Array.isArray(response) ? response : (response.sections || []);
            this._heroSection = sections.find(s => s.type === 'hero') || null;
            this._heroImages = (this._heroSection && Array.isArray(this._heroSection.images)) ? this._heroSection.images.slice() : [];
            this.renderHeroImages();
        } catch (error) {
            console.error('Failed to load hero:', error);
            list.innerHTML = '<p>Failed to load hero images.</p>';
        }
    }

    renderHeroImages() {
        const list = document.getElementById('heroImagesList');
        if (!list) return;
        const imgs = this._heroImages || [];
        list.innerHTML = imgs.length ? imgs.map((url, i) => `
            <div class="gallery-item" style="position:relative;">
                <img src="${url}" alt="Hero image ${i + 1}" style="width:100%;height:130px;object-fit:cover;border-radius:8px;">
                <div style="display:flex;justify-content:space-between;margin-top:6px;">
                    <button class="btn btn-sm btn-secondary" title="Move left" onclick="adminDashboard.moveHeroImage(${i},-1)"><i class="fas fa-arrow-left"></i></button>
                    <button class="btn btn-sm btn-secondary" title="Move right" onclick="adminDashboard.moveHeroImage(${i},1)"><i class="fas fa-arrow-right"></i></button>
                    <button class="btn btn-sm btn-danger" title="Remove" onclick="adminDashboard.removeHeroImage(${i})"><i class="fas fa-trash"></i></button>
                </div>
            </div>`).join('') : '<p style="color:#888;">No hero images yet. Click "Add Image".</p>';
    }

    addHeroImage() {
        this.openMediaLibrary((url) => {
            (this._heroImages = this._heroImages || []).push(url);
            this.renderHeroImages();
        });
    }

    removeHeroImage(i) {
        if (!this._heroImages) return;
        this._heroImages.splice(i, 1);
        this.renderHeroImages();
    }

    moveHeroImage(i, delta) {
        if (!this._heroImages) return;
        const j = i + delta;
        if (j < 0 || j >= this._heroImages.length) return;
        [this._heroImages[i], this._heroImages[j]] = [this._heroImages[j], this._heroImages[i]];
        this.renderHeroImages();
    }

    async saveHero() {
        const images = this._heroImages || [];
        const payload = {
            type: 'hero',
            title: this._heroSection?.title || 'Hero',
            images,
            status: 'published',
            sortOrder: this._heroSection?.sortOrder ?? 0
        };
        try {
            if (this._heroSection && this._heroSection.id) {
                await this.api.updateSection(this._heroSection.id, payload);
            } else {
                this._heroSection = await this.api.createSection(payload);
            }
            await this.loadHero();
            this.showNotification('Hero slideshow saved! It is now live on the homepage.', 'success');
            this.addActivity('Updated hero slideshow images');
        } catch (error) {
            console.error('Failed to save hero:', error);
            this.showNotification(error.message || 'Failed to save hero slideshow.', 'error');
        }
    }

    // ===== Sections Management =====
    async loadSections() {
        const tbody = document.getElementById('sectionsTableBody');
        if (!tbody) return;
        try {
            const response = await this.api.getSections();
            this.sections = Array.isArray(response) ? response : (response.sections || []);
            tbody.innerHTML = this.sections.length ? this.sections.map(section => `
                <tr>
                    <td>${section.title || '(untitled)'}</td>
                    <td>${section.type || 'custom'}</td>
                    <td>${section.sortOrder ?? 0}</td>
                    <td><span class="status ${section.status}">${section.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-secondary" onclick="adminDashboard.editSection('${section.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteSection('${section.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('') : '<tr><td colspan="5">No sections yet. Click "Add New Section".</td></tr>';
        } catch (error) {
            console.error('Failed to load sections:', error);
            tbody.innerHTML = '<tr><td colspan="5">Failed to load sections. Please try again.</td></tr>';
        }
    }

    showSectionModal(sectionId = null) {
        const section = sectionId ? (this.sections || []).find(s => String(s.id) === String(sectionId)) : null;
        const isEdit = !!section;
        const types = ['custom', 'hero', 'about', 'services', 'feature', 'cta'];

        const modalContent = `
            <h2>${isEdit ? 'Edit Section' : 'Add New Section'}</h2>
            <form id="sectionForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="sectionTitle">Title</label>
                        <input type="text" id="sectionTitle" value="${section?.title || ''}">
                    </div>
                    <div class="form-group">
                        <label for="sectionType">Type</label>
                        <select id="sectionType">
                            ${types.map(t => `<option value="${t}" ${section?.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="sectionSubtitle">Subtitle</label>
                    <input type="text" id="sectionSubtitle" value="${section?.subtitle || ''}">
                </div>
                <div class="form-group">
                    <label for="sectionContent">Content (HTML, images & video supported)</label>
                    ${this.mediaToolbar('sectionContent')}
                    <textarea id="sectionContent" rows="8">${section?.content || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="sectionImageUrl">Image URL</label>
                    <div style="display:flex;gap:8px;">
                        <input type="text" id="sectionImageUrl" value="${section?.imageUrl || ''}" placeholder="/uploads/image.jpg" style="flex:1;">
                        <button type="button" class="btn btn-secondary" onclick="adminDashboard.browseFeaturedImage('sectionImageUrl','sectionImagePreview')">Browse</button>
                    </div>
                    <img id="sectionImagePreview" src="${section?.imageUrl || ''}" style="${section?.imageUrl ? '' : 'display:none;'}max-height:120px;margin-top:8px;border-radius:6px;">
                </div>
                <div class="form-group">
                    <label for="sectionVideoUrl">Video URL (YouTube/Vimeo/MP4, optional)</label>
                    <input type="text" id="sectionVideoUrl" value="${section?.videoUrl || ''}" placeholder="https://youtube.com/watch?v=...">
                </div>
                ${this.mediaArrayField('sectionImages', 'Image Gallery / Slideshow', 'image', section?.images || [], 'For a hero or gallery block, add multiple images here.')}
                ${this.mediaArrayField('sectionVideos', 'Videos', 'video', section?.videos || [], 'YouTube, Vimeo or MP4 links.')}
                <div class="form-row">
                    <div class="form-group">
                        <label for="sectionButtonText">Button Text</label>
                        <input type="text" id="sectionButtonText" value="${section?.buttonText || ''}">
                    </div>
                    <div class="form-group">
                        <label for="sectionButtonLink">Button Link</label>
                        <input type="text" id="sectionButtonLink" value="${section?.buttonLink || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="sectionStatus">Status</label>
                        <select id="sectionStatus">
                            <option value="published" ${section?.status === 'published' ? 'selected' : ''}>Published</option>
                            <option value="draft" ${section?.status === 'draft' || !section ? 'selected' : ''}>Draft</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="sectionSortOrder">Sort Order</label>
                        <input type="number" id="sectionSortOrder" value="${section?.sortOrder ?? 0}" min="0">
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" id="saveSectionBtn" class="btn btn-primary"><i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Create'} Section</button>
                    <button type="button" class="btn btn-secondary" onclick="adminDashboard.closeModal()">Cancel</button>
                </div>
            </form>`;

        this.showModal(modalContent);
        this.renderMediaArray('sectionImages', 'image');
        this.renderMediaArray('sectionVideos', 'video');
        document.getElementById('saveSectionBtn').addEventListener('click', () => this.saveSection(sectionId));
    }

    async saveSection(sectionId = null) {
        const sectionData = {
            title: document.getElementById('sectionTitle').value,
            type: document.getElementById('sectionType').value,
            subtitle: document.getElementById('sectionSubtitle').value,
            content: document.getElementById('sectionContent').value,
            imageUrl: document.getElementById('sectionImageUrl').value,
            videoUrl: document.getElementById('sectionVideoUrl').value,
            images: this.getMediaArray('sectionImages'),
            videos: this.getMediaArray('sectionVideos'),
            buttonText: document.getElementById('sectionButtonText').value,
            buttonLink: document.getElementById('sectionButtonLink').value,
            status: document.getElementById('sectionStatus').value,
            sortOrder: parseInt(document.getElementById('sectionSortOrder').value) || 0
        };
        try {
            if (sectionId) await this.api.updateSection(sectionId, sectionData);
            else await this.api.createSection(sectionData);
            await this.loadSections();
            this.closeModal();
            this.showNotification(`Section ${sectionId ? 'updated' : 'created'} successfully!`, 'success');
            this.addActivity(`${sectionId ? 'Updated' : 'Created'} section: ${sectionData.title || 'untitled'}`);
        } catch (error) {
            console.error('Failed to save section:', error);
            this.showNotification(error.message || 'Failed to save section. Please try again.', 'error');
        }
    }

    editSection(sectionId) {
        this.showSectionModal(sectionId);
    }

    async deleteSection(sectionId) {
        if (!confirm('Are you sure you want to delete this section?')) return;
        try {
            await this.api.deleteSection(sectionId);
            await this.loadSections();
            this.showNotification('Section deleted successfully!', 'success');
        } catch (error) {
            console.error('Failed to delete section:', error);
            this.showNotification(error.message || 'Failed to delete section. Please try again.', 'error');
        }
    }

    // Utility Methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showModal(content) {
        document.getElementById('modalBody').innerHTML = content;
        // CSS controls visibility via the `.show` class (opacity/visibility),
        // not display — toggling display alone leaves the modal invisible.
        document.getElementById('modal').classList.add('show');
    }

    closeModal() {
        document.getElementById('modal').classList.remove('show');
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;

        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }

    addActivity(message) {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
            <time>Just now</time>
        `;

        activityList.insertBefore(activityItem, activityList.firstChild);

        // Keep only last 10 activities
        const activities = activityList.querySelectorAll('.activity-item');
        if (activities.length > 10) {
            activities[activities.length - 1].remove();
        }
    }

}

// Data persistence is now handled by the API

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});