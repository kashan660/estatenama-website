// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initNavigation();
    initScrollAnimations();
    initContactForm();
    initSmoothScrolling();
    initLoadingScreen();
    initCounterAnimation();
    initRandomHeroImages();
    initBlogPosts();
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

    // Dropdown functionality for mobile
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdown = document.querySelector('.dropdown');
    
    if (dropdownToggle && dropdown) {
        dropdownToggle.addEventListener('click', function(e) {
            // Only prevent default on mobile
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (dropdown && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    // Handle window resize to reset dropdown state
    window.addEventListener('resize', function() {
        if (dropdown && window.innerWidth > 768) {
            dropdown.classList.remove('active');
        }
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

// Hero section responsiveness handler
function initHeroResponsiveness() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    function updateHeroBackground() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Force background recalculation
        hero.style.backgroundSize = 'cover';
        hero.style.backgroundPosition = 'center center';
        hero.style.backgroundRepeat = 'no-repeat';
        
        // Trigger a reflow to ensure background updates
        hero.offsetHeight;
        
        // Additional responsive adjustments based on viewport
        if (viewportWidth < 768) {
            hero.style.backgroundSize = 'cover';
            hero.style.minHeight = '100vh';
        } else if (viewportWidth >= 1400) {
            hero.style.backgroundSize = 'cover';
            hero.style.minHeight = '100vh';
        } else {
            hero.style.backgroundSize = 'cover';
            hero.style.minHeight = '100vh';
        }
    }

    // Update on window resize
    window.addEventListener('resize', updateHeroBackground);
    
    // Update on orientation change (mobile)
    window.addEventListener('orientationchange', function() {
        setTimeout(updateHeroBackground, 100);
    });
    
    // Initial update
    updateHeroBackground();
}

// Dynamic Projects Loading
async function loadFaisalTownProjects() {
    try {
        const response = await fetch('./admin-data/projects.json');
        const projects = await response.json();
        
        // Filter Faisal Town projects
        const faisalTownProjects = projects.filter(project => 
            project.developer && project.developer.toLowerCase().includes('faisal town')
        );
        
        if (faisalTownProjects.length > 0) {
            displayFaisalTownProjects(faisalTownProjects);
        }
    } catch (error) {
        console.log('Projects data not available, using static content');
    }
}

function displayFaisalTownProjects(projects) {
    const faisalTownGrid = document.querySelector('.project-category:first-child .projects-grid');
    
    if (!faisalTownGrid) return;
    
    // Clear existing content
    faisalTownGrid.innerHTML = '';
    
    projects.forEach(project => {
        const projectCard = createProjectCard(project);
        faisalTownGrid.appendChild(projectCard);
    });
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card detailed';
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', '200');
    
    // Generate plot sizes HTML
    const plotSizesHTML = project.plotSizes && project.plotSizes.length > 0 
        ? project.plotSizes.map(plot => `<div class="plot-item">${plot.size} - ${plot.price}</div>`).join('')
        : '<div class="plot-item">Contact for pricing details</div>';
    
    // Generate features HTML
    const featuresHTML = project.features && project.features.length > 0
        ? project.features.slice(0, 4).map(feature => `<span class="feature">✅ ${feature}</span>`).join('')
        : '<span class="feature">✅ Premium Location</span>';
    
    // Generate amenities for payment plan
    const paymentPlan = project.installmentPlan || 'Flexible payment plans available';
    
    card.innerHTML = `
        <div class="project-image">
            <img src="${project.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'}" 
                 alt="${project.name}" loading="lazy">
            <div class="project-overlay">
                <div class="project-status">${project.status || 'Available'}</div>
            </div>
        </div>
        <div class="project-content">
            <h4>${project.name}</h4>
            <p class="project-location">📍 ${project.location}</p>
            <p class="project-description">${project.description}</p>
            
            <div class="plot-details">
                <h5>📋 Available Plot Sizes:</h5>
                <div class="plot-grid">
                    ${plotSizesHTML}
                </div>
            </div>
            
            <div class="project-features">
                ${featuresHTML}
            </div>
            
            <div class="payment-plan">
                <h5>💳 Payment Plan</h5>
                <p>${paymentPlan}</p>
            </div>
            
            <a href="project-details.html?project=${project.id}" class="btn-secondary project-btn">Get Complete Details</a>
        </div>
    `;
    
    return card;
}

// Add project loading to DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    initHeroResponsiveness();
    loadFaisalTownProjects();
});

// Random Hero Images Functionality
function initRandomHeroImages() {
    const heroImages = document.querySelectorAll('.hero-bg-image');
    
    if (heroImages.length === 0) return;
    
    let currentImageIndex = 0;
    
    // Function to show random image
    function showRandomImage() {
        // Remove active class from all images
        heroImages.forEach(img => img.classList.remove('active'));
        
        // Get random index different from current
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * heroImages.length);
        } while (randomIndex === currentImageIndex && heroImages.length > 1);
        
        // Show the random image
        heroImages[randomIndex].classList.add('active');
        currentImageIndex = randomIndex;
    }
    
    // Show first random image immediately
    showRandomImage();
    
    // Change image every 5 seconds
    setInterval(showRandomImage, 5000);
}

