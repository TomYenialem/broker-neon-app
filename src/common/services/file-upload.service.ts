import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  constructor(private config: ConfigService) {}

  /**
   * Save uploaded files to listing-specific directory
   * @param files - Array of uploaded files
   * @param listingId - UUID of the listing
   * @param category - Category of listing (car, land, house, machine)
   * @returns Array of file URLs
   */
  saveListingFiles(
    files: Express.Multer.File[],
    listingId: string,
    category: string,
  ): string[] {
    const uploadDir = './uploads';
    const categoryDir = `${uploadDir}/${category.toLowerCase()}`;
    const listingDir = `${categoryDir}/${listingId}`;

    // Create listing directory
    if (!fs.existsSync(listingDir)) {
      fs.mkdirSync(listingDir, { recursive: true });
    }

    const fileUrls: string[] = [];

    files.forEach((file) => {
      const uniqueFilename = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
      const filePath = path.join(listingDir, uniqueFilename);

      // Write file to listing directory
      fs.writeFileSync(filePath, file.buffer);

      // Generate URL (relative path)
      const fileUrl = `/uploads/${category.toLowerCase()}/${listingId}/${uniqueFilename}`;
      fileUrls.push(fileUrl);
    });

    return fileUrls;
  }

  /**
   * Save single file (e.g., video)
   * @param file - Uploaded file
   * @param listingId - UUID of the listing
   * @param category - Category of listing
   * @returns File URL
   */
  saveSingleFile(
    file: Express.Multer.File,
    listingId: string,
    category: string,
  ): string {
    const urls = this.saveListingFiles([file], listingId, category);
    return urls[0];
  }

  /**
   * Delete listing directory and all files
   * @param listingId - UUID of the listing
   * @param category - Category of listing
   */
  deleteListingFiles(listingId: string, category: string): void {
    const listingDir = `./uploads/${category.toLowerCase()}/${listingId}`;

    if (fs.existsSync(listingDir)) {
      fs.rmSync(listingDir, { recursive: true, force: true });
    }
  }

  /**
   * Get full file URL for client
   * @param relativePath - Relative file path
   * @returns Full URL
   */
  getFileUrl(relativePath: string): string {
    const baseUrl = this.config.get('APP_URL') || 'http://localhost:3000';
    return `${baseUrl}${relativePath}`;
  }

  /**
   * Validate file type
   * @param mimetype - File MIME type
   * @param allowedTypes - Array of allowed MIME types
   * @returns boolean
   */
  isValidFileType(mimetype: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimetype);
  }
}

