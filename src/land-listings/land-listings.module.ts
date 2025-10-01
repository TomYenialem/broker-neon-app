import { Module } from '@nestjs/common';
import { LandListingsService } from './land-listings.service';
import { LandListingsController } from './land-listings.controller';

@Module({
  controllers: [LandListingsController],
  providers: [LandListingsService],
})
export class LandListingsModule {}
