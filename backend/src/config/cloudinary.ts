import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure Cloudinary from environment variables
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
  });
  console.log('✅ Cloudinary initialized successfully');
} else {
  console.log('ℹ️  Cloudinary credentials missing, falling back to local disk storage');
}

// Local Storage Fallback Directories
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ────────────────────────────────────────────────────────────────
// IMAGE UPLOAD STORAGE CONFIG
// ────────────────────────────────────────────────────────────────
let imageStorage: any;

if (isCloudinaryConfigured) {
  imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'zilverse/images',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx'],
    } as any,
  });
} else {
  imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname));
    },
  });
}

// ────────────────────────────────────────────────────────────────
// VIDEO UPLOAD STORAGE CONFIG
// ────────────────────────────────────────────────────────────────
let videoStorage: any;

if (isCloudinaryConfigured) {
  videoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'zilverse/videos',
      resource_type: 'auto',
      allowed_formats: ['mp4', 'mov', 'webm', 'avi', 'mkv', 'jpg', 'jpeg', 'png', 'gif'],
    } as any,
  });
} else {
  videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'vid-' + uniqueSuffix + path.extname(file.originalname));
    },
  });
}

export const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// Helper function to extract URL from request file
export const getFileUrl = (file: any): string => {
  if (!file) return '';
  // If uploaded to Cloudinary, path or secure_url is returned
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path;
  }
  // Fallback to local server URL path
  return `/uploads/${file.filename}`;
};
