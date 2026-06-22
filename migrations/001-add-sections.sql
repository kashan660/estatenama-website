-- Migration: add the `sections` table (editable homepage blocks)
-- Safe to run against the existing Hostinger database. Idempotent.
-- Run via phpMyAdmin, or: node database-setup.js (re-runs the full schema, also idempotent)

CREATE TABLE IF NOT EXISTS sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) DEFAULT 'custom',
    title VARCHAR(255),
    subtitle VARCHAR(500),
    content LONGTEXT,
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    button_text VARCHAR(100),
    button_link VARCHAR(500),
    sort_order INT DEFAULT 0,
    status ENUM('draft', 'published') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
