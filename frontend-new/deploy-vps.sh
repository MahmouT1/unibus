#!/bin/bash

# Deployment script for VPS
echo "🚀 Deploying UniBus Student Portal to VPS..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ if not installed
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB if not installed
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 for process management
sudo npm install -g pm2

# Install project dependencies
npm install

# Build the project
npm run build

# Start with PM2
pm2 start npm --name "unibus-portal" -- start

# Install Nginx for reverse proxy
sudo apt install -y nginx

# Configure Nginx
sudo tee /etc/nginx/sites-available/unibus << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/unibus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL certificate (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
# sudo certbot --nginx -d your-domain.com -d www.your-domain.com

echo "✅ Deployment complete!"
echo "📋 Your app is running on: http://your-domain.com"
echo "🎥 Camera will work properly on HTTPS with real domain"
