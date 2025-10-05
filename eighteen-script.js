// Eighteen Projects Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initScrollAnimations();
    initProjectCards();
    initContactForm();
    initSmoothScrolling();
    initStatsCounter();
    initImageLoading();
    initParallaxEffect();
    initProjectFiltering();
});

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Add fade-in class to elements
    const animatedElements = document.querySelectorAll('.project-card, .amenity-card, .choose-point, .overview-text, .overview-image');
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// Project Cards Interactions
function initProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        // Add hover sound effect (optional)
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });

        // Project button click handler
        const projectBtn = card.querySelector('.project-btn');
        if (projectBtn) {
            projectBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const projectTitle = card.querySelector('h4').textContent;
                showProjectDetails(projectTitle);
            });
        }
    });
}

// Show Project Details Modal (placeholder)
function showProjectDetails(projectTitle) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${projectTitle}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <p>Detailed information about ${projectTitle} will be available soon.</p>
                <p>Contact us for more information and site visits.</p>
                <div class="modal-contact">
                    <a href="tel:03195547788" class="modal-btn">Call Now</a>
                    <a href="https://wa.me/923195547788" class="modal-btn">WhatsApp</a>
                </div>
            </div>
        </div>
    `;

    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    document.body.appendChild(modal);
    
    // Animate modal in
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);

    // Close modal functionality
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modal.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }
    });
}

// Contact Form Handling
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Validate form
            if (validateForm(data)) {
                // Show loading state
                const submitBtn = this.querySelector('.submit-btn');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;
                
                // Simulate form submission
                setTimeout(() => {
                    showSuccessMessage();
                    this.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 2000);
            }
        });
    }
}

// Form Validation
function validateForm(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Please enter a valid name');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!data.phone || data.phone.trim().length < 10) {
        errors.push('Please enter a valid phone number');
    }
    
    if (!data.interest) {
        errors.push('Please select your area of interest');
    }
    
    if (errors.length > 0) {
        showErrorMessage(errors.join('\n'));
        return false;
    }
    
    return true;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show success message
function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.textContent = 'Thank you! Your message has been sent successfully. We will contact you soon.';
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(message);
        }, 300);
    }, 5000);
}

// Show error message
function showErrorMessage(errors) {
    const message = document.createElement('div');
    message.className = 'error-message';
    message.textContent = errors;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        white-space: pre-line;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(message);
        }, 300);
    }, 5000);
}

// Smooth Scrolling
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Stats Counter Animation
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    stats.forEach(stat => observer.observe(stat));
}

// Animate counter
function animateCounter(element) {
    const target = element.textContent;
    const isDecimal = target.includes('.');
    const numericValue = parseFloat(target.replace(/[^\d.]/g, ''));
    const suffix = target.replace(/[\d.]/g, '');
    
    let current = 0;
    const increment = numericValue / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
            current = numericValue;
            clearInterval(timer);
        }
        
        const displayValue = isDecimal ? current.toFixed(1) : Math.floor(current);
        element.textContent = displayValue + suffix;
    }, 20);
}

// Image Loading with Fade Effect
function initImageLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        // Fallback for already loaded images
        if (img.complete) {
            img.style.opacity = '1';
        }
    });
}

// Parallax Effect for Hero Section
function initParallaxEffect() {
    const hero = document.querySelector('.hero-section');
    
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        });
    }
}

// Project Filtering (placeholder for future enhancement)
function initProjectFiltering() {
    // This can be expanded to add filtering functionality
    console.log('Project filtering initialized');
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance Optimization
function initPerformanceOptimizations() {
    // Lazy load images
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

// Error Handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // Could send error reports to analytics service
});

// Analytics Tracking (placeholder)
function trackEvent(eventName, properties = {}) {
    // Placeholder for analytics tracking
    console.log('Event tracked:', eventName, properties);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .project-modal .modal-content {
        background: white;
        border-radius: 20px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        transform: scale(0.8);
        transition: transform 0.3s ease;
    }
    
    .project-modal[style*="opacity: 1"] .modal-content {
        transform: scale(1);
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
    }
    
    .modal-header h3 {
        margin: 0;
        color: #1a1a1a;
    }
    
    .close-modal {
        background: none;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .close-modal:hover {
        color: #d4af37;
    }
    
    .modal-body p {
        color: #666;
        line-height: 1.6;
        margin-bottom: 1rem;
    }
    
    .modal-contact {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
    }
    
    .modal-btn {
        background: linear-gradient(135deg, #d4af37, #f4d03f);
        color: #1a1a1a;
        padding: 10px 20px;
        border-radius: 25px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
        flex: 1;
        text-align: center;
    }
    
    .modal-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(212, 175, 55, 0.3);
    }
`;
document.head.appendChild(style);