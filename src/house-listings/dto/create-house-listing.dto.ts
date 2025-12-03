import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsNotEmpty,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Currency,
  ListingStatus,
  HouseType,
  ConstructionQuality,
  WaterSource,
} from '@prisma/client';

export class HouseDetailsDto {
  @ApiProperty({
    description: 'Type of house',
    enum: HouseType,
    example: HouseType.DETACHED,
  })
  @IsEnum(HouseType)
  houseType: HouseType;

  @ApiPropertyOptional({
    description: 'Plot/land size in square meters',
    example: 600,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  plotSize?: number;

  @ApiPropertyOptional({
    description: 'Living area in square meters',
    example: 350,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  livingArea?: number;

  @ApiProperty({
    description: 'Number of bedrooms',
    example: 4,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiProperty({
    description: 'Number of bathrooms',
    example: 3,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @ApiProperty({
    description: 'Construction quality/condition',
    enum: ConstructionQuality,
    example: ConstructionQuality.NEW_CONSTRUCTION,
  })
  @IsEnum(ConstructionQuality)
  constructionQuality: ConstructionQuality;

  @ApiPropertyOptional({
    description: 'Water source type',
    enum: WaterSource,
    example: WaterSource.PUBLIC_NETWORK,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return typeof value === 'string' ? value.toUpperCase() : value;
  })
  @IsEnum(WaterSource)
  waterSource?: WaterSource;

  @ApiPropertyOptional({
    description: 'Whether house has water tank',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  hasWaterTank?: boolean;

  @ApiPropertyOptional({
    description: 'Whether house has generator (critical in Angola)',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  hasGenerator?: boolean;

  @ApiPropertyOptional({
    description: 'Whether house has inverter system',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  hasInverter?: boolean;

  @ApiProperty({
    description: 'Security features',
    example: [
      'Electric fence',
      'CCTV cameras',
      'Security guard 24/7',
      'Alarm system',
    ],
    type: [String],
  })
  @IsArray()
  securityFeatures: any[];

  @ApiProperty({
    description: 'Interior features and amenities',
    example: [
      'Fully equipped kitchen',
      'Air conditioning in all rooms',
      'Built-in wardrobes',
      'Marble flooring',
    ],
    type: [String],
  })
  @IsArray()
  interiorFeatures: any[];

  @ApiProperty({
    description: 'Exterior features',
    example: [
      'Swimming pool',
      'Garden',
      'Garage for 2 cars',
      'Outdoor dining area',
    ],
    type: [String],
  })
  @IsArray()
  exteriorFeatures: any[];

  @ApiPropertyOptional({
    description: 'Distance to city center in kilometers',
    example: 15,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  distanceToCityCenter?: number;

  @ApiPropertyOptional({
    description: 'Distance to schools in kilometers',
    example: 2,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  distanceToSchools?: number;

  @ApiPropertyOptional({
    description: 'Distance to hospitals in kilometers',
    example: 5,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  distanceToHospitals?: number;

  @ApiPropertyOptional({
    description: 'Distance to supermarkets in kilometers',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  distanceToSupermarkets?: number;

  @ApiPropertyOptional({
    description: 'Additional information about the property',
    example: 'Property has approved building plans. Borehole drilled in 2024.',
    type: String,
  })
  @IsOptional()
  @IsString()
  additionalInformation?: string;

  @ApiPropertyOptional({
    description: 'Custom features as key-value pairs',
    example: {
      smartHome: true,
      solarPanels: '10kW',
      waterFiltration: 'Whole house',
    },
  })
  @IsOptional()
  customFeatures?: any;
}

export class CreateHouseListingDto {
  @ApiProperty({
    description: 'Listing title',
    example: 'Moradia T4 com Piscina, Talatona',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description',
    example: 'Casa moderna com todas as comodidades, acabamentos de luxo',
    type: String,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Price',
    example: 85000000,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description:
      'Price as free text (e.g., "Negotiable" or "Contact for price")',
    example: 'Sob consulta',
    type: String,
  })
  @IsOptional()
  @IsString()
  priceText?: string;

  @ApiPropertyOptional({
    description: 'Currency',
    enum: Currency,
    default: Currency.AOA,
    example: Currency.AOA,
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional({
    description: 'Listing status',
    enum: ListingStatus,
    default: ListingStatus.ACTIVE,
    example: ListingStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @ApiPropertyOptional({
    description: 'Province',
    example: 'Luanda',
    type: String,
  })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({
    description: 'Municipality',
    example: 'Talatona',
    type: String,
  })
  @IsOptional()
  @IsString()
  municipality?: string;

  @ApiPropertyOptional({
    description: 'Neighborhood',
    example: 'Talatona Gardens',
    type: String,
  })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiProperty({
    description: 'Array of image URLs',
    example: [
      'https://example.com/house1.jpg',
      'https://example.com/house2.jpg',
      'https://example.com/house3.jpg',
    ],
    type: [String],
  })
  @IsArray()
  images: any[];

  @ApiPropertyOptional({
    description: 'User ID (optional - owner of the listing)',
    example: 'clxxx-xxxx-xxxx-xxxx-xxxxxxxxxx',
    type: String,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Array of video URLs',
    example: [
      'https://example.com/house-tour.mp4',
      'https://example.com/house-walkthrough.mp4',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  videos?: any[];

  @ApiPropertyOptional({
    description: 'Mark as featured listing',
    example: false,
    default: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({
    description: 'House-specific details',
    type: HouseDetailsDto,
  })
  @ValidateNested()
  @Type(() => HouseDetailsDto)
  houseDetails: HouseDetailsDto;
}
