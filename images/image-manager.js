/**
 * Image Management Utility for Estate Nama Website
 * This script provides functions to easily manage and replace images
 */

// Image mapping configuration
const imageMap = {
  "homepage": {
    "hero": {
      "image1": "images/homepage/home1.png",
      "image2": "images/homepage/home2.png",
      "alt1": "Estate Nama Real Estate",
      "alt2": "Estate Nama Properties"
    },
    "office": "images/admin/estate-nama-office.jpg"
  },
  "logos": {
    "main": "images/logos/logoe_statenama.png",
    "alt": "Estate Nama - Real Estate Company"
  },
  "favicons": {
    "apple-touch": "images/favicons/apple-touch-icon.png",
    "32x32": "images/favicons/favicon-32x32.png",
    "16x16": "images/favicons/favicon-16x16.png",
    "ico": "images/favicons/favicon.ico",
    "manifest": "images/favicons/site.webmanifest"
  },
  "projects": {
    "faisal-town": {
      "folder": "images/projects/faisal-town/",
      "default": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    "ruden-enclave": {
      "folder": "images/projects/ruden-enclave/",
      "default": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    "eighteen": {
      "folder": "images/projects/eighteen/",
      "default": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    "bahria-town-phase8": {
      "folder": "images/projects/bahria-town-phase8/",
      "default": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    }
  },
  "admin": {
    "uploads": "images/admin/",
    "office": "images/admin/estate-nama-office.jpg"
  }
};

/**
 * Get image path by category and name
 * @param {string} category - Image category (homepage, logos, projects, etc.)
 * @param {string} name - Image name or subcategory
 * @returns {string} - Image path or default fallback
 */
function getImagePath(category, name) {
  try {
    if (imageMap[category] && imageMap[category][name]) {
      return imageMap[category][name];
    }
    
    // Handle nested paths like homepage.hero.image1
    const parts = name.split('.');
    let current = imageMap[category];
    for (const part of parts) {
      if (current && current[part]) {
        current = current[part];
      } else {
        return null;
      }
    }
    return current;
  } catch (error) {
    console.error('Error getting image path:', error);
    return null;
  }
}

/**
 * Get project image folder path
 * @param {string} projectName - Project identifier (faisal-town, ruden-enclave, etc.)
 * @returns {string} - Project image folder path
 */
function getProjectImageFolder(projectName) {
  return imageMap.projects[projectName]?.folder || imageMap.projects.default?.folder || 'images/projects/';
}

/**
 * Get project default image
 * @param {string} projectName - Project identifier
 * @returns {string} - Default project image URL
 */
function getProjectDefaultImage(projectName) {
  return imageMap.projects[projectName]?.default || imageMap.projects.default?.default || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
}

/**
 * Update hero images programmatically
 * @param {string} image1Path - Path to first hero image
 * @param {string} image2Path - Path to second hero image
 */
function updateHeroImages(image1Path, image2Path) {
  const heroImage1 = document.getElementById('heroImage1');
  const heroImage2 = document.getElementById('heroImage2');
  
  if (heroImage1 && image1Path) {
    heroImage1.src = image1Path;
  }
  if (heroImage2 && image2Path) {
    heroImage2.src = image2Path;
  }
}

/**
 * Update logo image
 * @param {string} logoPath - Path to logo image
 */
function updateLogo(logoPath) {
  const logoImages = document.querySelectorAll('.logo-img, .footer-logo-img');
  logoImages.forEach(img => {
    if (logoPath) {
      img.src = logoPath;
    }
  });
}

/**
 * Replace image with new source
 * @param {string} selector - CSS selector for the image
 * @param {string} newSrc - New image source path
 * @param {string} newAlt - New alt text (optional)
 */
function replaceImage(selector, newSrc, newAlt = null) {
  const images = document.querySelectorAll(selector);
  images.forEach(img => {
    if (newSrc) {
      img.src = newSrc;
    }
    if (newAlt) {
      img.alt = newAlt;
    }
  });
}

/**
 * Bulk replace images in a specific folder
 * @param {string} folderPath - Folder path containing images
 * @param {Object} replacements - Object mapping old filenames to new filenames
 */
function bulkReplaceImages(folderPath, replacements) {
  const images = document.querySelectorAll(`img[src*="${folderPath}"]`);
  images.forEach(img => {
    const currentSrc = img.src;
    const filename = currentSrc.split('/').pop();
    if (replacements[filename]) {
      img.src = currentSrc.replace(filename, replacements[filename]);
    }
  });
}

/**
 * Image validation and error handling
 */
function validateImages() {
  const images = document.querySelectorAll('img');
  let brokenImages = [];
  
  images.forEach(img => {
    img.addEventListener('error', function() {
      console.warn('Broken image detected:', this.src);
      brokenImages.push(this.src);
      
      // Try to replace with default placeholder
      if (this.src.includes('projects/')) {
        this.src = getProjectDefaultImage();
      }
    });
  });
  
  return brokenImages;
}

/**
 * Initialize image management system
 */
function initImageManagement() {
  // Validate all images on page load
  document.addEventListener('DOMContentLoaded', function() {
    validateImages();
    
    // Add image management console commands
    if (typeof window !== 'undefined') {
      window.imageUtils = {
        getPath: getImagePath,
        getProjectFolder: getProjectImageFolder,
        getProjectDefault: getProjectDefaultImage,
        updateHero: updateHeroImages,
        updateLogo: updateLogo,
        replace: replaceImage,
        bulkReplace: bulkReplaceImages,
        validate: validateImages,
        map: imageMap
      };
      
      console.log('🏞️ Image Management System Loaded!');
      console.log('Available commands: window.imageUtils');
    }
  });
}

// Initialize the image management system
initImageManagement();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getImagePath,
    getProjectImageFolder,
    getProjectDefaultImage,
    updateHeroImages,
    updateLogo,
    replaceImage,
    bulkReplaceImages,
    validateImages,
    imageMap
  };
}