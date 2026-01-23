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
        const { title, slug, content, published } = post;
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
        const { title, slug, content, published } = post;
        const updatedPost = await prisma.post.update({
            where: { id: parseInt(id) },
            data: {
                title,
                slug,
                content,
                published
            }
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
        const { title, slug, excerpt, content, category, status, author, date, featuredImage, metaTitle, metaDescription } = blog;
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
        const updatedBlog = await prisma.blog.update({
            where: { id: parseInt(id) },
            data: {
                title,
                slug,
                excerpt,
                content,
                category,
                status,
                author,
                date: date ? new Date(date) : undefined,
                featuredImage,
                metaTitle,
                metaDescription
            }
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
        const { title, slug, description, location, price, status, featuredImage, images, amenities } = project;
        const newProject = await prisma.project.create({
            data: {
                title,
                slug,
                description,
                location,
                price,
                status: status || 'active',
                featuredImage,
                images: images || [],
                amenities: amenities || []
            }
        });
        return serialize(newProject);
    },

    async updateProject(id, project) {
        // Implementation for updateProject
        // Not currently implemented in the JSON version, but good to have
        return { error: 'Not implemented' };
    }
};

module.exports = db;
