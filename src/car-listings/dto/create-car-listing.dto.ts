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
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Car manufacturer',
    example: 'Toyota',
    type: String,
  })
  @IsString({ message: 'Make must be a string' })
  @IsNotEmpty({ message: 'Make cannot be empty' })
  make: string;

  @ApiProperty({
    description: 'Car model',
    example: 'Land Cruiser Prado',
    type: String,
  })
  @IsString({ message: 'Model must be a string' })
  @IsNotEmpty({ message: 'Model cannot be empty' })
  model: string;

  @ApiPropertyOptional({
    description: 'Trim level or version',
    example: 'VX',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Trim level must be a string' })
  trimLevel?: string;

  @ApiPropertyOptional({
    description: 'Year of manufacture',
    example: 2018,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Manufacture year must be a number' })
  manufactureYear?: number;

  @ApiPropertyOptional({
    description: 'Year of registration in Angola',
    example: 2019,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Registration year must be a number' })
  registrationYear?: number;

  @ApiPropertyOptional({
    description: 'Distance travelled in kilometers',
    example: 45000,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Mileage must be a number' })
  @Min(0, { message: 'Mileage cannot be negative' })
  mileage?: number;

  @ApiProperty({
    description: 'Type of fuel',
    enum: FuelType,
    example: FuelType.DIESEL,
  })
  @IsEnum(FuelType, { message: 'Fuel type must be a valid enum value' })
  fuelType: FuelType;

  @ApiProperty({
    description: 'Transmission type',
    enum: Transmission,
    example: Transmission.AUTOMATIC,
  })
  @IsEnum(Transmission, { message: 'Transmission must be a valid enum value' })
  transmission: Transmission;

  @ApiProperty({
    description: 'Vehicle condition',
    enum: VehicleCondition,
    example: VehicleCondition.EXCELLENT,
  })
  @IsEnum(VehicleCondition, { message: 'Condition must be a valid enum value' })
  condition: VehicleCondition;

  @ApiPropertyOptional({
    description: 'Vehicle color',
    example: 'Branco Pérola',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Color must be a string' })
  color?: string;

  @ApiPropertyOptional({
    description: 'Interior material type',
    enum: InteriorType,
    example: InteriorType.LEATHER,
  })
  @IsOptional()
  @IsEnum(InteriorType, { message: 'Interior type must be a valid enum value' })
  interiorType?: InteriorType;

  @ApiPropertyOptional({
    description: 'Country/region where vehicle was imported from',
    enum: VehicleOrigin,
    example: VehicleOrigin.EUROPE,
  })
  @IsOptional()
  @IsEnum(VehicleOrigin, {
    message: 'Vehicle origin must be a valid enum value',
  })
  vehicleOrigin?: VehicleOrigin;

  @ApiProperty({
    description: 'Customs clearance status (critical in Angola)',
    enum: CustomsStatus,
    example: CustomsStatus.LEGALIZED,
  })
  @IsEnum(CustomsStatus, {
    message: 'Customs status must be a valid enum value',
  })
  customsStatus: CustomsStatus;

  @ApiPropertyOptional({
    description: 'Whether service history is available',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'Service history must be a boolean' })
  serviceHistory?: boolean;

  @ApiPropertyOptional({
    description: 'Reason for selling the vehicle',
    example: 'Upgrading to newer model',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Reason for selling must be a string' })
  reasonForSelling?: string;

  @ApiProperty({
    description: 'Vehicle features and extras',
    example: [
      '4x4',
      'Air Conditioning',
      'Cruise Control',
      'Sunroof',
      'Parking Sensors',
    ],
    type: [String],
  })
  @IsArray({ message: 'Features must be an array' })
  features: any[];

  @ApiPropertyOptional({
    description: 'Additional information',
    example: 'Single owner. All service at official dealer.',
    type: String,
  })
  @IsOptional()
  @IsString()
  additionalInformation?: string;

  @ApiPropertyOptional({
    description: 'Custom features',
    example: {
      warranty: '2 years',
      tires: 'New Michelin',
      soundSystem: 'Bose',
    },
  })
  @IsOptional()
  customFeatures?: any;
}

export class CreateCarListingDto {
  @ApiProperty({
    description: 'Listing title (include key specs)',
    example: 'Toyota Land Cruiser Prado 2018, Diesel, Automático',
    type: String,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the vehicle',
    example:
      'Excelente condição, importado da Europa. Totalmente legalizado com todos os documentos em ordem.',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'Price of the vehicle',
    example: 25000000,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null ? undefined : value,
  )
  @Type(() => Number)
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price?: number;

  @ApiPropertyOptional({
    description:
      'Price as free text (e.g., "Sob consulta" or "Contact for price")',
    example: 'Sob consulta',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null ? undefined : String(value).trim(),
  )
  @IsString({ message: 'Price text must be a string' })
  priceText?: string;

  @ApiPropertyOptional({
    description: 'Currency (Kwanzas or USD)',
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
    description: 'Province location',
    example: 'Luanda',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Province must be a string' })
  province?: string;

  @ApiPropertyOptional({
    description: 'Municipality location',
    example: 'Talatona',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Municipality must be a string' })
  municipality?: string;

  @ApiPropertyOptional({
    description: 'Neighborhood or area',
    example: 'Talatona Gardens',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Neighborhood must be a string' })
  neighborhood?: string;

  @ApiProperty({
    description: 'Array of image URLs',
    example: [
      'https://example.com/car1.jpg',
      'https://example.com/car2.jpg',
      'https://example.com/car3.jpg',
    ],
    type: [String],
  })
  @IsArray({ message: 'Images must be an array' })
  images: any[];

  @ApiPropertyOptional({
    description: 'Video URL for car walkthrough',
    example: 'https://example.com/car-video.mp4',
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
    description: 'Car-specific details',
    type: CarDetailsDto,
  })
  @ValidateNested()
  @Type(() => CarDetailsDto)
  carDetails: CarDetailsDto;
}
