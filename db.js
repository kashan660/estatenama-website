/**
 * Database Configuration
 * Uses mysql2/promise for async/await support
 * Configure via environment variables or db-config.json
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load config from db-config.json if it exists, otherwise use env vars
let config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'estatenama_user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'estatenama_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Try to load from db-config.json (for cPanel deployment)
const configPath = path.join(__dirname, 'db-config.json');
if (fs.existsSync(configPath)) {
    try {
        const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        config = { ...config, ...fileConfig };
    } catch (err) {
        console.warn('Warning: Could not parse db-config.json, using defaults/env vars');
    }
}

// Create connection pool
const pool = mysql.createPool(config);

// Test connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

module.exports = {
    pool,
    testConnection,
    config
};
