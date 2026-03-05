# Deployment Guide for PrimeVista on AWS EC2

## Prerequisites
- AWS Account
- Domain name (optional, for HTTPS)
- GitHub repository with your code

---

## Step 1: Configure Environment Variables

### Backend (.env)
Create `backend/.env` with these variables:
```
PORT=3000
NODE_ENV=production

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_iam_access_key
AWS_SECRET_ACCESS_KEY=your_aws_iam_secret_key
AWS_REGION=ap-south-1
S3_RAW_BUCKET=your-raw-video-bucket
S3_HLS_BUCKET=your-hls-output-bucket
CLOUDFRONT_BASE_URL=https://your-cloudfront-distribution.cloudfront.net

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Frontend (.env)
Create `frontend/.env` with these variables:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://15.207.185.62/api
```

---

## Step 2: Build Frontend

```bash
cd frontend
npm install
npm run build
```

The built files will be in `frontend/dist/`

---

## Step 3: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose: **Ubuntu 22.04 LTS** (Free tier eligible)
3. Instance type: **t3.medium** (recommended) or t2.micro
4. Create key pair (download and save securely)
5. Security Group:
   - SSH (port 22) - Your IP
   - HTTP (port 80) - Anywhere
   - HTTPS (port 443) - Anywhere
6. Launch instance

---

## Step 4: Connect to EC2

```bash
ssh -i your-key.pem ubuntu@15.207.185.62
```

---

## Step 5: Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```

---

## Step 6: Install FFmpeg (for video processing)

```bash
sudo apt update
sudo apt install ffmpeg
ffmpeg -version
```

---

## Step 7: Upload Code to EC2

### Option A: Using Git (Recommended)
```bash
# On EC2
cd ~
git clone https://github.com/your-username/video-streaming.git
cd video-streaming
```

### Option B: Using SCP
```bash
# On local machine
scp -r -i your-key.pem "C:\path\to\video-streaming" ubuntu@15.207.185.62:~/
```

---

## Step 8: Install Backend Dependencies

```bash
cd ~/video-streaming/backend
npm install --production
```

---

## Step 9: Configure Backend Environment

```bash
cd ~/video-streaming/backend
nano .env
```

Paste your backend environment variables. Save and exit (Ctrl+O, Enter, Ctrl+X)

---

## Step 10: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
pm2 --version
```

---

## Step 11: Start Backend Server

```bash
cd ~/video-streaming/backend
pm2 start src/index.js --name primevista

# Verify it's running
pm2 status
pm2 logs primevista
```

---

## Step 12: Auto-start on Reboot

```bash
pm2 startup
# Follow the output instructions (copy the command it shows)
pm2 save
```

---

## Step 13: Set Up Nginx

```bash
sudo apt update
sudo apt install nginx
```

Create Nginx config:
```bash
sudo nano /etc/nginx/sites-available/primevista
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name 15.207.185.62;

    # Frontend static files
    location / {
        root /home/ubuntu/video-streaming/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        $http_upgrade proxy_set_header Upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket support for video uploads
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/primevista /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 14: Access Your App

Open browser: `http://15.207.185.62`

---

## Important Configuration Checklist

- [ ] S3 buckets created with CORS enabled
- [ ] CloudFront distribution created pointing to S3_HLS_BUCKET
- [ ] Supabase project created with tables (videos, users)
- [ ] Supabase RLS policies configured
- [ ] EC2 IP added to Supabase allowed domains (if needed)
- [ ] Environment variables set in backend/.env

---

## Environment Variables Reference

### Backend
| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 3000) |
| NODE_ENV | Set to "production" |
| AWS_ACCESS_KEY_ID | AWS IAM user access key |
| AWS_SECRET_ACCESS_KEY | AWS IAM user secret key |
| AWS_REGION | AWS region (e.g., ap-south-1) |
| S3_RAW_BUCKET | S3 bucket for uploaded videos |
| S3_HLS_BUCKET | S3 bucket for HLS output |
| CLOUDFRONT_BASE_URL | CloudFront distribution URL |
| SUPABASE_URL | Supabase project URL |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key |

### Frontend
| Variable | Description |
|----------|-------------|
| VITE_SUPABASE_URL | Supabase project URL |
| VITE_SUPABASE_ANON_KEY | Supabase anon key |
| VITE_API_BASE_URL | Backend API URL (http://your-ip/api) |

---

## Troubleshooting

```bash
# Check PM2 status
pm2 status

# View PM2 logs
pm2 logs primevista

# Restart PM2
pm2 restart primevista

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Check Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check if port 3000 is running
sudo lsof -i :3000

# Test API locally on EC2
curl http://localhost:3000/api/videos
```

---

## Future: Adding HTTPS (Optional)

1. Get a domain or use AWS elastic IP
2. Use Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```
3. Update VITE_API_BASE_URL to https://your-domain.com/api
4. Rebuild frontend and redeploy

---

## Quick Redeploy Commands

```bash
# Pull latest code
cd ~/video-streaming
git pull origin main

# Rebuild frontend
cd ~/video-streaming/frontend
npm install
npm run build

# Restart backend
pm2 restart primevista

# Restart Nginx
sudo systemctl restart nginx
```
