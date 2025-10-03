// Admin API Client for backend integration
class AdminAPI {
    constructor() {
        this.baseURL = 'http://localhost:3002';
        this.token = this.getStoredToken();
    }

    // Get token from session storage
    getStoredToken() {
        const sessionData = localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                return session.token;
            } catch (error) {
                console.error('Failed to parse session data:', error);
            }
        }
        return null;
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        // Update the session data with the new token
        const sessionData = localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                session.token = token;
                if (localStorage.getItem('adminSession')) {
                    localStorage.setItem('adminSession', JSON.stringify(session));
                } else {
                    sessionStorage.setItem('adminSession', JSON.stringify(session));
                }
            } catch (error) {
                console.error('Failed to update session data:', error);
            }
        }
    }

    // Get authentication headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}/api/admin${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('adminSession');
                    sessionStorage.removeItem('adminSession');
                    window.location.href = '/admin-login.html';
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication
    async login(username, password) {
        try {
            const response = await fetch(`${this.baseURL}/api/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.setToken(data.token);
                return data;
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    // Posts API
    async getPosts() {
        return await this.request('/posts');
    }

    async createPost(postData) {
        return await this.request('/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    }

    async updatePost(id, postData) {
        return await this.request(`/posts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(postData)
        });
    }

    async deletePost(id) {
        return await this.request(`/posts/${id}`, {
            method: 'DELETE'
        });
    }

    // Blogs API
    async getBlogs() {
        return await this.request('/blogs');
    }

    async createBlog(blogData) {
        return await this.request('/blogs', {
            method: 'POST',
            body: JSON.stringify(blogData)
        });
    }

    async updateBlog(id, blogData) {
        return await this.request(`/blogs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(blogData)
        });
    }

    async deleteBlog(id) {
        return await this.request(`/blogs/${id}`, {
            method: 'DELETE'
        });
    }

    // Images API
    async getImages() {
        return await this.request('/images');
    }

    async uploadImages(formData) {
        const headers = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${this.baseURL}/api/admin/images/upload`, {
                method: 'POST',
                headers: headers,
                body: formData
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('adminSession');
                    sessionStorage.removeItem('adminSession');
                    window.location.href = '/admin-login.html';
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Image upload failed:', error);
            throw error;
        }
    }

    async deleteImage(id) {
        return await this.request(`/images/${id}`, {
            method: 'DELETE'
        });
    }

    // Projects API
    async getProjects() {
        return this.request('/projects');
    }

    async createProject(projectData) {
        return this.request('/projects', {
            method: 'POST',
            body: JSON.stringify(projectData)
        });
    }

    async updateProject(id, projectData) {
        return this.request(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(projectData)
        });
    }

    async deleteProject(id) {
        return this.request(`/projects/${id}`, {
            method: 'DELETE'
        });
    }

    // Settings API
    async getSettings() {
        return await this.request('/settings');
    }

    async updateSettings(settingsData) {
        return await this.request('/settings', {
            method: 'PUT',
            body: JSON.stringify(settingsData)
        });
    }

    // Statistics API
    async getStats() {
        return await this.request('/stats');
    }
}

// Export for use in other files
window.AdminAPI = AdminAPI;