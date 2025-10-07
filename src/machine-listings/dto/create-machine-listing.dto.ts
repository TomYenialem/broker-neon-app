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
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Currency,
  ListingStatus,
  MachineCondition,
  SparePartsAvailability,
} from '@prisma/client';

export class MachineDetailsDto {
  @ApiProperty({
    description: 'Type of machine/equipment',
    example: 'Excavator',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  machineType: string;

  @ApiPropertyOptional({
    description: 'Model number',
    example: '320D',
    type: String,
  })
  @IsOptional()
  @IsString()
  modelNumber?: string;

  @ApiProperty({
    description: 'Machine condition',
    enum: MachineCondition,
    example: MachineCondition.USED,
  })
  @IsEnum(MachineCondition)
  condition: MachineCondition;

  @ApiPropertyOptional({
    description: 'Year of manufacture',
    example: 2015,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1900)
  manufactureYear?: number;

  @ApiPropertyOptional({
    description: 'Hours of use (equivalent to mileage for vehicles)',
    example: 8500,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hoursOfUse?: number;

  @ApiPropertyOptional({
    description: 'Working capacity description',
    example: 'Digging depth: 6.5m, Reach: 10m, Bucket capacity: 1.2m³',
    type: String,
  })
  @IsOptional()
  @IsString()
  workingCapacity?: string;

  @ApiPropertyOptional({
    description: 'Technical specifications',
    example: 'Operating weight: 22,000 kg, Engine: Cat C6.6, Power: 122 HP',
    type: String,
  })
  @IsOptional()
  @IsString()
  specifications?: string;

  @ApiPropertyOptional({
    description: 'Whether service history is available',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  serviceHistory?: boolean;

  @ApiPropertyOptional({
    description: 'Reason for selling',
    example: 'Construction project completed, upgrading fleet',
    type: String,
  })
  @IsOptional()
  @IsString()
  reasonForSale?: string;

  @ApiPropertyOptional({
    description: 'Availability of spare parts in Angola',
    enum: SparePartsAvailability,
    example: SparePartsAvailability.EASILY_AVAILABLE,
  })
  @IsOptional()
  @IsEnum(SparePartsAvailability)
  sparePartsAvailability?: SparePartsAvailability;

  @ApiPropertyOptional({
    description: 'Current location where machine can be inspected',
    example: 'Viana Industrial Zone, can arrange viewing',
    type: String,
  })
  @IsOptional()
  @IsString()
  currentLocation?: string;

  @ApiPropertyOptional({
    description: 'Additional information',
    example: 'Comes with spare parts. Training included.',
    type: String,
  })
  @IsOptional()
  @IsString()
  additionalInformation?: string;

  @ApiPropertyOptional({
    description: 'Custom features',
    example: { warranty: '6 months', delivery: 'Free' },
  })
  @IsOptional()
  customFeatures?: any;
}

export class CreateMachineListingDto {
  @ApiProperty({
    description: 'Listing title',
    example: 'Caterpillar 320D Excavator 2015',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description',
    example:
      'Well maintained excavator, ready to work. Full service history available.',
    type: String,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Price',
    example: 45000,
    type: Number,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Currency',
    enum: Currency,
    default: Currency.USD,
    example: Currency.USD,
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
    example: 'Viana',
    type: String,
  })
  @IsOptional()
  @IsString()
  municipality?: string;

  @ApiPropertyOptional({
    description: 'Neighborhood',
    example: 'Zona Industrial',
    type: String,
  })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiProperty({
    description: 'Array of image URLs',
    example: [
      'https://example.com/machine1.jpg',
      'https://example.com/machine2.jpg',
      'https://example.com/machine3.jpg',
    ],
    type: [String],
  })
  @IsArray()
  images: any[];

  @ApiPropertyOptional({
    description: 'Video URL',
    example: 'https://example.com/machine-video.mp4',
    type: String,
  })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({
    description: 'User ID (optional - owner of the listing)',
    example: 'clxxx-xxxx-xxxx-xxxx-xxxxxxxxxx',
    type: String,
  })
  @IsOptional()
  @IsString()
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
    description: 'Machine-specific details',
    type: MachineDetailsDto,
  })
  @ValidateNested()
  @Type(() => MachineDetailsDto)
  machineDetails: MachineDetailsDto;
}
