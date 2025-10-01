// src/car-listings/car-listings.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CarListingsService } from './car-listings.service';
import { CreateCarListingDto } from './dto/create-car-listing.dto';
import { UpdateCarListingDto } from './dto/update-car-listing.dto';
import { CarListingFiltersDto } from './dto/car-listing-filters.dto';

@Controller('car-listings')
export class CarListingsController {
  constructor(private readonly carListingsService: CarListingsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createCarListingDto: CreateCarListingDto) {
    const car = await this.carListingsService.create(createCarListingDto);
    return {
      message: 'Car listing created successfully!',
      data: car,
    };
  }

  @Get()
  async findAll(@Query() filters: CarListingFiltersDto) {
    const cars = await this.carListingsService.findAll(filters);

    if (cars.listings.length === 0) {
      return {
        message: 'No listings found for the given search criteria.',
        data: {
          listings: [],
          pagination: cars.pagination,
        },
      };
    }

    return {
      message: 'Car listings retrieved successfully!',
      data: cars,
    };
  }

  @Get('makes')
  async getAvailableMakes() {
    const makes = await this.carListingsService.getAvailableMakes();
    return {
      message: 'Available car makes retrieved successfully!',
      data: makes,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const car = await this.carListingsService.findOne(id);
    return {
      message: 'Car listing retrieved successfully!',
      data: car,
    };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCarListingDto: UpdateCarListingDto,
  ) {
    const updatedCar = await this.carListingsService.update(
      id,
      updateCarListingDto,
    );
    return {
      message: 'Car listing updated successfully!',
      data: updatedCar,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.carListingsService.remove(id);
    return {
      message: 'Car listing deleted successfully!',
    };
  }
}
