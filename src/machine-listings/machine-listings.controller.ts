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
  HttpCode,
  HttpStatus,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
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
import { MachineListingsService } from './machine-listings.service';
import { CreateMachineListingDto } from './dto/create-machine-listing.dto';
import { UpdateMachineListingDto } from './dto/update-machine-listing.dto';
import { MachineListingFilterDto } from './dto/machine-listing-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileUploadService } from '../common/services/file-upload.service';

@ApiTags('Machine Listings')
@Controller('machine-listings')
export class MachineListingsController {
  constructor(
    private readonly machineListingsService: MachineListingsService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('files', 15))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({
    summary: 'Create machine listing (ADMIN only)',
    description:
      'Create machine listing with JSON or form-data. Files optional. Supports multiple images and videos.',
  })
  @ApiBody({
    description: 'Machine listing data - JSON or form-data',
    schema: {
      type: 'object',
      required: ['title', 'price', 'machineDetails'],
      properties: {
        title: { type: 'string', example: 'Caterpillar 320D Excavator 2015' },
        description: { type: 'string', example: 'Well maintained excavator' },
        price: { type: 'number', example: 45000 },
        currency: { type: 'string', enum: ['AOA', 'USD'], default: 'USD' },
        isFeatured: {
          type: 'boolean',
          example: false,
          default: false,
          description: 'Optional - Featured listing',
        },
        province: { type: 'string', example: 'Luanda' },
        userId: { type: 'string', example: 'user-id-optional' },
        machineDetails: {
          type: 'object',
          description: `
Machine details object with required and optional fields:

REQUIRED FIELDS:
- machineType (string): Type of equipment (e.g., Excavator, Forklift, Generator, Bulldozer)
- condition (enum): NEW, USED, RECONDITIONED

OPTIONAL FIELDS:
- modelNumber (string): e.g., 320D, 8FD30
- manufactureYear (number): e.g., 2015
- hoursOfUse (number): Operating hours (like mileage for vehicles)
- workingCapacity (string): e.g., "Digging depth: 6.5m, Bucket: 1.2m³"
- specifications (string): Technical specs (weight, engine, power)
- serviceHistory (boolean): Service records available?
- reasonForSale (string): Why selling
- sparePartsAvailability (enum): EASILY_AVAILABLE, AVAILABLE, DIFFICULT, NOT_AVAILABLE
- currentLocation (string): Where to inspect`,
          required: ['machineType', 'condition'],
          properties: {
            machineType: {
              type: 'string',
              example: 'Excavator',
              description: 'Required - e.g., Excavator, Forklift, Generator',
            },
            modelNumber: {
              type: 'string',
              example: '320D',
              description: 'Optional',
            },
            condition: {
              type: 'string',
              enum: ['NEW', 'USED', 'RECONDITIONED'],
              example: 'USED',
              description: 'Required',
            },
            manufactureYear: {
              type: 'number',
              example: 2015,
              description: 'Optional',
            },
            hoursOfUse: {
              type: 'number',
              example: 8500,
              description: 'Optional - Equivalent to mileage',
            },
            workingCapacity: {
              type: 'string',
              example: 'Digging depth: 6.5m, Bucket: 1.2m³',
              description: 'Optional',
            },
            specifications: {
              type: 'string',
              example: 'Weight: 22,000kg, Engine: Cat C6.6, Power: 122HP',
              description: 'Optional',
            },
            serviceHistory: {
              type: 'boolean',
              example: true,
              description: 'Optional',
            },
            reasonForSale: {
              type: 'string',
              example: 'Project completed',
              description: 'Optional',
            },
            sparePartsAvailability: {
              type: 'string',
              enum: [
                'EASILY_AVAILABLE',
                'AVAILABLE',
                'DIFFICULT',
                'NOT_AVAILABLE',
              ],
              example: 'EASILY_AVAILABLE',
              description: 'Optional',
            },
            currentLocation: {
              type: 'string',
              example: 'Viana Industrial Zone',
              description: 'Optional',
            },
            additionalInformation: {
              type: 'string',
              example:
                'Machine comes with spare bucket and hydraulic hammer attachment. Training included.',
              description: 'Optional - Additional details',
            },
            customFeatures: {
              type: 'object',
              example: {
                warranty: '6 months parts',
                delivery: 'Free within Luanda',
                training: '2 days included',
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
    description: 'Machine created',
    schema: {
      example: {
        message: 'Machine listing created successfully with files!',
        data: {
          id: 'uuid',
          title: 'Caterpillar 320D Excavator',
          price: 45000,
          currency: 'USD',
          images: ['/uploads/machine/uuid/img.jpg'],
          videos: ['/uploads/machine/uuid/video.mp4'],
        },
        filesUploaded: {
          images: 1,
          videos: 1,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Missing fields' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN' })
  async create(
    @Body() body: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // Check if body exists
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException(
        'No data provided. Please provide title, price, and machineDetails.',
      );
    }

    const missingFields: string[] = [];
    if (!body.title) missingFields.push('title');
    if (!body.price && body.price !== 0) missingFields.push('price');
    if (!body.machineDetails) missingFields.push('machineDetails');

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Missing required fields: ${missingFields.join(', ')}. Please provide these fields to create a machine listing.`,
      );
    }

    const isFormData = typeof body.machineDetails === 'string';
    let machineDetails;

    if (isFormData) {
      try {
        machineDetails = JSON.parse(body.machineDetails);
      } catch (error) {
        throw new BadRequestException(
          'Invalid machineDetails JSON. Please provide valid JSON string.',
        );
      }
    } else {
      machineDetails = body.machineDetails;
    }

    const listingData = {
      title: body.title,
      description: body.description,
      price:
        typeof body.price === 'string' ? parseFloat(body.price) : body.price,
      currency: body.currency || 'AOA',
      status: body.status || 'ACTIVE',
      isFeatured:
        body.isFeatured === 'true' || body.isFeatured === true || false,
      province: body.province,
      municipality: body.municipality,
      neighborhood: body.neighborhood,
      userId: body.userId || undefined,
      images: [],
      videos: [],
      machineDetails,
    };

    const listing: any = await this.machineListingsService.create(
      listingData as any,
    );

    if (files && files.length > 0) {
      const imageFiles = files.filter((f) => f.mimetype.startsWith('image/'));
      const videoFiles = files.filter((f) => f.mimetype.startsWith('video/'));

      const imageUrls =
        imageFiles.length > 0
          ? this.fileUploadService.saveListingFiles(
              imageFiles,
              listing.id,
              'machine',
            )
          : [];

      const videoUrls =
        videoFiles.length > 0
          ? this.fileUploadService.saveListingFiles(
              videoFiles,
              listing.id,
              'machine',
            )
          : [];

      const updated = await this.machineListingsService.update(listing.id, {
        images: imageUrls,
        videos: videoUrls,
      } as any);

      return {
        message: 'Machine listing created successfully with files!',
        data: updated,
        filesUploaded: { images: imageUrls.length, videos: videoUrls.length },
      };
    }

    return { message: 'Machine listing created successfully!', data: listing };
  }

  @Get()
  @ApiOperation({ summary: 'Get all machine listings' })
  @ApiResponse({ status: 200, description: 'Machine listings retrieved' })
  findAll(@Query() filters: MachineListingFilterDto) {
    return this.machineListingsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get machine listing by ID' })
  @ApiParam({ name: 'id', description: 'Machine listing UUID' })
  @ApiResponse({ status: 200, description: 'Machine listing found' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id') id: string) {
    return this.machineListingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update machine (ADMIN only)',
    description: 'Update machine listing. Only send fields to change.',
  })
  @ApiParam({ name: 'id', description: 'Machine listing UUID' })
  @ApiBody({
    description: 'Fields to update',
    schema: {
      type: 'object',
      example: {
        price: 42000,
        status: 'SOLD',
        description: 'Price reduced for quick sale',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(@Param('id') id: string, @Body() dto: UpdateMachineListingDto) {
    return this.machineListingsService.update(id, dto);
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
  @ApiParam({ name: 'id', description: 'Machine listing UUID' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Media added', imagesAdded: 2 } },
  })
  async addMedia(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const listing: any = await this.machineListingsService.findOne(id);
    const imageFiles = files.filter((f) => f.mimetype.startsWith('image/'));
    const videoFiles = files.filter((f) => f.mimetype.startsWith('video/'));

    const newImages =
      imageFiles.length > 0
        ? this.fileUploadService.saveListingFiles(imageFiles, id, 'machine')
        : [];
    const newVideos =
      videoFiles.length > 0
        ? this.fileUploadService.saveListingFiles(videoFiles, id, 'machine')
        : [];

    const allImages = [...(listing.images || []), ...newImages];
    const allVideos = [...(listing.videos || []), ...newVideos];

    await this.machineListingsService.update(id, {
      images: allImages,
      videos: allVideos,
    } as any);

    return {
      message: 'Media added successfully',
      imagesAdded: newImages.length,
      videosAdded: newVideos.length,
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
    description: '🔄 DELETES all, uploads new. ⚠️ Deletes existing!',
  })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Media replaced', totalImages: 3 } },
  })
  async replaceMedia(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const imageFiles = files.filter((f) => f.mimetype.startsWith('image/'));
    const videoFiles = files.filter((f) => f.mimetype.startsWith('video/'));

    const images =
      imageFiles.length > 0
        ? this.fileUploadService.saveListingFiles(imageFiles, id, 'machine')
        : [];
    const videos =
      videoFiles.length > 0
        ? this.fileUploadService.saveListingFiles(videoFiles, id, 'machine')
        : [];

    await this.machineListingsService.update(id, { images, videos } as any);

    return {
      message: 'Media replaced successfully',
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
    const listing: any = await this.machineListingsService.findOne(id);
    const images = listing.images || [];
    const videos = listing.videos || [];

    const imgToDelete = images.find((img: string) => img.includes(filename));
    const vidToDelete = videos.find((vid: string) => vid.includes(filename));

    if (!imgToDelete && !vidToDelete) {
      throw new BadRequestException(
        `File "${filename}" not found. Use filename only, not full path.`,
      );
    }

    if (imgToDelete) {
      const updated = images.filter((img: string) => !img.includes(filename));
      await this.machineListingsService.update(id, { images: updated } as any);
      return { message: 'Image deleted successfully', type: 'image' };
    } else {
      const updated = videos.filter((vid: string) => !vid.includes(filename));
      await this.machineListingsService.update(id, { videos: updated } as any);
      return { message: 'Video deleted successfully', type: 'video' };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete machine listing (ADMIN only)' })
  @ApiResponse({
    status: 200,
    schema: { example: { message: 'Machine listing deleted successfully' } },
  })
  async remove(@Param('id') id: string) {
    await this.machineListingsService.remove(id);
    return { message: 'Machine listing deleted successfully' };
  }
}
