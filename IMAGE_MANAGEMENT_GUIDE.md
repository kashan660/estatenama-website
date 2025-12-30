# Estate Nama Image Management Guide

## 📁 Image Folder Structure

Your website images are now organized in a structured folder system for easy management:

```
images/
├── homepage/           # Homepage hero images
│   ├── home1.png     # Main hero image 1
│   └── home2.png     # Main hero image 2
├── logos/            # Company logos
│   └── logoe_statenama.png
├── favicons/         # Favicon files
│   ├── favicon.ico
│   ├── favicon-32x32.png
│   ├── favicon-16x16.png
│   ├── apple-touch-icon.png
│   └── site.webmanifest
├── projects/         # Project-specific images
│   ├── faisal-town/
│   ├── ruden-enclave/
│   ├── eighteen/
│   └── bahria-town-phase8/
├── admin/            # Admin and office images
│   └── estate-nama-office.jpg
└── uploads/          # User uploaded images
```

## 🔄 How to Replace Images

### Method 1: Using the Admin Panel (Recommended)
1. Navigate to the admin dashboard
2. Click on "Image Manager" in the sidebar
3. Select the category (Homepage, Logo, Projects)
4. Drag & drop or click to upload new images
5. The system will automatically organize images in the correct folders

### Method 2: Manual Replacement
1. Access the server files via FTP/File Manager
2. Navigate to the appropriate folder (e.g., `images/homepage/`)
3. Replace the existing image with your new image
4. **Important**: Keep the same filename for seamless replacement
5. Clear browser cache if changes don't appear immediately

### Method 3: Using the Image Server API
For developers, you can use the image server API:

```bash
# Upload new images
curl -X POST http://localhost:3001/api/upload-images \
  -F "images=@new-homepage.jpg" \
  -F "uploadPath=images/homepage/"

# Replace existing image
curl -X POST http://localhost:3001/api/replace-image \
  -F "image=@new-logo.png" \
  -F "originalPath=images/logos/logoe_statenama.png"
```

## 📋 Image Requirements

### Homepage Hero Images
- **Recommended Size**: 1920x1080 pixels (16:9 aspect ratio)
- **Format**: JPG or PNG
- **File Size**: Under 2MB for optimal loading
- **Quality**: High definition (HD) for best appearance

### Logo Images
- **Recommended Size**: 500x500 pixels (square)
- **Format**: PNG with transparent background
- **File Size**: Under 500KB
- **Quality**: Vector-based or high-resolution PNG

### Project Images
- **Recommended Size**: 1200x800 pixels (3:2 aspect ratio)
- **Format**: JPG for photos, PNG for graphics
- **File Size**: Under 1MB each
- **Quality**: High definition for professional appearance

### Favicon Images
- **Sizes**: 16x16, 32x32, 180x180 (apple-touch)
- **Format**: PNG for most, ICO for favicon.ico
- **File Size**: Under 50KB each

## ⚡ Quick Replacement Steps

### Replace Homepage Hero Images
1. Go to `images/homepage/` folder
2. Replace `home1.png` and `home2.png` with your new images
3. Keep the same filenames for automatic updates
4. Refresh your website to see changes

### Replace Company Logo
1. Go to `images/logos/` folder
2. Replace `logoe_statenama.png` with your new logo
3. Ensure it's a PNG with transparent background
4. Clear browser cache if needed

### Replace Project Images
1. Go to `images/projects/{project-name}/` folder
2. Add your project images (JPG or PNG format)
3. Update the project data in admin panel to reference new images
4. The website will automatically use the new images

## 🛠️ Troubleshooting

### Images Not Showing
1. **Check file paths**: Ensure images are in correct folders
2. **Verify filenames**: Case-sensitive on some servers
3. **Clear browser cache**: Press Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
4. **Check file permissions**: Ensure images are readable (644 permission)

### Broken Images
1. **Check file format**: Ensure images are valid JPG/PNG files
2. **Verify file size**: Large images may cause loading issues
3. **Test image directly**: Try accessing image URL directly in browser
4. **Check server logs**: Look for 404 or permission errors

### Slow Loading Images
1. **Optimize file size**: Compress images without losing quality
2. **Use appropriate format**: JPG for photos, PNG for graphics
3. **Consider WebP format**: Better compression, same quality
4. **Enable caching**: Configure server-side caching headers

## 📱 Mobile Optimization

All images are automatically optimized for mobile devices:
- Responsive images scale appropriately
- Lazy loading for better performance
- Touch-friendly image galleries
- Optimized loading on slow connections

## 🔧 Advanced Features

### Image Manager Console Commands
Open browser console (F12) and use these commands:

```javascript
// Get image path by category
window.imageUtils.getPath('homepage', 'hero.image1')

// Update hero images
window.imageUtils.updateHero('images/homepage/new-hero1.jpg', 'images/homepage/new-hero2.jpg')

// Replace specific image
window.imageUtils.replace('.logo-img', 'images/logos/new-logo.png')

// Validate all images
window.imageUtils.validate()
```

### Bulk Image Replacement
Use the bulk replacement function for multiple images:

```javascript
const replacements = {
  'old-image1.jpg': 'new-image1.jpg',
  'old-image2.jpg': 'new-image2.jpg'
};

window.imageUtils.bulkReplace('images/homepage/', replacements);
```

## 📞 Support

If you encounter issues with image replacement:
1. Check this guide first
2. Test with the image replacement test page (`test-image-replacement.html`)
3. Contact support with specific error messages
4. Include browser console logs for faster resolution

---

**Remember**: Always backup your original images before making changes!