const express = require('express');
const router = express.Router();
const { createVideo, getVideoById, getAllVideos } = require('../services/supabaseService');

router.post('/save', async (req, res, next) => {
  try {
    const { title, description, raw_video_url, videoId } = req.body;
    
    if (!title || !raw_video_url || !videoId) {
      return res.status(400).json({ error: 'Missing required fields: title, raw_video_url, videoId' });
    }
    
    const videoData = {
      id: videoId,
      title,
      description: description || '',
      raw_video_url,
      status: 'uploaded',
      created_at: new Date().toISOString(),
    };
    
    const video = await createVideo(videoData);
    
    res.status(201).json(video);
  } catch (error) {
    next(error);
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
