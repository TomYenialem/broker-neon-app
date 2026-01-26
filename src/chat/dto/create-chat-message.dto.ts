import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  IsNumber,
  Min,
  IsEnum,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ListingStatus, ListingCategory } from '@prisma/client';

export class ListingFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  province?: string;

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
  @IsOptional()
  @IsEnum(ListingCategory)
  category?: ListingCategory;

  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class CreateChatMessageDto {
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsString()
  @IsNotEmpty()
  userMessage!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ListingFilterDto)
  filters?: ListingFilterDto;
}