// Blog Posts Functionality
const blogPosts = [
    {
        id: 1,
        title: "Houses for Sale Near Me: Complete Guide to Finding Your Dream Home",
        excerpt: "Discover the best houses for sale in your area with our comprehensive guide. Learn about market trends, pricing, and how to find the perfect property.",
        content: "Finding houses for sale near you has never been easier. Our expert real estate agents help you navigate the local market, compare prices, and find properties that match your budget and preferences.",
        category: "Buying Guide",
        date: "2024-01-15",
        image: "home1.png",
        keywords: ["houses for sale near me", "real estate", "property", "homes for sale"]
    },
    {
        id: 2,
        title: "Commercial Property for Sale: Investment Opportunities in 2024",
        excerpt: "Explore lucrative commercial property investments. From office buildings to retail spaces, discover the best commercial real estate opportunities.",
        content: "Commercial property for sale offers excellent investment potential. Our portfolio includes prime commercial locations with high ROI potential and strategic advantages.",
        category: "Investment",
        date: "2024-01-20",
        image: "home2.png",
        keywords: ["commercial property for sale", "investment", "commercial real estate"]
    },
    {
        id: 3,
        title: "Land for Sale Near Me: Prime Plots for Development",
        excerpt: "Find the best land for sale in prime locations. Perfect for residential development, commercial projects, or investment purposes.",
        content: "Our land for sale portfolio includes RDA approved plots in Bahria Town, Ruden Enclave, and Faisal Town. All properties come with clear titles and development potential.",
        category: "Land",
        date: "2024-01-25",
        image: "home1.png",
        keywords: ["land for sale near me", "plots", "development", "investment"]
    },
    {
        id: 4,
        title: "Real Estate Agent Services: Your Trusted Property Partner",
        excerpt: "Professional real estate agent services for buying, selling, and investing in property. Expert guidance for all your real estate needs.",
        content: "Our experienced real estate agents provide comprehensive services including property valuation, market analysis, legal assistance, and investment advice.",
        category: "Services",
        date: "2024-02-01",
        image: "home2.png",
        keywords: ["real estate agent", "property services", "realtors near me"]
    },
    {
        id: 5,
        title: "Installment Plans: Easy Property Payment Options",
        excerpt: "Flexible installment plans make property ownership accessible. Learn about our easy payment schemes and financing options.",
        content: "We offer attractive installment plans for all our properties. With flexible payment schedules and competitive rates, owning your dream property is now within reach.",
        category: "Financing",
        date: "2024-02-05",
        image: "home1.png",
        keywords: ["installments", "payment plans", "property financing"]
    },
    {
        id: 6,
        title: "New Homes Near Me: Latest Residential Projects",
        excerpt: "Discover new homes and residential projects in prime locations. Modern amenities, contemporary designs, and excellent connectivity.",
        content: "Our new homes feature modern architecture, premium amenities, and strategic locations. From luxury villas to affordable housing, find your perfect home.",
        category: "New Projects",
        date: "2024-02-10",
        image: "home2.png",
        keywords: ["new homes near me", "residential projects", "modern homes"]
    },
    {
        id: 7,
        title: "Property for Sale: Comprehensive Real Estate Listings",
        excerpt: "Browse our extensive property for sale listings. Residential, commercial, and investment properties in prime locations.",
        content: "Our property portfolio includes verified listings with detailed information, high-quality images, and competitive pricing. Find your ideal property today.",
        category: "Listings",
        date: "2024-02-15",
        image: "home1.png",
        keywords: ["property for sale", "real estate listings", "property search"]
    },
    {
        id: 8,
        title: "Buy House: Step-by-Step Home Buying Guide",
        excerpt: "Complete guide to buying a house. From property search to legal documentation, we guide you through every step.",
        content: "Buying a house is a major decision. Our experts help you with property selection, price negotiation, legal verification, and smooth transaction completion.",
        category: "Buying Guide",
        date: "2024-02-20",
        image: "home2.png",
        keywords: ["buy house", "home buying", "property purchase"]
    },
    {
        id: 9,
        title: "Mansions for Sale: Luxury Properties in Prime Locations",
        excerpt: "Exclusive mansions for sale in prestigious neighborhoods. Luxury living with premium amenities and architectural excellence.",
        content: "Our luxury mansion portfolio features exclusive properties with premium amenities, spacious layouts, and prime locations in elite neighborhoods.",
        category: "Luxury",
        date: "2024-02-25",
        image: "home1.png",
        keywords: ["mansions for sale", "luxury properties", "premium homes"]
    },
    {
        id: 10,
        title: "Real Estate Near Me: Local Property Market Analysis",
        excerpt: "Comprehensive analysis of local real estate markets. Property trends, pricing insights, and investment opportunities in your area.",
        content: "Stay informed about real estate trends in your area. Our market analysis helps you make informed decisions about buying, selling, or investing.",
        category: "Market Analysis",
        date: "2024-03-01",
        image: "home2.png",
        keywords: ["real estate near me", "market analysis", "property trends"]
    },
    {
        id: 11,
        title: "Apartments for Sale: Urban Living Solutions",
        excerpt: "Modern apartments for sale in prime urban locations. Perfect for young professionals and small families.",
        content: "Our apartment portfolio includes modern units with contemporary amenities, strategic locations, and excellent connectivity to business districts.",
        category: "Apartments",
        date: "2024-03-05",
        image: "home1.png",
        keywords: ["apartments for sale", "urban living", "modern apartments"]
    },
    {
        id: 12,
        title: "Rental Properties Near Me: Investment Income Opportunities",
        excerpt: "Discover rental properties with excellent income potential. High-demand locations with guaranteed rental yields.",
        content: "Invest in rental properties with strong income potential. Our portfolio includes properties in high-demand areas with excellent rental yields.",
        category: "Rental Investment",
        date: "2024-03-10",
        image: "home2.png",
        keywords: ["rental properties near me", "rental investment", "income property"]
    },
    {
        id: 13,
        title: "Investment Property for Sale: Build Your Real Estate Portfolio",
        excerpt: "Strategic investment properties for portfolio diversification. High ROI potential with professional property management.",
        content: "Build wealth through real estate investment. Our investment properties offer excellent ROI potential with professional management services.",
        category: "Investment",
        date: "2024-03-15",
        image: "home1.png",
        keywords: ["investment property for sale", "real estate investment", "property portfolio"]
    },
    {
        id: 14,
        title: "Realtors Near Me: Professional Real Estate Services",
        excerpt: "Connect with professional realtors in your area. Expert guidance for all your property needs and transactions.",
        content: "Our professional realtors provide expert guidance for buying, selling, and investing in real estate. Local market expertise and personalized service.",
        category: "Professional Services",
        date: "2024-03-20",
        image: "home2.png",
        keywords: ["realtors near me", "real estate professionals", "property experts"]
    },
    {
        id: 15,
        title: "Commercial Real Estate: Business Property Solutions",
        excerpt: "Commercial real estate opportunities for businesses. Office spaces, retail locations, and industrial properties.",
        content: "Find the perfect commercial space for your business. Our commercial real estate portfolio includes office buildings, retail spaces, and industrial properties.",
        category: "Commercial",
        date: "2024-03-25",
        image: "home1.png",
        keywords: ["commercial real estate", "business property", "office spaces"]
    },
    {
        id: 16,
        title: "Homes for Sale: Family-Friendly Residential Properties",
        excerpt: "Family-friendly homes for sale in safe neighborhoods. Quality construction, modern amenities, and excellent schools nearby.",
        content: "Our homes for sale feature family-friendly designs, safe neighborhoods, quality construction, and proximity to schools and amenities.",
        category: "Family Homes",
        date: "2024-03-30",
        image: "home2.png",
        keywords: ["homes for sale", "family homes", "residential properties"]
    },
    {
        id: 17,
        title: "Property Market Trends 2024: Expert Analysis and Predictions",
        excerpt: "Comprehensive analysis of property market trends for 2024. Price predictions, investment opportunities, and market insights.",
        content: "Stay ahead with our 2024 property market analysis. Expert insights on price trends, investment opportunities, and market predictions.",
        category: "Market Trends",
        date: "2024-04-01",
        image: "home1.png",
        keywords: ["property market trends", "real estate analysis", "market predictions"]
    },
    {
        id: 18,
        title: "Bahria Town Phase 8: Premium Residential Development",
        excerpt: "Explore Bahria Town Phase 8 - a premium residential development with world-class amenities and infrastructure.",
        content: "Bahria Town Phase 8 offers premium residential plots with modern infrastructure, security, and amenities. RDA approved with excellent investment potential.",
        category: "Featured Projects",
        date: "2024-04-05",
        image: "home2.png",
        keywords: ["bahria town phase 8", "premium development", "residential plots"]
    },
    {
        id: 19,
        title: "Ruden Enclave: Premium Residential Development",
        excerpt: "Ruden Enclave - A premium residential society offering modern amenities and excellent connectivity.",
        content: "Ruden Enclave is a well-planned residential development featuring modern infrastructure, green spaces, and comprehensive facilities for comfortable living.",
        category: "Residential",
        date: "2024-04-10",
        image: "home1.png",
        keywords: ["ruden enclave", "residential plots", "premium development"]
    },
    {
        id: 20,
        title: "Faisal Town: Established Community with Growth Potential",
        excerpt: "Faisal Town offers established infrastructure with excellent growth potential. Perfect for both living and investment.",
        content: "Faisal Town combines established infrastructure with growth potential. Excellent connectivity, amenities, and investment opportunities.",
        category: "Established Communities",
        date: "2024-04-15",
        image: "home2.png",
        keywords: ["faisal town", "established community", "growth potential"]
    }
];

