import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { LandListingsService } from './land-listings.service';
import { CreateLandListingDto } from './dto/create-land-listing.dto';
import { UpdateLandListingDto } from './dto/update-land-listing.dto';
import { LandListingFilterDto } from './dto/land-listing-filter.dto';

@Controller('land-listings')
export class LandListingsController {
  constructor(private readonly landListingsService: LandListingsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createLandListingDto: CreateLandListingDto) {
    const land = await this.landListingsService.create(createLandListingDto);
    return {
      message: 'Land listing created successfully!',
      data: land,
    };
    //
  
  }

  @Get()
  async findAll(@Query() filters: LandListingFilterDto) {
    const lands = await this.landListingsService.findAll(filters);

    if (lands.listings.length === 0) {
      return {
        message: 'No listings found for the given search criteria.',
        data: { listings: [], pagination: lands.pagination },
      };
    }
    return {
      message: 'Land listings retrieved successfully!',
      data: lands,
    };
   
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const land= await this.landListingsService.findOne(id);
    return {
      message: 'Land listing retrieved successfully!',
      data: land,
    };
    
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(@Param('id') id: string, @Body() updateLandListingDto: UpdateLandListingDto) {
    const updatedLand = await this.landListingsService.update(id, updateLandListingDto);
    return {
      message: 'Land listing updated successfully!',
      data: updatedLand,
    };
    //


  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
async remove(@Param('id') id: string) {
  await this.landListingsService.remove(id);
  return {
    message: 'Land listing deleted successfully!',  
    
  }
}}
