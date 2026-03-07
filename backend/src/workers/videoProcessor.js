const { getVideosByStatus, updateVideoStatus } = require('../services/supabaseService');
const { downloadFromS3, uploadDirectoryToS3, cleanupLocalFiles } = require('../services/s3Service');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const POLLING_INTERVAL = 10000;

let isProcessing = false;

const checkFfmpeg = async () => {
  try {
    await execAsync('ffmpeg -version');
    console.log('ffmpeg is available');
  } catch (error) {
    console.error('ffmpeg is NOT installed or not in PATH');
  }
};

const processVideo = async (video) => {
  const { id: videoId, raw_video_url } = video;

  console.log(`Processing video: ${videoId}`);
  console.log(`Raw URL: ${raw_video_url}`);

  const tempDir = path.join(os.tmpdir(), videoId);
  const inputPath = path.join(tempDir, 'input.mp4');
  const outputDir = path.join(tempDir, 'hls');

  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  try {

    await updateVideoStatus(videoId, 'processing');

    const urlParts = raw_video_url.split('/');
    const bucketName = process.env.S3_RAW_BUCKET;
    const s3Key = urlParts.slice(3).join('/');

    console.log(`Downloading from S3: ${bucketName}/${s3Key}`);
    await downloadFromS3(bucketName, s3Key, inputPath);

    console.log(`Generating HLS for video: ${videoId}`);
    await generateHLS(inputPath, outputDir);

    console.log(`Uploading HLS to S3`);
    await uploadDirectoryToS3(outputDir, process.env.S3_HLS_BUCKET, videoId);

    const hlsMasterUrl = `${process.env.CLOUDFRONT_BASE_URL}/${videoId}/master.m3u8`;

    await updateVideoStatus(videoId, 'ready', {
      hls_master_url: hlsMasterUrl
    });

    console.log(`Video ${videoId} processed successfully`);

  } catch (error) {

    console.error(`Error processing video ${videoId}`, error);
    await updateVideoStatus(videoId, 'failed');

  } finally {

    cleanupLocalFiles(tempDir);

  }
};

const generateHLS = async (inputPath, outputDir) => {

  const resolutions = [
    { height: 360, bitrate: '800k', index: 0 },
    { height: 480, bitrate: '1400k', index: 1 },
    { height: 720, bitrate: '2000k', index: 2 }
  ];

  const variantPlaylists = [];

  for (const { height, bitrate, index } of resolutions) {

    const variantDir = path.join(outputDir, index.toString());
    if (!fs.existsSync(variantDir)) fs.mkdirSync(variantDir, { recursive: true });

    const playlistPath = path.join(variantDir, 'index.m3u8');
    const segmentPattern = path.join(variantDir, 'segment%03d.ts');

    const ffmpegCmd = `
      nice -n 10 ffmpeg -threads 1 -preset veryfast \
      -i "${inputPath}" \
      -vf scale=-2:${height} \
      -b:v ${bitrate} \
      -maxrate ${bitrate} \
      -bufsize ${bitrate} \
      -hls_time 4 \
      -hls_playlist_type vod \
      -hls_segment_filename "${segmentPattern}" \
      "${playlistPath}"
    `;

    console.log(`Running FFmpeg for ${height}p`);
    await execAsync(ffmpegCmd);

    variantPlaylists.push({
      uri: `${index}/index.m3u8`,
      bandwidth: parseInt(bitrate) * 1000,
      resolution: `${height}p`
    });
  }

  const masterPlaylist = generateMasterPlaylist(variantPlaylists);
  fs.writeFileSync(path.join(outputDir, 'master.m3u8'), masterPlaylist);
};

const generateMasterPlaylist = (variants) => {

  let playlist = '#EXTM3U\n#EXT-X-VERSION:3\n';

  for (const variant of variants) {

    playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${variant.bandwidth},RESOLUTION=${variant.resolution}\n`;
    playlist += `${variant.uri}\n`;

  }

  return playlist;
};

const startVideoWorker = () => {

  console.log('Video processing worker started');

  checkFfmpeg();

  const poll = async () => {

    if (isProcessing) return;

    try {

      isProcessing = true;

      const uploadedVideos = await getVideosByStatus('uploaded');

      if (uploadedVideos.length > 0) {

        console.log(`Found ${uploadedVideos.length} videos`);

        for (const video of uploadedVideos) {

          await processVideo(video);

        }
      }

    } catch (error) {

      console.error('Worker error', error);

    } finally {

      isProcessing = false;

    }
  };

  setInterval(poll, POLLING_INTERVAL);

  poll();
};

module.exports = { startVideoWorker };