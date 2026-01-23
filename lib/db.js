const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
const prisma = new PrismaClient();

// Helper to convert Prisma BigInt/Date to simple JSON
const serialize = (data) => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value
    ));
};

// Helper to generate slug
const slugify = (text) => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
};

const db = {
    // Stats
    async getStats() {
        const [postsCount, blogsCount, projectsCount] = await Promise.all([
            prisma.post.count(),
            prisma.blog.count(),
            prisma.project.count()
        ]);
        
        return {
            posts: postsCount,
            blogs: blogsCount,
            projects: projectsCount,
            visitors: 0, // Placeholder
            inquiries: 0 // Placeholder
        };
    },

    // --- Posts ---
    async getPosts() {
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return serialize(posts);
    },

    async createPost(post) {
        let { title, slug, content, published, status } = post;
        
        // Generate slug if missing
        if (!slug && title) {
            slug = slugify(title) + '-' + Date.now(); // Append timestamp to ensure uniqueness
        }
        
        // Handle status -> published mapping
        if (published === undefined && status) {
            published = status === 'published';
        }

        const newPost = await prisma.post.create({
            data: {
                title,
                slug,
                content,
                published: published || false
            }
        });
        return serialize(newPost);
    },

    async updatePost(id, post) {
        let { title, slug, content, published, status } = post;
        
        // Handle status -> published mapping
        if (published === undefined && status) {
            published = status === 'published';
        }

        const dataToUpdate = {};
        if (title !== undefined) dataToUpdate.title = title;
        if (slug !== undefined) dataToUpdate.slug = slug;
        if (content !== undefined) dataToUpdate.content = content;
        if (published !== undefined) dataToUpdate.published = published;

        const updatedPost = await prisma.post.update({
            where: { id: parseInt(id) },
            data: dataToUpdate
        });
        return serialize(updatedPost);
    },

    async deletePost(id) {
        await prisma.post.delete({
            where: { id: parseInt(id) }
        });
        return { success: true };
    },

    // --- Blogs ---
    async getBlogs() {
        const blogs = await prisma.blog.findMany({
            orderBy: { date: 'desc' }
        });
        return serialize(blogs);
    },

    async createBlog(blog) {
        let { title, slug, excerpt, content, category, status, author, date, featuredImage, metaTitle, metaDescription } = blog;
        
        // Generate slug if missing
        if (!slug && title) {
            slug = slugify(title) + '-' + Date.now();
        }

        const newBlog = await prisma.blog.create({
            data: {
                title,
                slug,
                excerpt,
                content,
                category,
                status: status || 'draft',
                author,
                date: date ? new Date(date) : new Date(),
                featuredImage,
                metaTitle,
                metaDescription
            }
        });
        return serialize(newBlog);
    },

    async updateBlog(id, blog) {
        const { title, slug, excerpt, content, category, status, author, date, featuredImage, metaTitle, metaDescription } = blog;
        
        const dataToUpdate = {};
        if (title !== undefined) dataToUpdate.title = title;
        if (slug !== undefined) dataToUpdate.slug = slug;
        if (excerpt !== undefined) dataToUpdate.excerpt = excerpt;
        if (content !== undefined) dataToUpdate.content = content;
        if (category !== undefined) dataToUpdate.category = category;
        if (status !== undefined) dataToUpdate.status = status;
        if (author !== undefined) dataToUpdate.author = author;
        if (date !== undefined) dataToUpdate.date = new Date(date);
        if (featuredImage !== undefined) dataToUpdate.featuredImage = featuredImage;
        if (metaTitle !== undefined) dataToUpdate.metaTitle = metaTitle;
        if (metaDescription !== undefined) dataToUpdate.metaDescription = metaDescription;

        const updatedBlog = await prisma.blog.update({
            where: { id: parseInt(id) },
            data: dataToUpdate
        });
        return serialize(updatedBlog);
    },

    async deleteBlog(id) {
        await prisma.blog.delete({
            where: { id: parseInt(id) }
        });
        return { success: true };
    },

    // --- Projects ---
    async getProjects() {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return serialize(projects);
    },

    async createProject(project) {
        // Map fields from frontend to schema
        // frontend sends: name, features, etc.
        // schema expects: title, amenities, etc.
        let { 
            title, name, 
            slug, 
            description, 
            location, 
            price, 
            status, 
            featuredImage, image,
            images, 
            amenities, features 
        } = project;

        const projectTitle = title || name;
        const projectAmenities = amenities || features || [];
        const projectImage = featuredImage || image;

        // Generate slug if missing
        if (!slug && projectTitle) {
            slug = slugify(projectTitle) + '-' + Date.now();
        }

        const newProject = await prisma.project.create({
            data: {
                title: projectTitle,
                slug,
                description,
                location,
                price,
                status: status || 'active',
                featuredImage: projectImage,
                images: images || [],
                amenities: projectAmenities
            }
        });
        return serialize(newProject);
    },

    async updateProject(id, project) {
        let { 
            title, name,
            slug, 
            description, 
            location, 
            price, 
            status, 
            featuredImage, image,
            images, 
            amenities, features 
        } = project;

        const dataToUpdate = {};
        if (title !== undefined || name !== undefined) dataToUpdate.title = title || name;
        if (slug !== undefined) dataToUpdate.slug = slug;
        if (description !== undefined) dataToUpdate.description = description;
        if (location !== undefined) dataToUpdate.location = location;
        if (price !== undefined) dataToUpdate.price = price;
        if (status !== undefined) dataToUpdate.status = status;
        if (featuredImage !== undefined || image !== undefined) dataToUpdate.featuredImage = featuredImage || image;
        if (images !== undefined) dataToUpdate.images = images;
        if (amenities !== undefined || features !== undefined) dataToUpdate.amenities = amenities || features;

        const updatedProject = await prisma.project.update({
            where: { id: parseInt(id) },
            data: dataToUpdate
        });
        return serialize(updatedProject);
    }
};

module.exports = db;
