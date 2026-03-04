const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToS3 } = require('../services/s3Service');
const { createVideo, getAllVideos, getVideoById } = require('../services/supabaseService');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 500 * 1024 * 1024 } });

router.post('/upload', upload.single('video'), async (req, res, next) => {
  try {
    const { title, description, videoId } = req.body;
    const file = req.file;
    
    if (!file || !title || !videoId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const bucket = process.env.S3_RAW_BUCKET;
    const key = `${videoId}/${file.originalname}`;
    
    await uploadToS3(bucket, key, file.buffer, file.mimetype);
    
    const rawVideoUrl = `https://${bucket}.s3.amazonaws.com/${key}`;
    
    const videoData = {
      id: videoId,
      title,
      description: description || '',
      raw_video_url: rawVideoUrl,
      status: 'uploaded',
      created_at: new Date().toISOString(),
    };
    
    const video = await createVideo(videoData);
    
    res.status(201).json(video);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res, next) => {
  try {
    const videos = await getAllVideos();
    res.json(videos);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const video = await getVideoById(id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
