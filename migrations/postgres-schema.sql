-- EstateNama PostgreSQL schema (Vercel + Prisma/Neon Postgres)
-- Idempotent and safe against pre-existing (partial) tables from earlier setups.
-- Order: CREATE TABLE IF NOT EXISTS  ->  ADD COLUMN IF NOT EXISTS  ->  CREATE INDEX.
-- Run via: node database-setup.js

-- ============================ CREATE TABLES ============================
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS pages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE
);

-- ====================== ADD / TOP-UP COLUMNS ==========================
-- posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS content        TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS excerpt        TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_image VARCHAR(500);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS category       VARCHAR(100) DEFAULT 'Real Estate';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author         VARCHAR(100) DEFAULT 'Estate Nama';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status         VARCHAR(20) DEFAULT 'draft';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS published      BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS published_at   TIMESTAMPTZ;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_title       VARCHAR(255);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS created_at     TIMESTAMPTZ DEFAULT now();
ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ DEFAULT now();

-- blogs
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS excerpt          TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS content          TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS featured_image   VARCHAR(500);
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS category         VARCHAR(100) DEFAULT 'Real Estate';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS author           VARCHAR(100) DEFAULT 'Estate Nama';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_title       VARCHAR(255);
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS status           VARCHAR(20) DEFAULT 'draft';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS published_at     TIMESTAMPTZ;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS created_at       TIMESTAMPTZ DEFAULT now();
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ DEFAULT now();

-- pages
ALTER TABLE pages ADD COLUMN IF NOT EXISTS content          TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS featured_image   VARCHAR(500);
ALTER TABLE pages ADD COLUMN IF NOT EXISTS meta_title       VARCHAR(255);
ALTER TABLE pages ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS status           VARCHAR(20) DEFAULT 'draft';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS sort_order       INT DEFAULT 0;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS show_in_nav      BOOLEAN DEFAULT false;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS created_at       TIMESTAMPTZ DEFAULT now();
ALTER TABLE pages ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ DEFAULT now();

-- projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS subtitle       VARCHAR(500);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description    TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS location       VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS price          VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS type           VARCHAR(50) DEFAULT 'residential';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category       VARCHAR(150);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status         VARCHAR(50) DEFAULT 'active';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS badge          VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured_image VARCHAR(500);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS images         TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS videos         TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS amenities      TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS features       TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS plots          JSONB DEFAULT '[]';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS payment_plan   TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sort_order     INT DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS link           VARCHAR(500);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_at     TIMESTAMPTZ DEFAULT now();
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ DEFAULT now();

-- images
ALTER TABLE images ADD COLUMN IF NOT EXISTS name        VARCHAR(255);
ALTER TABLE images ADD COLUMN IF NOT EXISTS filename    VARCHAR(255);
ALTER TABLE images ADD COLUMN IF NOT EXISTS url         VARCHAR(500);
ALTER TABLE images ADD COLUMN IF NOT EXISTS size        INT;
ALTER TABLE images ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ DEFAULT now();

-- sections
ALTER TABLE sections ADD COLUMN IF NOT EXISTS type        VARCHAR(50) DEFAULT 'custom';
ALTER TABLE sections ADD COLUMN IF NOT EXISTS title       VARCHAR(255);
ALTER TABLE sections ADD COLUMN IF NOT EXISTS subtitle    VARCHAR(500);
ALTER TABLE sections ADD COLUMN IF NOT EXISTS content     TEXT;
ALTER TABLE sections ADD COLUMN IF NOT EXISTS image_url   VARCHAR(500);
ALTER TABLE sections ADD COLUMN IF NOT EXISTS video_url   VARCHAR(500);
ALTER TABLE sections ADD COLUMN IF NOT EXISTS images      TEXT[] DEFAULT '{}';
ALTER TABLE sections ADD COLUMN IF NOT EXISTS videos      TEXT[] DEFAULT '{}';
ALTER TABLE sections ADD COLUMN IF NOT EXISTS button_text VARCHAR(100);
ALTER TABLE sections ADD COLUMN IF NOT EXISTS button_link VARCHAR(500);
ALTER TABLE sections ADD COLUMN IF NOT EXISTS sort_order  INT DEFAULT 0;
ALTER TABLE sections ADD COLUMN IF NOT EXISTS status      VARCHAR(20) DEFAULT 'draft';
ALTER TABLE sections ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ DEFAULT now();
ALTER TABLE sections ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ DEFAULT now();

-- settings
ALTER TABLE settings ADD COLUMN IF NOT EXISTS setting_value TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ DEFAULT now();

-- ============ NEUTRALIZE LEGACY PRISMA camelCase COLUMNS ==============
-- Earlier Prisma setup created NOT-NULL camelCase timestamp columns with no DB
-- default (Prisma set them in the app layer). Our raw-SQL inserts skip them, so
-- give them a default and drop NOT NULL to avoid insert failures. Idempotent.
DO $$
DECLARE
    t text;
    c text;
BEGIN
    FOREACH t IN ARRAY ARRAY['posts','blogs','projects','pages','sections'] LOOP
        FOREACH c IN ARRAY ARRAY['createdAt','updatedAt','date','featuredImage','metaTitle','metaDescription'] LOOP
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = c) THEN
                IF c IN ('createdAt','updatedAt','date') THEN
                    EXECUTE format('ALTER TABLE %I ALTER COLUMN %I SET DEFAULT now()', t, c);
                END IF;
                EXECUTE format('ALTER TABLE %I ALTER COLUMN %I DROP NOT NULL', t, c);
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- ============================== INDEXES ===============================
CREATE INDEX IF NOT EXISTS idx_posts_status      ON posts (status);
CREATE INDEX IF NOT EXISTS idx_posts_created     ON posts (created_at);
CREATE INDEX IF NOT EXISTS idx_blogs_status      ON blogs (status);
CREATE INDEX IF NOT EXISTS idx_blogs_created     ON blogs (created_at);
CREATE INDEX IF NOT EXISTS idx_pages_status      ON pages (status);
CREATE INDEX IF NOT EXISTS idx_pages_sort        ON pages (sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_status   ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects (category);
CREATE INDEX IF NOT EXISTS idx_sections_status   ON sections (status);
CREATE INDEX IF NOT EXISTS idx_sections_sort     ON sections (sort_order);

-- ========================== DEFAULT SETTINGS ==========================
INSERT INTO settings (setting_key, setting_value) VALUES
    ('site_title', 'EstateNama - Real Estate Solutions'),
    ('site_description', 'Leading real estate company specializing in plots, residential, and commercial properties with trusted installment plans.'),
    ('contact_email', 'info@estatenama.com'),
    ('contact_phone', '03195547788'),
    ('company_address', 'Phase 7, Anarkali Restaurant, Bahria Town')
ON CONFLICT (setting_key) DO NOTHING;
