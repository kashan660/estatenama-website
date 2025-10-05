// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeNavigation();
    initializeScrollAnimations();
    initializeProjectModals();
    initializeContactForm();
    initializeStatsCounter();
    initializeLazyLoading();
    initializeSmoothScrolling();
});

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

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
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Add fade-in class to elements
    const animatedElements = document.querySelectorAll('.project-card, .amenity-item, .reason-item, .stat-item');
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// Project modal functionality
function initializeProjectModals() {
    const modal = document.getElementById('projectModal');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = document.querySelector('.close');

    // Project data
    const projectData = {
        'ring-road': {
            title: 'Ring Road Block',
            image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'Premium residential plots strategically located near the upcoming Rawalpindi Ring Road, offering excellent connectivity and investment potential.',
            features: [
                'Strategic location near Ring Road',
                'Excellent connectivity to major highways',
                'High investment potential',
                'Modern infrastructure',
                'Gated community security',
                'Wide roads and proper drainage'
            ],
            plotSizes: ['5 Marla', '7 Marla', '10 Marla', '1 Kanal'],
            amenities: ['24/7 Security', 'Underground Utilities', 'Parks & Green Spaces', 'Commercial Area']
        },
        'executive-homes': {
            title: 'Executive Homes',
            image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'Luxury residential plots designed for executives and professionals, featuring premium amenities and modern infrastructure.',
            features: [
                '7 & 10 Marla premium plots',
                'Executive-class amenities',
                'Modern infrastructure',
                'Prime location',
                'High-end community',
                '40% development completed'
            ],
            plotSizes: ['7 Marla', '10 Marla'],
            amenities: ['Executive Club', 'Premium Security', 'Landscaped Gardens', 'Commercial Center']
        },
        'eco-smart': {
            title: 'Eco Smart Model Block',
            image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'Environmentally friendly smart homes featuring sustainable technology and eco-conscious design for modern living.',
            features: [
                'Eco-friendly design',
                'Smart home technology',
                'Sustainable materials',
                'Energy-efficient systems',
                'Green building standards',
                'Environmental conservation'
            ],
            plotSizes: ['5 Marla', '7 Marla', '10 Marla'],
            amenities: ['Solar Panels', 'Rainwater Harvesting', 'Smart Utilities', 'Green Spaces']
        },
        'overseas': {
            title: 'Overseas Block',
            image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'Specially designed for overseas Pakistani investors with dual access points and solar park facilities.',
            features: [
                'Dual access points (Adyala & Chakri Road)',
                'Overseas investor friendly',
                'Solar park facility',
                'Scenic Jawa Dam access',
                'Transparent process',
                'Global investment opportunity'
            ],
            plotSizes: ['5 Marla', '7 Marla', '10 Marla', '1 Kanal'],
            amenities: ['Solar Park', 'Dual Access', 'Dam Views', 'International Standards']
        },
        'high-point': {
            title: 'High Point Commercial',
            image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'Premium commercial plots offering excellent business opportunities with high ROI potential.',
            features: [
                '8 Marla commercial plots',
                'High ROI potential',
                'Strategic business location',
                'Modern commercial infrastructure',
                'Easy accessibility',
                'Growing commercial hub'
            ],
            plotSizes: ['8 Marla Commercial'],
            amenities: ['Commercial Infrastructure', 'Parking Facilities', 'Business Center', 'High Visibility']
        },
        'h-block': {
            title: 'H-Block',
            image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: 'Latest addition to the master plan featuring modern living destination with top-tier infrastructure.',
            features: [
                'Latest block launch',
                'Modern infrastructure',
                'Near central mosque',
                'Commercial center proximity',
                'Ring Road access',
                'Premium residential zone'
            ],
            plotSizes: ['5 Marla', '7 Marla', '10 Marla'],
            amenities: ['Central Mosque', 'Commercial Center', 'Modern Infrastructure', 'Security']
        }
    };

    // Close modal functionality
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Make openProjectModal globally available
    window.openProjectModal = function(projectId) {
        const project = projectData[projectId];
        if (!project || !modal || !modalContent) return;

        const modalHTML = `
            <div style="padding: 40px;">
                <h2 style="color: #2c5530; margin-bottom: 20px; font-size: 2rem;">${project.title}</h2>
                <img src="${project.image}" alt="${project.title}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 10px; margin-bottom: 20px;">
                
                <p style="font-size: 1.1rem; line-height: 1.6; color: #666; margin-bottom: 30px;">${project.description}</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; margin-bottom: 30px;">
                    <div>
                        <h3 style="color: #2c5530; margin-bottom: 15px; font-size: 1.3rem;">Key Features</h3>
                        <ul style="list-style: none; padding: 0;">
                            ${project.features.map(feature => `
                                <li style="margin-bottom: 8px; display: flex; align-items: center;">
                                    <i class="fas fa-check-circle" style="color: #2c5530; margin-right: 10px;"></i>
                                    ${feature}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div>
                        <h3 style="color: #2c5530; margin-bottom: 15px; font-size: 1.3rem;">Plot Sizes</h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
                            ${project.plotSizes.map(size => `
                                <span style="background: #f8f9fa; color: #2c5530; padding: 8px 15px; border-radius: 20px; font-weight: 500;">${size}</span>
                            `).join('')}
                        </div>
                        
                        <h3 style="color: #2c5530; margin-bottom: 15px; font-size: 1.3rem;">Amenities</h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                            ${project.amenities.map(amenity => `
                                <span style="background: #2c5530; color: white; padding: 8px 15px; border-radius: 20px; font-weight: 500;">${amenity}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="ruden-enclave-details.html" 
                       style="background: linear-gradient(45deg, #ff6b35, #f7931e); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; transition: all 0.3s ease; margin-right: 15px;">
                        Get More Information
                    </a>
                    <a href="#contact" onclick="closeModal(); document.getElementById('project').value='${projectId}'; document.getElementById('contactForm').scrollIntoView({behavior: 'smooth'});" 
                       style="background: linear-gradient(45deg, #2c5530, #4caf50); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; transition: all 0.3s ease;">
                        Quick Contact
                    </a>
                </div>
            </div>
        `;

        modalContent.innerHTML = modalHTML;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };
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
            
            // Basic validation
            if (!data.name || !data.email || !data.phone) {
                showMessage('Please fill in all required fields.', 'error');
                return;
            }
            
            if (!isValidEmail(data.email)) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }
            
            // Simulate form submission
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                showMessage('Thank you! Your message has been sent successfully. We will contact you soon.', 'success');
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        padding: 15px;
        margin: 20px 0;
        border-radius: 5px;
        font-weight: 500;
        ${type === 'success' ? 
            'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 
            'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
        }
    `;
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.appendChild(messageDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Stats counter animation
function initializeStatsCounter() {
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number').forEach(stat => {
        statsObserver.observe(stat);
    });
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 20);
}

// Lazy loading for images
function initializeLazyLoading() {
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                
                img.onload = function() {
                    img.style.opacity = '1';
                };
                
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Smooth scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Project card hover effects
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

// Performance optimization
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
    // Handle scroll events here if needed
}, 10);

window.addEventListener('scroll', optimizedScrollHandler);

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

// Analytics tracking (placeholder)
function trackEvent(eventName, eventData) {
    // Implement analytics tracking here
    console.log('Event tracked:', eventName, eventData);
}

// Track project interest
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('view-details-btn')) {
        const projectCard = e.target.closest('.project-card');
        const projectId = projectCard ? projectCard.getAttribute('data-project') : 'unknown';
        trackEvent('project_interest', { project: projectId });
    }
});

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isValidEmail,
        showMessage,
        animateCounter
    };
}