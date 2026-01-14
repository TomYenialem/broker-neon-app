import { PartialType } from '@nestjs/mapped-types';
import { CreateHouseListingDto } from './create-house-listing.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateHouseListingDto extends PartialType(CreateHouseListingDto) {
  @ApiPropertyOptional({
    description:
      'Numeric price. Optional on update; if provided, must be non-negative.',
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
    description: 'Text price. Optional on update; can be set to null to clear.',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null ? undefined : String(value).trim(),
  )
  @IsString()
  priceText?: string;
}
