// Faisal Town Projects Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initFaisalTownPage();
});

function initFaisalTownPage() {
    initImageLoading();
    initScrollAnimations();
    initProjectCardInteractions();
    initContactFormHandling();
    initSmoothScrolling();
    initStatsCounter();
}

// Image Loading with Fade Effect
function initImageLoading() {
    const images = document.querySelectorAll('.project-image img');
    
    images.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function() {
                this.classList.add('loaded');
            });
            
            img.addEventListener('error', function() {
                // Fallback image if original fails to load
                this.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&h=300&fit=crop';
                this.classList.add('loaded');
            });
        }
    });
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.project-card, .feature-item, .section-header');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Project Card Interactions
function initProjectCardInteractions() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        // Add hover effect for mobile
        card.addEventListener('touchstart', function() {
            this.classList.add('touch-hover');
        });
        
        card.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('touch-hover');
            }, 300);
        });
        
        // Track card clicks for analytics
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.project-actions')) {
                const projectName = this.querySelector('h3').textContent;
                trackProjectView(projectName);
            }
        });
    });
}

// Contact Form Handling
function initContactFormHandling() {
    const whatsappButtons = document.querySelectorAll('.btn-whatsapp, .btn-whatsapp-large');
    const callButtons = document.querySelectorAll('.btn-call');
    
    whatsappButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const projectName = this.closest('.project-card')?.querySelector('h3')?.textContent || 'Faisal Town Projects';
            trackContactAction('whatsapp', projectName);
        });
    });
    
    callButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            trackContactAction('call', 'Faisal Town Projects');
        });
    });
}

// Smooth Scrolling for Internal Links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Stats Counter Animation
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-item h3');
    let hasAnimated = false;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                animateStats();
            }
        });
    }, { threshold: 0.5 });
    
    if (statNumbers.length > 0) {
        observer.observe(statNumbers[0].closest('.hero-stats'));
    }
    
    function animateStats() {
        statNumbers.forEach(stat => {
            const finalValue = parseInt(stat.textContent.replace('+', ''));
            const duration = 2000; // 2 seconds
            const increment = finalValue / (duration / 16); // 60fps
            let currentValue = 0;
            
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= finalValue) {
                    currentValue = finalValue;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(currentValue) + '+';
            }, 16);
        });
    }
}

// Project Filtering (for future enhancement)
function filterProjects(category) {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// Search Functionality (for future enhancement)
function searchProjects(query) {
    const projectCards = document.querySelectorAll('.project-card');
    const searchTerm = query.toLowerCase();
    
    projectCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('.project-description').textContent.toLowerCase();
        const features = Array.from(card.querySelectorAll('.feature-tag')).map(tag => tag.textContent.toLowerCase());
        
        const isMatch = title.includes(searchTerm) || 
                       description.includes(searchTerm) || 
                       features.some(feature => feature.includes(searchTerm));
        
        if (isMatch) {
            card.style.display = 'block';
            card.classList.add('search-highlight');
        } else {
            card.style.display = 'none';
            card.classList.remove('search-highlight');
        }
    });
}

// Analytics Tracking Functions
function trackProjectView(projectName) {
    // Google Analytics or other tracking service
    if (typeof gtag !== 'undefined') {
        gtag('event', 'project_view', {
            'project_name': projectName,
            'page_title': 'Faisal Town Projects'
        });
    }
    
    console.log('Project viewed:', projectName);
}

function trackContactAction(method, projectName) {
    // Google Analytics or other tracking service
    if (typeof gtag !== 'undefined') {
        gtag('event', 'contact_action', {
            'method': method,
            'project_name': projectName,
            'page_title': 'Faisal Town Projects'
        });
    }
    
    console.log('Contact action:', method, 'for project:', projectName);
}

// Lazy Loading for Images (Enhanced)
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Performance Optimization
function optimizePerformance() {
    // Preload critical images
    const criticalImages = [
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&h=300&fit=crop',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=300&fit=crop'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

// Error Handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error on Faisal Town page:', e.error);
    // Could send error to logging service
});

// Page Load Performance
window.addEventListener('load', function() {
    const loadTime = performance.now();
    console.log('Faisal Town page loaded in:', Math.round(loadTime), 'ms');
    
    // Initialize performance optimizations
    optimizePerformance();
});

// Export functions for potential external use
window.FaisalTownPage = {
    filterProjects,
    searchProjects,
    trackProjectView,
    trackContactAction
};