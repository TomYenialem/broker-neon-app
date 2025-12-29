import { PartialType } from '@nestjs/mapped-types';
import { CreateCarListingDto } from './create-car-listing.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateCarListingDto extends PartialType(CreateCarListingDto) {
  @ApiPropertyOptional({
    description:
      'Numeric price. Optional on update; empty strings are ignored and values must be non-negative.',
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null ? undefined : value,
  )
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description:
      'Text price. Optional on update; empty strings clear the value.',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null ? undefined : String(value).trim(),
  )
  @IsString()
  priceText?: string;
}
