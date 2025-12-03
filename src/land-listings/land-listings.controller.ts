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
import { LandListingsService } from './land-listings.service';
import { UpdateLandListingDto } from './dto/update-land-listing.dto';
import { LandListingFilterDto } from './dto/land-listing-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { FileUploadService } from '../common/services/file-upload.service';

@ApiTags('Land Listings')
@Controller('land-listings')
export class LandListingsController {
  constructor(
    private readonly landListingsService: LandListingsService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('files', 15))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({
    summary: 'Create land listing (ADMIN only)',
    description:
      'Create land listing with JSON or form-data. Files optional. Supports multiple images and videos.',
  })
  @ApiBody({
    description: 'Land listing data - JSON or form-data',
    schema: {
      type: 'object',
      required: ['title', 'landDetails'],
      properties: {
        title: { type: 'string', example: 'Terreno 5 Hectares, Benguela' },
        description: { type: 'string', example: 'Terreno plano com água' },
        price: {
          type: 'number',
          example: 5000000,
          description: 'Optional if priceText provided',
        },
        priceText: {
          type: 'string',
          example: 'Negotiable / By contract',
          description: 'Optional textual price',
        },
        currency: { type: 'string', enum: ['AOA', 'USD'], default: 'AOA' },
        isFeatured: {
          type: 'boolean',
          example: false,
          default: false,
          description: 'Optional - Featured listing',
        },
        province: { type: 'string', example: 'Benguela' },
        landDetails: {
          type: 'object',
          description: `
Land details object with required and optional fields:

REQUIRED FIELDS:
- totalArea (number): Size of land
- areaUnit (enum): SQUARE_METERS, HECTARES
- landPurpose (enum): AGRICULTURAL, RESIDENTIAL, COMMERCIAL, MIXED_USE

OPTIONAL FIELDS (General):
- topography (enum): FLAT, SLOPED, HILLY
- distanceFromMainRoad (number): Meters
- isDemarcated (boolean): Boundaries marked?
- documentType (enum): TITLE_DEED, SURFACE_RIGHT, ASSIGNMENT_CONTRACT, LAND_USE_LICENSE

FOR AGRICULTURAL LAND:
- waterSource (string): Description of water access
- hasIrrigationSystem (boolean)
- soilType (enum): SANDY, CLAY, LOAMY
- soilTested (boolean)
- previousUse (string): What was grown before
- agriculturalSupport (string): Available resources
- climateInfo (string): Rainfall patterns

FOR RESIDENTIAL/COMMERCIAL:
- zoningType (enum): RESIDENTIAL, COMMERCIAL, INDUSTRIAL, MIXED_USE
- electricityAccess (enum): CONNECTED, NEARBY, NOT_AVAILABLE, FEASIBLE
- waterAccess (enum): CONNECTED, NEARBY, NOT_AVAILABLE, FEASIBLE
- sanitationAccess (enum): CONNECTED, NEARBY, NOT_AVAILABLE, FEASIBLE
- securityInfo (string): Security details`,
          required: ['totalArea', 'areaUnit', 'landPurpose'],
          properties: {
            totalArea: {
              type: 'number',
              example: 50000,
              description: 'Required',
            },
            areaUnit: {
              type: 'string',
              enum: ['SQUARE_METERS', 'HECTARES'],
              example: 'SQUARE_METERS',
              description: 'Required',
            },
            topography: {
              type: 'string',
              enum: ['FLAT', 'SLOPED', 'HILLY'],
              example: 'FLAT',
              description: 'Optional',
            },
            distanceFromMainRoad: {
              type: 'number',
              example: 500,
              description: 'Meters (Optional)',
            },
            isDemarcated: {
              type: 'boolean',
              example: true,
              description: 'Optional',
            },
            documentType: {
              type: 'string',
              enum: [
                'TITLE_DEED',
                'SURFACE_RIGHT',
                'ASSIGNMENT_CONTRACT',
                'LAND_USE_LICENSE',
              ],
              example: 'TITLE_DEED',
              description: 'Optional - Critical in Angola',
            },
            landPurpose: {
              type: 'string',
              enum: ['AGRICULTURAL', 'RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE'],
              example: 'AGRICULTURAL',
              description: 'Required',
            },
            waterSource: {
              type: 'string',
              example: 'Rio nearby (200m)',
              description: 'Optional - For agricultural',
            },
            hasIrrigationSystem: {
              type: 'boolean',
              example: false,
              description: 'Optional',
            },
            soilType: {
              type: 'string',
              enum: ['SANDY', 'CLAY', 'LOAMY'],
              example: 'LOAMY',
              description: 'Optional',
            },
            soilTested: {
              type: 'boolean',
              example: true,
              description: 'Optional',
            },
            previousUse: {
              type: 'string',
              example: 'Coffee plantation',
              description: 'Optional',
            },
            agriculturalSupport: {
              type: 'string',
              example: 'Cooperative nearby',
              description: 'Optional',
            },
            climateInfo: {
              type: 'string',
              example: 'High rainfall Oct-April',
              description: 'Optional',
            },
            zoningType: {
              type: 'string',
              enum: ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'MIXED_USE'],
              example: 'RESIDENTIAL',
              description: 'Optional - For construction',
            },
            electricityAccess: {
              type: 'string',
              enum: ['CONNECTED', 'NEARBY', 'NOT_AVAILABLE', 'FEASIBLE'],
              example: 'NEARBY',
              description: 'Optional',
            },
            waterAccess: {
              type: 'string',
              enum: ['CONNECTED', 'NEARBY', 'NOT_AVAILABLE', 'FEASIBLE'],
              example: 'CONNECTED',
              description: 'Optional',
            },
            sanitationAccess: {
              type: 'string',
              enum: ['CONNECTED', 'NEARBY', 'NOT_AVAILABLE', 'FEASIBLE'],
              example: 'CONNECTED',
              description: 'Optional',
            },
            securityInfo: {
              type: 'string',
              example: 'Gated community 24/7 security',
              description: 'Optional',
            },
            additionalInformation: {
              type: 'string',
              example:
                'Land has environmental clearance. Access road to be paved in 2025.',
              description: 'Optional - Additional details',
            },
            customFeatures: {
              type: 'object',
              example: {
                fruitTrees: '50+ mango trees',
                fencing: 'Electric fence installed',
                borehole: '80m deep',
              },
              description: 'Optional - Custom features',
            },
          },
        },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Optional - Upload images/videos',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Land created',
    schema: {
      example: {
        message: 'Land created with files!',
        data: {
          id: 'uuid',
          title: 'Terreno 5 Hectares',
          price: 5000000,
          images: ['/uploads/land/uuid/img.jpg'],
          videos: [],
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Missing fields' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() body: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // Check if body exists
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException(
        'No data provided. Please provide title, price, and landDetails.',
      );
    }

    const missing: string[] = [];
    if (!body.title) missing.push('title');
    if (!body.landDetails) missing.push('landDetails');
    const hasNumericPrice =
      body.price !== undefined && body.price !== null && body.price !== '';
    const hasTextPrice =
      body.priceText !== undefined &&
      body.priceText !== null &&
      body.priceText !== '';
    if (!hasNumericPrice && !hasTextPrice) missing.push('price or priceText');
    if (missing.length > 0) {
      throw new BadRequestException(
        `Missing required fields: ${missing.join(', ')}. Provide either numeric price or priceText.`,
      );
    }

    const isFormData = typeof body.landDetails === 'string';
    let landDetails;

    if (isFormData) {
      try {
        landDetails = JSON.parse(body.landDetails);
      } catch (error) {
        throw new BadRequestException(
          'Invalid landDetails JSON. Please provide valid JSON string.',
        );
      }
    } else {
      landDetails = body.landDetails;
    }

    // Convert numeric fields from strings to numbers
    if (landDetails.totalArea !== undefined) {
      landDetails.totalArea =
        typeof landDetails.totalArea === 'string'
          ? parseFloat(landDetails.totalArea)
          : landDetails.totalArea;
    }
    if (landDetails.distanceFromMainRoad !== undefined) {
      landDetails.distanceFromMainRoad =
        typeof landDetails.distanceFromMainRoad === 'string'
          ? parseFloat(landDetails.distanceFromMainRoad)
          : landDetails.distanceFromMainRoad;
    }

    // Remove invalid fields that don't exist in the schema
    if (landDetails.features !== undefined) {
      delete landDetails.features;
    }

    // Convert empty strings to null for optional fields
    const optionalStringFields = [
      'waterSource',
      'previousUse',
      'agriculturalSupport',
      'climateInfo',
      'soilType',
      'zoningType',
      'electricityAccess',
      'waterAccess',
      'sanitationAccess',
      'securityInfo',
      'documentType',
    ];

    optionalStringFields.forEach((field) => {
      if (landDetails[field] === '') {
        landDetails[field] = null;
      }
    });

    // Convert boolean strings to booleans
    if (landDetails.hasIrrigationSystem !== undefined) {
      if (typeof landDetails.hasIrrigationSystem === 'string') {
        landDetails.hasIrrigationSystem =
          landDetails.hasIrrigationSystem === 'true';
      }
    }
    if (landDetails.soilTested !== undefined) {
      if (typeof landDetails.soilTested === 'string') {
        landDetails.soilTested = landDetails.soilTested === 'true';
      }
    }
    if (landDetails.isDemarcated !== undefined) {
      if (typeof landDetails.isDemarcated === 'string') {
        landDetails.isDemarcated = landDetails.isDemarcated === 'true';
      }
    }

    const parsedPrice = hasNumericPrice
      ? typeof body.price === 'string'
        ? parseFloat(body.price)
        : body.price
      : undefined;
    const data: any = {
      ...body,
      price: Number.isFinite(parsedPrice) ? parsedPrice : undefined,
      priceText: hasTextPrice ? body.priceText : undefined,
      currency: body.currency || 'AOA',
      isFeatured:
        body.isFeatured === 'true' || body.isFeatured === true || false,
      userId: user.sub,
      images: [],
      videos: [],
      landDetails,
    };

    const listing: any = await this.landListingsService.create(data as any);

    if (files && files.length > 0) {
      const imgs = files.filter((f) => f.mimetype.startsWith('image/'));
      const vids = files.filter((f) => f.mimetype.startsWith('video/'));
      const imageUrls = imgs.length
        ? await this.fileUploadService.saveListingFiles(
            imgs,
            listing.id,
            'land',
          )
        : [];
      const videoUrls = vids.length
        ? await this.fileUploadService.saveListingFiles(
            vids,
            listing.id,
            'land',
          )
        : [];
      const updated = await this.landListingsService.update(listing.id, {
        images: imageUrls,
        videos: videoUrls,
      } as any);
      return { message: 'Land created with files!', data: updated };
    }

    return { message: 'Land created!', data: listing };
  }

  @Get()
  @ApiOperation({ summary: 'Get all land' })
  findAll(@Query() filters: LandListingFilterDto) {
    return this.landListingsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get land by ID' })
  findOne(@Param('id') id: string) {
    return this.landListingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update land (ADMIN only)',
    description: 'Update land listing. Only send fields to change.',
  })
  @ApiParam({ name: 'id', description: 'Land listing UUID' })
  @ApiBody({
    description: 'Fields to update',
    schema: {
      type: 'object',
      example: {
        price: 4500000,
        status: 'SOLD',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(@Param('id') id: string, @Body() dto: UpdateLandListingDto) {
    return this.landListingsService.update(id, dto);
  }

  @Patch(':id/media/add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('files', 15))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Add media (ADMIN)',
    description: '📸 Adds files, keeps existing. Requires: ADMIN token + files',
  })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Media added', imagesAdded: 2 } },
  })
  async addMedia(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files?.length) throw new BadRequestException('No files provided');
    const listing: any = await this.landListingsService.findOne(id);
    const imgs = files.filter((f) => f.mimetype.startsWith('image/'));
    const vids = files.filter((f) => f.mimetype.startsWith('video/'));
    const newImgs = imgs.length
      ? await this.fileUploadService.saveListingFiles(imgs, id, 'land')
      : [];
    const newVids = vids.length
      ? await this.fileUploadService.saveListingFiles(vids, id, 'land')
      : [];
    await this.landListingsService.update(id, {
      images: [...(listing.images || []), ...newImgs],
      videos: [...(listing.videos || []), ...newVids],
    } as any);
    return {
      message: 'Media added',
      imagesAdded: newImgs.length,
      videosAdded: newVids.length,
    };
  }

  @Patch(':id/media/replace')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('files', 15))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Replace media (ADMIN)',
    description: '🔄 DELETES all, uploads new. ⚠️ Warning: Deletes existing!',
  })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Media replaced', totalImages: 3 } },
  })
  async replaceMedia(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files?.length) throw new BadRequestException('No files provided');

    // Get existing listing to delete old files
    const listing: any = await this.landListingsService.findOne(id);
    const oldImages = listing.images || [];
    const oldVideos = listing.videos || [];

    // Delete old physical files
    await this.fileUploadService.deleteMultipleFiles([
      ...oldImages,
      ...oldVideos,
    ]);

    // Upload new files
    const imgs = files.filter((f) => f.mimetype.startsWith('image/'));
    const vids = files.filter((f) => f.mimetype.startsWith('video/'));
    const images = imgs.length
      ? await this.fileUploadService.saveListingFiles(imgs, id, 'land')
      : [];
    const videos = vids.length
      ? await this.fileUploadService.saveListingFiles(vids, id, 'land')
      : [];

    // Update database
    await this.landListingsService.update(id, { images, videos } as any);
    return {
      message: 'Media replaced',
      totalImages: images.length,
      totalVideos: videos.length,
    };
  }

  @Delete(':id/media/:filename')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete file (ADMIN)',
    description: '🗑️ Deletes ONE file. Use filename only: 1696400000-uuid.jpg',
  })
  @ApiParam({ name: 'filename', example: '1696400000-uuid.jpg' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Image deleted', type: 'image' } },
  })
  async deleteMedia(
    @Param('id') id: string,
    @Param('filename') filename: string,
  ) {
    const listing: any = await this.landListingsService.findOne(id);
    const imgs = listing.images || [];
    const vids = listing.videos || [];
    const imgDel = imgs.find((i: string) => i.includes(filename));
    const vidDel = vids.find((v: string) => v.includes(filename));
    if (!imgDel && !vidDel)
      throw new BadRequestException(`File "${filename}" not found`);

    if (imgDel) {
      // Delete physical file
      await this.fileUploadService.deleteSingleFile(imgDel);
      // Update database
      await this.landListingsService.update(id, {
        images: imgs.filter((i: string) => !i.includes(filename)),
      } as any);
      return { message: 'Image deleted', type: 'image' };
    } else {
      // Delete physical file
      await this.fileUploadService.deleteSingleFile(vidDel);
      // Update database
      await this.landListingsService.update(id, {
        videos: vids.filter((v: string) => !v.includes(filename)),
      } as any);
      return { message: 'Video deleted', type: 'video' };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete land (ADMIN only)' })
  async remove(@Param('id') id: string) {
    // Delete all physical files for this listing
    await this.fileUploadService.deleteListingFiles(id, 'land');
    // Delete from database
    await this.landListingsService.remove(id);
    return { message: 'Land listing deleted successfully' };
  }
}
