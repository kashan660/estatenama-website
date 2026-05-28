/**
 * Database Setup Script
 * Run this after creating your MySQL database in cPanel
 * Usage: node database-setup.js
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Load config
let config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'estatenama_user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'estatenama_db',
    multipleStatements: true
};

const configPath = path.join(__dirname, 'db-config.json');
if (fs.existsSync(configPath)) {
    try {
        const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        config = { ...config, ...fileConfig, multipleStatements: true };
    } catch (err) {
        console.warn('Warning: Could not parse db-config.json');
    }
}

async function setupDatabase() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(config);

        console.log('Reading schema file...');
        const sql = fs.readFileSync(path.join(__dirname, 'database-setup.sql'), 'utf8');

        console.log('Executing schema...');
        await connection.query(sql);

        console.log('\n✅ Database setup completed successfully!');
        console.log('\nTables created:');
        console.log('  - blogs');
        console.log('  - pages');
        console.log('  - images');
        console.log('  - settings');
        console.log('\nDefault settings inserted.');

    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        console.log('\nMake sure you have:');
        console.log('  1. Created the database in cPanel');
        console.log('  2. Created a database user with all privileges');
        console.log('  3. Updated db-config.json with correct credentials');
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

setupDatabase();
