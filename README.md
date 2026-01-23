# EstateNama - Real Estate Website with Admin Panel

A modern, responsive real estate website for EstateNama with a comprehensive admin panel for content management.

## Features

### Main Website
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Project Showcase**: Display of real estate projects with detailed information
- **Contact Forms**: Interactive contact forms with validation
- **Company Information**: About section, services, and contact details
- **Social Media Integration**: Links to social platforms

### Admin Panel
- **Authentication System**: Secure login with session management
- **Dashboard**: Overview statistics and recent activity
- **Posts Management**: Create, read, update, delete posts
- **Blog Management**: Full blog article management system
- **Image Gallery**: Upload, organize, and manage images
- **Settings Management**: Website configuration and company details
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. **Clone or download the project**
   ```bash
   cd estatenama.com
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the main website server**
   ```bash
   npm start
   ```
   The main website will be available at: `http://localhost:3000`

4. **Start the admin panel server**
   ```bash
   npm run admin
   ```
   The admin panel will be available at: `http://localhost:3001/admin`

5. **Run both servers simultaneously**
   ```bash
   npm run dev
   ```

## Admin Panel Access

### Default Admin Credentials
- **Username**: `admin` | **Password**: `admin123`
- **Username**: `estatenama` | **Password**: `estate2024`
- **Username**: `manager` | **Password**: `manager123`

### Admin Panel URL
- **Login Page**: `http://localhost:3001/admin`
- **Dashboard**: `http://localhost:3001/admin/dashboard` (after login)

### Admin Panel Features

#### 1. Dashboard
- Overview statistics (posts, blogs, images, projects)
- Recent activity feed
- Quick navigation to all sections

#### 2. Posts Management
- Create new posts with title, content, and status
- Edit existing posts
- Delete posts with confirmation
- Status management (Published/Draft)

#### 3. Blog Management
- Create blog articles with title, excerpt, and content
- Edit existing blog articles
- Delete blogs with confirmation
- Status management (Published/Draft)

#### 4. Projects Management
- View existing projects
- Edit project information
- Manage project images and descriptions

#### 5. Gallery Management
- Upload multiple images at once
- Drag and drop image upload
- Delete images with confirmation
- Image preview and organization

#### 6. Settings Management
- Update site title and description
- Manage contact information
- Social media links configuration

## Deployment to Vercel

This project is configured for deployment on Vercel.

1.  **Push to Git**: Ensure your code is committed to a Git repository (GitHub, GitLab, or Bitbucket).
2.  **Import to Vercel**: Import the project in Vercel.
3.  **Configuration**: Vercel should automatically detect the `vercel.json` configuration.
    *   **Framework Preset**: Select "Other" if asked, or "Next.js" if it misidentifies, but "Other" is safer for a custom Node/Static mix.
    *   **Build Command**: None (or `npm install` if needed for server deps).
    *   **Output Directory**: `.` (Root).

### Important Note on Vercel Deployment
Vercel uses a **Read-Only Filesystem** for Serverless Functions. This means:
*   **The Admin Panel is Read-Only**: You can view content, but **cannot save changes** (create posts, upload images, etc.) permanently. Changes made in the admin panel will not persist after the function execution ends.
*   **Data Persistence**: For a fully functional admin panel in production, you must migrate the data storage from local JSON files to an external database (e.g., MongoDB, PostgreSQL) and file storage (e.g., AWS S3).
