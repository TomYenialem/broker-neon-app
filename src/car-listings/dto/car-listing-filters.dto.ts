// src/car-listings/dto/car-listing-filters.dto.ts
import { IsOptional, IsNumber, IsString, IsEnum, Min, isString } from 'class-validator';
import { Type } from 'class-transformer';
import {
  FuelType,
  Transmission,
  VehicleCondition,
  VehicleOrigin,
  CustomsStatus,
} from '@prisma/client';

export class CarListingFiltersDto {
  @IsOptional()
  @IsNumber({}, { message: 'Page must be a number' })
  @Type(() => Number)
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  @Type(() => Number)
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Minimum price must be a number' })
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Maximum price must be a number' })
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsString({ message: 'Province must be a string' })
  province?: string;

  @IsOptional()
  @IsString({ message: 'color must be a string' })
  color?: string;

  @IsOptional()
  @IsString({ message: 'Municipality must be a string' })
  municipality?: string;

  @IsOptional()
  @IsString({ message: 'Neighborhood must be a string' })
  neighborhood?: string;

  @IsOptional()
  @IsString({ message: 'Make must be a string' })
  make?: string;

  @IsOptional()
  @IsString({ message: 'Model must be a string' })
  model?: string;

  @IsOptional()
  @IsEnum(FuelType, { message: 'Fuel type must be a valid enum value' })
  fuelType?: FuelType;

  @IsOptional()
  @IsEnum(Transmission, { message: 'Transmission must be a valid enum value' })
  transmission?: Transmission;

  @IsOptional()
  @IsEnum(VehicleCondition, { message: 'Condition must be a valid enum value' })
  condition?: VehicleCondition;

  @IsOptional()
  @IsEnum(VehicleOrigin, {
    message: 'Vehicle origin must be a valid enum value',
  })
  vehicleOrigin?: VehicleOrigin;

  @IsOptional()
  @IsEnum(CustomsStatus, {
    message: 'Customs status must be a valid enum value',
  })
  customsStatus?: CustomsStatus;

  @IsOptional()
  @IsNumber({}, { message: 'Minimum year must be a number' })
  @Type(() => Number)
  minYear?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Maximum year must be a number' })
  @Type(() => Number)
  maxYear?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Maximum mileage must be a number' })
  @Type(() => Number)
  maxMileage?: number;
}
