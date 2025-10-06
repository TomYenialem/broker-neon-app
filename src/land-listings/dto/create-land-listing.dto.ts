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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
} from '@prisma/client';

export class LandDetailsDto {
  @ApiProperty({
    description: 'Total area of the land',
    example: 50000,
    type: Number,
  })
  @IsNumber({}, { message: 'Total area must be a number' })
  @Min(0, { message: 'Total area cannot be negative' })
  totalArea: number;

  @ApiProperty({
    description: 'Unit of area measurement',
    enum: AreaUnit,
    default: AreaUnit.SQUARE_METERS,
    example: AreaUnit.SQUARE_METERS,
  })
  @IsEnum(AreaUnit, { message: 'Area unit must be a valid enum value' })
  areaUnit: AreaUnit;

  @ApiPropertyOptional({
    description: 'Topography of the land',
    enum: Topography,
    example: Topography.FLAT,
  })
  @IsOptional()
  @IsEnum(Topography, { message: 'Topography must be a valid enum value' })
  topography?: Topography;

  @ApiPropertyOptional({
    description: 'Distance from main road in meters',
    example: 500,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Distance from main road must be a number' })
  @Min(0, { message: 'Distance cannot be negative' })
  distanceFromMainRoad?: number;

  @ApiPropertyOptional({
    description: 'Whether the land boundaries are clearly marked',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'isDemarcated must be a boolean' })
  isDemarcated?: boolean;

  @ApiPropertyOptional({
    description: 'Type of legal document (critical in Angola)',
    enum: DocumentType,
    example: DocumentType.TITLE_DEED,
  })
  @IsOptional()
  @IsEnum(DocumentType, { message: 'Document type must be a valid enum value' })
  documentType?: DocumentType;

  @ApiProperty({
    description: 'Primary purpose of the land',
    enum: LandPurpose,
    example: LandPurpose.AGRICULTURAL,
  })
  @IsEnum(LandPurpose, { message: 'Land purpose must be a valid enum value' })
  landPurpose: LandPurpose;

  /* ---------- Agricultural Fields ---------- */
  @ApiPropertyOptional({
    description: 'Description of water source and distance',
    example: 'Rio nearby (200m), poço artesiano no terreno',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Water source must be a string' })
  waterSource?: string;

  @ApiPropertyOptional({
    description: 'Whether irrigation system exists',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'Has irrigation system must be a boolean' })
  hasIrrigationSystem?: boolean;

  @ApiPropertyOptional({
    description: 'Type of soil',
    enum: SoilType,
    example: SoilType.LOAMY,
  })
  @IsOptional()
  @IsEnum(SoilType, { message: 'Soil type must be a valid enum value' })
  soilType?: SoilType;

  @ApiPropertyOptional({
    description: 'Whether soil has been tested',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'Soil tested must be a boolean' })
  soilTested?: boolean;

  @ApiPropertyOptional({
    description: 'What was previously grown/cultivated',
    example: 'Coffee plantation',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Previous use must be a string' })
  previousUse?: string;

  @ApiPropertyOptional({
    description: 'Available agricultural support and resources',
    example: 'Cooperative nearby, MINAGRI extension office',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Agricultural support must be a string' })
  agriculturalSupport?: string;

  @ApiPropertyOptional({
    description: 'Climate and rainfall information',
    example: 'High rainfall season Oct-April, avg 1200mm/year',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Climate info must be a string' })
  climateInfo?: string;

  /* ---------- Residential / Commercial ---------- */
  @ApiPropertyOptional({
    description: 'Zoning type for construction',
    enum: ZoningType,
    example: ZoningType.RESIDENTIAL,
  })
  @IsOptional()
  @IsEnum(ZoningType, { message: 'Zoning type must be a valid enum value' })
  zoningType?: ZoningType;

  @ApiPropertyOptional({
    description: 'Electricity access status',
    enum: UtilityAccess,
    example: UtilityAccess.NEARBY,
  })
  @IsOptional()
  @IsEnum(UtilityAccess, {
    message: 'Electricity access must be a valid enum value',
  })
  electricityAccess?: UtilityAccess;

  @ApiPropertyOptional({
    description: 'Water access status',
    enum: UtilityAccess,
    example: UtilityAccess.CONNECTED,
  })
  @IsOptional()
  @IsEnum(UtilityAccess, { message: 'Water access must be a valid enum value' })
  waterAccess?: UtilityAccess;

  @ApiPropertyOptional({
    description: 'Sanitation access status',
    enum: UtilityAccess,
    example: UtilityAccess.CONNECTED,
  })
  @IsOptional()
  @IsEnum(UtilityAccess, {
    message: 'Sanitation access must be a valid enum value',
  })
  sanitationAccess?: UtilityAccess;

  @ApiPropertyOptional({
    description: 'Security information about the area',
    example: 'Condomínio fechado com segurança 24h',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Security info must be a string' })
  securityInfo?: string;
}

export class CreateLandListingDto {
  @ApiProperty({
    description: 'Listing title',
    example: 'Terreno de 5 Hectares para Agricultura, Benguela',
    type: String,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description',
    example:
      'Terreno plano com acesso à água, ideal para cultivo de café ou milho',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'Price',
    example: 5000000,
    type: Number,
  })
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  @ApiPropertyOptional({
    description: 'Currency',
    enum: Currency,
    default: Currency.AOA,
    example: Currency.AOA,
  })
  @IsOptional()
  @IsEnum(Currency, { message: 'Currency must be a valid enum value' })
  currency?: Currency;

  @ApiPropertyOptional({
    description: 'Listing status',
    enum: ListingStatus,
    default: ListingStatus.ACTIVE,
    example: ListingStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ListingStatus, { message: 'Status must be a valid enum value' })
  status?: ListingStatus;

  @ApiPropertyOptional({
    description: 'Province',
    example: 'Benguela',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Province must be a string' })
  province?: string;

  @ApiPropertyOptional({
    description: 'Municipality',
    example: 'Lobito',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Municipality must be a string' })
  municipality?: string;

  @ApiPropertyOptional({
    description: 'Neighborhood',
    example: 'Caponte',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Neighborhood must be a string' })
  neighborhood?: string;

  @ApiProperty({
    description: 'Array of image URLs',
    example: ['https://example.com/land1.jpg', 'https://example.com/land2.jpg'],
    type: [String],
  })
  @IsArray({ message: 'Images must be an array' })
  images: any[];

  @ApiPropertyOptional({
    description: 'Video walkthrough URL',
    example: 'https://example.com/land-video.mp4',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Video URL must be a string' })
  videoUrl?: string;

  @ApiPropertyOptional({
    description: 'User ID (optional - owner of the listing)',
    example: 'clxxx-xxxx-xxxx-xxxx-xxxxxxxxxx',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'User ID must be a string' })
  userId?: string;

  @ApiProperty({
    description: 'Land-specific details',
    type: LandDetailsDto,
  })
  @ValidateNested()
  @Type(() => LandDetailsDto)
  landDetails: LandDetailsDto;
}
