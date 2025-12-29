import { PartialType } from '@nestjs/mapped-types';
import { CreateLandListingDto } from './create-land-listing.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateLandListingDto extends PartialType(CreateLandListingDto) {
	@ApiPropertyOptional({
		description: 'Numeric price. Optional; ignored when empty string is provided.',
		type: Number,
	})
	@IsOptional()
	@Transform(({ value }) => (value === '' || value === null ? undefined : value))
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	price?: number;

	@ApiPropertyOptional({
		description: 'Textual price representation.',
		type: String,
	})
	@IsOptional()
	@Transform(({ value }) => (value === '' || value === null ? undefined : String(value).trim()))
	@IsString()
	priceText?: string;
}
