# Deployment Guide for PrimeVista on AWS EC2

## Prerequisites
- AWS Account
- Domain name (optional, for HTTPS)

## Step 1: Build Frontend

```bash
cd frontend
npm run build
```

## Step 2: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose: **Ubuntu 22.04 LTS** (Free tier eligible)
3. Instance type: **t3.medium** (recommended) or t2.micro
4. Create key pair (download and save securely)
5. Security Group:
   - SSH (port 22) - Your IP
   - HTTP (port 80) - Anywhere
   - HTTPS (port 443) - Anywhere

## Step 3: Connect to EC2

```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

## Step 4: Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
```

## Step 5: Upload Code

```bash
# Option A: Using Git
git clone your-repo-url
cd video-streaming

# Option B: Using SCP
scp -r /path/to/video-streaming ubuntu@your-ec2-ip:~/
```

## Step 6: Install Dependencies

```bash
cd video-streaming/backend
npm install --production
```

## Step 7: Configure Environment

```bash
cd video-streaming/backend
cp .env.production .env
nano .env
# Update with your actual values
```

## Step 8: Start Server

```bash
# Using PM2 for production
sudo npm install -g pm2
pm2 start src/index.js --name primevista

# Auto-start on reboot
pm2 startup
pm2 save
```

## Step 9: Set Up Nginx (Recommended)

```bash
sudo apt update
sudo apt install nginx

sudo nano /etc/nginx/sites-available/primevista
```

Add this config:
```nginx
server {
    listen 80;
    server_name your-domain-or-ip;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/primevista /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 10: Access Your App

Open browser: `http://your-ec2-public-ip`

---

## Environment Variables to Update

| Variable | Value |
|----------|-------|
| AWS_ACCESS_KEY_ID | Your AWS IAM user access key |
| AWS_SECRET_ACCESS_KEY | Your AWS IAM user secret key |
| AWS_REGION | e.g., ap-south-1 |
| S3_RAW_BUCKET | Your S3 raw video bucket name |
| S3_HLS_BUCKET | Your S3 HLS bucket name |
| CLOUDFRONT_BASE_URL | Your CloudFront URL (https://...) |
| SUPABASE_URL | Your Supabase project URL |
| SUPABASE_SERVICE_ROLE_KEY | Your Supabase service role key |

## Important Notes

1. **S3 CORS**: Make sure both S3 buckets have CORS enabled
2. **CloudFront**: Create invalidation after deploying (`/*`)
3. **Supabase**: Add your EC2 IP to allowed domains if needed
4. **FFmpeg**: Install on EC2 if processing videos:
   ```bash
   sudo apt install ffmpeg
   ```

## Troubleshooting

```bash
# Check PM2 logs
pm2 logs primevista

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart services
sudo systemctl restart nginx
pm2 restart primevista
```
