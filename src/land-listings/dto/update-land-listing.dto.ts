import { PartialType } from '@nestjs/mapped-types';
import { CreateLandListingDto } from './create-land-listing.dto';

export class UpdateLandListingDto extends PartialType(CreateLandListingDto) {}
