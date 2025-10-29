import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  Currency,
  ListingStatus,
  ListingCategory,
  FuelType,
  Transmission,
  VehicleCondition,
  HouseType,
  MachineCondition,
  LandPurpose,
  ZoningType,
} from '@prisma/client';

export class AllListingsFilterDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Minimum price', example: 1000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price', example: 100000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Listing status', enum: ListingStatus })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @ApiPropertyOptional({
    description: 'Listing category',
    enum: ListingCategory,
  })
  @IsOptional()
  @IsEnum(ListingCategory)
  category?: ListingCategory;

  @ApiPropertyOptional({
    description: 'Search in title, description, province',
    example: 'Luanda',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Province', example: 'Luanda' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['newest', 'oldest', 'price_asc', 'price_desc'],
    default: 'newest',
  })
  @IsOptional()
  @IsString()
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' = 'newest';

  @ApiPropertyOptional({ description: 'Currency filter', enum: Currency })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  // Car-specific filters
  @ApiPropertyOptional({
    description: 'Car fuel type',
    enum: FuelType,
  })
  @IsOptional()
  @IsEnum(FuelType)
  carFuelType?: FuelType;

  @ApiPropertyOptional({
    description: 'Car transmission type',
    enum: Transmission,
  })
  @IsOptional()
  @IsEnum(Transmission)
  carTransmission?: Transmission;

  @ApiPropertyOptional({
    description: 'Car condition',
    enum: VehicleCondition,
  })
  @IsOptional()
  @IsEnum(VehicleCondition)
  carCondition?: VehicleCondition;

  // House-specific filters
  @ApiPropertyOptional({
    description: 'House type',
    enum: HouseType,
  })
  @IsOptional()
  @IsEnum(HouseType)
  houseHouseType?: HouseType;

  @ApiPropertyOptional({
    description: 'Number of bedrooms',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  houseBedrooms?: number;

  @ApiPropertyOptional({
    description: 'Number of bathrooms',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  houseBathrooms?: number;

  @ApiPropertyOptional({
    description: 'House furnished status (Furnished, Unfurnished, Partially Furnished)',
    example: 'Furnished',
  })
  @IsOptional()
  @IsString()
  houseFurnished?: string;

  // Land-specific filters
  @ApiPropertyOptional({
    description: 'Land purpose',
    enum: LandPurpose,
  })
  @IsOptional()
  @IsEnum(LandPurpose)
  landLandPurpose?: LandPurpose;

  @ApiPropertyOptional({
    description: 'Zoning type',
    enum: ZoningType,
  })
  @IsOptional()
  @IsEnum(ZoningType)
  landZoningType?: ZoningType;

  @ApiPropertyOptional({
    description: 'Minimum land area (square meters)',
    example: 500,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  landMinArea?: number;

  @ApiPropertyOptional({
    description: 'Maximum land area (square meters)',
    example: 5000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  landMaxArea?: number;

  // Machine-specific filters
  @ApiPropertyOptional({
    description: 'Machine type',
    example: 'Construction',
  })
  @IsOptional()
  @IsString()
  machineMachineType?: string;

  @ApiPropertyOptional({
    description: 'Machine condition',
    enum: MachineCondition,
  })
  @IsOptional()
  @IsEnum(MachineCondition)
  machineCondition?: MachineCondition;
}
