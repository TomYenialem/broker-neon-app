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
  @ApiOperation({ summary: 'Create car listing (ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Car created' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
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
  @ApiOperation({ summary: 'Update car (ADMIN only)' })
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
