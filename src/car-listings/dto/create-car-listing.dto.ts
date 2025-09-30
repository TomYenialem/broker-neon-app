// src/car-listings/dto/create-car-listing.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsNotEmpty,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Currency,
  FuelType,
  Transmission,
  VehicleCondition,
  InteriorType,
  VehicleOrigin,
  CustomsStatus,
  ListingStatus,
} from '@prisma/client';

export class CarDetailsDto {
  @IsString({ message: 'Make must be a string' })
  @IsNotEmpty({ message: 'Make cannot be empty' })
  make: string;

  @IsString({ message: 'Model must be a string' })
  @IsNotEmpty({ message: 'Model cannot be empty' })
  model: string;

  @IsOptional()
  @IsString({ message: 'Trim level must be a string' })
  trimLevel?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Manufacture year must be a number' })
  manufactureYear?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Registration year must be a number' })
  registrationYear?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Mileage must be a number' })
  @Min(0, { message: 'Mileage cannot be negative' })
  mileage?: number;

  @IsEnum(FuelType, { message: 'Fuel type must be a valid enum value' })
  fuelType: FuelType;

  @IsEnum(Transmission, { message: 'Transmission must be a valid enum value' })
  transmission: Transmission;

  @IsEnum(VehicleCondition, { message: 'Condition must be a valid enum value' })
  condition: VehicleCondition;

  @IsOptional()
  @IsString({ message: 'Color must be a string' })
  color?: string;

  @IsOptional()
  @IsEnum(InteriorType, { message: 'Interior type must be a valid enum value' })
  interiorType?: InteriorType;

  @IsOptional()
  @IsEnum(VehicleOrigin, {
    message: 'Vehicle origin must be a valid enum value',
  })
  vehicleOrigin?: VehicleOrigin;

  @IsEnum(CustomsStatus, {
    message: 'Customs status must be a valid enum value',
  })
  customsStatus: CustomsStatus;

  @IsOptional()
  @IsBoolean({ message: 'Service history must be a boolean' })
  serviceHistory?: boolean;

  @IsOptional()
  @IsString({ message: 'Reason for selling must be a string' })
  reasonForSelling?: string;

  @IsOptional()
  @IsArray({ message: 'Features must be an array' })
  features: any[] = [];
}

export class CreateCarListingDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  @IsEnum(Currency, { message: 'Currency must be a valid enum value' })
  @IsOptional()
  currency?: Currency;

  @IsEnum(ListingStatus, { message: 'Status must be a valid enum value' })
  @IsOptional()
  status?: ListingStatus;

  @IsOptional()
  @IsString({ message: 'Province must be a string' })
  province?: string;

  @IsOptional()
  @IsString({ message: 'Municipality must be a string' })
  municipality?: string;

  @IsOptional()
  @IsString({ message: 'Neighborhood must be a string' })
  neighborhood?: string;

  @IsArray({ message: 'Images must be an array' })
  images: any[];

  @IsOptional()
  @IsString({ message: 'Video URL must be a string' })
  videoUrl?: string;

  @IsString({ message: 'User ID must be a string' })
  @IsNotEmpty({ message: 'User ID cannot be empty' })
  userId: string;

  @ValidateNested()
  @Type(() => CarDetailsDto)
  carDetails: CarDetailsDto;
}
