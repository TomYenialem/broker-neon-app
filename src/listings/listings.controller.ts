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

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get dashboard statistics (ADMIN only)',
    description:
      'Returns comprehensive statistics including total users, total listings, and breakdown by category and status',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    schema: {
      example: {
        users: {
          total: 150,
          admins: 2,
          regularUsers: 148,
        },
        listings: {
          total: 250,
          active: 200,
          sold: 35,
          pending: 10,
          expired: 5,
          featured: 15,
        },
        byCategory: {
          CAR: {
            total: 120,
            active: 100,
            sold: 15,
            pending: 3,
            expired: 2,
          },
          HOUSE: {
            total: 80,
            active: 65,
            sold: 12,
            pending: 2,
            expired: 1,
          },
          LAND: {
            total: 30,
            active: 20,
            sold: 5,
            pending: 3,
            expired: 2,
          },
          MACHINE: {
            total: 20,
            active: 15,
            sold: 3,
            pending: 2,
            expired: 0,
          },
        },
        recentListings: [
          {
            id: 'uuid',
            title: 'Toyota Corolla 2020',
            category: 'CAR',
            price: 8000000,
            status: 'ACTIVE',
            createdAt: '2025-10-16T...',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN role' })
  async getDashboardStats() {
    return this.listingsService.getDashboardStatistics();
  }

  @Get('featured')
  @ApiOperation({
    summary: 'Get featured listings only (Public)',
    description:
      'Returns only featured listings across all categories (cars, houses, land, machines) - Public access',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: ['CAR', 'HOUSE', 'LAND', 'MACHINE'],
    description: 'Filter featured listings by category',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    enum: ['newest', 'oldest', 'price_asc', 'price_desc'],
    example: 'newest',
  })
  @ApiResponse({
    status: 200,
    description: 'Featured listings retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            title: 'Toyota Land Cruiser 2021',
            price: 15000000,
            currency: 'AOA',
            category: 'CAR',
            isFeatured: true,
            images: ['/uploads/car/uuid/img.jpg'],
            carDetails: { make: 'Toyota', model: 'Land Cruiser' },
          },
        ],
        meta: {
          total: 5,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    },
  })
  async getFeaturedListings(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('category') category?: string,
    @Query('sort') sort?: string,
  ) {
    return this.listingsService.getFeaturedListings({
      page,
      limit,
      category,
      sort,
    });
  }

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
