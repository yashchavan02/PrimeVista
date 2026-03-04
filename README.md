# PrimeVista - Video Streaming Platform

A modern video streaming application built with React, Node.js, Express, and HLS adaptive streaming technology.

![PrimeVista](https://img.shields.io/badge/PrimeVista-Video%20Streaming-blueviolet)

## Features

- **HLS Adaptive Streaming** - Smooth video playback with automatic quality adjustment
- **Quality Selection** - Manual quality control (360p, 480p, 720p)
- **User Authentication** - Secure signup/login with Supabase Auth
- **Role-Based Access** - Admin and User roles
- **Video Upload** - Upload videos for processing and streaming
- **Modern UI** - Beautiful, responsive design with glassmorphism

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- HLS.js
- React Router

### Backend
- Node.js
- Express
- Supabase
- AWS S3 & CloudFront
- FFmpeg

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- FFmpeg (for video processing)
- Supabase account
- AWS account (S3 + CloudFront)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd video-streaming
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
```

3. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. **Run Development Servers**

Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend
npm run dev
```

5. **Open Browser**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Environment Variables

### Backend (.env)
```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
S3_RAW_BUCKET=your-raw-bucket
S3_HLS_BUCKET=your-hls-bucket
CLOUDFRONT_BASE_URL=https://your-cloudfront.cloudfront.net
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
PORT=3000
```

### Frontend (.env.local)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:3000/api
```

## Database Setup

Run this SQL in Supabase SQL Editor:

```sql
-- Videos table
CREATE TABLE videos (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  raw_video_url TEXT,
  hls_master_url TEXT,
  status TEXT DEFAULT 'uploaded',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table with roles
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for videos
CREATE POLICY "Videos are viewable by everyone" ON videos FOR SELECT USING (true);
CREATE POLICY "Users can insert videos" ON videos FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update videos" ON videos FOR UPDATE USING (true);

-- RLS Policies for users
CREATE POLICY "Users can view all" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert own" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own" ON users FOR UPDATE USING (auth.uid() = id);
```

## Deployment

See [DEPLOY.md](DEPLOY.md) for detailed deployment instructions on AWS EC2.

## Project Structure

```
video-streaming/
├── backend/
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/     # Business logic
│   │   ├── workers/      # Video processing
│   │   └── utils/        # Utilities
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/       # Page components
│   │   ├── context/      # React context
│   │   └── lib/         # Libraries
│   ├── .env.example
│   └── package.json
├── DEPLOY.md
└── README.md
```

## License

MIT
