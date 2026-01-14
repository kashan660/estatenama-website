# EstateNama Admin Panel - Production Deployment Guide

## 🚀 Live Website Deployment Instructions

### **Prerequisites**
- Node.js 16+ installed on your server
- Domain: estatenama.com
- Server with SSH access
- PM2 for process management
- Nginx for reverse proxy

---

## **Step 1: Server Setup**

### **Install Required Software**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install additional security packages
npm install helmet express-rate-limit express-mongo-sanitize jsonwebtoken
```

---

## **Step 2: Upload Files to Server**

### **Using SCP/SFTP**
```bash
# Upload entire project to /var/www/estatenama.com
scp -r d:\estatenama.com user@your-server:/var/www/estatenama.com
```

### **Set Proper Permissions**
```bash
ssh user@your-server
sudo chown -R www-data:www-data /var/www/estatenama.com
sudo chmod -R 755 /var/www/estatenama.com
sudo chmod -R 775 /var/www/estatenama.com/admin-data
sudo chmod -R 775 /var/www/estatenama.com/uploads
```

---

## **Step 3: Production Environment Configuration**

### **Create Environment Variables**
Create `/var/www/estatenama.com/.env` file:
```bash
# Server Configuration
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-immediately

# Admin Credentials (Change these!)
ADMIN_PASSWORD=your-secure-admin-password
ESTATENAMA_PASSWORD=your-secure-estatenama-password

# File Paths
UPLOAD_PATH=/var/www/estatenama.com/uploads/
DATA_DIR=/var/www/estatenama.com/admin-data/

# Domain Configuration
DOMAIN=estatenama.com
ADMIN_SUBDOMAIN=admin.estatenama.com
```

---

## **Step 4: Nginx Configuration**

### **Main Website Configuration**
Create `/etc/nginx/sites-available/estatenama.com`:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name estatenama.com www.estatenama.com;
    
    root /var/www/estatenama.com;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Main website
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Admin panel (path-based)
    location /admin {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Admin API
    location /api/admin {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **Admin Subdomain Configuration (Alternative)**
Create `/etc/nginx/sites-available/admin.estatenama.com`:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name admin.estatenama.com;
    
    # Admin panel security
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Additional security for admin panel
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    }
}
```

### **Enable Sites**
```bash
# For path-based admin
sudo ln -s /etc/nginx/sites-available/estatenama.com /etc/nginx/sites-enabled/

# For subdomain-based admin (optional)
sudo ln -s /etc/nginx/sites-available/admin.estatenama.com /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t
sudo systemctl reload nginx
```

---

## **Step 5: SSL Certificate (HTTPS)**

### **Using Let's Encrypt (Free)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d estatenama.com -d www.estatenama.com

# For admin subdomain (if using)
sudo certbot --nginx -d admin.estatenama.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## **Step 6: Start Admin Server with PM2**

### **Create PM2 Ecosystem File**
Create `/var/www/estatenama.com/ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'estatenama-admin',
    script: 'admin-server-prod.js',
    cwd: '/var/www/estatenama.com',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/estatenama-admin-error.log',
    out_file: '/var/log/pm2/estatenama-admin-out.log',
    log_file: '/var/log/pm2/estatenama-admin-combined.log',
    time: true
  }]
};
```

### **Start the Admin Server**
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u your-user --hp /home/your-user

# Monitor logs
pm2 logs estatenama-admin

# Check status
pm2 status
```

---

## **Step 7: Security Hardening**

### **Change Default Credentials**
1. Access your admin panel at `https://admin.estatenama.com` or `https://estatenama.com/admin`
2. Login with default credentials
3. **Immediately change all passwords** in the settings

### **Additional Security Measures**
```bash
# Install fail2ban for brute force protection
sudo apt install fail2ban -y

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Regular security updates
sudo apt update && sudo apt upgrade -y
```

---

## **Step 8: Testing**

### **Verify Everything Works**
1. **Main Website:** https://estatenama.com
2. **Admin Login:** https://admin.estatenama.com or https://estatenama.com/admin
3. **Admin Dashboard:** Check all CRUD operations work
4. **Image Uploads:** Test file uploads
5. **SSL Certificate:** Verify HTTPS is working

### **Performance Testing**
```bash
# Test website speed
curl -o /dev/null -s -w "Total: %{time_total}s\n" https://estatenama.com

# Test admin panel
curl -o /dev/null -s -w "Total: %{time_total}s\n" https://admin.estatenama.com
```

---

## **Step 9: Monitoring & Maintenance**

### **Setup Monitoring**
```bash
# Install monitoring tools
npm install -g pm2-logrotate
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### **Backup Strategy**
```bash
# Create backup script
sudo nano /var/www/backup.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/estatenama"
mkdir -p $BACKUP_DIR

# Backup admin data
tar -czf $BACKUP_DIR/admin-data-$DATE.tar.gz /var/www/estatenama.com/admin-data/

# Backup uploads
tar -czf $BACKUP_DIR/uploads-$DATE.tar.gz /var/www/estatenama.com/uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Make executable:
```bash
sudo chmod +x /var/www/backup.sh

# Add to crontab for daily backups
sudo crontab -e
# Add: 0 2 * * * /var/www/backup.sh
```

---

## **🎯 Final URLs**

After successful deployment:

- **Main Website:** https://estatenama.com
- **Admin Panel:** https://admin.estatenama.com (or https://estatenama.com/admin)
- **Admin Login:** https://admin.estatenama.com/admin-login.html

**Default Credentials (Change Immediately!):**
- Username: `admin` | Password: `admin123`
- Username: `estatenama` | Password: `estate2024`

---

## **🆘 Troubleshooting**

### **Common Issues:**
1. **Port 3000 already in use:** Change PORT in `.env` file
2. **Permission denied:** Check file permissions with `ls -la`
3. **Nginx errors:** Check logs with `sudo nginx -t` and `sudo tail -f /var/log/nginx/error.log`
4. **PM2 not starting:** Check logs with `pm2 logs estatenama-admin`

### **Support:**
If you encounter issues, check:
- PM2 logs: `pm2 logs`
- Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Application logs: `pm2 logs estatenama-admin`

---

**🎉 Your EstateNama admin dashboard is now ready for live deployment with full CRUD capabilities!**