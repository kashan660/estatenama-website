// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initNavigation();
    initScrollAnimations();
    initContactForm();
    initSmoothScrolling();
    initLoadingScreen();
    initCounterAnimation();
});



// Navigation functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Check if elements exist before adding event listeners
    if (hamburger && navMenu) {
        // Toggle mobile menu
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    });

    // Active navigation link highlighting
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Add fade-in class to elements that should animate
    const animateElements = document.querySelectorAll(
        '.about-content, .project-card, .service-card, .contact-item, .feature, .stat'
    );
    
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Stagger animation for grid items
    const gridContainers = document.querySelectorAll('.projects-grid, .services-grid, .features');
    gridContainers.forEach(container => {
        const items = container.children;
        Array.from(items).forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });
    });
}

// Counter animation for statistics
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat h3');
    const speed = 200;

    const observerOptions = {
        threshold: 0.5
    };

    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.textContent.replace(/\D/g, ''));
                const increment = target / speed;
                let current = 0;

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        counter.textContent = target + '+';
                        clearInterval(timer);
                    } else {
                        counter.textContent = Math.ceil(current) + '+';
                    }
                }, 1);

                counterObserver.unobserve(counter);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Contact form functionality
function initContactForm() {
    const form = document.querySelector('.contact-form form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const name = form.querySelector('input[type="text"]').value;
            const email = form.querySelector('input[type="email"]').value;
            const phone = form.querySelector('input[type="tel"]').value;
            const propertyType = form.querySelector('select').value;
            const message = form.querySelector('textarea').value;
            
            // Basic validation
            if (!name || !email || !phone || !propertyType || !message) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Phone validation (basic)
            const phoneRegex = /^[0-9+\-\s()]+$/;
            if (!phoneRegex.test(phone)) {
                showNotification('Please enter a valid phone number', 'error');
                return;
            }
            
            // Simulate form submission
            const submitBtn = form.querySelector('.btn-primary');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                showNotification('Thank you! Your message has been sent successfully. We will contact you soon.', 'success');
                form.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                // Create WhatsApp link
                const whatsappMessage = `Hello Estate Nama!\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nProperty Type: ${propertyType}\nMessage: ${message}`;
                const whatsappUrl = `https://wa.me/923195547788?text=${encodeURIComponent(whatsappMessage)}`;
                
                // Show option to contact via WhatsApp
                setTimeout(() => {
                    if (confirm('Would you like to continue the conversation on WhatsApp?')) {
                        window.open(whatsappUrl, '_blank');
                    }
                }, 2000);
                
            }, 2000);
        });
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
        font-family: 'Poppins', sans-serif;
    `;
    
    // Add animation styles
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
        .notification-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
        }
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .notification-close:hover {
            opacity: 0.7;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Loading screen
function initLoadingScreen() {
    // Create loading screen
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading';
    loadingScreen.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loadingScreen);
    
    // Hide loading screen after page load
    window.addEventListener('load', function() {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }, 1000);
    });
}

// Parallax effect for hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const rate = scrolled * -0.5;
    
    if (hero) {
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add hover effects to project cards
document.addEventListener('DOMContentLoaded', function() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Add click to call functionality
document.addEventListener('DOMContentLoaded', function() {
    const allElements = document.querySelectorAll('p, span, div');
    
    allElements.forEach(element => {
        if (element.textContent.includes('03195547788')) {
            element.style.cursor = 'pointer';
            element.addEventListener('click', function() {
                window.location.href = 'tel:+923195547788';
            });
        }
    });
});

// Add email click functionality
document.addEventListener('DOMContentLoaded', function() {
    const allElements = document.querySelectorAll('p, span, div, a');
    
    allElements.forEach(element => {
        if (element.textContent.includes('info@estatenama.com')) {
            element.style.cursor = 'pointer';
            element.addEventListener('click', function() {
                window.location.href = 'mailto:info@estatenama.com';
            });
        }
    });
});

// WhatsApp floating button
function createWhatsAppButton() {
    const whatsappBtn = document.createElement('a');
    whatsappBtn.href = 'https://wa.me/923195547788';
    whatsappBtn.target = '_blank';
    whatsappBtn.className = 'whatsapp-float';
    whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i>';
    
    // Add styles
    whatsappBtn.style.cssText = `
        position: fixed;
        width: 60px;
        height: 60px;
        bottom: 40px;
        right: 40px;
        background-color: #25d366;
        color: white;
        border-radius: 50px;
        text-align: center;
        font-size: 30px;
        box-shadow: 2px 2px 3px #999;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        transition: all 0.3s ease;
        animation: pulse 2s infinite;
    `;
    
    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(37, 211, 102, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
            }
        }
        .whatsapp-float:hover {
            transform: scale(1.1);
            background-color: #128c7e;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(whatsappBtn);
}

// Initialize WhatsApp button
document.addEventListener('DOMContentLoaded', createWhatsAppButton);

// Scroll to top functionality
function createScrollToTopButton() {
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.className = 'scroll-to-top';
    
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 120px;
        right: 40px;
        width: 50px;
        height: 50px;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    `;
    
    document.body.appendChild(scrollBtn);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top functionality
    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize scroll to top button
