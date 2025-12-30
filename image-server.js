/**
 * Image Upload Handler for Estate Nama Admin Panel
 * Simple Node.js server for handling image uploads
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = req.body.uploadPath || 'images/uploads/';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    const filetypes = /jpeg|jpg|png|gif|webp|svg/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Image upload endpoint
app.post('/api/upload-images', upload.array('images'), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No images uploaded' 
      });
    }

    const uploadedFiles = req.files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.json({
      success: true,
      message: `${uploadedFiles.length} images uploaded successfully`,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
});

// Get current images in a folder
app.get('/api/images/:folder', (req, res) => {
  try {
    const folder = req.params.folder;
    const folderPath = path.join('images', folder);
    
    if (!fs.existsSync(folderPath)) {
      return res.json({
        success: true,
        images: []
      });
    }

    const files = fs.readdirSync(folderPath);
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
      })
      .map(file => ({
        name: file,
        path: path.join(folderPath, file),
        url: `/${path.join(folderPath, file)}`
      }));

    res.json({
      success: true,
      images: images
    });

  } catch (error) {
    console.error('Error reading images:', error);
    res.status(500).json({
      success: false,
      message: 'Error reading images',
      error: error.message
    });
  }
});

// Delete image endpoint
app.delete('/api/images/:folder/:filename', (req, res) => {
  try {
    const { folder, filename } = req.params;
    const filePath = path.join('images', folder, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
});

// Replace image endpoint (useful for direct replacements)
app.post('/api/replace-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image provided'
      });
    }

    const { originalPath } = req.body;
    
    if (originalPath && fs.existsSync(originalPath)) {
      // Backup original image
      const backupPath = `${originalPath}.backup.${Date.now()}`;
      fs.copyFileSync(originalPath, backupPath);
      
      // Replace with new image
      fs.copyFileSync(req.file.path, originalPath);
      fs.unlinkSync(req.file.path); // Remove temp file
      
      res.json({
        success: true,
        message: 'Image replaced successfully',
        newPath: originalPath,
        backupPath: backupPath
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Original image not found'
      });
    }

  } catch (error) {
    console.error('Replace error:', error);
    res.status(500).json({
      success: false,
      message: 'Error replacing image',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Image management server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🖼️  Image Management Server running on port ${PORT}`);
  console.log(`📁 Upload endpoint: POST http://localhost:${PORT}/api/upload-images`);
  console.log(`📸 Get images: GET http://localhost:${PORT}/api/images/{folder}`);
  console.log(`🗑️  Delete image: DELETE http://localhost:${PORT}/api/images/{folder}/{filename}`);
});

module.exports = app;