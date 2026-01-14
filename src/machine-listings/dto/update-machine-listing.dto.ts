import { PartialType } from '@nestjs/mapped-types';
import { CreateMachineListingDto } from './create-machine-listing.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateMachineListingDto extends PartialType(
  CreateMachineListingDto,
) {
  @ApiPropertyOptional({
    description: 'Numeric price. Optional; must be non-negative when provided.',
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
    description: 'Text-based price alternative.',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null ? undefined : String(value).trim(),
  )
  @IsString()
  priceText?: string;
}
