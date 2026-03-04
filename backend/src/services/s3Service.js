const { S3Client, PutObjectCommand, GetObjectCommand, UploadPartCommand, ListObjectsV2Command, DeleteObjectsCommand, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const configureBucketCors = async (bucket) => {
  const corsConfig = {
    CORSRules: [
      {
        AllowedHeaders: ['*'],
        AllowedMethods: ['GET', 'PUT', 'POST'],
        AllowedOrigins: ['*'],
        ExposeHeaders: [],
      },
    ],
  };
  
  try {
    await s3Client.send(new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: corsConfig,
    }));
    console.log(`CORS configured for bucket: ${bucket}`);
  } catch (error) {
    console.error(`Error configuring CORS for bucket ${bucket}:`, error.message);
  }
};

if (process.env.S3_RAW_BUCKET) {
  configureBucketCors(process.env.S3_RAW_BUCKET);
}

if (process.env.S3_HLS_BUCKET) {
  configureBucketCors(process.env.S3_HLS_BUCKET);
}

const generatePresignedUploadUrl = async (bucket, key, expiresIn = 60) => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return signedUrl;
};

const downloadFromS3 = async (bucket, key, localPath) => {
  const fs = require('fs');
  const path = require('path');
  const { GetObjectCommand } = require('@aws-sdk/client-s3');
  
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  
  const response = await s3Client.send(command);
  const stream = response.Body;
  const writer = fs.createWriteStream(localPath);
  
  return new Promise((resolve, reject) => {
    stream.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

const uploadDirectoryToS3 = async (localDir, bucket, s3Prefix) => {
  const fs = require('fs');
  const path = require('path');
  
  const files = getAllFiles(localDir);
  
  console.log(`Uploading ${files.length} files from ${localDir} to ${bucket}/${s3Prefix}`);
  
  for (const file of files) {
    const relativePath = path.relative(localDir, file).replace(/\\/g, '/');
    const s3Key = s3Prefix ? `${s3Prefix}/${relativePath}` : relativePath;
    
    console.log(`  Uploading: ${s3Key}`);
    
    const fileContent = fs.readFileSync(file);
    const ext = path.extname(file).toLowerCase();
    
    let contentType = 'application/octet-stream';
    if (ext === '.m3u8') {
      contentType = 'application/vnd.apple.mpegurl';
    } else if (ext === '.ts') {
      contentType = 'video/MP2T';
    }
    
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType,
    });
    
    await s3Client.send(command);
    console.log(`  Uploaded: ${s3Key}`);
  }
  
  console.log(`Upload complete: ${files.length} files`);
};

const getAllFiles = (dirPath, arrayOfFiles) => {
  const fs = require('fs');
  const path = require('path');
  const files = fs.readdirSync(dirPath);
  
  arrayOfFiles = arrayOfFiles || [];
  
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  
  return arrayOfFiles;
};

const cleanupLocalFiles = (dirPath) => {
  const fs = require('fs');
  const path = require('path');
  
  if (!fs.existsSync(dirPath)) return;
  
  const files = getAllFiles(dirPath);
  files.forEach(file => fs.unlinkSync(file));
  
  const dirs = fs.readdirSync(dirPath).filter(f => fs.statSync(path.join(dirPath, f)).isDirectory());
  dirs.forEach(dir => cleanupLocalFiles(path.join(dirPath, dir)));
  
  fs.rmdirSync(dirPath);
};

const uploadToS3 = async (bucket, key, body, contentType) => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  
  await s3Client.send(command);
};

module.exports = {
  s3Client,
  generatePresignedUploadUrl,
  downloadFromS3,
  uploadDirectoryToS3,
  cleanupLocalFiles,
  uploadToS3,
};
