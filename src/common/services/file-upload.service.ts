import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { configureCloudinary } from '../../cloudinary/cloudinary.config';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

@Injectable()
export class FileUploadService {
  private readonly videoChunkSize = 6_000_000; // 6 MB chunks for large videos
  private readonly imageTimeoutMs = 60_000;
  private readonly videoTimeoutMs = 180_000;
  private readonly maxUploadRetries = 1;

  constructor(private config: ConfigService) {
    // Initialize Cloudinary
    configureCloudinary(this.config);
  }

  private isTimeoutError(error: any): boolean {
    if (!error) return false;
    return (
      error.http_code === 499 ||
      error.name === 'TimeoutError' ||
      error?.error?.name === 'TimeoutError' ||
      error.message?.toLowerCase().includes('timeout')
    );
  }

  private async uploadBuffer(
    file: Express.Multer.File,
    publicId: string,
    resourceType: 'image' | 'video',
  ): Promise<UploadApiResponse> {
    const timeout =
      resourceType === 'video' ? this.videoTimeoutMs : this.imageTimeoutMs;
    const chunkSize = resourceType === 'video' ? this.videoChunkSize : undefined;

    const attemptUpload = () =>
      new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream.call(
          cloudinary.uploader,
          {
            public_id: publicId,
            resource_type: resourceType,
            overwrite: false,
            timeout,
            chunk_size: chunkSize,
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            if (!result) {
              return reject(new Error('Cloudinary upload returned no result.'));
            }
            resolve(result);
          },
        );

        Readable.from(file.buffer).pipe(uploadStream);
      });

    let attempt = 0;
    while (true) {
      try {
        return await attemptUpload();
      } catch (error) {
        if (this.isTimeoutError(error) && attempt < this.maxUploadRetries) {
          attempt += 1;
          await new Promise((res) => setTimeout(res, 1000));
          continue;
        }
        throw error;
      }
    }
  }

  /**
   * Extract public_id from Cloudinary URL or relative path
   * @param fileUrl - Cloudinary URL or relative path
   * @returns public_id string
   */
  private extractPublicId(fileUrl: string): string | null {
    // If it's a Cloudinary URL, extract public_id
    if (fileUrl.includes('cloudinary.com')) {
      // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}.{ext}
      // or: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{public_id}.{ext}
      const urlParts = fileUrl.split('/upload/');
      if (urlParts.length > 1) {
        let publicIdPart = urlParts[1];
        // Remove version if present (v1234567890/)
        publicIdPart = publicIdPart.replace(/^v\d+\//, '');
        // Remove file extension for public_id
        publicIdPart = publicIdPart.replace(/\.[^/.]+$/, '');
        return publicIdPart;
      }
    }
    // If it's a relative path like /uploads/car/uuid/filename.jpg
    else if (fileUrl.startsWith('/uploads/')) {
      // Remove leading slash and return as public_id (without extension)
      return fileUrl.slice(1).replace(/\.[^/.]+$/, '');
    }
    return null;
  }

  /**
   * Save uploaded files to Cloudinary
   * @param files - Array of uploaded files
   * @param listingId - UUID of the listing
   * @param category - Category of listing (car, land, house, machine)
   * @returns Array of Cloudinary URLs
   */
  async saveListingFiles(
    files: Express.Multer.File[],
    listingId: string,
    category: string,
  ): Promise<string[]> {
    const folder = `uploads/${category.toLowerCase()}/${listingId}`;
    const fileUrls: string[] = [];

    for (const file of files) {
      const uniqueFilename = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
      const publicId = `${folder}/${uniqueFilename.replace(/\.[^/.]+$/, '')}`;

      try {
        // Determine resource type based on mimetype
        const resourceType = file.mimetype.startsWith('video/')
          ? 'video'
          : 'image';

        const uploadResult = await this.uploadBuffer(
          file,
          publicId,
          resourceType,
        );

        fileUrls.push(uploadResult.secure_url);
      } catch (error) {
        console.error(
          `Error uploading file ${file.originalname} to Cloudinary:`,
          error,
        );
        throw error;
      }
    }

    return fileUrls;
  }

  /**
   * Save single file to Cloudinary
   * @param file - Uploaded file
   * @param listingId - UUID of the listing
   * @param category - Category of listing
   * @returns Cloudinary URL
   */
  async saveSingleFile(
    file: Express.Multer.File,
    listingId: string,
    category: string,
  ): Promise<string> {
    const urls = await this.saveListingFiles([file], listingId, category);
    return urls[0];
  }

  /**
   * Delete all files in a listing folder from Cloudinary
   * @param listingId - UUID of the listing
   * @param category - Category of listing
   */
  async deleteListingFiles(listingId: string, category: string): Promise<void> {
    const folder = `uploads/${category.toLowerCase()}/${listingId}`;

    try {
      // Delete all resources in the folder (both images and videos)
      await Promise.all([
        cloudinary.api.delete_resources_by_prefix(folder, {
          resource_type: 'image',
        }),
        cloudinary.api.delete_resources_by_prefix(folder, {
          resource_type: 'video',
        }),
      ]);
    } catch (error) {
      console.error(`Error deleting listing files from Cloudinary:`, error);
      throw error;
    }
  }

  /**
   * Delete a single file from Cloudinary
   * @param fileUrl - Cloudinary URL or relative path
   * @returns boolean - true if deleted, false if not found
   */
  async deleteSingleFile(fileUrl: string): Promise<boolean> {
    try {
      const publicId = this.extractPublicId(fileUrl);
      if (!publicId) {
        console.warn(`Could not extract public_id from URL: ${fileUrl}`);
        return false;
      }

      // Try to delete as both image and video
      const resourceType = fileUrl.includes('/video/') ? 'video' : 'image';

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      return result.result === 'ok';
    } catch (error) {
      console.error(`Error deleting file ${fileUrl} from Cloudinary:`, error);
      return false;
    }
  }

  /**
   * Delete multiple files from Cloudinary
   * @param fileUrls - Array of file URLs
   * @returns Number of files successfully deleted
   */
  async deleteMultipleFiles(fileUrls: string[]): Promise<number> {
    let deletedCount = 0;
    for (const url of fileUrls) {
      if (await this.deleteSingleFile(url)) {
        deletedCount++;
      }
    }
    return deletedCount;
  }

  /**
   * Get full file URL for client
   * @param relativePath - Relative file path or Cloudinary URL
   * @returns Full URL
   */
  getFileUrl(relativePath: string): string {
    // If it's already a Cloudinary URL, return as is
    if (relativePath.startsWith('http')) {
      return relativePath;
    }
    // For backward compatibility with old relative paths
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
