import { IsOptional, IsString, IsNumber, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Currency, ListingStatus, MachineCondition } from '@prisma/client';

export class MachineListingFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  municipality?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';

  @IsOptional()
  @IsString()
  machineType?: string;

  @IsOptional()
  @IsEnum(MachineCondition)
  condition?: MachineCondition;
}


