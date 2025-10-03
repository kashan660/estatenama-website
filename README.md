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
- Update company address
- Save configuration changes

## File Structure

```
estatenama.com/
├── index.html              # Main website homepage
├── styles.css              # Main website styles
├── script.js               # Main website JavaScript
├── server.js               # Main website server
├── admin-login.html        # Admin login page
├── admin-dashboard.html    # Admin dashboard
├── admin-styles.css        # Admin panel styles
├── admin-auth.js           # Admin authentication
├── admin-dashboard.js      # Admin dashboard functionality
├── admin-server.js         # Admin panel backend server
├── package.json            # Project dependencies
├── README.md               # This file
├── admin-data/             # Admin data storage
│   ├── posts.json          # Posts data
│   ├── blogs.json          # Blogs data
│   ├── images.json         # Images metadata
│   └── settings.json       # Website settings
└── uploads/                # Uploaded images storage
```

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login

### Posts
- `GET /api/admin/posts` - Get all posts
- `POST /api/admin/posts` - Create new post
- `PUT /api/admin/posts/:id` - Update post
- `DELETE /api/admin/posts/:id` - Delete post

### Blogs
- `GET /api/admin/blogs` - Get all blogs
- `POST /api/admin/blogs` - Create new blog
- `PUT /api/admin/blogs/:id` - Update blog
- `DELETE /api/admin/blogs/:id` - Delete blog

### Images
- `GET /api/admin/images` - Get all images
- `POST /api/admin/images/upload` - Upload images
- `DELETE /api/admin/images/:id` - Delete image

### Settings
- `GET /api/admin/settings` - Get website settings
- `PUT /api/admin/settings` - Update settings

### Statistics
- `GET /api/admin/stats` - Get dashboard statistics

## Company Information

- **Company**: EstateNama
- **Domain**: estatenama.com
- **Email**: info@estatenama.com
- **Phone**: 03195547788
- **Address**: Phase 7, Anarkali Restaurant, Bahria Town

### Partner Projects
- [Faisal Town](https://faisaltown.com.pk/projects/)
- [Eighteen Luxury Society](https://www.eighteen.com/)
- [Kingdom Valley](https://kingdomvalleypvtltd.com/)

## Security Notes

⚠️ **Important**: This admin panel is designed for development and demonstration purposes. For production use, please implement:

1. **Proper Authentication**: Use JWT tokens with secure secret keys
2. **Password Hashing**: Implement bcrypt or similar for password security
3. **HTTPS**: Use SSL certificates for secure communication
4. **Input Validation**: Add comprehensive server-side validation
5. **Rate Limiting**: Implement rate limiting for API endpoints
6. **Database**: Replace file-based storage with a proper database
7. **Environment Variables**: Use environment variables for sensitive configuration

## Support

For technical support or questions about the admin panel:
- Email: info@estatenama.com
- Phone: 03195547788

## License

This project is licensed under the MIT License.

---

**EstateNama** - Your trusted real estate partner for premium properties in Islamabad and Rawalpindi.