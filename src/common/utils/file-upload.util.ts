import { memoryStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';

// Allowed file types
const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];
const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
];
const ALLOWED_MIME_TYPES = [...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES];

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export const multerConfig = {
  storage: memoryStorage(), // Use memory storage for Cloudinary uploads
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new BadRequestException(
          `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        ),
        false,
      );
    }
    cb(null, true);
  },
  limits: {
    fileSize: MAX_VIDEO_SIZE, // Max file size
  },
};

export const imageFileFilter = (req, file, cb) => {
  if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new BadRequestException(
        `Invalid image type. Allowed types: ${IMAGE_MIME_TYPES.join(', ')}`,
      ),
      false,
    );
  }
  cb(null, true);
};

export const videoFileFilter = (req, file, cb) => {
  if (!VIDEO_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new BadRequestException(
        `Invalid video type. Allowed types: ${VIDEO_MIME_TYPES.join(', ')}`,
      ),
      false,
    );
  }
  cb(null, true);
};

// Generate file URL for client (backward compatibility)
export function generateFileUrl(filePath: string, baseUrl: string): string {
  return `${baseUrl}${filePath}`;
}
