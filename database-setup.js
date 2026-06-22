/**
 * Database Setup Script (PostgreSQL)
 * Creates/updates all tables for EstateNama. Idempotent — safe to re-run.
 * Usage: node database-setup.js
 * Requires POSTGRES_URL (env or db-config.json { "url": ... }).
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

function getConnectionString() {
    if (process.env.POSTGRES_URL) return process.env.POSTGRES_URL;
    if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
    try {
        const configPath = path.join(__dirname, 'db-config.json');
        if (fs.existsSync(configPath)) {
            const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return fileConfig.url || fileConfig.connectionString || null;
        }
    } catch (err) {
        console.warn('Warning: Could not parse db-config.json');
    }
    return null;
}

async function setupDatabase() {
    const connectionString = getConnectionString();
    if (!connectionString) {
        console.error('\n❌ No connection string. Set POSTGRES_URL or add a "url" to db-config.json.');
        process.exit(1);
    }

    const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
    try {
        console.log('Connecting to Postgres...');
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', 'postgres-schema.sql'), 'utf8');
        console.log('Executing schema...');
        await pool.query(sql);

        console.log('\n✅ Database setup completed successfully!');
        console.log('Tables ready: posts, blogs, pages, projects, images, sections, settings');
    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

setupDatabase();
