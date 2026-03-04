require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const uploadRoutes = require('./routes/upload');
const videoRoutes = require('./routes/videos');
const { errorHandler } = require('./utils/errorHandler');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: isProduction ? false : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

app.use('/api/upload', uploadRoutes);
app.use('/api/videos', videoRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (isProduction) {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const { startVideoWorker } = require('./workers/videoProcessor');
startVideoWorker();

module.exports = app;
