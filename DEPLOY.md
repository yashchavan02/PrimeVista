# Deployment Guide for PrimeVista on AWS EC2

## Prerequisites
- AWS Account
- GitHub repository with your code
- Domain name (optional, for HTTPS)

---

## AWS Console Setup

### 1. Launch EC2 Instance
1. Go to **AWS Console** → **EC2** → **Launch Instance**
2. Choose: **Ubuntu 22.04 LTS**
3. Instance type: **t3.medium** (recommended) or t2.micro
4. Create key pair (download and save securely)
5. Network Settings:
   - VPC: Default
   - Subnet: Public subnet
   - Auto-assign public IP: **Enable**
6. Security Group - Add rules:
   - SSH (port 22) - Your IP
   - HTTP (port 80) - Anywhere (0.0.0.0/0)
   - HTTPS (port 443) - Anywhere (0.0.0.0/0)
7. Launch instance

### 2. Note Your Public IP
- Copy the **Public IPv4 address** (e.g., 15.207.185.62)

---

## Local Machine: Prepare Code

### 1. Update Frontend Environment
Create/update `frontend/.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://YOUR_EC2_IP/api
```

### 2. Build Frontend
```bash
cd frontend
npm install
npm run build
```

### 3. Push to GitHub
```bash
git add .
git commit -m "Production deployment ready"
git push origin main
```

---

## EC2 Instance: Deployment

### 1. Connect to EC2
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### 2. Update System Packages
```bash
sudo apt update
sudo apt upgrade -y
```

### 3. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```

### 4. Install FFmpeg (for video processing)
```bash
sudo apt install ffmpeg
ffmpeg -version
```

### 5. Install Nginx
```bash
sudo apt install nginx
sudo systemctl enable nginx
```

### 6. Clone Repository
```bash
cd ~
git clone https://github.com/your-username/PrimeVista.git
cd PrimeVista
```

### 7. Create Backend Environment File
```bash
cd backend
nano .env
```

Add these variables:
```
PORT=3000
NODE_ENV=production
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
S3_RAW_BUCKET=your-raw-bucket
S3_HLS_BUCKET=your-hls-bucket
CLOUDFRONT_BASE_URL=https://your-cloudfront.cloudfront.net
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

### 8. Create Frontend Environment File
```bash
cd ../frontend
nano .env
```

Add these variables:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://YOUR_EC2_IP/api
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

### 9. Install Backend Dependencies
```bash
cd ../backend
npm install --production
```

### 10. Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 --version
```

### 11. Start Backend Server
```bash
pm2 start src/index.js --name primevista
pm2 status
pm2 logs primevista
```

### 12. Auto-start on Reboot
```bash
pm2 startup
# Copy and run the command shown in output
pm2 save
```

### 13. Install Frontend Dependencies and Build
```bash
cd ../frontend
npm install
npm run build
```

### 14. Fix File Permissions
```bash
sudo chown -R www-data:www-data /home/ubuntu/PrimeVista/frontend/dist
sudo chmod -R 755 /home/ubuntu/PrimeVista/frontend/dist
sudo chmod 755 /home/ubuntu
sudo chmod 755 /home/ubuntu/PrimeVista
sudo chmod 755 /home/ubuntu/PrimeVista/frontend
```

### 15. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/primevista
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name YOUR_EC2_IP;

    # Frontend static files
    location / {
        root /home/ubuntu/PrimeVista/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000;
    }
}
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

### 16. Enable Nginx Site
```bash
sudo ln -s /etc/nginx/sites-available/primevista /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## Testing

### 1. Test Backend API
```bash
curl http://localhost:3000/health
```
Expected: `{"status":"ok","timestamp":"..."}`

### 2. Test Nginx Frontend
```bash
curl http://localhost
```
Expected: HTML page with "PrimeVista"

### 3. Test External Access
Open browser: `http://YOUR_EC2_IP`

### 4. Test API from External
```bash
curl http://YOUR_EC2_IP/api/videos
```

---

## Quick Redeploy Commands

```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Pull latest code
cd ~/PrimeVista
git pull origin main

# Rebuild frontend
cd frontend
npm install
npm run build

# Fix permissions
sudo chown -R www-data:www-data /home/ubuntu/PrimeVista/frontend/dist
sudo chmod -R 755 /home/ubuntu/PrimeVista/frontend/dist

# Restart services
pm2 restart primevista
sudo systemctl restart nginx
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection timed out | Check AWS Security Group - HTTP port 80 open to 0.0.0.0/0 |
| 500 Internal Server Error | Check nginx error log: `sudo tail -f /var/log/nginx/error.log` |
| Permission denied | Run permission fix commands from Step 14 |
| PM2 not running | `pm2 start src/index.js --name primevista` |
| Nginx not running | `sudo systemctl restart nginx` |
| Can't reach API | Check backend: `pm2 logs primevista` |

### Common Commands
```bash
# Check PM2 status
pm2 status

# View PM2 logs
pm2 logs primevista

# Restart PM2
pm2 restart primevista

# Check Nginx status
sudo systemctl status nginx

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Test API locally
curl http://localhost:3000/health

# Test Nginx locally
curl http://localhost
```

---

## Environment Variables Reference

### Backend
| Variable | Example |
|----------|---------|
| PORT | 3000 |
| NODE_ENV | production |
| AWS_ACCESS_KEY_ID | AKIA... |
| AWS_SECRET_ACCESS_KEY | xxx... |
| AWS_REGION | ap-south-1 |
| S3_RAW_BUCKET | video-streaming-raw |
| S3_HLS_BUCKET | hls-video-streaming |
| CLOUDFRONT_BASE_URL | https://xxx.cloudfront.net |
| SUPABASE_URL | https://xxx.supabase.co |
| SUPABASE_SERVICE_ROLE_KEY | eyJ... |

### Frontend
| Variable | Example |
|----------|---------|
| VITE_SUPABASE_URL | https://xxx.supabase.co |
| VITE_SUPABASE_ANON_KEY | eyJ... |
| VITE_API_BASE_URL | http://15.207.185.62/api |
