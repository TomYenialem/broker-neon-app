import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { HouseListingsService } from './house-listings.service';
import { CreateHouseListingDto } from './dto/create-house-listing.dto';
import { UpdateHouseListingDto } from './dto/update-house-listing.dto';
import { HouseListingFilterDto } from './dto/house-listing-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileUploadService } from '../common/services/file-upload.service';

@ApiTags('House Listings')
@Controller('house-listings')
export class HouseListingsController {
  constructor(
    private readonly houseListingsService: HouseListingsService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FilesInterceptor('files', 15, {
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/gif',
          'video/mp4',
          'video/mpeg',
          'video/quicktime',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new Error(
              'Invalid file type. Only images (JPG, PNG, WEBP, GIF) and videos (MP4, MPEG) allowed',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max
      },
    }),
  )
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({
    summary: 'Create house listing (ADMIN only)',
    description:
      'Create house listing with OR without file upload. Requires ADMIN role. Supports both JSON and multipart/form-data. If using form-data, images and videos go in same "files" field. Server automatically separates them.',
  })
  @ApiBody({
    description:
      'House listing - supports JSON or form-data with optional files',
    schema: {
      type: 'object',
      required: ['title', 'price', 'houseDetails'],
      properties: {
        title: {
          type: 'string',
          example: 'Moradia T4 com Piscina, Talatona',
        },
        description: {
          type: 'string',
          example: 'Casa moderna com todas as comodidades',
        },
        price: { type: 'number', example: 85000000 },
        currency: { type: 'string', enum: ['AOA', 'USD'], default: 'AOA' },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'SOLD', 'PENDING', 'EXPIRED'],
          default: 'ACTIVE',
        },
        province: { type: 'string', example: 'Luanda' },
        municipality: { type: 'string', example: 'Talatona' },
        neighborhood: { type: 'string', example: 'Talatona Gardens' },
        userId: {
          type: 'string',
          example: 'your-user-id-here',
          description: 'Optional - Owner of the listing',
        },
        houseDetails: {
          type: 'object',
          description: `
House details object with required and optional fields:

REQUIRED FIELDS:
- houseType (enum): DETACHED, TOWNHOUSE, VILLA, APARTMENT
- livingArea (number): Square meters
- bedrooms (number): Number of bedrooms
- bathrooms (number): Number of bathrooms
- constructionQuality (enum): NEW_CONSTRUCTION, RECENTLY_RENOVATED, GOOD_CONDITION, NEEDS_RENOVATION
- securityFeatures (array of strings): Can be empty []
- interiorFeatures (array of strings): Can be empty []
- exteriorFeatures (array of strings): Can be empty []

OPTIONAL FIELDS:
- plotSize (number): Square meters
- waterSource (enum): PUBLIC_NETWORK, PRIVATE_WELL, BOTH
- hasWaterTank (boolean)
- hasGenerator (boolean) - Critical in Angola
- hasInverter (boolean)
- distanceToCityCenter (number): Kilometers
- distanceToSchools (number): Kilometers
- distanceToHospitals (number): Kilometers
- distanceToSupermarkets (number): Kilometers`,
          required: [
            'houseType',
            'livingArea',
            'bedrooms',
            'bathrooms',
            'constructionQuality',
            'securityFeatures',
            'interiorFeatures',
            'exteriorFeatures',
          ],
          properties: {
            houseType: {
              type: 'string',
              enum: ['DETACHED', 'TOWNHOUSE', 'VILLA', 'APARTMENT'],
              example: 'DETACHED',
              description: 'Required',
            },
            plotSize: {
              type: 'number',
              example: 600,
              description: 'Square meters (Optional)',
            },
            livingArea: {
              type: 'number',
              example: 350,
              description: 'Square meters (Required)',
            },
            bedrooms: { type: 'number', example: 4, description: 'Required' },
            bathrooms: { type: 'number', example: 3, description: 'Required' },
            constructionQuality: {
              type: 'string',
              enum: [
                'NEW_CONSTRUCTION',
                'RECENTLY_RENOVATED',
                'GOOD_CONDITION',
                'NEEDS_RENOVATION',
              ],
              example: 'NEW_CONSTRUCTION',
              description: 'Required',
            },
            waterSource: {
              type: 'string',
              enum: ['PUBLIC_NETWORK', 'PRIVATE_WELL', 'BOTH'],
              example: 'PUBLIC_NETWORK',
              description: 'Optional',
            },
            hasWaterTank: {
              type: 'boolean',
              example: true,
              description: 'Optional',
            },
            hasGenerator: {
              type: 'boolean',
              example: true,
              description: 'Optional - Critical in Angola',
            },
            hasInverter: {
              type: 'boolean',
              example: true,
              description: 'Optional',
            },
            securityFeatures: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'Electric fence',
                'CCTV cameras',
                'Security guard 24/7',
              ],
              description: 'Required - Can be empty array',
            },
            interiorFeatures: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'Equipped kitchen',
                'AC all rooms',
                'Built-in wardrobes',
              ],
              description: 'Required - Can be empty array',
            },
            exteriorFeatures: {
              type: 'array',
              items: { type: 'string' },
              example: ['Swimming pool', 'Garden', 'Garage for 2 cars'],
              description: 'Required - Can be empty array',
            },
            distanceToCityCenter: {
              type: 'number',
              example: 15,
              description: 'Kilometers (Optional)',
            },
            distanceToSchools: {
              type: 'number',
              example: 2,
              description: 'Kilometers (Optional)',
            },
            distanceToHospitals: {
              type: 'number',
              example: 5,
              description: 'Kilometers (Optional)',
            },
            distanceToSupermarkets: {
              type: 'number',
              example: 0.8,
              description: 'Kilometers (Optional)',
            },
          },
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description:
            'Optional - Upload images (JPG,PNG,WEBP,GIF) and/or videos (MP4,MPEG). Max 15 files. Server automatically separates images from videos.',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'House listing created successfully',
    schema: {
      example: {
        message: 'House listing created successfully!',
        data: {
          id: 'uuid',
          title: 'Moradia T4 com Piscina, Talatona',
          images: [
            '/uploads/house/uuid/1696400000-uuid1.jpg',
            '/uploads/house/uuid/1696400001-uuid2.jpg',
          ],
          videos: ['/uploads/house/uuid/1696400003-uuid4.mp4'],
        },
        filesUploaded: {
          images: 2,
          videos: 1,
          totalFiles: 3,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN role' })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or size or missing required fields',
  })
  async create(
    @Body() body: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // Validate required fields with custom error messages
    const missingFields: string[] = [];

    if (!body.title) missingFields.push('title');
    if (!body.price && body.price !== 0) missingFields.push('price');
    if (!body.houseDetails) missingFields.push('houseDetails');

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Missing required fields: ${missingFields.join(', ')}. Please provide these fields to create a house listing.`,
      );
    }

    // Handle both JSON and form-data
    let houseDetails;
    let listingData;

    // Determine if this is form-data or JSON based on Content-Type
    const isFormData =
      body.houseDetails && typeof body.houseDetails === 'string';

    if (isFormData) {
      // Form-data (houseDetails is a JSON string)
      try {
        houseDetails = JSON.parse(body.houseDetails);
      } catch (error) {
        throw new BadRequestException(
          'Invalid houseDetails JSON. Please provide valid JSON string.',
        );
      }

      // Validate houseDetails required fields
      const missingHouseFields: string[] = [];
      if (!houseDetails.houseType) missingHouseFields.push('houseType');
      if (houseDetails.livingArea === undefined)
        missingHouseFields.push('livingArea');
      if (houseDetails.bedrooms === undefined)
        missingHouseFields.push('bedrooms');
      if (houseDetails.bathrooms === undefined)
        missingHouseFields.push('bathrooms');
      if (!houseDetails.constructionQuality)
        missingHouseFields.push('constructionQuality');
      if (!houseDetails.securityFeatures)
        missingHouseFields.push('securityFeatures (array)');
      if (!houseDetails.interiorFeatures)
        missingHouseFields.push('interiorFeatures (array)');
      if (!houseDetails.exteriorFeatures)
        missingHouseFields.push('exteriorFeatures (array)');

      if (missingHouseFields.length > 0) {
        throw new BadRequestException(
          `Missing required houseDetails fields: ${missingHouseFields.join(', ')}`,
        );
      }

      listingData = {
        title: body.title,
        description: body.description,
        price:
          typeof body.price === 'string' ? parseFloat(body.price) : body.price,
        currency: body.currency || 'AOA',
        status: body.status || 'ACTIVE',
        province: body.province,
        municipality: body.municipality,
        neighborhood: body.neighborhood,
        userId: body.userId || undefined,
        images: [],
        videos: [],
        houseDetails,
      };
    } else {
      // Regular JSON (houseDetails is already an object)
      houseDetails = body.houseDetails;

      listingData = {
        title: body.title,
        description: body.description,
        price: body.price,
        currency: body.currency || 'AOA',
        status: body.status || 'ACTIVE',
        province: body.province,
        municipality: body.municipality,
        neighborhood: body.neighborhood,
        userId: body.userId || undefined,
        images: body.images || [],
        videos: body.videos || [],
        houseDetails,
      };
    }

    // Create listing
    const listing = await this.houseListingsService.create(listingData as any);

    // If files were uploaded, save them
    if (files && files.length > 0) {
      // Separate images and videos
      const imageFiles = files.filter((f) => f.mimetype.startsWith('image/'));
      const videoFiles = files.filter((f) => f.mimetype.startsWith('video/'));

      // Save files to listing-specific folder
      const imageUrls =
        imageFiles.length > 0
          ? this.fileUploadService.saveListingFiles(
              imageFiles,
              listing.id,
              'house',
            )
          : [];

      const videoUrls =
        videoFiles.length > 0
          ? this.fileUploadService.saveListingFiles(
              videoFiles,
              listing.id,
              'house',
            )
          : [];

      // Update listing with file URLs
      const updatedListing = await this.houseListingsService.update(
        listing.id,
        {
          images: imageUrls,
          videos: videoUrls,
        } as any,
      );

      return {
        message: 'House listing created successfully with uploaded files!',
        data: updatedListing,
        filesUploaded: {
          images: imageUrls.length,
          imageUrls: imageUrls,
          videos: videoUrls.length,
          videoUrls: videoUrls,
          totalFiles: files.length,
        },
      };
    }

    // No files uploaded - return listing as is
    return {
      message: 'House listing created successfully!',
      data: listing,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all house listings',
    description: 'Retrieve all house listings with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'House listings retrieved successfully',
  })
  findAll(@Query() filters: HouseListingFilterDto) {
    return this.houseListingsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get house listing by ID',
    description: 'Retrieve a specific house listing',
  })
  @ApiParam({ name: 'id', description: 'House listing UUID' })
  @ApiResponse({ status: 200, description: 'House listing found' })
  @ApiResponse({ status: 404, description: 'House listing not found' })
  findOne(@Param('id') id: string) {
    return this.houseListingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update house listing (ADMIN only)',
    description:
      'Update an existing house listing. Only include fields you want to change. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'House listing UUID' })
  @ApiBody({
    description:
      'Fields to update (all optional - only send what you want to change)',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'Updated Title - Moradia T4 Renovada',
        },
        description: {
          type: 'string',
          example: 'Price reduced! Recently renovated',
        },
        price: { type: 'number', example: 80000000 },
        currency: { type: 'string', enum: ['AOA', 'USD'] },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'SOLD', 'PENDING', 'EXPIRED'],
          example: 'SOLD',
        },
        province: { type: 'string' },
        municipality: { type: 'string' },
        neighborhood: { type: 'string' },
      },
      example: {
        title: 'VENDIDA - Moradia T4 com Piscina',
        status: 'SOLD',
        price: 80000000,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'House listing updated successfully',
    schema: {
      example: {
        id: 'uuid',
        title: 'VENDIDA - Moradia T4 com Piscina',
        price: 80000000,
        status: 'SOLD',
        updatedAt: '2025-10-07T00:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN' })
  @ApiResponse({ status: 404, description: 'House listing not found' })
  update(
    @Param('id') id: string,
    @Body() updateHouseListingDto: UpdateHouseListingDto,
  ) {
    return this.houseListingsService.update(id, updateHouseListingDto);
  }

  @Patch(':id/media/add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('files', 15))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Add media to listing (ADMIN only)',
    description: `
📸 What it does: Adds new images/videos to existing listing WITHOUT deleting current ones

📋 Requires:
- ADMIN authentication (Bearer token)
- Listing ID in URL
- At least one file (image or video)
- Files uploaded as "files" in form-data

✅ Result: New files are added, existing files kept
🎯 Use when: You want to add more photos/videos to an existing listing`,
  })
  @ApiParam({ name: 'id', description: 'House listing UUID' })
  @ApiBody({
    description: 'Upload files as form-data with key "files"',
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description:
            'Upload images (JPG,PNG,WEBP,GIF) and/or videos (MP4,MPEG). Max 15 files.',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Media added successfully',
    schema: {
      example: {
        message: 'Media added successfully',
        imagesAdded: 2,
        videosAdded: 1,
        totalImages: 7,
        totalVideos: 4,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - No files provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN role' })
  @ApiResponse({ status: 404, description: 'House listing not found' })
  async addMedia(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Validate files are provided
    if (!files || files.length === 0) {
      throw new BadRequestException(
        'No files provided. Please upload at least one image or video file.',
      );
    }

    const listing: any = await this.houseListingsService.findOne(id);

    // Separate images and videos
    const imageFiles = files.filter((f) => f.mimetype.startsWith('image/'));
    const videoFiles = files.filter((f) => f.mimetype.startsWith('video/'));

    // Save new files
    const newImageUrls =
      imageFiles.length > 0
        ? this.fileUploadService.saveListingFiles(imageFiles, id, 'house')
        : [];

    const newVideoUrls =
      videoFiles.length > 0
        ? this.fileUploadService.saveListingFiles(videoFiles, id, 'house')
        : [];

    // Combine with existing
    const existingImages = listing.images || [];
    const existingVideos = listing.videos || [];
    const allImages = [...existingImages, ...newImageUrls];
    const allVideos = [...existingVideos, ...newVideoUrls];

    await this.houseListingsService.update(id, {
      images: allImages,
      videos: allVideos,
    } as any);

    return {
      message: 'Media added successfully',
      imagesAdded: newImageUrls.length,
      videosAdded: newVideoUrls.length,
      totalImages: allImages.length,
      totalVideos: allVideos.length,
      newImages: newImageUrls,
      newVideos: newVideoUrls,
    };
  }

  @Patch(':id/media/replace')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('files', 15))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Replace all media (ADMIN only)',
    description: `
🔄 What it does: DELETES all current images/videos and uploads new ones

📋 Requires:
- ADMIN authentication (Bearer token)
- Listing ID in URL
- At least one new file
- Files uploaded as "files" in form-data

⚠️ Warning: All existing images and videos will be deleted!
✅ Result: Listing will have ONLY the newly uploaded files
🎯 Use when: You want to completely replace all media files`,
  })
  @ApiParam({ name: 'id', description: 'House listing UUID' })
  @ApiBody({
    description: 'Upload new files that will replace ALL existing media',
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description:
            'Upload new images and/or videos to replace all existing media',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'All media replaced',
    schema: {
      example: {
        message: 'All media replaced successfully',
        totalImages: 3,
        totalVideos: 1,
        images: ['/uploads/house/uuid/new1.jpg', '...'],
        videos: ['/uploads/house/uuid/new-video.mp4'],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - No files provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN role' })
  async replaceMedia(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Validate files are provided
    if (!files || files.length === 0) {
      throw new BadRequestException(
        'No files provided. Please upload at least one file to replace existing media.',
      );
    }

    // Separate images and videos
    const imageFiles = files.filter((f) => f.mimetype.startsWith('image/'));
    const videoFiles = files.filter((f) => f.mimetype.startsWith('video/'));

    const newImageUrls =
      imageFiles.length > 0
        ? this.fileUploadService.saveListingFiles(imageFiles, id, 'house')
        : [];

    const newVideoUrls =
      videoFiles.length > 0
        ? this.fileUploadService.saveListingFiles(videoFiles, id, 'house')
        : [];

    await this.houseListingsService.update(id, {
      images: newImageUrls,
      videos: newVideoUrls,
    } as any);

    return {
      message: 'All media replaced successfully',
      totalImages: newImageUrls.length,
      totalVideos: newVideoUrls.length,
      images: newImageUrls,
      videos: newVideoUrls,
    };
  }

  @Delete(':id/media/:filename')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete specific media file (ADMIN only)',
    description: `
🗑️ What it does: Removes ONE specific image or video file from listing

📋 Requires:
- ADMIN authentication (Bearer token)
- Listing ID in URL
- Filename (NOT full path!) in URL

📌 Important: Use ONLY the filename (e.g., 1696400000-uuid.jpg)
❌ Wrong: /uploads/house/uuid/1696400000-uuid.jpg
✅ Correct: 1696400000-uuid.jpg

🎯 Use when: You want to remove just one photo or video, keeping others`,
  })
  @ApiParam({ name: 'id', description: 'House listing UUID' })
  @ApiParam({
    name: 'filename',
    description:
      'Filename only (e.g., 1696400000-uuid.jpg) - NOT the full path!',
    example: '1696400000-uuid.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Media file deleted',
    schema: {
      example: {
        message: 'Image deleted successfully',
        type: 'image',
        deletedFile: '/uploads/house/uuid/1696400000-uuid.jpg',
        remainingImages: 5,
        remainingVideos: 2,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - File not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN role' })
  @ApiResponse({ status: 404, description: 'Media file not found' })
  async deleteMedia(
    @Param('id') id: string,
    @Param('filename') filename: string,
  ) {
    const listing: any = await this.houseListingsService.findOne(id);
    const images = listing.images || [];
    const videos = listing.videos || [];

    // Find in images
    const imageToDelete = images.find((img: string) => img.includes(filename));

    // Find in videos
    const videoToDelete = videos.find((vid: string) => vid.includes(filename));

    if (!imageToDelete && !videoToDelete) {
      throw new BadRequestException(
        `File "${filename}" not found in this listing. Make sure to use only the filename, not the full path.`,
      );
    }

    // Remove from appropriate array
    if (imageToDelete) {
      const updatedImages = images.filter(
        (img: string) => !img.includes(filename),
      );
      await this.houseListingsService.update(id, {
        images: updatedImages,
      } as any);

      return {
        message: 'Image deleted successfully',
        type: 'image',
        deletedFile: imageToDelete,
        remainingImages: updatedImages.length,
        remainingVideos: videos.length,
      };
    } else {
      const updatedVideos = videos.filter(
        (vid: string) => !vid.includes(filename),
      );
      await this.houseListingsService.update(id, {
        videos: updatedVideos,
      } as any);

      return {
        message: 'Video deleted successfully',
        type: 'video',
        deletedFile: videoToDelete,
        remainingImages: images.length,
        remainingVideos: updatedVideos.length,
      };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete house listing (ADMIN only)',
    description: 'Delete a house listing. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'House listing UUID' })
  @ApiResponse({
    status: 200,
    description: 'House listing deleted successfully',
    schema: {
      example: {
        message: 'House listing deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN role' })
  @ApiResponse({ status: 404, description: 'House listing not found' })
  async remove(@Param('id') id: string) {
    await this.houseListingsService.remove(id);
    return {
      message: 'House listing deleted successfully',
    };
  }
}
