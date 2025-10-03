// Admin Authentication System
class AdminAuth {
    constructor() {
        this.redirecting = false;
        // Clear any corrupted session data that might cause loops
        this.validateAndCleanSession();
        this.init();
    }

    validateAndCleanSession() {
        try {
            const sessionData = localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                if (!session.loginTime || !session.username || !session.token) {
                    console.log('Clearing corrupted session data');
                    this.clearSession();
                }
            }
        } catch (error) {
            console.log('Clearing invalid session data');
            this.clearSession();
        }
    }

    init() {
        // Prevent multiple redirects
        if (this.redirecting) return;
        
        // Add a small delay to ensure page is fully loaded
        setTimeout(() => {
            if (this.redirecting) return;
            
            const currentPath = window.location.pathname;
            const isLoginPage = currentPath.endsWith('admin-login.html') || currentPath.endsWith('/admin-login.html');
            const isDashboardPage = currentPath.endsWith('admin-dashboard.html') || currentPath.endsWith('/admin-dashboard.html');
            
            console.log('Auth Init:', { currentPath, isLoginPage, isDashboardPage, isLoggedIn: this.isLoggedIn() });
            
            // Check if user is already logged in and on login page
            if (this.isLoggedIn() && isLoginPage) {
                console.log('Redirecting to dashboard - user is logged in');
                this.redirecting = true;
                window.location.href = 'admin-dashboard.html';
                return;
            }

            // Check if user needs to login and is on dashboard page
            if (!this.isLoggedIn() && isDashboardPage) {
                console.log('Redirecting to login - user not logged in');
                this.redirecting = true;
                window.location.href = 'admin-login.html';
                return;
            }
        }, 100);

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout button
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        submitBtn.disabled = true;

        try {
            // Call server authentication API
            const response = await fetch('http://localhost:3002/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store session with token
                const sessionData = {
                    username: username,
                    token: data.token,
                    loginTime: new Date().toISOString(),
                    rememberMe: rememberMe
                };

                if (rememberMe) {
                    localStorage.setItem('adminSession', JSON.stringify(sessionData));
                } else {
                    sessionStorage.setItem('adminSession', JSON.stringify(sessionData));
                }

                this.showNotification('Login successful! Redirecting...', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    this.redirecting = true;
                    window.location.href = 'admin-dashboard.html';
                }, 1500);
            } else {
                throw new Error(data.error || 'Invalid credentials');
            }
        } catch (error) {
            this.showNotification('Invalid username or password. Please try again.', 'error');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    validateCredentials(username, password) {
        // Simple validation (in production, use secure server-side authentication)
        const validCredentials = [
            { username: 'admin', password: 'admin123' },
            { username: 'estatenama', password: 'estate2024' },
            { username: 'manager', password: 'manager123' }
        ];

        return validCredentials.some(cred => 
            cred.username === username && cred.password === password
        );
    }

    handleLogout(e) {
        e.preventDefault();
        
        // Clear session data
        localStorage.removeItem('adminSession');
        sessionStorage.removeItem('adminSession');
        
        this.showNotification('Logged out successfully!', 'success');
        
        // Redirect to login
        setTimeout(() => {
            this.redirecting = true;
            window.location.href = 'admin-login.html';
        }, 1000);
    }

    isLoggedIn() {
        const sessionData = localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession');
        if (!sessionData) return false;

        try {
            const session = JSON.parse(sessionData);
            
            // Check if token exists
            if (!session.token) {
                this.clearSession();
                return false;
            }
            
            const loginTime = new Date(session.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

            // Session expires after 24 hours
            if (hoursDiff > 24) {
                this.clearSession();
                return false;
            }

            return true;
        } catch (error) {
            this.clearSession();
            return false;
        }
    }

    getCurrentUser() {
        const sessionData = localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession');
        if (!sessionData) return null;

        try {
            return JSON.parse(sessionData);
        } catch (error) {
            return null;
        }
    }

    clearSession() {
        localStorage.removeItem('adminSession');
        sessionStorage.removeItem('adminSession');
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.textContent = message;
        notification.className = `notification ${type} show`;

        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
}

// Password toggle functionality
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', () => {
    new AdminAuth();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminAuth;
}