// Bahria Town Phase 8 JavaScript Functionality

// Project Data
const projectsData = {
    'residential-plots': {
        title: 'Residential Plots',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Premium residential plots in various sectors of Bahria Town Phase 8 with modern infrastructure and world-class amenities.',
        features: [
            'Multiple plot sizes: 5 Marla, 10 Marla, 1 Kanal',
            'Wide roads with proper drainage system',
            'Underground utilities (electricity, gas, water)',
            '24/7 security and gated community',
            'Parks and green spaces in every sector',
            'Proximity to schools, hospitals, and shopping areas'
        ],
        sectors: [
            { name: 'Sector A', sizes: '10 Marla, 1 Kanal', price: 'PKR 1.2 Crore onwards' },
            { name: 'Sector B', sizes: '10 Marla, 1 Kanal', price: 'PKR 1.1 Crore onwards' },
            { name: 'Sector C', sizes: '5 Marla, 10 Marla', price: 'PKR 50 Lac onwards' },
            { name: 'Sector E', sizes: '10 Marla, 1 Kanal', price: 'PKR 1.3 Crore onwards' }
        ],
        amenities: ['Golf Course Access', 'International Hospital', 'Premium Schools', 'Shopping Centers'],
        priceRange: 'Starting from PKR 50 Lac',
        paymentPlan: 'Flexible installment plans available with easy terms'
    },
    'ready-houses': {
        title: 'Ready Houses',
        image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Luxury ready-to-move-in houses with modern architecture, premium finishes, and contemporary design.',
        features: [
            'Multiple sizes: 5, 7, 10, 20 Marla houses',
            'Modern architectural design',
            'Premium quality construction materials',
            'Fully finished with contemporary interiors',
            'Private parking and garden space',
            'Ready for immediate possession'
        ],
        sectors: [
            { name: '5 Marla Houses', sizes: '3-4 Bedrooms', price: 'PKR 1.5 Crore onwards' },
            { name: '7 Marla Houses', sizes: '4-5 Bedrooms', price: 'PKR 2.2 Crore onwards' },
            { name: '10 Marla Houses', sizes: '5-6 Bedrooms', price: 'PKR 3.5 Crore onwards' },
            { name: '20 Marla Houses', sizes: '6-8 Bedrooms', price: 'PKR 7 Crore onwards' }
        ],
        amenities: ['Luxury Finishes', 'Modern Kitchen', 'Master Bedrooms', 'Private Gardens'],
        priceRange: 'Starting from PKR 1.5 Crore',
        paymentPlan: 'Bank financing available with competitive rates'
    },
    'commercial-plots': {
        title: 'Commercial Plots',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Prime commercial plots strategically located on main boulevards with high business potential and excellent ROI.',
        features: [
            'Located on 160ft Main Boulevard',
            'High-rise commercial development allowed',
            'Excellent connectivity and accessibility',
            'High footfall and business potential',
            'Modern infrastructure and utilities',
            'Ideal for retail, offices, and mixed-use development'
        ],
        sectors: [
            { name: 'Main Boulevard', sizes: 'Various sizes', price: 'PKR 2 Crore onwards' },
            { name: 'Commercial Hub', sizes: 'Corner plots available', price: 'PKR 3 Crore onwards' },
            { name: 'Business Center', sizes: 'Premium locations', price: 'PKR 5 Crore onwards' }
        ],
        amenities: ['Main Boulevard Location', 'High-Rise Development', 'Business Hub', 'Premium Access'],
        priceRange: 'Starting from PKR 2 Crore',
        paymentPlan: 'Commercial financing options with flexible terms'
    },
    'awami-villas': {
        title: 'Awami Villas',
        image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Affordable luxury villas designed to cater to growing home needs with modern amenities and prime location.',
        features: [
            'Affordable luxury housing option',
            'Modern villa design and architecture',
            'All essential amenities included',
            'Prime location within Phase 8',
            'Community living environment',
            'Easy access to all facilities'
        ],
        sectors: [
            { name: 'Villa Block A', sizes: '3-4 Bedrooms', price: 'PKR 80 Lac onwards' },
            { name: 'Villa Block B', sizes: '4-5 Bedrooms', price: 'PKR 1.2 Crore onwards' },
            { name: 'Villa Block C', sizes: '2-3 Bedrooms', price: 'PKR 60 Lac onwards' }
        ],
        amenities: ['Affordable Luxury', 'Modern Design', 'Community Living', 'All Facilities'],
        priceRange: 'Starting from PKR 80 Lac',
        paymentPlan: 'Easy installment plans with minimal down payment'
    },
    'phase8-extension': {
        title: 'Phase 8 Extension',
        image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Latest extension of Phase 8 with modern amenities, future Ring Road connectivity, and excellent investment potential.',
        features: [
            'Latest development with modern planning',
            'Future Ring Road connectivity',
            'Six well-planned sectors',
            'Multiple plot size options',
            'Modern infrastructure development',
            'Excellent investment opportunity'
        ],
        sectors: [
            { name: 'Extension Sector 1', sizes: '5, 8, 10 Marla', price: 'PKR 45 Lac onwards' },
            { name: 'Extension Sector 2', sizes: '10 Marla, 1 Kanal', price: 'PKR 80 Lac onwards' },
            { name: 'Extension Sector 3', sizes: '5, 10 Marla', price: 'PKR 50 Lac onwards' },
            { name: 'Extension Sector 4', sizes: '8, 10 Marla, 1 Kanal', price: 'PKR 70 Lac onwards' }
        ],
        amenities: ['Ring Road Access', 'Modern Planning', 'Investment Potential', 'Future Development'],
        priceRange: 'Starting from PKR 45 Lac',
        paymentPlan: 'Attractive payment plans with development-linked installments'
    },
    'sectors-ag': {
        title: 'Sectors A, B, C, E, F, G',
        image: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Fully developed sectors with established infrastructure, mature community, and premium living standards.',
        features: [
            'Fully developed and established sectors',
            'Mature community with all amenities',
            'Premium infrastructure and utilities',
            'Established schools, hospitals, and shopping',
            'High property appreciation',
            'Ready for immediate construction'
        ],
        sectors: [
            { name: 'Sector A', sizes: '10 Marla, 1 Kanal', price: 'PKR 1.2 Crore onwards' },
            { name: 'Sector B', sizes: '10 Marla, 1 Kanal', price: 'PKR 1.1 Crore onwards' },
            { name: 'Sector C', sizes: '5, 10 Marla', price: 'PKR 80 Lac onwards' },
            { name: 'Sector E', sizes: '10 Marla, 1 Kanal', price: 'PKR 1.3 Crore onwards' },
            { name: 'Sector F', sizes: '10 Marla, 1 Kanal', price: 'PKR 1.4 Crore onwards' },
            { name: 'Sector G', sizes: '5, 10 Marla', price: 'PKR 90 Lac onwards' }
        ],
        amenities: ['Established Community', 'All Amenities', 'Premium Location', 'High Appreciation'],
        priceRange: 'Starting from PKR 1.2 Crore',
        paymentPlan: 'Bank financing and installment options available'
    }
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeScrollAnimations();
    initializeStatsCounter();
    initializeLazyLoading();
    initializeContactForm();
    initializeModal();
    initializeSmoothScrolling();
});

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Dropdown menu functionality
    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            dropdownMenu.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
    }

    // Close mobile menu when clicking on links
    const navLinks = document.querySelectorAll('.nav-link, .dropdown-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
            dropdownMenu?.classList.remove('active');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    });
}

// Scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.project-card, .amenity-item, .reason-item, .highlight-item, .contact-item');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Stats counter animation
function initializeStatsCounter() {
    const statsSection = document.querySelector('.stats');
    let hasAnimated = false;

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                animateStats();
            }
        });
    }, { threshold: 0.5 });

    if (statsSection) {
        observer.observe(statsSection);
    }
}

function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current);
        }, 16);
    });
}

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Contact form functionality
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Validate form
            if (validateForm(data)) {
                // Simulate form submission
                submitForm(data);
            }
        });
    }
}

function validateForm(data) {
    const requiredFields = ['name', 'email', 'phone'];
    const errors = [];

    requiredFields.forEach(field => {
        if (!data[field] || data[field].trim() === '') {
            errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        }
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
        errors.push('Please enter a valid email address');
    }

    // Phone validation
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (data.phone && !phoneRegex.test(data.phone)) {
        errors.push('Please enter a valid phone number');
    }

    if (errors.length > 0) {
        alert('Please fix the following errors:\n' + errors.join('\n'));
        return false;
    }

    return true;
}

function submitForm(data) {
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        alert('Thank you for your inquiry! We will contact you soon.');
        document.getElementById('contactForm').reset();
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Modal functionality
function initializeModal() {
    const modal = document.getElementById('projectModal');
    const closeBtn = document.querySelector('.close');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function openProjectModal(projectId) {
    const modal = document.getElementById('projectModal');
    const modalContent = document.getElementById('modalContent');
    const project = projectsData[projectId];

    if (!project) return;

    modalContent.innerHTML = `
        <div class="modal-header">
            <img src="${project.image}" alt="${project.title}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 15px 15px 0 0;">
            <div style="padding: 30px;">
                <h2 style="color: #1a365d; margin-bottom: 15px; font-size: 2rem;">${project.title}</h2>
                <p style="color: #64748b; font-size: 1.1rem; line-height: 1.6; margin-bottom: 30px;">${project.description}</p>
            </div>
        </div>
        
        <div style="padding: 0 30px 30px;">
            <div style="margin-bottom: 30px;">
                <h3 style="color: #1a365d; margin-bottom: 15px; font-size: 1.4rem;">Key Features</h3>
                <ul style="list-style: none; padding: 0;">
                    ${project.features.map(feature => `
                        <li style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #e2e8f0;">
                            <i class="fas fa-check" style="color: #ffd700; margin-right: 10px;"></i>
                            ${feature}
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h3 style="color: #1a365d; margin-bottom: 15px; font-size: 1.4rem;">Available Options</h3>
                <div style="display: grid; gap: 15px;">
                    ${project.sectors.map(sector => `
                        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #ffd700;">
                            <h4 style="color: #1a365d; margin-bottom: 8px; font-size: 1.1rem;">${sector.name}</h4>
                            <p style="color: #64748b; margin-bottom: 5px; font-size: 0.95rem;">Sizes: ${sector.sizes}</p>
                            <p style="color: #1a365d; font-weight: 600; font-size: 1rem;">${sector.price}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h3 style="color: #1a365d; margin-bottom: 15px; font-size: 1.4rem;">Amenities</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${project.amenities.map(amenity => `
                        <span style="background: linear-gradient(45deg, #ffd700, #ffed4e); color: #1a365d; padding: 8px 15px; border-radius: 20px; font-size: 0.9rem; font-weight: 600;">
                            ${amenity}
                        </span>
                    `).join('')}
                </div>
            </div>
            
            <div style="background: linear-gradient(45deg, #1a365d, #2d5a87); color: white; padding: 25px; border-radius: 15px; text-align: center;">
                <h3 style="margin-bottom: 10px; font-size: 1.3rem;">Price Range</h3>
                <p style="font-size: 1.5rem; font-weight: 700; margin-bottom: 15px;">${project.priceRange}</p>
                <p style="font-size: 1rem; opacity: 0.9;">${project.paymentPlan}</p>
                <div style="margin-top: 20px;">
                    <a href="#contact" onclick="closeModal()" style="background: #ffd700; color: #1a365d; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: 600; display: inline-block; transition: all 0.3s ease;">
                        Get More Information
                    </a>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Smooth scrolling
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Performance optimizations
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

// Optimized scroll handler
const optimizedScrollHandler = debounce(function() {
    // Handle scroll-based animations here if needed
}, 16);

window.addEventListener('scroll', optimizedScrollHandler);

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: slideInUp 0.6s ease forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .navbar.scrolled {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 20px rgba(0,0,0,0.1);
    }
    
    .navbar.scrolled .nav-logo h2,
    .navbar.scrolled .nav-link {
        color: #1a365d;
    }
    
    .lazy {
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .lazy.loaded {
        opacity: 1;
    }
`;

document.head.appendChild(style);