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
  create(@Body() createCarListingDto: CreateCarListingDto) {
    return this.carListingsService.create(createCarListingDto);
  }

  @Get()
  findAll(@Query() filters: CarListingFiltersDto) {
    return this.carListingsService.findAll(filters);
  }

  @Get('makes')
  getAvailableMakes() {
    return this.carListingsService.getAvailableMakes();
  }

  // @Get('models/:make')
  // getModelsByMake(@Param('make') make: string) {
  //   return this.carListingsService.getModelsByMake(make);
  // }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.carListingsService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCarListingDto: UpdateCarListingDto,
  ) {
    return this.carListingsService.update(id, updateCarListingDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.carListingsService.remove(id);
  }
}
