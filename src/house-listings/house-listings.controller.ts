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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
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
  @UseInterceptors(FilesInterceptor('files', 15))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({
    summary: 'Create house listing (ADMIN only)',
    description:
      'Create house listing with JSON or form-data. Files optional. Supports multiple images and videos.',
  })
  @ApiBody({
    description: 'House listing data - JSON or form-data',
    schema: {
      type: 'object',
      required: ['title', 'price', 'houseDetails'],
      properties: {
        title: { type: 'string', example: 'Modern Villa in Talatona' },
        description: { type: 'string', example: 'Beautiful 4-bedroom villa' },
        price: { type: 'number', example: 25000000 },
        currency: { type: 'string', enum: ['AOA', 'USD'], default: 'AOA' },
        isFeatured: {
          type: 'boolean',
          example: false,
          default: false,
          description: 'Optional - Featured listing',
        },
        province: { type: 'string', example: 'Luanda' },
        municipality: { type: 'string', example: 'Talatona' },
        houseDetails: { type: 'object', description: 'House details object' },
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
    description: 'House listing created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN role' })
  async create(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: JwtPayload,
  ) {
    // Check if body exists
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException(
        'No data provided. Please provide title, price, and houseDetails.',
      );
    }

    const missing: string[] = [];
    if (!body.title) missing.push('title');
    if (!body.price && body.price !== 0) missing.push('price');
    if (!body.houseDetails) missing.push('houseDetails');
    if (missing.length > 0) {
      throw new BadRequestException(
        `Missing required fields: ${missing.join(', ')}. Please provide these fields to create a house listing.`,
      );
    }

    const isFormData = typeof body.houseDetails === 'string';
    let houseDetails;

    if (isFormData) {
      try {
        houseDetails = JSON.parse(body.houseDetails);
      } catch (error) {
        throw new BadRequestException(
          'Invalid houseDetails JSON. Please provide valid JSON string.',
        );
      }
    } else {
      houseDetails = body.houseDetails;
    }

    const data = {
      ...body,
      price:
        typeof body.price === 'string' ? parseFloat(body.price) : body.price,
      currency: body.currency || 'AOA',
      isFeatured:
        body.isFeatured === 'true' || body.isFeatured === true || false,
      userId: user.sub,
      images: [],
      videos: [],
      houseDetails,
    };

    const listing: any = await this.houseListingsService.create(data as any);

    if (files && files.length > 0) {
      const imgs = files.filter((f) => f.mimetype.startsWith('image/'));
      const vids = files.filter((f) => f.mimetype.startsWith('video/'));

      const imageUrls =
        imgs.length > 0
          ? await this.fileUploadService.saveListingFiles(
              imgs,
              listing.id,
              'house',
            )
          : [];
      const videoUrls =
        vids.length > 0
          ? await this.fileUploadService.saveListingFiles(
              vids,
              listing.id,
              'house',
            )
          : [];

      const updated = await this.houseListingsService.update(listing.id, {
        images: imageUrls,
        videos: videoUrls,
      } as any);
      return { message: 'House created with files!', data: updated };
    }

    return { message: 'House created!', data: listing };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all house listings',
    description: 'Retrieves all house listings with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'House listings retrieved successfully',
  })
  async findAll(@Query() filterDto: HouseListingFilterDto) {
    return this.houseListingsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a house listing by ID',
    description: 'Retrieves a specific house listing by its ID',
  })
  @ApiParam({ name: 'id', description: 'House listing ID' })
  @ApiResponse({
    status: 200,
    description: 'House listing retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'House listing not found' })
  async findOne(@Param('id') id: string) {
    return this.houseListingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a house listing',
    description: 'Updates a specific house listing',
  })
  @ApiParam({ name: 'id', description: 'House listing ID' })
  @ApiResponse({
    status: 200,
    description: 'House listing updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN role' })
  @ApiResponse({ status: 404, description: 'House listing not found' })
  async update(
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
    summary: 'Add media (ADMIN only)',
    description:
      '📸 Adds images/videos to house. Requires: ADMIN token, files in form-data. Keeps existing media.',
  })
  @ApiParam({ name: 'id', description: 'House listing UUID' })
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
    const listing: any = await this.houseListingsService.findOne(id);
    const imgs = files.filter((f) => f.mimetype.startsWith('image/'));
    const vids = files.filter((f) => f.mimetype.startsWith('video/'));
    const newImgs = imgs.length
      ? await this.fileUploadService.saveListingFiles(imgs, id, 'house')
      : [];
    const newVids = vids.length
      ? await this.fileUploadService.saveListingFiles(vids, id, 'house')
      : [];
    await this.houseListingsService.update(id, {
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

    // Get existing listing to delete old files
    const listing: any = await this.houseListingsService.findOne(id);
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
      ? await this.fileUploadService.saveListingFiles(imgs, id, 'house')
      : [];
    const videos = vids.length
      ? await this.fileUploadService.saveListingFiles(vids, id, 'house')
      : [];

    // Update database
    await this.houseListingsService.update(id, { images, videos } as any);
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
    const listing: any = await this.houseListingsService.findOne(id);
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
      await this.houseListingsService.update(id, {
        images: imgs.filter((i: string) => !i.includes(filename)),
      } as any);
      return { message: 'Image deleted', type: 'image' };
    } else {
      // Delete physical file
      await this.fileUploadService.deleteSingleFile(vidDel);
      // Update database
      await this.houseListingsService.update(id, {
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
  @ApiOperation({
    summary: 'Delete a house listing',
    description: 'Deletes a specific house listing',
  })
  @ApiParam({ name: 'id', description: 'House listing ID' })
  @ApiResponse({
    status: 200,
    description: 'House listing deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN role' })
  @ApiResponse({ status: 404, description: 'House listing not found' })
  async remove(@Param('id') id: string) {
    // Delete all physical files for this listing
    await this.fileUploadService.deleteListingFiles(id, 'house');
    // Delete from database
    await this.houseListingsService.remove(id);
    return {
      message: 'House listing deleted successfully',
    };
  }
}
