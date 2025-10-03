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
        
        this.setupEventListeners();
        this.loadUserInfo();
        this.updateStats();
        this.loadContent();
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
        document.getElementById('addPostBtn')?.addEventListener('click', () => this.showPostModal());
        document.getElementById('addBlogBtn')?.addEventListener('click', () => this.showBlogModal());
        document.getElementById('addProjectBtn')?.addEventListener('click', () => this.showProjectModal());
        document.getElementById('uploadImageBtn')?.addEventListener('click', () => this.showImageUploadModal());

        // Settings form
        document.getElementById('settingsForm')?.addEventListener('submit', (e) => this.saveSettings(e));

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
            projects: 'Manage Projects',
            gallery: 'Manage Gallery',
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

    updateStats() {
        document.getElementById('totalPosts').textContent = this.posts.length;
        document.getElementById('totalBlogs').textContent = this.blogs.length;
        document.getElementById('totalImages').textContent = this.images.length;
    }

    async loadContent() {
        try {
            // Load data from API
            await this.loadPosts();
            await this.loadBlogs();
            await this.loadGallery();
            await this.loadProjects(); // Now using API for projects
            this.updateStats();
            
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
        const post = postId ? this.posts.find(p => p.id === postId) : null;
        const isEdit = !!post;

        const modalContent = `
            <h2>${isEdit ? 'Edit Post' : 'Add New Post'}</h2>
            <form id="postForm">
                <div class="form-group">
                    <label for="postTitle">Title</label>
                    <input type="text" id="postTitle" value="${post?.title || ''}" required>
                </div>
                <div class="form-group">
                    <label for="postContent">Content</label>
                    <textarea id="postContent" rows="6" required>${post?.content || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="postStatus">Status</label>
                    <select id="postStatus">
                        <option value="published" ${post?.status === 'published' ? 'selected' : ''}>Published</option>
                        <option value="draft" ${post?.status === 'draft' ? 'selected' : ''}>Draft</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
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

        document.getElementById('postForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePost(postId);
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

        try {
            if (postId) {
                // Update existing post
                await this.api.updatePost(postId, postData);
            } else {
                // Create new post
                await this.api.createPost(postData);
            }

            await this.loadPosts();
            this.updateStats();
            this.closeModal();
            this.showNotification(`Post ${postId ? 'updated' : 'created'} successfully!`, 'success');
            this.addActivity(`${postId ? 'Updated' : 'Created'} post: ${title}`);
        } catch (error) {
            console.error('Failed to save post:', error);
            this.showNotification(`Failed to ${postId ? 'update' : 'create'} post. Please try again.`, 'error');
        }
    }

    editPost(postId) {
        this.showPostModal(postId);
    }

    async deletePost(postId) {
        if (confirm('Are you sure you want to delete this post?')) {
            try {
                const post = this.posts.find(p => p.id === postId);
                await this.api.deletePost(postId);
                await this.loadPosts();
                this.updateStats();
                this.showNotification('Post deleted successfully!', 'success');
                this.addActivity(`Deleted post: ${post?.title || 'Unknown'}`);
            } catch (error) {
                console.error('Failed to delete post:', error);
                this.showNotification('Failed to delete post. Please try again.', 'error');
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
        const blog = blogId ? this.blogs.find(b => b.id === blogId) : null;
        const isEdit = !!blog;

        const modalContent = `
            <h2>${isEdit ? 'Edit Blog' : 'Add New Blog'}</h2>
            <form id="blogForm">
                <div class="form-group">
                    <label for="blogTitle">Title</label>
                    <input type="text" id="blogTitle" value="${blog?.title || ''}" required>
                </div>
                <div class="form-group">
                    <label for="blogExcerpt">Excerpt</label>
                    <textarea id="blogExcerpt" rows="2">${blog?.excerpt || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="blogContent">Content</label>
                    <textarea id="blogContent" rows="8" required>${blog?.content || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="blogStatus">Status</label>
                    <select id="blogStatus">
                        <option value="published" ${blog?.status === 'published' ? 'selected' : ''}>Published</option>
                        <option value="draft" ${blog?.status === 'draft' ? 'selected' : ''}>Draft</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
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

        document.getElementById('blogForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBlog(blogId);
        });
    }

    async saveBlog(blogId = null) {
        const title = document.getElementById('blogTitle').value;
        const excerpt = document.getElementById('blogExcerpt').value;
        const content = document.getElementById('blogContent').value;
        const status = document.getElementById('blogStatus').value;

        const blogData = {
            title,
            excerpt,
            content,
            status
        };

        try {
            if (blogId) {
                // Update existing blog
                await this.api.updateBlog(blogId, blogData);
            } else {
                // Create new blog
                await this.api.createBlog(blogData);
            }

            await this.loadBlogs();
            this.updateStats();
            this.closeModal();
            this.showNotification(`Blog ${blogId ? 'updated' : 'created'} successfully!`, 'success');
            this.addActivity(`${blogId ? 'Updated' : 'Created'} blog: ${title}`);
        } catch (error) {
            console.error('Failed to save blog:', error);
            this.showNotification(`Failed to ${blogId ? 'update' : 'create'} blog. Please try again.`, 'error');
        }
    }

    editBlog(blogId) {
        this.showBlogModal(blogId);
    }

    async deleteBlog(blogId) {
        if (confirm('Are you sure you want to delete this blog?')) {
            try {
                const blog = this.blogs.find(b => b.id === blogId);
                await this.api.deleteBlog(blogId);
                await this.loadBlogs();
                this.updateStats();
                this.showNotification('Blog deleted successfully!', 'success');
                this.addActivity(`Deleted blog: ${blog?.title || 'Unknown'}`);
            } catch (error) {
                console.error('Failed to delete blog:', error);
                this.showNotification('Failed to delete blog. Please try again.', 'error');
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
                        <img src="${project.image}" alt="${project.title}">
                    </div>
                    <div class="project-info">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
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
        const project = projectId ? this.projects.find(p => p.id === projectId) : null;
        const isEdit = !!project;
        
        const modalContent = `
            <h2>${isEdit ? 'Edit Project' : 'Add New Project'}</h2>
            <form id="projectForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="projectTitle">Project Title</label>
                        <input type="text" id="projectTitle" name="title" value="${project?.title || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="projectLocation">Location</label>
                        <input type="text" id="projectLocation" name="location" value="${project?.location || ''}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="projectPrice">Price Range</label>
                        <input type="text" id="projectPrice" name="price" value="${project?.price || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="projectType">Property Type</label>
                        <select id="projectType" name="type" required>
                            <option value="">Select Type</option>
                            <option value="residential" ${project?.type === 'residential' ? 'selected' : ''}>Residential</option>
                            <option value="commercial" ${project?.type === 'commercial' ? 'selected' : ''}>Commercial</option>
                            <option value="plots" ${project?.type === 'plots' ? 'selected' : ''}>Plots</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="projectDescription">Description</label>
                    <textarea id="projectDescription" name="description" rows="4" required>${project?.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="projectImage">Image URL</label>
                    <input type="url" id="projectImage" name="image" value="${project?.image || ''}" required>
                </div>
                <div class="form-group">
                    <label for="projectFeatures">Key Features (comma separated)</label>
                    <input type="text" id="projectFeatures" name="features" value="${project?.features?.join(', ') || ''}" placeholder="e.g., Swimming Pool, Gym, Security">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
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
        document.getElementById('projectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProject(projectId);
        });
    }

    async saveProject(projectId = null) {
        const form = document.getElementById('projectForm');
        const formData = new FormData(form);
        
        const projectData = {
            title: formData.get('title'),
            location: formData.get('location'),
            price: formData.get('price'),
            type: formData.get('type'),
            description: formData.get('description'),
            image: formData.get('image'),
            features: formData.get('features') ? formData.get('features').split(',').map(f => f.trim()) : []
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
            this.showNotification(`Failed to ${projectId ? 'update' : 'create'} project. Please try again.`, 'error');
        }
    }

    editProject(projectId) {
        this.showProjectModal(projectId);
    }

    async deleteProject(projectId) {
        if (confirm('Are you sure you want to delete this project?')) {
            try {
                const project = this.projects.find(p => p.id === projectId);
                await this.api.deleteProject(projectId);
                await this.loadProjects();
                this.updateStats();
                this.showNotification('Project deleted successfully!', 'success');
                this.addActivity(`Deleted project: ${project?.title || 'Unknown'}`);
            } catch (error) {
                console.error('Failed to delete project:', error);
                this.showNotification('Failed to delete project. Please try again.', 'error');
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
        
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('image', file);
                
                await this.api.uploadImage(formData);
            }

            await this.loadGallery();
            this.updateStats();
            this.closeModal();
            this.showNotification(`${files.length} image(s) uploaded successfully!`, 'success');
            this.addActivity(`Uploaded ${files.length} image(s)`);
        } catch (error) {
            console.error('Failed to upload images:', error);
            this.showNotification('Failed to upload images. Please try again.', 'error');
        }
    }

    async deleteImage(imageId) {
        if (confirm('Are you sure you want to delete this image?')) {
            try {
                const image = this.images.find(img => img.id === imageId);
                await this.api.deleteImage(imageId);
                await this.loadGallery();
                this.updateStats();
                this.showNotification('Image deleted successfully!', 'success');
                this.addActivity(`Deleted image: ${image?.name || image?.filename || 'Unknown'}`);
            } catch (error) {
                console.error('Failed to delete image:', error);
                this.showNotification('Failed to delete image. Please try again.', 'error');
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
            this.showNotification('Failed to create post. Please try again.', 'error');
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
            this.showNotification('Failed to create blog. Please try again.', 'error');
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
            this.showNotification('Failed to create project. Please try again.', 'error');
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
            this.showNotification('Failed to upload images. Please try again.', 'error');
        }
    }

    // Settings Management
    saveSettings(e) {
        e.preventDefault();
        
        const settings = {
            siteTitle: document.getElementById('siteTitle').value,
            siteDescription: document.getElementById('siteDescription').value,
            contactEmail: document.getElementById('contactEmail').value,
            contactPhone: document.getElementById('contactPhone').value,
            companyAddress: document.getElementById('companyAddress').value
        };

        localStorage.setItem('adminSettings', JSON.stringify(settings));
        this.showNotification('Settings saved successfully!', 'success');
        this.addActivity('Updated website settings');
    }

    // Utility Methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showModal(content) {
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
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
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});