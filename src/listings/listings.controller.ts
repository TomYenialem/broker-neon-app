import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Param,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ListingsService } from './listings.service';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get('public')
  @ApiOperation({
    summary: 'Get all active listings (Public)',
    description:
      'Returns all active listings (cars, houses, land, machines) with pagination and optional filters - Public access',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: ['CAR', 'HOUSE', 'LAND', 'MACHINE'],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'SOLD', 'PENDING', 'EXPIRED'],
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'province', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'All listings retrieved successfully',
  })
  async getPublicListings(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('province') province?: string,
    @Query('sort') sort?: string,
  ) {
    // Parse numeric values with validation
    const parsedMinPrice = minPrice
      ? isNaN(parseInt(minPrice, 10))
        ? undefined
        : parseInt(minPrice, 10)
      : undefined;
    const parsedMaxPrice = maxPrice
      ? isNaN(parseInt(maxPrice, 10))
        ? undefined
        : parseInt(maxPrice, 10)
      : undefined;

    return this.listingsService.getAllListings({
      page,
      limit,
      category,
      status,
      search,
      minPrice: parsedMinPrice,
      maxPrice: parsedMaxPrice,
      province,
      sort,
    });
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all listings across all categories (ADMIN only)',
    description:
      'Returns all listings (cars, houses, land, machines) with pagination and optional filters',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: ['CAR', 'HOUSE', 'LAND', 'MACHINE'],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'SOLD', 'PENDING', 'EXPIRED'],
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'All listings retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN' })
  async getAllListings(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.listingsService.getAllListings({
      page,
      limit,
      category,
      status,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get listing by ID (Public)',
    description:
      'Returns a single listing with all details by ID - Public access',
  })
  @ApiResponse({
    status: 200,
    description: 'Listing retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async getListingById(@Param('id') id: string) {
    const listing = await this.listingsService.getListingById(id);
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    return listing;
  }
}
