// Shared editor utilities for Blog/Post/Page full-page editors
// Uses AdminAPI for all backend calls
class AdminEditor {
    constructor(contentType, formId) {
        this.contentType = contentType; // 'blog', 'post', or 'page'
        this.formId = formId;
        this.api = new AdminAPI();
        this.editMode = false;
        this.editId = null;
        this.slugManuallyEdited = false;
        this.featuredImageUrl = null;
        this.previewDebounce = null;

        this.init();
    }

    init() {
        // Check for edit mode
        const urlParams = new URLSearchParams(window.location.search);
        this.editId = urlParams.get('id');
        this.editMode = !!this.editId;

        // Update page title
        const titleEl = document.querySelector('.page-title');
        if (titleEl && this.editMode) {
            titleEl.textContent = titleEl.textContent.replace('Add New', 'Edit');
        }

        this.setupSlugGeneration();
        this.setupFeaturedImage();
        this.setupContentToolbar();
        this.setupLivePreview();
        this.setupValidation();
        this.setupFormSubmit();

        // Load data if editing
        if (this.editMode) {
            this.loadForEdit();
        }
    }

    setupSlugGeneration() {
        const titleInput = document.getElementById('title');
        const slugInput = document.getElementById('slug');

        if (!titleInput || !slugInput) return;

        // Mark as manually edited when user types
        slugInput.addEventListener('input', () => {
            this.slugManuallyEdited = true;
        });

        // Auto-generate only if not manually edited
        titleInput.addEventListener('input', () => {
            if (!this.slugManuallyEdited) {
                slugInput.value = this.slugify(titleInput.value);
                this.validateField(slugInput);
            }
            this.validateField(titleInput);
            this.updatePreview();
        });
    }

    slugify(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }

