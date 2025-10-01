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
  ListingStatus,
  LandPurpose,
  AreaUnit,
  Topography,
  DocumentType,
  SoilType,
  ZoningType,
  UtilityAccess,
  ListingCategory,
} from '@prisma/client';

/* ---------------- LAND DETAILS ----------------- */
export class LandDetailsDto {
  @IsNumber({}, { message: 'Total area must be a number' })
  @Min(0, { message: 'Total area cannot be negative' })
  totalArea: number;

  @IsEnum(AreaUnit, { message: 'Area unit must be a valid enum value' })
  areaUnit: AreaUnit;

  @IsOptional()
  @IsEnum(Topography, { message: 'Topography must be a valid enum value' })
  topography?: Topography;

  @IsOptional()
  @IsNumber({}, { message: 'Distance from main road must be a number' })
  @Min(0, { message: 'Distance cannot be negative' })
  distanceFromMainRoad?: number;

  @IsOptional()
  @IsBoolean({ message: 'isDemarcated must be a boolean' })
  isDemarcated?: boolean;

  @IsOptional()
  @IsEnum(DocumentType, { message: 'Document type must be a valid enum value' })
  documentType?: DocumentType;

  @IsEnum(LandPurpose, { message: 'Land purpose must be a valid enum value' })
  landPurpose: LandPurpose;

  /* ---------- Agricultural Fields ---------- */
  @IsOptional()
  @IsString({ message: 'Water source must be a string' })
  waterSource?: string;

  @IsOptional()
  @IsBoolean({ message: 'Has irrigation system must be a boolean' })
  hasIrrigationSystem?: boolean;

  @IsOptional()
  @IsEnum(SoilType, { message: 'Soil type must be a valid enum value' })
  soilType?: SoilType;

  @IsOptional()
  @IsBoolean({ message: 'Soil tested must be a boolean' })
  soilTested?: boolean;

  @IsOptional()
  @IsString({ message: 'Previous use must be a string' })
  previousUse?: string;

  @IsOptional()
  @IsString({ message: 'Agricultural support must be a string' })
  agriculturalSupport?: string;

  @IsOptional()
  @IsString({ message: 'Climate info must be a string' })
  climateInfo?: string;

  /* ---------- Residential / Commercial ---------- */
  @IsOptional()
  @IsEnum(ZoningType, { message: 'Zoning type must be a valid enum value' })
  zoningType?: ZoningType;

  @IsOptional()
  @IsEnum(UtilityAccess, {
    message: 'Electricity access must be a valid enum value',
  })
  electricityAccess?: UtilityAccess;

  @IsOptional()
  @IsEnum(UtilityAccess, { message: 'Water access must be a valid enum value' })
  waterAccess?: UtilityAccess;

  @IsOptional()
  @IsEnum(UtilityAccess, {
    message: 'Sanitation access must be a valid enum value',
  })
  sanitationAccess?: UtilityAccess;

  @IsOptional()
  @IsString({ message: 'Security info must be a string' })
  securityInfo?: string;
}

/* ---------------- LISTING DTO ----------------- */
export class CreateLandListingDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  @IsOptional()
  @IsEnum(Currency, { message: 'Currency must be a valid enum value' })
  currency?: Currency;

  @IsOptional()
  @IsEnum(ListingStatus, { message: 'Status must be a valid enum value' })
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

  /* Always set category to LAND in service/controller */
  @IsOptional()
  @IsEnum(ListingCategory, { message: 'Category must be a valid enum value' })
  category?: ListingCategory;

  @ValidateNested()
  @Type(() => LandDetailsDto)
  landDetails: LandDetailsDto;
}