let currentPostsDisplayed = 6;

function initBlogPosts() {
    displayBlogPosts();
}

function displayBlogPosts() {
    const blogContainer = document.getElementById('blog-posts');
    if (!blogContainer) return;

    const postsToShow = blogPosts.slice(0, currentPostsDisplayed);
    
    blogContainer.innerHTML = postsToShow.map(post => `
        <article class="blog-card" data-category="${post.category}">
            <div class="blog-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
                <div class="blog-category">${post.category}</div>
            </div>
            <div class="blog-content">
                <div class="blog-meta">
                    <span class="blog-date">${formatDate(post.date)}</span>
                    <span class="blog-keywords">${post.keywords.slice(0, 2).join(', ')}</span>
                </div>
                <h3 class="blog-title">${post.title}</h3>
                <p class="blog-excerpt">${post.excerpt}</p>
                <div class="blog-footer">
                    <button class="btn btn-outline" onclick="readMore(${post.id})">Read More</button>
                    <div class="blog-share">
                        <button onclick="sharePost(${post.id}, 'whatsapp')" title="Share on WhatsApp">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                        <button onclick="sharePost(${post.id}, 'facebook')" title="Share on Facebook">
                            <i class="fab fa-facebook"></i>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    `).join('');
}

function loadMorePosts() {
    currentPostsDisplayed = Math.min(currentPostsDisplayed + 6, blogPosts.length);
    displayBlogPosts();
    
    if (currentPostsDisplayed >= blogPosts.length) {
        const loadMoreBtn = document.querySelector('.blog-pagination button');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
        }
    }
}



