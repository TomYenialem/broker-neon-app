import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

// Allowed file types
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_MIME_TYPES = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
const ALLOWED_MIME_TYPES = [...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES];

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      // Create uploads directory if it doesn't exist
      const uploadDir = './uploads';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Create category-specific directory
      const category = req.body.category || 'temp';
      const categoryDir = `${uploadDir}/${category.toLowerCase()}`;
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }

      cb(null, categoryDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
      const ext = extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  }),
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

// Move uploaded files to listing-specific folder after listing creation
export function moveFilesToListingFolder(
  files: Express.Multer.File[],
  listingId: string,
  category: string,
): string[] {
  const listingDir = `./uploads/${category.toLowerCase()}/${listingId}`;
  
  // Create listing directory
  if (!fs.existsSync(listingDir)) {
    fs.mkdirSync(listingDir, { recursive: true });
  }

  const filePaths: string[] = [];

  files.forEach((file) => {
    const newPath = `${listingDir}/${file.filename}`;
    
    // Move file from temp category folder to listing folder
    fs.renameSync(file.path, newPath);
    
    // Return relative URL path
    filePaths.push(`/uploads/${category.toLowerCase()}/${listingId}/${file.filename}`);
  });

  return filePaths;
}

// Delete listing folder and all files
export function deleteListingFolder(listingId: string, category: string): void {
  const listingDir = `./uploads/${category.toLowerCase()}/${listingId}`;
  
  if (fs.existsSync(listingDir)) {
    fs.rmSync(listingDir, { recursive: true, force: true });
  }
}

// Generate file URL for client
export function generateFileUrl(filePath: string, baseUrl: string): string {
  return `${baseUrl}${filePath}`;
}

