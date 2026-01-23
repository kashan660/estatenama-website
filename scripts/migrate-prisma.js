const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DATA_DIR = path.join(__dirname, '../admin-data');
const BLOGS_FILE = path.join(DATA_DIR, 'blogs.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

const readJsonFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
    }
    return [];
};

const migrateData = async () => {
    console.log('Starting data migration to Prisma...');

    try {
        // Migrate Posts
        const posts = readJsonFile(POSTS_FILE);
        console.log(`Found ${posts.length} posts to migrate...`);
        
        for (const post of posts) {
            try {
                // Check if post already exists
                const existing = await prisma.post.findUnique({
                    where: { slug: post.slug }
                });

                if (!existing) {
                    await prisma.post.create({
                        data: {
                            title: post.title,
                            slug: post.slug,
                            content: post.content,
                            published: post.published,
                            createdAt: post.createdAt ? new Date(post.createdAt) : undefined,
                            updatedAt: post.updatedAt ? new Date(post.updatedAt) : undefined
                        }
                    });
                    console.log(`Migrated post: ${post.title}`);
                } else {
                    console.log(`Skipping existing post: ${post.title}`);
                }
            } catch (err) {
                console.error(`Failed to migrate post ${post.title}:`, err.message);
            }
        }

        // Migrate Blogs
        const blogs = readJsonFile(BLOGS_FILE);
        console.log(`Found ${blogs.length} blogs to migrate...`);

        for (const blog of blogs) {
            try {
                const existing = await prisma.blog.findUnique({
                    where: { slug: blog.slug }
                });

                if (!existing) {
                    await prisma.blog.create({
                        data: {
                            title: blog.title,
                            slug: blog.slug,
                            excerpt: blog.excerpt,
                            content: blog.content,
                            category: blog.category,
                            status: blog.status,
                            author: blog.author,
                            date: blog.date ? new Date(blog.date) : undefined,
                            featuredImage: blog.featuredImage,
                            metaTitle: blog.metaTitle,
                            metaDescription: blog.metaDescription,
                            createdAt: blog.createdAt ? new Date(blog.createdAt) : undefined,
                            updatedAt: blog.updatedAt ? new Date(blog.updatedAt) : undefined
                        }
                    });
                    console.log(`Migrated blog: ${blog.title}`);
                } else {
                    console.log(`Skipping existing blog: ${blog.title}`);
                }
            } catch (err) {
                console.error(`Failed to migrate blog ${blog.title}:`, err.message);
            }
        }

        // Migrate Projects
        const projects = readJsonFile(PROJECTS_FILE);
        console.log(`Found ${projects.length} projects to migrate...`);

        for (const project of projects) {
            try {
                const existing = await prisma.project.findUnique({
                    where: { slug: project.slug }
                });

                if (!existing) {
                    await prisma.project.create({
                        data: {
                            title: project.title,
                            slug: project.slug,
                            description: project.description,
                            location: project.location,
                            price: project.price,
                            status: project.status,
                            featuredImage: project.featuredImage,
                            images: project.images,
                            amenities: project.amenities,
                            createdAt: project.createdAt ? new Date(project.createdAt) : undefined,
                            updatedAt: project.updatedAt ? new Date(project.updatedAt) : undefined
                        }
                    });
                    console.log(`Migrated project: ${project.title}`);
                } else {
                    console.log(`Skipping existing project: ${project.title}`);
                }
            } catch (err) {
                console.error(`Failed to migrate project ${project.title}:`, err.message);
            }
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
};

migrateData();
