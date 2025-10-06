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
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { LandListingsService } from './land-listings.service';
import { UpdateLandListingDto } from './dto/update-land-listing.dto';
import { LandListingFilterDto } from './dto/land-listing-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
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
  @ApiOperation({ summary: 'Create land listing (ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Land created' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
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
    if (!body.price && body.price !== 0) missing.push('price');
    if (!body.landDetails) missing.push('landDetails');
    if (missing.length > 0) {
      throw new BadRequestException(
        `Missing required fields: ${missing.join(', ')}. Please provide these fields to create a land listing.`,
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

    const data = {
      ...body,
      price:
        typeof body.price === 'string' ? parseFloat(body.price) : body.price,
      currency: body.currency || 'AOA',
      images: [],
      videos: [],
      landDetails,
    };

    const listing: any = await this.landListingsService.create(data as any);

    if (files && files.length > 0) {
      const imgs = files.filter((f) => f.mimetype.startsWith('image/'));
      const vids = files.filter((f) => f.mimetype.startsWith('video/'));
      const imageUrls = imgs.length
        ? this.fileUploadService.saveListingFiles(imgs, listing.id, 'land')
        : [];
      const videoUrls = vids.length
        ? this.fileUploadService.saveListingFiles(vids, listing.id, 'land')
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
  @ApiOperation({ summary: 'Update land (ADMIN only)' })
  update(@Param('id') id: string, @Body() dto: UpdateLandListingDto) {
    return this.landListingsService.update(id, dto);
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
    const listing: any = await this.landListingsService.findOne(id);
    const imgs = files.filter((f) => f.mimetype.startsWith('image/'));
    const vids = files.filter((f) => f.mimetype.startsWith('video/'));
    const newImgs = imgs.length
      ? this.fileUploadService.saveListingFiles(imgs, id, 'land')
      : [];
    const newVids = vids.length
      ? this.fileUploadService.saveListingFiles(vids, id, 'land')
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
  async replaceMedia(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files?.length) throw new BadRequestException('No files provided');
    const imgs = files.filter((f) => f.mimetype.startsWith('image/'));
    const vids = files.filter((f) => f.mimetype.startsWith('video/'));
    const images = imgs.length
      ? this.fileUploadService.saveListingFiles(imgs, id, 'land')
      : [];
    const videos = vids.length
      ? this.fileUploadService.saveListingFiles(vids, id, 'land')
      : [];
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
      await this.landListingsService.update(id, {
        images: imgs.filter((i: string) => !i.includes(filename)),
      } as any);
      return { message: 'Image deleted', type: 'image' };
    } else {
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
    await this.landListingsService.remove(id);
    return { message: 'Land listing deleted successfully' };
  }
}