    setupFeaturedImage() {
        const fileInput = document.getElementById('featuredImage');
        const preview = document.getElementById('featuredImagePreview');
        const removeBtn = document.getElementById('removeFeaturedImage');

        if (!fileInput) return;

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate
            const error = this.validateImageFile(file);
            if (error) {
                this.showFieldError(fileInput, error);
                fileInput.value = '';
                return;
            }

            this.clearFieldError(fileInput);
            this.showFieldStatus(fileInput, 'Uploading...', 'info');

            try {
                const fd = new FormData();
                fd.append('images', file);
                const result = await this.api.uploadImages(fd);
                const uploaded = Array.isArray(result) ? result[0] : result;

                if (!uploaded || !uploaded.url) throw new Error('Upload returned no URL');

                this.featuredImageUrl = uploaded.url;
                if (preview) {
                    preview.src = uploaded.url;
                    preview.style.display = 'block';
                }
                if (removeBtn) removeBtn.style.display = 'inline-block';

                this.clearFieldError(fileInput);
                this.showFieldStatus(fileInput, '✓ Uploaded', 'success');
                setTimeout(() => this.clearFieldError(fileInput), 2000);
            } catch (err) {
                console.error('Featured image upload failed:', err);
                this.showFieldError(fileInput, 'Upload failed: ' + (err.message || ''));
                fileInput.value = '';
            }
        });

        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.featuredImageUrl = null;
                fileInput.value = '';
                if (preview) preview.style.display = 'none';
                removeBtn.style.display = 'none';
            });
        }
    }

    validateImageFile(file) {
        if (!file.type.startsWith('image/')) {
            return 'Only image files are allowed';
        }
        if (file.size > 10 * 1024 * 1024) {
            return 'Image must be under 10MB';
        }
        return null;
    }

    setupContentToolbar() {
        const toolbar = document.getElementById('contentToolbar');
        if (!toolbar) return;

        toolbar.innerHTML = `
            <button type="button" class="toolbar-btn" data-action="insertImage" title="Insert Image">
                <i class="fas fa-image"></i> Image
            </button>
            <button type="button" class="toolbar-btn" data-action="insertVideo" title="Insert Video">
                <i class="fas fa-video"></i> Video
            </button>
            <button type="button" class="toolbar-btn" data-action="insertHeading" title="Insert Heading">
                <i class="fas fa-heading"></i> Heading
            </button>
            <button type="button" class="toolbar-btn" data-action="insertParagraph" title="Insert Paragraph">
                <i class="fas fa-paragraph"></i> Paragraph
            </button>
            <button type="button" class="toolbar-btn" data-action="insertLink" title="Insert Link">
                <i class="fas fa-link"></i> Link
            </button>
        `;

        toolbar.addEventListener('click', (e) => {
            const btn = e.target.closest('.toolbar-btn');
            if (!btn) return;
            const action = btn.dataset.action;
            if (action) this[action]();
        });
    }

    async insertImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const error = this.validateImageFile(file);
            if (error) {
                alert(error);
                return;
            }

            try {
                const fd = new FormData();
                fd.append('images', file);
                const result = await this.api.uploadImages(fd);
                const uploaded = Array.isArray(result) ? result[0] : result;

                if (!uploaded || !uploaded.url) throw new Error('Upload returned no URL');

                const alt = prompt('Image alt text (for SEO):', '') || '';
                this.insertIntoContent(`\n<img src="${uploaded.url}" alt="${alt}" loading="lazy">\n`);
            } catch (err) {
                console.error('Image upload failed:', err);
                alert('Upload failed: ' + (err.message || ''));
            }
        };
        input.click();
    }

    insertVideo() {
        const url = prompt('Paste YouTube, Vimeo, or MP4 video URL:');
        if (!url) return;
        this.insertIntoContent(this.toEmbedHtml(url));
    }

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

    insertHeading() {
        this.insertIntoContent('\n<h2>Heading</h2>\n');
    }

    insertParagraph() {
        this.insertIntoContent('\n<p>Your text here...</p>\n');
    }

    insertLink() {
        const url = prompt('Link URL:');
        if (!url) return;
        const text = prompt('Link text:', url) || url;
        this.insertIntoContent(`<a href="${url}" target="_blank" rel="noopener">${text}</a>`);
    }

    insertIntoContent(snippet) {
        const ta = document.getElementById('content');
        if (!ta) return;
        const start = ta.selectionStart ?? ta.value.length;
        const end = ta.selectionEnd ?? ta.value.length;
        ta.value = ta.value.slice(0, start) + snippet + ta.value.slice(end);
        ta.focus();
        const pos = start + snippet.length;
        ta.setSelectionRange(pos, pos);
        this.updatePreview();
    }

    setupLivePreview() {
        const content = document.getElementById('content');
        const preview = document.getElementById('livePreview');
        if (!content || !preview) return;

        content.addEventListener('input', () => {
            clearTimeout(this.previewDebounce);
            this.previewDebounce = setTimeout(() => this.updatePreview(), 300);
        });

        this.updatePreview();
    }

    updatePreview() {
        const content = document.getElementById('content');
        const preview = document.getElementById('livePreview');
        if (!content || !preview) return;

        preview.innerHTML = content.value || '<p style="color:#999;font-style:italic;">Your content preview will appear here...</p>';
    }

    setupValidation() {
        const fields = ['title', 'content', 'slug', 'excerpt', 'metaTitle', 'metaDescription'];
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('blur', () => this.validateField(el));
                el.addEventListener('input', () => {
                    if (el.classList.contains('field-error') || el.classList.contains('field-warning')) {
                        this.validateField(el);
                    }
                });
            }
        });
    }

    validateField(field) {
        const id = field.id;
        const value = field.value.trim();

        this.clearFieldError(field);

        // Required fields
        if ((id === 'title' || id === 'content') && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }

        // Slug validation
        if (id === 'slug' && value && !/^[a-z0-9\-]+$/.test(value)) {
            this.showFieldWarning(field, 'Slug should only contain lowercase letters, numbers, and hyphens');
        }

        // Meta title length
        if (id === 'metaTitle' && value.length > 60) {
            this.showFieldWarning(field, `Meta title is ${value.length} chars (recommended: 50-60)`);
        }

        // Meta description length
        if (id === 'metaDescription' && value.length > 160) {
            this.showFieldWarning(field, `Meta description is ${value.length} chars (recommended: 150-160)`);
        }

        // Content vs title length
        if (id === 'content') {
            const titleLen = document.getElementById('title')?.value.trim().length || 0;
            if (value.length > 0 && value.length < titleLen) {
                this.showFieldWarning(field, 'Content is shorter than title');
            }
        }

        // Excerpt empty
        if (id === 'excerpt' && !value && this.contentType === 'blog') {
            this.showFieldWarning(field, 'Adding an excerpt helps with SEO and previews');
        }

        return true;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        field.classList.add('field-error');
        const note = document.createElement('div');
        note.className = 'field-note field-note-error';
        note.textContent = '⚠ ' + message;
        field.parentElement.appendChild(note);
    }

    showFieldWarning(field, message) {
        this.clearFieldError(field);
        field.classList.add('field-warning');
        const note = document.createElement('div');
        note.className = 'field-note field-note-warning';
        note.textContent = '⚠ ' + message;
        field.parentElement.appendChild(note);
    }

    showFieldStatus(field, message, type) {
        this.clearFieldError(field);
        const note = document.createElement('div');
        note.className = `field-note field-note-${type}`;
        note.textContent = message;
        field.parentElement.appendChild(note);
    }

    clearFieldError(field) {
        field.classList.remove('field-error', 'field-warning');
        const existing = field.parentElement.querySelector('.field-note');
        if (existing) existing.remove();
    }

    async loadForEdit() {
        try {
            let item;
            if (this.contentType === 'blog') {
                item = await this.api.getBlog(this.editId);
            } else if (this.contentType === 'post') {
                const posts = await this.api.getPosts();
                item = posts.find(p => String(p.id) === String(this.editId));
            } else if (this.contentType === 'page') {
                item = await this.api.getPage(this.editId);
            }

            if (!item) throw new Error('Item not found');

            // Populate fields
            this.setFieldValue('title', item.title);
            this.setFieldValue('slug', item.slug);
            this.setFieldValue('content', item.content);
            this.setFieldValue('excerpt', item.excerpt);
            this.setFieldValue('author', item.author);
            this.setFieldValue('category', item.category);
            this.setFieldValue('status', item.status);
            this.setFieldValue('metaTitle', item.metaTitle || item.meta_title);
            this.setFieldValue('metaDescription', item.metaDescription || item.meta_description);

            // Page-specific
            if (this.contentType === 'page') {
                this.setFieldValue('sortOrder', item.sortOrder || item.sort_order || 0);
                const showInNav = document.getElementById('showInNav');
                if (showInNav) showInNav.checked = !!(item.showInNav || item.show_in_nav);
            }

            // Featured image
            if (item.featuredImage || item.featured_image) {
                this.featuredImageUrl = item.featuredImage || item.featured_image;
                const preview = document.getElementById('featuredImagePreview');
                const removeBtn = document.getElementById('removeFeaturedImage');
                if (preview) {
                    preview.src = this.featuredImageUrl;
                    preview.style.display = 'block';
                }
                if (removeBtn) removeBtn.style.display = 'inline-block';
            }

            this.slugManuallyEdited = true;
            this.updatePreview();
        } catch (err) {
            console.error('Failed to load for edit:', err);
            alert('Failed to load: ' + (err.message || ''));
            window.location.href = 'admin-dashboard.html';
        }
    }

    setFieldValue(id, value) {
        const el = document.getElementById(id);
        if (el && value !== undefined && value !== null) {
            el.value = value;
        }
    }

    setupFormSubmit() {
        const form = document.getElementById(this.formId);
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });
    }

    async handleSubmit() {
        // Validate all fields
        const requiredFields = ['title', 'content'];
        let hasError = false;
        requiredFields.forEach(id => {
            const el = document.getElementById(id);
            if (el && !this.validateField(el)) hasError = true;
        });

        if (hasError) {
            alert('Please fix the errors before submitting.');
            return;
        }

        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {
            const payload = this.buildPayload();
            let result;

            if (this.editMode) {
                if (this.contentType === 'blog') result = await this.api.updateBlog(this.editId, payload);
                else if (this.contentType === 'post') result = await this.api.updatePost(this.editId, payload);
                else if (this.contentType === 'page') result = await this.api.updatePage(this.editId, payload);
            } else {
                if (this.contentType === 'blog') result = await this.api.createBlog(payload);
                else if (this.contentType === 'post') result = await this.api.createPost(payload);
                else if (this.contentType === 'page') result = await this.api.createPage(payload);
            }

            alert(`${this.contentType.charAt(0).toUpperCase() + this.contentType.slice(1)} ${this.editMode ? 'updated' : 'created'} successfully!`);
            window.location.href = 'admin-dashboard.html';
        } catch (err) {
            console.error('Submit failed:', err);
            alert('Failed to save: ' + (err.message || ''));
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    buildPayload() {
        const payload = {
            title: document.getElementById('title').value.trim(),
            slug: document.getElementById('slug').value.trim(),
            content: document.getElementById('content').value.trim(),
            status: document.getElementById('status').value
        };

        // Optional common fields
        const excerpt = document.getElementById('excerpt');
        if (excerpt) payload.excerpt = excerpt.value.trim();

        const author = document.getElementById('author');
        if (author) payload.author = author.value.trim();

        const category = document.getElementById('category');
        if (category) payload.category = category.value.trim();

        if (this.featuredImageUrl) payload.featuredImage = this.featuredImageUrl;

        const metaTitle = document.getElementById('metaTitle');
        if (metaTitle && metaTitle.value.trim()) payload.metaTitle = metaTitle.value.trim();

        const metaDesc = document.getElementById('metaDescription');
        if (metaDesc && metaDesc.value.trim()) payload.metaDescription = metaDesc.value.trim();

        // Page-specific
        if (this.contentType === 'page') {
            const sortOrder = document.getElementById('sortOrder');
            if (sortOrder) payload.sortOrder = parseInt(sortOrder.value) || 0;

            const showInNav = document.getElementById('showInNav');
            if (showInNav) payload.showInNav = showInNav.checked;
        }

        // Post-specific: published derived from status
        if (this.contentType === 'post') {
            payload.published = payload.status === 'published';
        }

        return payload;
    }
}

window.AdminEditor = AdminEditor;
