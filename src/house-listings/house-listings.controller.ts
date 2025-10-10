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
          'video/x-msvideo',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(`File type ${file.mimetype} not allowed`),
            false,
          );
        }
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new house listing',
    description: 'Creates a new house listing with images and videos',
  })
  @ApiResponse({
    status: 201,
    description: 'House listing created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN role' })
  async create(
    @Body() createHouseListingDto: CreateHouseListingDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: JwtPayload,
  ) {
    // Handle file uploads if files are provided
    if (files && files.length > 0) {
      // TODO: Implement file upload logic
      console.log('Files uploaded:', files.length);
    }

    return this.houseListingsService.create(createHouseListingDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all house listings',
    description: 'Retrieves all house listings with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'House listings retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN role' })
  async findAll(@Query() filterDto: HouseListingFilterDto) {
    return this.houseListingsService.findAll(filterDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get a house listing by ID',
    description: 'Retrieves a specific house listing by its ID',
  })
  @ApiParam({ name: 'id', description: 'House listing ID' })
  @ApiResponse({
    status: 200,
    description: 'House listing retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN role' })
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a house listing',
    description: 'Deletes a specific house listing',
  })
  @ApiParam({ name: 'id', description: 'House listing ID' })
  @ApiResponse({
    status: 204,
    description: 'House listing deleted successfully',
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
