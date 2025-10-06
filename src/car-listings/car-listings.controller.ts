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
  ParseUUIDPipe,
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
import { CarListingsService } from './car-listings.service';
import { UpdateCarListingDto } from './dto/update-car-listing.dto';
import { CarListingFiltersDto } from './dto/car-listing-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileUploadService } from '../common/services/file-upload.service';

@ApiTags('Car Listings')
@Controller('car-listings')
export class CarListingsController {
  constructor(
    private readonly carListingsService: CarListingsService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('files', 15))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({
    summary: 'Create car listing (ADMIN only)',
    description:
      'Create car listing with JSON or form-data. Files optional. Supports multiple images and videos.',
  })
  @ApiBody({
    description: 'Car listing data - JSON or form-data',
    schema: {
      type: 'object',
      required: ['title', 'price', 'carDetails'],
      properties: {
        title: { type: 'string', example: 'Toyota Corolla 2020' },
        description: { type: 'string', example: 'Excellent condition' },
        price: { type: 'number', example: 8000000 },
        currency: { type: 'string', enum: ['AOA', 'USD'], default: 'AOA' },
        province: { type: 'string', example: 'Luanda' },
        userId: { type: 'string', example: 'user-id-optional' },
        carDetails: {
          type: 'object',
          description: `
Car details object with required and optional fields:

REQUIRED FIELDS:
- make (string): Car manufacturer (e.g., Toyota, Honda)
- model (string): Car model (e.g., Corolla, Civic)
- fuelType (enum): GASOLINE, DIESEL, HYBRID, ELECTRIC
- transmission (enum): MANUAL, AUTOMATIC
- condition (enum): NEW, EXCELLENT, GOOD, NEEDS_REPAIR
- customsStatus (enum): LEGALIZED, PENDING, NOT_LEGALIZED - Critical in Angola!
- features (array of strings): Can be empty []

OPTIONAL FIELDS:
- trimLevel (string): e.g., XLE, Sport
- manufactureYear (number): e.g., 2020
- registrationYear (number): e.g., 2020
- mileage (number): Kilometers
- color (string): e.g., White, Black
- interiorType (enum): LEATHER, FABRIC
- vehicleOrigin (enum): EUROPE, ASIA, AMERICA, AFRICA
- serviceHistory (boolean)
- reasonForSelling (string)`,
          required: [
            'make',
            'model',
            'fuelType',
            'transmission',
            'condition',
            'customsStatus',
            'features',
          ],
          properties: {
            make: {
              type: 'string',
              example: 'Toyota',
              description: 'Car manufacturer (Required)',
            },
            model: {
              type: 'string',
              example: 'Corolla',
              description: 'Car model (Required)',
            },
            trimLevel: {
              type: 'string',
              example: 'XLE',
              description: 'Optional',
            },
            manufactureYear: {
              type: 'number',
              example: 2020,
              description: 'Optional',
            },
            registrationYear: {
              type: 'number',
              example: 2020,
              description: 'Optional',
            },
            mileage: {
              type: 'number',
              example: 45000,
              description: 'Kilometers (Optional)',
            },
            fuelType: {
              type: 'string',
              enum: ['GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC'],
              example: 'GASOLINE',
              description: 'Required',
            },
            transmission: {
              type: 'string',
              enum: ['MANUAL', 'AUTOMATIC'],
              example: 'AUTOMATIC',
              description: 'Required',
            },
            condition: {
              type: 'string',
              enum: ['NEW', 'EXCELLENT', 'GOOD', 'NEEDS_REPAIR'],
              example: 'EXCELLENT',
              description: 'Required',
            },
            color: {
              type: 'string',
              example: 'White',
              description: 'Optional',
            },
            interiorType: {
              type: 'string',
              enum: ['LEATHER', 'FABRIC'],
              example: 'LEATHER',
              description: 'Optional',
            },
            vehicleOrigin: {
              type: 'string',
              enum: ['EUROPE', 'ASIA', 'AMERICA', 'AFRICA'],
              example: 'EUROPE',
              description: 'Optional',
            },
            customsStatus: {
              type: 'string',
              enum: ['LEGALIZED', 'PENDING', 'NOT_LEGALIZED'],
              example: 'LEGALIZED',
              description: 'Required - Critical in Angola',
            },
            serviceHistory: {
              type: 'boolean',
              example: true,
              description: 'Optional',
            },
            reasonForSelling: {
              type: 'string',
              example: 'Upgrading',
              description: 'Optional',
            },
            features: {
              type: 'array',
              items: { type: 'string' },
              example: ['4x4', 'AC', 'Cruise Control', 'Sunroof'],
              description: 'Required - Can be empty array',
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
    description: 'Car created',
    schema: {
      example: {
        message: 'Car created with files!',
        data: {
          id: 'uuid',
          title: 'Toyota Corolla 2020',
          price: 8000000,
          images: ['/uploads/car/uuid/img.jpg'],
          videos: ['/uploads/car/uuid/video.mp4'],
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
        'No data provided. Please provide title, price, and carDetails.',
      );
    }

    const missing: string[] = [];
    if (!body.title) missing.push('title');
    if (!body.price && body.price !== 0) missing.push('price');
    if (!body.carDetails) missing.push('carDetails');
    if (missing.length > 0) {
      throw new BadRequestException(
        `Missing required fields: ${missing.join(', ')}. Please provide these fields to create a car listing.`,
      );
    }

    const isFormData = typeof body.carDetails === 'string';
    let carDetails;

    if (isFormData) {
      try {
        carDetails = JSON.parse(body.carDetails);
      } catch (error) {
        throw new BadRequestException(
          'Invalid carDetails JSON. Please provide valid JSON string.',
        );
      }
    } else {
      carDetails = body.carDetails;
    }

    const data = {
      ...body,
      price:
        typeof body.price === 'string' ? parseFloat(body.price) : body.price,
      currency: body.currency || 'AOA',
      images: [],
      videos: [],
      carDetails,
    };

    const listing: any = await this.carListingsService.create(data as any);

    if (files !== undefined && files.length > 0) {
      const imgs = files.filter((f) => f.mimetype.startsWith('image/'));
      const vids = files.filter((f) => f.mimetype.startsWith('video/'));

      const imageUrls =
        imgs.length > 0
          ? this.fileUploadService.saveListingFiles(imgs, listing.id, 'car')
          : [];
      const videoUrls =
        vids.length > 0
          ? this.fileUploadService.saveListingFiles(vids, listing.id, 'car')
          : [];

      const updated = await this.carListingsService.update(listing.id, {
        images: imageUrls,
        videos: videoUrls,
      } as any);
      return { message: 'Car created with files!', data: updated };
    }

    return { message: 'Car created!', data: listing };
  }

  @Get()
  @ApiOperation({ summary: 'Get all cars' })
  findAll(@Query() filters: CarListingFiltersDto) {
    return this.carListingsService.findAll(filters);
  }

  @Get('makes')
  @ApiOperation({ summary: 'Get car makes' })
  getAvailableMakes() {
    return this.carListingsService.getAvailableMakes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get car by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.carListingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update car (ADMIN only)',
    description: 'Update car listing. Only send fields you want to change.',
  })
  @ApiParam({ name: 'id', description: 'Car listing UUID' })
  @ApiBody({
    description: 'Fields to update (all optional)',
    schema: {
      type: 'object',
      example: {
        price: 7500000,
        status: 'SOLD',
        description: 'VENDIDO! Price was 8M',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Updated',
    schema: { example: { message: 'Car updated', data: {} } },
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCarListingDto,
  ) {
    return this.carListingsService.update(id, dto);
  }

  @Patch(':id/media/add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('files', 15))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Add media (ADMIN only)',
    description:
      '📸 Adds images/videos to car. Requires: ADMIN token, files in form-data. Keeps existing media.',
  })
  @ApiParam({ name: 'id', description: 'Car listing UUID' })
  @ApiResponse({
    status: 200,
    description: 'Media added',
    schema: {
      example: { message: 'Media added', imagesAdded: 2, videosAdded: 1 },
    },
  })
  async addMedia(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files?.length) throw new BadRequestException('No files provided');
    const listing: any = await this.carListingsService.findOne(id);
    const imgs = files.filter((f) => f.mimetype.startsWith('image/'));
    const vids = files.filter((f) => f.mimetype.startsWith('video/'));
    const newImgs = imgs.length
      ? this.fileUploadService.saveListingFiles(imgs, id, 'car')
      : [];
    const newVids = vids.length
      ? this.fileUploadService.saveListingFiles(vids, id, 'car')
      : [];
    await this.carListingsService.update(id, {
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
    summary: 'Replace all media (ADMIN only)',
    description:
      '🔄 DELETES all media, uploads new. Requires: ADMIN token, new files. ⚠️ Warning: Deletes existing!',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: { message: 'Media replaced', totalImages: 3, totalVideos: 1 },
    },
  })
  async replaceMedia(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files?.length) throw new BadRequestException('No files provided');
    const imgs = files.filter((f) => f.mimetype.startsWith('image/'));
    const vids = files.filter((f) => f.mimetype.startsWith('video/'));
    const images = imgs.length
      ? this.fileUploadService.saveListingFiles(imgs, id, 'car')
      : [];
    const videos = vids.length
      ? this.fileUploadService.saveListingFiles(vids, id, 'car')
      : [];
    await this.carListingsService.update(id, { images, videos } as any);
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
    summary: 'Delete one file (ADMIN only)',
    description:
      '🗑️ Deletes ONE file. Requires: filename only (NOT full path). Example: 1696400000-uuid.jpg',
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
    const listing: any = await this.carListingsService.findOne(id);
    const imgs = listing.images || [];
    const vids = listing.videos || [];
    const imgDel = imgs.find((i: string) => i.includes(filename));
    const vidDel = vids.find((v: string) => v.includes(filename));
    if (!imgDel && !vidDel)
      throw new BadRequestException(`File "${filename}" not found`);
    if (imgDel) {
      await this.carListingsService.update(id, {
        images: imgs.filter((i: string) => !i.includes(filename)),
      } as any);
      return { message: 'Image deleted', type: 'image' };
    } else {
      await this.carListingsService.update(id, {
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
  @ApiOperation({ summary: 'Delete car (ADMIN only)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.carListingsService.remove(id);
    return { message: 'Car listing deleted successfully' };
  }
}