function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function readMore(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;

    // Create modal or expand content
    showPostModal(post);
}

function showPostModal(post) {
    const modal = document.createElement('div');
    modal.className = 'blog-modal';
    modal.innerHTML = `
        <div class="blog-modal-content">
            <div class="blog-modal-header">
                <h2>${post.title}</h2>
                <button class="blog-modal-close" onclick="closePostModal()">&times;</button>
            </div>
            <div class="blog-modal-body">
                <img src="${post.image}" alt="${post.title}" class="blog-modal-image">
                <div class="blog-modal-meta">
                    <span class="blog-date">${formatDate(post.date)}</span>
                    <span class="blog-category">${post.category}</span>
                </div>
                <div class="blog-modal-text">
                    <p>${post.content}</p>
                    <div class="blog-keywords">
                        <strong>Related Keywords:</strong> ${post.keywords.join(', ')}
                    </div>
                </div>
                <div class="blog-modal-footer">
                    <button class="btn btn-primary" onclick="openWhatsApp('I am interested in ${post.title}')">Contact Us About This</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function closePostModal() {
    const modal = document.querySelector('.blog-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

function sharePost(postId, platform) {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;

    const url = encodeURIComponent(window.location.href + '#blog');
    const text = encodeURIComponent(post.title + ' - ' + post.excerpt);

    let shareUrl = '';
    switch (platform) {
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${text} ${url}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
            break;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

function scrollToPost(postId) {
    document.getElementById('blog').scrollIntoView({ behavior: 'smooth' });
    // Highlight the specific post
    setTimeout(() => {
        const postCards = document.querySelectorAll('.blog-card');
        postCards.forEach((card, index) => {
            if (index === postId - 1) {
                card.style.border = '2px solid #e74c3c';
                setTimeout(() => {
                    card.style.border = '';
                }, 3000);
            }
        });
    }, 1000);
}

console.log('%c🏠 Welcome to Estate Nama! 🏠', 'color: #e74c3c; font-size: 20px; font-weight: bold;');
console.log('%cYour trusted real estate partner in Pakistan', 'color: #2c3e50; font-size: 14px;');
console.log('%cContact us: info@estatenama.com | 03195547788', 'color: #666; font-size: 12px;');