document.addEventListener('DOMContentLoaded', createScrollToTopButton);

// Add typing effect to hero title
function initTypingEffect() {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        setTimeout(typeWriter, 1500);
    }
}

// Initialize typing effect
document.addEventListener('DOMContentLoaded', initTypingEffect);

// Performance optimization: Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
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
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', initLazyLoading);

// Error handling for external links
document.addEventListener('DOMContentLoaded', function() {
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    
    externalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            try {
                // Add rel attributes for security
                this.rel = 'noopener noreferrer';
            } catch (error) {
                console.warn('Could not set rel attributes:', error);
            }
        });
    });
});

// Newsletter Widget Functions
let widgetVisible = false;
let currentOfferIndex = 0;
let widgetCycleTimer;
let offerChangeTimer;

function initNewsletterWidget() {
    const widget = document.querySelector('.newsletter-widget');
    const items = document.querySelectorAll('.newsletter-widget .offer-item');
    
    if (!widget || items.length === 0) return;

    // Start the auto-show/hide cycle
    startWidgetCycle();
}

function startWidgetCycle() {
    const widget = document.querySelector('.newsletter-widget');
    const items = document.querySelectorAll('.newsletter-widget .offer-item');
    
    if (!widget || items.length === 0) return;

    // Show widget with current offer
    showWidget();
    
    // Change offers while widget is visible (every 3 seconds)
    offerChangeTimer = setInterval(() => {
        if (widgetVisible) {
            showNextOffer();
        }
    }, 3000);
    
    // Hide widget after 12 seconds (shows 4 offers)
    setTimeout(() => {
        hideWidget();
        
        // Wait 8 seconds before showing again
        setTimeout(() => {
            startWidgetCycle();
        }, 8000);
    }, 12000);
}

function showWidget() {
    const widget = document.querySelector('.newsletter-widget');
    if (widget) {
        widget.classList.remove('hide');
        widget.classList.add('show');
        widgetVisible = true;
    }
}

function hideWidget() {
    const widget = document.querySelector('.newsletter-widget');
    if (widget) {
        widget.classList.remove('show');
        widget.classList.add('hide');
        widgetVisible = false;
        clearInterval(offerChangeTimer);
    }
}

function showNextOffer() {
    const items = document.querySelectorAll('.newsletter-widget .offer-item');
    if (items.length > 0) {
        items[currentOfferIndex].classList.remove('active');
        currentOfferIndex = (currentOfferIndex + 1) % items.length;
        items[currentOfferIndex].classList.add('active');
    }
}

function toggleNewsletterWidget() {
    const widget = document.querySelector('.newsletter-widget');
    if (widget) {
        if (widget.classList.contains('show')) {
            hideWidget();
            // Clear the cycle and restart after manual close
            clearTimeout(widgetCycleTimer);
            widgetCycleTimer = setTimeout(() => {
                startWidgetCycle();
            }, 15000); // Wait 15 seconds before auto-showing again
        } else {
            showWidget();
        }
    }
}

// Initialize newsletter widget when DOM is loaded
document.addEventListener('DOMContentLoaded', initNewsletterWidget);

// Console welcome message
// WhatsApp function for project details and newsletter offers
function openWhatsApp(message = '') {
    const phoneNumber = '923195547788';
    const defaultMessage = 'Hi! I saw your special offers on Estate Nama website and I\'m interested in learning more about your real estate projects. Please provide me with more details.';
    const finalMessage = message || defaultMessage;
    const encodedMessage = encodeURIComponent(finalMessage);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
}

console.log('%c🏠 Welcome to Estate Nama! 🏠', 'color: #e74c3c; font-size: 20px; font-weight: bold;');
console.log('%cYour trusted real estate partner in Pakistan', 'color: #2c3e50; font-size: 14px;');
console.log('%cContact us: info@estatenama.com | 03195547788', 'color: #666; font-size: 12px;');