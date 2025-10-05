// Ruden Enclave Details Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeContactForm();
    initializeSmoothScrolling();
    initializeAnimations();
    initializeProjectCards();
});

// Contact Form Functionality
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmission);
    }
}

function handleFormSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const project = formData.get('project');
    const message = formData.get('message');
    
    // Validate form
    if (!validateForm(name, email, phone)) {
        return;
    }
    
    // Create WhatsApp message
    const whatsappMessage = createWhatsAppMessage(name, email, phone, project, message);
    
    // Open WhatsApp
    const whatsappUrl = `https://wa.me/923195547788?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
    
    // Show success message
    showSuccessMessage();
    
    // Reset form
    e.target.reset();
}

function validateForm(name, email, phone) {
    if (!name || name.trim().length < 2) {
        showError('Please enter a valid name (at least 2 characters)');
        return false;
    }
    
    if (!email || !isValidEmail(email)) {
        showError('Please enter a valid email address');
        return false;
    }
    
    if (!phone || phone.trim().length < 10) {
        showError('Please enter a valid phone number (at least 10 digits)');
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function createWhatsAppMessage(name, email, phone, project, message) {
    let whatsappMessage = `*New Inquiry from Ruden Enclave Details Page*\n\n`;
    whatsappMessage += `*Name:* ${name}\n`;
    whatsappMessage += `*Email:* ${email}\n`;
    whatsappMessage += `*Phone:* ${phone}\n`;
    
    if (project && project !== '') {
        whatsappMessage += `*Interested in:* ${project}\n`;
    }
    
    if (message && message.trim() !== '') {
        whatsappMessage += `*Message:* ${message}\n`;
    }
    
    whatsappMessage += `\n*Source:* Ruden Enclave Details Page`;
    whatsappMessage += `\n*Time:* ${new Date().toLocaleString()}`;
    
    return whatsappMessage;
}

function showSuccessMessage() {
    // Create success message element
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <h4>Message Sent Successfully!</h4>
            <p>Thank you for your interest. We'll contact you soon.</p>
        </div>
    `;
    
    // Add styles
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4caf50, #2c5530);
        color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.5s ease;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .success-content {
            text-align: center;
        }
        .success-content i {
            font-size: 2rem;
            margin-bottom: 10px;
            display: block;
        }
        .success-content h4 {
            margin: 0 0 10px 0;
            font-size: 1.2rem;
        }
        .success-content p {
            margin: 0;
            opacity: 0.9;
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(successDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        successDiv.style.animation = 'slideInRight 0.5s ease reverse';
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 500);
    }, 5000);
}

function showError(message) {
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
    
    // Add styles
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.5s ease;
    `;
    
    // Add to page
    document.body.appendChild(errorDiv);
    
    // Remove after 4 seconds
    setTimeout(() => {
        errorDiv.style.animation = 'slideInRight 0.5s ease reverse';
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 500);
    }, 4000);
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Animations on Scroll
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.project-detail-card, .stat-card, .plan-feature, .place-item, .contact-method');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Project Cards Interaction
function initializeProjectCards() {
    const projectCards = document.querySelectorAll('.project-detail-card');
    
    projectCards.forEach(card => {
        // Add hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
        });
    });
}

// Utility Functions
function formatPrice(price) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

function formatArea(area) {
    return `${area} sq ft`;
}

// Contact Methods
function openWhatsApp(message = '') {
    const defaultMessage = message || 'Hi, I am interested in Ruden Enclave projects. Please provide more information.';
    const whatsappUrl = `https://wa.me/923195547788?text=${encodeURIComponent(defaultMessage)}`;
    window.open(whatsappUrl, '_blank');
}

function openEmail() {
    const subject = 'Inquiry about Ruden Enclave Projects';
    const body = 'Hi,\n\nI am interested in learning more about Ruden Enclave projects. Please provide detailed information.\n\nThank you.';
    const emailUrl = `mailto:info@estatenama.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl);
}

function callPhone() {
    window.open('tel:+923195547788');
}

// Quick Contact Functions
function scheduleVisit(projectName = '') {
    const message = `Hi, I would like to schedule a site visit for ${projectName || 'Ruden Enclave projects'}. Please let me know available times.`;
    openWhatsApp(message);
}

function requestBrochure(projectName = '') {
    const message = `Hi, I would like to request a detailed brochure for ${projectName || 'Ruden Enclave projects'}. Please send me the latest information.`;
    openWhatsApp(message);
}

function getInstallmentPlan(projectName = '') {
    const message = `Hi, I am interested in the installment plan for ${projectName || 'Ruden Enclave projects'}. Please provide detailed payment options.`;
    openWhatsApp(message);
}

// Navigation Enhancement
document.addEventListener('DOMContentLoaded', function() {
    // Add active state to current page in navigation
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
    
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
});

// Back to Top Button
function addBackToTopButton() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #4caf50, #2c5530);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.2rem;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    
    document.body.appendChild(backToTopBtn);
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.visibility = 'visible';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top on click
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Hover effect
    backToTopBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
    });
    
    backToTopBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
    });
}

// Initialize back to top button
document.addEventListener('DOMContentLoaded', addBackToTopButton);

// Performance optimization - Lazy loading for images
function initializeLazyLoading() {
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
document.addEventListener('DOMContentLoaded', initializeLazyLoading);