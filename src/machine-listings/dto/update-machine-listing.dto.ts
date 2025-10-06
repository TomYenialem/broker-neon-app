import { PartialType } from '@nestjs/mapped-types';
import { CreateMachineListingDto } from './create-machine-listing.dto';

export class UpdateMachineListingDto extends PartialType(CreateMachineListingDto) {}


