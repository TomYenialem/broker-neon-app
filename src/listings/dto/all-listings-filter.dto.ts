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
import { Currency, ListingStatus, ListingCategory } from '@prisma/client';

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
}
