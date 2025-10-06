import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { AllListingsFilterDto } from './dto/all-listings-filter.dto';

@ApiTags('All Listings')
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all listings (all types)',
    description:
      'Retrieve all listings across all categories (Car, Land, House, Machine) with advanced filtering, search, and sorting.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listings retrieved successfully',
    schema: {
      example: {
        listings: [
          {
            id: 'uuid',
            title: 'Toyota Corolla 2020',
            description: 'Excellent car',
            price: 8000000,
            currency: 'AOA',
            status: 'ACTIVE',
            category: 'CAR',
            province: 'Luanda',
            images: [],
            videos: [],
            createdAt: '2025-10-07T00:00:00.000Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 100,
          pages: 5,
        },
      },
    },
  })
  findAll(@Query() filters: AllListingsFilterDto) {
    return this.listingsService.findAll(filters);
  }
}
