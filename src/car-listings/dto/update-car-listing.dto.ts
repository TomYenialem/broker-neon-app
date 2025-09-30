import { PartialType } from '@nestjs/mapped-types';
import { CreateCarListingDto } from './create-car-listing.dto';

export class UpdateCarListingDto extends PartialType(CreateCarListingDto) {}
