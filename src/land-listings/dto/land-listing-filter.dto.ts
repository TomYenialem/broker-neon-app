import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ListingStatus, Currency, ListingCategory } from '@prisma/client';

export class LandListingFilterDto {
  /**
   * Listing category is fixed as LAND
   * (optional in DTO but will usually be forced as LAND in your service/controller)
   */
  @IsOptional()
  @IsEnum(ListingCategory)
  category?: ListingCategory = ListingCategory.LAND;

  /**
   * Filter by active/pending/sold
   * Uses index: idx_listing_cat_status_createdAt
   */
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  /**
   * Location filters
   * Uses index: idx_listing_location
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  municipality?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  neighborhood?: string;

  /**
   * Price filters
   * Uses index: idx_listing_cat_price and idx_listing_price
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @IsOptional()
  @IsString()
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';

  /**
   * Pagination
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}
